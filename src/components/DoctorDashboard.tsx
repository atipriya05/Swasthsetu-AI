import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../context/OfflineSyncContext';
import { Appointment, AITriageReport, Prescription, PrescribedMedicine } from '../types';
import { Stethoscope, Users, CheckCircle2, Plus, Trash2, FileText } from 'lucide-react';

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
  const { doctor, quickDemoLogin } = useAuth();
  const { isOffline, addToQueue } = useOfflineSync();

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(
    appointments[0] || null
  );

  const [diagnosis, setDiagnosis] = useState(
    'Acute Viral Bronchitis / Upper Respiratory Tract Infection'
  );
  const [diagnosisHi, setDiagnosisHi] = useState('तीव्र मौसमी वायरल बुखार एवं ऊपरी श्वसन संक्रमण');
  const [medicines, setMedicines] = useState<PrescribedMedicine[]>([
    {
      id: 'm-1',
      name: 'Tab. Paracetamol 500mg (Jan Aushadhi)',
      dosage: '500mg',
      frequency: 'Thrice daily after meals',
      frequencyHi: 'दिन में 3 बार भोजन के बाद',
      duration: '5 Days',
      instructions: 'Take with warm water'
    },
    {
      id: 'm-2',
      name: 'Tab. Cetirizine 10mg',
      dosage: '10mg',
      frequency: 'Once at bedtime',
      frequencyHi: 'रात को सोने से पहले 1 गोली',
      duration: '5 Days',
      instructions: 'May cause mild drowsiness'
    }
  ]);
  const [newMedName, setNewMedName] = useState('');
  const [newMedFreq, setNewMedFreq] = useState(language === 'hi' ? 'दिन में 2 बार' : 'Twice daily');
  const [newMedDuration, setNewMedDuration] = useState(language === 'hi' ? '3 दिन' : '3 Days');

  const [labTests, setLabTests] = useState<string[]>([
    language === 'hi' ? 'संपूर्ण रक्त जांच (CBC)' : 'Complete Blood Count (CBC)',
    language === 'hi' ? 'मलेरिया एंटीजन जांच' : 'Malaria Antigen Card Test'
  ]);
  const [advice, setAdvice] = useState(
    language === 'hi'
      ? 'उबला हुआ पानी पिएं, पर्याप्त विश्राम करें और सांस लेने में कठिनाई होने पर तुरंत PHC आएं।'
      : 'Drink boiled water, take adequate rest, and report immediately if shortness of breath develops.'
  );
  const [formError, setFormError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const matchedTriage =
    triageReports.find(
      (tr) =>
        tr.id === selectedAppointment?.triageReportId ||
        tr.patientName === selectedAppointment?.patientName
    ) || triageReports[0];

  const handleAddMedicine = () => {
    if (!newMedName.trim()) return;
    setMedicines((prev) => [
      ...prev,
      {
        id: `m-${Date.now()}`,
        name: newMedName.trim(),
        dosage: 'As prescribed',
        frequency: newMedFreq.trim() || 'Twice daily',
        frequencyHi: newMedFreq.trim() || 'दिन में 2 बार',
        duration: newMedDuration.trim() || '3 Days',
        instructions: 'After meals'
      }
    ]);
    setNewMedName('');
  };

  const handleRemoveMedicine = (index: number) => {
    setMedicines((prev) => prev.filter((_, i) => i !== index));
  };

  const handleIssuePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    const currentDiag = language === 'hi' ? diagnosisHi.trim() : diagnosis.trim();
    if (!currentDiag) {
      setFormError(
        language === 'hi'
          ? 'कृपया नैदानिक निदान दर्ज करें।'
          : 'Please enter a clinical diagnosis before issuing the prescription.'
      );
      return;
    }

    setFormError('');

    const newRx: Prescription = {
      id: `RX-UP-${Date.now().toString().slice(-6)}`,
      patientId: selectedAppointment.patientId || 'pat-001',
      patientName: selectedAppointment.patientName,
      patientAge: selectedAppointment.patientAge,
      patientGender: selectedAppointment.patientGender || 'Male',
      doctorId: doctor?.id || 'doc-001',
      doctorName: doctor?.name || 'Dr. Rajesh Kumar',
      doctorRegistrationNo: doctor?.registrationNo || doctor?.registrationNumber || 'MCI-UP-49201',
      facilityName: doctor?.facilityName || doctor?.hospitalName || 'Sitapur Primary Health Centre',
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }),
      diagnosis: diagnosis || currentDiag,
      diagnosisHi: diagnosisHi || currentDiag,
      medicines,
      labTests: labTests.filter(Boolean),
      labTestsRecommended: labTests.filter(Boolean),
      advice,
      adviceHi: advice,
      dietaryAdvice: advice,
      followUpDate: language === 'hi' ? '3 दिन बाद' : 'After 3 days'
    };

    if (isOffline) {
      addToQueue('prescription', newRx);
    }

    onPrescriptionCreated(newRx);
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
    }, 5000);
  };

  const getRiskBadge = (risk?: string) => {
    if (risk === 'Red') {
      return 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger-border)]';
    }
    if (risk === 'Yellow') {
      return 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]';
    }
    return 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success-border)]';
  };

  return (
    <div className="space-y-6 py-4">
      {/* Context & Role Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-default)] text-sm">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">
            {doctor?.name || 'Dr. Rajesh Kumar'}
          </span>
          <span aria-hidden="true" className="text-[var(--border-strong)]">·</span>
          <span className="text-xs">{doctor?.qualification || 'MBBS, MD (General Medicine)'}</span>
          <span aria-hidden="true" className="text-[var(--border-strong)]">·</span>
          <span className="font-mono text-xs tabular-nums">
            Reg: {doctor?.registrationNo || doctor?.registrationNumber || 'MCI-UP-49201'}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[var(--text-muted)]">{t('switchRole')}:</span>
          <div
            role="group"
            aria-label={t('switchRole')}
            className="inline-flex bg-[var(--bg-subtle)] p-0.5 rounded-md border border-[var(--border-default)]"
          >
            <button
              type="button"
              onClick={() => quickDemoLogin('patient')}
              aria-pressed="false"
              className="px-2.5 py-1 rounded text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {t('navPatientPortal')}
            </button>
            <button
              type="button"
              onClick={() => quickDemoLogin('doctor')}
              aria-pressed="true"
              className="px-2.5 py-1 rounded text-xs font-semibold bg-white text-[var(--brand-primary)] shadow-2xs cursor-pointer"
            >
              {t('navDoctorPortal')}
            </button>
          </div>
        </div>
      </div>

      {/* Header & Summary Metrics */}
      <div className="bg-white rounded-xl p-6 border border-[var(--border-default)] shadow-[var(--shadow-card)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div
            className="w-11 h-11 rounded-lg bg-[var(--brand-teal-tint)] text-[var(--brand-teal)] border border-[var(--brand-teal-border)] flex items-center justify-center shrink-0"
            aria-hidden="true"
          >
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
              {t('doctorDashboardTitle')}
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              {doctor?.facilityName || doctor?.hospitalName || 'Sitapur Primary Health Centre (PHC)'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 shrink-0 tabular-nums">
          <div className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-lg px-4 py-2.5">
            <div className="text-xs text-[var(--text-muted)]">{t('patientsToday')}</div>
            <div className="text-lg font-bold text-[var(--text-primary)] mt-0.5">18 / 30</div>
          </div>
          <div className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-lg px-4 py-2.5">
            <div className="text-xs text-[var(--text-muted)]">{t('inWaitingQueue')}</div>
            <div className="text-lg font-bold text-[var(--brand-primary)] mt-0.5">
              {appointments.length}
            </div>
          </div>
        </div>
      </div>

      {/* Main Split: OPD Queue + e-Prescription Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (4 cols): Active OPD Queue + Triage Summary */}
        <div className="lg:col-span-4 space-y-5">
          <section
            aria-labelledby="opd-queue-heading"
            className="bg-white rounded-xl p-5 border border-[var(--border-default)] shadow-[var(--shadow-card)] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--brand-primary)]" aria-hidden="true" />
                <h2 id="opd-queue-heading" className="text-sm font-semibold text-[var(--text-primary)]">
                  {t('liveOpdQueue')} ({appointments.length})
                </h2>
              </div>
            </div>

            <div className="space-y-2.5">
              {appointments.map((apt) => {
                const isSelected = selectedAppointment?.id === apt.id;
                const risk = apt.riskLevel || apt.triageRiskLevel || 'Yellow';

                return (
                  <button
                    key={apt.id}
                    type="button"
                    onClick={() => setSelectedAppointment(apt)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-colors cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-[var(--brand-primary-tint)] border-[var(--brand-primary)]'
                        : 'bg-[var(--bg-canvas)] border-[var(--border-default)] hover:border-[var(--border-strong)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-semibold text-[var(--brand-primary)] tabular-nums">
                        Token #{apt.tokenNumber}
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${getRiskBadge(
                          risk
                        )}`}
                      >
                        {risk} Risk
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {apt.patientName} · {apt.patientAge} yrs
                    </div>

                    <div className="text-xs text-[var(--text-secondary)] line-clamp-1">
                      {apt.chiefComplaint}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Pre-Consultation Triage Summary */}
          {matchedTriage && (
            <section
              aria-labelledby="triage-context-heading"
              className="bg-white rounded-xl p-5 border border-[var(--border-default)] shadow-[var(--shadow-card)] space-y-3"
            >
              <div className="flex items-center gap-2 pb-2.5 border-b border-[var(--border-default)]">
                <FileText className="w-4 h-4 text-[var(--brand-primary)]" aria-hidden="true" />
                <h2
                  id="triage-context-heading"
                  className="text-sm font-semibold text-[var(--text-primary)]"
                >
                  {language === 'hi' ? 'परामर्श पूर्व ट्राइएज सारांश' : 'Pre-Consultation Triage Summary'}
                </h2>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="font-semibold text-[var(--text-muted)] mb-0.5">
                    {t('patientSpoke')}
                  </div>
                  <p className="text-[var(--text-primary)] leading-relaxed">
                    "{matchedTriage.rawInput}"
                  </p>
                </div>
                <div className="pt-2.5 border-t border-[var(--border-default)]">
                  <div className="font-semibold text-[var(--brand-primary)] mb-0.5">
                    {language === 'hi' ? 'नैदानिक सारांश' : 'Clinical Summary'}
                  </div>
                  <p className="text-[var(--text-primary)] leading-relaxed">
                    {matchedTriage.translatedInputEn}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Right Column (8 cols): Electronic Prescription Form */}
        <section
          aria-labelledby="rx-desk-heading"
          className="lg:col-span-8 bg-white rounded-xl p-6 border border-[var(--border-default)] shadow-[var(--shadow-card)] space-y-6"
        >
          <div className="pb-4 border-b border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[var(--brand-teal)]">
                {t('doctorRxTitle')}
              </p>
              <h2 id="rx-desk-heading" className="text-lg font-bold text-[var(--text-primary)] mt-0.5">
                {selectedAppointment?.patientName || 'Rameshwar Lal Sharma'}
              </h2>
              <p className="text-xs text-[var(--text-muted)] tabular-nums mt-0.5">
                {language === 'hi'
                  ? `आयु: ${selectedAppointment?.patientAge || 58} वर्ष · टोकन #${selectedAppointment?.tokenNumber || 14}`
                  : `Age: ${selectedAppointment?.patientAge || 58} yrs · Token #${selectedAppointment?.tokenNumber || 14}`}
              </p>
            </div>

            {isSuccess && (
              <div
                role="status"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[var(--status-success-bg)] text-[var(--status-success)] border border-[var(--status-success-border)]"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{t('prescriptionSavedSuccess')}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleIssuePrescription} className="space-y-5" noValidate>
            {formError && (
              <div
                role="alert"
                className="p-3 rounded-md text-xs font-medium bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger-border)]"
              >
                {formError}
              </div>
            )}

            {/* Clinical Diagnosis */}
            <div className="space-y-1.5">
              <label
                htmlFor="rx-diagnosis-input"
                className="block text-xs font-semibold text-[var(--text-primary)]"
              >
                {t('clinicalDiagnosis')}
              </label>
              <input
                id="rx-diagnosis-input"
                type="text"
                value={language === 'hi' ? diagnosisHi : diagnosis}
                onChange={(e) => {
                  if (language === 'hi') setDiagnosisHi(e.target.value);
                  else setDiagnosis(e.target.value);
                }}
                className="w-full px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-sm font-medium text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)] transition-colors"
                required
              />
            </div>

            {/* Prescribed Medicines */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-[var(--text-primary)]">
                {t('rxMedicines')}
              </div>

              <ul className="divide-y divide-[var(--border-default)] border border-[var(--border-default)] rounded-lg overflow-hidden">
                {medicines.map((med, idx) => (
                  <li
                    key={med.id || idx}
                    className="px-4 py-3 bg-white flex items-center justify-between gap-3 text-sm"
                  >
                    <div>
                      <div className="font-medium text-[var(--text-primary)]">{med.name}</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5 tabular-nums">
                        {language === 'hi' ? med.frequencyHi || med.frequency : med.frequency} ·{' '}
                        {med.duration}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(idx)}
                      aria-label={`Remove ${med.name}`}
                      className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>

              {/* Inline Add Medication Row */}
              <div className="p-3.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)] grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-5">
                  <label htmlFor="add-med-name" className="sr-only">
                    {t('medicineName')}
                  </label>
                  <input
                    id="add-med-name"
                    type="text"
                    placeholder={
                      language === 'hi'
                        ? 'दवा का नाम (उदा. Tab. Paracetamol 500mg)'
                        : 'Medication name (e.g. Tab. Paracetamol 500mg)'
                    }
                    value={newMedName}
                    onChange={(e) => setNewMedName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[var(--border-strong)] rounded-md text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label htmlFor="add-med-freq" className="sr-only">
                    {t('frequency')}
                  </label>
                  <input
                    id="add-med-freq"
                    type="text"
                    placeholder={t('frequency')}
                    value={newMedFreq}
                    onChange={(e) => setNewMedFreq(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[var(--border-strong)] rounded-md text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="add-med-duration" className="sr-only">
                    {t('durationDays')}
                  </label>
                  <input
                    id="add-med-duration"
                    type="text"
                    placeholder={t('durationDays')}
                    value={newMedDuration}
                    onChange={(e) => setNewMedDuration(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[var(--border-strong)] rounded-md text-xs text-[var(--text-primary)]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-md text-xs font-semibold text-[var(--brand-primary)] bg-white border border-[var(--brand-primary)] hover:bg-[var(--brand-primary-tint)] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{language === 'hi' ? 'जोड़ें' : 'Add'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Investigations & Advisory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="rx-labs-input"
                  className="block text-xs font-semibold text-[var(--text-primary)]"
                >
                  {t('testsToOrder')}
                </label>
                <input
                  id="rx-labs-input"
                  type="text"
                  value={labTests.join(', ')}
                  onChange={(e) => setLabTests(e.target.value.split(',').map((s) => s.trim()))}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-xs text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)]"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="rx-advice-input"
                  className="block text-xs font-semibold text-[var(--text-primary)]"
                >
                  {t('specialInstructions')}
                </label>
                <input
                  id="rx-advice-input"
                  type="text"
                  value={advice}
                  onChange={(e) => setAdvice(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-xs text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)]"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
                <span>{t('saveAndSignRx')}</span>
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
