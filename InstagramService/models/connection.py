"""
The four tables this service owns, in its own database.

Nothing else writes them and this service reads nothing else, so the schema
is free to be exactly what the code needs rather than what the bot engine
happened to create.
"""
from datetime import datetime

from sqlalchemy import Column, DateTime, Float, Integer, String, Text

from db import Base, generate_uuid


class InstagramConnection(Base):
    """One vendor: a professional account and the credentials to answer for it.

    InstagramAccountId is the primary key rather than a surrogate uuid. It is
    the only value Meta puts in the webhook envelope, the only one that cannot
    be spoofed by payload content, and what every lookup in the service uses --
    a second unique id alongside it was one more thing to keep in step.

    Four columns do work. Two are labels: nothing reads them, they are how a
    human tells one row from another. The OAuth flow used to fill in Scopes,
    AccountType and AppScopedId from the profile call; that flow is gone, and
    so are they.
    """

    __tablename__ = "instagram_connections"

    InstagramAccountId = Column(String(64), primary_key=True, index=True)
    #: Fernet ciphertext. The key lives in .env and never in here.
    AccessTokenEncrypted = Column(Text, nullable=False)
    #: active | paused | revoked. Anything but active and resolve() returns
    #: None, which is the kill switch -- no redeploy, no token change.
    Status = Column(String(20), nullable=False, default="active", index=True)
    #: Unix timestamp. Long-lived tokens last ~60 days, and the refresh job
    #: skips rows where this is NULL -- so a missing value means that vendor
    #: goes dark two months later with nothing in the logs.
    TokenExpiresAt = Column(Float, nullable=True, index=True)
    #: Per-account overrides on the default reply policy, as JSON.
    PolicyJson = Column(Text, nullable=True)

    #: Labels. @username is how you recognise a row; the phone number is kept
    #: because Backend may want to join a vendor to their business record, but
    #: nothing in the comment flow reads it -- the number a customer reaches
    #: is inside the seeded reel link.
    InstagramUsername = Column(String(150), nullable=True)
    BusinessPhoneNumber = Column(String(20), nullable=True, index=True)

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


class InstagramReelLink(Base):
    """One reel, one WhatsApp link.

    The link is stored complete and percent-encoded, prefill text included, so
    nothing assembles a URL at runtime -- what gets sent is exactly what was
    seeded, readable in one table.

    `%7Bref%7D` inside the link is the commenter's Instagram id, substituted
    just before the reply is rendered. It is the encoded form of `{ref}`
    because the whole prefill text is encoded.

    Two columns, and deliberately no third. An earlier version also stored the
    owning account so the reply path could check it against the webhook, but
    Backend -- which owns this table next -- has no Instagram account id to
    give: it knows businesses and reel ids, and nothing about Instagram
    accounts. A column only a human could fill in is one a human can mistype,
    and a mistyped one would block a link that was perfectly correct.

    Reel ids are globally unique, so ReelId alone always finds the right row.
    """

    __tablename__ = "instagram_reel_links"

    ReelId = Column(String(64), primary_key=True, index=True)
    WaLink = Column(Text, nullable=False)
