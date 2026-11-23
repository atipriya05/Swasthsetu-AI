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
  name: 'Rameshwar Lal Sharma',
  nameHi: 'रामेश्वर लाल शर्मा',
  age: 58,
  gender: 'Male',
  genderHi: 'पुरुष',
  mobile: '9876543210',
  abhaId: '91-4829-1029-4820',
  abhaAddress: 'rameshwar.sharma@abdm',
  village: 'Rampur Village, Block Sitapur',
  villageHi: 'रामपुर गाँव, ब्लॉक सीतापुर',
  district: 'Sitapur',
  state: 'Uttar Pradesh',
  bloodGroup: 'B+',
  allergies: ['Penicillin (पेनिसिलिन)'],
  emergencyContact: '+91 9876500000 (Son - Manoj Sharma)'
};

export const MOCK_DOCTOR: DoctorProfile = {
  id: 'doc-001',
  doctorId: 'DOC-UP-8842',
  name: 'Dr. Rajesh Kumar',
  nameHi: 'डॉ. राजेश कुमार',
  qualification: 'MBBS, MD (General Medicine)',
  specialty: 'General Physician',
  facilityName: 'Sitapur Primary Health Centre (PHC)',
  hospitalName: 'Sitapur Primary Health Centre (PHC)',
  hospitalNameHi: 'सीतापुर प्राथमिक स्वास्थ्य केंद्र (PHC)',
  registrationNo: 'MCI-UP-49201',
  registrationNumber: 'MCI-UP-49201',
  experienceYears: 14,
  email: 'dr.rajesh@gov.in',
  isAvailable: true
};

export const MOCK_SPECIALISTS: DoctorProfile[] = [
  MOCK_DOCTOR,
  {
    id: 'doc-002',
    doctorId: 'DOC-UP-3319',
    name: 'Dr. Sunita Verma',
    nameHi: 'डॉ. सुनीता वर्मा',
    qualification: 'MBBS, MS (Obstetrics & Gynecology)',
    specialty: 'Gynecologist',
    facilityName: 'District Government Hospital Barabanki',
    hospitalName: 'District Government Hospital Barabanki',
    hospitalNameHi: 'जिला सरकारी अस्पताल बाराबंकी',
    registrationNo: 'MCI-UP-38192',
    registrationNumber: 'MCI-UP-38192',
    experienceYears: 12,
    email: 'dr.sunita@gov.in',
    isAvailable: true
  },
  {
    id: 'doc-003',
    doctorId: 'DOC-UP-7721',
    name: 'Dr. Amit Patel',
    nameHi: 'डॉ. अमित पटेल',
    qualification: 'MBBS, DCH (Pediatrics)',
    specialty: 'Pediatrician',
    facilityName: 'Rampur Community Health Centre (CHC)',
    hospitalName: 'Rampur Community Health Centre (CHC)',
    hospitalNameHi: 'रामपुर सामुदायिक स्वास्थ्य केंद्र (CHC)',
    registrationNo: 'MCI-UP-55120',
    registrationNumber: 'MCI-UP-55120',
    experienceYears: 9,
    email: 'dr.amit@gov.in',
    isAvailable: true
  },
  {
    id: 'doc-004',
    doctorId: 'DOC-UP-9904',
    name: 'Dr. Priya Nair',
    nameHi: 'डॉ. प्रिया नायर',
    qualification: 'MBBS, MD, DM (Cardiology)',
    specialty: 'Cardiologist',
    facilityName: 'District Government Hospital Barabanki',
    hospitalName: 'District Government Hospital Barabanki',
    hospitalNameHi: 'जिला सरकारी अस्पताल बाराबंकी',
    registrationNo: 'MCI-UP-66014',
    registrationNumber: 'MCI-UP-66014',
    experienceYears: 16,
    email: 'dr.priya@gov.in',
    isAvailable: false
  }
];

export const MOCK_FACILITIES: HealthcareFacility[] = [
  {
    id: 'fac-001',
    name: 'Sitapur Primary Health Centre (PHC)',
    nameHi: 'सीतापुर प्राथमिक स्वास्थ्य केंद्र (PHC)',
    type: 'PHC',
    lat: 27.5684,
    lng: 80.6829,
    distanceKm: 2.1,
    travelTimeMins: 7,
    address: 'Near Gram Panchayat Bhawan, Sitapur Road',
    addressHi: 'ग्राम पंचायत भवन के पास, सीतापुर रोड',
    emergencyAvailable: true,
    bedsAvailable: 8,
    totalBeds: 12,
    doctorName: 'Dr. Rajesh Kumar',
    specialty: 'General Physician',
    contactNumber: '+91 5862 248100',
    rating: 4.6,
    opdTimings: '08:00 AM – 02:00 PM (Emergency 24x7)',
    opdTimingsHi: 'सुबह 08:00 – दोपहर 02:00 (आपातकालीन 24x7)',
    services: [
      'General OPD',
      'Maternal Health (ANC)',
      'Mission Indradhanush Immunization',
      'Jan Aushadhi Generic Pharmacy',
      'Blood Sugar & Malaria Screening'
    ],
    doctorAvailable: true,
    currentWaitMins: 12
  },
  {
    id: 'fac-002',
    name: 'Rampur Community Health Centre (CHC)',
    nameHi: 'रामपुर सामुदायिक स्वास्थ्य केंद्र (CHC)',
    type: 'CHC',
    lat: 27.5921,
    lng: 80.7105,
    distanceKm: 4.8,
    travelTimeMins: 14,
    address: 'National Highway 24 Link, Rampur Rural',
    addressHi: 'राष्ट्रीय राजमार्ग 24 लिंक, रामपुर ग्रामीण',
    emergencyAvailable: true,
    bedsAvailable: 19,
    totalBeds: 30,
    doctorName: 'Dr. Amit Patel',
    specialty: 'Pediatrician',
    contactNumber: '+91 5862 251920',
    rating: 4.4,
    opdTimings: '08:30 AM – 03:00 PM',
    opdTimingsHi: 'सुबह 08:30 – दोपहर 03:00',
    services: [
      '24x7 Delivery Room',
      'Pediatric Care',
      'Minor Surgery',
      'X-Ray & Ultrasound',
      'Emergency Oxygen Supply'
    ],
    doctorAvailable: true,
    currentWaitMins: 18
  },
  {
    id: 'fac-003',
    name: 'District Government Civil Hospital Barabanki',
    nameHi: 'जिला सरकारी सिविल अस्पताल बाराबंकी',
    type: 'GOVT_HOSPITAL',
    lat: 26.9284,
    lng: 81.1834,
    distanceKm: 12.4,
    travelTimeMins: 28,
    address: 'Hospital Square, Civil Lines, District HQ',
    addressHi: 'अस्पताल चौराहा, सिविल लाइंस, जिला मुख्यालय',
    emergencyAvailable: true,
    bedsAvailable: 42,
    totalBeds: 150,
    doctorName: 'Dr. Sunita Verma & Dr. Priya Nair',
    specialty: 'Gynecologist',
    contactNumber: '+91 5248 221088',
    rating: 4.7,
    opdTimings: '08:00 AM – 04:00 PM (Emergency 24x7)',
    opdTimingsHi: 'सुबह 08:00 – शाम 04:00 (आपातकालीन 24x7)',
    services: [
      'ICU & Trauma Care',
      'Cardiology & ECG',
      'Advanced Gynecology & NICU',
      'Telemedicine Consultation',
      'CT Scan & Pathology Lab'
    ],
    doctorAvailable: true,
    currentWaitMins: 25
  },
  {
    id: 'fac-004',
    name: 'Ayushman Arogya Mandir (Sub-Centre Kalyanpur)',
    nameHi: 'आयुष्मान आरोग्य मंदिर (उप-केंद्र कल्याणपुर)',
    type: 'PHC',
    lat: 27.5412,
    lng: 80.6519,
    distanceKm: 3.5,
    travelTimeMins: 10,
    address: 'Near Kalyanpur Primary School',
    addressHi: 'कल्याणपुर प्राथमिक विद्यालय के निकट',
    emergencyAvailable: false,
    bedsAvailable: 3,
    totalBeds: 4,
    doctorName: 'Smt. Anita Devi (Community Health Officer)',
    specialty: 'General Physician',
    contactNumber: '+91 94150 88219',
    rating: 4.3,
    opdTimings: '09:00 AM – 01:00 PM',
    opdTimingsHi: 'सुबह 09:00 – दोपहर 01:00',
    services: [
      'NCD Screening (BP & Diabetes)',
      'Antenatal Checkups',
      'Preventive Health Counseling',
      'Essential Medicines Distribution'
    ],
    doctorAvailable: false,
    currentWaitMins: 8
  }
];

export const MOCK_TRIAGE_REPORTS: AITriageReport[] = [
  {
    id: 'tr-001',
    patientId: 'pat-001',
    patientName: 'Rameshwar Lal Sharma',
    patientAge: 58,
    patientGender: 'Male',
    patientPhone: '9876543210',
    village: 'Rampur Village',
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
      'Sustained fever for more than 72 hours warrants clinical evaluation and rapid malaria/dengue screening at the Primary Health Centre.',
    riskReasonHi:
      '3 दिन से लगातार बुखार व कंपकंपी के कारण प्राथमिक स्वास्थ्य केंद्र में मलेरिया व डेंगू जांच आवश्यक है।',
    recommendedDepartment: 'General Medicine (PHC OPD)',
    recommendedDepartmentHi: 'सामान्य चिकित्सा विभाग (PHC ओपीडी)',
    preliminaryAdvice: [
      'Maintain hydration with boiled water and Oral Rehydration Salts (ORS).',
      'Paracetamol 500 mg may be taken after meals if temperature exceeds 100°F.',
      'Avoid self-medicating with NSAIDs such as Ibuprofen or Aspirin prior to physician review.',
      'Visit Sitapur PHC today for rapid blood smear and NS1 antigen testing.'
    ],
    preliminaryAdviceHi: [
      'उबला हुआ गुनगुना पानी और ओआरएस (ORS) का घोल पर्याप्त मात्रा में पिएं।',
      'बुखार 100°F से अधिक होने पर भोजन के बाद पैरासिटामोल 500mg ली जा सकती है।',
      'चिकित्सक के परामर्श के बिना दर्द निवारक दवाओं का सेवन न करें।',
      'मलेरिया व डेंगू जांच हेतु आज ही सीतापुर PHC जाएं।'
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
    patientName: 'Sunita Devi',
    patientAge: 26,
    patientGender: 'Female',
    patientPhone: '9876511223',
    village: 'Sitapur Ward 4',
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
    recommendedDepartment: 'Obstetrics & Gynecology (ANC Clinic)',
    recommendedDepartmentHi: 'प्रसूति एवं महिला रोग विभाग (मातृ सुरक्षा)',
    preliminaryAdvice: [
      'Rest in the left lateral position for 30 minutes to support placental circulation.',
      'Stay adequately hydrated with clean drinking water.',
      'Report to Sitapur PHC today for antenatal blood pressure and hemoglobin evaluation.'
    ],
    preliminaryAdviceHi: [
      'बाईं करवट लेटकर 30 मिनट विश्राम करें।',
      'पर्याप्त स्वच्छ पानी पिएं।',
      'निःशुल्क प्रसव पूर्व जांच व रक्तचाप परीक्षण हेतु आज ही PHC जाएं।'
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
    patientName: 'Kailash Nath',
    patientAge: 64,
    patientGender: 'Male',
    patientPhone: '9876599887',
    village: 'Kalyanpur',
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
      'High-priority emergency: Symptoms are consistent with potential Acute Coronary Syndrome. Immediate ECG and 108 ambulance transfer required.',
    riskReasonHi:
      'अति आपातकालीन स्थिति: हृदय संबंधी गंभीर समस्या की आशंका। तत्काल 108 एम्बुलेंस व ईसीजी जांच आवश्यक है।',
    recommendedDepartment: 'Emergency Medicine / Cardiology',
    recommendedDepartmentHi: 'आपातकालीन चिकित्सा / हृदय रोग विभाग',
    preliminaryAdvice: [
      'Avoid all physical exertion and remain seated in an upright supported position.',
      'Contact 108 emergency ambulance immediately for transfer to the District Hospital.',
      'Do not attempt to drive or walk unaccompanied to the facility.'
    ],
    preliminaryAdviceHi: [
      'किसी भी प्रकार का शारीरिक श्रम न करें और आराम से बैठें।',
      'जिला अस्पताल स्थानांतरण हेतु तुरंत 108 आपातकालीन एम्बुलेंस को कॉल करें।',
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
    patientName: 'Rameshwar Lal Sharma',
    patientAge: 58,
    patientGender: 'Male',
    patientPhone: '9876543210',
    facilityId: 'fac-001',
    facilityName: 'Sitapur Primary Health Centre (PHC)',
    facilityNameHi: 'सीतापुर प्राथमिक स्वास्थ्य केंद्र (PHC)',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Kumar',
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
    patientName: 'Sunita Devi',
    patientAge: 26,
    patientGender: 'Female',
    patientPhone: '9876511223',
    facilityId: 'fac-001',
    facilityName: 'Sitapur Primary Health Centre (PHC)',
    facilityNameHi: 'सीतापुर प्राथमिक स्वास्थ्य केंद्र (PHC)',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Kumar',
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
    patientName: 'Master Aarav',
    patientAge: 4,
    patientGender: 'Male',
    patientPhone: '9876544332',
    facilityId: 'fac-001',
    facilityName: 'Sitapur Primary Health Centre (PHC)',
    facilityNameHi: 'सीतापुर प्राथमिक स्वास्थ्य केंद्र (PHC)',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Kumar',
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
    id: 'RX-2026-081',
    patientId: 'pat-001',
    patientName: 'Rameshwar Lal Sharma',
    patientAge: 58,
    patientGender: 'Male',
    abhaId: '91-4829-1029-4820',
    doctorId: 'doc-001',
    doctorName: 'Dr. Rajesh Kumar (MBBS, MD)',
    doctorSpecialty: 'Senior Medical Officer — General Medicine',
    doctorRegistrationNo: 'MCI-UP-49201',
    facilityName: 'Sitapur Primary Health Centre (PHC), Govt. of UP',
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
        instructions: 'Take at the same time daily. Monitor blood pressure weekly at the PHC.',
        instructionsHi: 'प्रतिदिन सुबह एक ही समय पर लें। सप्ताह में एक बार PHC पर रक्तचाप की जांच कराएं।'
      },
      {
        id: 'med-2',
        name: 'Tab. Paracetamol 500mg',
        dosage: '1 tablet as needed (temperature > 100°F)',
        frequency: '1-0-1 (Maximum 3 doses per day)',
        frequencyHi: 'आवश्यकतानुसार सुबह-शाम भोजन के बाद',
        duration: '5 Days',
        instructions: 'Take only after food.',
        instructionsHi: 'हमेशा भोजन के बाद ही लें।'
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
      'Limit dietary sodium to less than 1 teaspoon per day. Avoid fried foods and walk 30 minutes daily.',
    adviceHi:
      'भोजन में नमक की मात्रा कम रखें। तले हुए खाद्य पदार्थों से बचें और प्रतिदिन 30 मिनट टहलें।',
    dietaryAdvice:
      'Limit dietary sodium to less than 1 teaspoon per day. Avoid fried foods and walk 30 minutes daily.',
    dietaryAdviceHi:
      'भोजन में नमक की मात्रा कम रखें। तले हुए खाद्य पदार्थों से बचें और प्रतिदिन 30 मिनट टहलें।',
    followUpDate: '14 Aug 2026 (or earlier if BP exceeds 150/95)'
  }
];

export const MOCK_VACCINATIONS: VaccinationRecord[] = [
  {
    id: 'vac-01',
    vaccineName: 'COVID-19 Precaution Dose',
    vaccineNameHi: 'कोविड-19 एहतियाती खुराक',
    beneficiaryName: 'Rameshwar Lal Sharma',
    category: 'Adult Immunization',
    dose: '3rd Dose (Booster)',
    dueDate: '18 Nov 2023',
    administeredDate: '18 Nov 2023',
    dateAdministered: '18 Nov 2023',
    facilityName: 'Sitapur PHC',
    status: 'COMPLETED',
    recommendedAge: 'Adult (18+ years)'
  },
  {
    id: 'vac-02',
    vaccineName: 'Tetanus and Adult Diphtheria (Td)',
    vaccineNameHi: 'टिटनेस एवं वयस्क डिप्थीरिया (Td)',
    beneficiaryName: 'Rameshwar Lal Sharma',
    category: 'Adult Booster',
    dose: '0.5 ml IM',
    dueDate: '05 Jan 2025',
    administeredDate: '05 Jan 2025',
    dateAdministered: '05 Jan 2025',
    facilityName: 'Sitapur PHC',
    status: 'COMPLETED',
    recommendedAge: 'Every 10 Years'
  },
  {
    id: 'vac-03',
    vaccineName: 'Seasonal Influenza Vaccine',
    vaccineNameHi: 'मौसमी इन्फ्लुएंजा टीका',
    beneficiaryName: 'Rameshwar Lal Sharma',
    category: 'Annual Preventive',
    dose: 'Annual Dose 2026',
    dueDate: '15 Sep 2026',
    dateAdministered: 'Pending',
    facilityName: 'Sitapur PHC — UIP Unit',
    status: 'UPCOMING',
    recommendedAge: 'Senior / High-Risk Group'
  }
];
