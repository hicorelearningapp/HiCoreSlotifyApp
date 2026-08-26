"""
Encryption at rest for per-vendor Instagram access tokens.

appointments.db is tracked in git. A token stored in a plain column would be
committed and published, so tokens are Fernet-encrypted with a key that lives
in .env (which is gitignored) and never in the database.

Generate a key once and put it in .env:

    python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"

    INSTAGRAM_TOKEN_ENCRYPTION_KEY=<the printed value>

Losing the key makes every stored token unreadable; reconnect the vendor to
issue a new one.
"""
from __future__ import annotations

from cryptography.fernet import Fernet, InvalidToken

from config import INSTAGRAM_TOKEN_ENCRYPTION_KEY


GENERATE_KEY_HINT = (
    'python -c "from cryptography.fernet import Fernet; '
    'print(Fernet.generate_key().decode())"'
)


class TokenCipherError(RuntimeError):
    """The token could not be encrypted or decrypted."""


class InstagramTokenCipher:
    def __init__(self, key: str = INSTAGRAM_TOKEN_ENCRYPTION_KEY):
        self._key = (key or "").strip()
        self._fernet = None

    def _cipher(self) -> Fernet:
        if self._fernet is not None:
            return self._fernet
        if not self._key:
            raise TokenCipherError(
                "INSTAGRAM_TOKEN_ENCRYPTION_KEY is not configured. The database "
                "file is tracked in git, so access tokens cannot be stored "
                f"without it. Generate one with: {GENERATE_KEY_HINT}"
            )
        try:
            self._fernet = Fernet(self._key.encode("utf-8"))
        except (ValueError, TypeError) as exc:
            raise TokenCipherError(
                "INSTAGRAM_TOKEN_ENCRYPTION_KEY is not a valid Fernet key. "
                f"Generate one with: {GENERATE_KEY_HINT}"
            ) from exc
        return self._fernet

    @property
    def is_configured(self) -> bool:
        return bool(self._key)

    def encrypt(self, token: str) -> str:
        if not token or not token.strip():
            raise TokenCipherError("Access token must not be empty")
        return self._cipher().encrypt(token.strip().encode("utf-8")).decode("utf-8")

    def decrypt(self, ciphertext: str) -> str:
        if not ciphertext:
            raise TokenCipherError("Stored access token is empty")
        try:
            return self._cipher().decrypt(ciphertext.encode("utf-8")).decode("utf-8")
        except InvalidToken as exc:
            raise TokenCipherError(
                "Stored access token could not be decrypted. The encryption key "
                "has changed since it was written; reconnect the account."
            ) from exc


instagram_token_cipher = InstagramTokenCipher()
