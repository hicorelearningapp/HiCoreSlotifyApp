import os
import json
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import googleapiclient.errors
import datetime
import urllib.parse
import base64
import hashlib
import requests
import os

from dotenv import load_dotenv
import dotenv

# SCOPES needed for calendar and meet
SCOPES = ['https://www.googleapis.com/auth/calendar.events']

CLIENT_SECRETS_FILE = os.path.join(os.path.dirname(__file__), "..", "google_client_secret.json")
load_dotenv()


REDIRECT_URI = "http://localhost:8000/google/callback"

class GoogleOAuthService:
    def __init__(self):
        self.use_file = os.path.exists(CLIENT_SECRETS_FILE)
        
    def _get_flow(self, state=None):
        if self.use_file:
            flow = Flow.from_client_secrets_file(
                CLIENT_SECRETS_FILE,
                scopes=SCOPES,
                state=state
            )
        else:
            client_id = os.environ.get("GOOGLE_CLIENT_ID")
            client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
            if not client_id or not client_secret:
                raise ValueError("Google OAuth credentials missing. Provide google_client_secret.json or GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET.")
            client_config = {
                "web": {
                    "client_id": client_id,
                    "project_id": "hicore-system",
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                    "client_secret": client_secret,
                    "redirect_uris": [REDIRECT_URI]
                }
            }
            flow = Flow.from_client_config(
                client_config,
                scopes=SCOPES,
                state=state
            )
        flow.redirect_uri = REDIRECT_URI
        return flow

    def get_authorization_url(self, doctor_id: str):

        
        # Generate PKCE verifier and challenge
        code_verifier = base64.urlsafe_b64encode(os.urandom(32)).rstrip(b'=').decode('utf-8')
        m = hashlib.sha256()
        m.update(code_verifier.encode('utf-8'))
        code_challenge = base64.urlsafe_b64encode(m.digest()).rstrip(b'=').decode('utf-8')
        
        # Store the verifier inside the state so we get it back statelessly!
        stateless_state = f"{doctor_id}::{code_verifier}"
        
        if self.use_file:
            with open(CLIENT_SECRETS_FILE, 'r') as f:
                secrets = json.load(f)
                client_id = secrets.get('web', {}).get('client_id') or secrets.get('installed', {}).get('client_id')
        else:
            client_id = os.environ.get("GOOGLE_CLIENT_ID", "").strip('"').strip("'")
            
        if not client_id:
            raise ValueError("Google OAuth credentials missing. Provide GOOGLE_CLIENT_ID in .env")
        params = {
            'client_id': client_id,
            'redirect_uri': REDIRECT_URI,
            'response_type': 'code',
            'scope': ' '.join(SCOPES),
            'access_type': 'offline',
            'prompt': 'consent',
            'state': stateless_state,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256'
        }
        
        auth_url = 'https://accounts.google.com/o/oauth2/auth?' + urllib.parse.urlencode(params)
        return auth_url

    def exchange_code_for_refresh_token(self, code: str, code_verifier: str = None):
        """Exchanges the authorization code for a refresh token"""
        
        if self.use_file:
            with open(CLIENT_SECRETS_FILE, 'r') as f:
                secrets = json.load(f)
                client_id = secrets.get('web', {}).get('client_id') or secrets.get('installed', {}).get('client_id')
                client_secret = secrets.get('web', {}).get('client_secret') or secrets.get('installed', {}).get('client_secret')
        else:
            client_id = os.environ.get("GOOGLE_CLIENT_ID", "").strip('"').strip("'")
            client_secret = os.environ.get("GOOGLE_CLIENT_SECRET", "").strip('"').strip("'")
            
        data = {
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': REDIRECT_URI,
            'grant_type': 'authorization_code'
        }
        if code_verifier:
            data['code_verifier'] = code_verifier
        
        response = requests.post('https://oauth2.googleapis.com/token', data=data)
        if not response.ok:
            raise ValueError(f"Failed to fetch token: {response.text}")
            
        tokens = response.json()
        return tokens.get('refresh_token')

    def handle_callback(self, code: str, state: str) -> dict:
        """Processes the OAuth callback, extracting the code verifier and returning the result."""
        if "::" in state:
            doctor_id, code_verifier = state.split("::", 1)
        else:
            doctor_id = state
            code_verifier = None
        
        refresh_token = self.exchange_code_for_refresh_token(code=code, code_verifier=code_verifier)
        
        return {
            "message": "Master Google account connected successfully!",
            "instructions": "Please copy the refresh token below and add it to your .env file as MASTER_GOOGLE_REFRESH_TOKEN",
            "MASTER_GOOGLE_REFRESH_TOKEN": refresh_token
        }

    def _get_credentials_from_refresh_token(self, refresh_token: str):
        """Creates credentials object from a stored refresh token"""
        if self.use_file:
            with open(CLIENT_SECRETS_FILE, 'r') as f:
                secrets = json.load(f)
                client_id = secrets.get('web', {}).get('client_id') or secrets.get('installed', {}).get('client_id')
                client_secret = secrets.get('web', {}).get('client_secret') or secrets.get('installed', {}).get('client_secret')
        else:
            client_id = os.environ.get("GOOGLE_CLIENT_ID")
            client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
            
        return Credentials(
            token=None,
            refresh_token=refresh_token,
            client_id=client_id,
            client_secret=client_secret,
            token_uri="https://oauth2.googleapis.com/token"
        )

    def get_calendar_events(self, time_min: str = None, time_max: str = None):
        """Fetches events for the master calendar within a time range"""
        env_vars = dotenv.dotenv_values(os.path.join(os.path.dirname(__file__), "..", ".env"))
        refresh_token = env_vars.get("MASTER_GOOGLE_REFRESH_TOKEN") or os.environ.get("MASTER_GOOGLE_REFRESH_TOKEN")
        
        if not refresh_token:
            print("MASTER_GOOGLE_REFRESH_TOKEN is not configured.")
            return []
            
        creds = self._get_credentials_from_refresh_token(refresh_token)
        try:
            service = build('calendar', 'v3', credentials=creds)
            now = datetime.datetime.utcnow().isoformat() + 'Z'  # 'Z' indicates UTC time
            
            kwargs = {
                'calendarId': 'primary',
                'singleEvents': True,
                'orderBy': 'startTime',
                'maxResults': 2500
            }
            if time_min:
                kwargs['timeMin'] = time_min
            else:
                kwargs['timeMin'] = now
                
            if time_max:
                kwargs['timeMax'] = time_max
                
            events_result = service.events().list(**kwargs).execute()
            
            events = events_result.get('items', [])
            return events
        except googleapiclient.errors.HttpError as error:
            print(f"An error occurred fetching events: {error}")
            return []
            
    def create_meet_event(self, appointment_id: str, patient_name: str, start_dt: datetime.datetime, duration_mins: int = 30, doctor_email: str = None, patient_email: str = None):
        """Creates a calendar event with a Google Meet link and returns the link"""
        env_vars = dotenv.dotenv_values(os.path.join(os.path.dirname(__file__), "..", ".env"))
        refresh_token = env_vars.get("MASTER_GOOGLE_REFRESH_TOKEN") or os.environ.get("MASTER_GOOGLE_REFRESH_TOKEN")
        
        if not refresh_token:
            raise ValueError("MASTER_GOOGLE_REFRESH_TOKEN is not configured in .env")
            
        creds = self._get_credentials_from_refresh_token(refresh_token)
        service = build('calendar', 'v3', credentials=creds)
        
        end_dt = start_dt + datetime.timedelta(minutes=duration_mins)
        
        event_body = {
            'summary': f'HiCore Video Consultation with {patient_name}',
            'description': f'Automatically generated Video Consultation.\nAppointment ID: {appointment_id}',
            'start': {
                'dateTime': start_dt.isoformat(),
                'timeZone': 'Asia/Kolkata',
            },
            'end': {
                'dateTime': end_dt.isoformat(),
                'timeZone': 'Asia/Kolkata',
            },
            'conferenceData': {
                'createRequest': {
                    'requestId': f"hicore-meet-{appointment_id}",
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                }
            },
            'guestsCanInviteOthers': True,
            'guestsCanModify': True
        }
        
        event_body['attendees'] = []
        if doctor_email:
            event_body['attendees'].append({'email': doctor_email})
        if patient_email:
            event_body['attendees'].append({'email': patient_email})
        
        try:
            event = service.events().insert(
                calendarId='primary', 
                body=event_body, 
                conferenceDataVersion=1 # CRITICAL for Meet link creation
            ).execute()
            
            # Extract the Hangout Meet link
            meet_link = event.get('hangoutLink')
            return meet_link
        except googleapiclient.errors.HttpError as error:
            print(f"An error occurred creating meet event: {error}")
            return None

    def delete_meet_event(self, meeting_link: str):
        """Deletes the calendar event associated with this meeting link"""
        env_vars = dotenv.dotenv_values(os.path.join(os.path.dirname(__file__), "..", ".env"))
        refresh_token = env_vars.get("MASTER_GOOGLE_REFRESH_TOKEN") or os.environ.get("MASTER_GOOGLE_REFRESH_TOKEN")
        
        if not refresh_token or not meeting_link:
            return False
            
        creds = self._get_credentials_from_refresh_token(refresh_token)
        service = build('calendar', 'v3', credentials=creds)
        
        try:
            now = datetime.datetime.utcnow().isoformat() + 'Z'
            # Fetch up to 2500 upcoming events
            events_result = service.events().list(
                calendarId='primary', 
                timeMin=now,
                maxResults=2500
            ).execute()
            
            events = events_result.get('items', [])
            for event in events:
                if event.get('hangoutLink') == meeting_link:
                    service.events().delete(calendarId='primary', eventId=event['id']).execute()
                    return True
            return False
        except googleapiclient.errors.HttpError as error:
            print(f"An error occurred deleting meet event: {error}")
            return False
