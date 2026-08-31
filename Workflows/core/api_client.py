import os
import requests
from typing import Dict, Any, Optional

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://151.185.41.194:8003")

class BackendAPIClient:
    def __init__(self, base_url: str = BACKEND_API_URL):
        self.base_url = base_url.rstrip("/")
        self.session = requests.Session()
        
    def _request(self, method: str, endpoint: str, **kwargs) -> Any:
        url = f"{self.base_url}{endpoint}"
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            if response.text:
                return response.json()
            return None
        except requests.exceptions.RequestException as e:
            print(f"API Client Error: {method} {url} - {e}")
            if hasattr(e, 'response') and e.response is not None:
                print(f"Response Body: {e.response.text}")
            return None

    # --- Customer APIs ---
    def get_customer(self, patient_id: str):
        return self._request("GET", f"/customers/{patient_id}")
        
    def get_customer_by_phone(self, phone_number: str):
        return self._request("GET", f"/customers/by-phone/{phone_number}")
        
    def get_profiles_by_phone(self, phone_number: str):
        return self._request("GET", f"/customers/by-phone/{phone_number}/patients")
        
    def create_customer(self, data: Dict[str, Any]):
        return self._request("POST", "/customers", json=data)
        
    def add_patient_by_phone(self, phone_number: str, data: Dict[str, Any]):
        response = self.session.post(f"{self.base_url}/customers/by-phone/{phone_number}/patients", json=data)
        if response.status_code >= 400:
            try:
                detail = response.json().get("detail", response.text)
            except Exception:
                detail = response.text
            raise Exception(detail)
        return response.json()
        
    def update_customer_email(self, phone_number: str, email: str):
        return self._request("PATCH", f"/customers/by-phone/{phone_number}/email", params={"email_address": email})

    # --- Appointment APIs ---
    def list_appointments(self, doctor_id: str | None = None, patient_id: str | None = None, target_date: str | None = None):
        params = {}
        if doctor_id:
            params['doctor_id'] = doctor_id
        if patient_id:
            params['patient_id'] = patient_id
        if target_date:
            params['target_date'] = target_date
        return self._request("GET", "/appointments", params=params)

    def get_appointment(self, appointment_id: str):
        return self._request("GET", f"/appointments/{appointment_id}")
        
    def book_appointment(self, data: Dict[str, Any]):
        response = self.session.post(f"{self.base_url}/appointments", json=data)
        if response.status_code >= 400:
            try:
                detail = response.json().get("detail", response.text)
            except Exception:
                detail = response.text
            raise Exception(detail)
        return response.json()
        
    def cancel_appointment(self, appointment_id: str):
        return self._request("PATCH", f"/appointments/{appointment_id}/cancel")
        
    def delete_appointment(self, appointment_id: str):
        return self._request("DELETE", f"/appointments/{appointment_id}")
        
    def get_upcoming_doctor_appointments(self, doctor_id: str, limit: int = 15):
        return self._request("GET", f"/appointments/doctor/{doctor_id}/upcoming", params={"limit": limit})
        
    # --- Payment APIs ---
    def create_payment(self, data: Dict[str, Any]):
        return self._request("POST", "/payments", json=data)

    # --- Doctor APIs ---
    def get_doctor(self, doctor_id: str):
        return self._request("GET", f"/doctors/{doctor_id}")
        
    def get_doctor_first_name(self, doctor_id: str) -> str:
        doc = self.get_doctor(doctor_id)
        if not doc or "FullName" not in doc:
            return "Doctor"
        name = doc["FullName"].strip()
        prefixes = ["Dr. ", "Dr.", "Dr ", "Doctor "]
        for prefix in prefixes:
            if name.lower().startswith(prefix.lower()):
                name = name[len(prefix):].strip()
                break
        return f"Dr. {name.split()[0]}" if name else "Doctor"
        
    def list_doctors(self, approved_only: bool = True):
        return self._request("GET", "/doctors", params={"approved_only": approved_only})
        
    def list_doctors_by_business_phone(self, business_phone: str, approved_only: bool = True):
        return self._request("GET", "/doctors", params={"business_phone": business_phone, "approved_only": approved_only})
        
    def get_available_slots(self, doctor_id: str, target_date: str):
        return self._request("GET", f"/doctors/{doctor_id}/available-slots", params={"target_date": target_date})

    # --- Ecommerce APIs ---
    def get_all_categories(self, store_id: str = "default"):
        return self._request("GET", "/ecommerce/products/categories", params={"store_id": store_id})
        
    def get_products_by_category(self, category_id: int):
        return self._request("GET", f"/ecommerce/products/categories/{category_id}/products")
        
    def get_product(self, product_id: int):
        return self._request("GET", f"/ecommerce/products/{product_id}")
        
    def get_variants_by_product_id(self, product_id: int):
        return self._request("GET", f"/ecommerce/products/{product_id}/variants")
        
    def find_product(self, identifier: str):
        return self._request("GET", f"/ecommerce/products/find/{identifier}")
        
    def get_ecommerce_customer(self, phone_number: str):
        return self._request("GET", f"/ecommerce/customers/by-phone/{phone_number}")
        
    def create_ecommerce_customer(self, data: Dict[str, Any]):
        return self._request("POST", "/ecommerce/customers", json=data)
        
    def update_ecommerce_customer(self, phone_number: str, data: Dict[str, Any]):
        return self._request("PUT", f"/ecommerce/customers/by-phone/{phone_number}", json=data)

    def create_order(self, data: Dict[str, Any]):
        return self._request("POST", "/ecommerce/orders", json=data)

    def get_pending_refunds(self, doctor_id: str):
        return self._request("GET", f"/appointments/doctor/{doctor_id}/pending-refunds")

    def process_refund(self, appointment_id: str):
        return self._request("PATCH", f"/appointments/{appointment_id}/process-refund")

api_client = BackendAPIClient()
