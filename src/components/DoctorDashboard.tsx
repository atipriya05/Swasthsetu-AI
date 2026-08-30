import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../context/OfflineSyncContext';
import { Appointment, AITriageReport, Prescription, PrescribedMedicine } from '../types';
import { 
  Stethoscope, 
  Users, 
  CheckCircle2, 
  Plus, 
  Bot, 
  Trash2,
  WifiOff,
  CloudCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DoctorDashboardProps {
  appointments: Appointment[];
  triageReports: AITriageReport[];
  onPrescriptionCreated: (rx: Prescription) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  appointments,
  triageReports,
  onPrescriptionCreated
}) => {
  const { language, t } = useLanguage();
  const { doctor } = useAuth();
  const { isOffline, addToQueue } = useOfflineSync();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(appointments[0] || null);
  
  // Prescription Form State
  const [diagnosis, setDiagnosis] = useState('Acute Viral Bronchitis / Upper Respiratory Infection');
  const [diagnosisHi, setDiagnosisHi] = useState('तीव्र मौसमी वायरल बुखार एवं श्वसन संक्रमण');
  const [medicines, setMedicines] = useState<PrescribedMedicine[]>([
    { id: 'm-1', name: 'Tab Paracetamol 500mg (Jan Aushadhi)', dosage: '500mg', frequency: '3 times daily after food', frequencyHi: 'दिन में 3 बार खाने के बाद', duration: '5 days', instructions: 'Take with warm water' },
    { id: 'm-2', name: 'Tab Cetirizine 10mg', dosage: '10mg', frequency: 'Once at bedtime', frequencyHi: 'रात को सोने से पहले 1 गोली', duration: '5 days', instructions: 'May cause mild drowsiness' },
    { id: 'm-3', name: 'Syrup Jan Aushadhi Herbal Cough Formula', dosage: '10ml', frequency: 'Twice daily', frequencyHi: 'सुबह और शाम 2 चम्मच', duration: '5 days', instructions: 'Warm water sip' }
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedFreq, setNewMedFreq] = useState(language === 'hi' ? 'दिन में 2 बार' : 'Twice daily');
  const [newMedDuration, setNewMedDuration] = useState(language === 'hi' ? '3 दिन' : '3 days');
  
  const [labTests, setLabTests] = useState<string[]>([
    language === 'hi' ? 'कम्प्लीट ब्लड काउंट (CBC)' : 'Complete Blood Count (CBC)', 
    language === 'hi' ? 'मलेरिया एंटीजन जांच' : 'Malaria Antigen Card Test'
  ]);
  const [advice, setAdvice] = useState(
    language === 'hi'
      ? 'उबला हुआ गुनगुना पानी पिएं, पर्याप्त आराम करें और सांस लेने में तकलीफ होने पर तुरंत प्राथमिक स्वास्थ्य केंद्र आएं।'
      : 'Drink plenty of boiled water, take complete bed rest, and report immediately if breathlessness develops.'
  );
  const [isSuccess, setIsSuccess] = useState(false);

  const matchedTriage = triageReports.find(
    tr => tr.patientName === selectedAppointment?.patientName || tr.patientId === selectedAppointment?.id
  ) || triageReports[0];

  const handleAddMedicine = () => {
    if (!newMedName.trim()) return;
    setMedicines(prev => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        name: newMedName,
        dosage: 'Standard',
        frequency: newMedFreq,
        frequencyHi: newMedFreq,
        duration: newMedDuration,
        instructions: 'After meals'
      }
    ]);
    setNewMedName('');
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines(prev => prev.filter((_, i) => i !== index));
  };

  const handleIssuePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    const newRx: Prescription = {
      id: `RX-UP-${Date.now().toString().slice(-6)}`,
      patientId: 'pat-001',
      patientName: selectedAppointment.patientName,
      patientAge: selectedAppointment.patientAge,
      patientGender: 'Male',
      doctorId: doctor?.id || 'doc-001',
      doctorName: doctor?.name || 'Dr. Alok Verma',
      doctorRegistrationNo: doctor?.registrationNo || 'MCI-UP-2018-9482',
      facilityName: doctor?.facilityName || 'Sitapur Primary Health Centre',
      date: new Date().toISOString().split('T')[0],
      diagnosis: language === 'hi' ? diagnosisHi : diagnosis,
      diagnosisHi,
      medicines,
      labTests,
      advice,
      followUpDate: language === 'hi' ? '3 दिन बाद' : 'After 3 days'
    };

    if (isOffline) {
      addToQueue('prescription', newRx);
    }

    onPrescriptionCreated(newRx);
    setIsSuccess(true);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.6 }
    });

    setTimeout(() => {
      setIsSuccess(false);
    }, 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      
      {/* Doctor Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#26A269] flex items-center justify-center font-bold text-xl border border-emerald-200">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1B] tracking-tight">
                {doctor?.name || 'Dr. Alok Verma'}
              </h1>
              <span className="bg-emerald-100 text-[#26A269] text-xs font-bold px-2.5 py-0.5 rounded-full">
                Medical Officer
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {doctor?.facilityName || 'Sitapur Primary Health Centre'} • Reg: {doctor?.registrationNo || 'MCI-UP-2018-9482'}
            </p>
          </div>
        </div>

        {/* Real-time stats pills */}
        <div className="flex items-center gap-3">
          <div className="bg-[#F0F5F9] border border-gray-200 rounded-xl px-4 py-2 text-center">
            <span className="text-[11px] text-gray-500 font-bold block">{t('patientsToday')}</span>
            <span className="text-lg font-bold text-[#1A5FB4]">18 / 30</span>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-center">
            <span className="text-[11px] text-emerald-800 font-bold block">{t('inWaitingQueue')}</span>
            <span className="text-lg font-bold text-[#26A269]">{appointments.length} Patients</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left OPD Patient Queue + Right Electronic Prescription Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (4 cols): Live Patient Waiting Queue & AI Triage Summary */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#1A5FB4]" />
                <h3 className="font-bold text-sm text-[#1A1A1B]">
                  {t('liveOpdQueue')} ({appointments.length})
                </h3>
              </div>
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#26A269] animate-pulse" />
                Live Sync
              </span>
            </div>

            <div className="space-y-2.5">
              {appointments.map((apt) => {
                const isSelected = selectedAppointment?.id === apt.id;
                return (
                  <div
                    key={apt.id}
                    onClick={() => setSelectedAppointment(apt)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#DEE9F7] border-[#1A5FB4] shadow-xs'
                        : 'bg-[#F0F5F9] border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-xs bg-white text-[#1A5FB4] px-2 py-0.5 rounded border border-blue-200">
                        Token #{apt.tokenNumber}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        apt.riskLevel === 'Red' ? 'bg-red-100 text-[#E01B24]' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {apt.riskLevel} Risk
                      </span>
                    </div>

                    <div className="font-bold text-sm text-[#1A1A1B] mt-2">
                      {apt.patientName} ({apt.patientAge} Yrs)
                    </div>

                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                      Reason: {apt.chiefComplaint}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Pre-Consultation Summary Card for Selected Patient */}
          {matchedTriage && (
            <div className="bg-white rounded-2xl p-5 border border-indigo-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-xs uppercase tracking-wider text-indigo-900">
                    AI Clinical Translation & Triage
                  </h4>
                </div>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-bold px-2 py-0.5 rounded">
                  Gemini 2.5
                </span>
              </div>

              <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 text-xs space-y-1.5">
                <div className="text-indigo-950">
                  <span className="font-bold text-indigo-700">
                    {language === 'hi' ? 'मरीज़ का कथन: ' : 'Patient Statement: '}
                  </span>
                  "{matchedTriage.rawInput}"
                </div>
                <div className="text-gray-900 pt-1 border-t border-indigo-200">
                  <span className="font-bold text-[#1A5FB4]">
                    {language === 'hi' ? 'डॉक्टर सारांश: ' : 'Clinical Summary: '}
                  </span>
                  "{matchedTriage.translatedInputEn}"
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (8 cols): Electronic Prescription (e-Prescription) Pad */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            
            {/* Header of Prescription */}
            <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#26A269]">
                  {language === 'hi' ? 'आयुष्मान भारत • डिजिटल ओपीडी पर्ची' : 'Ayushman Bharat • Digital OPD Prescription'}
                </span>
                <h2 className="text-xl font-bold text-[#1A1A1B]">
                  {selectedAppointment?.patientName || 'Rameshwar Lal Sharma'}
                </h2>
                <p className="text-xs text-gray-500">
                  {language === 'hi' 
                    ? `आयु: ${selectedAppointment?.patientAge || 58} वर्ष • टोकन: #${selectedAppointment?.tokenNumber || 1}` 
                    : `Age: ${selectedAppointment?.patientAge || 58} Yrs • Token: #${selectedAppointment?.tokenNumber || 1}`}
                </p>
              </div>

              {isSuccess && (
                <div className="bg-emerald-100 text-[#26A269] text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{t('prescriptionSavedSuccess')}</span>
                </div>
              )}
            </div>

            <form onSubmit={handleIssuePrescription} className="space-y-5">
              
              {/* Diagnosis Field */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('clinicalDiagnosis')}
                </label>
                <input
                  type="text"
                  value={language === 'hi' ? diagnosisHi : diagnosis}
                  onChange={(e) => {
                    if (language === 'hi') {
                      setDiagnosisHi(e.target.value);
                    } else {
                      setDiagnosis(e.target.value);
                    }
                  }}
                  className="w-full px-4 py-2.5 bg-[#F0F5F9] border border-gray-200 rounded-xl text-sm font-bold text-[#1A1A1B] focus:bg-white focus:ring-2 focus:ring-[#1A5FB4] outline-hidden"
                  required
                />
              </div>

              {/* Medicines Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    {language === 'hi' ? '℞ निर्धारित दवाइयां:' : '℞ Prescribed Medicines:'}
                  </label>
                </div>

                <div className="space-y-2">
                  {medicines.map((med, idx) => (
                    <div 
                      key={med.id || idx}
                      className="bg-[#F0F5F9] p-3 rounded-xl border border-gray-200 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex-1">
                        <div className="font-bold text-[#1A1A1B]">{med.name}</div>
                        <div className="text-[#26A269] font-medium mt-0.5">
                          {language === 'hi' ? (med.frequencyHi || med.frequency) : med.frequency} • {med.duration}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        className="text-gray-400 hover:text-[#E01B24] p-1 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Medicine Inline */}
                <div className="bg-gray-50 p-3 rounded-xl border border-dashed border-gray-300 grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'दवा का नाम (उदा. Tab Paracetamol 500mg)' : 'Medicine name (e.g. Tab Paracetamol 500mg)'}
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="sm:col-span-6 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'समय (उदा. दिन में 2 बार)' : 'Frequency (e.g. 2 times daily)'}
                    value={newMedFreq}
                    onChange={(e) => setNewMedFreq(e.target.value)}
                    className="sm:col-span-3 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder={language === 'hi' ? 'अवधि' : 'Duration'}
                    value={newMedDuration}
                    onChange={(e) => setNewMedDuration(e.target.value)}
                    className="sm:col-span-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="sm:col-span-1 bg-[#1A5FB4] text-white rounded-lg flex items-center justify-center p-2 hover:bg-blue-700 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lab Tests & Doctor Advice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'hi' ? '🔬 सुझाई गई लैब जांच:' : '🔬 Recommended Diagnostic Lab Tests:'}
                  </label>
                  <input
                    type="text"
                    value={labTests.join(', ')}
                    onChange={(e) => setLabTests(e.target.value.split(',').map(s => s.trim()))}
                    className="w-full px-3 py-2 bg-[#F0F5F9] border border-gray-200 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {language === 'hi' ? '📋 मरीज़ के लिए सलाह:' : '📋 General Patient Advisory:'}
                  </label>
                  <input
                    type="text"
                    value={advice}
                    onChange={(e) => setAdvice(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F0F5F9] border border-gray-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Submit & Save Prescription Button */}
              <button
                type="submit"
                className="w-full bg-[#26A269] hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>{t('saveAndSignRx')}</span>
              </button>

            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
