import urllib.parse
import re

class HandoffService:
    @staticmethod
    def generate_wa_link(
        wa_number: str,
        product_name: str,
        customer_ig_id: str,
        product_id=None,
    ) -> str:
        """wa.me link whose prefill identifies the product being ordered.

        When product_id is known the prefill carries it alongside the name, so
        the WhatsApp side resolves the exact row instead of guessing from a
        name that two vendors could share. Without an id the older
        name-only format is emitted, which parse_order_text still reads.
        """
        wa_number = "".join(filter(str.isdigit, str(wa_number)))

        if product_id is not None and str(product_id).strip():
            text = (
                f"Hi! I'd like to order {product_name} "
                f"(id:{product_id}, ref:IG{customer_ig_id})"
            )
        else:
            text = f"Hi! I'd like to order {product_name} (ref:IG{customer_ig_id})"
        encoded_text = urllib.parse.quote(text)

        return f"https://wa.me/{wa_number}?text={encoded_text}"

    @staticmethod
    def generate_booking_link(wa_number: str, prefill_text: str = "Hi") -> str:
        """Plain wa.me link for the healthcare booking handoff.

        Deliberately carries no ref token: the prefill is just a greeting, so
        the WhatsApp conversation starts clean and drops the user into the
        normal greeting flow. The tradeoff is that a booking cannot be traced
        back to the Instagram comment that produced it.
        """
        wa_number = "".join(filter(str.isdigit, str(wa_number)))
        encoded_text = urllib.parse.quote(prefill_text)

        return f"https://wa.me/{wa_number}?text={encoded_text}"

    @staticmethod
    def parse_order_text(text: str) -> dict | None:

        if not text:
            return None
        
        text = text.strip()
        
        # Format A+ (readable IG with product id):
        #   "Hi! I'd like to order Kanchipuram Silk (id:1, ref:IG12345)"
        # Tried before Format A because the id is unambiguous where a name is not.
        match = re.match(
            r"Hi!\s*I'd like to order\s+(.+?)\s*\(id:(\d+),\s*ref:IG(\d+)\)",
            text,
            re.IGNORECASE
        )
        if match:
            return {
                "source": "instagram",
                "product_name": match.group(1).strip(),
                "product_id": match.group(2),
                "ig_user_id": match.group(3),
            }

        # Format A (readable IG): "Hi! I'd like to order Chocolate Cake (ref:IG12345)"
        match = re.match(
            r"Hi!\s*I'd like to order\s+(.+?)\s*\(ref:IG(\d+)\)",
            text,
            re.IGNORECASE
        )
        if match:
            return {
                "source": "instagram",
                "product_name": match.group(1).strip(),
                "ig_user_id": match.group(2),
            }
            
        # Format C (readable QR): "Hi! I'd like to order Chocolate Cake (ref:QR123)"
        match = re.match(
            r"Hi!\s*I'd like to order\s+(.+?)\s*\(ref:QR(\d+)\)",
            text,
            re.IGNORECASE
        )
        if match:
            return {
                "source": "qr_code",
                "product_name": match.group(1).strip(),
                "product_id": match.group(2),
            }
        
        # Format B (legacy machine): "ORDER:product:FROM_IG:id"
        match = re.match(
            r"ORDER:(.+?):FROM_IG:(.+)",
            text,
            re.IGNORECASE
        )
        if match:
            return {
                "source": "instagram",
                "product_name": match.group(1).strip(),
                "ig_user_id": match.group(2).strip(),
            }
        
        return None

handoff_service = HandoffService()
