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
  Volume2,
  Square,
  ClipboardList
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

  const [activeTab, setActiveTab] = useState<'PRESCRIPTIONS' | 'VACCINES' | 'AI_TRIAGE' | 'ABHA_CARD'>(
    'PRESCRIPTIONS'
  );
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(
    prescriptions[0] || null
  );
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

    const medText = selectedPrescription.medicines
      .map(
        (m) =>
          `${m.name}, ${language === 'hi' ? m.frequencyHi || m.frequency : m.frequency}, ${m.duration}`
      )
      .join('. ');
    const rxAdvice =
      language === 'hi'
        ? selectedPrescription.adviceHi || selectedPrescription.dietaryAdviceHi || selectedPrescription.advice || ''
        : selectedPrescription.advice || selectedPrescription.dietaryAdvice || '';
    const textToSpeak =
      language === 'hi'
        ? `${selectedPrescription.doctorName} द्वारा जारी पर्ची। निदान: ${
            selectedPrescription.diagnosisHi || selectedPrescription.diagnosis
          }। दवाइयां: ${medText}। सलाह: ${rxAdvice}`
        : `Prescription by ${selectedPrescription.doctorName}. Diagnosis: ${selectedPrescription.diagnosis}. Medications: ${medText}. Advice: ${rxAdvice}`;

    setIsSpeakingRx(true);
    SpeechService.speak(
      textToSpeak,
      language,
      () => setIsSpeakingRx(true),
      () => setIsSpeakingRx(false),
      () => setIsSpeakingRx(false)
    );
  };

  const getRiskBadge = (level: AITriageReport['riskLevel']) => {
    if (level === 'Red') {
      return 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger-border)]';
    }
    if (level === 'Yellow') {
      return 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]';
    }
    return 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success-border)]';
  };

  const rxLabTests = selectedPrescription
    ? language === 'hi' && selectedPrescription.labTestsRecommendedHi?.length
      ? selectedPrescription.labTestsRecommendedHi
      : selectedPrescription.labTests?.length
        ? selectedPrescription.labTests
        : selectedPrescription.labTestsRecommended || []
    : [];

  const rxAdviceText = selectedPrescription
    ? language === 'hi'
      ? selectedPrescription.adviceHi ||
        selectedPrescription.dietaryAdviceHi ||
        selectedPrescription.advice ||
        selectedPrescription.dietaryAdvice ||
        ''
      : selectedPrescription.advice || selectedPrescription.dietaryAdvice || ''
    : '';

  return (
    <div className="space-y-6 py-4">
      {/* Page Header */}
      <div className="bg-white rounded-xl p-6 border border-[var(--border-default)] shadow-[var(--shadow-card)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-[var(--brand-teal)]">
            Ayushman Bharat Digital Mission (ABDM)
          </p>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            {t('healthRecordsTitle')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)] font-mono tabular-nums">
            {t('abhaNumber')}: <strong className="text-[var(--text-primary)]">{patient?.abhaId}</strong>
            {patient?.abhaAddress && (
              <>
                <span aria-hidden="true"> · </span>
                <span className="font-sans text-[var(--text-muted)]">{patient.abhaAddress}</span>
              </>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer self-start md:self-center shrink-0"
        >
          <Printer className="w-4 h-4" aria-hidden="true" />
          <span>{t('printRecord')}</span>
        </button>
      </div>

      {/* Segmented Section Tabs */}
      <div
        role="tablist"
        aria-label="Health record categories"
        className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-lg border border-[var(--border-default)] overflow-x-auto max-w-full scrollbar-none"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'PRESCRIPTIONS'}
          onClick={() => setActiveTab('PRESCRIPTIONS')}
          className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'PRESCRIPTIONS'
              ? 'bg-white text-[var(--brand-primary)] font-semibold shadow-2xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <FileText className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>
            {t('myPrescriptions')} ({prescriptions.length})
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'VACCINES'}
          onClick={() => setActiveTab('VACCINES')}
          className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'VACCINES'
              ? 'bg-white text-[var(--brand-primary)] font-semibold shadow-2xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Syringe className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>
            {t('vaccineSchedule')} ({vaccinations.length})
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'AI_TRIAGE'}
          onClick={() => setActiveTab('AI_TRIAGE')}
          className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'AI_TRIAGE'
              ? 'bg-white text-[var(--brand-primary)] font-semibold shadow-2xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <ClipboardList className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>
            {t('aiTriageReports')} ({triageHistory.length})
          </span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ABHA_CARD'}
          onClick={() => setActiveTab('ABHA_CARD')}
          className={`px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium inline-flex items-center gap-2 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
            activeTab === 'ABHA_CARD'
              ? 'bg-white text-[var(--brand-primary)] font-semibold shadow-2xs'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <QrCode className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{t('abhaCard')}</span>
        </button>
      </div>

      {/* Tab 1: Prescriptions */}
      {activeTab === 'PRESCRIPTIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-4 space-y-2.5">
            {prescriptions.map((rx) => {
              const isSelected = selectedPrescription?.id === rx.id;
              return (
                <button
                  key={rx.id}
                  type="button"
                  onClick={() => setSelectedPrescription(rx)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-[var(--brand-primary-tint)] border-[var(--brand-primary)]'
                      : 'bg-white border-[var(--border-default)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] tabular-nums">
                    <span>{rx.date}</span>
                    <span className="font-mono font-medium text-[var(--brand-primary)]">{rx.id}</span>
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {language === 'hi' && rx.diagnosisHi ? rx.diagnosisHi : rx.diagnosis}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">{rx.doctorName}</div>
                </button>
              );
            })}
          </div>

          {selectedPrescription && (
            <article className="lg:col-span-8 bg-white rounded-xl p-6 sm:p-8 border border-[var(--border-default)] shadow-[var(--shadow-card)] space-y-6">
              <div className="pb-4 border-b border-[var(--border-default)] flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="text-xs font-semibold text-[var(--brand-teal)]">
                    Department of Medical Health & Family Welfare
                  </div>
                  <h2 className="text-lg font-bold text-[var(--text-primary)]">
                    {selectedPrescription.facilityName}
                  </h2>
                  <p className="text-xs text-[var(--text-secondary)]">
                    {selectedPrescription.doctorName}
                    {selectedPrescription.doctorRegistrationNo &&
                      ` · Reg. ${selectedPrescription.doctorRegistrationNo}`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={toggleSpeakPrescription}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-canvas)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                  >
                    {isSpeakingRx ? (
                      <>
                        <Square className="w-3.5 h-3.5 text-[var(--status-danger)]" aria-hidden="true" />
                        <span>{language === 'hi' ? 'रोकें' : 'Stop'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-[var(--brand-primary)]" aria-hidden="true" />
                        <span>{t('voiceOutputPlay')}</span>
                      </>
                    )}
                  </button>

                  <div className="text-xs text-right tabular-nums">
                    <div className="font-mono font-semibold text-[var(--text-primary)]">
                      {selectedPrescription.date}
                    </div>
                    <div className="text-[var(--text-muted)]">Rx: {selectedPrescription.id}</div>
                  </div>
                </div>
              </div>

              {/* Patient Metadata Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)] text-xs">
                <div>
                  <div className="text-[var(--text-muted)]">{t('patientName')}</div>
                  <div className="font-semibold text-[var(--text-primary)] mt-0.5">
                    {selectedPrescription.patientName}
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)]">{t('ageGender')}</div>
                  <div className="font-medium text-[var(--text-primary)] tabular-nums mt-0.5">
                    {selectedPrescription.patientAge} yrs / {selectedPrescription.patientGender}
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)]">{t('abhaNumber')}</div>
                  <div className="font-mono font-semibold text-[var(--brand-primary)] tabular-nums mt-0.5">
                    {patient?.abhaId}
                  </div>
                </div>
                <div>
                  <div className="text-[var(--text-muted)]">Follow-up</div>
                  <div className="font-medium text-[var(--text-primary)] mt-0.5">
                    {selectedPrescription.followUpDate || 'As advised'}
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="space-y-1">
                <h3 className="text-xs font-semibold text-[var(--text-muted)]">{t('rxDiagnosis')}</h3>
                <div className="p-3.5 rounded-lg bg-[var(--brand-primary-tint)] border border-[var(--brand-primary-border)] text-sm font-semibold text-[var(--brand-primary)]">
                  {language === 'hi' && selectedPrescription.diagnosisHi
                    ? selectedPrescription.diagnosisHi
                    : selectedPrescription.diagnosis}
                </div>
              </div>

              {/* Medications */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold text-[var(--text-muted)]">{t('rxMedicines')}</h3>
                <div className="border border-[var(--border-default)] rounded-lg overflow-hidden divide-y divide-[var(--border-default)]">
                  {selectedPrescription.medicines.map((med, idx) => (
                    <div
                      key={med.id || idx}
                      className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
                    >
                      <div>
                        <div className="font-semibold text-[var(--text-primary)]">
                          {idx + 1}. {med.name}
                        </div>
                        <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                          {language === 'hi' ? med.frequencyHi || med.frequency : med.frequency}
                        </div>
                        {(med.instructions || med.instructionsHi) && (
                          <div className="text-xs text-[var(--text-muted)] mt-0.5">
                            {language === 'hi'
                              ? med.instructionsHi || med.instructions
                              : med.instructions}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-[var(--text-primary)] tabular-nums bg-[var(--bg-canvas)] px-2.5 py-1 rounded border border-[var(--border-default)] self-start sm:self-center">
                        {med.duration}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Tests & Advice */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {rxLabTests.length > 0 && (
                  <div className="p-4 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)] space-y-1.5">
                    <h3 className="text-xs font-semibold text-[var(--text-muted)]">{t('rxLabTests')}</h3>
                    <ul className="list-disc list-inside text-xs text-[var(--text-primary)] space-y-1">
                      {rxLabTests.map((tst, i) => (
                        <li key={i}>{tst}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {rxAdviceText && (
                  <div className="p-4 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)] space-y-1.5">
                    <h3 className="text-xs font-semibold text-[var(--text-muted)]">{t('rxAdvice')}</h3>
                    <p className="text-xs text-[var(--text-primary)] leading-relaxed">{rxAdviceText}</p>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[var(--border-default)] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                <span>Digitally verified outpatient record under ABDM guidelines.</span>
                <span className="font-semibold text-[var(--text-primary)]">
                  {selectedPrescription.doctorName}
                </span>
              </div>
            </article>
          )}
        </div>
      )}

      {/* Tab 2: Immunizations */}
      {activeTab === 'VACCINES' && (
        <section className="bg-white rounded-xl p-6 border border-[var(--border-default)] shadow-[var(--shadow-card)] space-y-4">
          <div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {t('vaccineSchedule')}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              Universal Immunization Programme (UIP) records
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border-default)] text-xs text-[var(--text-muted)]">
                  <th className="py-3 pr-4 font-semibold">Vaccine</th>
                  <th className="py-3 px-4 font-semibold">Dose</th>
                  <th className="py-3 px-4 font-semibold">Facility</th>
                  <th className="py-3 px-4 font-semibold">Date</th>
                  <th className="py-3 pl-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)] tabular-nums">
                {vaccinations.map((vac) => (
                  <tr key={vac.id}>
                    <td className="py-3.5 pr-4 font-medium text-[var(--text-primary)]">
                      {language === 'hi' && vac.vaccineNameHi ? vac.vaccineNameHi : vac.vaccineName}
                    </td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{vac.dose}</td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">{vac.facilityName}</td>
                    <td className="py-3.5 px-4 text-[var(--text-secondary)]">
                      {vac.administeredDate || vac.dueDate || vac.dateAdministered}
                    </td>
                    <td className="py-3.5 pl-4 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded text-xs font-semibold ${
                          vac.status === 'COMPLETED'
                            ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]'
                            : 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]'
                        }`}
                      >
                        {vac.status === 'COMPLETED' ? t('vaccineGiven') : t('vaccineDue')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Tab 3: Triage History */}
      {activeTab === 'AI_TRIAGE' && (
        <div className="space-y-4">
          {triageHistory.map((tr) => (
            <article
              key={tr.id}
              className="bg-white rounded-xl p-6 border border-[var(--border-default)] shadow-[var(--shadow-card)] space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-default)]">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">
                    {language === 'hi' ? tr.chiefComplaintHi : tr.chiefComplaint}
                  </h2>
                  <p className="text-xs text-[var(--text-muted)] font-mono tabular-nums mt-0.5">
                    {tr.id} · {tr.createdAt} · {language === 'hi' ? tr.recommendedDepartmentHi : tr.recommendedDepartment}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${getRiskBadge(
                    tr.riskLevel
                  )}`}
                >
                  {tr.riskLevel === 'Red'
                    ? t('riskRed')
                    : tr.riskLevel === 'Yellow'
                      ? t('riskYellow')
                      : t('riskGreen')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)]">
                  <div className="text-xs font-semibold text-[var(--text-muted)] mb-1">
                    {t('patientSpoke')}
                  </div>
                  <p className="text-[var(--text-primary)]">"{tr.rawInput}"</p>
                </div>
                <div className="p-3.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)]">
                  <div className="text-xs font-semibold text-[var(--brand-primary)] mb-1">
                    {language === 'hi' ? 'नैदानिक सारांश' : 'Clinical Summary'}
                  </div>
                  <p className="text-[var(--text-primary)]">{tr.translatedInputEn}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Tab 4: ABHA Digital Health Card */}
      {activeTab === 'ABHA_CARD' && (
        <div className="max-w-lg mx-auto bg-white rounded-xl p-6 sm:p-8 border border-[var(--brand-primary)] shadow-[var(--shadow-card)] space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-default)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[var(--brand-primary)] text-white font-semibold text-xs flex items-center justify-center">
                ABDM
              </div>
              <div>
                <div className="text-xs text-[var(--text-muted)]">National Health Authority</div>
                <div className="text-sm font-bold text-[var(--text-primary)]">
                  Ayushman Bharat Health Account (ABHA)
                </div>
              </div>
            </div>
            <ShieldCheck className="w-5 h-5 text-[var(--brand-teal)]" aria-hidden="true" />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-xs text-[var(--text-muted)]">{t('patientName')}</dt>
                <dd className="text-base font-bold text-[var(--text-primary)]">{patient?.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--text-muted)]">{t('abhaNumber')}</dt>
                <dd className="text-base font-mono font-semibold text-[var(--brand-primary)] tabular-nums">
                  {patient?.abhaId}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--text-muted)]">{t('address')}</dt>
                <dd className="text-xs text-[var(--text-secondary)]">
                  {patient?.village}, {patient?.district}, {patient?.state}
                </dd>
              </div>
            </dl>

            <div className="p-3 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)] flex flex-col items-center justify-center shrink-0 self-start sm:self-center">
              <QrCode className="w-20 h-20 text-[var(--brand-primary)]" aria-hidden="true" />
              <span className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
                ABHA VERIFIED
              </span>
            </div>
          </div>

          <p className="pt-4 border-t border-[var(--border-default)] text-xs text-[var(--text-muted)] text-center">
            Valid across participating Government Hospitals, CHCs, and Primary Health Centres across India.
          </p>
        </div>
      )}
    </div>
  );
};
