import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineSyncProvider } from './context/OfflineSyncContext';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { PatientDashboard } from './components/PatientDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { SmartMap } from './components/SmartMap';
import { AIMedicalReportGenerator } from './components/AIMedicalReportGenerator';
import { AIHealthAssistant } from './components/AIHealthAssistant';
import { AppointmentModal } from './components/AppointmentModal';
import { EmergencyModal } from './components/EmergencyModal';
import { DigitalHealthRecord } from './components/DigitalHealthRecord';
import { 
  Appointment, 
  Prescription, 
  AITriageReport, 
  HealthcareFacility,
  VaccinationRecord 
} from './types';
import { 
  MOCK_APPOINTMENTS, 
  MOCK_PRESCRIPTIONS, 
  MOCK_TRIAGE_REPORTS, 
  MOCK_VACCINATIONS, 
  MOCK_FACILITIES 
} from './data/mockData';
import { HeartPulse, Bot, Sparkles, Mic } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { language, t } = useLanguage();
  const { role } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isReportGenOpen, setIsReportGenOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [reportInitialText, setReportInitialText] = useState('');

  // Facilities & Appointment Modal State
  const [facilities, setFacilities] = useState<HealthcareFacility[]>(MOCK_FACILITIES);
  const [selectedFacility, setSelectedFacility] = useState<HealthcareFacility | null>(MOCK_FACILITIES[0]);
  const [selectedFacilityForApt, setSelectedFacilityForApt] = useState<HealthcareFacility | null>(null);
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);

  // App Data States
  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);
  const [triageReports, setTriageReports] = useState<AITriageReport[]>(MOCK_TRIAGE_REPORTS);
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>(MOCK_VACCINATIONS);

  // Sync with backend API on mount
  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setAppointments(data);
      })
      .catch(err => console.warn('Using local appointment data:', err));

    fetch('/api/prescriptions')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) setPrescriptions(data);
      })
      .catch(err => console.warn('Using local prescription data:', err));
  }, []);

  // When role changes, switch tab gracefully
  useEffect(() => {
    if (role === 'doctor') {
      setCurrentTab('doctor');
    } else if (role === 'patient') {
      if (currentTab === 'doctor' || currentTab === 'login') {
        setCurrentTab('dashboard');
      }
    } else {
      setCurrentTab('login');
    }
  }, [role]);

  const handleOpenReportWithText = (text: string) => {
    setReportInitialText(text);
    setIsReportGenOpen(true);
  };

  const handleReportCreated = (report: AITriageReport) => {
    setTriageReports(prev => [report, ...prev]);
    // Also create appointment slot for doctor queue
    const autoApt: Appointment = {
      id: `apt-${Date.now()}`,
      tokenNumber: appointments.length + 101,
      patientId: report.patientId,
      patientName: report.patientName,
      patientAge: report.patientAge,
      patientGender: report.patientGender,
      patientPhone: report.patientPhone,
      doctorId: 'doc-001',
      doctorName: 'Dr. Alok Verma',
      facilityId: 'fac-001',
      facilityName: 'Primary Health Centre (PHC) Sitapur',
      facilityNameHi: 'प्राथमिक स्वास्थ्य केंद्र (PHC) सीतापुर',
      appointmentDate: new Date().toISOString().split('T')[0],
      timeSlot: '11:00 AM - 11:30 AM',
      status: 'WAITING',
      chiefComplaint: `${report.chiefComplaint} (AI Triage)`,
      riskLevel: report.riskLevel,
      triageReportId: report.id,
      estimatedWaitMinutes: 15
    };
    setAppointments(prev => [autoApt, ...prev]);
  };

  const handleBookAppointmentFromFacility = (fac: HealthcareFacility) => {
    setSelectedFacilityForApt(fac);
    setIsAptModalOpen(true);
  };

  const handleAppointmentBooked = (newApt: Appointment) => {
    setAppointments(prev => [newApt, ...prev]);
  };

  const handlePrescriptionCreated = (newRx: Prescription) => {
    setPrescriptions(prev => [newRx, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#F0F5F9] flex flex-col font-sans text-[#1A1A1B]">
      
      {/* Universal Government Navbar with Clean Minimalism Styling */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openEmergencyModal={() => setIsEmergencyOpen(true)}
        openReportGenerator={() => setIsReportGenOpen(true)}
        openChatbot={() => setIsChatbotOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {currentTab === 'login' && (
          <LoginView
            onSuccessLogin={() => {
              if (role === 'doctor') setCurrentTab('doctor');
              else setCurrentTab('dashboard');
            }}
          />
        )}

        {currentTab === 'dashboard' && (
          <PatientDashboard
            facilities={facilities}
            prescriptions={prescriptions}
            vaccinations={vaccinations}
            appointments={appointments}
            triageReports={triageReports}
            onSelectFacility={(fac) => {
              setSelectedFacility(fac);
              setCurrentTab('map');
            }}
            onOpenReportGenerator={() => setIsReportGenOpen(true)}
            onOpenChatbot={() => setIsChatbotOpen(true)}
            onNavigateToMap={() => setCurrentTab('map')}
            onNavigateToRecords={() => setCurrentTab('records')}
            onBookAppointment={handleBookAppointmentFromFacility}
          />
        )}

        {currentTab === 'map' && (
          <SmartMap
            facilities={facilities}
            selectedFacility={selectedFacility}
            onSelectFacility={setSelectedFacility}
            onBookAppointment={handleBookAppointmentFromFacility}
          />
        )}

        {currentTab === 'doctor' && (
          <DoctorDashboard
            appointments={appointments}
            triageReports={triageReports}
            onPrescriptionCreated={handlePrescriptionCreated}
          />
        )}

        {currentTab === 'records' && (
          <DigitalHealthRecord
            prescriptions={prescriptions}
            vaccinations={vaccinations}
            triageHistory={triageReports}
          />
        )}

      </main>

      {/* Floating Action Button (FAB) for AI Health Assistant */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 pointer-events-auto">
        <button
          onClick={() => setIsChatbotOpen(true)}
          className="group relative flex items-center gap-2.5 bg-linear-to-r from-[#1A5FB4] to-[#26A269] text-white px-4 py-3.5 rounded-full shadow-xl hover:shadow-2xl active:scale-95 transition-all cursor-pointer border-2 border-white/40"
          title="Open AI Health Assistant (Voice & Multilingual)"
        >
          <div className="relative flex items-center justify-center">
            <Bot className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-300 rounded-full animate-ping" />
          </div>
          <div className="flex flex-col items-start text-left">
            <div className="flex items-center gap-1">
              <span className="font-bold text-xs sm:text-sm leading-none">
                {language === 'hi' ? 'AI चिकित्सक' : language === 'mr' ? 'AI डॉक्टर' : 'AI Health Assistant'}
              </span>
              <Mic className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            </div>
            <span className="text-[10px] text-white/80 leading-none mt-0.5">
              {language === 'hi' ? 'बोलें या लिखें • सभी भाषाएं' : language === 'mr' ? 'बोला किंवा लिहा' : 'Voice & Text in all languages'}
            </span>
          </div>
        </button>
      </div>

      {/* Feature: Multilingual AI Health Assistant Chatbot with TTS and STT */}
      <AIHealthAssistant
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onOpenReportGeneratorWithText={handleOpenReportWithText}
      />

      {/* Feature 4: AI Medical Report Generator Modal */}
      <AIMedicalReportGenerator
        isOpen={isReportGenOpen}
        onClose={() => {
          setIsReportGenOpen(false);
          setReportInitialText('');
        }}
        initialText={reportInitialText}
        onReportCreated={handleReportCreated}
      />

      {/* Feature 2: Appointment OPD Booking Modal */}
      <AppointmentModal
        facility={selectedFacilityForApt}
        isOpen={isAptModalOpen}
        onClose={() => setIsAptModalOpen(false)}
        onAppointmentBooked={handleAppointmentBooked}
      />

      {/* Emergency 108 SOS Modal */}
      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
      />

      {/* Official Government Footer in Clean Minimalism styling */}
      <footer className="bg-white text-gray-600 border-t-2 border-[#1A5FB4] mt-12 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-[#DEE9F7] text-[#1A5FB4] flex items-center justify-center font-bold border border-blue-200">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#1A1A1B] text-base">
                {t('appName')}
              </div>
              <p className="text-xs text-gray-500">
                {language === 'hi' 
                  ? 'राष्ट्रीय ग्रामीण स्वास्थ्य मिशन • आयुष्मान भारत डिजिटल मिशन' 
                  : 'National Rural Health Mission • Ayushman Bharat Digital Mission'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold">
            <span className="bg-[#F0F5F9] px-3 py-1.5 rounded-full border border-gray-200 text-gray-700">
              📞 {language === 'hi' ? '108 एम्बुलेंस' : '108 Ambulance'}
            </span>
            <span className="bg-[#F0F5F9] px-3 py-1.5 rounded-full border border-gray-200 text-gray-700">
              🩺 {language === 'hi' ? '104 स्वास्थ्य सलाह' : '104 Medical Advice'}
            </span>
            <span className="bg-[#F0F5F9] px-3 py-1.5 rounded-full border border-gray-200 text-gray-700">
              🛡️ {language === 'hi' ? '14555 आयुष्मान भारत' : '14555 PM-JAY Ayushman'}
            </span>
          </div>

        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-400">
          {language === 'hi' 
            ? 'ग्रामीण एवं दूरदराज क्षेत्रों में सरल व सुलभ स्वास्थ्य सेवाओं के लिए समर्पित।' 
            : 'Designed for accessibility and quality of public healthcare in rural and underserved areas.'}
        </div>
      </footer>

    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <OfflineSyncProvider>
          <MainAppContent />
        </OfflineSyncProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
