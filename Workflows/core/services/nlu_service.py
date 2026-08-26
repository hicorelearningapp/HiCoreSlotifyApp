"""
Natural-language understanding for the WhatsApp bot, backed by a Cloud LLM (Groq).

This module only *understands* a message: it turns free text into a small,
validated intent dict. It never touches the database and never decides
availability -- those remain the job of AppointmentService. If the model is
unreachable or returns anything unusable, extract_intent() returns None and the
caller falls back to the existing deterministic (button) flow.
"""
import json
import re
from datetime import datetime, date, time as dtime, timedelta
import requests

from config import (
    GROQ_API_KEY,
    GROQ_MODEL,
    NLU_TIMEOUT,
    APPOINTMENT_INTERVAL_MINUTES,
)

class NLUService:
    # Actions the router knows how to act on.
    VALID_ACTIONS = {
        "greeting",
        "show_slots",
        "book",
        "view_appointments",
        "cancel",
        "reschedule",
        "main_menu",
        "unknown",
    }

    # The exact JSON shape we ask the model to fill.
    _SYSTEM_PROMPT = """You are an intent parser for a doctor's-appointment WhatsApp bot.
Read the user's message and output ONLY a single JSON object describing what they want.

Today's date is {today} ({weekday}).
Known doctors: {doctors}.

Output JSON with exactly these keys:
{{
  "action": one of "greeting","show_slots","book","view_appointments","cancel","reschedule","main_menu","unknown",
  "customer_name": string or null,
  "doctor_name": string or null,
  "date": "YYYY-MM-DD" or null,
  "relative_day": integer or null,
  "time": "HH:MM" (24h) or null,
  "consultation_type": "in_person" or "online" or null,
  "preference": "earliest" or null
}}

Rules:
- "show me slots" / "when is X free" -> action "show_slots".
- "book ..." / "I want an appointment at 5pm" -> action "book".
- "my appointments" / "what did I book" -> action "view_appointments".
- "cancel ..." -> "cancel" ; "move/reschedule ..." -> "reschedule".
- a bare greeting like "hi"/"hello" -> "greeting" ; "menu"/"start over" -> "main_menu".
- anything you cannot map -> "unknown".
- customer_name: ONLY the user's own name when they explicitly introduce themselves
  ("I'm Yogeshwar", "my name is Sara", "this is Raj"). Otherwise null. Never guess.
- doctor_name: the doctor they mention, else null.
- date: resolve relative phrases ("tomorrow", "next Monday") to an absolute YYYY-MM-DD
  using today's date above. else null.
- relative_day: when the date is relative, also give whole days from today
  (0=today, 1=tomorrow, 2=day after tomorrow). else null.
- time: 24-hour HH:MM. Convert "5 pm" -> "17:00", "9am" -> "09:00". else null.
- consultation_type: "online" for video/online, "in_person" for clinic/in-person, else null.
- preference: "earliest" if they want the soonest/first available slot, else null.
Respond with the JSON object only. No prose, no code fences."""

    @staticmethod
    def extract_intent(text: str, *, today: date, doctor_names: list) -> dict:
        """Call the Groq model and return a validated intent dict, or None."""
        text = (text or "").strip()
        if not text:
            return None

        system = NLUService._SYSTEM_PROMPT.format(
            today=today.isoformat(),
            weekday=today.strftime("%A"),
            doctors=", ".join(doctor_names) if doctor_names else "(none configured)",
        )
        payload = {
            "model": GROQ_MODEL,
            "response_format": {"type": "json_object"},
            "temperature": 0,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": text},
            ],
        }
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }

        try:
            resp = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                json=payload,
                headers=headers,
                timeout=NLU_TIMEOUT,
            )
            if resp.status_code != 200:
                print(f"[NLU] Groq API returned status {resp.status_code}: {resp.text}")
            resp.raise_for_status()
            content = resp.json()["choices"][0]["message"]["content"]
            raw = content if isinstance(content, dict) else json.loads(content)
        except (requests.exceptions.RequestException, KeyError, ValueError, TypeError) as e:
            print(f"[NLU] Groq call failed; falling back to button flow: {e}")
            return None

        return NLUService._normalize(raw)

    @staticmethod
    def _normalize(raw: dict) -> dict:
        """Coerce the model's raw JSON into our canonical, validated intent dict."""
        if not isinstance(raw, dict):
            return None

        action = str(raw.get("action") or "unknown").strip().lower()
        if action not in NLUService.VALID_ACTIONS:
            action = "unknown"

        ct = raw.get("consultation_type")
        if ct not in ("in_person", "online"):
            ct = None

        pref = raw.get("preference")
        if pref != "earliest":
            pref = None

        rel = raw.get("relative_day")
        if not isinstance(rel, int) or isinstance(rel, bool):
            rel = None

        return {
            "action": action,
            "customer_name": NLUService._clean_name(raw.get("customer_name")),
            "doctor_name": NLUService._clean_str(raw.get("doctor_name")),
            "date": NLUService._clean_str(raw.get("date")),
            "relative_day": rel,
            "time": NLUService._clean_str(raw.get("time")),
            "consultation_type": ct,
            "preference": pref,
        }

    @staticmethod
    def _clean_str(v):
        if not isinstance(v, str):
            return None
        v = v.strip()
        return v or None

    # Words a small model sometimes mislabels as a name; never accept these as one.
    _NON_NAME = {
        "book", "booking", "appointment", "appointments", "slot", "slots", "doctor",
        "today", "tomorrow", "cancel", "menu", "hi", "hello", "yes", "no", "guest",
        "online", "video", "clinic", "reschedule", "view",
    }

    @staticmethod
    def _clean_name(v):
        name = NLUService._clean_str(v)
        if not name:
            return None
        if name.lower() in NLUService._NON_NAME:
            return None
        if len(name) > 40:  # keep it human-name-ish
            return None
        return name

    # ---- Deterministic resolution: Python owns the final answer, not the model. ----

    @staticmethod
    def resolve_date(extract: dict, today: date) -> date:
        """Resolve the intent's date to a concrete, non-past date, or None."""
        iso = extract.get("date")
        if iso:
            try:
                d = datetime.strptime(iso, "%Y-%m-%d").date()
                if d >= today:
                    return d
            except ValueError:
                pass
        rel = extract.get("relative_day")
        if isinstance(rel, int) and not isinstance(rel, bool) and rel >= 0:
            return today + timedelta(days=rel)
        return None

    @staticmethod
    def resolve_time(extract: dict):
        """Return a datetime.time for a valid, grid-aligned HH:MM, else None.

        Returns None for off-grid times (e.g. 17:07) so the caller can offer the
        real available slots instead of trying to book an invalid time.
        """
        t = extract.get("time")
        if not t:
            return None
        m = re.match(r"^(\d{1,2}):(\d{2})$", t.strip())
        if not m:
            return None
        hh, mm = int(m.group(1)), int(m.group(2))
        if not (0 <= hh <= 23 and 0 <= mm <= 59):
            return None
        if mm % APPOINTMENT_INTERVAL_MINUTES != 0:
            return None
        return dtime(hh, mm)

    @staticmethod
    def match_doctor(name, doctors):
        """Resolve a doctor by fuzzy name.

        Returns a (status, value) tuple:
          ("found", doctor)        exactly one good match
          ("ambiguous", [doctors]) several matches
          ("not_found", None)      a name was given but nothing matched
          ("none", None)           no usable name was given
        """
        needle = NLUService._clean_str(name)
        if not needle:
            return ("none", None)
        needle = needle.lower().replace("dr.", "").replace("dr ", "").strip()
        if not needle:
            return ("none", None)

        matches = [d for d in doctors if needle in d.FullName.lower() or d.FullName.lower() in needle]
        if len(matches) == 1:
            return ("found", matches[0])
        if len(matches) > 1:
            exact = [d for d in matches if d.FullName.lower() == needle]
            if len(exact) == 1:
                return ("found", exact[0])
            return ("ambiguous", matches)
        return ("not_found", None)
