"""
Instagram OAuth and account-management calls.

Ported from the standalone app's instagram_client.py, converted from httpx to
requests to match the rest of this project. Covers the four token-lifecycle
calls plus the account-level webhook subscription that each connected account
needs on top of the shared app-level callback.

Configuring the callback URL in the Meta dashboard subscribes the *app*. Every
individual professional account must additionally be subscribed to `comments`,
which is what subscribe_account does after a successful authorization.
"""
from __future__ import annotations

import requests

from config import (
    INSTAGRAM_APP_ID,
    INSTAGRAM_APP_SECRET_OAUTH,
    INSTAGRAM_OAUTH_REDIRECT_URI,
    INSTAGRAM_OAUTH_TOKEN_URL,
    INSTAGRAM_LONG_LIVED_TOKEN_URL,
    INSTAGRAM_REFRESH_TOKEN_URL,
    INSTAGRAM_GRAPH_HOST,
    INSTAGRAM_GRAPH_API_VERSION,
    INSTAGRAM_HTTP_TIMEOUT,
)


class InstagramAPIError(RuntimeError):
    """A Meta call failed. `retryable` distinguishes transient from permanent."""

    def __init__(self, message, retryable=False, status_code=None, error_code=None):
        super().__init__(message)
        self.retryable = retryable
        self.status_code = status_code
        self.error_code = error_code


class InstagramOAuthClient:

    def _graph_url(self, path):
        return f"{INSTAGRAM_GRAPH_HOST}/{INSTAGRAM_GRAPH_API_VERSION}/{path.lstrip('/')}"

    def _request(self, method, url, access_token=None, json_body=None,
                 form_body=None, params=None):
        headers = {}
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"
        if json_body is not None:
            headers["Content-Type"] = "application/json"

        try:
            response = requests.request(
                method, url, headers=headers, json=json_body,
                data=form_body, params=params, timeout=INSTAGRAM_HTTP_TIMEOUT,
            )
        except requests.exceptions.RequestException as e:
            # Network-level failures are always worth retrying.
            raise InstagramAPIError(f"Meta request failed: {e}", retryable=True) from e

        try:
            data = response.json()
        except ValueError:
            data = {}

        if 200 <= response.status_code < 300:
            return data if isinstance(data, dict) else {}

        error = data.get("error", {}) if isinstance(data, dict) else {}
        message = error.get("message") if isinstance(error, dict) else None
        code = error.get("code") if isinstance(error, dict) else None
        raise InstagramAPIError(
            str(message or f"Meta returned HTTP {response.status_code}"),
            # Rate limits and server faults are transient; 4xx is our mistake.
            retryable=response.status_code == 429 or response.status_code >= 500,
            status_code=response.status_code,
            error_code=code if isinstance(code, int) else None,
        )

    # ── token lifecycle ───────────────────────────────────────────────────

    def exchange_authorization_code(self, code):
        return self._request(
            "POST",
            INSTAGRAM_OAUTH_TOKEN_URL,
            form_body={
                "client_id": INSTAGRAM_APP_ID,
                "client_secret": INSTAGRAM_APP_SECRET_OAUTH,
                "grant_type": "authorization_code",
                "redirect_uri": INSTAGRAM_OAUTH_REDIRECT_URI,
                # Instagram appends "#_" to the code in the browser redirect.
                "code": code.rstrip("#_"),
            },
        )

    def exchange_long_lived_token(self, short_lived_token):
        return self._request(
            "GET",
            INSTAGRAM_LONG_LIVED_TOKEN_URL,
            params={
                "grant_type": "ig_exchange_token",
                "client_secret": INSTAGRAM_APP_SECRET_OAUTH,
                "access_token": short_lived_token,
            },
        )

    def refresh_long_lived_token(self, access_token):
        return self._request(
            "GET",
            INSTAGRAM_REFRESH_TOKEN_URL,
            params={"grant_type": "ig_refresh_token", "access_token": access_token},
        )

    def get_instagram_profile(self, access_token):
        return self._request(
            "GET",
            self._graph_url("me"),
            access_token=access_token,
            params={"fields": "id,user_id,username,account_type"},
        )

    # ── account webhook subscription ──────────────────────────────────────

    def subscribe_account(self, access_token, instagram_account_id, fields=("comments",)):
        return self._request(
            "POST",
            self._graph_url(f"{instagram_account_id}/subscribed_apps"),
            access_token=access_token,
            form_body={"subscribed_fields": ",".join(f for f in fields if f)},
        )

    def unsubscribe_account(self, access_token, instagram_account_id):
        return self._request(
            "DELETE",
            self._graph_url(f"{instagram_account_id}/subscribed_apps"),
            access_token=access_token,
        )


instagram_oauth_client = InstagramOAuthClient()
