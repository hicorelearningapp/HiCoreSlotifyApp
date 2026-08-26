from datetime import datetime

from sqlalchemy import Column, String, Text, DateTime, Integer, Float

from backend_app.core.database import Base
from core.models.utils import generate_uuid


class InstagramConnection(Base):
    """Joins one Instagram professional account to one business.

    This is the tenancy key for Instagram. Meta identifies the account that
    received a comment in ``entry[].id``; that value is InstagramAccountId here,
    and it resolves to the BusinessPhoneNumber that the rest of the platform
    already uses as its tenant identifier (BusinessConfig, sessions, sequences).

    AccessTokenEncrypted holds a Fernet ciphertext, never a raw token. The
    SQLite file is tracked in git, so a plaintext token here would be published
    on the next commit.
    """

    __tablename__ = "instagram_connections"

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    InstagramAccountId = Column(String(64), unique=True, nullable=False, index=True)
    BusinessPhoneNumber = Column(String(20), nullable=False, index=True)
    InstagramUsername = Column(String(150), nullable=True)
    AccessTokenEncrypted = Column(Text, nullable=False)
    Status = Column(String(20), nullable=False, default="active", index=True)
    PolicyJson = Column(Text, nullable=True)
    # Unix timestamp. Instagram long-lived tokens last about 60 days and must be
    # refreshed before expiry, or the vendor has to authorize again from scratch.
    TokenExpiresAt = Column(Float, nullable=True, index=True)
    Scopes = Column(String(500), nullable=True)
    AccountType = Column(String(50), nullable=True)
    AppScopedId = Column(String(64), nullable=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class InstagramProcessedEvent(Base):
    """Durable duplicate-event and own-reply record.

    EventKey is prefixed by kind so an original comment and a reply we created
    can never collide:

        event:{account_id}:{comment_id}   a delivery we have already handled
        own:{account_id}:{comment_id}     a comment this service itself created
    """

    __tablename__ = "instagram_processed_events"

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    EventKey = Column(String(255), unique=True, nullable=False, index=True)
    InstagramAccountId = Column(String(64), nullable=True, index=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow, index=True)


class InstagramOAuthState(Base):
    """Single-use CSRF state for the Instagram OAuth redirect.

    Only the SHA-256 digest of the state is stored. A leaked database therefore
    cannot be used to forge a callback, and the row is deleted the moment it is
    consumed so a callback URL cannot be replayed.
    """

    __tablename__ = "instagram_oauth_states"

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    StateDigest = Column(String(64), unique=True, nullable=False, index=True)
    BusinessPhoneNumber = Column(String(20), nullable=False)
    ExpiresAt = Column(Float, nullable=False, index=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)


class InstagramReplyAction(Base):
    """One queued reply, retried with backoff until it succeeds or gives up.

    Replaces the inline send from Phase 1/2. A transient Meta failure (429, 5xx,
    a network blip) no longer loses the reply: the row stays pending and the
    worker tries again. ActionId is derived from the comment and action type, so
    the same comment can never enqueue the same reply twice.
    """

    __tablename__ = "instagram_reply_actions"

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    ActionId = Column(String(255), unique=True, nullable=False, index=True)
    InstagramAccountId = Column(String(64), nullable=False, index=True)
    CommentId = Column(String(64), nullable=False)
    ActionType = Column(String(20), nullable=False)  # public | private
    ReplyText = Column(Text, nullable=False)
    Status = Column(String(20), nullable=False, default="pending", index=True)
    Attempts = Column(Integer, nullable=False, default=0)
    NextAttemptAt = Column(Float, nullable=False, default=0.0, index=True)
    LastError = Column(Text, nullable=True)
    MetaResultId = Column(String(128), nullable=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow, index=True)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
