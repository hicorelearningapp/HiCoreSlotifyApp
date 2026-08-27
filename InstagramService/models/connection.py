"""
The four tables this service owns.

Column names and types match the ones the bot engine already writes, so an
existing appointments.db is picked up as-is and ig_connections.sql imports
without translation.
"""
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text

from db import Base, generate_uuid


class InstagramConnection(Base):
    """One professional account, and the business it hands off to.

    InstagramAccountId is the identity everything else keys on -- it is the
    only value Meta puts in the webhook envelope, and the only one that cannot
    be spoofed by payload content. BusinessPhoneNumber is data about the
    account, never a lookup key.
    """

    __tablename__ = "instagram_connections"

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    InstagramAccountId = Column(String(64), unique=True, nullable=False, index=True)
    BusinessPhoneNumber = Column(String(20), nullable=False, index=True)
    InstagramUsername = Column(String(150), nullable=True)
    AccessTokenEncrypted = Column(Text, nullable=False)
    Status = Column(String(20), nullable=False, default="active", index=True)
    # Per-account overrides on the default policy, as JSON.
    PolicyJson = Column(Text, nullable=True)
    # Unix timestamp. Long-lived tokens last ~60 days and must be refreshed
    # before expiry or the vendor re-authorizes from scratch.
    TokenExpiresAt = Column(Float, nullable=True, index=True)
    Scopes = Column(String(500), nullable=True)
    AccountType = Column(String(50), nullable=True)
    AppScopedId = Column(String(64), nullable=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class InstagramProcessedEvent(Base):
    """Duplicate-delivery and own-reply record.

    EventKey is prefixed by kind so an incoming comment and a reply this
    service itself created can never collide:

        event:{account_id}:{comment_id}   a delivery already handled
        own:{account_id}:{comment_id}     a comment this service created
    """

    __tablename__ = "instagram_processed_events"

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    EventKey = Column(String(255), unique=True, nullable=False, index=True)
    InstagramAccountId = Column(String(64), nullable=True, index=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow, index=True)


class InstagramOAuthState(Base):
    """Single-use CSRF state for the OAuth redirect.

    Only the SHA-256 digest is stored, so a leaked database cannot be used to
    forge a callback, and the row is deleted the moment it is consumed so a
    callback URL cannot be replayed.
    """

    __tablename__ = "instagram_oauth_states"

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    StateDigest = Column(String(64), unique=True, nullable=False, index=True)
    BusinessPhoneNumber = Column(String(20), nullable=False)
    CreatedAt = Column(DateTime, default=datetime.utcnow, index=True)


class InstagramReplyAction(Base):
    """One queued outbound reply.

    ActionId is `{account_id}:{comment_id}:{action_type}` and UNIQUE, so the
    same comment cannot enqueue the same reply twice even under concurrent
    delivery.
    """

    __tablename__ = "instagram_reply_actions"

    Id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    ActionId = Column(String(255), unique=True, nullable=False, index=True)
    InstagramAccountId = Column(String(64), nullable=False, index=True)
    CommentId = Column(String(64), nullable=False)
    ActionType = Column(String(20), nullable=False)  # public | private
    ReplyText = Column(Text, nullable=False)
    # queued | processing | retry | sent | failed
    Status = Column(String(20), nullable=False, default="queued", index=True)
    Attempts = Column(Integer, nullable=False, default=0)
    NextAttemptAt = Column(Float, nullable=True, index=True)
    LastError = Column(Text, nullable=True)
    MetaResultId = Column(String(64), nullable=True)
    CreatedAt = Column(DateTime, default=datetime.utcnow)
    UpdatedAt = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
