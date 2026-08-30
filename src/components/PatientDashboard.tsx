import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { 
  HealthcareFacility, 
  Prescription, 
  VaccinationRecord, 
  Appointment, 
  AITriageReport 
} from '../types';
import { 
  Building2, 
  MapPin, 
  Clock, 
  Phone, 
  Calendar, 
  Bot, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Stethoscope, 
  Syringe, 
  HeartHandshake, 
  AlertTriangle,
  ChevronRight,
  Activity,
  CheckCircle2
} from 'lucide-react';

interface PatientDashboardProps {
  facilities: HealthcareFacility[];
  prescriptions: Prescription[];
  vaccinations: VaccinationRecord[];
  appointments: Appointment[];
  triageReports: AITriageReport[];
  onSelectFacility: (fac: HealthcareFacility) => void;
  onOpenReportGenerator: () => void;
  onOpenChatbot?: () => void;
  onNavigateToMap: () => void;
  onNavigateToRecords: () => void;
  onBookAppointment: (fac: HealthcareFacility) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  facilities,
  prescriptions,
  vaccinations,
  appointments,
  triageReports,
  onSelectFacility,
  onOpenReportGenerator,
  onOpenChatbot,
  onNavigateToMap,
  onNavigateToRecords,
  onBookAppointment
}) => {
  const { language, t } = useLanguage();
  const { patient } = useAuth();

  const nearestFacility = facilities[0] || null;
  const recentPrescription = prescriptions[0] || null;
  const pendingVaccines = vaccinations.filter(v => v.status === 'PENDING');
  const userAppointments = appointments.filter(a => a.patientName === (patient?.name || 'Rameshwar Lal Sharma'));

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      
      {/* Top Patient Profile & ABHA Identity Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#DEE9F7] text-[#1A5FB4] flex items-center justify-center font-black text-xl shrink-0 border border-blue-200">
            {patient?.name?.charAt(0) || 'R'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1B] tracking-tight">
                {t('welcomePatient')}, {patient?.name || 'Rameshwar Lal'}
              </h1>
              <span className="inline-flex items-center gap-1 bg-[#DEE9F7] text-[#1A5FB4] text-xs font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                ABHA Verified
              </span>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-2">
              <span>📍 {patient?.village || 'Rampur Village'}, Sitapur (UP)</span>
              <span>•</span>
              <span>ABHA ID: <strong className="font-mono text-[#1A1A1B]">{patient?.abhaId}</strong></span>
              <span>•</span>
              <span className="text-[#26A269] font-medium">{patient?.abhaAddress}</span>
            </p>
          </div>
        </div>

        {/* Quick Voice AI Trigger Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onOpenChatbot && (
            <button
              onClick={onOpenChatbot}
              className="bg-[#DEE9F7] hover:bg-[#c6dcf7] active:scale-95 text-[#1A5FB4] border border-blue-200 font-bold px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-[#1A5FB4]" />
              <span>{language === 'hi' ? 'AI डॉक्टर से पूछें' : language === 'mr' ? 'AI डॉक्टरशी बोला' : 'Talk to AI Doctor'}</span>
            </button>
          )}

          <button
            onClick={onOpenReportGenerator}
            className="bg-[#1A5FB4] hover:bg-blue-700 active:scale-95 text-white font-bold px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{t('generateReportBtn')}</span>
          </button>
        </div>
      </div>

      {/* Active OPD Token Banner (if booked) */}
      {userAppointments.length > 0 && (
        <div className="bg-[#DEE9F7] border border-[#1A5FB4]/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#1A5FB4] text-white flex items-center justify-center font-bold text-lg">
              #{userAppointments[0].tokenNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1A5FB4]">
                  {language === 'hi' ? 'सक्रिय ओपीडी पर्ची टोकन' : 'Active OPD Token'}
                </span>
                <span className="bg-[#26A269] text-white text-[10px] font-bold px-2 py-0.2 rounded-full">
                  Confirmed
                </span>
              </div>
              <h3 className="font-bold text-[#1A1A1B] text-sm sm:text-base">
                {userAppointments[0].facilityName} • {userAppointments[0].doctorName}
              </h3>
              <p className="text-xs text-gray-600">
                {userAppointments[0].appointmentDate} | Slot: {userAppointments[0].timeSlot}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs font-bold text-[#1A5FB4]">
              {language === 'hi' ? 'सीतापुर PHC ओपीडी रूम #3' : 'Sitapur PHC OPD Room #3'}
            </div>
            <div className="text-[11px] text-gray-500">
              {language === 'hi' ? 'कृपया समय पर उपस्थित रहें' : 'Please arrive 10 min prior'}
            </div>
          </div>
        </div>
      )}

      {/* 4 Core Functionality Cards with Balanced Aspect Ratio */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: AI Symptom Triage Report */}
        <div 
          onClick={onOpenReportGenerator}
          className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-[#1A5FB4] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[190px] hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#DEE9F7] text-[#1A5FB4] flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <Bot className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1A5FB4] bg-[#DEE9F7] px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-[#1A5FB4]" />
                {language === 'hi' ? 'त्वरित जांच' : 'AI Triage'}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#1A1A1B] group-hover:text-[#1A5FB4] transition-colors leading-snug">
              {t('actionAIAssistant')}
            </h2>
            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed min-h-[34px]">
              {t('actionAIAssistantDesc')}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1A5FB4]">
            <span>{language === 'hi' ? 'जांच शुरू करें' : 'Start Checkup'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Find Facilities & Live Bed Availability */}
        <div 
          onClick={onNavigateToMap}
          className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-[#26A269] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[190px] hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#26A269] flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-100 shadow-2xs">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#26A269] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                {language === 'hi' ? 'लाइव GPS' : 'Live GPS'}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#1A1A1B] group-hover:text-[#26A269] transition-colors leading-snug">
              {t('actionFindDoctor')}
            </h2>
            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed min-h-[34px]">
              {t('actionFindDoctorDesc')}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#26A269]">
            <span>{language === 'hi' ? 'नक्शा खोलें' : 'Open Map'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Free OPD Appointment Booking */}
        <div 
          onClick={() => nearestFacility && onBookAppointment(nearestFacility)}
          className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-[#1A5FB4] shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[190px] hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1A5FB4] flex items-center justify-center group-hover:scale-105 transition-transform border border-blue-100 shadow-2xs">
                <Calendar className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1A5FB4] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/50">
                {language === 'hi' ? 'मुफ्त टोकन' : 'Free Token'}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#1A1A1B] group-hover:text-[#1A5FB4] transition-colors leading-snug">
              {t('actionBookAppointment')}
            </h2>
            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed min-h-[34px]">
              {t('actionBookAppointmentDesc')}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#1A5FB4]">
            <span>{language === 'hi' ? 'अभी बुक करें' : 'Book Now'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Digital ABHA Records & Prescriptions */}
        <div 
          onClick={onNavigateToRecords}
          className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-slate-400 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between min-h-[190px] hover:-translate-y-0.5"
        >
          <div>
            <div className="flex items-center justify-between mb-3.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <FileText className="w-5 h-5" />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {language === 'hi' ? 'आभा कार्ड' : 'ABHA Card'}
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-bold text-[#1A1A1B] group-hover:text-[#1A5FB4] transition-colors leading-snug">
              {t('actionHealthRecords')}
            </h2>
            <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed min-h-[34px]">
              {t('actionHealthRecordsDesc')}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-slate-700">
            <span>{language === 'hi' ? 'रिकॉर्ड देखें' : 'View Records'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Public Health Advisory Banner */}
      <div className="bg-[#26A269] text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <HeartHandshake className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-xs uppercase font-bold tracking-wider text-emerald-100 mb-0.5">
              {language === 'hi' ? 'साप्ताहिक स्वास्थ्य सलाह' : 'Weekly Public Health Tip'}
            </div>
            <p className="font-bold text-sm sm:text-base leading-snug">
              {language === 'hi'
                ? 'मानसून के मौसम में पानी को उबालकर पीना 80% जलजनित बीमारियों (डायरिया, पीलिया) से बचाता है।'
                : 'Boiled drinking water during monsoon prevents 80% of water-borne diseases like diarrhea and jaundice.'}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenReportGenerator}
          className="bg-white hover:bg-emerald-50 text-[#26A269] font-bold px-4 py-2 rounded-xl text-xs whitespace-nowrap shadow-xs transition-colors self-end sm:self-center cursor-pointer"
        >
          {language === 'hi' ? 'रिपोर्ट बनाएं' : 'Check Symptoms'}
        </button>
      </div>

      {/* Main Two-Column Content Grid: Nearest Facilities + Records Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Nearest Health Centers with Live Bed & Doctor Status */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1B]">
                {t('nearestFacilities')}
              </h2>
              <p className="text-xs text-gray-500">
                {language === 'hi' ? 'लाइव डॉक्टर उपस्थिति एवं बेड उपलब्धता' : 'Real-time doctor attendance & bed telemetry'}
              </p>
            </div>

            <button
              onClick={onNavigateToMap}
              className="text-xs font-bold text-[#1A5FB4] hover:underline flex items-center gap-1"
            >
              <span>{t('viewAllOnMap')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {facilities.slice(0, 3).map((fac) => (
              <div
                key={fac.id}
                className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-gray-300 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#DEE9F7] text-[#1A5FB4]">
                      {fac.type}
                    </span>
                    <span className="text-xs text-gray-500 font-bold">
                      📍 {fac.distanceKm} km
                    </span>
                    {fac.emergencyAvailable && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-100 text-[#E01B24]">
                        24x7 Emergency
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-[#1A1A1B]">
                    {language === 'hi' ? fac.nameHi : fac.name}
                  </h3>

                  <p className="text-xs text-gray-600 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-[#26A269]" />
                    <span>{fac.doctorName} ({fac.specialty})</span>
                  </p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-1">
                    <span className="text-[#26A269] font-semibold">
                      🛏️ {fac.availableBeds}/{fac.totalBeds} {t('bedsAvailable')}
                    </span>
                    <span>•</span>
                    <span className="text-[#1A5FB4] font-medium">
                      ⏱️ {fac.currentWaitTimeMin} min OPD wait
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <button
                    onClick={() => onBookAppointment(fac)}
                    className="w-full sm:w-auto bg-[#1A5FB4] hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors text-center"
                  >
                    {t('bookOpdToken')}
                  </button>

                  <button
                    onClick={() => onSelectFacility(fac)}
                    className="w-full sm:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold px-3 py-2 rounded-xl text-xs transition-colors text-center"
                  >
                    {t('details')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (5 cols): Recent Prescription & Vaccination Tracker */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Recent Prescription Card */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#1A5FB4]" />
                <h3 className="font-bold text-sm text-[#1A1A1B]">
                  {t('recentPrescription')}
                </h3>
              </div>
              <button
                onClick={onNavigateToRecords}
                className="text-xs font-bold text-[#1A5FB4] hover:underline"
              >
                {t('viewAll')}
              </button>
            </div>

            {recentPrescription ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Date: <strong>{recentPrescription.date}</strong></span>
                  <span className="bg-[#DEE9F7] text-[#1A5FB4] font-bold px-2 py-0.5 rounded">
                    {recentPrescription.id}
                  </span>
                </div>

                <div className="bg-[#F0F5F9] p-3 rounded-xl border border-gray-200">
                  <div className="text-xs text-gray-500 font-bold">{t('diagnosis')}:</div>
                  <div className="text-sm font-bold text-[#1A1A1B]">
                    {language === 'hi' ? recentPrescription.diagnosisHi : recentPrescription.diagnosis}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    Dr. {recentPrescription.doctorName} • {recentPrescription.facilityName}
                  </div>
                </div>

                {/* Prescribed generic medicines list */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-gray-700">
                    {language === 'hi' ? '℞ निर्धारित दवाइयां:' : '℞ Prescribed Generic Medicines:'}
                  </div>
                  {recentPrescription.medicines.slice(0, 2).map((med, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <div>
                        <span className="font-bold text-gray-900">{med.name}</span>
                        <span className="text-gray-500 text-[11px] block">{language === 'hi' ? (med.frequencyHi || med.frequency) : med.frequency}</span>
                      </div>
                      <span className="text-gray-600 font-bold text-[11px]">{med.duration}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-500">{t('noPrescriptionsYet')}</p>
            )}
          </div>

          {/* Mission Indradhanush Vaccination Alert */}
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Syringe className="w-5 h-5 text-[#26A269]" />
                <h3 className="font-bold text-sm text-[#1A1A1B]">
                  {t('vaccineSchedule')}
                </h3>
              </div>
              <span className="text-[10px] bg-emerald-100 text-[#26A269] font-bold px-2 py-0.5 rounded-full">
                UIP Free
              </span>
            </div>

            <div className="space-y-2">
              {vaccinations.slice(0, 2).map((vac) => (
                <div 
                  key={vac.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#F0F5F9] border border-gray-200 text-xs"
                >
                  <div>
                    <div className="font-bold text-gray-900">{vac.vaccineName}</div>
                    <div className="text-gray-500 text-[11px]">{vac.beneficiaryName} ({vac.category})</div>
                    <div className="text-gray-400 text-[10px]">Due: {vac.dueDate}</div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                    vac.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}>
                    {vac.status === 'COMPLETED' 
                      ? (language === 'hi' ? 'टीका लगा ✓' : 'Given ✓') 
                      : (language === 'hi' ? 'लगाना बाकी ⏳' : 'Due ⏳')}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
