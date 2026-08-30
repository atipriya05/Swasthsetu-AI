import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { MOCK_TRIAGE_REPORTS, MOCK_APPOINTMENTS, MOCK_PRESCRIPTIONS, MOCK_FACILITIES } from './src/data/mockData';
import { AITriageReport, Appointment, Prescription } from './src/types';

dotenv.config();

// In-memory persistent state for live synchronization
let triageReports: AITriageReport[] = [...MOCK_TRIAGE_REPORTS];
let appointments: Appointment[] = [...MOCK_APPOINTMENTS];
let prescriptions: Prescription[] = [...MOCK_PRESCRIPTIONS];

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

// Comprehensive clinical triage engine for rural Indian healthcare
function fallbackTriage(input: string, lang: 'en' | 'hi' | 'mr'): Partial<AITriageReport> {
  const lower = input.toLowerCase();
  
  // 1. Emergency Red Flags (Chest pain, severe breathlessness, loss of consciousness, severe bleeding, stroke)
  if (
    lower.includes('chest') || lower.includes('सीने') || lower.includes('छाती') ||
    lower.includes('heart') || lower.includes('दिल') || lower.includes('attack') ||
    lower.includes('breath') || lower.includes('सांस') || lower.includes('श्वास') ||
    lower.includes('unconscious') || lower.includes('बेहोश') || lower.includes('bleeding') || lower.includes('खून') ||
    lower.includes('paralysis') || lower.includes('लकवा') || lower.includes('stroke')
  ) {
    return {
      translatedInputEn: `Patient reports acute chest distress/cardiorespiratory emergency: "${input}"`,
      chiefComplaint: 'Acute Chest Distress / Severe Cardiopulmonary Emergency',
      chiefComplaintHi: 'सीने में दर्द / सांस लेने में गंभीर तकलीफ (आपातकालीन)',
      symptoms: ['Crushing chest tightness / pain', 'Dyspnea / Shortness of breath', 'Diaphoresis / Cold sweats'],
      symptomsHi: ['सीने में भारीपन व तेज दर्द', 'सांस फूलना व घबराहट', 'अत्यधिक पसीना आना'],
      duration: 'Acute onset (< 2 hours)',
      durationHi: 'अचानक शुरू (2 घंटे के अंदर)',
      riskLevel: 'Red',
      riskReason: 'CRITICAL EMERGENCY: Signs of acute cardiopulmonary distress. Immediate 108 ambulance dispatch and emergency hospital referral required.',
      riskReasonHi: 'अति गंभीर आपातकाल: कार्डियोवस्कुलर या तीव्र श्वसन संकट के लक्षण। तुरंत 108 एम्बुलेंस से जिला अस्पताल आईसीयू में रेफर करें।',
      recommendedDepartment: 'Emergency Medicine / Cardiology ICU',
      recommendedDepartmentHi: 'आपातकालीन चिकित्सा / हृदय रोग विभाग',
      preliminaryAdvice: [
        'Sit patient in a semi-reclined position with maximum fresh air ventilation.',
        'Chew Aspirin 300mg immediately if not allergic.',
        'Dial 108 immediately for free government emergency ambulance.'
      ],
      preliminaryAdviceHi: [
        'मरीज को सहारा देकर आरामदायक स्थिति में बैठाएं तथा ताजी हवा आने दें।',
        'एलर्जी न होने पर डिस्प्रिन / एस्पिरिन 300mg पानी में घोलकर दें।',
        'मुफ्त सरकारी 108 एम्बुलेंस को तुरंत कॉल करें।'
      ],
      redFlags: ['Crushing chest pressure radiating to left arm', 'Severe shortness of breath', 'Cold clammy skin']
    };
  }

  // 2. Animal Bites / Venom / Burns / Trauma
  if (
    lower.includes('dog') || lower.includes('कुत्ता') || lower.includes('bite') || lower.includes('काटा') ||
    lower.includes('snake') || lower.includes('सांप') || lower.includes('monkey') || lower.includes('बंदर') ||
    lower.includes('burn') || lower.includes('जल') || lower.includes('cut') || lower.includes('घाव') || lower.includes('चोट')
  ) {
    const isRabies = lower.includes('dog') || lower.includes('कुत्ता') || lower.includes('monkey') || lower.includes('बंदर');
    const isSnake = lower.includes('snake') || lower.includes('सांप');
    return {
      translatedInputEn: `Patient presents with acute trauma/bite: "${input}"`,
      chiefComplaint: isSnake ? 'Suspected Snake Bite / Envenomation' : (isRabies ? 'Animal Bite / Anti-Rabies Prophylaxis' : 'Acute Wound & Burn Management'),
      chiefComplaintHi: isSnake ? 'सर्पदंश / विषैले जीव का काटना' : (isRabies ? 'कुत्ते या जानवर का काटना / रेबीज टीका' : 'घाव, चोट व जलने का प्राथमिक उपचार'),
      symptoms: isSnake ? ['Bite fang marks', 'Local swelling & intense pain', 'Drowsiness'] : (isRabies ? ['Animal scratch / tooth puncture', 'Bleeding wound', 'Local pain'] : ['Skin laceration / burn erythema', 'Acute pain', 'Tissue bleeding']),
      symptomsHi: isSnake ? ['दांतों के निशान', 'सूजन व तेज दर्द', 'चक्कर व बेहोशी'] : (isRabies ? ['खरोंच या दांत का घाव', 'हल्का रक्तस्राव', 'दर्द व जलन'] : ['त्वचा कटना या जलना', 'तीव्र दर्द', 'घाव से खून निकलना']),
      duration: 'Immediate (< 24 hours)',
      durationHi: 'तात्कालिक (24 घंटे के अंदर)',
      riskLevel: isSnake ? 'Red' : 'Yellow',
      riskReason: isSnake ? 'Potential neurotoxic or hemotoxic envenomation requires emergency Anti-Snake Venom (ASV).' : 'Requires thorough soap-water wound washing and Tetanus + Anti-Rabies Vaccine (ARV) at PHC.',
      riskReasonHi: isSnake ? 'सांप के काटने पर तुरंत अस्पताल में एंटी-स्नेक वेनम (ASV) इंजेक्शन लगवाना अनिवार्य है।' : 'साबुन-पानी से 15 मिनट धोएं तथा PHC जाकर तुरंत रेबीज (ARV) और टिटनेस का टीका लगवाएं।',
      recommendedDepartment: isSnake ? 'Emergency Ward (ASV Protocol)' : 'General Surgery / Anti-Rabies Clinic (PHC)',
      recommendedDepartmentHi: isSnake ? 'आपातकालीन वार्ड (एंटी-वेनम)' : 'प्राथमिक स्वास्थ्य केंद्र (रेबीज टीकाकरण कक्ष)',
      preliminaryAdvice: [
        'Wash bite wound under running tap water with carbolic/laundry soap for at least 15 minutes.',
        'Do NOT tie tight tourniquets or cut the wound.',
        'Go immediately to PHC for free Anti-Rabies Vaccine (ARV) and Tetanus Toxoid (TT).'
      ],
      preliminaryAdviceHi: [
        'घाव को बहते पानी व साबुन से कम से कम 15 मिनट तक अच्छी तरह धोएं।',
        'घाव पर मिर्च, मिट्टी या पट्टी न बांधें और न ही चीरा लगाएं।',
        'तुरंत PHC जाकर सरकारी निःशुल्क रेबीज का टीका लगवाएं।'
      ],
      redFlags: ['Spreading swelling', 'Difficulty swallowing or breathing', 'Altered sensorium']
    };
  }

  // 3. Maternal & Pregnancy symptoms
  if (
    lower.includes('pregnant') || lower.includes('pregnancy') || lower.includes('गर्भवती') ||
    lower.includes('गर्भावस्था') || lower.includes('गरोदर') || lower.includes('delivery') || lower.includes('प्रसव')
  ) {
    return {
      translatedInputEn: `Patient seeking antenatal maternal evaluation: "${input}"`,
      chiefComplaint: 'Antenatal Care (ANC) Maternal Health Evaluation',
      chiefComplaintHi: 'गर्भावस्था में स्वास्थ्य जांच व मातृ सुरक्षा',
      symptoms: ['Dizziness / Lightheadedness', 'Nausea / Morning Sickness', 'Mild Pedal Edema (Foot Swelling)'],
      symptomsHi: ['चक्कर आना व कमजोरी', 'जी मिचलाना व उल्टी', 'पैरों में हल्की सूजन'],
      duration: '1-2 Days',
      durationHi: '1-2 दिन से',
      riskLevel: 'Yellow',
      riskReason: 'Maternal symptom requires clinical blood pressure (BP) and urine protein check to prevent pre-eclampsia and ensure fetal well-being.',
      riskReasonHi: 'गर्भावस्था में बीपी और रक्त जांच के लिए निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC) पर तुरंत मातृ सुरक्षा जांच आवश्यक है।',
      recommendedDepartment: 'Obstetrics & Gynecology (ANC OPD)',
      recommendedDepartmentHi: 'प्रसूति एवं महिला रोग विभाग (मातृ सुरक्षा)',
      preliminaryAdvice: [
        'Rest in left lateral position for 30 minutes to improve placental blood flow.',
        'Drink adequate clean water, ORS or fresh coconut water.',
        'Visit nearest PHC for free iron-folic acid supplements and BP monitoring.'
      ],
      preliminaryAdviceHi: [
        'बाईं करवट लेटकर 30 मिनट विश्राम करें।',
        'पर्याप्त मात्रा में स्वच्छ पानी, ओआरएस व नारियल पानी पिएं।',
        'निःशुल्क जांच व आयरन-कैल्शियम की गोलियों के लिए PHC आएं।'
      ],
      redFlags: ['Sudden high blood pressure', 'Visual blurring or severe headache', 'Vaginal bleeding or fluid leakage']
    };
  }

  // 4. Gastrointestinal (Stomach pain, diarrhea, vomiting, loose motions, acidity)
  if (
    lower.includes('stomach') || lower.includes('पेट') || lower.includes('pain') || lower.includes('दर्द') ||
    lower.includes('loose') || lower.includes('motion') || lower.includes('दस्त') || lower.includes('उल्टी') ||
    lower.includes('vomit') || lower.includes('acidity') || lower.includes('गैस') || lower.includes('कब्ज')
  ) {
    const isDiarrhea = lower.includes('motion') || lower.includes('दस्त') || lower.includes('loose') || lower.includes('vomit') || lower.includes('उल्टी');
    return {
      translatedInputEn: `Patient presents with gastrointestinal complaints: "${input}"`,
      chiefComplaint: isDiarrhea ? 'Acute Gastroenteritis / Diarrhea & Dehydration' : 'Abdominal Pain & Dyspepsia / Gastritis',
      chiefComplaintHi: isDiarrhea ? 'तीव्र दस्त व उल्टी / निर्जलीकरण' : 'पेट दर्द, गैस व बदहजमी',
      symptoms: isDiarrhea ? ['Watery loose stools', 'Nausea & vomiting', 'Mild dehydration'] : ['Epigastric abdominal cramps', 'Bloating & acidity', 'Loss of appetite'],
      symptomsHi: isDiarrhea ? ['पानी जैसे पतले दस्त', 'उल्टी व जी मिचलाना', 'शरीर में पानी की कमी'] : ['पेट में मरोड़ व तेज दर्द', 'गैस व खट्टी डकारें', 'भूख न लगना'],
      duration: '1-2 Days',
      durationHi: '1-2 दिन से',
      riskLevel: isDiarrhea ? 'Yellow' : 'Yellow',
      riskReason: 'Risk of acute dehydration and electrolyte imbalance. Requires ORS + Zinc hydration and PHC physician assessment.',
      riskReasonHi: 'दस्त व उल्टी में शरीर से पानी और नमक की कमी हो सकती है। ओआरएस का घोल और डॉक्टर की सलाह आवश्यक है।',
      recommendedDepartment: 'General Medicine / Gastroenterology OPD',
      recommendedDepartmentHi: 'सामान्य चिकित्सा विभाग (ओपीडी)',
      preliminaryAdvice: [
        'Prepare 1 packet ORS in 1 liter clean boiled water and drink sip-by-sip after every loose stool.',
        'Eat light easily digestible food like khichdi, banana, and curd.',
        'Do not take unprescribed anti-motility drugs; visit PHC for evaluation.'
      ],
      preliminaryAdviceHi: [
        '1 पैकेट ओआरएस 1 लीटर उबले ठंडे पानी में घोलकर हर दस्त के बाद एक-एक घूंट पिएं।',
        'दही-चावल, मूंग दाल की पतली खिचड़ी और केला खाएं।',
        'दवा के लिए निकटतम प्राथमिक स्वास्थ्य केंद्र (PHC) जाएं।'
      ],
      redFlags: ['Blood in stools or dark black stools', 'Extreme dry mouth and sunken eyes', 'Inability to keep fluids down']
    };
  }

  // 5. Orthopedic (Joint pain, knee swelling, backache, arthritis)
  if (
    lower.includes('joint') || lower.includes('घुटने') || lower.includes('जोड़ों') ||
    lower.includes('knee') || lower.includes('back') || lower.includes('कमर') || lower.includes('हड्डी')
  ) {
    return {
      translatedInputEn: `Patient reports musculoskeletal and joint complaints: "${input}"`,
      chiefComplaint: 'Musculoskeletal Pain / Osteoarthritis & Lumbar Strain',
      chiefComplaintHi: 'जोड़ों व घुटनों का दर्द / कमर में खिंचाव',
      symptoms: ['Joint stiffness upon waking', 'Localized knee / lower back ache', 'Difficulty walking or bending'],
      symptomsHi: ['सुबह उठने पर जोड़ों में अकड़न', 'घुटनों व कमर में दर्द', 'चलने-फिरने में तकलीफ'],
      duration: '1-2 Weeks',
      durationHi: '1-2 सप्ताह से',
      riskLevel: 'Green',
      riskReason: 'Chronic mechanical joint wear or muscular strain. Suitable for routine PHC physiotherapy and non-steroidal analgesics.',
      riskReasonHi: 'यह सामान्य जोड़ों का दर्द व मांसपेशियों का खिंचाव है। PHC में कैल्शियम-विटामिन और व्यायाम परामर्श लें।',
      recommendedDepartment: 'Orthopedics / Physical Medicine OPD',
      recommendedDepartmentHi: 'अस्थि रोग विभाग (हड्डी व जोड़)',
      preliminaryAdvice: [
        'Apply warm mustard oil or warm fomentation for 15 minutes twice daily.',
        'Avoid squatting and sitting flat on the floor.',
        'Take Calcium & Vitamin D3 supplements as advised at the PHC.'
      ],
      preliminaryAdviceHi: [
        'घुटनों व कमर पर गुनगुने पानी की सिकाई करें।',
        'जमीन पर पालथी मारकर बैठने और भारी वजन उठाने से बचें।',
        'PHC में डॉक्टर से सलाह लेकर कैल्शियम की गोली लें।'
      ],
      redFlags: ['Inability to bear any weight on the limb', 'Sudden hot, red, swollen joint with fever']
    };
  }

  // 6. Dermatological / Skin & Allergy
  if (
    lower.includes('skin') || lower.includes('त्वचा') || lower.includes('rash') ||
    lower.includes('itch') || lower.includes('खुजली') || lower.includes('दाद') || lower.includes('फुंसी')
  ) {
    return {
      translatedInputEn: `Patient presents with dermatological complaints: "${input}"`,
      chiefComplaint: 'Dermatological Rash & Cutaneous Fungal Infection',
      chiefComplaintHi: 'त्वचा पर लाल चकत्ते, खुजली व दाद संक्रमण',
      symptoms: ['Erythematous itchy skin lesions', 'Pruritus especially at night', 'Localized epidermal peeling'],
      symptomsHi: ['त्वचा पर लाल दाने व खुजली', 'रात में अधिक खुजली होना', 'त्वचा का छिलना'],
      duration: '4-5 Days',
      durationHi: '4-5 दिन से',
      riskLevel: 'Green',
      riskReason: 'Common superficial fungal (Tinea) or allergic dermatitis treatable with topical antifungal and antihistamines.',
      riskReasonHi: 'यह सामान्य दाद-खाज या एलर्जी का संक्रमण है। एंटीफंगल क्रीम और स्वच्छता से ठीक हो सकता है।',
      recommendedDepartment: 'Dermatology / General OPD',
      recommendedDepartmentHi: 'त्वचा रोग विभाग (PHC)',
      preliminaryAdvice: [
        'Wash clothes in boiling water, dry under direct sunlight, and iron inside out.',
        'Keep the infected area completely dry and wear loose cotton clothing.',
        'Obtain free Clotrimazole antifungal cream from the PHC Jan Aushadhi counter.'
      ],
      preliminaryAdviceHi: [
        'कपड़ों को गर्म पानी में धोकर तेज धूप में सुखाएं।',
        'प्रभावित स्थान को सूखा व साफ रखें तथा सूती कपड़े पहनें।',
        'PHC के जन औषधि केंद्र से निःशुल्क एंटीफंगल क्रीम प्राप्त करें।'
      ],
      redFlags: ['Rapidly spreading facial swelling or hives', 'Secondary bacterial pus formation with high fever']
    };
  }

  // 7. Eye / ENT / Dental (Headache, eyes, ear, teeth)
  if (
    lower.includes('eye') || lower.includes('आंख') || lower.includes('ear') || lower.includes('कान') ||
    lower.includes('tooth') || lower.includes('दांत') || lower.includes('headache') || lower.includes('सिरदर्द')
  ) {
    const isEye = lower.includes('eye') || lower.includes('आंख');
    const isTooth = lower.includes('tooth') || lower.includes('दांत');
    return {
      translatedInputEn: `Patient reports ENT/Ophthalmic/Dental complaints: "${input}"`,
      chiefComplaint: isEye ? 'Ocular Irritation & Conjunctivitis' : (isTooth ? 'Dental Caries & Odontogenic Pain' : 'Tension Cephalea / Severe Headache'),
      chiefComplaintHi: isEye ? 'आंखों में लाली, जलन व पानी आना' : (isTooth ? 'दांत में कीड़ा व मसूड़ों में सूजन' : 'तीव्र सिरदर्द व तनाव'),
      symptoms: isEye ? ['Conjunctival injection (redness)', 'Watery lacrimation', 'Mild photophobia'] : (isTooth ? ['Throbbing dental pain', 'Sensitivity to hot/cold', 'Mild gingival swelling'] : ['Bilateral throbbing headache', 'Neck muscle stiffness', 'Visual strain']),
      symptomsHi: isEye ? ['आंखें लाल होना', 'आंख से पानी व कीचड़ आना', 'रोशनी में चुभन'] : (isTooth ? ['दांत में टीस मारने वाला दर्द', 'ठंडा-गर्म लगना', 'मसूड़ों में सूजन'] : ['सिर में तेज भारीपन व दर्द', 'गर्दन में अकड़न', 'आंखों में खिंचाव']),
      duration: '2-3 Days',
      durationHi: '2-3 दिन से',
      riskLevel: 'Green',
      riskReason: 'Localized mild infection or tension cephalea. Suitable for primary care PHC intervention.',
      riskReasonHi: 'यह सामान्य संक्रमण या तनाव का लक्षण है। PHC में नेत्र सहायक या दंत चिकित्सक को दिखाएं।',
      recommendedDepartment: isEye ? 'Ophthalmology Clinic (PHC)' : (isTooth ? 'Dental Clinic (PHC)' : 'General Medicine OPD'),
      recommendedDepartmentHi: isEye ? 'नेत्र जांच कक्ष (PHC)' : (isTooth ? 'दंत चिकित्सा कक्ष (PHC)' : 'सामान्य चिकित्सा विभाग'),
      preliminaryAdvice: [
        'Wash eyes with clean cold water; do NOT rub with unwashed hands.',
        'For toothache, gargle with warm salt water three times daily.',
        'Rest in a quiet, dimly lit room and stay well-hydrated.'
      ],
      preliminaryAdviceHi: [
        'आंखों को साफ ताजे पानी से धोएं, गंदे हाथों से न मलें।',
        'दांत दर्द में हल्के गुनगुने नमक के पानी से कुल्ला करें।',
        'शांत कमरे में आराम करें और पर्याप्त पानी पिएं।'
      ],
      redFlags: ['Sudden loss of vision', 'Severe facial swelling with high fever', 'Neck stiffness with vomiting']
    };
  }

  // 8. Default Fever / Infection / Respiratory / General Illness
  const hasFever = lower.includes('fever') || lower.includes('बुखार') || lower.includes('ताप') || lower.includes('hot');
  const hasCough = lower.includes('cough') || lower.includes('खांसी') || lower.includes('खोखला') || lower.includes('cold') || lower.includes('जुकाम');
  
  return {
    translatedInputEn: `Patient presents with febrile/respiratory illness: "${input}"`,
    chiefComplaint: hasFever ? 'Acute Febrile Illness / High Fever' : (hasCough ? 'Upper Respiratory Infection / Cough & Cold' : 'General Malaise & Physical Weakness'),
    chiefComplaintHi: hasFever ? 'तीव्र ज्वर / तेज बुखार' : (hasCough ? 'खांसी और श्वसन तंत्र संक्रमण' : 'सामान्य अस्वस्थता व शारीरिक कमजोरी'),
    symptoms: [
      hasFever ? 'Elevated Body Temperature (> 100.4°F)' : 'Generalized Body Fatigue',
      hasCough ? 'Persistent Cough & Throat Irritation' : 'Headache / Generalized Body Ache',
      'Loss of Appetite & Mild Chills'
    ],
    symptomsHi: [
      hasFever ? 'शरीर का तेज तापमान (100.4°F से अधिक)' : 'शारीरिक कमजोरी व थकान',
      hasCough ? 'लगातार खांसी व गले में खराश' : 'सिरदर्द व बदन दर्द',
      'भूख में कमी व हल्की कंपकंपी'
    ],
    duration: '2-3 Days',
    durationHi: '2-3 दिन से',
    riskLevel: 'Yellow',
    riskReason: 'Sustained symptoms over 48 hours require clinical evaluation and rapid malaria/dengue/CBC blood tests at Primary Health Centre.',
    riskReasonHi: '48 घंटे से अधिक लक्षण रहने पर PHC में डॉक्टर द्वारा रक्त जांच व दवा परामर्श आवश्यक है।',
    recommendedDepartment: 'General Medicine (PHC OPD)',
    recommendedDepartmentHi: 'सामान्य चिकित्सा विभाग (PHC ओपीडी)',
    preliminaryAdvice: [
      'Drink plenty of boiled warm water and nutritious light soup or broth.',
      'Take Paracetamol 500mg after meals if body temperature exceeds 100°F.',
      'Wear light comfortable cotton clothes and apply cold water sponge compresses on forehead.',
      'Visit your nearest PHC OPD for free physician examination and Jan Aushadhi generic medicines.'
    ],
    preliminaryAdviceHi: [
      'उबला हुआ गुनगुना पानी और हल्का सुपाच्य भोजन लें।',
      '100°F से अधिक बुखार होने पर भोजन के बाद पैरासिटामोल 500mg ले सकते हैं।',
      'हल्के सूती कपड़े पहनें और माथे पर ताजे पानी की पट्टी रखें।',
      'निःशुल्क डॉक्टर परामर्श व दवा के लिए आज ही PHC ओपीडी में दिखाएं।'
    ],
    redFlags: ['Fever persisting past 3 days without relief', 'Difficulty breathing or sudden extreme lethargy']
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // --- API Routes ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString(), platform: 'SwasthSetu AI' });
  });

  // Facilities list
  app.get('/api/facilities', (req, res) => {
    res.json(MOCK_FACILITIES);
  });

  // Triage Reports: Get all
  app.get('/api/triage-reports', (req, res) => {
    res.json(triageReports);
  });

  // AI Triage Generator (Voice / Text -> Structured Clinical Report)
  app.post('/api/gemini/triage', async (req, res) => {
    try {
      const { text, language = 'hi', patientId, patientName, patientAge, patientGender, patientPhone, village } = req.body;
      if (!text || typeof text !== 'string') {
        return res.status(400).json({ error: 'Text input is required' });
      }

      const client = getGeminiClient();
      let generatedData: Partial<AITriageReport> | null = null;

      if (client) {
        try {
          const targetLangName = language === 'hi' ? 'Hindi' : language === 'mr' ? 'Marathi' : 'English';
          const prompt = `You are SwasthSetu AI, an expert Government of India Rural Healthcare Clinical Triage AI assistant.
A rural patient spoke or typed the following health complaint in ${targetLangName}:
"${text}"

Analyze the patient's complaint thoroughly and produce a structured clinical medical report JSON for the attending government doctor at the Primary Health Centre (PHC).

IMPORTANT LANGUAGE RULES:
- If language is 'hi', all Hindi fields (chiefComplaintHi, symptomsHi, durationHi, riskReasonHi, recommendedDepartmentHi, preliminaryAdviceHi) MUST be written in pure, natural Hindi (Devanagari script) with NO English words.
- If language is 'mr', all regional fields MUST be written in pure Marathi.
- Provide clear clinical English translations in the corresponding English fields for the Doctor's record.

Return ONLY valid JSON strictly adhering to the schema:
{
  "detectedLanguage": "${language}",
  "translatedInputEn": "Precise clinical translation into English of what patient said",
  "chiefComplaint": "Short 3-6 word clinical chief complaint in English",
  "chiefComplaintHi": "मुख्य शिकायत हिंदी में",
  "symptoms": ["Symptom 1 in English", "Symptom 2 in English", "Symptom 3 in English"],
  "symptomsHi": ["लक्षण 1 हिंदी में", "लक्षण 2 हिंदी में", "लक्षण 3 हिंदी में"],
  "duration": "Estimated duration (e.g. '3 Days')",
  "durationHi": "अवधि हिंदी में (उदा. '3 दिन')",
  "riskLevel": "Green" | "Yellow" | "Red",
  "riskReason": "Clinical justification for this risk level in English",
  "riskReasonHi": "जोखिम स्तर का कारण हिंदी में",
  "recommendedDepartment": "e.g. General Medicine | Pediatrics | Obstetrics & Gynecology | Cardiology | Emergency",
  "recommendedDepartmentHi": "सुझाया गया विभाग हिंदी में",
  "preliminaryAdvice": ["Advice 1 for patient in English", "Advice 2 for patient in English"],
  "preliminaryAdviceHi": ["मरीज के लिए प्राथमिक सलाह 1 हिंदी में", "मरीज के लिए प्राथमिक सलाह 2 हिंदी में"],
  "redFlags": ["Critical warning sign 1 in English", "Critical warning sign 2 in English"]
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
            } catch (pErr) {
              console.warn('JSON parsing failed on response:', cleaned);
            }
          }
        } catch (genAiErr) {
          console.warn('Gemini API call failed, falling back to clinical engine:', genAiErr);
        }
      }

      if (!generatedData) {
        generatedData = fallbackTriage(text, language);
      }

      const newReport: AITriageReport = {
        id: `tr-${Date.now()}`,
        patientId: patientId || 'pat-001',
        patientName: patientName || 'Rameshwar Lal Sharma',
        patientAge: patientAge || 58,
        patientGender: patientGender || 'Male',
        patientPhone: patientPhone || '9876543210',
        village: village || 'Rampur Village',
        languageInput: language,
        rawInput: text,
        translatedInputEn: generatedData.translatedInputEn || text,
        chiefComplaint: generatedData.chiefComplaint || 'Acute Symptom Evaluation',
        chiefComplaintHi: generatedData.chiefComplaintHi || 'स्वास्थ्य लक्षण परीक्षण',
        symptoms: generatedData.symptoms || ['Fever', 'Fatigue'],
        symptomsHi: generatedData.symptomsHi || ['बुखार', 'थकान'],
        duration: generatedData.duration || '2-3 Days',
        durationHi: generatedData.durationHi || '2-3 दिन',
        riskLevel: (generatedData.riskLevel as 'Green' | 'Yellow' | 'Red') || 'Yellow',
        riskReason: generatedData.riskReason || 'Sustained symptoms warrant clinical OPD evaluation.',
        riskReasonHi: generatedData.riskReasonHi || 'प्राथमिक स्वास्थ्य केंद्र में डॉक्टर से जांच आवश्यक है।',
        recommendedDepartment: generatedData.recommendedDepartment || 'General Medicine (PHC OPD)',
        recommendedDepartmentHi: generatedData.recommendedDepartmentHi || 'सामान्य चिकित्सा विभाग',
        preliminaryAdvice: generatedData.preliminaryAdvice || ['Rest and hydrate.'],
        preliminaryAdviceHi: generatedData.preliminaryAdviceHi || ['विश्राम करें और पर्याप्त पानी पिएं।'],
        redFlags: generatedData.redFlags || ['Worsening pain or shortness of breath'],
        status: 'PENDING_REVIEW',
        createdAt: 'Just now',
        targetDoctorId: 'doc-001',
        targetFacilityId: 'fac-001'
      };

      // Add to beginning of live reports
      triageReports.unshift(newReport);

      return res.json({ success: true, report: newReport });
    } catch (err: any) {
      console.error('Triage error:', err);
      res.status(500).json({ error: 'Failed to process triage report', details: err.message });
    }
  });

  // AI Multilingual Interactive Clinical Triage Chatbot
  app.post('/api/gemini/triage-chat', async (req, res) => {
    try {
      const { messages = [], language = 'hi', step = 1 } = req.body;
      const client = getGeminiClient();
      let reply = '';
      let isFinalTriage = false;
      let assessedRisk: 'Green' | 'Yellow' | 'Red' = 'Yellow';

      if (client) {
        try {
          const targetLangName = language === 'hi' ? 'Hindi (हिंदी)' : language === 'mr' ? 'Marathi (मराठी)' : 'English';
          const systemInstruction = `You are SwasthSetu Clinical Triage AI, an expert clinical triage assistant for rural Indian primary healthcare.
Conduct a structured clinical triage dialogue step by step with the patient in ${targetLangName}.
CRITICAL LANGUAGE RULE: Respond STRICTLY in ${targetLangName}. Do NOT mix languages.

Your goal is to evaluate risk level:
- 🟢 Green (Low Risk / Routine OPD): Mild cold, runny nose, slight fatigue, minor aches without fever.
- 🟡 Yellow (Medium Risk / Priority OPD): Sustained fever >2 days, productive cough, diarrhea, vomiting, moderate pain, pregnancy discomfort.
- 🔴 Red (High Risk / EMERGENCY 108): Severe chest pain/pressure, acute shortness of breath, blood in vomit/cough, unconsciousness, severe pregnancy complications, sudden paralysis.

Step protocol:
- Step 1: Inquire about main symptoms and how long (duration/days) the patient has had them.
- Step 2: Ask about fever temperature, severity, and any stomach/body pain.
- Step 3: Screen for critical RED FLAGS (breathlessness, chest pain, dizziness, severe weakness).
- If step >= 3 or enough information has been gathered: Conclude the assessment clearly with:
  1. Estimated Risk Level (🟢 Low Risk / 🟡 Medium Risk / 🔴 High Risk).
  2. Clear reason in ${targetLangName}.
  3. Immediate action (e.g. Visit PHC today or Dial 108 Emergency).
  4. 2-3 simple home care steps.
Keep responses concise, empathetic, and mobile-friendly (under 100 words).`;

          const conversationContents = messages.map((m: any) => `${m.role === 'user' ? 'Patient' : 'Assistant'}: ${m.content}`).join('\n\n');

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
        // Fallback multi-step triage logic
        const lastMsg = messages[messages.length - 1]?.content?.toLowerCase() || '';
        if (lastMsg.includes('chest') || lastMsg.includes('सीने') || lastMsg.includes('सांस') || lastMsg.includes('breath') || lastMsg.includes('खून')) {
          assessedRisk = 'Red';
          isFinalTriage = true;
          reply = language === 'hi'
            ? '🔴 उच्च जोखिम (आपातकाल - Red Risk):\nआपके लक्षण गंभीर हो सकते हैं। कृपया तुरंत 108 नंबर पर कॉल करके मुफ्त सरकारी एम्बुलेंस बुलाएं अथवा नजदीकी जिला अस्पताल के आपातकालीन विभाग में जाएं। मरीज को आरामदायक स्थिति में बैठाएं।'
            : '🔴 HIGH RISK EMERGENCY (Red Risk):\nThese symptoms require immediate emergency attention. Please dial 108 for the free government emergency ambulance immediately or visit the nearest District Hospital emergency department.';
        } else if (step === 1) {
          reply = language === 'hi'
            ? 'नमस्ते! आपको यह समस्या कितने दिनों से है और क्या आपको बुखार या शरीर में तेज दर्द महसूस हो रहा है?'
            : 'Hello! How many days have you had these symptoms, and are you experiencing fever or severe body pain?';
        } else if (step === 2) {
          reply = language === 'hi'
            ? 'क्या आपको सांस लेने में कोई तकलीफ, सीने में भारीपन, या चक्कर आने जैसी कोई गंभीर समस्या है?'
            : 'Are you experiencing any shortness of breath, chest heaviness, or dizziness?';
        } else {
          isFinalTriage = true;
          assessedRisk = 'Yellow';
          reply = language === 'hi'
            ? '🟡 मध्यम जोखिम (Yellow Risk):\nआपके लक्षणों के आधार पर आपको आज ही नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) में डॉक्टर को दिखाना चाहिए।\n• उबला पानी पिएं और आराम करें।\n• क्या आप डॉक्टर के लिए मेडिकल पर्ची तैयार करना चाहते हैं?'
            : '🟡 MEDIUM RISK (Yellow Risk):\nBased on your symptoms, we recommend visiting your nearest Primary Health Centre (PHC) today for OPD consultation.\n• Stay well hydrated with boiled water and get rest.\n• Would you like me to generate your digital medical report for the doctor?';
        }
      }

      res.json({ reply, riskLevel: assessedRisk, isFinalTriage });
    } catch (err: any) {
      console.error('Triage chat error:', err);
      res.status(500).json({ error: 'Interactive triage failed', details: err.message });
    }
  });

  // Gemini status check
  app.get('/api/gemini/status', (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    const isConfigured = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '');
    res.json({
      configured: isConfigured,
      model: 'gemini-2.5-flash',
      provider: 'Google AI Studio / Gemini API'
    });
  });

  // AI Multilingual Health Assistant Chatbot endpoint
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { message, language = 'hi', history = [] } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const client = getGeminiClient();
      let replyText = '';
      let isGeminiPowered = false;

      const languageNames: Record<string, string> = {
        'hi': 'Hindi (हिंदी)',
        'mr': 'Marathi (मराठी)',
        'en': 'English',
        'bn': 'Bengali (বাংলা)',
        'ta': 'Tamil (தமிழ்)',
        'te': 'Telugu (తెలుగు)',
        'gu': 'Gujarati (ગુજરાતી)',
        'kn': 'Kannada (ಕನ್ನಡ)',
        'ml': 'Malayalam (മലയാളം)',
        'pa': 'Punjabi (ਪੰਜਾਬੀ)',
        'or': 'Odia (ଓଡ଼ିଆ)',
        'ur': 'Urdu (اردو)',
        'es': 'Spanish (Español)',
        'fr': 'French (Français)'
      };

      const targetLangName = languageNames[language] || language || 'Hindi';

      if (client) {
        try {
          const systemInstruction = `You are Swasthya AI (स्वास्थ्य सेतु), an expert, empathetic, and highly accurate Clinical Healthcare Assistant built for India's digital health mission.

STRICT LANGUAGE REQUIREMENT:
- You must reply 100% in ${targetLangName}.
- If the target language is Hindi, reply in pure Devanagari Hindi (हिंदी).
- If the target language is Marathi, reply in pure Marathi (मराठी).
- If the target language is English, reply in clean, accessible English.
- If the user wrote in a specific language or requested a language, honor it fully with authentic grammar and script.

CLINICAL & TRIAGE GUIDELINES:
1. Symptom Analysis: Carefully analyze the patient's symptoms, duration, and severity. Explain likely causes in simple, reassuring terms without confusing medical jargon.
2. Triage Level: Categorize the situation clearly:
   - 🟢 Mild / Home Care: Safe home measures, fluids (ORS), nutrition, rest.
   - 🟡 Moderate: Recommend visiting the nearest Primary Health Centre (PHC) / Community Health Centre (CHC) for an in-person doctor checkup.
   - 🔴 Critical Emergency: If signs of heart attack, severe breathlessness, stroke, head injury, snake bite, or pregnancy complications appear, urge immediate call to 108 (free government emergency ambulance).
3. Practical Remedies: Provide clear, evidence-based home care steps, hydration advice, and temperature/pain monitoring.
4. Red Flags: Clearly list warning signs that require immediate emergency care.
5. Public Health Integration: Mention government facilities (PHC, Jan Aushadhi generic medicines, Ayushman Bharat PM-JAY) when relevant.
6. Keep formatting clean with bullet points and bold highlights for readability on mobile screens.`;

          // Format multi-turn conversation
          const formattedContents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

          if (Array.isArray(history) && history.length > 0) {
            for (const h of history.slice(-8)) {
              if (h.text) {
                formattedContents.push({
                  role: h.sender === 'assistant' || h.role === 'assistant' || h.role === 'model' ? 'model' : 'user',
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
        // Comprehensive fallback intelligent responses honoring strict language restrictions
        const msg = message.toLowerCase();
        
        // 1. Emergency / Cardiopulmonary / Chest / Breathlessness
        if (msg.includes('सीने') || msg.includes('chest') || msg.includes('सांस') || msg.includes('breath') || msg.includes('attack') || msg.includes('छाती') || msg.includes('heart') || msg.includes('दिल') || msg.includes('behos') || msg.includes('बेहोश')) {
          replyText = language === 'hi'
            ? '🔴 आपातकालीन चेतावनी (Emergency Alert):\nसीने में जकड़न, तेज दर्द या सांस लेने में भारी तकलीफ गंभीर हृदय या श्वसन आपातकाल हो सकती है।\n• तुरंत 108 नंबर पर कॉल करके मुफ्त सरकारी एम्बुलेंस बुलाएं।\n• मरीज को आरामदायक स्थिति में बैठाएं और ताजी हवा आने दें।\n• क्या आप डॉक्टर के लिए आपातकालीन मेडिकल पर्ची बनाना चाहते हैं?'
            : language === 'mr'
            ? '🔴 तातडीचा इशारा (Emergency Alert):\nछातीत दुखणे किंवा तीव्र श्वास घेण्यास त्रास होणे हे गंभीर असू शकते.\n• त्वरित १०८ रुग्णवाहिकेला कॉल करा.\n• रुग्णाला बसवून ठेवा आणि मोकळी हवा मिळू द्या.'
            : '🔴 CRITICAL EMERGENCY ALERT:\nChest pain, pressure, or acute shortness of breath can indicate a cardiopulmonary emergency.\n• Dial 108 immediately for a free government ambulance.\n• Keep the patient semi-reclined with fresh airflow.\n• Would you like me to generate an emergency clinical report for the doctor?';
        }
        // 2. Stomach Pain, Diarrhea, Vomiting, Loose Motion, Acidity, Gas
        else if (msg.includes('पेट') || msg.includes('stomach') || msg.includes('pain') || msg.includes('दर्द') || msg.includes('उल्टी') || msg.includes('vomit') || msg.includes('दस्त') || msg.includes('loose') || msg.includes('motion') || msg.includes('गैस') || msg.includes('acidity') || msg.includes('कब्ज')) {
          const isLooseMotion = msg.includes('दस्त') || msg.includes('loose') || msg.includes('motion') || msg.includes('उल्टी') || msg.includes('vomit');
          if (isLooseMotion) {
            replyText = language === 'hi'
              ? 'दस्त और उल्टी में शरीर से पानी व आवश्यक लवण कम हो जाते हैं:\n• १ पैकेट ओआरएस (ORS) १ लीटर उबले ठंडे पानी में घोलकर हर दस्त के बाद पिएं।\n• दही-चावल, केला और मूंग दाल की पतली खिचड़ी खाएं।\n• अगर २ दिन से ज्यादा हो या खून आए, तो तुरंत प्राथमिक स्वास्थ्य केंद्र (PHC) जाएं।\n• क्या आप डॉक्टर के लिए क्लीनिकल रिपोर्ट तैयार करना चाहते हैं?'
              : language === 'mr'
              ? 'उलटी आणि जुलाब झाल्यास शरीरात पाण्याची कमतरता भासू देऊ नका:\n• १ लिटर उकळलेल्या पाण्यात ओआरएस (ORS) मिसळून थोडे-थोडे प्या.\n• हलका आहार आणि भाताची पेज घ्या.\n• ताबडतोब प्राथमिक आरोग्य केंद्रात (PHC) भेट द्या.'
              : 'For vomiting and loose motions (acute gastroenteritis):\n• Mix 1 sachet of ORS in 1 litre of clean boiled water and drink sip-by-sip after every episode.\n• Eat bland foods like curd-rice, bananas, and light broth.\n• Visit your nearest PHC for physician checkup if it persists past 24-48 hours.';
          } else {
            replyText = language === 'hi'
              ? 'पेट दर्द और गैस के लिए प्राथमिक स्वास्थ्य सलाह:\n• हल्का गुनगुना पानी पिएं और तेल-मसालेदार भोजन से बचें।\n• गर्म पानी की बोतल से पेट की हल्की सिकाई करें।\n• अचानक तेज असहनीय दर्द (दाहिनी तरफ) होने पर तुरंत PHC डॉक्टर से जांच करवाएं।'
              : language === 'mr'
              ? 'पोटदुखी आणि गॅससाठी सल्ला:\n• कोमट पाणी प्या आणि तेलकट पदार्थ टाळा.\n• जास्त तीव्र दुखणे असल्यास जवळच्या PHC ला भेट द्या.'
              : 'For stomach ache and acidity:\n• Drink warm water and avoid heavy, spicy, or fried meals.\n• Apply a warm heating pad to the abdomen for comfort.\n• If pain is acute or localized to the lower right side, visit the PHC immediately.';
          }
        }
        // 3. Animal Bites (Dog, Snake, Monkey, Rabies)
        else if (msg.includes('dog') || msg.includes('कुत्ता') || msg.includes('bite') || msg.includes('काटा') || msg.includes('snake') || msg.includes('सांप') || msg.includes('monkey') || msg.includes('बंदर') || msg.includes('रेबीज') || msg.includes('rabies')) {
          const isSnake = msg.includes('snake') || msg.includes('सांप');
          if (isSnake) {
            replyText = language === 'hi'
              ? '⚠️ सर्पदंश (सांप का काटना) अति गंभीर आपातकाल है:\n• मरीज को शांत रखें और हिलने-डुलने न दें।\n• घाव पर चीरा या टाइट रस्सी न बांधें।\n• तुरंत 108 एम्बुलेंस बुलाकर सरकारी अस्पताल में एंटी-स्नेक वेनम (ASV) का इंजेक्शन लगवाएं।'
              : language === 'mr'
              ? '⚠️ सर्पदंश ही अतिशय गंभीर बाब आहे:\n• रुग्णाला हालचाल करू देऊ नका.\n• त्वरित शासकीय रुग्णालयात अँटी-स्नेक व्हेनम (ASV) साठी घेऊन जा.'
              : '⚠️ SNAKE BITE EMERGENCY:\n• Keep the patient calm and immobilize the affected limb.\n• Do NOT cut, suck, or tie a tight tourniquet.\n• Rush immediately to the nearest Government Hospital for Anti-Snake Venom (ASV).';
          } else {
            replyText = language === 'hi'
              ? 'कुत्ते या बंदर के काटने पर तत्काल प्राथमिक उपचार:\n• घाव को बहते पानी और साबुन से कम से कम १५ मिनट तक लगातार धोएं।\n• घाव पर मिर्च, हल्दी या चूना न लगाएं।\n• तुरंत नजदीकी PHC जाएं जहां एंटी-रेबीज (ARV) और टिटनेस का टीका बिल्कुल मुफ्त लगाया जाता है।'
              : language === 'mr'
              ? 'कुत्रा चावल्यास प्राथमिक उपचार:\n• जखम वाहत्या पाण्याखाली साबणाने १५ मिनिटे स्वच्छ धुवा.\n• त्वरित PHC मध्ये जाऊन रेबीज प्रतिबंधक लस मोफत टोचून घ्या.'
              : 'For Dog/Animal Bites (Rabies Prevention):\n• Wash the wound under running tap water with soap for at least 15 minutes.\n• Do not apply household irritants or bandage tightly.\n• Visit the PHC immediately for free Anti-Rabies Vaccine (ARV) and Tetanus Toxoid.';
          }
        }
        // 4. Headache, Migraine, Dizziness, Eye & Ear Issues
        else if (msg.includes('headache') || msg.includes('सिरदर्द') || msg.includes('चक्कर') || msg.includes('dizzy') || msg.includes('आंख') || msg.includes('eye') || msg.includes('ear') || msg.includes('कान') || msg.includes('दांत') || msg.includes('tooth')) {
          replyText = language === 'hi'
            ? 'सिरदर्द, चक्कर या आंख/कान की समस्या हेतु सलाह:\n• शांत और मंद रोशनी वाले कमरे में पर्याप्त आराम करें।\n• पर्याप्त मात्रा में पानी पिएं (दिन में ८-१० गिलास)।\n• आंखों की लाली में ताजे पानी से धोएं, गंदे हाथों से न छुएं।\n• दांत दर्द में हल्के गुनगुने नमक के पानी से कुल्ला करें और PHC दंत चिकित्सक को दिखाएं।'
            : language === 'mr'
            ? 'डोकेदुखी, चक्कर किंवा डोळ्यांच्या त्रासासाठी:\n• शांत ठिकाणी विश्रांती घ्या आणि भरपूर पाणी प्या.\n• डोळ्यांना स्वच्छ पाण्याने धुवा.\n• प्राथमिक आरोग्य केंद्रातील तज्ज्ञांचा सल्ला घ्या.'
            : 'For headache, dizziness, or eye/ear discomfort:\n• Rest in a quiet, dimly lit room and stay well hydrated.\n• Rinse eyes gently with clean water and avoid rubbing.\n• For toothache, gargle with warm salt water and consult the PHC dentist.';
        }
        // 5. Skin Rash, Itching, Ringworm, Fungal, Wounds, Burns
        else if (msg.includes('skin') || msg.includes('त्वचा') || msg.includes('खुजली') || msg.includes('itch') || msg.includes('दाद') || msg.includes('rash') || msg.includes('घाव') || msg.includes('wound') || msg.includes('जल') || msg.includes('burn')) {
          replyText = language === 'hi'
            ? 'त्वचा संक्रमण, खुजली व घाव के लिए निर्देश:\n• त्वचा को सूखा और साफ रखें, ढीले सूती कपड़े पहनें।\n• कपड़ों को धूप में सुखाकर पहनें ताकि फंगल संक्रमण न फैले।\n• घाव को साफ पानी व एंटीसेप्टिक से साफ करें।\n• PHC के जन औषधि केंद्र से निःशुल्क एंटीफंगल क्रीम प्राप्त करने हेतु डॉक्टर को दिखाएं।'
            : language === 'mr'
            ? 'त्वचारोग व खाज यासाठी काळजी:\n• त्वचा कोरडी व स्वच्छ ठेवा, सुती कपडे वापरा.\n• PHC मधून मोफत मलम व औषधे मिळवा.'
            : 'For skin rashes, fungal ringworm, and wounds:\n• Keep the affected area clean and dry; wear breathable cotton garments.\n• Wash clothing and bedsheets in warm water and dry in direct sunlight.\n• Visit the PHC Jan Aushadhi generic counter for prescribed antifungal ointments.';
        }
        // 6. Joint Pain, Knee Swelling, Arthritis, Backache
        else if (msg.includes('joint') || msg.includes('घुटने') || msg.includes('जोड़ों') || msg.includes('knee') || msg.includes('कमर') || msg.includes('back') || msg.includes('हड्डी') || msg.includes('arthritis')) {
          replyText = language === 'hi'
            ? 'जोड़ों, घुटनों और कमर दर्द के लिए राहत उपाय:\n• घुटनों व कमर पर गुनगुने पानी या सरसों के तेल की हल्की सिकाई करें।\n• जमीन पर पालथी मारकर बैठने और अधिक वजन उठाने से बचें।\n• PHC में जाकर कैल्शियम व विटामिन डी की जांच करवाएं और निःशुल्क सप्लीमेंट प्राप्त करें।'
            : language === 'mr'
            ? 'सांधेदुखी व पाठदुखीसाठी सल्ला:\n• कोमट पाण्याच्या शेक घ्या.\n• खाली जमिनीवर बसणे टाळा आणि PHC मध्ये कॅल्शियम तपासणी करा.'
            : 'For joint, knee, and back pain:\n• Apply warm fomentation to affected joints for 15 minutes twice daily.\n• Avoid sitting flat on the floor and lifting heavy loads.\n• Visit the PHC OPD for bone-density evaluation and free Calcium/Vitamin D supplements.';
        }
        // 7. Diabetes (High Sugar) & Hypertension (Blood Pressure)
        else if (msg.includes('diabetes') || msg.includes('sugar') || msg.includes('शुगर') || msg.includes('मधुमेह') || msg.includes('bp') || msg.includes('blood pressure') || msg.includes('बीपी') || msg.includes('दबाव')) {
          replyText = language === 'hi'
            ? 'डायबिटीज (शुगर) और ब्लड प्रेशर (BP) नियंत्रण:\n• भोजन में नमक, चीनी, और तली हुई चीजों की मात्रा कम करें।\n• प्रतिदिन सुबह ३० मिनट हल्का टहलें।\n• अपनी निर्धारित दवाएं नियमित समय पर बिना भूले लें।\n• आयुष्मान भारत हेल्थ वेलनेस सेंटर (HWC) पर हर महीने निःशुल्क बीपी व शुगर जांच अवश्य कराएं।'
            : language === 'mr'
            ? 'मधुमेह आणि रक्तदाब (BP) नियंत्रणासाठी:\n• आहारात मीठ व साखर कमी करा.\n• दररोज ३० मिनिटे चाला आणि औषधे वेळेवर घ्या.\n• जवळच्या आरोग्य केंद्रात नियमित तपासणी करा.'
            : 'For Diabetes (Blood Sugar) and Hypertension (High Blood Pressure):\n• Reduce dietary sodium (salt), sugar, and saturated fats.\n• Maintain 30 minutes of brisk walking daily and take prescribed medications consistently.\n• Get your free monthly BP and fasting glucose screening at your nearest Ayushman Bharat Health & Wellness Centre.';
        }
        // 8. Fever, Cold, Cough, Flu, Dengue, Malaria
        else if (msg.includes('बुखार') || msg.includes('fever') || msg.includes('ताप') || msg.includes('cold') || msg.includes('जुकाम') || msg.includes('खांसी') || msg.includes('cough') || msg.includes('dengue') || msg.includes('malaria') || msg.includes('डेंगू') || msg.includes('मलेरिया')) {
          replyText = language === 'hi' 
            ? 'नमस्ते। यदि आपको बुखार, जुकाम या खांसी की शिकायत है:\n• उबला हुआ गुनगुना पानी और ओआरएस (ORS) घोल पर्याप्त मात्रा में पिएं।\n• माथे पर ताजे पानी की पट्टी रखें।\n• १००°F से अधिक होने पर भोजन के बाद पैरासिटामोल ५००mg ले सकते हैं।\n• मलेरिया व डेंगू की निःशुल्क रक्त जांच हेतु नजदीकी प्राथमिक स्वास्थ्य केंद्र (PHC) अवश्य जाएं।\n• क्या आप डॉक्टर के लिए मेडिकल पर्ची तैयार करना चाहते हैं?'
            : language === 'mr'
            ? 'नमस्कार. जर आपल्याला ताप, सर्दी किंवा खोकला असेल:\n• उकळलेले कोमट पाणी व ओआरएस प्या.\n• कपाळावर थंड पाण्याच्या पट्ट्या ठेवा.\n• जवळच्या प्राथमिक आरोग्य केंद्रात (PHC) जाऊन मोफत तपासणी करून घ्या. आपण डॉक्टरांसाठी अहवाल तयार करू इच्छिता?'
            : 'Hello. For fever, cough, or cold persisting for more than 2 days:\n• Drink boiled warm water and ORS to maintain adequate hydration.\n• Apply a cool damp sponge to the forehead.\n• Paracetamol 500mg can be taken after meals if temperature exceeds 100°F.\n• Visit your nearest PHC for free rapid malaria/dengue blood testing and generic medications.';
        }
        // 9. Child Healthcare & Vaccines (Mission Indradhanush)
        else if (msg.includes('टीका') || msg.includes('vaccine') || msg.includes('लस') || msg.includes('बच्चे') || msg.includes('child') || msg.includes('baby') || msg.includes('शिशु')) {
          replyText = language === 'hi'
            ? 'मिशन इंद्रधनुष के अंतर्गत बच्चों को सभी आवश्यक १२ टीके (पोलियो, बीसीजी, पेंटावेलेंट, रोटावायरस, खसरा-रूबेला आदि) सरकारी अस्पताल, PHC और उप-केंद्र पर बिल्कुल निःशुल्क लगाए जाते हैं। टीकाकरण कार्ड के साथ नजदीकी आशा (ASHA) कार्यकर्ता या एएनएम (ANM) से संपर्क करें।'
            : language === 'mr'
            ? 'मिशन इंद्रधनुष अंतर्गत बालकांसाठी सर्व १२ आवश्यक लसी मोफत दिल्या जातात. लसीकरण कार्डसह जवळच्या ASHA किंवा ANM ताईंशी संपर्क साधा.'
            : 'Under Government of India Mission Indradhanush, all 12 life-saving pediatric vaccines (Polio, BCG, Pentavalent, Rotavirus, MR, etc.) are provided completely free at every Primary Health Centre (PHC) and Sub-Centre.';
        }
        // 10. Maternal Care & Pregnancy (ANC / Matru Vandana)
        else if (msg.includes('गर्भवती') || msg.includes('pregnancy') || msg.includes('गरोदर') || msg.includes('mother') || msg.includes('माता') || msg.includes('anc') || msg.includes('प्रसव')) {
          replyText = language === 'hi'
            ? 'प्रधानमंत्री सुरक्षित मातृत्व अभियान के तहत गर्भवती माताओं को PHC पर निःशुल्क ४ प्रसव पूर्व जांच (ANC), अल्ट्रासाउंड, आयरन-फोलिक एसिड व कैल्शियम की गोलियां और टिटनेस (Td) का टीका दिया जाता है। हरी सब्जियां, दूध व दालें लें और भारी वजन न उठाएं।'
            : language === 'mr'
            ? 'मातृ सुरक्षा योजनेअंतर्गत गर्भवती महिलांसाठी मोफत तपासणी व औषधे उपलब्ध आहेत. वेळोवेळी डॉक्टरांचा सल्ला घ्या आणि पौष्टिक आहार घ्या.'
            : 'Under the National Health Mission and PMSMA, all pregnant mothers receive 4 free antenatal checkups (ANC), blood pressure monitoring, iron-folic acid supplements, and ultrasound scans at Government PHCs and Sub-Centres.';
        }
        // 11. Government Schemes: Ayushman Bharat (PM-JAY), Jan Aushadhi
        else if (msg.includes('ayushman') || msg.includes('आयुष्मान') || msg.includes('कार्ड') || msg.includes('card') || msg.includes('जन औषधि') || msg.includes('aushadhi') || msg.includes('दवा') || msg.includes('medicine') || msg.includes('phc')) {
          replyText = language === 'hi'
            ? 'सरकारी स्वास्थ्य योजनाओं की जानकारी:\n• आयुष्मान भारत (PM-JAY): प्रति परिवार ₹५ लाख तक का मुफ्त अस्पताल इलाज (गोल्डन कार्ड)।\n• प्रधानमंत्री जन औषधि केंद्र: उच्च गुणवत्ता वाली जेनेरिक दवाएं ५०% से ९०% कम दाम पर अथवा PHC में निःशुल्क उपलब्ध।\n• PHC ओपीडी समय: प्रतिदिन सुबह ९:०० बजे से दोपहर २:०० बजे तक खुला रहता है।'
            : language === 'mr'
            ? 'शासकीय आरोग्य योजना:\n• आयुष्मान भारत: दरवर्षी ₹५ लाखांपर्यंत मोफत उपचार.\n• जन औषधी केंद्र: ५०-९०% स्वस्त जेनेरिक औषधे उपलब्ध.\n• प्राथमिक आरोग्य केंद्र (PHC): सकाळी ९ ते दुपारी २ सुरू असते.'
            : 'Government Healthcare Schemes:\n• Ayushman Bharat (PM-JAY): Provides ₹5 Lakh annual cashless health coverage per family at empaneled hospitals.\n• PM Jan Aushadhi Generic Pharmacies: Quality generic medicines available at 50%-90% discounted rates (or free at PHC counters).\n• PHC OPD Timings: 9:00 AM to 2:00 PM daily.';
        }
        // 12. Dynamic context-aware response for any other user query
        else {
          replyText = language === 'hi'
            ? `नमस्ते! स्वास्थ्य सेतु एआई सहायक आपकी सेवा में है।\nआपने पूछा: "${message.trim()}"\n\n• इस स्वास्थ्य समस्या के बारे में विस्तार से बताएं ताकि मैं आपको सही परामर्श दे सकूं।\n• यदि आपको तेज दर्द, बुखार, कमजोरी या कोई अन्य परेशानी है, तो मैं आपके लक्षणों को समझकर डॉक्टर के लिए तुरंत डिजिटल मेडिकल पर्ची (Triage Report) बना सकता हूँ।`
            : language === 'mr'
            ? `नमस्कार! मी स्वास्थ्य सेतू AI सहाय्यक आहे.\nआपण विचारले: "${message.trim()}"\n\n• कृपया आपल्या लक्षणांची अधिक माहिती द्या, जेणेकरून मी योग्य सल्ला देऊ शकेन किंवा डॉक्टरांसाठी अहवाल तयार करू शकेन.`
            : `Hello! I am your SwasthSetu AI Health Assistant.\nRegarding: "${message.trim()}"\n\n• Please share more details about your symptoms (such as duration, pain severity, or fever) so I can provide precise guidance.\n• I can also automatically convert your health details into a structured Clinical Triage Report for the PHC doctor.`;
        }
      }

      res.json({ reply: replyText, language, isGeminiPowered });
    } catch (err: any) {
      console.error('Chat error:', err);
      res.status(500).json({ error: 'Chat failed', details: err.message });
    }
  });

  // Appointments API
  app.get('/api/appointments', (req, res) => {
    res.json(appointments);
  });

  app.post('/api/appointments', (req, res) => {
    const { patientName, patientAge, patientPhone, facilityId, facilityName, doctorId, doctorName, specialty, chiefComplaint, triageReportId, riskLevel } = req.body;
    
    // Generate next token
    const nextToken = appointments.length > 0 ? Math.max(...appointments.map(a => a.tokenNumber)) + 1 : 1;
    
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
      appointmentDate: 'Today (Live OPD)',
      timeSlot: 'Immediate OPD Queue',
      status: 'WAITING',
      triageReportId: triageReportId,
      triageRiskLevel: riskLevel || 'Yellow',
      chiefComplaint: chiefComplaint || 'Routine Health Consultation',
      estimatedWaitMinutes: (nextToken - 1) * 6,
      createdAt: 'Just now'
    };

    appointments.unshift(newAppointment);
    res.json({ success: true, appointment: newAppointment });
  });

  app.patch('/api/appointments/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const index = appointments.findIndex(a => a.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    appointments[index].status = status;
    res.json({ success: true, appointment: appointments[index] });
  });

  // Prescriptions API
  app.get('/api/prescriptions', (req, res) => {
    res.json(prescriptions);
  });

  app.post('/api/prescriptions', (req, res) => {
    const { patientName, patientAge, patientGender, abhaId, diagnosis, diagnosisHi, chiefComplaint, medicines, labTestsRecommended, labTestsRecommendedHi, dietaryAdvice, dietaryAdviceHi, reportId } = req.body;
    
    const newRx: Prescription = {
      id: `rx-${Date.now().toString().slice(-6)}`,
      patientId: 'pat-001',
      patientName: patientName || 'Rameshwar Lal Sharma',
      patientAge: patientAge || 58,
      patientGender: patientGender || 'Male',
      abhaId: abhaId || '91-4829-1029-4820',
      doctorId: 'doc-001',
      doctorName: 'Dr. Rajesh Kumar (MBBS, MD)',
      doctorSpecialty: 'Senior Medical Officer - General Medicine',
      facilityName: 'Sitapur Primary Health Centre (PHC), Govt. of UP',
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      diagnosis: diagnosis || 'Acute Symptom Consultation',
      diagnosisHi: diagnosisHi || 'स्वास्थ्य परामर्श व जांच',
      chiefComplaint: chiefComplaint || 'Patient visited with acute complaints',
      medicines: medicines || [
        {
          id: 'm1',
          name: 'Tab. Paracetamol 500mg (Jan Aushadhi)',
          dosage: '1 Tablet SOS',
          frequency: '1-0-1 (After Food)',
          frequencyHi: 'सुबह-शाम भोजन के बाद',
          duration: '3 Days',
          instructions: 'Take with warm water.',
          instructionsHi: 'गुनगुने पानी के साथ लें।'
        }
      ],
      labTestsRecommended: labTestsRecommended || [],
      labTestsRecommendedHi: labTestsRecommendedHi || [],
      dietaryAdvice: dietaryAdvice || 'Drink plenty of fluids and rest.',
      dietaryAdviceHi: dietaryAdviceHi || 'पर्याप्त पानी पिएं और आराम करें।',
      followUpDate: 'After 3 days if symptoms persist',
      reportId
    };

    prescriptions.unshift(newRx);

    // If linked to an appointment, mark appointment completed
    const matchingApt = appointments.find(a => a.triageReportId === reportId || a.patientName === patientName);
    if (matchingApt) {
      matchingApt.status = 'COMPLETED';
    }

    res.json({ success: true, prescription: newRx });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SwasthSetu AI Server running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start SwasthSetu server:', err);
});
