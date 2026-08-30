import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Prescription, VaccinationRecord, AITriageReport } from '../types';
import { 
  FileText, 
  ShieldCheck, 
  Syringe, 
  QrCode, 
  Printer, 
  Bot, 
  Calendar, 
  Building2, 
  Stethoscope, 
  Clock,
  Sparkles,
  Pill,
  Volume2,
  Square
} from 'lucide-react';
import { SpeechService } from '../utils/speech';

interface DigitalHealthRecordProps {
  prescriptions: Prescription[];
  vaccinations: VaccinationRecord[];
  triageHistory: AITriageReport[];
}

export const DigitalHealthRecord: React.FC<DigitalHealthRecordProps> = ({
  prescriptions,
  vaccinations,
  triageHistory
}) => {
  const { language, t } = useLanguage();
  const { patient } = useAuth();

  const [activeTab, setActiveTab] = useState<'PRESCRIPTIONS' | 'VACCINES' | 'AI_TRIAGE' | 'ABHA_CARD'>('PRESCRIPTIONS');
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(prescriptions[0] || null);
  const [isSpeakingRx, setIsSpeakingRx] = useState(false);

  useEffect(() => {
    return () => {
      SpeechService.stop();
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const toggleSpeakPrescription = () => {
    if (isSpeakingRx) {
      SpeechService.stop();
      setIsSpeakingRx(false);
      return;
    }

    if (!selectedPrescription) return;

    const medText = selectedPrescription.medicines.map(m => `${m.name}, ${language === 'hi' ? (m.frequencyHi || m.frequency) : m.frequency}, ${m.duration}`).join('. ');
    const textToSpeak = language === 'hi'
      ? `डॉक्टर ${selectedPrescription.doctorName} द्वारा जारी पर्ची। बीमारी: ${selectedPrescription.diagnosisHi || selectedPrescription.diagnosis}। दवाइयां: ${medText}। डॉक्टर की सलाह: ${selectedPrescription.advice || ''}`
      : `Prescription by Dr. ${selectedPrescription.doctorName}. Diagnosis: ${selectedPrescription.diagnosis}. Medicines: ${medText}. Advice: ${selectedPrescription.advice || ''}`;

    setIsSpeakingRx(true);
    SpeechService.speak(
      textToSpeak,
      language,
      () => setIsSpeakingRx(true),
      () => setIsSpeakingRx(false),
      () => setIsSpeakingRx(false)
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      
      {/* ABHA National Health Card Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#DEE9F7] text-[#1A5FB4] text-xs font-bold px-3 py-1 rounded-full mb-2 border border-blue-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ayushman Bharat Digital Mission (ABDM)</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1B] tracking-tight">
            {t('healthRecordsTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            ABHA ID: <strong className="text-[#1A1A1B] font-mono">{patient?.abhaId}</strong> • ABHA Address: <strong className="text-[#26A269]">{patient?.abhaAddress}</strong>
          </p>
        </div>

        {/* Print / Download Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="bg-[#1A5FB4] hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{t('printRecord')}</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs in Clean Minimalism pill styling */}
      <div className="flex flex-wrap items-center gap-1.5 bg-[#F0F5F9] p-1.5 rounded-full border border-gray-200 w-fit">
        <button
          onClick={() => setActiveTab('PRESCRIPTIONS')}
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'PRESCRIPTIONS'
              ? 'bg-white text-[#1A5FB4] shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileText className="w-4 h-4 text-[#1A5FB4]" />
          <span>{t('myPrescriptions')} ({prescriptions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('VACCINES')}
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'VACCINES'
              ? 'bg-white text-[#1A5FB4] shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Syringe className="w-4 h-4 text-[#26A269]" />
          <span>{t('vaccineSchedule')} ({vaccinations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('AI_TRIAGE')}
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'AI_TRIAGE'
              ? 'bg-white text-[#1A5FB4] shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Bot className="w-4 h-4 text-indigo-600" />
          <span>{t('aiTriageReports')} ({triageHistory.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ABHA_CARD')}
          className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
            activeTab === 'ABHA_CARD'
              ? 'bg-white text-[#1A5FB4] shadow-xs'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <QrCode className="w-4 h-4 text-[#1A5FB4]" />
          <span>{t('abhaCard')}</span>
        </button>
      </div>

      {/* Tab 1: Prescriptions Grid */}
      {activeTab === 'PRESCRIPTIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* List of Prescriptions (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            {prescriptions.map((rx) => {
              const isSelected = selectedPrescription?.id === rx.id;
              return (
                <div
                  key={rx.id}
                  onClick={() => setSelectedPrescription(rx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'bg-[#DEE9F7] border-[#1A5FB4] ring-2 ring-blue-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-1">
                    <span>{rx.date}</span>
                    <span className="text-[#1A5FB4] bg-white px-2 py-0.5 rounded border border-blue-200">
                      {rx.id}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-[#1A1A1B]">
                    {language === 'hi' ? rx.diagnosisHi : rx.diagnosis}
                  </div>

                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-[#26A269]" />
                    <span>{rx.doctorName}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Printable Prescription Preview (8 cols) */}
          {selectedPrescription && (
            <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
              
              {/* Prescription Official Header */}
              <div className="border-b-2 border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-[#26A269]">
                    Government of Uttar Pradesh • Department of Medical Health
                  </div>
                  <h3 className="text-lg font-bold text-[#1A1A1B]">
                    {selectedPrescription.facilityName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedPrescription.doctorName} (Reg: {selectedPrescription.doctorRegistrationNo})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={toggleSpeakPrescription}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      isSpeakingRx
                        ? 'bg-red-50 text-[#E01B24] border-red-200 ring-2 ring-red-100'
                        : 'bg-[#DEE9F7] text-[#1A5FB4] border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    {isSpeakingRx ? (
                      <>
                        <Square className="w-3.5 h-3.5 fill-current animate-pulse" />
                        <span>{language === 'hi' ? 'रोकें' : 'Stop'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{language === 'hi' ? 'दवाइयां सुनें' : 'Listen Rx'}</span>
                      </>
                    )}
                  </button>

                  <div className="text-left sm:text-right text-xs">
                    <div className="font-mono font-bold text-[#1A1A1B]">Date: {selectedPrescription.date}</div>
                    <div className="text-gray-500">Rx ID: {selectedPrescription.id}</div>
                  </div>
                </div>
              </div>

              {/* Patient Demographics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-[#F0F5F9] rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-500 font-bold block">Patient Name:</span>
                  <span className="font-bold text-[#1A1A1B]">{selectedPrescription.patientName}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-bold block">Age / Gender:</span>
                  <span className="font-medium text-[#1A1A1B]">{selectedPrescription.patientAge} Yrs / {selectedPrescription.patientGender}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-bold block">ABHA ID:</span>
                  <span className="font-mono font-bold text-[#1A5FB4]">{patient?.abhaId}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-bold block">Follow-up:</span>
                  <span className="font-bold text-[#26A269]">{selectedPrescription.followUpDate || '3 Days'}</span>
                </div>
              </div>

              {/* Clinical Diagnosis */}
              <div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  Diagnosis:
                </span>
                <div className="p-3 bg-[#DEE9F7] border border-blue-200 rounded-xl text-sm font-bold text-[#1A5FB4]">
                  {selectedPrescription.diagnosis}
                </div>
              </div>

              {/* Prescribed Medicines */}
              <div className="space-y-3">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  {language === 'hi' ? '℞ निर्धारित दवाइयां (जन औषधि):' : '℞ Prescribed Generic Medicines:'}
                </span>

                <div className="space-y-2">
                  {selectedPrescription.medicines.map((med, idx) => (
                    <div key={idx} className="p-3 bg-[#F0F5F9] rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                      <div>
                        <div className="font-bold text-[#1A1A1B] text-sm">
                          {idx + 1}. {med.name}
                        </div>
                        <div className="text-[#26A269] font-bold mt-0.5">
                          {language === 'hi' ? (med.frequencyHi || med.frequency) : med.frequency}
                        </div>
                        {med.instructions && (
                          <div className="text-[11px] text-gray-500">
                            {language === 'hi' ? `निर्देश: ${med.instructions}` : `Note: ${med.instructions}`}
                          </div>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="bg-white border border-gray-300 font-bold px-2 py-1 rounded-md text-xs">
                          {med.duration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lab Tests & Doctor Advice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {selectedPrescription.labTests && selectedPrescription.labTests.length > 0 && (
                  <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="font-bold text-amber-900 block mb-1">
                      {language === 'hi' ? '🔬 सुझाई गई जांच:' : '🔬 Recommended Diagnostic Tests:'}
                    </span>
                    <ul className="list-disc list-inside text-amber-950 font-medium space-y-0.5">
                      {selectedPrescription.labTests.map((tst, i) => (
                        <li key={i}>{tst}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="p-3.5 bg-[#F0F5F9] rounded-xl border border-gray-200">
                  <span className="font-bold text-gray-700 block mb-1">
                    {language === 'hi' ? '📋 डॉक्टर की सलाह:' : '📋 General Doctor Advice:'}
                  </span>
                  <p className="text-gray-800 font-medium">
                    {selectedPrescription.advice}
                  </p>
                </div>
              </div>

              {/* Doctor Digital Signature */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-[11px] text-gray-400">
                  Digitally signed under Section 5 of Information Technology Act 2000.
                </div>
                <div className="text-right">
                  <div className="font-serif italic font-bold text-[#1A5FB4] text-sm">
                    {selectedPrescription.doctorName}
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Medical Officer, PHC Sitapur
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* Tab 2: Mission Indradhanush Vaccination Schedule */}
      {activeTab === 'VACCINES' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-5">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-[#26A269] text-xs font-bold px-3 py-1 rounded-full mb-2">
              <Syringe className="w-3.5 h-3.5" />
              <span>Universal Immunization Programme (UIP)</span>
            </div>
            <h3 className="text-xl font-bold text-[#1A1A1B]">
              {t('vaccineSchedule')}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Government of India Universal Free Vaccination Tracker
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vaccinations.map((vac) => (
              <div
                key={vac.id}
                className="p-4 rounded-xl border border-gray-200 bg-[#F0F5F9] hover:bg-gray-100 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white ${
                    vac.status === 'COMPLETED' ? 'bg-[#26A269]' : 'bg-amber-500'
                  }`}>
                    {vac.status === 'COMPLETED' ? '✓' : '⏳'}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[#1A1A1B]">
                      {vac.vaccineName}
                    </div>
                    <div className="text-xs text-gray-500">
                      Beneficiary: <strong>{vac.beneficiaryName}</strong> ({vac.category})
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5">
                      Due: {vac.dueDate} {vac.administeredDate ? `• Given: ${vac.administeredDate}` : ''}
                    </div>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  vac.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-[#26A269]'
                    : 'bg-amber-100 text-amber-900'
                }`}>
                  {vac.status === 'COMPLETED' ? t('vaccineGiven') : t('vaccineDue')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: AI Triage History */}
      {activeTab === 'AI_TRIAGE' && (
        <div className="space-y-4">
          {triageHistory.map((tr) => (
            <div
              key={tr.id}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-sm text-[#1A1A1B]">{tr.chiefComplaint}</span>
                  <span className="text-xs text-gray-400 font-mono">({tr.id})</span>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  tr.riskLevel === 'Red'
                    ? 'bg-[#E01B24] text-white'
                    : tr.riskLevel === 'Yellow'
                    ? 'bg-amber-500 text-white'
                    : 'bg-[#26A269] text-white'
                }`}>
                  {tr.riskLevel} Risk
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#F0F5F9] p-3 rounded-xl">
                <div>
                  <span className="font-bold text-gray-500 block mb-1">Spoken Query ({tr.languageInput.toUpperCase()}):</span>
                  <p className="font-medium text-[#1A1A1B]">"{tr.rawInput}"</p>
                </div>
                <div>
                  <span className="font-bold text-[#1A5FB4] block mb-1">AI Clinical Translation:</span>
                  <p className="font-bold text-[#1A1A1B]">"{tr.translatedInputEn}"</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Official ABHA Card QR View */}
      {activeTab === 'ABHA_CARD' && (
        <div className="max-w-md mx-auto bg-white text-[#1A1A1B] rounded-2xl p-6 sm:p-8 shadow-sm border-2 border-[#1A5FB4] relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1A5FB4] text-white font-bold text-xs flex items-center justify-center">
                ABDM
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                  National Health Authority
                </div>
                <div className="text-sm font-bold text-[#1A5FB4]">
                  Ayushman Bharat Health Card
                </div>
              </div>
            </div>
            <ShieldCheck className="w-6 h-6 text-[#26A269]" />
          </div>

          <div className="flex items-center justify-between gap-4 my-6">
            <div>
              <div className="text-xs text-gray-500 uppercase font-bold">Name:</div>
              <div className="text-lg font-bold text-[#1A1A1B]">{patient?.name}</div>
              
              <div className="text-xs text-gray-500 uppercase font-bold mt-2">ABHA Number:</div>
              <div className="text-base font-mono font-bold tracking-widest text-[#1A5FB4]">
                {patient?.abhaId}
              </div>

              <div className="text-xs text-gray-500 uppercase font-bold mt-2">Village & State:</div>
              <div className="text-xs font-medium text-gray-700">
                {patient?.village}, Uttar Pradesh
              </div>
            </div>

            {/* QR Code Graphic simulation */}
            <div className="bg-[#F0F5F9] p-2.5 rounded-xl border border-gray-200 shrink-0">
              <div className="w-24 h-24 bg-white rounded-lg flex flex-col items-center justify-center p-2 text-center border border-gray-200">
                <QrCode className="w-16 h-16 text-[#1A5FB4]" />
                <span className="text-[8px] font-mono text-[#26A269] font-bold">ABHA SCAN</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-gray-200 text-center text-[10px] text-gray-500">
            Valid across all AIIMS, District Hospitals, CHCs, and PHCs across India.
          </div>

        </div>
      )}

    </div>
  );
};
