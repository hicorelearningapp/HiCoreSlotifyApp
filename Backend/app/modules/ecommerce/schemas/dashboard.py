from pydantic import BaseModel, Field
from typing import Optional

class SellerDashboardOut(BaseModel):
    TotalProducts: int = Field(0, description="Total number of products listed by the seller")
    TotalSales: float = Field(0.0, description="Total revenue/sales amount from orders for the seller")
    TotalOrders: int = Field(0, description="Total number of orders placed for the seller")

    class Config:
        from_attributes = True
