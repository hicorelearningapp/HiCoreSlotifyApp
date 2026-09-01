"""
Moves this service's tables out of a shared database into its own.

Run once per machine. It reads the four instagram_* tables from the old file
and writes them into the one DATABASE_URL now points at, mapping the
connections table onto its slimmer shape as it goes.

Two things it will not do for you:

  the encryption key. Tokens are Fernet ciphertext, so the destination is only
  useful with the same INSTAGRAM_TOKEN_ENCRYPTION_KEY. Copying rows to a box
  with a different key gives you connections that look fine and cannot send.

  delete anything. The source file is left exactly as it was, so a bad run
  costs nothing and can be repeated.

    python migrate_db.py --from ../appointments.db
    python migrate_db.py --from ../appointments.db --dry-run
"""
import os
import sqlite3
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import DATABASE_URL, INSTAGRAM_TOKEN_ENCRYPTION_KEY  # noqa: E402
from db import Base, engine  # noqa: E402
import models.connection  # noqa: E402,F401

#: Old column -> new column. Columns absent from the new schema are dropped:
#: Id was a surrogate key beside one that was already unique, and Scopes,
#: AccountType and AppScopedId were only ever filled in by the OAuth profile
#: call, which no longer exists.
CONNECTION_COLUMNS = [
    "InstagramAccountId", "AccessTokenEncrypted", "Status", "TokenExpiresAt",
    "PolicyJson", "InstagramUsername", "BusinessPhoneNumber",
    "CreatedAt", "UpdatedAt",
]
COPY_WHOLE = ["instagram_reel_links", "instagram_processed_events",
              "instagram_reply_actions"]


def arg(name, default=None):
    return sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default


def columns_of(conn, table):
    return [r[1] for r in conn.execute("PRAGMA table_info(%s)" % table)]


def table_exists(conn, table):
    row = conn.execute(
        "select 1 from sqlite_master where type='table' and name=?", (table,)
    ).fetchone()
    return row is not None


def main():
    source = arg("--from")
    if not source:
        sys.exit("Pass the database to read from:\n"
                 "    python migrate_db.py --from ../appointments.db")
    if not os.path.exists(source):
        sys.exit("No such file: %s" % source)

    dest_path = DATABASE_URL.replace("sqlite:///", "")
    if os.path.abspath(source) == os.path.abspath(dest_path):
        sys.exit("Source and destination are the same file. Set DATABASE_URL "
                 "to the new database first.")

    dry = "--dry-run" in sys.argv
    print("from : %s" % os.path.abspath(source))
    print("to   : %s%s\n" % (os.path.abspath(dest_path), "   (dry run)" if dry else ""))

    if not INSTAGRAM_TOKEN_ENCRYPTION_KEY:
        print("warning: INSTAGRAM_TOKEN_ENCRYPTION_KEY is not set here. Rows will "
              "copy, but the tokens are only readable with the key that wrote "
              "them.\n")

    Base.metadata.create_all(bind=engine)
    src = sqlite3.connect(source)
    dst = sqlite3.connect(dest_path)

    total = 0
    if table_exists(src, "instagram_connections"):
        available = set(columns_of(src, "instagram_connections"))
        cols = [c for c in CONNECTION_COLUMNS if c in available]
        missing = [c for c in CONNECTION_COLUMNS if c not in available]
        rows = src.execute("select %s from instagram_connections" % ", ".join(cols)).fetchall()
        print("instagram_connections: %s row(s), %s column(s) kept%s"
              % (len(rows), len(cols),
                 ", %s absent in source" % ", ".join(missing) if missing else ""))
        for row in rows:
            label = row[cols.index("InstagramUsername")] if "InstagramUsername" in cols else None
            print("   %s  %s" % (row[0], "@%s" % label if label else ""))
        if not dry and rows:
            dst.executemany(
                "insert or replace into instagram_connections (%s) values (%s)"
                % (", ".join(cols), ", ".join("?" * len(cols))), rows)
            total += len(rows)
    else:
        print("instagram_connections: not in the source database")

    for table in COPY_WHOLE:
        if not table_exists(src, table):
            print("%s: not in the source database" % table)
            continue
        src_cols = columns_of(src, table)
        dst_cols = [c for c in src_cols if c in set(columns_of(dst, table))]
        rows = src.execute("select %s from %s" % (", ".join(dst_cols), table)).fetchall()
        print("%s: %s row(s)" % (table, len(rows)))
        if not dry and rows:
            dst.executemany(
                "insert or replace into %s (%s) values (%s)"
                % (table, ", ".join(dst_cols), ", ".join("?" * len(dst_cols))), rows)
            total += len(rows)

    if dry:
        print("\nnothing written")
    else:
        dst.commit()
        print("\n%s row(s) written. The source file is untouched." % total)
    src.close()
    dst.close()


if __name__ == "__main__":
    main()
