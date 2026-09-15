from typing import Type
from core.sequence import Sequence, BaseSequenceManager
from industries.ecommerce.EcommerceSequenceManager import EcommerceSequenceManager
from industries.healthcare.HealthcareSequenceManager import HealthcareSequenceManager


class SequenceFactory:

    SEQUENCE_FACTORY = {
        "Ecommerce": EcommerceSequenceManager,
        "HealthcareDoctorAppointment": HealthcareSequenceManager,
    }

    @classmethod
    def GetSequenceManager(cls, industry: str) -> Type[BaseSequenceManager]:
        factory = cls.SEQUENCE_FACTORY.get(industry)
        if not factory:
            raise ValueError(f"No sequence factory registered for industry '{industry}'.")
        return factory

    