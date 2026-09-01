"""
Seeds instagram_reel_links.

The links are data, not the output of a generator -- they are written out in
full below so that what a commenter receives is readable here and diffable in
git. Nothing in the service assembles a URL at runtime.

`%7Bref%7D` is the encoded form of `{ref}`; the commenter's Instagram id is
substituted into it when the reply is built. The rest of each link is the
prefill text the WhatsApp side parses back with parse_order_text() to jump
straight into that product's order flow -- reword one and that parse is what
breaks.

Two columns, and no owning account: Backend, which owns this table next, has
no Instagram account id to give. Reel ids are globally unique, so the reel
alone always finds the right row.

The number inside each link is checked by nothing. Seed it wrong and the reply
renders perfectly on its way to the wrong business -- proofread these.

Backend's management level owns this table later. Until then:

    python seed_reel_links.py            # insert or update every row
    python seed_reel_links.py --list     # show what is in the table
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text  # noqa: E402

from db import Base, db_session, engine  # noqa: E402
from models.connection import InstagramReelLink  # noqa: E402

#: (reel id, complete wa.me link). All five reels are on @pastel13cakes;
#: another vendor's reels are just more rows, each with its own number.
REEL_LINKS = [
    # Kanchipuram Silk (product id 1)
    ("18126449017684407",
     "https://wa.me/917550175964?text=Hi%21%20I%27d%20like%20to%20order%20"
     "Kanchipuram%20Silk%20%28id%3A1%2C%20ref%3AIG%7Bref%7D%29"),
    # Banarasi Silk (product id 2)
    ("18243077962309505",
     "https://wa.me/917550175964?text=Hi%21%20I%27d%20like%20to%20order%20"
     "Banarasi%20Silk%20%28id%3A2%2C%20ref%3AIG%7Bref%7D%29"),
    # Kerala Cotton (product id 3)
    ("18480780040109980",
     "https://wa.me/917550175964?text=Hi%21%20I%27d%20like%20to%20order%20"
     "Kerala%20Cotton%20%28id%3A3%2C%20ref%3AIG%7Bref%7D%29"),
    # Platinum Couple Rings (product id 7)
    ("17901662013481289",
     "https://wa.me/917550175964?text=Hi%21%20I%27d%20like%20to%20order%20"
     "Platinum%20Couple%20Rings%20%28id%3A7%2C%20ref%3AIG%7Bref%7D%29"),
    # Gold Couple Rings (product id 8)
    ("17960066426983052",
     "https://wa.me/917550175964?text=Hi%21%20I%27d%20like%20to%20order%20"
     "Gold%20Couple%20Rings%20%28id%3A8%2C%20ref%3AIG%7Bref%7D%29"),
]


def drop_stale_column(db):
    """Rebuild the table if it still carries the old InstagramAccountId column.

    create_all() creates tables but never alters them, so a database seeded
    before that column was dropped keeps a NOT NULL field nothing sets any
    more, and every insert fails on it.
    """
    columns = {row[1] for row in db.execute(text("PRAGMA table_info(instagram_reel_links)"))}
    if "InstagramAccountId" in columns:
        db.execute(text("DROP TABLE instagram_reel_links"))
        db.commit()
        Base.metadata.create_all(bind=engine)
        print("migrated: dropped InstagramAccountId, table rebuilt")


def seed(db):
    """Insert or update every row. Safe to run repeatedly."""
    added = updated = 0
    for reel_id, wa_link in REEL_LINKS:
        row = db.get(InstagramReelLink, reel_id)
        if row is None:
            db.add(InstagramReelLink(ReelId=reel_id, WaLink=wa_link))
            added += 1
        elif row.WaLink != wa_link:
            row.WaLink = wa_link
            updated += 1
    db.commit()
    return added, updated


def main():
    Base.metadata.create_all(bind=engine)
    db = db_session()
    try:
        drop_stale_column(db)

        if "--list" in sys.argv:
            rows = db.query(InstagramReelLink).order_by(InstagramReelLink.ReelId).all()
            if not rows:
                print("instagram_reel_links is empty")
            for row in rows:
                print(f"{row.ReelId}  {row.WaLink}")
            return

        added, updated = seed(db)
        print(f"instagram_reel_links: {added} added, {updated} updated, "
              f"{len(REEL_LINKS)} total")
    finally:
        db_session.remove()


if __name__ == "__main__":
    main()
