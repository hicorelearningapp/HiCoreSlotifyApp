"""
The seven checks a comment passes before a reply is queued.

Pulled out of the webhook handler so the funnel can be tested directly, and so
"why didn't the bot reply?" has one answer with one name. Every rejection
carries a machine-readable reason, which is logged and also returned in the
webhook's debug payload.

Order matters. The cheap in-memory checks run before the database ones, and
the claim runs last of all -- claiming an event we were going to reject anyway
would suppress a later, legitimate delivery of the same comment.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass

from services.dedup_guard import dedup_guard
from services.tenant_resolver import ResolvedConnection
from utils.comment_parser import CommentEvent
from utils.rules import matches_comment

logger = logging.getLogger("uvicorn")


@dataclass(frozen=True)
class GateResult:
    passed: bool
    reason: str | None = None
    detail: str | None = None

    @staticmethod
    def ok() -> "GateResult":
        return GateResult(True)

    @staticmethod
    def reject(reason: str, detail: str | None = None) -> "GateResult":
        return GateResult(False, reason, detail)


class CommentGate:
    def evaluate(self, db, event: CommentEvent, resolved: ResolvedConnection) -> GateResult:
        policy = resolved.policy

        # 2. Our own public reply is a comment on our own media, and Meta
        #    delivers it back. Replying would loop forever.
        if dedup_guard.is_own_reply(db, event.account_id, event.comment_id):
            return GateResult.reject("own_reply", "this is a reply we posted")

        # 3. The business commenting under its own post.
        if policy.ignore_own_comments and event.commenter_id == event.account_id:
            return GateResult.reject("own_comment", "the account commented on itself")

        # 4. Replies to other comments, off by default.
        if event.parent_comment_id and not policy.reply_to_nested_comments:
            return GateResult.reject(
                "nested_comment", f"parent {event.parent_comment_id}"
            )

        # 5. Keyword rule.
        if not matches_comment(event, policy.comment_match_mode, policy.comment_keywords):
            return GateResult.reject(
                "no_keyword_match", f"mode={policy.comment_match_mode}"
            )

        # 6. Replying switched off for this account.
        if policy.comment_reply_mode == "none":
            return GateResult.reject("reply_mode_none", "this account does not reply")

        # 7. Claim the delivery. Last, and a write -- Meta retries for minutes,
        #    and without the claim each retry sends another reply.
        if not dedup_guard.claim_event(db, event.account_id, event.comment_id):
            return GateResult.reject("duplicate_delivery", event.event_key)

        return GateResult.ok()


comment_gate = CommentGate()
