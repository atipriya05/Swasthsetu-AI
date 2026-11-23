import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  MOCK_TRIAGE_REPORTS,
  MOCK_APPOINTMENTS,
  MOCK_PRESCRIPTIONS,
  MOCK_FACILITIES
} from './src/data/mockData';
import { AITriageReport, Appointment, Prescription } from './src/types';

dotenv.config();

// In-memory persistent state for live synchronization
const triageReports: AITriageReport[] = [...MOCK_TRIAGE_REPORTS];
const appointments: Appointment[] = [...MOCK_APPOINTMENTS];
const prescriptions: Prescription[] = [...MOCK_PRESCRIPTIONS];

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: apiKey.trim()
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
    return null;
  }
}

// Comprehensive clinical triage fallback engine for rural Indian healthcare
function fallbackTriage(input: string, _lang: 'en' | 'hi'): Partial<AITriageReport> {
  const lower = input.toLowerCase();

  // 1. Emergency Red Flags (Chest pain, severe breathlessness, loss of consciousness, severe bleeding, stroke)
  if (
    lower.includes('chest') ||
    lower.includes('सीने') ||
    lower.includes('छाती') ||
    lower.includes('heart') ||
    lower.includes('दिल') ||
    lower.includes('attack') ||
    lower.includes('breath') ||
    lower.includes('सांस') ||
    lower.includes('श्वास') ||
    lower.includes('unconscious') ||
    lower.includes('बेहोश') ||
    lower.includes('bleeding') ||
    lower.includes('खून') ||
    lower.includes('paralysis') ||
    lower.includes('लकवा') ||
    lower.includes('stroke')
  ) {
    return {
      translatedInputEn: `Patient reports acute chest distress or cardiorespiratory emergency: "${input}"`,
      chiefComplaint: 'Acute Chest Distress / Suspected Cardiopulmonary Emergency',
      chiefComplaintHi: 'सीने में दर्द / श्वसन या हृदय संबंधी आपातकालीन स्थिति',
      symptoms: [
        'Chest tightness or pressure',
        'Shortness of breath (dyspnea)',
        'Sweating or lightheadedness'
      ],
      symptomsHi: ['सीने में भारीपन व तेज दर्द', 'सांस लेने में तकलीफ', 'अत्यधिक पसीना आना'],
      duration: 'Acute onset (< 2 hours)',
      durationHi: 'अचानक प्रारंभ (2 घंटे के भीतर)',
      riskLevel: 'Red',
      riskReason:
        'High-priority warning signs of acute cardiopulmonary distress. Immediate 108 ambulance dispatch and emergency hospital evaluation are required.',
      riskReasonHi:
        'अति गंभीर आपातकाल: हृदय या तीव्र श्वसन संकट के लक्षण। तत्काल 108 एम्बुलेंस द्वारा जिला अस्पताल आपातकालीन विभाग में रेफर करें।',
      recommendedDepartment: 'Emergency Medicine / Cardiology',
      recommendedDepartmentHi: 'आपातकालीन चिकित्सा / हृदय रोग विभाग',
      preliminaryAdvice: [
        'Keep the patient seated in a semi-reclined, supported position with adequate ventilation.',
        'Do not permit physical exertion or walking.',
        'Call 108 immediately for emergency ambulance transfer to the nearest District Hospital.'
      ],
      preliminaryAdviceHi: [
        'मरीज़ को सहारा देकर आरामदायक स्थिति में बैठाएं और पर्याप्त हवा की व्यवस्था रखें।',
        'किसी भी प्रकार के शारीरिक श्रम या चलने से बचाएं।',
        'मुफ्त सरकारी 108 आपातकालीन एम्बुलेंस के लिए तुरंत कॉल करें।'
      ],
      redFlags: [
        'Crushing chest pressure radiating to left arm or jaw',
        'Severe shortness of breath',
        'Cold, clammy skin or fainting'
      ]
    };
  }

  // 2. Animal Bites / Venom / Burns / Trauma
  if (
    lower.includes('dog') ||
    lower.includes('कुत्ता') ||
    lower.includes('bite') ||
    lower.includes('काटा') ||
    lower.includes('snake') ||
    lower.includes('सांप') ||
    lower.includes('monkey') ||
    lower.includes('बंदर') ||
    lower.includes('burn') ||
    lower.includes('जल') ||
    lower.includes('cut') ||
    lower.includes('घाव') ||
    lower.includes('चोट')
  ) {
    const isRabies =
      lower.includes('dog') ||
      lower.includes('कुत्ता') ||
      lower.includes('monkey') ||
      lower.includes('बंदर');
    const isSnake = lower.includes('snake') || lower.includes('सांप');
    return {
      translatedInputEn: `Patient presents with acute trauma or animal bite: "${input}"`,
      chiefComplaint: isSnake
        ? 'Suspected Snake Bite / Envenomation'
        : isRabies
          ? 'Animal Bite — Rabies Prophylaxis Required'
          : 'Acute Wound or Burn Injury',
      chiefComplaintHi: isSnake
        ? 'सर्पदंश / विषैले जीव का काटना'
        : isRabies
          ? 'पशु काटना — रेबीज टीकाकरण आवश्यक'
          : 'घाव, चोट अथवा जलने की स्थिति',
      symptoms: isSnake
        ? ['Puncture marks', 'Localized swelling and pain', 'Drowsiness or weakness']
        : isRabies
          ? ['Animal scratch or tooth puncture', 'Localized bleeding', 'Wound pain']
          : ['Skin laceration or erythema', 'Localized pain', 'Surface bleeding'],
      symptomsHi: isSnake
        ? ['दांतों के निशान', 'सूजन व तेज दर्द', 'चक्कर व सुस्ती']
        : isRabies
          ? ['खरोंच या दांत का घाव', 'हल्का रक्तस्राव', 'दर्द व जलन']
          : ['त्वचा कटना या जलना', 'तीव्र दर्द', 'घाव से रक्तस्राव'],
      duration: 'Immediate (< 24 hours)',
      durationHi: 'तात्कालिक (24 घंटे के भीतर)',
      riskLevel: isSnake ? 'Red' : 'Yellow',
      riskReason: isSnake
        ? 'Potential neurotoxic or hemotoxic envenomation requires urgent hospital administration of Anti-Snake Venom (ASV).'
        : 'Requires thorough soap-and-water irrigation and prompt Anti-Rabies Vaccine (ARV) and Tetanus Toxoid administration at the PHC.',
      riskReasonHi: isSnake
        ? 'सांप के काटने पर तुरंत सरकारी अस्पताल में एंटी-स्नेक वेनम (ASV) इंजेक्शन लगवाना अनिवार्य है।'
        : 'घाव को साबुन-पानी से 15 मिनट धोएं तथा PHC जाकर तुरंत एंटी-रेबीज (ARV) और टिटनेस का टीका लगवाएं।',
      recommendedDepartment: isSnake
        ? 'Emergency Medicine (ASV Protocol)'
        : 'General Surgery / Anti-Rabies Clinic (PHC)',
      recommendedDepartmentHi: isSnake
        ? 'आपातकालीन वार्ड (एंटी-वेनम प्रोटोकॉल)'
        : 'प्राथमिक स्वास्थ्य केंद्र (रेबीज टीकाकरण कक्ष)',
      preliminaryAdvice: [
        'Wash animal bite wounds under running water with soap for at least 15 minutes.',
        'Do not apply home irritants, cut the wound, or tie tight tourniquets.',
        'Report immediately to the nearest PHC for free Anti-Rabies Vaccine (ARV) and Tetanus Toxoid (TT).'
      ],
      preliminaryAdviceHi: [
        'घाव को बहते पानी व साबुन से कम से कम 15 मिनट तक अच्छी तरह धोएं।',
        'घाव पर मिर्च, मिट्टी या पट्टी न बांधें और न ही चीरा लगाएं।',
        'निःशुल्क एंटी-रेबीज व टिटनेस टीके के लिए तुरंत PHC जाएं।'
      ],
      redFlags: ['Rapidly spreading swelling', 'Difficulty swallowing or breathing', 'Altered consciousness']
    };
  }

  // 3. Maternal & Pregnancy symptoms
  if (
    lower.includes('pregnant') ||
    lower.includes('pregnancy') ||
    lower.includes('गर्भवती') ||
    lower.includes('गर्भावस्था') ||
    lower.includes('delivery') ||
    lower.includes('प्रसव')
  ) {
    return {
      translatedInputEn: `Patient seeking antenatal maternal evaluation: "${input}"`,
      chiefComplaint: 'Antenatal Care (ANC) Maternal Evaluation',
      chiefComplaintHi: 'गर्भावस्था में स्वास्थ्य जांच एवं मातृ सुरक्षा',
      symptoms: ['Dizziness or lightheadedness', 'Nausea', 'Mild pedal edema'],
      symptomsHi: ['चक्कर आना व कमजोरी', 'जी मिचलाना', 'पैरों में हल्की सूजन'],
      duration: '1–2 Days',
      durationHi: '1–2 दिन',
      riskLevel: 'Yellow',
      riskReason:
        'Maternal symptoms warrant clinical blood pressure and urine protein screening to rule out pre-eclampsia and confirm fetal well-being.',
      riskReasonHi:
        'गर्भावस्था में रक्तचाप (BP) और मूत्र परीक्षण के लिए निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC) में मातृ सुरक्षा जांच आवश्यक है।',
      recommendedDepartment: 'Obstetrics & Gynecology (ANC OPD)',
      recommendedDepartmentHi: 'प्रसूति एवं महिला रोग विभाग (मातृ सुरक्षा)',
      preliminaryAdvice: [
        'Rest on the left side for 30 minutes to support circulation.',
        'Stay adequately hydrated with clean drinking water or ORS.',
        'Visit the nearest PHC today for antenatal blood pressure monitoring and hemoglobin check.'
      ],
      preliminaryAdviceHi: [
        'बाईं करवट लेटकर 30 मिनट विश्राम करें।',
        'पर्याप्त स्वच्छ पानी या ओआरएस पिएं।',
        'निःशुल्क प्रसव पूर्व जांच व रक्तचाप परीक्षण के लिए आज ही PHC जाएं।'
      ],
      redFlags: [
        'Elevated blood pressure with severe headache',
        'Visual blurring or upper abdominal pain',
        'Vaginal bleeding or fluid leakage'
      ]
    };
  }

  // 4. Gastrointestinal
  if (
    lower.includes('stomach') ||
    lower.includes('पेट') ||
    lower.includes('pain') ||
    lower.includes('दर्द') ||
    lower.includes('loose') ||
    lower.includes('motion') ||
    lower.includes('दस्त') ||
    lower.includes('उल्टी') ||
    lower.includes('vomit') ||
    lower.includes('acidity') ||
    lower.includes('गैस') ||
    lower.includes('कब्ज')
  ) {
    const isDiarrhea =
      lower.includes('motion') ||
      lower.includes('दस्त') ||
      lower.includes('loose') ||
      lower.includes('vomit') ||
      lower.includes('उल्टी');
    return {
      translatedInputEn: `Patient presents with gastrointestinal symptoms: "${input}"`,
      chiefComplaint: isDiarrhea
        ? 'Acute Gastroenteritis / Risk of Dehydration'
        : 'Abdominal Pain and Dyspepsia / Gastritis',
      chiefComplaintHi: isDiarrhea
        ? 'तीव्र दस्त व उल्टी / निर्जलीकरण की आशंका'
        : 'पेट दर्द, गैस एवं अपच',
      symptoms: isDiarrhea
        ? ['Watery loose stools', 'Nausea and vomiting', 'Mild dehydration']
        : ['Abdominal cramping', 'Bloating and acidity', 'Reduced appetite'],
      symptomsHi: isDiarrhea
        ? ['पानी जैसे पतले दस्त', 'उल्टी व जी मिचलाना', 'शरीर में पानी की कमी']
        : ['पेट में मरोड़ व दर्द', 'गैस व अपच', 'भूख में कमी'],
      duration: '1–2 Days',
      durationHi: '1–2 दिन',
      riskLevel: 'Yellow',
      riskReason:
        'Risk of dehydration and electrolyte imbalance. Prompt ORS hydration and physician review at the PHC are advised.',
      riskReasonHi:
        'दस्त व उल्टी में शरीर से पानी और लवण की कमी हो सकती है। ओआरएस घोल और चिकित्सकीय परामर्श आवश्यक है।',
      recommendedDepartment: 'General Medicine OPD',
      recommendedDepartmentHi: 'सामान्य चिकित्सा विभाग (ओपीडी)',
      preliminaryAdvice: [
        'Dissolve 1 packet of ORS in 1 litre of clean boiled water and drink sip-by-sip after each loose stool.',
        'Consume light, easily digestible foods such as khichdi, banana, and curd.',
        'Avoid unprescribed medications and visit the PHC if symptoms persist beyond 24 hours.'
      ],
      preliminaryAdviceHi: [
        '1 पैकेट ओआरएस 1 लीटर उबले ठंडे पानी में घोलकर हर दस्त के बाद घूंट-घूंट पिएं।',
        'दही-चावल, मूंग दाल की पतली खिचड़ी और केला जैसा हल्का भोजन लें।',
        'बिना परामर्श दवा न लें और 24 घंटे से अधिक समस्या रहने पर PHC जाएं।'
      ],
      redFlags: [
        'Blood in stools or dark tarry stools',
        'Dry mouth, sunken eyes, or inability to retain fluids',
        'Severe right-sided lower abdominal pain'
      ]
    };
  }

  // 5. Orthopedic / Joint pain
  if (
    lower.includes('joint') ||
    lower.includes('घुटने') ||
    lower.includes('जोड़ों') ||
    lower.includes('knee') ||
    lower.includes('back') ||
    lower.includes('कमर') ||
    lower.includes('हड्डी')
  ) {
    return {
      translatedInputEn: `Patient reports musculoskeletal or joint discomfort: "${input}"`,
      chiefComplaint: 'Musculoskeletal Strain / Joint Pain',
      chiefComplaintHi: 'जोड़ों व घुटनों का दर्द / कमर में खिंचाव',
      symptoms: ['Morning joint stiffness', 'Localized knee or lumbar discomfort', 'Reduced mobility'],
      symptomsHi: ['सुबह जोड़ों में अकड़न', 'घुटनों व कमर में दर्द', 'चलने-फिरने में असुविधा'],
      duration: '1–2 Weeks',
      durationHi: '1–2 सप्ताह',
      riskLevel: 'Green',
      riskReason:
        'Likely mechanical joint wear or muscular strain. Appropriate for routine PHC outpatient evaluation and physiotherapy guidance.',
      riskReasonHi:
        'यह सामान्य जोड़ों का दर्द या मांसपेशियों का खिंचाव हो सकता है। PHC ओपीडी में चिकित्सकीय जांच व व्यायाम परामर्श लें।',
      recommendedDepartment: 'Orthopedics / General OPD',
      recommendedDepartmentHi: 'अस्थि रोग / सामान्य ओपीडी',
      preliminaryAdvice: [
        'Apply warm compress for 15 minutes twice daily.',
        'Avoid prolonged squatting and heavy lifting.',
        'Consult the PHC physician regarding calcium and Vitamin D supplementation.'
      ],
      preliminaryAdviceHi: [
        'प्रभावित जोड़ों पर दिन में दो बार 15 मिनट गुनगुनी सिकाई करें।',
        'भारी वजन उठाने और जमीन पर देर तक बैठने से बचें।',
        'कैल्शियम व विटामिन डी के लिए PHC चिकित्सक से परामर्श लें।'
      ],
      redFlags: ['Inability to bear weight on the limb', 'Sudden hot, red, swollen joint with fever']
    };
  }

  // 6. Dermatological
  if (
    lower.includes('skin') ||
    lower.includes('त्वचा') ||
    lower.includes('rash') ||
    lower.includes('itch') ||
    lower.includes('खुजली') ||
    lower.includes('दाद') ||
    lower.includes('फुंसी')
  ) {
    return {
      translatedInputEn: `Patient presents with dermatological symptoms: "${input}"`,
      chiefComplaint: 'Dermatological Rash / Suspected Superficial Fungal Infection',
      chiefComplaintHi: 'त्वचा पर चकत्ते, खुजली अथवा फंगल संक्रमण',
      symptoms: ['Itchy erythematous skin patches', 'Increased nighttime itching', 'Localized scaling'],
      symptomsHi: ['त्वचा पर लाल दाने व खुजली', 'रात में अधिक खुजली', 'त्वचा का सूखना या छिलना'],
      duration: '4–5 Days',
      durationHi: '4–5 दिन',
      riskLevel: 'Green',
      riskReason:
        'Presentation consistent with superficial fungal dermatitis or allergic rash; treatable at primary care OPD.',
      riskReasonHi:
        'यह सामान्य फंगल संक्रमण या एलर्जी के लक्षण प्रतीत होते हैं। PHC में उचित मलहम व उपचार उपलब्ध है।',
      recommendedDepartment: 'Dermatology / General OPD',
      recommendedDepartmentHi: 'त्वचा रोग / सामान्य ओपीडी',
      preliminaryAdvice: [
        'Keep the affected skin area clean and dry, and wear loose cotton clothing.',
        'Wash garments and bedding in warm water and dry thoroughly in sunlight.',
        'Visit the PHC for prescribed antifungal cream through Jan Aushadhi.'
      ],
      preliminaryAdviceHi: [
        'प्रभावित त्वचा को साफ व सूखा रखें तथा ढीले सूती कपड़े पहनें।',
        'कपड़ों व चादर को गर्म पानी से धोकर धूप में अच्छी तरह सुखाएं।',
        'निर्धारित एंटीफंगल दवा हेतु PHC ओपीडी में दिखाएं।'
      ],
      redFlags: ['Rapid facial or lip swelling', 'Pus discharge accompanied by fever']
    };
  }

  // 7. Eye / ENT / Dental
  if (
    lower.includes('eye') ||
    lower.includes('आंख') ||
    lower.includes('ear') ||
    lower.includes('कान') ||
    lower.includes('tooth') ||
    lower.includes('दांत') ||
    lower.includes('headache') ||
    lower.includes('सिरदर्द')
  ) {
    const isEye = lower.includes('eye') || lower.includes('आंख');
    const isTooth = lower.includes('tooth') || lower.includes('दांत');
    return {
      translatedInputEn: `Patient reports ophthalmic, dental, or headache symptoms: "${input}"`,
      chiefComplaint: isEye
        ? 'Ocular Irritation / Suspected Conjunctivitis'
        : isTooth
          ? 'Dental Pain / Possible Caries'
          : 'Tension Headache / Migraine',
      chiefComplaintHi: isEye
        ? 'आंखों में लाली, जलन व पानी आना'
        : isTooth
          ? 'दांत दर्द व मसूड़ों में सूजन'
          : 'तीव्र सिरदर्द व तनाव',
      symptoms: isEye
        ? ['Conjunctival redness', 'Watery discharge', 'Mild light sensitivity']
        : isTooth
          ? ['Throbbing tooth pain', 'Temperature sensitivity', 'Gum tenderness']
          : ['Bilateral headache', 'Neck tension', 'Eye strain'],
      symptomsHi: isEye
        ? ['आंखें लाल होना', 'आंख से पानी आना', 'रोशनी में असहजता']
        : isTooth
          ? ['दांत में तेज दर्द', 'ठंडा-गर्म लगना', 'मसूड़ों में सूजन']
          : ['सिर में भारीपन व दर्द', 'गर्दन में अकड़न', 'आंखों में थकान'],
      duration: '2–3 Days',
      durationHi: '2–3 दिन',
      riskLevel: 'Green',
      riskReason: 'Localized non-emergent symptoms appropriate for primary care OPD evaluation.',
      riskReasonHi: 'सामान्य संक्रमण या तनाव के लक्षण। प्राथमिक स्वास्थ्य केंद्र में जांच कराएं।',
      recommendedDepartment: isEye
        ? 'Ophthalmology Clinic (PHC)'
        : isTooth
          ? 'Dental Clinic (PHC)'
          : 'General Medicine OPD',
      recommendedDepartmentHi: isEye
        ? 'नेत्र जांच कक्ष (PHC)'
        : isTooth
          ? 'दंत चिकित्सा कक्ष (PHC)'
          : 'सामान्य चिकित्सा विभाग',
      preliminaryAdvice: [
        'Rinse eyes gently with clean cool water and avoid rubbing.',
        'For dental pain, perform warm saline rinses three times daily.',
        'Rest in a quiet room and maintain adequate hydration.'
      ],
      preliminaryAdviceHi: [
        'आंखों को साफ ताजे पानी से धोएं और हाथों से न मलें।',
        'दांत दर्द में गुनगुने नमक के पानी से दिन में तीन बार कुल्ला करें।',
        'शांत स्थान पर विश्राम करें और पर्याप्त पानी पिएं।'
      ],
      redFlags: ['Sudden loss of vision', 'Severe facial swelling with fever', 'Neck stiffness with vomiting']
    };
  }

  // 8. Default Fever / Respiratory / General
  const hasFever =
    lower.includes('fever') || lower.includes('बुखार') || lower.includes('ताप') || lower.includes('hot');
  const hasCough =
    lower.includes('cough') || lower.includes('खांसी') || lower.includes('cold') || lower.includes('जुकाम');

  return {
    translatedInputEn: `Patient presents with febrile or respiratory symptoms: "${input}"`,
    chiefComplaint: hasFever
      ? 'Acute Febrile Illness / High Fever'
      : hasCough
        ? 'Upper Respiratory Tract Infection'
        : 'General Malaise and Fatigue',
    chiefComplaintHi: hasFever
      ? 'तीव्र ज्वर / तेज बुखार'
      : hasCough
        ? 'खांसी एवं ऊपरी श्वसन संक्रमण'
        : 'सामान्य अस्वस्थता एवं शारीरिक कमजोरी',
    symptoms: [
      hasFever ? 'Elevated body temperature (> 100.4°F)' : 'Generalized fatigue',
      hasCough ? 'Persistent cough and throat irritation' : 'Headache and body ache',
      'Reduced appetite'
    ],
    symptomsHi: [
      hasFever ? 'शरीर का बढ़ा हुआ तापमान (100.4°F से अधिक)' : 'शारीरिक कमजोरी व थकान',
      hasCough ? 'लगातार खांसी व गले में खराश' : 'सिरदर्द व बदन दर्द',
      'भूख में कमी'
    ],
    duration: '2–3 Days',
    durationHi: '2–3 दिन',
    riskLevel: 'Yellow',
    riskReason:
      'Symptoms persisting beyond 48 hours warrant physician assessment and rapid malaria, dengue, or CBC screening at the Primary Health Centre.',
    riskReasonHi:
      '48 घंटे से अधिक लक्षण रहने पर प्राथमिक स्वास्थ्य केंद्र में चिकित्सकीय जांच व रक्त परीक्षण आवश्यक है।',
    recommendedDepartment: 'General Medicine (PHC OPD)',
    recommendedDepartmentHi: 'सामान्य चिकित्सा विभाग (PHC ओपीडी)',
    preliminaryAdvice: [
      'Drink boiled warm water and light nutritious fluids to stay hydrated.',
      'Paracetamol 500 mg may be taken after food if temperature exceeds 100°F.',
      'Apply a cool damp cloth compress to the forehead if fever is elevated.',
      'Visit your nearest PHC OPD for physician examination and diagnostic testing.'
    ],
    preliminaryAdviceHi: [
      'उबला हुआ गुनगुना पानी और हल्का सुपाच्य भोजन लें।',
      '100°F से अधिक बुखार होने पर भोजन के बाद पैरासिटामोल 500mg ली जा सकती है।',
      'तेज बुखार होने पर माथे पर ताजे पानी की पट्टी रखें।',
      'निःशुल्क चिकित्सकीय जांच और रक्त परीक्षण के लिए आज ही PHC ओपीडी जाएं।'
    ],
    redFlags: ['Fever persisting beyond 3 days without relief', 'Shortness of breath or severe lethargy']
  };
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API Routes ---

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), platform: 'SwasthSetu AI' });
  });

  app.get('/api/facilities', (_req, res) => {
    res.json(MOCK_FACILITIES);
  });

  app.get('/api/triage-reports', (_req, res) => {
    res.json(triageReports);
  });

  // AI Triage Generator (Voice / Text -> Structured Clinical Report)
  app.post('/api/gemini/triage', async (req, res) => {
    try {
      const {
        text,
        language = 'en',
        patientId,
        patientName,
        patientAge,
        patientGender,
        patientPhone,
        village
      } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text input is required' });
      }

      const normalizedLang: 'en' | 'hi' = language === 'hi' ? 'hi' : 'en';
      const client = getGeminiClient();
      let generatedData: Partial<AITriageReport> | null = null;

      if (client) {
        try {
          const targetLangName = normalizedLang === 'hi' ? 'Hindi' : 'English';
          const prompt = `You are SwasthSetu AI, a formal clinical triage assistant for public primary healthcare in India.
A patient provided the following health complaint in ${targetLangName}:
"${text}"

Analyze the complaint and produce a structured clinical triage JSON summary for an attending physician at a Primary Health Centre (PHC).

LANGUAGE RULES:
- Provide formal, concise clinical English in all English fields.
- Provide clear, natural Devanagari Hindi in all Hindi fields (chiefComplaintHi, symptomsHi, durationHi, riskReasonHi, recommendedDepartmentHi, preliminaryAdviceHi).
- Do NOT use emojis or casual phrasing.

Return ONLY valid JSON adhering strictly to this schema:
{
  "detectedLanguage": "${normalizedLang}",
  "translatedInputEn": "Concise clinical English summary of the patient statement",
  "chiefComplaint": "Short 3-6 word clinical chief complaint in English",
  "chiefComplaintHi": "मुख्य शिकायत हिंदी में",
  "symptoms": ["Symptom 1 in English", "Symptom 2 in English"],
  "symptomsHi": ["लक्षण 1 हिंदी में", "लक्षण 2 हिंदी में"],
  "duration": "Estimated duration (e.g. '3 Days')",
  "durationHi": "अवधि हिंदी में (उदा. '3 दिन')",
  "riskLevel": "Green" | "Yellow" | "Red",
  "riskReason": "Clinical rationale for this risk classification in English",
  "riskReasonHi": "जोखिम वर्गीकरण का नैदानिक कारण हिंदी में",
  "recommendedDepartment": "e.g. General Medicine | Pediatrics | Obstetrics & Gynecology | Cardiology | Emergency Medicine",
  "recommendedDepartmentHi": "अनुशंसित विभाग हिंदी में",
  "preliminaryAdvice": ["Actionable step 1 in English", "Actionable step 2 in English"],
  "preliminaryAdviceHi": ["मरीज़ के लिए प्राथमिक सलाह 1 हिंदी में", "मरीज़ के लिए प्राथमिक सलाह 2 हिंदी में"],
  "redFlags": ["Warning sign 1 in English", "Warning sign 2 in English"]
}`;

          const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2
            }
          });

          if (response.text) {
            let cleaned = response.text.trim();
            if (cleaned.startsWith('```json')) {
              cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
            } else if (cleaned.startsWith('```')) {
              cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
            }
            try {
              generatedData = JSON.parse(cleaned);
            } catch {
              console.warn('JSON parsing failed on triage response');
            }
          }
        } catch (genAiErr) {
          console.warn('Gemini API call failed, falling back to clinical engine:', genAiErr);
        }
      }

      if (!generatedData) {
        generatedData = fallbackTriage(text, normalizedLang);
      }

      const newReport: AITriageReport = {
        id: `TR-${Date.now().toString().slice(-6)}`,
        patientId: patientId || 'pat-001',
        patientName: patientName || 'Rameshwar Lal Sharma',
        patientAge: patientAge || 58,
        patientGender: patientGender || 'Male',
        patientPhone: patientPhone || '9876543210',
        village: village || 'Rampur Village',
        languageInput: normalizedLang,
        rawInput: text,
        translatedInputEn: generatedData.translatedInputEn || text,
        chiefComplaint: generatedData.chiefComplaint || 'Acute Symptom Evaluation',
        chiefComplaintHi: generatedData.chiefComplaintHi || 'स्वास्थ्य लक्षण परीक्षण',
        symptoms: generatedData.symptoms || ['Fever', 'Fatigue'],
        symptomsHi: generatedData.symptomsHi || ['बुखार', 'थकान'],
        duration: generatedData.duration || '2–3 Days',
        durationHi: generatedData.durationHi || '2–3 दिन',
        riskLevel: (generatedData.riskLevel as 'Green' | 'Yellow' | 'Red') || 'Yellow',
        riskReason:
          generatedData.riskReason || 'Sustained symptoms warrant outpatient clinical evaluation.',
        riskReasonHi:
          generatedData.riskReasonHi || 'प्राथमिक स्वास्थ्य केंद्र में चिकित्सकीय जांच आवश्यक है।',
        recommendedDepartment: generatedData.recommendedDepartment || 'General Medicine (PHC OPD)',
        recommendedDepartmentHi: generatedData.recommendedDepartmentHi || 'सामान्य चिकित्सा विभाग',
        preliminaryAdvice: generatedData.preliminaryAdvice || ['Rest and maintain hydration.'],
        preliminaryAdviceHi: generatedData.preliminaryAdviceHi || [
          'विश्राम करें और पर्याप्त पानी पिएं।'
        ],
        redFlags: generatedData.redFlags || ['Worsening pain or shortness of breath'],
        status: 'PENDING_REVIEW',
        createdAt: 'Just now',
        targetDoctorId: 'doc-001',
        targetFacilityId: 'fac-001'
      };

      triageReports.unshift(newReport);

      return res.json({ success: true, report: newReport });
    } catch (err: any) {
      console.error('Triage error:', err);
      res.status(500).json({ error: 'Failed to process triage report', details: err.message });
    }
  });

  // Interactive Clinical Triage Dialogue Endpoint
  app.post('/api/gemini/triage-chat', async (req, res) => {
    try {
      const { messages = [], language = 'en', step = 1 } = req.body;
      const normalizedLang: 'en' | 'hi' = language === 'hi' ? 'hi' : 'en';
      const client = getGeminiClient();
      let reply = '';
      let isFinalTriage = false;
      let assessedRisk: 'Green' | 'Yellow' | 'Red' = 'Yellow';

      if (client) {
        try {
          const targetLangName = normalizedLang === 'hi' ? 'Hindi (हिंदी)' : 'English';
          const systemInstruction = `You are SwasthSetu Clinical Triage AI, a formal clinical triage assistant for public primary healthcare in India.
Conduct a structured clinical triage dialogue step by step in ${targetLangName}.
CRITICAL RULES:
- Respond strictly in ${targetLangName}. Do not mix languages.
- Maintain a calm, formal, professional medical tone. Do not use emojis.
- Remind patients that this guidance is informational and not a substitute for professional medical diagnosis.

Risk levels:
- Low Risk (Routine OPD): Mild cold, runny nose, minor fatigue without fever.
- Moderate Risk (Priority PHC Visit): Sustained fever >2 days, productive cough, diarrhea, vomiting, moderate pain, antenatal discomfort.
- High Risk (Emergency 108): Chest pain or pressure, severe breathlessness, blood in vomit/cough, unconsciousness, acute pregnancy complications, sudden weakness or paralysis.

Keep responses concise and structured (under 100 words).`;

          const conversationContents = messages
            .map((m: any) => `${m.role === 'user' ? 'Patient' : 'Assistant'}: ${m.content}`)
            .join('\n\n');

          const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `${conversationContents}\n\nAssistant (${targetLangName}):`,
            config: {
              systemInstruction,
              temperature: 0.3
            }
          });

          reply = response.text || '';
        } catch (chatErr) {
          console.warn('Gemini interactive triage chat failed:', chatErr);
        }
      }

      if (!reply) {
        const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
        if (
          lastMsg.includes('chest') ||
          lastMsg.includes('सीने') ||
          lastMsg.includes('सांस') ||
          lastMsg.includes('breath') ||
          lastMsg.includes('खून')
        ) {
          assessedRisk = 'Red';
          isFinalTriage = true;
          reply =
            normalizedLang === 'hi'
              ? 'उच्च जोखिम चेतावनी (आपातकाल):\nये लक्षण गंभीर हो सकते हैं। कृपया तुरंत 108 पर कॉल कर सरकारी आपातकालीन एम्बुलेंस बुलाएं या निकटतम जिला अस्पताल के आपातकालीन विभाग में जाएं। मरीज़ को शांत और बैठी अवस्था में रखें।'
              : 'HIGH RISK NOTICE (Emergency):\nThese symptoms may indicate a medical emergency. Please call 108 immediately for a government ambulance or proceed to the nearest District Hospital emergency department.';
        } else if (step === 1) {
          reply =
            normalizedLang === 'hi'
              ? 'नमस्ते। कृपया बताएं कि यह समस्या कितने दिनों से है और क्या आपको बुखार या शरीर में तेज दर्द है?'
              : 'Hello. How many days have you experienced these symptoms, and do you have a fever or significant pain?';
        } else if (step === 2) {
          reply =
            normalizedLang === 'hi'
              ? 'क्या आपको सांस लेने में कठिनाई, सीने में भारीपन, या चक्कर आने जैसा कोई लक्षण है?'
              : 'Are you experiencing any shortness of breath, chest tightness, or dizziness?';
        } else {
          isFinalTriage = true;
          assessedRisk = 'Yellow';
          reply =
            normalizedLang === 'hi'
              ? 'मध्यम जोखिम (PHC परामर्श अनुशंसित):\nआपके लक्षणों के आधार पर आज ही निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC) में चिकित्सक से जांच कराना उचित रहेगा।\n• उबला हुआ पानी पिएं और विश्राम करें।\n• क्या आप चिकित्सक के लिए संरचित ट्राइएज सारांश तैयार करना चाहेंगे?'
              : 'MODERATE RISK (PHC Visit Recommended):\nBased on your symptoms, an in-person consultation at your nearest Primary Health Centre (PHC) is recommended today.\n• Maintain hydration with clean water and rest.\n• You may generate a structured clinical triage summary for your physician.';
        }
      }

      res.json({ reply, riskLevel: assessedRisk, isFinalTriage });
    } catch (err: any) {
      console.error('Triage chat error:', err);
      res.status(500).json({ error: 'Interactive triage failed', details: err.message });
    }
  });

  // Gemini status check
  app.get('/api/gemini/status', (_req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const isConfigured = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '');
    res.json({
      configured: isConfigured,
      model: 'gemini-2.5-flash',
      provider: 'Google AI Studio / Gemini API'
    });
  });

  // Multilingual Health Assistant Chatbot endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message, language = 'en', history = [] } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const client = getGeminiClient();
      let replyText = '';
      let isGeminiPowered = false;

      const languageNames: Record<string, string> = {
        en: 'English',
        hi: 'Hindi (हिंदी)',
        bn: 'Bengali (বাংলা)',
        ta: 'Tamil (தமிழ்)',
        te: 'Telugu (తెలుగు)',
        gu: 'Gujarati (ગુજરાતી)',
        kn: 'Kannada (ಕನ್ನಡ)',
        ml: 'Malayalam (മലയാളം)',
        pa: 'Punjabi (ਪੰਜਾਬੀ)',
        or: 'Odia (ଓଡ଼ିଆ)',
        ur: 'Urdu (اردو)',
        es: 'Spanish (Español)',
        fr: 'French (Français)'
      };

      const safeLanguage = Object.prototype.hasOwnProperty.call(languageNames, language)
        ? language
        : 'en';
      const targetLangName = languageNames[safeLanguage] || 'English';

      if (client) {
        try {
          const systemInstruction = `You are SwasthSetu AI, a formal, trustworthy clinical healthcare awareness assistant supporting India's public health ecosystem.

LANGUAGE REQUIREMENT:
- Respond completely in ${targetLangName}.
- If the target language is Hindi, reply in clear, formal Devanagari Hindi.
- If the target language is English, reply in clear, formal, concise English.
- Do NOT use emojis, exclamation-mark hype, or casual phrasing.

CLINICAL GUIDELINES:
1. Assessment: Analyze the user's symptoms, duration, and severity clearly in plain clinical terms.
2. Risk Level: Clearly state the estimated urgency:
   - Low Risk (Home Care / Routine OPD): Safe supportive care, hydration, rest.
   - Moderate Risk (PHC/CHC Consultation): Recommend an in-person physician evaluation at the nearest Primary or Community Health Centre.
   - High Risk (Emergency — Dial 108): For chest pain, severe breathlessness, stroke signs, head trauma, snake bite, or severe pregnancy complications, instruct the user to dial 108 immediately.
3. Next Steps: Provide 2–4 concise, evidence-based supportive care steps and warning signs requiring immediate medical attention.
4. Public Health Context: Reference PHC services, Jan Aushadhi generic pharmacies, or Ayushman Bharat PM-JAY when applicable.
5. Disclaimer: Remember this is informational guidance and does not replace a licensed physician's examination. Keep formatting clean with short paragraphs and bullet points.`;

          const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

          if (Array.isArray(history) && history.length > 0) {
            for (const h of history.slice(-8)) {
              if (h.text) {
                formattedContents.push({
                  role:
                    h.sender === 'assistant' || h.role === 'assistant' || h.role === 'model'
                      ? 'model'
                      : 'user',
                  parts: [{ text: h.text }]
                });
              }
            }
          }

          formattedContents.push({
            role: 'user',
            parts: [{ text: `Language: ${targetLangName}\nPatient Query: ${message}` }]
          });

          const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.3
            }
          });

          if (response.text) {
            replyText = response.text;
            isGeminiPowered = true;
          }
        } catch (chatErr) {
          console.warn('Gemini chat failed, using fallback clinical engine:', chatErr);
        }
      }

      if (!replyText) {
        const msg = message.toLowerCase();
        const isHi = safeLanguage === 'hi';

        // 1. Emergency / Cardiopulmonary
        if (
          msg.includes('सीने') ||
          msg.includes('chest') ||
          msg.includes('सांस') ||
          msg.includes('breath') ||
          msg.includes('attack') ||
          msg.includes('छाती') ||
          msg.includes('heart') ||
          msg.includes('दिल') ||
          msg.includes('behos') ||
          msg.includes('बेहोश')
        ) {
          replyText = isHi
            ? 'आपातकालीन चेतावनी (उच्च जोखिम):\nसीने में जकड़न, तेज दर्द या सांस लेने में गंभीर कठिनाई हृदय या श्वसन आपातकाल का संकेत हो सकती है।\n• तुरंत 108 पर कॉल कर सरकारी आपातकालीन एम्बुलेंस बुलाएं।\n• मरीज़ को सहारा देकर बैठाएं और पर्याप्त हवा की व्यवस्था रखें।\n• किसी भी प्रकार का शारीरिक श्रम न करने दें।'
            : 'EMERGENCY NOTICE (High Risk):\nChest pain, tightness, or acute shortness of breath may indicate a serious cardiopulmonary emergency.\n• Call 108 immediately for a government emergency ambulance.\n• Keep the patient seated upright in a well-ventilated area and avoid exertion.\n• Proceed immediately to the nearest emergency department.';
        }
        // 2. Gastrointestinal
        else if (
          msg.includes('stomach') ||
          msg.includes('पेट') ||
          msg.includes('दस्त') ||
          msg.includes('उल्टी') ||
          msg.includes('vomit') ||
          msg.includes('loose') ||
          msg.includes('motion') ||
          msg.includes('गैस') ||
          msg.includes('acidity') ||
          msg.includes('कब्ज')
        ) {
          const isLooseMotion =
            msg.includes('दस्त') ||
            msg.includes('loose') ||
            msg.includes('motion') ||
            msg.includes('उल्टी') ||
            msg.includes('vomit');
          if (isLooseMotion) {
            replyText = isHi
              ? 'मध्यम जोखिम — दस्त एवं उल्टी मार्गदर्शन:\n• 1 पैकेट ओआरएस (ORS) को 1 लीटर उबले ठंडे पानी में घोलकर हर दस्त के बाद घूंट-घूंट पिएं।\n• दही-चावल, केला और मूंग दाल की पतली खिचड़ी जैसा हल्का आहार लें।\n• यदि 24–48 घंटे से अधिक समस्या रहे, अत्यधिक कमजोरी हो, या मल में रक्त आए, तो तुरंत PHC चिकित्सक से परामर्श लें।'
              : 'MODERATE RISK — Gastroenteritis Guidance:\n• Dissolve 1 sachet of ORS in 1 litre of clean boiled water and sip regularly after each episode.\n• Eat bland, easily digestible foods such as rice, curd, banana, and clear broth.\n• Visit your nearest PHC if symptoms persist beyond 24–48 hours, or sooner if signs of dehydration or blood in stool occur.';
          } else {
            replyText = isHi
              ? 'पेट दर्द और गैस हेतु प्रारंभिक मार्गदर्शन:\n• गुनगुना पानी पिएं तथा तले-मसालेदार भोजन से बचें।\n• पेट पर हल्की गर्म सिकाई से आराम मिल सकता है।\n• यदि दर्द अचानक तेज हो या दाहिनी निचली तरफ बना रहे, तो तुरंत PHC चिकित्सक से जांच कराएं।'
              : 'Abdominal Discomfort & Acidity Guidance:\n• Drink warm water and avoid spicy, heavy, or fried meals.\n• Rest and apply a mild warm compress for comfort.\n• Seek prompt clinical evaluation at the PHC if pain becomes severe, persistent, or localized to the lower right abdomen.';
          }
        }
        // 3. Animal Bites
        else if (
          msg.includes('dog') ||
          msg.includes('कुत्ता') ||
          msg.includes('bite') ||
          msg.includes('काटा') ||
          msg.includes('snake') ||
          msg.includes('सांप') ||
          msg.includes('monkey') ||
          msg.includes('बंदर') ||
          msg.includes('रेबीज') ||
          msg.includes('rabies')
        ) {
          const isSnake = msg.includes('snake') || msg.includes('सांप');
          if (isSnake) {
            replyText = isHi
              ? 'आपातकालीन चेतावनी — सर्पदंश (उच्च जोखिम):\n• मरीज़ को शांत रखें और प्रभावित अंग को स्थिर रखें।\n• घाव पर चीरा न लगाएं और न ही कसकर रस्सी बांधें।\n• एंटी-स्नेक वेनम (ASV) उपचार के लिए तुरंत 108 एम्बुलेंस बुलाकर सरकारी अस्पताल जाएं।'
              : 'EMERGENCY NOTICE — Snake Bite (High Risk):\n• Keep the patient calm and immobilize the affected limb.\n• Do not cut the wound, attempt suction, or tie tight tourniquets.\n• Call 108 and transfer immediately to the nearest Government Hospital for Anti-Snake Venom (ASV).';
          } else {
            replyText = isHi
              ? 'पशु काटने पर तत्काल प्राथमिक उपचार (मध्यम जोखिम):\n• घाव को बहते पानी और साबुन से कम से कम 15 मिनट तक लगातार धोएं।\n• घाव पर मिर्च, हल्दी, चूना या कोई घरेलू पदार्थ न लगाएं।\n• निःशुल्क एंटी-रेबीज (ARV) और टिटनेस टीकाकरण के लिए आज ही निकटतम PHC जाएं।'
              : 'Animal Bite First Aid (Moderate Risk — Prompt PHC Visit):\n• Wash the wound thoroughly under running tap water with soap for at least 15 minutes.\n• Do not apply household irritants or bandage tightly.\n• Visit your nearest PHC immediately for free Anti-Rabies Vaccine (ARV) and Tetanus Toxoid prophylaxis.';
          }
        }
        // 4. Headache, Eye, Ear, Dental
        else if (
          msg.includes('headache') ||
          msg.includes('सिरदर्द') ||
          msg.includes('चक्कर') ||
          msg.includes('dizzy') ||
          msg.includes('आंख') ||
          msg.includes('eye') ||
          msg.includes('ear') ||
          msg.includes('कान') ||
          msg.includes('दांत') ||
          msg.includes('tooth')
        ) {
          replyText = isHi
            ? 'सिरदर्द, चक्कर या आंख/दांत की समस्या हेतु मार्गदर्शन:\n• शांत और कम रोशनी वाले स्थान पर विश्राम करें तथा पर्याप्त पानी पिएं।\n• आंखों में जलन होने पर साफ पानी से धोएं और हाथों से न मलें।\n• दांत दर्द में गुनगुने नमक के पानी से कुल्ला करें और PHC दंत चिकित्सक से परामर्श लें।'
            : 'Headache, Eye, or Dental Guidance:\n• Rest in a quiet, dimly lit environment and maintain adequate hydration.\n• Rinse irritated eyes gently with clean water without rubbing.\n• For toothache, rinse with warm saline water and schedule an OPD visit at your PHC.';
        }
        // 5. Skin / Wounds
        else if (
          msg.includes('skin') ||
          msg.includes('त्वचा') ||
          msg.includes('खुजली') ||
          msg.includes('itch') ||
          msg.includes('दाद') ||
          msg.includes('rash') ||
          msg.includes('घाव') ||
          msg.includes('wound') ||
          msg.includes('जल') ||
          msg.includes('burn')
        ) {
          replyText = isHi
            ? 'त्वचा संक्रमण एवं घाव हेतु मार्गदर्शन (कम जोखिम):\n• प्रभावित स्थान को साफ व सूखा रखें और ढीले सूती वस्त्र पहनें।\n• कपड़ों को गर्म पानी में धोकर धूप में सुखाएं।\n• निर्धारित एंटीफंगल क्रीम या उपचार के लिए निकटतम PHC ओपीडी में चिकित्सक को दिखाएं।'
            : 'Skin Rash & Wound Care Guidance (Low Risk):\n• Keep the affected area clean and dry, and wear breathable cotton clothing.\n• Wash garments and linens in warm water and dry thoroughly in sunlight.\n• Consult the PHC physician for appropriate topical treatment via Jan Aushadhi.';
        }
        // 6. Joint Pain
        else if (
          msg.includes('joint') ||
          msg.includes('घुटने') ||
          msg.includes('जोड़ों') ||
          msg.includes('knee') ||
          msg.includes('कमर') ||
          msg.includes('back') ||
          msg.includes('हड्डी') ||
          msg.includes('arthritis')
        ) {
          replyText = isHi
            ? 'जोड़ों एवं कमर दर्द हेतु मार्गदर्शन:\n• प्रभावित स्थान पर दिन में दो बार 15 मिनट गुनगुने पानी की सिकाई करें।\n• भारी वजन उठाने और जमीन पर देर तक बैठने से बचें।\n• कैल्शियम व विटामिन डी मूल्यांकन के लिए PHC ओपीडी में चिकित्सक से मिलें।'
            : 'Joint and Back Pain Guidance:\n• Apply a warm compress for 15 minutes twice daily.\n• Avoid squatting on the floor and lifting heavy loads.\n• Visit the PHC OPD for evaluation and guidance on Calcium/Vitamin D supplementation.';
        }
        // 7. Diabetes & Hypertension
        else if (
          msg.includes('diabetes') ||
          msg.includes('sugar') ||
          msg.includes('शुगर') ||
          msg.includes('मधुमेह') ||
          msg.includes('bp') ||
          msg.includes('blood pressure') ||
          msg.includes('बीपी') ||
          msg.includes('दबाव')
        ) {
          replyText = isHi
            ? 'मधुमेह (शुगर) एवं उच्च रक्तचाप (BP) प्रबंधन:\n• भोजन में नमक, चीनी और अधिक तैलीय पदार्थों को सीमित करें।\n• प्रतिदिन 30 मिनट नियमित पैदल चलें और निर्धारित दवाएं समय पर लें।\n• निकटतम आयुष्मान आरोग्य मंदिर या PHC में मासिक निःशुल्क बीपी व शुगर जांच कराएं।'
            : 'Diabetes and Hypertension Management:\n• Reduce dietary sodium, added sugars, and saturated fats.\n• Aim for 30 minutes of daily walking and take prescribed medications consistently.\n• Utilize free monthly blood pressure and blood glucose screening at your nearest Health & Wellness Centre or PHC.';
        }
        // 8. Fever, Cold, Cough
        else if (
          msg.includes('बुखार') ||
          msg.includes('fever') ||
          msg.includes('ताप') ||
          msg.includes('cold') ||
          msg.includes('जुकाम') ||
          msg.includes('खांसी') ||
          msg.includes('cough') ||
          msg.includes('dengue') ||
          msg.includes('malaria') ||
          msg.includes('डेंगू') ||
          msg.includes('मलेरिया')
        ) {
          replyText = isHi
            ? 'मध्यम जोखिम — बुखार एवं श्वसन लक्षण मार्गदर्शन:\n• उबला हुआ गुनगुना पानी और ओआरएस (ORS) पर्याप्त मात्रा में लें।\n• 100°F से अधिक बुखार होने पर भोजन के बाद पैरासिटामोल 500mg ली जा सकती है।\n• यदि बुखार 2–3 दिनों से अधिक बना रहे, तो मलेरिया व डेंगू जांच के लिए निकटतम PHC में चिकित्सक से परामर्श लें।'
            : 'MODERATE RISK — Fever and Respiratory Guidance:\n• Maintain hydration with clean boiled water and ORS.\n• Paracetamol 500 mg may be taken after meals if temperature exceeds 100°F.\n• If fever persists beyond 48–72 hours or is accompanied by chills, visit your nearest PHC for rapid malaria/dengue screening and physician evaluation.';
        }
        // 9. Immunization
        else if (
          msg.includes('टीका') ||
          msg.includes('vaccine') ||
          msg.includes('बच्चे') ||
          msg.includes('child') ||
          msg.includes('baby') ||
          msg.includes('शिशु')
        ) {
          replyText = isHi
            ? 'सार्वभौमिक टीकाकरण कार्यक्रम (मिशन इंद्रधनुष):\nबच्चों को सभी 12 आवश्यक टीके (पोलियो, बीसीजी, पेंटावेलेंट, रोटावायरस, खसरा-रूबेला आदि) सरकारी अस्पताल, PHC और उप-केंद्र पर निःशुल्क लगाए जाते हैं। टीकाकरण कार्ड के साथ अपनी क्षेत्रीय आशा (ASHA) या एएनएम (ANM) से संपर्क करें।'
            : 'Universal Immunization Programme (Mission Indradhanush):\nAll 12 essential pediatric vaccines (including Polio, BCG, Pentavalent, Rotavirus, and Measles-Rubella) are provided free of charge at Government Hospitals, PHCs, and Sub-Centres. Bring your immunization card to your local ASHA or ANM clinic.';
        }
        // 10. Antenatal / Maternal Care
        else if (
          msg.includes('गर्भवती') ||
          msg.includes('pregnancy') ||
          msg.includes('mother') ||
          msg.includes('माता') ||
          msg.includes('anc') ||
          msg.includes('प्रसव')
        ) {
          replyText = isHi
            ? 'मातृ स्वास्थ्य एवं प्रसव पूर्व देखभाल (PMSMA):\nगर्भवती महिलाओं को सरकारी PHC पर 4 निःशुल्क प्रसव पूर्व जांच (ANC), रक्तचाप परीक्षण, अल्ट्रासाउंड, आयरन-फोलिक एसिड व कैल्शियम की गोलियां और टिटनेस टीकाकरण उपलब्ध है। पौष्टिक आहार लें और नियमित जांच कराएं।'
            : 'Maternal and Antenatal Care (PMSMA):\nPregnant women are entitled to 4 free antenatal checkups (ANC), blood pressure and hemoglobin screening, ultrasound scans, and iron-folic acid and calcium supplements at Government PHCs and Sub-Centres.';
        }
        // 11. Public Schemes
        else if (
          msg.includes('ayushman') ||
          msg.includes('आयुष्मान') ||
          msg.includes('कार्ड') ||
          msg.includes('card') ||
          msg.includes('जन औषधि') ||
          msg.includes('aushadhi') ||
          msg.includes('दवा') ||
          msg.includes('medicine') ||
          msg.includes('phc')
        ) {
          replyText = isHi
            ? 'सार्वजनिक स्वास्थ्य योजनाएं:\n• आयुष्मान भारत (PM-JAY): पात्र परिवारों को सूचीबद्ध अस्पतालों में प्रति वर्ष ₹5 लाख तक का निःशुल्क उपचार। हेल्पलाइन: 14555।\n• प्रधानमंत्री जन औषधि केंद्र: गुणवत्तापूर्ण जेनेरिक दवाएं किफायती दरों पर अथवा PHC में निःशुल्क उपलब्ध।\n• सामान्य PHC ओपीडी समय: प्रातः 08:00 से दोपहर 02:00 बजे तक।'
            : 'Public Healthcare Schemes:\n• Ayushman Bharat (PM-JAY): Provides up to ₹5 Lakh annual cashless hospital coverage per eligible family at empaneled hospitals. Helpline: 14555.\n• Jan Aushadhi Pharmacies: Quality generic medicines at subsidized rates, or free at government PHC dispensaries.\n• Standard PHC OPD Hours: 08:00 AM to 02:00 PM.';
        }
        // 12. Default contextual response
        else {
          replyText = isHi
            ? `आपका प्रश्न प्राप्त हुआ: "${message.trim()}"\n\nकृपया लक्षणों की अवधि, बुखार या दर्द की तीव्रता और अन्य संबंधित लक्षणों का विवरण साझा करें ताकि अधिक सटीक प्रारंभिक मार्गदर्शन दिया जा सके। यदि आप चाहें, तो आप चिकित्सक के लिए संरचित ट्राइएज सारांश भी तैयार कर सकते हैं।`
            : `Thank you for your inquiry regarding: "${message.trim()}"\n\nPlease share additional details such as symptom duration, severity, fever readings, or associated discomfort so I can provide more structured preliminary guidance. You may also generate a formal clinical triage summary for your attending PHC physician.`;
        }
      }

      res.json({ reply: replyText, language: safeLanguage, isGeminiPowered });
    } catch (err: any) {
      console.error('Chat error:', err);
      res.status(500).json({ error: 'Chat failed', details: err.message });
    }
  });

  // Appointments API
  app.get('/api/appointments', (_req, res) => {
    res.json(appointments);
  });

  app.post('/api/appointments', (req, res) => {
    const {
      patientName,
      patientAge,
      patientPhone,
      facilityId,
      facilityName,
      doctorId,
      doctorName,
      specialty,
      chiefComplaint,
      triageReportId,
      riskLevel,
      timeSlot
    } = req.body;

    const nextToken =
      appointments.length > 0 ? Math.max(...appointments.map((a) => a.tokenNumber)) + 1 : 1;

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}`,
      tokenNumber: nextToken,
      patientId: 'pat-001',
      patientName: patientName || 'Rameshwar Lal Sharma',
      patientAge: patientAge || 58,
      patientPhone: patientPhone || '9876543210',
      facilityId: facilityId || 'fac-001',
      facilityName: facilityName || 'Sitapur Primary Health Centre (PHC)',
      facilityNameHi: 'सीतापुर प्राथमिक स्वास्थ्य केंद्र (PHC)',
      doctorId: doctorId || 'doc-001',
      doctorName: doctorName || 'Dr. Rajesh Kumar',
      doctorSpecialty: specialty || 'General Physician',
      appointmentDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      timeSlot: timeSlot || '10:00 AM – 11:00 AM',
      status: 'WAITING',
      triageReportId,
      riskLevel: riskLevel || 'Yellow',
      triageRiskLevel: riskLevel || 'Yellow',
      chiefComplaint: chiefComplaint || 'Routine Health Consultation',
      estimatedWaitMinutes: Math.min(45, (nextToken - 1) * 5),
      createdAt: 'Just now'
    };

    appointments.unshift(newAppointment);
    res.json({ success: true, appointment: newAppointment });
  });

  app.patch('/api/appointments/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const index = appointments.findIndex((a) => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    appointments[index].status = status;
    res.json({ success: true, appointment: appointments[index] });
  });

  // Prescriptions API
  app.get('/api/prescriptions', (_req, res) => {
    res.json(prescriptions);
  });

  app.post('/api/prescriptions', (req, res) => {
    const {
      patientName,
      patientAge,
      patientGender,
      abhaId,
      diagnosis,
      diagnosisHi,
      chiefComplaint,
      medicines,
      labTestsRecommended,
      labTestsRecommendedHi,
      dietaryAdvice,
      dietaryAdviceHi,
      reportId
    } = req.body;

    const newRx: Prescription = {
      id: `RX-${Date.now().toString().slice(-6)}`,
      patientId: 'pat-001',
      patientName: patientName || 'Rameshwar Lal Sharma',
      patientAge: patientAge || 58,
      patientGender: patientGender || 'Male',
      abhaId: abhaId || '91-4829-1029-4820',
      doctorId: 'doc-001',
      doctorName: 'Dr. Rajesh Kumar (MBBS, MD)',
      doctorSpecialty: 'Senior Medical Officer — General Medicine',
      doctorRegistrationNo: 'MCI-UP-49201',
      facilityName: 'Sitapur Primary Health Centre (PHC), Govt. of UP',
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      diagnosis: diagnosis || 'Acute Symptom Consultation',
      diagnosisHi: diagnosisHi || 'स्वास्थ्य परामर्श व जांच',
      chiefComplaint: chiefComplaint || 'Patient visited with acute complaints',
      medicines: medicines || [
        {
          id: 'm1',
          name: 'Tab. Paracetamol 500mg (Jan Aushadhi)',
          dosage: '1 tablet as needed',
          frequency: '1-0-1 (After meals)',
          frequencyHi: 'सुबह-शाम भोजन के बाद',
          duration: '3 Days',
          instructions: 'Take with warm water.',
          instructionsHi: 'गुनगुने पानी के साथ लें।'
        }
      ],
      labTests: labTestsRecommended || [],
      labTestsRecommended: labTestsRecommended || [],
      labTestsRecommendedHi: labTestsRecommendedHi || [],
      advice: dietaryAdvice || 'Maintain adequate hydration and rest.',
      adviceHi: dietaryAdviceHi || 'पर्याप्त पानी पिएं और विश्राम करें।',
      dietaryAdvice: dietaryAdvice || 'Maintain adequate hydration and rest.',
      dietaryAdviceHi: dietaryAdviceHi || 'पर्याप्त पानी पिएं और विश्राम करें।',
      followUpDate: 'After 3 days if symptoms persist',
      reportId
    };

    prescriptions.unshift(newRx);

    const matchingApt = appointments.find(
      (a) => a.triageReportId === reportId || a.patientName === patientName
    );
    if (matchingApt) {
      matchingApt.status = 'COMPLETED';
    }

    res.json({ success: true, prescription: newRx });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SwasthSetu AI Server running on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start SwasthSetu server:', err);
  process.exit(1);
});
