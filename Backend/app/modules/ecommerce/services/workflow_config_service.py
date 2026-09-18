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

    @staticmethod
    def _to_snake_case(name: str) -> str:
        s = str(name).strip()
        s = re.sub(r"[-\s]+", "_", s)
        s = re.sub(r"([a-z0-9])([A-Z])", r"\1_\2", s)
        s = re.sub(r"([A-Z]+)([A-Z][a-z])", r"\1_\2", s)
        s = re.sub(r"_+", "_", s.lower()).strip("_")
        return s

    @classmethod
    def _normalize_param_key(cls, key: str) -> str:
        k = str(key).strip()
        lower = k.lower().replace("_", "").replace("-", "").replace(" ", "")
        if lower in ["availablecolors", "colors", "colour", "colours", "availablecolours"]:
            return "Color"
        if lower in ["sizes", "availablesizes", "sizelist"]:
            return "Size"
        if lower in ["models", "availablemodels"]:
            return "Model"
        if lower in ["storage", "internalstorage", "rom"]:
            return "Storage"
        if lower in ["ram", "memory"]:
            return "Ram"
        if lower in ["weights", "weight"]:
            return "Weight"
        if lower in ["materials", "material"]:
            return "Material"
        if lower in ["fabrics", "fabric"]:
            return "Fabric"
        if lower in ["chainlengths", "chainlength"]:
            return "ChainLength"
        if lower in ["pendantdesigns", "pendantdesign"]:
            return "PendantDesign"
        if lower in ["careinstructions", "careinstruction"]:
            return "CareInstructions"
        if lower in ["sleeves", "sleeve"]:
            return "Sleeve"
        if lower in ["necks", "neck"]:
            return "Neck"
        if lower in ["fits", "fit"]:
            return "Fit"
        if lower in ["occasions", "occasion"]:
            return "Occasion"

        # Split PascalCase, snake_case, kebab-case, or spaced words
        clean = re.sub(r"[^a-zA-Z0-9_\-\s]", "", k).strip()
        if clean:
            split_words = re.split(r"[_\-\s]+|(?<=[a-z0-9])(?=[A-Z])", clean)
            return "".join(w.capitalize() for w in split_words if w)
        return k

    @classmethod
    def extract_parameters_and_details(cls, product: Any) -> tuple[Dict[str, List[str]], Dict[str, Any]]:
        """
        Extracts product parameters and categorizes them:
        - If a parameter has MULTIPLE selectable options (len > 1), it is returned in multiple_params (used for GetParam workflow).
        - If a parameter has a SINGLE option or is a static attribute (len <= 1), it is returned in single_details (used for product_info).
        """
        p_data = getattr(product, "ProductData", None) or {}
        if not isinstance(p_data, dict):
            p_data = {}

        candidate_params: Dict[str, List[str]] = {}
        extra_details: Dict[str, Any] = {}

        # 1. Check explicit 'options' / 'Options' / 'parameters' / 'Parameters' field
        raw_options = (
            p_data.get("options") or p_data.get("Options") or
            p_data.get("parameters") or p_data.get("Parameters")
        )
        if isinstance(raw_options, dict):
            for k, v in raw_options.items():
                norm_k = cls._normalize_param_key(str(k))
                if isinstance(v, list):
                    vals = [str(x).strip() for x in v if x is not None and str(x).strip()]
                elif isinstance(v, str) and v.strip():
                    vals = [x.strip() for x in v.split(",") if x.strip()] if "," in v else [v.strip()]
                elif v is not None and str(v).strip():
                    vals = [str(v).strip()]
                else:
                    vals = []
                if vals:
                    candidate_params[norm_k] = vals
        elif isinstance(raw_options, list):
            for opt in raw_options:
                if isinstance(opt, dict):
                    k = opt.get("name") or opt.get("Name") or opt.get("key") or opt.get("Key")
                    v = (
                        opt.get("values") or opt.get("Values") or
                        opt.get("options") or opt.get("Options") or
                        opt.get("value") or opt.get("Value") or []
                    )
                    if k:
                        norm_k = cls._normalize_param_key(str(k))
                        if isinstance(v, list):
                            vals = [str(x).strip() for x in v if x is not None and str(x).strip()]
                        elif isinstance(v, str) and v.strip():
                            vals = [x.strip() for x in v.split(",") if x.strip()] if "," in v else [v.strip()]
                        elif v is not None and str(v).strip():
                            vals = [str(v).strip()]
                        else:
                            vals = []
                        if vals:
                            candidate_params[norm_k] = vals

        # 2. Check variants
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
                            if norm_k not in candidate_params:
                                candidate_params[norm_k] = []
                            if val_str not in candidate_params[norm_k]:
                                candidate_params[norm_k].append(val_str)
                else:
                    for k, val in v.items():
                        if str(k).lower() in ["id", "variant_id", "sku", "price", "stock_quantity", "stock", "active", "image", "image_url"]:
                            continue
                        if val is not None and str(val).strip():
                            norm_k = cls._normalize_param_key(str(k))
                            val_str = str(val).strip()
                            if norm_k not in candidate_params:
                                candidate_params[norm_k] = []
                            if val_str not in candidate_params[norm_k]:
                                candidate_params[norm_k].append(val_str)

        # 3. Check direct top-level ProductData keys
        internal_keys = {
            "options", "parameters", "variants", "tags", "images", "photos", "image",
            "specifications", "highlights", "key_features", "features", "reel_id",
            "reel_link", "id", "product_id", "seller_id", "active", "sku", "sku_code",
            "stock", "stock_quantity", "stockquantity", "inventory", "inventory_quantity"
        }

        for key, val in p_data.items():
            k_lower = str(key).lower()
            if k_lower in internal_keys:
                if k_lower in ["highlights", "key_features", "features"] and val:
                    extra_details["highlights"] = val if isinstance(val, list) else [val]
                elif k_lower == "tags" and val:
                    extra_details["tags"] = val if isinstance(val, list) else [val]
                elif k_lower == "specifications" and isinstance(val, dict) and val:
                    extra_details["specifications"] = val
                continue

            if val is None or val == "" or val == []:
                continue

            norm_k = cls._normalize_param_key(str(key))
            if norm_k in candidate_params:
                continue

            if isinstance(val, list):
                clean_vals = [str(x).strip() for x in val if x is not None and str(x).strip()]
                if clean_vals:
                    candidate_params[norm_k] = clean_vals
            elif isinstance(val, str):
                s_val = val.strip()
                if s_val:
                    if "," in s_val:
                        split_vals = [x.strip() for x in s_val.split(",") if x.strip()]
                        if len(split_vals) > 1:
                            candidate_params[norm_k] = split_vals
                        else:
                            candidate_params[norm_k] = [s_val]
                    else:
                        candidate_params[norm_k] = [s_val]
            elif isinstance(val, (int, float, bool)):
                snake_k = cls._to_snake_case(str(key))
                extra_details[snake_k] = val
            elif isinstance(val, dict):
                snake_k = cls._to_snake_case(str(key))
                extra_details[snake_k] = val

        # Separate into multiple_option_params (for GetParam) vs single_option_details (for product_info)
        multiple_option_params: Dict[str, List[str]] = {}
        single_option_details: Dict[str, Any] = {}

        for p_name, vals in candidate_params.items():
            seen = set()
            unique_vals = []
            for item in vals:
                item_str = str(item).strip()
                if item_str and item_str not in seen:
                    seen.add(item_str)
                    unique_vals.append(item_str)

            if len(unique_vals) > 1:
                multiple_option_params[p_name] = unique_vals
            elif len(unique_vals) == 1:
                snake_k = cls._to_snake_case(p_name)
                single_option_details[snake_k] = unique_vals[0]

        for k, v in extra_details.items():
            if k not in single_option_details:
                single_option_details[k] = v

        return multiple_option_params, single_option_details

    @classmethod
    def extract_product_parameters(cls, product: Any) -> Dict[str, Any]:
        """
        Backwards-compatible helper to extract multiple-option parameters for a product.
        """
        multiple_params, _ = cls.extract_parameters_and_details(product)
        return multiple_params

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
        param_order = [
            "Color", "Size", "Model", "Storage", "Ram", "Material", "Weight",
            "ChainLength", "PendantDesign", "Fabric", "Fit", "Sleeve", "Neck", "Occasion"
        ]
        added_params = set()

        for p_name in param_order:
            if p_name in product_params:
                vals = product_params[p_name]
                if isinstance(vals, list) and len(vals) > 1:
                    flow.append(cls._format_option_workflow(p_name, vals))
                    added_params.add(p_name)
                elif isinstance(vals, str) and "," in vals:
                    flow.append(cls._format_option_workflow(p_name, vals))
                    added_params.add(p_name)

        for p_name in sorted(product_params.keys()):
            if p_name not in added_params:
                vals = product_params[p_name]
                if isinstance(vals, list) and len(vals) > 1:
                    flow.append(cls._format_option_workflow(p_name, vals))
                    added_params.add(p_name)
                elif isinstance(vals, str) and "," in vals:
                    flow.append(cls._format_option_workflow(p_name, vals))
                    added_params.add(p_name)

        if is_booking:
            flow.append("DateWorkFlow")
            flow.append("TimeSlotWorkFlow")

        flow.append("QuantityWorkFlow")
        return flow

    @classmethod
    def build_name_flow(cls) -> List[str]:
        return ["NameWorkflow"]

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
        return ["ConfirmWorkFlow"]

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

            # 2. Extract dynamic parameters (multiple options vs single details) and flow stages
            is_booking = cls._is_booking_service(product)
            multiple_params, single_details = cls.extract_parameters_and_details(product)

            greeting_flow = cls.build_greeting_flow()
            get_param_flow = cls.build_get_param_flow(product, multiple_params, is_booking)
            name_flow = cls.build_name_flow()
            address_flow = cls.build_address_flow(is_booking)
            order_flow = cls.build_order_flow()
            payment_flow = cls.build_payment_flow()
            confirm_flow = cls.build_confirm_flow()

            product_sequence = (
                greeting_flow +
                get_param_flow +
                name_flow +
                address_flow +
                order_flow +
                payment_flow +
                confirm_flow
            )

            # 3. Build customer-facing product info (excluding internal database/inventory/SKU fields)
            product_info_dict: Dict[str, Any] = {
                "name": product.ProductName,
                "category": product.Category,
                "price": float(product.Price or 0.0),
                "compare_at_price": float(product.CompareAtPrice) if product.CompareAtPrice is not None else None,
                "description": product.Description,
                "images": list(product.Images or []),
                "store_name": store_name if store_name != "our E-commerce store" else None
            }

            # Merge single-option details and attributes into product_info
            for k, v in single_details.items():
                if v is not None and v != "" and k not in product_info_dict:
                    product_info_dict[k] = v

            # Omit None values for cleaner customer display
            product_info_dict = {k: v for k, v in product_info_dict.items() if v is not None}

            # 4. Build product workflow config containing industry, product_info and sequences
            product_config_data = {
                "industry": "Ecommerce",
                "product_info": product_info_dict,
                "sequences": {
                    "MainWorkSequence": product_sequence
                }
            }

            # 5. Write product ID file: {product_id}.json
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
