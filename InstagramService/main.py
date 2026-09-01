"""
HiCore Instagram Handler.

A standalone FastAPI service for the Instagram side of the platform: comment
automation, WhatsApp handoff and token lifecycle. Vendors are added by hand
through the connections API -- there is no OAuth flow.

It imports nothing from Backend or Workflows, and since the reel-to-link
lookup replaced the catalogue join it reads no other service's tables either.
Every table it touches is one of its own.

Run:  python main.py          (or: uvicorn main:app --port 8002)
"""
import asyncio
import logging
import os
import sys

# Allow `from services...` / `from models...` when started from any directory.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Request  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402

from config import (  # noqa: E402
    INSTAGRAM_WORKER_POLL_SECONDS,
    PORT,
    PUBLIC_BASE_URL,
    SERVICE_NAME,
)
from db import Base, db_session, engine, request_context  # noqa: E402

# Import the models so create_all sees them.
import models.connection  # noqa: E402,F401
from routers import connections, legal, webhook  # noqa: E402
from services.dedup_guard import dedup_guard  # noqa: E402
from services import graph_admin  # noqa: E402
from services.reply_queue import reply_queue  # noqa: E402

# This service owns four tables. Base is its own, so this never tries to build
# Backend's schema even when pointed at the shared SQLite file.
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=SERVICE_NAME,
    description="Instagram comment automation and WhatsApp handoff.",
    openapi_url="/docs/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    token = request_context.set(object())
    try:
        return await call_next(request)
    except Exception:
        db_session.rollback()
        raise
    finally:
        db_session.remove()
        request_context.reset(token)


def setup_logging():
    formatter = logging.Formatter(
        fmt="%(asctime)s - %(levelname)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S"
    )
    for name in ("uvicorn", "uvicorn.error", "uvicorn.access"):
        for handler in logging.getLogger(name).handlers:
            handler.setFormatter(formatter)


def check_public_base_url():
    """Log the origin Meta has been told to call.

    A wrong value fails late and quietly -- the webhook simply never arrives,
    which looks identical to nobody commenting. Saying it at boot is the
    cheapest place to notice.
    """
    from routers.webhook import WEBHOOK_PATH

    log = logging.getLogger("uvicorn")
    if WEBHOOK_PATH not in {getattr(r, "path", None) for r in app.routes}:
        log.warning("%s is not mounted; Meta has nowhere to deliver", WEBHOOK_PATH)
    else:
        log.info("Meta should deliver comments to %s%s", PUBLIC_BASE_URL, WEBHOOK_PATH)


# ── Background work ───────────────────────────────────────────────────────
async def reply_worker_task():
    """Deliver queued replies, retrying transient Meta failures."""
    try:
        reply_queue.recover_stuck(db_session)
    except Exception as e:
        logging.getLogger("uvicorn").error("Could not recover stuck actions: %s", e)
    while True:
        try:
            await asyncio.sleep(INSTAGRAM_WORKER_POLL_SECONDS)
            reply_queue.process_once(db_session)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logging.getLogger("uvicorn").error("Reply worker error: %s", e)


async def event_prune_task():
    """Drop dedup records once Meta can no longer retry them."""
    while True:
        try:
            await asyncio.sleep(6 * 60 * 60)
            dedup_guard.prune(db_session)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logging.getLogger("uvicorn").error("Event prune error: %s", e)


async def token_refresh_task():
    """Refresh long-lived tokens before their 60-day expiry.

    The only automation left around a vendor's token. Without it every
    manually added account goes dark 60 days later.
    """
    while True:
        try:
            await asyncio.sleep(12 * 60 * 60)
            graph_admin.refresh_expiring_tokens(db_session)
        except asyncio.CancelledError:
            break
        except Exception as e:
            logging.getLogger("uvicorn").error("Token refresh error: %s", e)


@app.on_event("startup")
async def startup_event():
    setup_logging()
    check_public_base_url()
    asyncio.create_task(reply_worker_task())
    asyncio.create_task(event_prune_task())
    asyncio.create_task(token_refresh_task())


app.include_router(webhook.router)
app.include_router(connections.router)
app.include_router(legal.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": SERVICE_NAME}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=True)
