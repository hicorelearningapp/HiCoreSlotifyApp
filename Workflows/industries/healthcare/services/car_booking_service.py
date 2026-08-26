from typing import List, Optional
import core.models as models
import core.schemas as schemas
from backend_app.core.database import db_session

class CarBookingService:
    def __init__(self):
        self.db = db_session

    def create_car_booking(self, booking_data: schemas.CarBookingCreate) -> models.CarBooking:
        existing = (
            self.db.query(models.CarBooking)
            .filter(
                models.CarBooking.Date == booking_data.Date,
                models.CarBooking.Status != "Cancelled"
            )
            .first()
        )
        if existing:
            raise ValueError("Already booked for this date")

        new_booking = models.CarBooking(**booking_data.model_dump())
        self.db.add(new_booking)
        self.db.commit()
        self.db.refresh(new_booking)
        return new_booking

    def list_car_bookings(self, skip: int = 0, limit: int = 100, status: Optional[str] = None) -> List[models.CarBooking]:
        query = self.db.query(models.CarBooking)
        if status:
            query = query.filter(models.CarBooking.Status == status)
        return query.order_by(models.CarBooking.Date.desc()).offset(skip).limit(limit).all()

    def get_car_booking(self, booking_id: str) -> Optional[models.CarBooking]:
        return self.db.query(models.CarBooking).filter(models.CarBooking.Id == booking_id).first()

    def update_car_booking(self, booking_id: str, booking_update: schemas.CarBookingUpdate) -> Optional[models.CarBooking]:
        booking = self.get_car_booking(booking_id)
        if not booking:
            return None
        update_data = booking_update.model_dump(exclude_unset=True)

        if "Date" in update_data and update_data["Date"] != booking.Date:
            existing = (
                self.db.query(models.CarBooking)
                .filter(
                    models.CarBooking.Date == update_data["Date"],
                    models.CarBooking.Status != "Cancelled",
                    models.CarBooking.Id != booking_id
                )
                .first()
            )
            if existing:
                raise ValueError("Already booked for this date")

        for key, value in update_data.items():
            setattr(booking, key, value)
        self.db.commit()
        self.db.refresh(booking)
        return booking

    def delete_car_booking(self, booking_id: str) -> bool:
        booking = self.get_car_booking(booking_id)
        if not booking:
            return False
        self.db.delete(booking)
        self.db.commit()
        return True
