import requests

API_URL = "http://151.185.41.194:8003/doctors"

doctor_ids = [
    "cf0e06ff-a64f-4b66-9a9f-df11f5b2ecc7", # Sarah
    "4255e5b8-0851-4331-867a-447ff157f47d", # Robert
    "8452fb39-d329-4a6f-9d80-7f1927170884", # Emily
    "07206ac5-1ee9-46cc-afa2-c27130ed47a6"  # Michael
]

for doc_id in doctor_ids:
    url = f"{API_URL}/{doc_id}"
    payload = {
        "Status": "Approved",
        "IsVerified": True
    }
    try:
        response = requests.put(url, json=payload)
        print(f"Update {doc_id}: {response.status_code} - Status changed to Approved")
    except Exception as e:
        print(f"Error: {e}")
