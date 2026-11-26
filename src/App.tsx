import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OfflineSyncProvider } from './context/OfflineSyncContext';
import { Navbar } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Footer } from './components/Footer';
import { LoginView } from './components/LoginView';
import { PatientDashboard } from './components/PatientDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { SmartMap } from './components/SmartMap';
import { AIMedicalReportGenerator } from './components/AIMedicalReportGenerator';
import { AIHealthAssistant } from './components/AIHealthAssistant';
import { AppointmentModal } from './components/AppointmentModal';
import { EmergencyModal } from './components/EmergencyModal';
import { DigitalHealthRecord } from './components/DigitalHealthRecord';
import { WelcomeToast } from './components/WelcomeToast';
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
import { MessageSquareText } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { t } = useLanguage();
  const { role } = useAuth();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isReportGenOpen, setIsReportGenOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [reportInitialText, setReportInitialText] = useState('');

  const [facilities] = useState<HealthcareFacility[]>(MOCK_FACILITIES);
  const [selectedFacility, setSelectedFacility] = useState<HealthcareFacility | null>(
    MOCK_FACILITIES[0]
  );
  const [selectedFacilityForApt, setSelectedFacilityForApt] = useState<HealthcareFacility | null>(
    null
  );
  const [isAptModalOpen, setIsAptModalOpen] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>(MOCK_APPOINTMENTS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(MOCK_PRESCRIPTIONS);
  const [triageReports, setTriageReports] = useState<AITriageReport[]>(MOCK_TRIAGE_REPORTS);
  const [vaccinations] = useState<VaccinationRecord[]>(MOCK_VACCINATIONS);

  useEffect(() => {
    fetch('/api/appointments')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setAppointments(data);
      })
      .catch(() => {
        // Retain local fallback data
      });

    fetch('/api/prescriptions')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setPrescriptions(data);
      })
      .catch(() => {
        // Retain local fallback data
      });
  }, []);

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
    setTriageReports((prev) => [report, ...prev]);
    const autoApt: Appointment = {
      id: `apt-${Date.now()}`,
      tokenNumber: appointments.length + 101,
      patientId: report.patientId,
      patientName: report.patientName,
      patientAge: report.patientAge,
      patientGender: report.patientGender,
      patientPhone: report.patientPhone,
      doctorId: 'doc-001',
      doctorName: 'Dr. Rajesh Kumar Patel',
      facilityId: 'fac-001',
      facilityName: 'Panagar Primary Health Centre (PHC)',
      facilityNameHi: 'पनागर प्राथमिक स्वास्थ्य केंद्र (PHC), जबलपुर',
      appointmentDate: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      timeSlot: '11:00 AM – 11:30 AM',
      status: 'WAITING',
      chiefComplaint: `${report.chiefComplaint} (Triage)`,
      riskLevel: report.riskLevel,
      triageRiskLevel: report.riskLevel,
      triageReportId: report.id,
      estimatedWaitMinutes: 15
    };
    setAppointments((prev) => [autoApt, ...prev]);
  };

  const handleBookAppointmentFromFacility = (fac: HealthcareFacility) => {
    setSelectedFacilityForApt(fac);
    setIsAptModalOpen(true);
  };

  const handleAppointmentBooked = (newApt: Appointment) => {
    setAppointments((prev) => [newApt, ...prev]);
  };

  const handlePrescriptionCreated = (newRx: Prescription) => {
    setPrescriptions((prev) => [newRx, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] flex flex-col font-sans text-[var(--text-primary)]">
      {/* Skip to main content link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[var(--brand-primary)] focus:text-white focus:rounded-md focus:text-sm focus:font-semibold"
      >
        Skip to main content
      </a>

      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openEmergencyModal={() => setIsEmergencyOpen(true)}
        openReportGenerator={() => setIsReportGenOpen(true)}
        openChatbot={() => setIsChatbotOpen(true)}
      />

      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-3.5 sm:py-6 pb-24 lg:pb-8">
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

      {/* Restrained Floating Action Button for Symptom Checker */}
      {!isChatbotOpen && role && currentTab !== 'login' && (
        <div className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-25">
          <button
            type="button"
            onClick={() => setIsChatbotOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-full lg:rounded-lg bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white text-xs sm:text-sm font-semibold shadow-[0_4px_16px_rgba(15,76,129,0.35)] transition-all active:scale-95 cursor-pointer"
            aria-label={t('heroPrimaryCta')}
          >
            <MessageSquareText className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">{t('heroPrimaryCta')}</span>
          </button>
        </div>
      )}

      {/* Native Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openReportGenerator={() => setIsReportGenOpen(true)}
        openChatbot={() => setIsChatbotOpen(true)}
        activeAppointmentsCount={appointments.length}
      />

      {/* Symptom Checker Chatbot Dialog */}
      <AIHealthAssistant
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        onOpenReportGeneratorWithText={handleOpenReportWithText}
      />

      {/* Structured Triage Report Dialog */}
      <AIMedicalReportGenerator
        isOpen={isReportGenOpen}
        onClose={() => {
          setIsReportGenOpen(false);
          setReportInitialText('');
        }}
        initialText={reportInitialText}
        onReportCreated={handleReportCreated}
      />

      {/* OPD Appointment Booking Dialog */}
      <AppointmentModal
        facility={selectedFacilityForApt}
        isOpen={isAptModalOpen}
        onClose={() => setIsAptModalOpen(false)}
        onAppointmentBooked={handleAppointmentBooked}
      />

      {/* Emergency Helplines Dialog */}
      <EmergencyModal isOpen={isEmergencyOpen} onClose={() => setIsEmergencyOpen(false)} />

      {/* Welcome Toast Notification upon Sign In */}
      <WelcomeToast />

      {/* Formal Healthcare Portal Footer */}
      <Footer
        onNavigate={setCurrentTab}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenReportGenerator={() => setIsReportGenOpen(true)}
      />
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
