"""
Turns the account id in a webhook envelope into everything needed to answer:
whose account it is, which token to use, and which policy applies.

The account id must come from `entry[].id` and nowhere else. A vendor
identifier read from webhook *content* would be attacker-controlled -- anyone
able to POST to the endpoint could name another tenant and have replies sent
with that tenant's token. Callers pass the envelope value; this module never
looks at payload bodies.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

from sqlalchemy.exc import IntegrityError

from config import INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_HANDOFF_WA_NUMBER
from models.connection import InstagramConnection
from services.policy import InstagramPolicy, default_policy, resolve_policy
from services.token_cipher import TokenCipherError, instagram_token_cipher

logger = logging.getLogger("uvicorn")


@dataclass(frozen=True)
class ResolvedConnection:
    """One webhook's routing result."""

    instagram_account_id: str
    business_phone_number: str
    access_token: str
    policy: InstagramPolicy
    connection_id: str | None = None
    instagram_username: str | None = None
    #: True when no connection row existed and the global token was used.
    is_fallback: bool = False


class TenantResolver:
    def get_by_account_id(self, db, instagram_account_id: str) -> InstagramConnection | None:
        if not instagram_account_id:
            return None
        return (
            db.query(InstagramConnection)
            .filter(InstagramConnection.InstagramAccountId == str(instagram_account_id))
            .first()
        )

    def list_connections(self, db, status: str | None = None) -> list[InstagramConnection]:
        query = db.query(InstagramConnection)
        if status:
            query = query.filter(InstagramConnection.Status == status)
        return query.order_by(InstagramConnection.CreatedAt.desc()).all()

    def get_access_token(self, db, instagram_account_id: str) -> str | None:
        """Decrypt one account's token, or fall back to the global one."""
        connection = self.get_by_account_id(db, instagram_account_id)
        if connection is None or connection.Status != "active":
            return INSTAGRAM_ACCESS_TOKEN or None
        try:
            return instagram_token_cipher.decrypt(connection.AccessTokenEncrypted)
        except TokenCipherError as e:
            logger.error(
                "Could not decrypt the token for %s: %s", instagram_account_id, e
            )
            return None

    def resolve(self, db, instagram_account_id: str) -> ResolvedConnection | None:
        """Resolve an account id to its owning business and credentials.

        Returns None when the account is unknown and no global token exists --
        the event is then unroutable and the caller drops it.
        """
        account_id = str(instagram_account_id or "").strip()
        if not account_id:
            return None

        connection = self.get_by_account_id(db, account_id)

        if connection is None:
            # Keeps a single-account install working before any vendor has
            # onboarded through OAuth.
            if not INSTAGRAM_ACCESS_TOKEN:
                return None
            return ResolvedConnection(
                instagram_account_id=account_id,
                business_phone_number=INSTAGRAM_HANDOFF_WA_NUMBER,
                access_token=INSTAGRAM_ACCESS_TOKEN,
                policy=default_policy(),
                is_fallback=True,
            )

        if connection.Status != "active":
            logger.info(
                "Instagram account %s is %s; ignoring its events",
                account_id, connection.Status,
            )
            return None

        try:
            token = instagram_token_cipher.decrypt(connection.AccessTokenEncrypted)
        except TokenCipherError as e:
            logger.error("Could not decrypt the token for %s: %s", account_id, e)
            return None

        return ResolvedConnection(
            instagram_account_id=account_id,
            business_phone_number=str(connection.BusinessPhoneNumber or ""),
            access_token=token,
            policy=resolve_policy(connection),
            connection_id=str(connection.Id),
            instagram_username=connection.InstagramUsername,
        )

    def connect(
        self, db, *, instagram_account_id: str, business_phone_number: str,
        access_token: str, instagram_username: str | None = None,
        token_expires_at: float | None = None, scopes: str | None = None,
        account_type: str | None = None, app_scoped_id: str | None = None,
        policy_json: str | None = None,
    ) -> InstagramConnection:
        """Create or update one account's connection, token encrypted at rest."""
        instagram_account_id = str(instagram_account_id or "").strip()
        business_phone_number = str(business_phone_number or "").strip()
        if not instagram_account_id:
            raise ValueError("instagram_account_id must not be empty")
        if not business_phone_number:
            raise ValueError("business_phone_number must not be empty")

        encrypted = instagram_token_cipher.encrypt(access_token)
        connection = self.get_by_account_id(db, instagram_account_id)

        if connection is None:
            connection = InstagramConnection(
                InstagramAccountId=str(instagram_account_id),
                BusinessPhoneNumber=str(business_phone_number),
                AccessTokenEncrypted=encrypted,
                InstagramUsername=instagram_username,
                Status="active",
                TokenExpiresAt=token_expires_at,
                Scopes=scopes,
                AccountType=account_type,
                AppScopedId=app_scoped_id,
                PolicyJson=policy_json,
            )
            db.add(connection)
        else:
            connection.BusinessPhoneNumber = str(business_phone_number)
            connection.AccessTokenEncrypted = encrypted
            connection.Status = "active"
            if instagram_username is not None:
                connection.InstagramUsername = instagram_username
            if token_expires_at is not None:
                connection.TokenExpiresAt = token_expires_at
            if scopes is not None:
                connection.Scopes = scopes
            if account_type is not None:
                connection.AccountType = account_type
            if app_scoped_id is not None:
                connection.AppScopedId = app_scoped_id
            if policy_json is not None:
                connection.PolicyJson = policy_json

        try:
            db.commit()
        except IntegrityError:
            db.rollback()
            raise
        db.refresh(connection)
        return connection

    def set_status(self, db, instagram_account_id: str, status: str) -> InstagramConnection | None:
        connection = self.get_by_account_id(db, instagram_account_id)
        if connection is None:
            return None
        connection.Status = status
        db.commit()
        db.refresh(connection)
        return connection

    def disconnect(self, db, instagram_account_id: str) -> bool:
        connection = self.get_by_account_id(db, instagram_account_id)
        if connection is None:
            return False
        db.delete(connection)
        db.commit()
        return True


tenant_resolver = TenantResolver()
