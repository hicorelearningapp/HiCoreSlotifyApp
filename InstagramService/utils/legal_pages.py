"""
Privacy policy and data-deletion pages.

Ported from the standalone app's legal.py. Meta App Review requires both a
privacy policy URL and a data-deletion instructions URL before an app can be
granted Advanced Access, which is what connecting Instagram accounts you do not
own requires.

Wording covers WhatsApp booking as well as Instagram comments, since one
deployment serves both channels.
"""
from __future__ import annotations

from html import escape


EFFECTIVE_DATE = "August 18, 2026"


def _page(*, title: str, body: str) -> str:
    safe_title = escape(title)
    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>{safe_title}</title>
  <style>
    :root {{ color-scheme: light dark; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }}
    body {{ margin: 0; background: #f6f7f9; color: #172033; line-height: 1.65; }}
    main {{ width: min(760px, calc(100% - 40px)); margin: 48px auto; padding: 40px;
            box-sizing: border-box; background: #fff; border: 1px solid #dfe3ea; border-radius: 16px; }}
    h1 {{ margin: 0 0 8px; font-size: clamp(2rem, 6vw, 3rem); line-height: 1.1; }}
    h2 {{ margin: 32px 0 8px; font-size: 1.2rem; }}
    p, li {{ max-width: 70ch; }}
    a {{ color: #3157d5; }}
    .meta {{ color: #657085; margin-top: 0; }}
    .notice {{ padding: 16px; border-left: 4px solid #3157d5; background: #eef2ff; }}
    @media (prefers-color-scheme: dark) {{
      body {{ background: #10131a; color: #edf1f7; }}
      main {{ background: #171b24; border-color: #303846; }}
      a {{ color: #a8baff; }}
      .meta {{ color: #aab3c2; }}
      .notice {{ background: #202a49; }}
    }}
    @media (max-width: 600px) {{ main {{ margin: 0; width: 100%; min-height: 100vh; padding: 28px 20px; border: 0; border-radius: 0; }} }}
  </style>
</head>
<body><main>{body}</main></body>
</html>"""


def _identity(app_name: str, controller_name: str, contact_email: str) -> tuple[str, str, str]:
    return (
        escape(app_name or "Instagram Comment Automation"),
        escape(controller_name or "the app owner"),
        escape(contact_email or "the contact address listed in the Meta app"),
    )


def render_privacy_policy(*, app_name: str, controller_name: str, contact_email: str) -> str:
    app, controller, email = _identity(app_name, controller_name, contact_email)
    body = f"""
<h1>{app} Privacy Policy</h1>
<p class="meta">Effective date: {EFFECTIVE_DATE}</p>
<p>This policy explains how {controller} ("we", "us") handles information when you connect
or interact with {app}, an Instagram comment-automation and WhatsApp appointment-booking service.</p>

<h2>Information we process</h2>
<ul>
  <li>Instagram account and profile identifiers, including account IDs and usernames.</li>
  <li>Instagram comments and related data, including comment text, comment IDs, commenter
      identifiers, media IDs, media type, parent-comment IDs, and event timestamps.</li>
  <li>Webhook delivery metadata and configured automation rules.</li>
  <li>WhatsApp phone numbers, message content, and appointment or order details supplied
      by the person booking, where the booking channel is used.</li>
  <li>Reply action, delivery, retry, and error-status records used to prevent duplicates and
      operate the service.</li>
  <li>Instagram access credentials required to connect the authorized account. These are kept
      in server-side configuration and are not intentionally exposed to end users.</li>
</ul>

<h2>How we use information</h2>
<p>We use this information only to authenticate the connected Instagram account, receive
authorized comment events, apply the account owner's automation rules, send configured public
or private replies, prevent duplicate responses, maintain security, and troubleshoot failures.</p>

<h2>Sharing and sale</h2>
<p>We do not sell personal information. We disclose information only to Meta/Instagram as
needed to perform requested API operations, to infrastructure providers acting on our behalf,
or when legally required. Providers may process information only to deliver their services to us.</p>

<h2>Retention</h2>
<p>We keep event and reply-operation records only while needed to provide, secure, and debug the
service. An administrator can remove development records at any time. Verified deletion requests
are completed within 30 days unless a longer period is required by law, security, or fraud-prevention
obligations.</p>

<h2>Your choices and deletion rights</h2>
<p>You can revoke the app's Instagram access from Instagram's <strong>Apps and websites</strong>
settings. You may also request access to or deletion of information associated with your account.
See our <a href="/data-deletion">Data Deletion Instructions</a>.</p>

<h2>Security</h2>
<p>We use access controls, webhook-signature verification, secret configuration, request-size
limits, and duplicate-event protections. No system can guarantee absolute security.</p>

<h2>Children</h2>
<p>This service is intended for professional Instagram account owners and is not directed to
children.</p>

<h2>Changes to this policy</h2>
<p>We may update this policy as the service changes. The effective date above will be updated
when material revisions are published.</p>

<h2>Contact</h2>
<p>Controller: {controller}<br>Privacy contact: {email}</p>
"""
    return _page(title=f"{app_name} Privacy Policy", body=body)


def render_data_deletion_instructions(
    *, app_name: str, controller_name: str, contact_email: str
) -> str:
    app, controller, email = _identity(app_name, controller_name, contact_email)
    body = f"""
<h1>{app} Data Deletion Instructions</h1>
<p class="meta">Effective date: {EFFECTIVE_DATE}</p>
<p>You can disconnect the app and request deletion of information associated with your Instagram
account at any time.</p>

<h2>1. Revoke Instagram access</h2>
<ol>
  <li>Sign in to the Instagram account connected to {app}.</li>
  <li>Open <strong>Settings and privacy</strong>, then <strong>Website permissions</strong> or
      <strong>Apps and websites</strong>.</li>
  <li>Find {app} under active apps and remove its access.</li>
</ol>

<h2>2. Request deletion of stored records</h2>
<p>Email <strong>{email}</strong> with the subject <strong>Instagram data deletion request</strong>.
Include the connected Instagram username and enough information for {controller} to verify that
you control the account.</p>
<p class="notice"><strong>Never send your Instagram password, access token, or app secret.</strong></p>

<h2>What we delete</h2>
<p>After verification, we delete stored account/profile identifiers, comment and media metadata,
webhook records, automation actions, and reply-status records associated with the account. We also
remove locally held connection credentials when the integration is terminated.</p>

<h2>Timing</h2>
<p>Verified deletion requests are completed within 30 days. We may retain a minimal record where
required for legal compliance, security, fraud prevention, or documenting completion of the request.</p>

<p><a href="/privacy">Return to the Privacy Policy</a></p>
"""
    return _page(title=f"{app_name} Data Deletion Instructions", body=body)
