import datetime
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.modules.ecommerce.models.product import Product
from app.modules.ecommerce.models.order import Order

class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_seller_dashboard(self, seller_id: Optional[str] = None, year: Optional[int] = None) -> Dict[str, Any]:
        prod_query = self.db.query(Product)
        order_query = self.db.query(Order)

        if seller_id and seller_id.strip():
            prod_query = prod_query.filter(Product.SellerId == seller_id)
            order_query = order_query.filter(Order.SellerId == seller_id)

        total_products = prod_query.count()
        orders = order_query.order_by(Order.CreatedAt.asc()).all()

        months_list = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        # Initialize all 12 months
        orders_and_sales: Dict[str, Dict[str, Dict[str, Dict[str, Any]]]] = {m: {} for m in months_list}

        now = datetime.datetime.utcnow()

        for o in orders:
            created = o.CreatedAt or now
            if year is not None and created.year != year:
                continue

            month_key = months_list[created.month - 1]
            week_key = f"week{((created.day - 1) // 7) + 1}"
            date_key = f"{created.strftime('%A')}({created.strftime('%d.%m.%Y')})"

            if week_key not in orders_and_sales[month_key]:
                orders_and_sales[month_key][week_key] = {}

            if date_key not in orders_and_sales[month_key][week_key]:
                orders_and_sales[month_key][week_key][date_key] = {
                    "Orders": 0,
                    "Sales": 0.0
                }

            # Increment order count
            orders_and_sales[month_key][week_key][date_key]["Orders"] += 1

            # Sum sales if order is not cancelled/rejected
            is_valid_sale = (o.Status or "").strip().lower() not in ["cancelled", "canceled", "rejected"]
            if is_valid_sale:
                curr_sales = orders_and_sales[month_key][week_key][date_key]["Sales"]
                orders_and_sales[month_key][week_key][date_key]["Sales"] = round(curr_sales + float(o.Total or 0.0), 2)

        return {
            "TotalProducts": total_products,
            "OrdersAndSales": orders_and_sales
        }
