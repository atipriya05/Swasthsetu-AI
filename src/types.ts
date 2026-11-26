export type Language = 'en' | 'hi';

export type FacilityType = 'GOVT_HOSPITAL' | 'PHC' | 'CHC' | 'SPECIALIST_CLINIC';

export type Specialty =
  | 'General Physician'
  | 'Pediatrician'
  | 'Gynecologist'
  | 'Cardiologist'
  | 'Orthopedic'
  | 'Dermatologist';

export type RiskLevel = 'Green' | 'Yellow' | 'Red';

export interface HealthcareFacility {
  id: string;
  name: string;
  nameHi: string;
  type: FacilityType;
  lat: number;
  lng: number;
  distanceKm: number;
  travelTimeMins: number;
  address: string;
  addressHi: string;
  emergencyAvailable: boolean;
  bedsAvailable: number;
  totalBeds: number;
  doctorName: string;
  specialty: Specialty;
  contactNumber: string;
  rating: number;
  opdTimings: string;
  opdTimingsHi: string;
  services: string[];
  doctorAvailable?: boolean;
  currentWaitMins?: number;
}

export interface PatientProfile {
  id: string;
  name: string;
  nameHi: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  genderHi: string;
  mobile: string;
  abhaId: string;
  abhaAddress?: string;
  village: string;
  villageHi: string;
  district: string;
  state: string;
  bloodGroup: string;
  allergies: string[];
  emergencyContact: string;
}

export interface DoctorProfile {
  id: string;
  doctorId: string;
  name: string;
  nameHi?: string;
  qualification: string;
  specialty: Specialty;
  facilityName?: string;
  hospitalName?: string;
  hospitalNameHi?: string;
  registrationNo?: string;
  registrationNumber?: string;
  experienceYears: number;
  email: string;
  isAvailable: boolean;
}

export interface AITriageReport {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  village: string;
  languageInput: Language;
  rawInput: string;
  translatedInputEn: string;
  chiefComplaint: string;
  chiefComplaintHi: string;
  symptoms: string[];
  symptomsHi: string[];
  duration: string;
  durationHi: string;
  riskLevel: RiskLevel;
  riskReason: string;
  riskReasonHi: string;
  recommendedDepartment: string;
  recommendedDepartmentHi: string;
  preliminaryAdvice: string[];
  preliminaryAdviceHi: string[];
  vitalSignsObservation?: string;
  redFlags: string[];
  status: 'PENDING_REVIEW' | 'IN_CONSULTATION' | 'REVIEWED' | 'PRESCRIPTION_ISSUED';
  createdAt: string;
  audioUrl?: string;
  targetDoctorId?: string;
  targetFacilityId?: string;
}

export interface PrescribedMedicine {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  frequencyHi?: string;
  duration: string;
  instructions?: string;
  instructionsHi?: string;
}

export interface Prescription {
  id: string;
  appointmentId?: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  abhaId?: string;
  doctorId?: string;
  doctorName: string;
  doctorSpecialty?: string;
  doctorRegistrationNo?: string;
  facilityName: string;
  date: string;
  diagnosis: string;
  diagnosisHi?: string;
  chiefComplaint?: string;
  medicines: PrescribedMedicine[];
  labTests?: string[];
  labTestsRecommended?: string[];
  labTestsRecommendedHi?: string[];
  advice?: string;
  adviceHi?: string;
  dietaryAdvice?: string;
  dietaryAdviceHi?: string;
  followUpDate?: string;
  reportId?: string;
}

export interface Appointment {
  id: string;
  tokenNumber: number;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender?: string;
  patientPhone: string;
  relationship?: string;
  facilityId: string;
  facilityName: string;
  facilityNameHi?: string;
  doctorId: string;
  doctorName: string;
  specialty?: string;
  doctorSpecialty?: string;
  appointmentDate: string;
  timeSlot: string;
  status: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'CANCELLED';
  triageReportId?: string;
  riskLevel?: RiskLevel;
  triageRiskLevel?: RiskLevel;
  chiefComplaint?: string;
  estimatedWaitMinutes: number;
  createdAt?: string;
}

export interface VaccinationRecord {
  id: string;
  vaccineName: string;
  vaccineNameHi?: string;
  beneficiaryName?: string;
  category?: string;
  dose?: string;
  dueDate?: string;
  administeredDate?: string;
  dateAdministered?: string;
  facilityName: string;
  status: 'COMPLETED' | 'UPCOMING' | 'OVERDUE';
  recommendedAge?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  language: Language;
  timestamp: string;
  quickActions?: { label: string; action: string }[];
  isVoice?: boolean;
}
