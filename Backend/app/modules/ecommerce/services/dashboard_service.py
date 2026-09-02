from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.modules.ecommerce.models.product import Product
from app.modules.ecommerce.models.order import Order

class DashboardService:
    def __init__(self, db: Session):
        self.db = db

    def get_seller_dashboard(self, seller_id: Optional[str] = None) -> Dict[str, Any]:
        prod_query = self.db.query(Product)
        order_query = self.db.query(Order)

        if seller_id and seller_id.strip():
            prod_query = prod_query.filter(Product.SellerId == seller_id)
            order_query = order_query.filter(Order.SellerId == seller_id)

        total_products = prod_query.count()
        orders = order_query.all()
        total_orders = len(orders)

        # Sum of order totals for valid orders (excluding cancelled/rejected)
        total_sales = sum(
            float(o.Total or 0.0) for o in orders
            if (o.Status or "").strip().lower() not in ["cancelled", "canceled", "rejected"]
        )

        return {
            "TotalProducts": total_products,
            "TotalSales": round(float(total_sales), 2),
            "TotalOrders": total_orders
        }
