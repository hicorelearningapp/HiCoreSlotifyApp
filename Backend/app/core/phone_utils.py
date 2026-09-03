import re
from typing import List, Set, Optional
from sqlalchemy import or_, Column

def normalize_phone_number(phone: str) -> str:
    """
    Extracts the last 10 digits of a phone number.
    e.g. '+917550175964' -> '7550175964'
         '917550175964'  -> '7550175964'
         '7550175964'    -> '7550175964'
    """
    if not phone:
        return ""
    digits = re.sub(r"\D", "", str(phone))
    if len(digits) >= 10:
        return digits[-10:]
    return digits

def get_phone_variants(phone: str) -> List[str]:
    """
    Returns all standard representations of a phone number:
    +917550175964, 917550175964, 7550175964, +91 7550175964, 07550175964
    """
    if not phone:
        return []
    
    clean_str = str(phone).strip()
    raw_10 = normalize_phone_number(clean_str)
    
    variants: Set[str] = {clean_str}
    if raw_10:
        variants.add(raw_10)
        variants.add(f"+91{raw_10}")
        variants.add(f"91{raw_10}")
        variants.add(f"+91 {raw_10}")
        variants.add(f"0{raw_10}")
    
    return list(variants)

def build_phone_filter(column, phone: str):
    """
    Constructs an SQLAlchemy OR filter matching any variant or suffix of the phone number.
    Accepts: +917550175964, 917550175964, 7550175964, etc.
    """
    if not phone:
        return None
    
    variants = get_phone_variants(phone)
    raw_10 = normalize_phone_number(phone)
    
    conditions = [column == v for v in variants]
    if raw_10 and len(raw_10) >= 7:
        conditions.append(column.ilike(f"%{raw_10}%"))
        
    return or_(*conditions)
