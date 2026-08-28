from sqlalchemy.orm import Session
import app.common.models as models

class SystemService:
    @staticmethod
    def reset_database(db: Session) -> dict:
        """Clears all transactional data from the database while preserving configuration and doctor profiles."""
        try:
            # Delete data from non-doctor tables
            db.query(models.ConversationSession).delete()
            db.query(models.Payment).delete()
            db.query(models.Appointment).delete()
            db.query(models.Customer).delete()
            
            # Commit the changes
            db.commit()
            
            return {"status": "success", "message": "Database cleared successfully. Doctor configurations preserved."}
        except Exception as e:
            db.rollback()
            return {"status": "error", "message": str(e)}
