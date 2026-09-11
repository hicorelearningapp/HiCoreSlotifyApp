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
        target_dir = os.path.join(backend_dir, "industry_configs", "Ecommerce", "Products")
        os.makedirs(target_dir, exist_ok=True)
        return target_dir

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
        if clean:
            if clean.islower():
                return clean.capitalize()
            return clean
        return k

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
                    params[norm_k] = [x.strip() for x in v.split(",") if x.strip()] if "," in v else [v.strip()]
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
                            params[norm_k] = [x.strip() for x in v.split(",") if x.strip()] if "," in v else [v.strip()]

        # 2. Check direct top-level ProductData keys
        non_param_keys = ["options", "Options", "parameters", "Parameters", "variants", "Variants", "tags", "images", "photos", "specifications"]
        for key, val in p_data.items():
            if key in non_param_keys or str(key).lower() in [x.lower() for x in non_param_keys]:
                continue
            norm_k = cls._normalize_param_key(str(key))
            if norm_k not in params:
                if isinstance(val, list) and val:
                    params[norm_k] = [str(x).strip() for x in val if str(x).strip()]
                elif isinstance(val, str) and val.strip():
                    if "," in val:
                        params[norm_k] = [x.strip() for x in val.split(",") if x.strip()]
                    else:
                        params[norm_k] = [val.strip()]

        # 3. Check variants if options/parameters not yet populated
        raw_variants = p_data.get("variants") or p_data.get("Variants")
        if isinstance(raw_variants, list):
            for v in raw_variants:
                if not isinstance(v, dict):
                    continue
                var_opts = v.get("options") or v.get("Options")
                if isinstance(var_opts, dict):
                    for vk, vv in var_opts.items():
                        norm_k = cls._normalize_param_key(str(vk))
                        if vv is not None and str(vv).strip():
                            val_str = str(vv).strip()
                            if norm_k not in params:
                                params[norm_k] = []
                            if val_str not in params[norm_k]:
                                params[norm_k].append(val_str)

        return params

    @classmethod
    def _format_option_workflow(cls, opt_name: str, opt_vals: Any) -> str:
        if isinstance(opt_vals, list):
            vals_str = ",".join(str(v).strip() for v in opt_vals if str(v).strip() != "")
        elif isinstance(opt_vals, str):
            vals_str = opt_vals.strip()
        else:
            vals_str = str(opt_vals).strip() if opt_vals is not None else ""
        return f"GetParam;{opt_name};{vals_str}"

    @classmethod
    def build_greeting_flow(cls) -> List[str]:
        return ["GreetingWorkFlow"]

    @classmethod
    def build_get_param_flow(cls, product: Any, product_params: Dict[str, Any], is_booking: bool) -> List[str]:
        flow: List[str] = []
        param_order = ["Color", "Size", "Model", "Storage", "Ram", "Material", "Weight"]
        added_params = set()

        for p_name in param_order:
            if p_name in product_params:
                flow.append(cls._format_option_workflow(p_name, product_params[p_name]))
                added_params.add(p_name)

        for p_name in sorted(product_params.keys()):
            if p_name not in added_params:
                flow.append(cls._format_option_workflow(p_name, product_params[p_name]))
                added_params.add(p_name)

        if is_booking:
            flow.append("DateWorkFlow")
            flow.append("TimeSlotWorkFlow")

        flow.append("QuantityWorkFlow")
        return flow

    @classmethod
    def build_address_flow(cls, is_booking: bool) -> List[str]:
        return ["AddressWorkFlow"]

    @classmethod
    def build_order_flow(cls) -> List[str]:
        return ["OrderWorkFlow"]

    @classmethod
    def build_payment_flow(cls) -> List[str]:
        return ["PaymentWorkFlow"]

    @classmethod
    def build_confirm_flow(cls) -> List[str]:
        return ["ConfirmWorkFLow"]

    @classmethod
    def generate_product_workflow_config(
        cls,
        product: Any,
        db: Optional[Session] = None
    ) -> Optional[str]:
        """
        Generates or dynamically updates the workflow JSON config file for an ecommerce product.
        Structured with:
          - industry: "Ecommerce"
          - product_info
          - sequences: { "MainWorkSequence": [ ... ] }
        Saves strictly inside Backend/industry_configs/Ecommerce/Products/{product_id}.json.
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

            # 3. Build product workflow config containing industry, product_info and sequences
            product_config_data = {
                "industry": "Ecommerce",
                "product_info": product_info_dict,
                "sequences": {
                    "MainWorkSequence": product_sequence
                }
            }

            # 4. Write product ID file: {product_id}.json
            primary_file_path = None
            if product_id:
                product_file_path = os.path.join(backend_dir, f"{product_id}.json")
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
        Reads and returns the workflow .json configuration data for the given product ID.
        If file does not exist yet and db is provided, generates it on the fly.
        """
        backend_dir = cls.get_backend_configs_dir()
        file_path_json = os.path.join(backend_dir, f"{product_id}.json")
        file_path_txt = os.path.join(backend_dir, f"{product_id}.txt")

        # Also search in root Ecommerce folder for backwards compatibility if needed
        parent_dir = os.path.dirname(backend_dir)
        candidates = [
            file_path_json,
            file_path_txt,
            os.path.join(parent_dir, f"{product_id}.json"),
            os.path.join(parent_dir, f"{product_id}.txt")
        ]

        for file_path in candidates:
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
                    if os.path.exists(file_path_json):
                        with open(file_path_json, "r", encoding="utf-8") as f:
                            return json.load(f)
            except Exception as ex:
                print(f"[WorkflowConfigService] Error generating config on the fly: {ex}")

        return None


workflow_config_service = WorkflowConfigService()
