import {
  HealthcareFacility,
  PatientProfile,
  DoctorProfile,
  AITriageReport,
  Prescription,
  Appointment,
  VaccinationRecord
} from '../types';

export const MOCK_PATIENT: PatientProfile = {
  id: 'pat-001',
  name: 'Rameshwar Lal Patel',
  nameHi: 'रामेश्वर लाल पटेल',
  age: 58,
  gender: 'Male',
  genderHi: 'पुरुष',
  mobile: '9876543210',
  abhaId: '91-4829-1029-4820',
  abhaAddress: 'rameshwar.patel@abdm',
  village: 'Padariya Village, Block Panagar',
  villageHi: 'पड़रिया गाँव, ब्लॉक पनागर',
  district: 'Jabalpur',
  state: 'Madhya Pradesh',
  bloodGroup: 'B+',
  allergies: ['Penicillin (पेनिसिलिन)'],
  emergencyContact: '+91 98765 00000 (Son - Manoj Patel)'
};

export const MOCK_DOCTOR: DoctorProfile = {
  id: 'doc-001',
  doctorId: 'DOC-MP-8842',
  name: 'Dr. Rajesh Kumar Patel',
  nameHi: 'डॉ. राजेश कुमार पटेल',
  qualification: 'MBBS, MD (General Medicine)',
  specialty: 'General Physician',
  facilityName: 'Panagar Primary Health Centre (PHC), Jabalpur',
  hospitalName: 'Panagar Primary Health Centre (PHC), Jabalpur',
  hospitalNameHi: 'पनागर प्राथमिक स्वास्थ्य केंद्र (PHC), जबलपुर',
  registrationNo: 'MPMC-49201',
  registrationNumber: 'MPMC-49201',
  experienceYears: 14,
  email: 'dr.rajesh.jbp@mp.gov.in',
  isAvailable: true
};

export const MOCK_SPECIALISTS: DoctorProfile[] = [
  MOCK_DOCTOR,
  {
    id: 'doc-002',
    doctorId: 'DOC-MP-3319',
    name: 'Dr. Sunita Verma',
    nameHi: 'डॉ. सुनीता वर्मा',
    qualification: 'MBBS, MS (Obstetrics & Gynecology)',
    specialty: 'Gynecologist',
    facilityName: 'Victoria District Hospital Jabalpur (Seth Govind Das)',
    hospitalName: 'Victoria District Hospital Jabalpur (Seth Govind Das)',
    hospitalNameHi: 'विक्टोरिया जिला अस्पताल जबलपुर (सेठ गोविंद दास)',
    registrationNo: 'MPMC-38192',
    registrationNumber: 'MPMC-38192',
    experienceYears: 12,
    email: 'dr.sunita.victoria@mp.gov.in',
    isAvailable: true
  },
  {
    id: 'doc-003',
    doctorId: 'DOC-MP-7721',
    name: 'Dr. Amit Patel',
    nameHi: 'डॉ. अमित पटेल',
    qualification: 'MBBS, DCH (Pediatrics)',
    specialty: 'Pediatrician',
    facilityName: 'Sihora Community Health Centre (CHC), Jabalpur',
    hospitalName: 'Sihora Community Health Centre (CHC), Jabalpur',
    hospitalNameHi: 'सिहोरा सामुदायिक स्वास्थ्य केंद्र (CHC), जबलपुर',
    registrationNo: 'MPMC-55120',
    registrationNumber: 'MPMC-55120',
    experienceYears: 9,
    email: 'dr.amit.sihora@mp.gov.in',
    isAvailable: true
  },
  {
    id: 'doc-004',
    doctorId: 'DOC-MP-9904',
    name: 'Dr. Priya Nair',
    nameHi: 'डॉ. प्रिया नायर',
    qualification: 'MBBS, MD, DM (Cardiology)',
    specialty: 'Cardiologist',
    facilityName: 'Netaji Subhash Chandra Bose Medical College & Hospital (NSCB MCH)',
    hospitalName: 'Netaji Subhash Chandra Bose Medical College & Hospital (NSCB MCH)',
    hospitalNameHi: 'नेताजी सुभाषचंद्र बोस मेडिकल कॉलेज एवं अस्पताल जबलपुर',
    registrationNo: 'MPMC-66014',
    registrationNumber: 'MPMC-66014',
    experienceYears: 16,
    email: 'dr.priya.nscbmch@mp.gov.in',
    isAvailable: false
  }
];

export const MOCK_FACILITIES: HealthcareFacility[] = [
  {
    id: 'fac-001',
    name: 'Panagar Primary Health Centre (PHC)',
    nameHi: 'पनागर प्राथमिक स्वास्थ्य केंद्र (PHC)',
    type: 'PHC',
    lat: 23.2974,
    lng: 79.9861,
    distanceKm: 2.4,
    travelTimeMins: 8,
    address: 'Near Old Bus Stand, Katni Road, Block Panagar, Jabalpur (M.P.)',
    addressHi: 'पुराने बस स्टैंड के पास, कटनी रोड, ब्लॉक पनागर, जबलपुर (म.प्र.)',
    emergencyAvailable: true,
    bedsAvailable: 8,
    totalBeds: 12,
    doctorName: 'Dr. Rajesh Kumar Patel',
    specialty: 'General Physician',
    contactNumber: '+91 761 284102',
    rating: 4.6,
    opdTimings: '08:00 AM – 02:00 PM (Emergency 24x7)',
    opdTimingsHi: 'सुबह 08:00 – दोपहर 02:00 (आपातकालीन 24x7)',
    services: [
      'General OPD & Telemedicine',
      'Maternal Health & ANC Clinic',
      'Mission Indradhanush Immunization',
      'Jan Aushadhi Generic Pharmacy',
      'Rapid Malaria & Blood Sugar Screening'
    ],
    doctorAvailable: true,
    currentWaitMins: 12
  },
  {
    id: 'fac-002',
    name: 'Sihora Community Health Centre (CHC)',
    nameHi: 'सिहोरा सामुदायिक स्वास्थ्य केंद्र (सिविल अस्पताल)',
    type: 'CHC',
    lat: 23.49,
    lng: 80.11,
    distanceKm: 18.5,
    travelTimeMins: 28,
    address: 'National Highway 30, Tehsil Sihora, Jabalpur District (M.P.)',
    addressHi: 'राष्ट्रीय राजमार्ग 30, तहसील सिहोरा, जिला जबलपुर (म.प्र.)',
    emergencyAvailable: true,
    bedsAvailable: 24,
    totalBeds: 50,
    doctorName: 'Dr. Amit Patel',
    specialty: 'Pediatrician',
    contactNumber: '+91 7624 230114',
    rating: 4.5,
    opdTimings: '08:30 AM – 03:00 PM',
    opdTimingsHi: 'सुबह 08:30 – दोपहर 03:00',
    services: [
      '24x7 Delivery & Maternity Ward',
      'Pediatric Care & Nutrition Centre (NRC)',
      'Digital X-Ray & Ultrasonography',
      'Emergency Oxygen & Trauma Stabilisation',
      'Ayushman Bharat Arogya Counter'
    ],
    doctorAvailable: true,
    currentWaitMins: 18
  },
  {
    id: 'fac-003',
    name: 'Victoria District Hospital Jabalpur (Seth Govind Das)',
    nameHi: 'विक्टोरिया जिला अस्पताल जबलपुर (सेठ गोविंद दास)',
    type: 'GOVT_HOSPITAL',
    lat: 23.161,
    lng: 79.935,
    distanceKm: 14.8,
    travelTimeMins: 30,
    address: 'Hospital Square, Civil Lines, Near Ghanta Ghar, Jabalpur (M.P.) 482001',
    addressHi: 'अस्पताल चौराहा, सिविल लाइंस, घंटाघर के पास, जबलपुर (म.प्र.) 482001',
    emergencyAvailable: true,
    bedsAvailable: 62,
    totalBeds: 250,
    doctorName: 'Dr. Sunita Verma & Dr. Priya Nair',
    specialty: 'Gynecologist',
    contactNumber: '+91 761 2620025',
    rating: 4.7,
    opdTimings: '08:00 AM – 04:00 PM (Emergency 24x7)',
    opdTimingsHi: 'सुबह 08:00 – शाम 04:00 (आपातकालीन 24x7)',
    services: [
      '24x7 Critical ICU & Trauma Care',
      'Cardiology, ECG & Cardiac Monitoring',
      'Advanced Gynecology & NICU Unit',
      'Dialysis Centre & CT Scan Facility',
      'Comprehensive Pathology & Blood Bank'
    ],
    doctorAvailable: true,
    currentWaitMins: 25
  },
  {
    id: 'fac-004',
    name: 'Netaji Subhash Chandra Bose Medical College & Hospital (NSCB MCH)',
    nameHi: 'नेताजी सुभाषचंद्र बोस मेडिकल कॉलेज एवं अस्पताल जबलपुर',
    type: 'GOVT_HOSPITAL',
    lat: 23.1469,
    lng: 79.8841,
    distanceKm: 19.2,
    travelTimeMins: 36,
    address: 'Medical College Road, Garha, Jabalpur (M.P.) 482003',
    addressHi: 'मेडिकल कॉलेज रोड, गढ़ा, जबलपुर (म.प्र.) 482003',
    emergencyAvailable: true,
    bedsAvailable: 118,
    totalBeds: 950,
    doctorName: 'Prof. Dr. Priya Nair & Senior Medical Faculty',
    specialty: 'Cardiologist',
    contactNumber: '+91 761 2370951',
    rating: 4.8,
    opdTimings: '08:00 AM – 04:00 PM (Casualty 24x7)',
    opdTimingsHi: 'सुबह 08:00 – शाम 04:00 (आपातकालीन 24x7)',
    services: [
      'Level-1 Apex Trauma & Emergency Wing',
      'Interventional Cardiology & Cath Lab',
      'Multi-specialty Surgical Theatres',
      'Oncology, Neurology & Nephrology OPD',
      'Central Government Empaneled AB-PMJAY Apex Care'
    ],
    doctorAvailable: true,
    currentWaitMins: 35
  },
  {
    id: 'fac-005',
    name: 'Patan Community Health Centre (CHC)',
    nameHi: 'पाटन सामुदायिक स्वास्थ्य केंद्र (CHC)',
    type: 'CHC',
    lat: 23.284,
    lng: 79.702,
    distanceKm: 28.0,
    travelTimeMins: 42,
    address: 'Tendukheda Road, Block Patan, Jabalpur District (M.P.) 483113',
    addressHi: 'तेन्दूखेड़ा रोड, ब्लॉक पाटन, जिला जबलपुर (म.प्र.) 483113',
    emergencyAvailable: true,
    bedsAvailable: 14,
    totalBeds: 30,
    doctorName: 'Dr. S.K. Mishra',
    specialty: 'General Physician',
    contactNumber: '+91 761 283220',
    rating: 4.3,
    opdTimings: '08:30 AM – 03:00 PM',
    opdTimingsHi: 'सुबह 08:30 – दोपहर 03:00',
    services: [
      'Rural Emergency Care',
      'Maternal & Child Health Care',
      'General OPD Consultations',
      'Essential Lab Diagnostics',
      'Free Pharmacy Distribution'
    ],
    doctorAvailable: true,
    currentWaitMins: 15
  },
  {
    id: 'fac-006',
    name: 'Ayushman Arogya Mandir (Sub-Centre Padariya)',
    nameHi: 'आयुष्मान आरोग्य मंदिर (उप-केंद्र पड़रिया, पनागर)',
    type: 'PHC',
    lat: 23.275,
    lng: 79.965,
    distanceKm: 1.2,
    travelTimeMins: 5,
    address: 'Near Gram Panchayat Bhawan, Padariya, Panagar Block, Jabalpur (M.P.)',
    addressHi: 'ग्राम पंचायत भवन के पास, पड़रिया, पनागर ब्लॉक, जबलपुर (म.प्र.)',
    emergencyAvailable: false,
    bedsAvailable: 3,
    totalBeds: 4,
    doctorName: 'Smt. Anita Patel (Community Health Officer)',
    specialty: 'General Physician',
    contactNumber: '+91 94251 77410',
    rating: 4.4,
    opdTimings: '09:00 AM – 01:00 PM',
    opdTimingsHi: 'सुबह 09:00 – दोपहर 01:00',
    services: [
      'NCD Screening (Hypertension & Diabetes)',
      'Antenatal Checkups & Nutrition Advice',
      'Preventive Health Counseling',
      'Essential Generic Medicines Distribution'
    ],
    doctorAvailable: false,
    currentWaitMins: 8
  }
];

export const MOCK_TRIAGE_REPORTS: AITriageReport[] = [
  {
    id: 'tr-001',
    patientId: 'pat-001',
    patientName: 'Rameshwar Lal Patel',
    patientAge: 58,
    patientGender: 'Male',
    patientPhone: '9876543210',
    village: 'Padariya Village, Panagar',
    languageInput: 'hi',
    rawInput: 'मुझे तीन दिन से तेज बुखार है, ठंड लग रही है और सिर में बहुत भारी दर्द हो रहा है।',
    translatedInputEn:
      'Patient reports high fever for 3 days with chills, rigors, and severe frontal headache.',
    chiefComplaint: 'High-Grade Fever with Chills and Headache',
    chiefComplaintHi: 'तेज बुखार, कंपकंपी और सिर में भारी दर्द',
    symptoms: [
      'Fever (102°F recorded)',
      'Chills and shivering',
      'Severe headache',
      'Generalized body ache',
      'Loss of appetite'
    ],
    symptomsHi: [
      'तेज बुखार (102°F)',
      'कंपकंपी और ठंड लगना',
      'सिर में तेज दर्द',
      'बदन दर्द',
      'भूख न लगना'
    ],
    duration: '3 Days',
    durationHi: '3 दिन',
    riskLevel: 'Yellow',
    riskReason:
      'Sustained fever for more than 72 hours warrants clinical evaluation and rapid malaria/dengue screening at Panagar Primary Health Centre.',
    riskReasonHi:
      '3 दिन से लगातार बुखार व कंपकंपी के कारण पनागर प्राथमिक स्वास्थ्य केंद्र में मलेरिया व डेंगू जांच आवश्यक है।',
    recommendedDepartment: 'General Medicine (PHC OPD Panagar)',
    recommendedDepartmentHi: 'सामान्य चिकित्सा विभाग (पनागर PHC ओपीडी)',
    preliminaryAdvice: [
      'Maintain hydration with boiled water and Oral Rehydration Salts (ORS).',
      'Paracetamol 500 mg may be taken after meals if temperature exceeds 100°F.',
      'Avoid self-medicating with NSAIDs such as Ibuprofen or Aspirin prior to physician review.',
      'Visit Panagar PHC today for rapid blood smear and NS1 antigen testing.'
    ],
    preliminaryAdviceHi: [
      'उबला हुआ गुनगुना पानी और ओआरएस (ORS) का घोल पर्याप्त मात्रा में पिएं।',
      'बुखार 100°F से अधिक होने पर भोजन के बाद पैरासिटामोल 500mg ली जा सकती है।',
      'चिकित्सक के परामर्श के बिना दर्द निवारक दवाओं का सेवन न करें।',
      'मलेरिया व डेंगू जांच हेतु आज ही पनागर प्राथमिक स्वास्थ्य केंद्र जाएं।'
    ],
    vitalSignsObservation:
      'Reported temperature 102°F; no dyspnea reported; conscious and oriented.',
    redFlags: ['Fever persisting beyond 72 hours', 'Rigors with severe malaise'],
    status: 'PENDING_REVIEW',
    createdAt: 'Today, 08:30 AM',
    targetDoctorId: 'doc-001',
    targetFacilityId: 'fac-001'
  },
  {
    id: 'tr-002',
    patientId: 'pat-002',
    patientName: 'Sunita Devi Patel',
    patientAge: 26,
    patientGender: 'Female',
    patientPhone: '9876511223',
    village: 'Umaria, Block Panagar',
    languageInput: 'hi',
    rawInput:
      'मेरी 6 महीने की गर्भावस्था है और आज सुबह से चक्कर आ रहे हैं तथा पैरों में हल्की सूजन है।',
    translatedInputEn:
      '26-year-old female, 26 weeks pregnant, experiencing dizziness and mild bilateral pedal edema since morning.',
    chiefComplaint: 'Second-Trimester Dizziness and Pedal Edema',
    chiefComplaintHi: 'छठे माह की गर्भावस्था में चक्कर और पैरों में सूजन',
    symptoms: ['Dizziness / lightheadedness', 'Mild bilateral ankle swelling', 'Fatigue'],
    symptomsHi: ['चक्कर आना', 'पैरों व टखनों में हल्की सूजन', 'थकान'],
    duration: '1 Day',
    durationHi: 'आज सुबह से',
    riskLevel: 'Yellow',
    riskReason:
      'Second-trimester dizziness and pedal swelling require prompt blood pressure and urine albumin screening to rule out pre-eclampsia.',
    riskReasonHi:
      'गर्भावस्था में चक्कर और सूजन के लिए तत्काल रक्तचाप (BP) और मूत्र परीक्षण आवश्यक है।',
    recommendedDepartment: 'Obstetrics & Gynecology (ANC Clinic Panagar)',
    recommendedDepartmentHi: 'प्रसूति एवं महिला रोग विभाग (मातृ सुरक्षा पनागर)',
    preliminaryAdvice: [
      'Rest in the left lateral position for 30 minutes to support placental circulation.',
      'Stay adequately hydrated with clean drinking water.',
      'Report to Panagar PHC or Victoria District Hospital today for antenatal blood pressure and hemoglobin evaluation.'
    ],
    preliminaryAdviceHi: [
      'बाईं करवट लेटकर 30 मिनट विश्राम करें।',
      'पर्याप्त स्वच्छ पानी पिएं।',
      'निःशुल्क प्रसव पूर्व जांच व रक्तचाप परीक्षण हेतु आज ही पनागर PHC अथवा विक्टोरिया अस्पताल जाएं।'
    ],
    redFlags: ['Sudden visual disturbance or upper abdominal pain'],
    status: 'IN_CONSULTATION',
    createdAt: 'Today, 09:15 AM',
    targetDoctorId: 'doc-001',
    targetFacilityId: 'fac-001'
  },
  {
    id: 'tr-003',
    patientId: 'pat-003',
    patientName: 'Kailash Nath Tiwari',
    patientAge: 64,
    patientGender: 'Male',
    patientPhone: '9876599887',
    village: 'Sihora Rural, Jabalpur',
    languageInput: 'hi',
    rawInput:
      'सीने में भारीपन महसूस हो रहा है और बायीं भुजा में दर्द जा रहा है तथा पसीना आ रहा है।',
    translatedInputEn:
      '64-year-old male reporting acute retrosternal chest pressure radiating to left arm with diaphoresis.',
    chiefComplaint: 'Acute Chest Pressure with Left Arm Radiation and Sweating',
    chiefComplaintHi: 'सीने में भारी दबाव, बायीं भुजा में दर्द और पसीना',
    symptoms: [
      'Retrosternal chest tightness',
      'Left arm radiating pain',
      'Profuse sweating',
      'Mild dyspnea'
    ],
    symptomsHi: [
      'सीने में जकड़न व भारीपन',
      'बाएं हाथ में दर्द का फैलना',
      'अत्यधिक पसीना',
      'सांस लेने में तकलीफ'
    ],
    duration: '45 Minutes',
    durationHi: '45 मिनट',
    riskLevel: 'Red',
    riskReason:
      'High-priority emergency: Symptoms are consistent with potential Acute Coronary Syndrome. Immediate 108 ambulance transfer to Victoria District Hospital or NSCB Medical College Jabalpur is required.',
    riskReasonHi:
      'अति आपातकालीन स्थिति: हृदय संबंधी गंभीर संकट। तत्काल 108 एम्बुलेंस द्वारा विक्टोरिया जिला अस्पताल अथवा मेडिकल कॉलेज जबलपुर में रेफर करें।',
    recommendedDepartment: 'Emergency Medicine / Cardiology (Victoria Hospital / NSCB MCH)',
    recommendedDepartmentHi: 'आपातकालीन चिकित्सा / हृदय रोग विभाग (विक्टोरिया अस्पताल / मेडिकल कॉलेज जबलपुर)',
    preliminaryAdvice: [
      'Avoid all physical exertion and remain seated in an upright supported position.',
      'Contact 108 emergency ambulance immediately for transfer to Victoria Hospital or NSCB Medical College Jabalpur.',
      'Do not attempt to drive or walk unaccompanied to the facility.'
    ],
    preliminaryAdviceHi: [
      'किसी भी प्रकार का शारीरिक श्रम न करें और आराम से बैठें।',
      'विक्टोरिया अस्पताल या मेडिकल कॉलेज जबलपुर स्थानांतरण हेतु तुरंत 108 एम्बुलेंस को कॉल करें।',
      'अकेले पैदल या वाहन चलाकर अस्पताल जाने का प्रयास न करें।'
    ],
    redFlags: ['Acute crushing chest pressure', 'Diaphoresis with radiation to arm or jaw'],
    status: 'PENDING_REVIEW',
    createdAt: 'Today, 10:05 AM',
    targetDoctorId: 'doc-001',
    targetFacilityId: 'fac-001'
  }
];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001',
    tokenNumber: 14,
    patientId: 'pat-001',
    patientName: 'Rameshwar Lal Patel',
    patientAge: 58,
    patientGender: 'Male',
    patientPhone: '9876543210',
    facilityId: 'fac-001',
    facilityName: 'Panagar Primary Health Centre (PHC)',
    facilityNameHi: 'पनागर प्राथमिक स्वास्थ्य केंद्र (PHC), जबलपुर',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Kumar Patel',
    doctorSpecialty: 'General Physician',
    appointmentDate: '29 Aug 2026',
    timeSlot: '10:30 AM – 11:00 AM',
    status: 'WAITING',
    triageReportId: 'tr-001',
    riskLevel: 'Yellow',
    triageRiskLevel: 'Yellow',
    chiefComplaint: 'High-grade fever with chills (3 days)',
    estimatedWaitMinutes: 12,
    createdAt: '08:35 AM'
  },
  {
    id: 'apt-002',
    tokenNumber: 12,
    patientId: 'pat-002',
    patientName: 'Sunita Devi Patel',
    patientAge: 26,
    patientGender: 'Female',
    patientPhone: '9876511223',
    facilityId: 'fac-001',
    facilityName: 'Panagar Primary Health Centre (PHC)',
    facilityNameHi: 'पनागर प्राथमिक स्वास्थ्य केंद्र (PHC), जबलपुर',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Kumar Patel',
    doctorSpecialty: 'General Physician',
    appointmentDate: '29 Aug 2026',
    timeSlot: '10:00 AM – 10:30 AM',
    status: 'IN_CONSULTATION',
    triageReportId: 'tr-002',
    riskLevel: 'Yellow',
    triageRiskLevel: 'Yellow',
    chiefComplaint: 'Second-trimester dizziness and swelling',
    estimatedWaitMinutes: 0,
    createdAt: '09:20 AM'
  },
  {
    id: 'apt-003',
    tokenNumber: 11,
    patientId: 'pat-004',
    patientName: 'Master Aarav Patel',
    patientAge: 4,
    patientGender: 'Male',
    patientPhone: '9876544332',
    facilityId: 'fac-001',
    facilityName: 'Panagar Primary Health Centre (PHC)',
    facilityNameHi: 'पनागर प्राथमिक स्वास्थ्य केंद्र (PHC), जबलपुर',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Kumar Patel',
    doctorSpecialty: 'General Physician',
    appointmentDate: '29 Aug 2026',
    timeSlot: '09:30 AM – 10:00 AM',
    status: 'COMPLETED',
    riskLevel: 'Green',
    triageRiskLevel: 'Green',
    chiefComplaint: 'Seasonal cough and wheeze',
    estimatedWaitMinutes: 0,
    createdAt: '09:00 AM'
  }
];

export const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'RX-MP-2026-081',
    patientId: 'pat-001',
    patientName: 'Rameshwar Lal Patel',
    patientAge: 58,
    patientGender: 'Male',
    abhaId: '91-4829-1029-4820',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Kumar Patel (MBBS, MD)',
    doctorSpecialty: 'Senior Medical Officer — General Medicine',
    doctorRegistrationNo: 'MPMC-49201',
    facilityName: 'Panagar Primary Health Centre (PHC), Govt. of Madhya Pradesh',
    date: '14 Jul 2026',
    diagnosis: 'Essential Hypertension (Stage 1) and Upper Respiratory Tract Infection',
    diagnosisHi: 'उच्च रक्तचाप (स्टेज 1) एवं ऊपरी श्वसन तंत्र संक्रमण',
    chiefComplaint: 'Headache, neck stiffness, and dry cough for 5 days',
    medicines: [
      {
        id: 'med-1',
        name: 'Tab. Amlodipine 5mg (Jan Aushadhi)',
        dosage: '1 tablet once daily',
        frequency: '1-0-0 (Morning after breakfast)',
        frequencyHi: 'सुबह नाश्ते के बाद 1 गोली',
        duration: '30 Days',
        instructions: 'Take at the same time daily. Monitor blood pressure weekly at Panagar PHC.',
        instructionsHi: 'प्रतिदिन सुबह एक ही समय पर लें। सप्ताह में एक बार पनागर PHC पर रक्तचाप की जांच कराएं।'
      },
      {
        id: 'med-2',
        name: 'Tab. Paracetamol 500mg (Jan Aushadhi)',
        dosage: '1 tablet as needed (temperature > 100°F)',
        frequency: '1-0-1 (Maximum 3 doses per day)',
        frequencyHi: 'आवश्यकतानुसार सुबह-शाम भोजन के बाद',
        duration: '5 Days',
        instructions: 'Take only after food with warm water.',
        instructionsHi: 'हमेशा भोजन के बाद गुनगुने पानी से लें।'
      },
      {
        id: 'med-3',
        name: 'Syrup Dextromethorphan (Jan Aushadhi)',
        dosage: '10 ml',
        frequency: '1-1-1 (Thrice daily with warm water)',
        frequencyHi: 'दिन में 3 बार गुनगुने पानी के साथ',
        duration: '5 Days',
        instructions: 'Gargle with warm saline water twice daily.',
        instructionsHi: 'दिन में 2 बार हल्के गर्म नमक के पानी से गरारे करें।'
      }
    ],
    labTests: [
      'Complete Blood Count (CBC)',
      'Serum Creatinine and Lipid Profile',
      'Routine Urine Examination'
    ],
    labTestsRecommended: [
      'Complete Blood Count (CBC)',
      'Serum Creatinine and Lipid Profile',
      'Routine Urine Examination'
    ],
    labTestsRecommendedHi: [
      'सीबीसी (संपूर्ण रक्त जांच)',
      'सीरम क्रिएटिनिन व लिपिड प्रोफाइल',
      'सामान्य मूत्र परीक्षण'
    ],
    advice:
      'Limit dietary sodium to less than 1 teaspoon per day. Avoid fried foods and walk 30 minutes daily in the village.',
    adviceHi:
      'भोजन में नमक की मात्रा कम रखें। तले हुए खाद्य पदार्थों से बचें और प्रतिदिन 30 मिनट टहलें।',
    dietaryAdvice:
      'Limit dietary sodium to less than 1 teaspoon per day. Avoid fried foods and walk 30 minutes daily in the village.',
    dietaryAdviceHi:
      'भोजन में नमक की मात्रा कम रखें। तले हुए खाद्य पदार्थों से बचें और प्रतिदिन 30 मिनट टहलें।',
    followUpDate: '14 Aug 2026 (or earlier if BP exceeds 150/95 at Panagar PHC)'
  }
];

export const MOCK_VACCINATIONS: VaccinationRecord[] = [
  {
    id: 'vac-01',
    vaccineName: 'COVID-19 Precaution Dose',
    vaccineNameHi: 'कोविड-19 एहतियाती खुराक',
    beneficiaryName: 'Rameshwar Lal Patel',
    category: 'Adult Immunization',
    dose: '3rd Dose (Booster)',
    dueDate: '18 Nov 2023',
    administeredDate: '18 Nov 2023',
    dateAdministered: '18 Nov 2023',
    facilityName: 'Panagar PHC, Jabalpur',
    status: 'COMPLETED',
    recommendedAge: 'Adult (18+ years)'
  },
  {
    id: 'vac-02',
    vaccineName: 'Tetanus and Adult Diphtheria (Td)',
    vaccineNameHi: 'टिटनेस एवं वयस्क डिप्थीरिया (Td)',
    beneficiaryName: 'Rameshwar Lal Patel',
    category: 'Adult Booster',
    dose: '0.5 ml IM',
    dueDate: '05 Jan 2025',
    administeredDate: '05 Jan 2025',
    dateAdministered: '05 Jan 2025',
    facilityName: 'Panagar PHC, Jabalpur',
    status: 'COMPLETED',
    recommendedAge: 'Every 10 Years'
  },
  {
    id: 'vac-03',
    vaccineName: 'Seasonal Influenza Vaccine',
    vaccineNameHi: 'मौसमी इन्फ्लुएंजा टीका',
    beneficiaryName: 'Rameshwar Lal Patel',
    category: 'Annual Preventive',
    dose: 'Annual Dose 2026',
    dueDate: '15 Sep 2026',
    dateAdministered: 'Pending',
    facilityName: 'Panagar PHC — UIP Unit, Jabalpur',
    status: 'UPCOMING',
    recommendedAge: 'Senior / High-Risk Group'
  }
];
