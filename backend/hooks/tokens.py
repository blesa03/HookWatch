import hashlib
import secrets

TOKEN_BYTES = 32


def generate_ingest_token() -> str:
    return secrets.token_urlsafe(TOKEN_BYTES)


def generate_management_token() -> str:
    return secrets.token_urlsafe(TOKEN_BYTES)


def hash_token(raw_token: str) -> str:
    return hashlib.sha256(
        raw_token.encode("utf-8")
    ).hexdigest()


def verify_token(
    raw_token: str,
    token_hash: str,
) -> bool:
    if not raw_token or not token_hash:
        return False

    candidate_hash = hash_token(raw_token)

    return secrets.compare_digest(
        candidate_hash,
        token_hash,
    )