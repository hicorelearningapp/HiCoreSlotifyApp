"""
Outbound calls to Meta: public comment replies and comment-to-DM private
replies.

There is no plain-DM send. The account is subscribed to `comments` only, so
inbound direct messages are never delivered and nothing needs to answer one.
The private reply below still posts to {account_id}/messages and still needs
the instagram_business_manage_messages permission -- the endpoint is shared,
only the recipient differs.

Every call here is synchronous and raises on failure. The old implementation
sent DMs from a daemon thread and returned None, so a rejection was printed and
forgotten -- there was no way for a caller to retry, and no record that a
message had been lost. Retrying is the reply queue's job, and it can only do it
if these raise.

Comment replies also need Meta's id for the reply we just created. Without it
we cannot recognise our own reply when Meta delivers it back, and the service
answers itself in a loop.
"""
from __future__ import annotations

import logging

import requests

from config import (
    INSTAGRAM_ACCESS_TOKEN,
    INSTAGRAM_GRAPH_API_VERSION,
    INSTAGRAM_GRAPH_HOST,
    INSTAGRAM_HTTP_TIMEOUT,
)


logger = logging.getLogger("uvicorn")


class InstagramSendError(RuntimeError):
    """Meta rejected an outbound message.

    `retryable` separates a transient failure (429, 5xx, network) from a
    permanent one (a comment deleted, a private reply already used). The queue
    backs off on the first and gives up immediately on the second.
    """

    def __init__(self, message: str, retryable: bool = False, status_code: int | None = None):
        super().__init__(message)
        self.retryable = retryable
        self.status_code = status_code


class Messenger:
    def _url(self, path: str) -> str:
        return f"{INSTAGRAM_GRAPH_HOST}/{INSTAGRAM_GRAPH_API_VERSION}/{path.lstrip('/')}"

    def _post(self, path: str, payload: dict, label: str, access_token: str | None = None) -> dict:
        headers = {
            "Authorization": f"Bearer {access_token or INSTAGRAM_ACCESS_TOKEN}",
            "Content-Type": "application/json",
        }
        try:
            response = requests.post(
                self._url(path), headers=headers, json=payload, timeout=INSTAGRAM_HTTP_TIMEOUT
            )
        except requests.exceptions.RequestException as e:
            # Never reached Meta, so it is always worth another attempt.
            raise InstagramSendError(f"{label} request failed: {e}", retryable=True) from e

        try:
            data = response.json()
        except ValueError:
            # Meta answered with something that is not JSON. Harmless on a 2xx,
            # but on an error it means the detail below is lost, so record it.
            logger.warning(
                "%s: Meta returned a non-JSON body (HTTP %s)", label, response.status_code
            )
            data = {}

        if 200 <= response.status_code < 300:
            return data if isinstance(data, dict) else {}

        error = data.get("error", {}) if isinstance(data, dict) else {}
        detail = error.get("message") if isinstance(error, dict) else None
        retryable = response.status_code == 429 or response.status_code >= 500
        # Logged here as well as by the queue: this line carries Meta's own
        # wording, which is the only thing that explains *why* it was refused.
        logger.error(
            "%s rejected by Meta (HTTP %s, %s): %s",
            label, response.status_code,
            "retryable" if retryable else "permanent",
            detail or "no detail given",
        )
        raise InstagramSendError(
            f"{label} failed: {detail or f'Meta returned HTTP {response.status_code}'}",
            retryable=retryable,
            status_code=response.status_code,
        )

    def reply_publicly(self, comment_id: str, message: str, access_token: str | None = None) -> str | None:
        """Post a public reply under a comment. Returns the new comment id."""
        data = self._post(
            f"{comment_id}/replies", {"message": message}, "public reply", access_token
        )
        return str(data.get("id") or "") or None

    def send_private_reply(
        self, instagram_account_id: str, comment_id: str, message: str,
        access_token: str | None = None,
    ) -> str | None:
        """Send the comment-to-DM private reply. Returns the message id.

        Meta allows exactly one private reply per comment, inside a limited
        window after it was posted. A second attempt is rejected outright,
        which is why duplicate suppression has to run before this is called.
        """
        data = self._post(
            f"{instagram_account_id}/messages",
            {"recipient": {"comment_id": comment_id}, "message": {"text": message}},
            "private reply",
            access_token,
        )
        return str(data.get("message_id") or data.get("id") or "") or None


messenger = Messenger()
