"""
Meta webhook signature verification.

Ported from the standalone Instagram Message Automation app's security.py.
Meta signs the raw request body with the App Secret of the app that sent the
event and puts the digest in X-Hub-Signature-256. Verification must run against
the exact bytes received -- re-serialising the parsed JSON changes the digest.
"""
from __future__ import annotations

import hashlib
import hmac


def build_meta_signature(raw_body: bytes, app_secret: str) -> str:
    digest = hmac.new(
        app_secret.encode("utf-8"),
        raw_body,
        hashlib.sha256,
    ).hexdigest()
    return f"sha256={digest}"


def verify_meta_signature(raw_body: bytes, signature_header: str | None, app_secret: str) -> bool:
    if not signature_header or not app_secret:
        return False
    expected = build_meta_signature(raw_body, app_secret)
    return hmac.compare_digest(expected, signature_header.strip().lower())
