from pydantic import BaseModel, Field
from typing import Dict, Any

class DayOrdersSales(BaseModel):
    Orders: int = Field(0, description="Total orders count for the day")
    Sales: float = Field(0.0, description="Total sales amount for the day")

    class Config:
        from_attributes = True

class SellerDashboardOut(BaseModel):
    TotalProducts: int = Field(0, description="Total number of products listed by the seller")
    OrdersAndSales: Dict[str, Dict[str, Dict[str, DayOrdersSales]]] = Field(
        default_factory=dict,
        description="Hierarchical orders and sales breakdown: Month -> Week -> Day(Date) -> {Orders, Sales}"
    )

    class Config:
        from_attributes = True
