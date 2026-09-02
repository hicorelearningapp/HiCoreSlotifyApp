import datetime
from typing import Optional, Dict, Any, List, Set
from sqlalchemy.orm import Session
from app.modules.ecommerce.models.order import Order, OrderItem
from app.modules.ecommerce.models.product import Product

MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

MONTH_MAP = {
    "jan": 1, "january": 1, "1": 1, "01": 1,
    "feb": 2, "february": 2, "2": 2, "02": 2,
    "mar": 3, "march": 3, "3": 3, "03": 3,
    "apr": 4, "april": 4, "4": 4, "04": 4,
    "may": 5, "5": 5, "05": 5,
    "jun": 6, "june": 6, "6": 6, "06": 6,
    "jul": 7, "july": 7, "7": 7, "07": 7,
    "aug": 8, "august": 8, "8": 8, "08": 8,
    "sep": 9, "september": 9, "9": 9, "09": 9,
    "oct": 10, "october": 10, "10": 10,
    "nov": 11, "november": 11, "11": 11,
    "dec": 12, "december": 12, "12": 12,
}

WEEK_MAP = {
    "week1": 1, "1": 1, "w1": 1, "week 1": 1,
    "week2": 2, "2": 2, "w2": 2, "week 2": 2,
    "week3": 3, "3": 3, "w3": 3, "week 3": 3,
    "week4": 4, "4": 4, "w4": 4, "week 4": 4,
    "week5": 5, "5": 5, "w5": 5, "week 5": 5,
}

class ReportService:
    def __init__(self, db: Session):
        self.db = db

    def _format_growth(self, current: float, previous: float) -> str:
        if previous > 0:
            growth = ((current - previous) / previous) * 100
            sign = "+" if growth > 0 else ""
            return f"{sign}{growth:.1f}%"
        elif current > 0:
            return "+100.0%"
        else:
            return "0.0%"

    def get_report(
        self,
        seller_id: Optional[str] = None,
        year: Optional[int] = None,
        period: Optional[str] = None,
        month: Optional[str] = None,
        week: Optional[str] = None,
        day: Optional[str] = None
    ) -> Dict[str, Any]:
        now = datetime.datetime.utcnow()

        # Parse target filters
        target_year: Optional[int] = year
        target_month: Optional[int] = None
        target_week: Optional[int] = None
        target_day: Optional[str] = None

        if month and month.strip():
            target_month = MONTH_MAP.get(month.strip().lower())

        if week and week.strip():
            target_week = WEEK_MAP.get(week.strip().lower())

        if day and day.strip():
            target_day = day.strip().lower()

        # Handle quick period shortcut if specific month/week/day not supplied
        period_norm = (period or "").strip().lower()
        if not (month and month.strip()) and not (week and week.strip()) and not (day and day.strip()) and period_norm:
            if period_norm in ["day", "daily", "today", "date"]:
                target_day = now.strftime('%A').lower()
                target_month = now.month
                target_week = ((now.day - 1) // 7) + 1
                target_year = now.year
                period_label = "Day"
            elif period_norm in ["week", "weekly", "this_week"]:
                target_week = ((now.day - 1) // 7) + 1
                target_month = now.month
                target_year = now.year
                period_label = "Week"
            elif period_norm in ["month", "monthly", "this_month"]:
                target_month = now.month
                target_year = now.year
                period_label = "Month"
            else:
                period_label = "AllTime"
        else:
            label_parts = []
            if target_year is not None:
                label_parts.append(str(target_year))
            if target_month is not None and 1 <= target_month <= 12:
                label_parts.append(MONTH_NAMES[target_month - 1])
            if target_week is not None:
                label_parts.append(f"week{target_week}")
            if target_day is not None:
                label_parts.append(target_day.capitalize())
            period_label = " - ".join(label_parts) if label_parts else "AllTime"

        # Query all orders for the seller
        order_query = self.db.query(Order)
        if seller_id and seller_id.strip():
            order_query = order_query.filter(Order.SellerId == seller_id)

        all_orders = order_query.order_by(Order.CreatedAt.desc()).all()

        matching_orders: List[Order] = []
        prev_matching_orders: List[Order] = []

        # Determine previous period comparison target for growth rates
        prev_year = (target_year - 1) if target_year is not None else None
        prev_month = (target_month - 1) if (target_month is not None and target_month > 1) else (12 if target_month == 1 else None)
        prev_week = (target_week - 1) if (target_week is not None and target_week > 1) else None

        for o in all_orders:
            created = o.CreatedAt or now
            o_year = created.year
            o_month = created.month
            o_week = ((created.day - 1) // 7) + 1
            o_day_name = created.strftime('%A').lower()
            o_day_abbr = created.strftime('%a').lower()
            o_date_str = created.strftime('%d.%m.%Y')
            o_date_iso = str(created.date())

            # Check if order matches current filter
            match = True
            if target_year is not None and o_year != target_year:
                match = False
            if target_month is not None and o_month != target_month:
                match = False
            if target_week is not None and o_week != target_week:
                match = False
            if target_day is not None:
                if target_day not in [o_day_name, o_day_abbr, o_date_str, o_date_iso]:
                    match = False

            if match:
                matching_orders.append(o)

            # Check if order matches previous period comparison
            prev_match = False
            if target_year is not None and target_month is None and target_week is None and target_day is None:
                # YoY comparison
                if o_year == prev_year:
                    prev_match = True
            elif target_month is not None:
                if (target_year is None or o_year == target_year) and o_month == prev_month:
                    if target_week is None or o_week == target_week:
                        if target_day is None or target_day in [o_day_name, o_day_abbr, o_date_str, o_date_iso]:
                            prev_match = True
                elif target_month == 1 and prev_year is not None and o_year == prev_year and o_month == 12:
                    prev_match = True
            elif target_week is not None:
                if (target_year is None or o_year == target_year) and o_week == prev_week:
                    if target_day is None or target_day in [o_day_name, o_day_abbr, o_date_str, o_date_iso]:
                        prev_match = True
            else:
                # Default 30-day window comparison
                if (now - datetime.timedelta(days=60)) <= created < (now - datetime.timedelta(days=30)):
                    prev_match = True

            if prev_match:
                prev_matching_orders.append(o)

        # 1. Compute summary and revenueOverview for matching_orders
        curr_revenue = 0.0
        curr_orders_count = len(matching_orders)
        curr_customers: Set[str] = set()
        curr_products_sold = 0

        # revenueOverview adapts to the timeframe requested:
        # - AllTime / Year: Month-wise ("Jan".."Dec")
        # - Month (or specific month): Week-wise ("week1".."week5")
        # - Week / Day: Day-wise ("Wednesday(02.09.2026)")
        revenue_overview: Dict[str, Dict[str, Any]] = {}

        if (period_label in ["AllTime", str(target_year)]) and not target_month and not target_week and not target_day:
            revenue_overview = {m: {"Orders": 0, "Sales": 0.0} for m in MONTH_NAMES}
            for o in matching_orders:
                created = o.CreatedAt or now
                month_key = MONTH_NAMES[created.month - 1]
                revenue_overview[month_key]["Orders"] += 1
                is_valid = (o.Status or "").strip().lower() not in ["cancelled", "canceled", "rejected"]
                if is_valid:
                    curr_s = revenue_overview[month_key]["Sales"]
                    revenue_overview[month_key]["Sales"] = round(curr_s + float(o.Total or 0.0), 2)

        elif (period_label == "Month" or (target_month is not None and target_week is None and target_day is None)):
            weeks_list = ["week1", "week2", "week3", "week4", "week5"]
            revenue_overview = {w: {"Orders": 0, "Sales": 0.0} for w in weeks_list}
            for o in matching_orders:
                created = o.CreatedAt or now
                week_key = f"week{((created.day - 1) // 7) + 1}"
                if week_key in revenue_overview:
                    revenue_overview[week_key]["Orders"] += 1
                    is_valid = (o.Status or "").strip().lower() not in ["cancelled", "canceled", "rejected"]
                    if is_valid:
                        curr_s = revenue_overview[week_key]["Sales"]
                        revenue_overview[week_key]["Sales"] = round(curr_s + float(o.Total or 0.0), 2)

        else:
            for o in sorted(matching_orders, key=lambda x: x.CreatedAt or now):
                created = o.CreatedAt or now
                date_key = f"{created.strftime('%A')}({created.strftime('%d.%m.%Y')})"

                if date_key not in revenue_overview:
                    revenue_overview[date_key] = {
                        "Orders": 0,
                        "Sales": 0.0
                    }

                revenue_overview[date_key]["Orders"] += 1

                is_valid = (o.Status or "").strip().lower() not in ["cancelled", "canceled", "rejected"]
                order_total = float(o.Total or 0.0)

                if is_valid:
                    curr_sales = revenue_overview[date_key]["Sales"]
                    revenue_overview[date_key]["Sales"] = round(curr_sales + order_total, 2)

        product_stats: Dict[str, Dict[str, Any]] = {}
        recent_sales: List[Dict[str, Any]] = []

        for o in matching_orders:
            created = o.CreatedAt or now
            cust_id = o.CustomerPhone or o.CustomerEmail or o.CustomerId or o.CustomerName or o.Id
            if cust_id:
                curr_customers.add(cust_id)

            is_valid = (o.Status or "").strip().lower() not in ["cancelled", "canceled", "rejected"]
            order_total = float(o.Total or 0.0)

            if is_valid:
                curr_revenue += order_total

            item_names = []
            for item in (o.Items or []):
                qty = item.Quantity or 1
                item_price = float(item.TotalPrice or (qty * (item.UnitPrice or 0.0)))
                p_name = item.ProductName or "Product"
                item_names.append(p_name)

                if is_valid:
                    curr_products_sold += qty

                    p_key = item.ProductId or p_name
                    if p_key not in product_stats:
                        cat = "General"
                        if item.Product and item.Product.Category:
                            cat = item.Product.Category
                        elif item.ItemData and isinstance(item.ItemData, dict) and item.ItemData.get("Category"):
                            cat = item.ItemData.get("Category")
                        product_stats[p_key] = {
                            "ProductName": p_name,
                            "Category": cat,
                            "UnitSold": 0,
                            "Revenue": 0.0,
                            "curr_revenue": 0.0,
                            "prev_revenue": 0.0
                        }

                    product_stats[p_key]["UnitSold"] += qty
                    product_stats[p_key]["Revenue"] = round(product_stats[p_key]["Revenue"] + item_price, 2)
                    product_stats[p_key]["curr_revenue"] += item_price

            if len(recent_sales) < 10:
                recent_sales.append({
                    "OrdeId": o.OrderNumber or o.Id,
                    "CustomerName": o.CustomerName or "Customer",
                    "product": ", ".join(item_names) if item_names else "Product",
                    "Amount": round(order_total, 2),
                    "Status": o.Status or "Pending",
                    "Date": f"{created.strftime('%A')}({created.strftime('%d.%m.%Y')})"
                })

        # 2. Compute previous metrics for growth rates
        prev_revenue = 0.0
        prev_orders_count = len(prev_matching_orders)
        prev_customers: Set[str] = set()
        prev_products_sold = 0

        for o in prev_matching_orders:
            cust_id = o.CustomerPhone or o.CustomerEmail or o.CustomerId or o.CustomerName or o.Id
            if cust_id:
                prev_customers.add(cust_id)

            is_valid = (o.Status or "").strip().lower() not in ["cancelled", "canceled", "rejected"]
            if is_valid:
                prev_revenue += float(o.Total or 0.0)

            for item in (o.Items or []):
                qty = item.Quantity or 1
                item_price = float(item.TotalPrice or (qty * (item.UnitPrice or 0.0)))
                p_name = item.ProductName or "Product"
                if is_valid:
                    prev_products_sold += qty
                    p_key = item.ProductId or p_name
                    if p_key in product_stats:
                        product_stats[p_key]["prev_revenue"] += item_price

        # Build Top Products list
        sorted_prods = sorted(product_stats.values(), key=lambda x: (x["Revenue"], x["UnitSold"]), reverse=True)[:5]
        top_products_list = []
        for p in sorted_prods:
            top_products_list.append({
                "ProductName": p["ProductName"],
                "Category": p["Category"],
                "UnitSold": p["UnitSold"],
                "Revenue": p["Revenue"],
                "Revenuegrowth": self._format_growth(p["curr_revenue"], p["prev_revenue"])
            })

        return {
            "Period": period_label,
            "summary": {
                "Revenue": round(curr_revenue, 2),
                "RevenueGrowth": self._format_growth(curr_revenue, prev_revenue),
                "Orders": curr_orders_count,
                "OrdersGrowth": self._format_growth(curr_orders_count, prev_orders_count),
                "Customers": len(curr_customers),
                "CustomersGrowth": self._format_growth(len(curr_customers), len(prev_customers)),
                "ProductsSold": curr_products_sold,
                "ProductsSoldGrowth": self._format_growth(curr_products_sold, prev_products_sold)
            },
            "revenueOverview": revenue_overview,
            "TopProducts": top_products_list,
            "RecentSales": recent_sales
        }
