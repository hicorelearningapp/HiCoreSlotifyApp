import os
import json
import re
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session


class WorkflowConfigService:
    @staticmethod
    def _clean_phone(phone: Optional[str]) -> Optional[str]:
        if not phone:
            return None
        clean = re.sub(r"\D", "", str(phone).strip())
        if clean.startswith("0") and len(clean) > 10:
            clean = clean[1:]
        return clean if clean else None

    @classmethod
    def get_backend_configs_dir(cls) -> str:
        # File: Backend/app/modules/ecommerce/services/workflow_config_service.py
        # 1: services, 2: ecommerce, 3: modules, 4: app, 5: Backend
        backend_dir = os.path.dirname(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
        )
        target_dir = os.path.join(backend_dir, "industry_configs", "ecommerce")
        os.makedirs(target_dir, exist_ok=True)
        return target_dir

    @classmethod
    @classmethod
    def _is_booking_service(cls, product: Any) -> bool:
        """
        Determines if the product is a booking, appointment, rental, or scheduled service.
        """
        combined = " ".join([
            str(product.ProductName or "").lower(),
            str(product.Category or "").lower(),
            str(product.Description or "").lower(),
        ])
        booking_keywords = [
            r"\bvehicle\b", r"\bcar rental\b", r"\bbike rental\b", r"\brental\b", r"\bbooking\b",
            r"\bappointment\b", r"\bslot\b", r"\btest drive\b",
            r"\bconsultation\b", r"\bevent booking\b", r"\bhall booking\b", r"\bhotel room\b",
            r"\broom booking\b", r"\bticket booking\b"
        ]
        return any(re.search(pattern, combined) for pattern in booking_keywords)

    @classmethod
    def _normalize_param_key(cls, key: str) -> str:
        k = str(key).strip()
        lower = k.lower()
        if lower in ["availablecolors", "available_colors", "colors", "colour", "colours", "availablecolours"]:
            return "Color"
        if lower in ["sizes", "availablesizes", "available_sizes", "size_list"]:
            return "Size"
        if lower in ["models", "availablemodels"]:
            return "Model"
        if lower in ["storage", "internal_storage", "rom"]:
            return "Storage"
        if lower in ["ram", "memory"]:
            return "Ram"
        if lower in ["weights", "weight"]:
            return "Weight"
        if lower in ["materials", "material"]:
            return "Material"
        clean = re.sub(r"[^a-zA-Z0-9]", "", k)
        return clean.capitalize() if clean else k

    @classmethod
    def extract_product_parameters(cls, product: Any) -> Dict[str, Any]:
        """
        Dynamically extracts all selectable parameters and options for a product.
        (e.g., Color, Size, Model, Storage, Ram, Material, Weight, etc.)
        """
        params: Dict[str, Any] = {}
        p_data = product.ProductData or {}
        if not isinstance(p_data, dict):
            p_data = {}

        # 1. Check explicit 'options' / 'Options' field
        raw_options = p_data.get("options") or p_data.get("Options")
        if isinstance(raw_options, dict):
            for k, v in raw_options.items():
                norm_k = cls._normalize_param_key(str(k))
                if isinstance(v, list) and v:
                    params[norm_k] = [str(x).strip() for x in v if str(x).strip()]
                elif isinstance(v, str) and v.strip():
                    params[norm_k] = [v.strip()]
        elif isinstance(raw_options, list):
            for opt in raw_options:
                if isinstance(opt, dict):
                    k = opt.get("name") or opt.get("Name")
                    v = opt.get("values") or opt.get("Values") or opt.get("options") or opt.get("Options") or []
                    if k:
                        norm_k = cls._normalize_param_key(str(k))
                        if isinstance(v, list) and v:
                            params[norm_k] = [str(x).strip() for x in v if str(x).strip()]
                        elif isinstance(v, str) and v.strip():
                            params[norm_k] = [v.strip()]

        # 2. Check list-based options in ProductData (e.g. AvailableColors, Sizes)
        selectable_keys = {
            "availablecolors", "available_colors", "colors", "color", "colour", "colours",
            "sizes", "size", "availablesizes", "models", "model",
            "ram", "storage", "weight", "weights", "material", "materials",
            "purity", "length"
        }
        non_option_keys = {
            "tags", "tag", "highlights", "highlight", "images", "image",
            "photos", "features", "key_features", "specifications", "sizechart", "size_chart",
            "internal_notes", "seo_keywords", "stock_quantity", "unit", "price", "variants", "options",
            "brand", "countryoforigin", "warranty", "certification", "hallmark", "washcare",
            "occasion", "pattern", "sleevetype", "necktype", "ingredients", "cookingtime",
            "storageinstructions", "shelflife", "bestfor", "rawmaterial", "foodtype", "ricetype",
            "grainlength", "aged", "vegetarian", "organic", "camera", "display", "battery",
            "charging", "connectivity", "simtype", "waterresistance", "operatingsystem", "processor",
            "wheeltype", "seatmaterial", "framematerial", "furnituretype", "jewellerytype",
            "stonetype", "goldweight", "clasptype", "adjustableheight", "armresttype", "backsupport",
            "headrest", "weightcapacity", "seatheight", "assemblyrequired", "gender", "fit"
        }

        # First pass: look for list-based options (e.g. AvailableColors, Sizes)
        for key, val in p_data.items():
            k_lower = str(key).lower()
            if k_lower in non_option_keys:
                continue
            norm_k = cls._normalize_param_key(str(key))
            if isinstance(val, list) and val:
                clean_vals = [str(x).strip() for x in val if str(x).strip()]
                if clean_vals and norm_k not in params:
                    params[norm_k] = clean_vals

        # Second pass: check specific selectable attributes if not already captured
        priority_scalar_keys = ["model", "ram", "storage", "color", "size", "material", "purity", "length", "weight"]
        for p_key in priority_scalar_keys:
            norm_k = cls._normalize_param_key(p_key)
            if norm_k in params:
                continue
            for key, val in p_data.items():
                if str(key).lower() == p_key:
                    if isinstance(val, str) and val.strip():
                        params[norm_k] = [val.strip()]
                    elif isinstance(val, (int, float)):
                        params[norm_k] = [str(val)]
                    break

        # 3. Check variants list for any option keys not yet captured
        raw_variants = p_data.get("variants") or p_data.get("Variants")
        if isinstance(raw_variants, list):
            for v in raw_variants:
                if isinstance(v, dict):
                    var_opts = v.get("options") or v.get("Options")
                    if isinstance(var_opts, dict):
                        for ok, ov in var_opts.items():
                            norm_ok = cls._normalize_param_key(str(ok))
                            if norm_ok not in params:
                                params[norm_ok] = []
                            if ov is not None and str(ov).strip():
                                clean_v = str(ov).strip()
                                if clean_v not in params[norm_ok]:
                                    params[norm_ok].append(clean_v)

        # 4. If no explicit options exist, infer natural parameters from category/name
        if not params:
            cat_lower = str(product.Category or "").lower()
            name_lower = str(product.ProductName or "").lower()
            if any(k in cat_lower or k in name_lower for k in ["t-shirt", "tshirt", "shirt", "clothing", "apparel", "saree"]):
                params["Color"] = ["Standard"]
                params["Size"] = ["Free Size"]
            elif any(k in cat_lower or k in name_lower for k in ["electronic", "headphone", "gadget", "phone"]):
                params["Color"] = ["Standard"]
                params["Model"] = ["Default"]
            elif any(k in cat_lower or k in name_lower for k in ["vehicle", "car", "rental", "booking"]):
                params["Model"] = ["Standard"]

        return params

    @classmethod
    def build_greeting_flow(cls) -> List[str]:
        """
        Step 1: Greeting Flow
        """
        return ["GreetingWorkFlow"]

    @classmethod
    def build_get_param_flow(cls, product: Any, params: Dict[str, Any], is_booking: bool) -> List[str]:
        """
        Step 2: Dynamic Get Parameter Flow based on the product.
        (e.g., T-Shirt: ColorWorkFlow, SizeWorkFlow, QuantityWorkFlow; Electronics: ColorWorkFlow, ModelWorkFlow, QuantityWorkFlow)
        """
        flow: List[str] = []

        if params:
            for param_name in params.keys():
                clean_param = re.sub(r"[^a-zA-Z0-9]", "", str(param_name)).capitalize()
                wf_name = f"{clean_param}WorkFlow"
                if wf_name not in flow:
                    flow.append(wf_name)
        else:
            flow.append("VariantWorkFlow")

        if is_booking:
            if "DateWorkFlow" not in flow:
                flow.append("DateWorkFlow")
        else:
            if "QuantityWorkFlow" not in flow:
                flow.append("QuantityWorkFlow")

        return flow

    @classmethod
    def build_address_flow(cls, is_booking: bool) -> List[str]:
        """
        Step 3: Address & Contact Flow
        """
        return ["AddressWorkFlow"]

    @classmethod
    def build_order_flow(cls) -> List[str]:
        """
        Step 4: Order Flow
        """
        return ["OrderWorkFlow"]

    @classmethod
    def build_payment_flow(cls) -> List[str]:
        """
        Step 5: Payment Flow
        """
        return ["PaymentWorkFlow"]

    @classmethod
    def build_confirm_flow(cls) -> List[str]:
        """
        Step 6: Confirm Flow
        """
        return ["ConfirmWorkFLow"]

    @classmethod
    def _get_sequence_name(cls, product: Any) -> str:
        """
        Creates a clean sequence name based on category or product name (e.g. TshirtOrderSequence, SareeOrderSequence).
        """
        name_candidate = product.Category or product.ProductName or "Product"
        clean_words = re.sub(r"[^a-zA-Z0-9\s]", "", str(name_candidate)).split()
        if not clean_words:
            return "WhatsAppResumeSequence"

        singular_words = []
        for w in clean_words[:3]:
            cw = w.capitalize()
            if cw.endswith("ies"):
                cw = cw[:-3] + "y"
            elif cw.endswith("s") and not cw.endswith("ss") and len(cw) > 3:
                cw = cw[:-1]
            singular_words.append(cw)

        joined = "".join(singular_words)
        if not joined.endswith("Sequence"):
            if not joined.endswith("Order"):
                joined = f"{joined}OrderSequence"
            else:
                joined = f"{joined}Sequence"
        return joined

    @classmethod
    def _get_welcome_message(cls, store_name: str, is_booking: bool, category_or_name: str) -> str:
        clean_store = store_name.strip() if store_name else "our store"
        clean_prod = category_or_name.strip() if category_or_name else ""

        if is_booking:
            if any(k in clean_prod.lower() for k in ["vehicle", "car", "bike"]):
                return f"Welcome to our Vehicle Booking Service! \ud83d\ude97"
            return f"Welcome to {clean_store}! \ud83d\ude97"

        if any(k in clean_prod.lower() for k in ["saree", "clothing", "tshirt", "t-shirt", "dress", "fashion"]):
            return f"Welcome to {clean_store}! \ud83d\udc57\u2728"

        if any(k in clean_prod.lower() for k in ["jewel", "ring", "gold", "silver", "diamond"]):
            return f"Welcome to {clean_store}! \ud83d\udc8d\u2728"

        if any(k in clean_prod.lower() for k in ["electronic", "phone", "gadget", "headphone"]):
            return f"Welcome to {clean_store}! \ud83d\udcf1\u26a1"

        return f"Welcome to {clean_store}! \ud83d\udecd\ufe0f"

    @classmethod
    def generate_product_workflow_config(
        cls,
        product: Any,
        db: Optional[Session] = None
    ) -> Optional[str]:
        """
        Generates or dynamically updates the workflow .txt config file for an ecommerce product.
        Structured with:
          - product_info (without parameters)
          - sequence (GreetingWorkFlow, dynamic GetParamWorkFlow, AddressWorkFlow, OrderWorkFlow, PaymentWorkFlow, ConfirmWorkFLow)
        Saves strictly inside Backend/industry_configs/ecommerce/{product_id}.txt.
        """
        try:
            seller_phone = None
            store_name = "our E-commerce store"

            # 1. Resolve seller business info if database session available
            if db and getattr(product, "SellerId", None):
                try:
                    import app.modules.doctor_appointment.models  # ensure models registered
                    from app.common.models.business import Business
                    business = db.query(Business).filter(Business.Id == product.SellerId).first()
                    if business:
                        phone_val = business.BusinessPhoneNumber or business.MobileNumber or getattr(business, "WhatsAppNumber", None)
                        seller_phone = cls._clean_phone(phone_val)
                        if business.BusinessName:
                            store_name = business.BusinessName
                except Exception as ex:
                    pass

            # Fallback: check if SellerId itself is a clean phone number
            if not seller_phone and getattr(product, "SellerId", None):
                clean_seller_id = cls._clean_phone(product.SellerId)
                if clean_seller_id and len(clean_seller_id) >= 7:
                    seller_phone = clean_seller_id
                else:
                    seller_phone = str(product.SellerId).strip()

            if not seller_phone:
                seller_phone = "default_ecommerce"

            product_id = str(product.Id) if getattr(product, "Id", None) else None
            backend_dir = cls.get_backend_configs_dir()

            # 2. Extract dynamic parameters and flow stages
            is_booking = cls._is_booking_service(product)
            product_params = cls.extract_product_parameters(product)

            greeting_flow = cls.build_greeting_flow()
            get_param_flow = cls.build_get_param_flow(product, product_params, is_booking)
            address_flow = cls.build_address_flow(is_booking)
            order_flow = cls.build_order_flow()
            payment_flow = cls.build_payment_flow()
            confirm_flow = cls.build_confirm_flow()

            product_sequence = (
                greeting_flow +
                get_param_flow +
                address_flow +
                order_flow +
                payment_flow +
                confirm_flow
            )

            product_info_dict = {
                "id": product_id,
                "name": product.ProductName,
                "category": product.Category,
                "price": float(product.Price or 0.0),
                "compare_at_price": float(product.CompareAtPrice) if product.CompareAtPrice is not None else None,
                "sku": product.Sku,
                "description": product.Description,
                "reel_link": product.ReelLink,
                "images": list(product.Images or []),
                "active": bool(product.Active)
            }

            # 3. Build product workflow config containing only product_info and sequence
            product_config_data = {
                "product_info": product_info_dict,
                "sequence": product_sequence
            }

            # 4. Write product ID file: {product_id}.txt
            primary_file_path = None
            if product_id:
                product_file_path = os.path.join(backend_dir, f"{product_id}.txt")
                with open(product_file_path, "w", encoding="utf-8") as f:
                    json.dump(product_config_data, f, indent=2)
                primary_file_path = product_file_path

            return primary_file_path
        except Exception as e:
            print(f"[WorkflowConfigService] Error generating workflow config: {e}")
            return None

    @classmethod
    def get_product_workflow_config(cls, product_id: str, db: Optional[Session] = None) -> Optional[Dict[str, Any]]:
        """
        Reads and returns the workflow .txt configuration data for the given product ID.
        If file does not exist yet and db is provided, generates it on the fly.
        """
        backend_dir = cls.get_backend_configs_dir()
        file_path = os.path.join(backend_dir, f"{product_id}.txt")
        if os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as ex:
                print(f"[WorkflowConfigService] Error reading config file {file_path}: {ex}")

        # If file doesn't exist yet but DB session is available, generate it on the fly
        if db:
            try:
                from app.modules.ecommerce.models.product import Product
                product = db.query(Product).filter(Product.Id == product_id).first()
                if product:
                    cls.generate_product_workflow_config(product, db)
                    if os.path.exists(file_path):
                        with open(file_path, "r", encoding="utf-8") as f:
                            return json.load(f)
            except Exception as ex:
                print(f"[WorkflowConfigService] Error generating config on the fly: {ex}")

        return None


workflow_config_service = WorkflowConfigService()
