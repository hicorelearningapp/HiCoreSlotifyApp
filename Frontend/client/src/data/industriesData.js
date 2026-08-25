// Asset imports for industry icons (adjust relative paths as per your project)
import hospitalIcon from '../assets/WeServe/Hospitals.png';
import diagnosticIcon from '../assets/WeServe/diagnostic.png';
import eventIcon from '../assets/WeServe/EventService.png';
import beautyIcon from '../assets/WeServe/BeautySaloon.png';
import automobileIcon from '../assets/WeServe/Automobile.png';
import clinicIcon from '../assets/WeServe/Clinics.png';
import fitnessIcon from '../assets/WeServe/Fitness.png';
import restaurantIcon from '../assets/WeServe/Restaurants.png';
import legalIcon from '../assets/WeServe/LegalServices.png';
import petCareIcon from '../assets/WeServe/PetCare.png';
import CorporateIcon from '../assets/WeServe/Corporate.png';
import EducationIcon from '../assets/WeServe/Education.png';
import RealEstateIcon from '../assets/WeServe/RealEstate.png';
import TravelAgenciesIcon from '../assets/WeServe/Travel.png';
import GovernmentIcon from '../assets/WeServe/GovernmentService.png';
import HomeServiceIcon from '../assets/WeServe/HomeService.png';
import BusinessConsultingIcon from '../assets/WeServe/BusinessConsulting.png';
import FinancialIcon from '../assets/WeServe/Financial.png';
import WellnessIcon from '../assets/WeServe/Wellness.png';
import HospitalityIcon from '../assets/WeServe/Hospitality.png';
import RepairIcon from '../assets/WeServe/Repair.png';
// Asset imports for featured detail images
import hospitalImg from '../assets/WeServe/Hospitals-bg.png';
import diagnosticImg from '../assets/WeServe/Diagnose.jpg';
import eventImg from '../assets/WeServe/Event-service.png';
import beautyImg from '../assets/WeServe/beauty-saloon.png';
import automobileImg from '../assets/WeServe/Auto-mobile.png';
import clinicImg from '../assets/WeServe/health-clinics.png';
import fitnessImg from '../assets/WeServe/gym.png';
import restaurantImg from '../assets/WeServe/restaurant.png';
import legalImg from '../assets/WeServe/legal-service.png';
import petCareImg from '../assets/WeServe/Pet-Care.png';
import CorporateImg from '../assets/WeServe/corporate-image.png';
import EducationImg from '../assets/WeServe/education-image.png';
import RealEstateImg from '../assets/WeServe/real-estate.png';
import TravelAgencyImg from '../assets/WeServe/travel-agency.png';
import GovernmentServiceImg from '../assets/WeServe/government-service.png';
import HomeServiceImg from '../assets/WeServe/home-service.png';
import BusinessConsultingImg from '../assets/WeServe/business-consulting.png';
import FinancialServiceImg from '../assets/WeServe/financial-service.png';
import WellnessImg from '../assets/WeServe/wellness-image.png';
import RepairImg from '../assets/WeServe/repair-service.png';
import HospitalityImg from '../assets/WeServe/hospitality-image.png';
import ecommerceIcon from "../assets/WeServe/ecommerceIcon.png";
import ecommerceImg from "../assets/WeServe/ecommerceImg.png";


export const industriesData = [
  {
    id: 1,
    title: "HOSPITALS",
    label: "Hospitals",
    icon: hospitalIcon,
    path: "/doctor",
    image: hospitalImg,
    description:
      "Manage patient appointments with intelligent scheduling and automated communication.",
    bookingType: "Booking: Doctor Appointments",
    tags: ["Multi-speciality Hospitals", "Medical Centers"],
    ctaText: "Manage Doctor Appointments",
    status: "Ongoing",
  },
  {
    id: 2,
    title: "E-COMMERCE",
    label: "E-commerce",
    icon: ecommerceIcon,
    path: "/ecommerce",
    image: ecommerceImg,
    description:
      "Manage products, inventory, orders, customers, and sales across your online store.",
    bookingType: "Selling: Products & Orders",
    tags: ["Online Stores", "Retail & Shopping"],
    ctaText: "Manage Products & Orders",
    status: "Ongoing",
  },
  // {
  //   id: 2,
  //   title: 'DIAGNOSTIC CENTERS',
  //   label: 'Diagnostic Centers',
  //   icon: diagnosticIcon,
  //   image: diagnosticImg,
  //   description: 'Streamline lab test bookings, health checkups, and report dispatches easily.',
  //   bookingType: 'Booking: Test Appointments',
  //   tags: ['Scan Centers', 'Blood Labs & Diagnostic Labs'],
  //   ctaText: 'Manage Test Appointments',
  //   status: "Pending"
  // },
  // {
  //   id: 3,
  //   title: 'EVENT SERVICES',
  //   label: 'Event Services',
  //   icon: eventIcon,
  //   image: eventImg,
  //   description: 'Plan client meetings and event consultations without scheduling conflicts.',
  //   bookingType: 'Booking: Meeting Booking',
  //   tags: ['Wedding Planners', 'Photographers & Decorators'],
  //   ctaText: 'Manage Client Meetings',
  //   status: "Pending"
  // },
  // {
  //   id: 4,
  //   title: 'BEAUTY & SALON',
  //   label: 'Beauty & Salon',
  //   icon: beautyIcon,
  //   image: beautyImg,
  //   description: 'Deliver seamless beauty appointments and personalized customer experiences.',
  //   bookingType: 'Booking: Beauty Service Booking',
  //   tags: ['Beauty Parlours', 'Hair Salons', 'Nail Studios & Spas'],
  //   ctaText: 'Manage Salon Bookings',
  //   status: "Pending"
  // },
  // {
  //   id: 5,
  //   title: 'AUTOMOBILE',
  //   label: 'Automobile',
  //   icon: automobileIcon,
  //   image: automobileImg,
  //   description: 'Organize vehicle servicing with hassle-free booking and service scheduling.',
  //   bookingType: 'Booking: Vehicle Service Booking',
  //   tags: ['Car & Bike Service Centers', 'Car Wash'],
  //   ctaText: 'Manage Service Bookings',
  //   status: "Pending"
  // },
  // {
  //   id: 6,
  //   title: 'CLINICS',
  //   label: 'Clinics',
  //   icon: clinicIcon,
  //   image: clinicImg,
  //   description: 'Simplify patient scheduling and reduce waiting time with smart appointment management.',
  //   bookingType: 'Booking: Patient Appointments',
  //   tags: ['Dental', 'Eye', 'Skin & Physiotherapy Clinics'],
  //   ctaText: 'Manage Patient Appointments',
  //   status: "Pending"
  // },
  // {
  //   id: 7,
  //   title: 'FITNESS',
  //   label: 'Fitness',
  //   icon: fitnessIcon,
  //   image: fitnessImg,
  //   description: 'Schedule training sessions and manage members with ease.',
  //   bookingType: 'Booking: Training Sessions',
  //   tags: ['Gyms', 'Yoga Centers & Personal Trainers'],
  //   ctaText: 'Manage Training Sessions',
  //   status: "Pending"
  // },
  // {
  //   id: 8,
  //   title: 'RESTAURANTS',
  //   label: 'Restaurants',
  //   icon: restaurantIcon,
  //   image: restaurantImg,
  //   description: 'Offer instant table reservations and enhance guest experiences.',
  //   bookingType: 'Booking: Table Reservations',
  //   tags: ['Restaurants', 'Cafes & Fine Dining'],
  //   ctaText: 'Manage Table Reservations',
  //   status: "Pending"
  // },
  // {
  //   id: 9,
  //   title: 'LEGAL SERVICES',
  //   label: 'Legal Services',
  //   icon: legalIcon,
  //   image: legalImg,
  //   description: 'Handle legal consultations with organized appointment scheduling.',
  //   bookingType: 'Booking: Consultation Booking',
  //   tags: ['Lawyers', 'Consultants & Law Firms'],
  //   ctaText: 'Manage Client Consultations',
  //   status: "Pending"
  // },
  // {
  //   id: 10,
  //   title: 'PET CARE',
  //   label: 'Pet Care',
  //   icon: petCareIcon,
  //   image: petCareImg,
  //   description: 'Make pet care appointments simple, organized, and convenient.',
  //   bookingType: 'Booking: Pet Appointments',
  //   tags: ['Veterinary Clinics', 'Grooming & Boarding Centers'],
  //   ctaText: 'Manage Pet Appointments',
  //   status: "Pending"
  // },
  // {
  //   id: 11,
  //   title: 'CORPORATE OFFICES',
  //   label: 'Corporate',
  //   icon: CorporateIcon,
  //   image: CorporateImg,
  //   description: 'Schedule interviews, meetings, and employee appointments effortlessly.',
  //   bookingType: 'Booking: Meeting & Interview Scheduling',
  //   tags: ['HR Teams & Corporate Offices'],
  //   ctaText: 'Manage Meetings & Interviews',
  //   status: "Pending"
  // },
  // {
  //   id: 12,
  //   title: 'Education',
  //   label: 'Education Centers',
  //   icon: EducationIcon,
  //   image: EducationImg,
  //   description: 'Manage admissions, counseling sessions, and student appointments efficiently.',
  //   bookingType: 'Booking: Admission & Counseling',
  //   tags: ['Colleges', 'Coaching & Training Institutes'],
  //   ctaText: 'Manage Admissions & Counseling',
  //   status: "Pending"
  // },
  // {
  //   id: 13,
  //   title: 'REAL ESTATE',
  //   label: 'Real Estate',
  //   icon: RealEstateIcon,
  //   image: RealEstateImg,
  //   description: 'Simplify property visits and client meetings with smart scheduling.',
  //   bookingType: 'Booking: Site Visit Booking',
  //   tags: ['Builders', 'Property Dealers & Agencies'],
  //   ctaText: 'Manage Property Visits',
  //   status: "Pending"
  // },
  // {
  //   id: 14,
  //   title: 'TRAVEL AGENCIES',
  //   label: 'Travel Agency',
  //   icon: TravelAgenciesIcon,
  //   image: TravelAgencyImg,
  //   description: 'Manage travel consultations and bookings with complete convenience.',
  //   bookingType: 'Booking: Travel Consultation',
  //   tags: ['Tour Operators & Visa Consultants'],
  //   ctaText: 'Manage Travel Consultations',
  //   status: "Pending"
  // },
  // {
  //   id: 15,
  //   title: 'GOVERNMENT SERVICES',
  //   label: 'GOVERNMENT SERVICES',
  //   icon: GovernmentIcon,
  //   image: GovernmentServiceImg,
  //   description: 'Digitize citizen services with smart token and appointment  convenience.',
  //   bookingType: 'Booking: Token Booking',
  //   tags: ['Passport Agents & E-Seva Centers'],
  //   ctaText: 'Manage Citizen Bookings',
  //   status: "Pending"
  // },
  // {
  //   id: 16,
  //   title: 'HOME SERVICES',
  //   label: 'HOME SERVICES',
  //   icon: HomeServiceIcon,
  //   image: HomeServiceImg,
  //   description: 'Enable customers to book trusted home services in just a few clicks.',
  //   bookingType: 'Booking: Service Booking',
  //   tags: ['Electricians', 'Plumbers','AC & Cleaning Services'],
  //   ctaText: 'Manage Service Bookings',
  //   status: "Pending"
  // },
  // {
  //   id: 17,
  //   title: 'BUSINESS CONSULTING',
  //   label: 'BUSINESS CONSULTING',
  //   icon: BusinessConsultingIcon,
  //   image: BusinessConsultingImg,
  //   description: 'Manage admissions, counseling sessions, and student appointments.',
  //   bookingType: 'Booking: Admission & Counseling',
  //   tags: ['CAs', 'Auditors', 'Tax & Business Consultants'],
  //   ctaText: 'Manage Client Meetings',
  //   status: "Pending"
  // },
  // {
  //   id: 18,
  //   title: 'FINANCIAL SERVICES',
  //   label: 'FINANCIAL SERVICES',
  //   icon: FinancialIcon,
  //   image: FinancialServiceImg,
  //   description: 'Schedule customer meetings with secure and efficient appointment management.',
  //   bookingType: 'Booking: Customer Meetings',
  //   tags: ['Banks', 'Insurance Agents & Financial Advisors'],
  //   ctaText: 'Manage Customer Meetings',
  //   status: "Pending"
  // },
  // {
  //   id: 19,
  //   title: 'WELLNESS',
  //   label: 'WELLNESS',
  //   icon: WellnessIcon,
  //   image: WellnessImg,
  //   description: 'Create stress-free therapy and wellness bookings for your clients. convenience.',
  //   bookingType: 'Booking: Therapy Booking',
  //   tags: ['Wellness Clinics', 'Massage Centers & Spas'],
  //   ctaText: 'Manage Therapy Bookings',
  //   status: "Pending"
  // },
  // {
  //   id: 20,
  //   title: 'HOSPITALITY',
  //   label: 'HOSPITALITY',
  //   icon: HospitalityIcon,
  //   image: HospitalityImg,
  //   description: 'Simplify room reservations and guest booking management.',
  //   bookingType: 'Booking: Room Reservations',
  //   tags: ['Hotels', 'Resorts & Guest Houses'],
  //   ctaText: 'Manage Repair Appointments',
  //   status: "Pending"
  // },
  // {
  //   id: 21,
  //   title: 'REPAIR SERVICES',
  //   label: 'REPAIR SERVICES',
  //   icon: RepairIcon,
  //   image: RepairImg,
  //   description: 'Manage repair requests with organized scheduling and timely updates.',
  //   bookingType: 'Booking: Repair Appointments',
  //   tags: ['Mobile', 'Laptop & Appliance Repair Centers'],
  //   ctaText: 'Manage Repair Appointments',
  //   status: "Pending"
  // },
];