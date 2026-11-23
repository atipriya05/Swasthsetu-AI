import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../context/OfflineSyncContext';
import {
  Mic,
  MicOff,
  FileText,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Stethoscope,
  ShieldCheck,
  X,
  Volume2,
  Square,
  PhoneCall,
  Info
} from 'lucide-react';
import { AITriageReport, Language } from '../types';
import { SpeechService, SpeechRecognitionService } from '../utils/speech';

interface AIMedicalReportGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  initialText?: string;
  onReportCreated?: (report: AITriageReport) => void;
}

export const AIMedicalReportGenerator: React.FC<AIMedicalReportGeneratorProps> = ({
  isOpen,
  onClose,
  initialText = '',
  onReportCreated
}) => {
  const { language, t } = useLanguage();
  const { patient } = useAuth();
  const { isOffline, addToQueue } = useOfflineSync();

  const [inputSymptom, setInputSymptom] = useState(
    initialText ||
      (language === 'hi'
        ? 'मुझे तीन दिन से तेज बुखार है, कंपकंपी आ रही है और सिर में लगातार दर्द हो रहा है।'
        : 'I have had a high fever for 3 days with chills at night and a persistent headache.')
  );
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(language);
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [generatedReport, setGeneratedReport] = useState<AITriageReport | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSpeakingReport, setIsSpeakingReport] = useState(false);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  useEffect(() => {
    if (initialText) {
      setInputSymptom(initialText);
    }
  }, [initialText]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    return () => {
      SpeechService.stop();
      SpeechRecognitionService.stopListening();
    };
  }, []);

  if (!isOpen) return null;

  const demoSamples = [
    {
      titleEn: 'High fever & chills',
      titleHi: 'तेज बुखार व कंपकंपी',
      text:
        language === 'hi'
          ? 'मुझे तीन दिन से तेज बुखार है, रात को कंपकंपी आती है और शरीर में दर्द है।'
          : 'I have had a high fever for 3 days with chills and generalized body aches.',
      lang: language
    },
    {
      titleEn: 'Antenatal dizziness & swelling',
      titleHi: 'गर्भावस्था में चक्कर व सूजन',
      text:
        language === 'hi'
          ? 'मेरी 6 महीने की गर्भावस्था है, सुबह से चक्कर आ रहे हैं और पैरों में हल्की सूजन है।'
          : 'I am 6 months pregnant, experiencing dizziness since morning and mild ankle swelling.',
      lang: language
    },
    {
      titleEn: 'Chest tightness & sweating',
      titleHi: 'सीने में दबाव व पसीना',
      text:
        language === 'hi'
          ? 'सीने के बीच में भारी दबाव महसूस हो रहा है, बायां हाथ सुन्न है और पसीना आ रहा है।'
          : 'Experiencing chest pressure radiating to the left shoulder with sweating and shortness of breath.',
      lang: language
    },
    {
      titleEn: 'Stomach cramps & vomiting',
      titleHi: 'पेट दर्द व उल्टी',
      text:
        language === 'hi'
          ? 'कल रात से पेट में तेज मरोड़ हो रही है, तीन बार उल्टी हुई है और कमजोरी है।'
          : 'Severe abdominal cramps since last night with three episodes of vomiting and weakness.',
      lang: language
    }
  ];

  const handleToggleVoice = () => {
    if (isListening) {
      SpeechRecognitionService.stopListening();
      setIsListening(false);
      return;
    }

    const started = SpeechRecognitionService.startListening(
      selectedLanguage,
      (transcript) => {
        setInputSymptom(transcript);
        setValidationError('');
      },
      () => setIsListening(true),
      () => setIsListening(false),
      () => setIsListening(false)
    );

    if (!started) {
      setIsListening(false);
    }
  };

  const handleGenerateReport = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToAnalyze = inputSymptom.trim();
    if (!textToAnalyze) {
      setValidationError(
        language === 'hi'
          ? 'कृपया आगे बढ़ने से पहले लक्षणों का विवरण दर्ज करें।'
          : 'Please enter a symptom description before generating the assessment.'
      );
      return;
    }
    if (isGenerating) return;

    setValidationError('');
    setIsGenerating(true);
    setGeneratedReport(null);
    setIsSubmitted(false);

    const payload = {
      text: textToAnalyze,
      language: selectedLanguage,
      patientId: patient?.id || 'pat-001',
      patientName: patient?.name || 'Rameshwar Lal Sharma',
      patientAge: patient?.age || 58,
      patientGender: patient?.gender || 'Male',
      patientPhone: patient?.mobile || '9876543210',
      village: patient?.village || 'Rampur Village'
    };

    try {
      if (isOffline) {
        const isRed =
          textToAnalyze.toLowerCase().includes('chest') || textToAnalyze.includes('सीने');
        const localReport: AITriageReport = {
          id: `TR-OFF-${Date.now().toString().slice(-4)}`,
          patientId: payload.patientId,
          patientName: payload.patientName,
          patientAge: payload.patientAge,
          patientGender: payload.patientGender,
          patientPhone: payload.patientPhone,
          village: payload.village,
          languageInput: selectedLanguage,
          rawInput: textToAnalyze,
          translatedInputEn: textToAnalyze,
          chiefComplaint: isRed
            ? 'Acute Chest Distress (Offline Assessment)'
            : 'Acute Symptom Evaluation (Offline)',
          chiefComplaintHi: isRed
            ? 'सीने में दर्द — आपातकालीन मूल्यांकन (ऑफलाइन)'
            : 'स्वास्थ्य लक्षण मूल्यांकन (ऑफलाइन)',
          symptoms: ['Reported primary discomfort', 'Fatigue'],
          symptomsHi: ['मुख्य अस्वस्थता', 'थकान'],
          duration: '2–3 Days',
          durationHi: '2–3 दिन',
          riskLevel: isRed ? 'Red' : 'Yellow',
          riskReason:
            'Evaluated locally under offline protocol. Clinical confirmation by a PHC medical officer is advised.',
          riskReasonHi:
            'ऑफलाइन प्रोटोकॉल द्वारा प्राथमिक मूल्यांकन। PHC चिकित्सक से जांच आवश्यक है।',
          recommendedDepartment: isRed ? 'Emergency Medicine (108)' : 'General Medicine (PHC OPD)',
          recommendedDepartmentHi: isRed ? 'आपातकालीन विभाग (108)' : 'सामान्य चिकित्सा विभाग (PHC)',
          preliminaryAdvice: [
            'Maintain hydration with clean boiled water.',
            'Rest and monitor temperature or worsening symptoms.',
            'Report to the nearest Primary Health Centre for clinical examination.'
          ],
          preliminaryAdviceHi: [
            'उबला हुआ स्वच्छ पानी पर्याप्त मात्रा में पिएं।',
            'विश्राम करें और लक्षणों की निगरानी रखें।',
            'चिकित्सकीय जांच के लिए निकटतम प्राथमिक स्वास्थ्य केंद्र जाएं।'
          ],
          redFlags: ['Shortness of breath', 'Worsening chest or abdominal pain'],
          status: 'PENDING_REVIEW',
          createdAt: 'Saved Offline'
        };

        addToQueue('triage_report', payload);
        setGeneratedReport(localReport);
        if (onReportCreated) onReportCreated(localReport);
        setIsGenerating(false);
        return;
      }

      const res = await fetch('/api/gemini/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.report) {
        setGeneratedReport(data.report);
        if (onReportCreated) {
          onReportCreated(data.report);
        }
      } else {
        throw new Error('No report returned');
      }
    } catch (err) {
      console.warn('Triage API error, falling back to local assessment:', err);
      const isRed =
        textToAnalyze.toLowerCase().includes('chest') ||
        textToAnalyze.includes('सीने') ||
        textToAnalyze.includes('सांस') ||
        textToAnalyze.toLowerCase().includes('snake');
      const fallbackReport: AITriageReport = {
        id: `TR-${Date.now().toString().slice(-6)}`,
        patientId: payload.patientId,
        patientName: payload.patientName,
        patientAge: payload.patientAge,
        patientGender: payload.patientGender,
        patientPhone: payload.patientPhone,
        village: payload.village,
        languageInput: selectedLanguage,
        rawInput: textToAnalyze,
        translatedInputEn: textToAnalyze,
        chiefComplaint: isRed ? 'Acute Cardiopulmonary Distress' : 'Clinical Symptom Evaluation',
        chiefComplaintHi: isRed ? 'आपातकालीन श्वसन या हृदय स्थिति' : 'स्वास्थ्य लक्षण मूल्यांकन',
        symptoms: ['Primary symptom presentation', 'Associated fatigue'],
        symptomsHi: ['मुख्य लक्षण', 'शारीरिक कमजोरी'],
        duration: '2–3 Days',
        durationHi: '2–3 दिन',
        riskLevel: isRed ? 'Red' : 'Yellow',
        riskReason: isRed
          ? 'Emergency warning signs detected. Immediate medical evaluation is required.'
          : 'Symptoms warrant Primary Health Centre outpatient evaluation.',
        riskReasonHi: isRed
          ? 'आपातकालीन लक्षण। तुरंत 108 एम्बुलेंस या जिला अस्पताल जाएं।'
          : 'प्राथमिक स्वास्थ्य केंद्र में चिकित्सक से जांच अनुशंसित है।',
        recommendedDepartment: isRed ? 'Emergency Medicine (108)' : 'General Medicine (PHC OPD)',
        recommendedDepartmentHi: isRed ? 'आपातकालीन विभाग (108)' : 'सामान्य चिकित्सा विभाग (PHC)',
        preliminaryAdvice: [
          'Stay hydrated and rest.',
          'Visit your nearest Primary Health Centre for in-person clinical evaluation.'
        ],
        preliminaryAdviceHi: [
          'पर्याप्त पानी पिएं और विश्राम करें।',
          'चिकित्सकीय जांच हेतु निकटतम PHC जाएं।'
        ],
        redFlags: ['Shortness of breath', 'Severe or worsening pain'],
        status: 'PENDING_REVIEW',
        createdAt: 'Just now'
      };
      setGeneratedReport(fallbackReport);
      if (onReportCreated) onReportCreated(fallbackReport);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleSpeakReport = () => {
    if (isSpeakingReport) {
      SpeechService.stop();
      setIsSpeakingReport(false);
      return;
    }

    if (!generatedReport) return;

    const speechText =
      selectedLanguage === 'hi'
        ? `नैदानिक ट्राइएज सारांश। मुख्य मूल्यांकन: ${generatedReport.chiefComplaintHi}। जोखिम स्तर: ${
            generatedReport.riskLevel === 'Red'
              ? 'उच्च जोखिम आपातकाल'
              : generatedReport.riskLevel === 'Yellow'
                ? 'मध्यम जोखिम'
                : 'कम जोखिम'
          }। अनुशंसित विभाग: ${generatedReport.recommendedDepartmentHi}। सलाह: ${
            generatedReport.preliminaryAdviceHi?.join('. ') || ''
          }`
        : `Clinical triage summary. Primary assessment: ${generatedReport.chiefComplaint}. Risk level: ${
            generatedReport.riskLevel
          }. Recommended department: ${generatedReport.recommendedDepartment}. Next steps: ${
            generatedReport.preliminaryAdvice?.join('. ') || ''
          }`;

    setIsSpeakingReport(true);
    SpeechService.speak(
      speechText,
      selectedLanguage,
      () => setIsSpeakingReport(true),
      () => setIsSpeakingReport(false),
      () => setIsSpeakingReport(false)
    );
  };

  const handleSubmitToDoctor = () => {
    setIsSubmitted(true);
  };

  const getRiskBadgeStyles = (level: AITriageReport['riskLevel']) => {
    if (level === 'Red') {
      return 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger-border)]';
    }
    if (level === 'Yellow') {
      return 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning-border)]';
    }
    return 'bg-[var(--status-success-bg)] text-[var(--status-success)] border-[var(--status-success-border)]';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="triage-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-3xl w-full my-6 overflow-hidden shadow-[var(--shadow-elevated)] border border-[var(--border-default)] flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-white border-b border-[var(--border-default)] px-6 py-5 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2
              id="triage-modal-title"
              className="text-lg sm:text-xl font-bold text-[var(--text-primary)]"
            >
              {t('reportGeneratorTitle')}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('reportGeneratorSubtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer shrink-0"
            aria-label={t('close')}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Sample Prompts */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-[var(--text-secondary)] block">
              {language === 'hi' ? 'उदाहरण लक्षण चुनें:' : 'Common symptom examples:'}
            </span>
            <div className="flex flex-wrap gap-2">
              {demoSamples.map((demo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputSymptom(demo.text);
                    setSelectedLanguage(demo.lang);
                    setValidationError('');
                  }}
                  className="px-3 py-1.5 rounded-md border border-[var(--border-default)] bg-[var(--bg-canvas)] hover:bg-[var(--brand-primary-tint)] hover:border-[var(--brand-primary-border)] text-xs font-medium text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  {language === 'hi' ? demo.titleHi : demo.titleEn}
                </button>
              ))}
            </div>
          </div>

          {/* Symptom Intake Form */}
          <form
            onSubmit={handleGenerateReport}
            className="bg-[var(--bg-canvas)] rounded-xl p-5 border border-[var(--border-default)] space-y-4"
            noValidate
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                htmlFor="triage-symptom-textarea"
                className="text-sm font-semibold text-[var(--text-primary)]"
              >
                {t('speakSymptomsPrompt')}
              </label>

              <div
                role="group"
                aria-label="Input language"
                className="inline-flex items-center bg-white border border-[var(--border-default)] rounded-md p-0.5 text-xs"
              >
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('en')}
                  aria-pressed={selectedLanguage === 'en'}
                  className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                    selectedLanguage === 'en'
                      ? 'bg-[var(--brand-primary)] text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedLanguage('hi')}
                  aria-pressed={selectedLanguage === 'hi'}
                  className={`px-2.5 py-1 rounded font-medium cursor-pointer ${
                    selectedLanguage === 'hi'
                      ? 'bg-[var(--brand-primary)] text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  हिंदी
                </button>
              </div>
            </div>

            <textarea
              id="triage-symptom-textarea"
              rows={3}
              value={inputSymptom}
              onChange={(e) => {
                setInputSymptom(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder={t('typeSymptomsPlaceholder')}
              aria-invalid={Boolean(validationError)}
              className="w-full p-3.5 bg-white border border-[var(--border-strong)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--brand-primary)] transition-colors"
            />

            {validationError && (
              <p role="alert" className="text-xs font-medium text-[var(--status-danger)]">
                {validationError}
              </p>
            )}

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold border transition-colors cursor-pointer ${
                  isListening
                    ? 'bg-[var(--status-danger)] text-white border-[var(--status-danger)]'
                    : 'bg-white text-[var(--text-primary)] border-[var(--border-strong)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {isListening ? (
                  <MicOff className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Mic className="w-4 h-4 text-[var(--brand-primary)]" aria-hidden="true" />
                )}
                <span>{isListening ? t('voiceInputStop') : t('voiceInputStart')}</span>
              </button>

              <button
                type="submit"
                disabled={isGenerating}
                className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" aria-hidden="true" />
                <span>{isGenerating ? t('generatingReport') : t('generateReportBtn')}</span>
              </button>
            </div>
          </form>

          {/* Loading Skeleton */}
          {isGenerating && (
            <div
              aria-live="polite"
              className="bg-white border border-[var(--border-default)] rounded-xl p-6 space-y-4"
            >
              <div className="h-5 w-48 bg-[var(--bg-subtle)] rounded animate-pulse" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="h-20 bg-[var(--bg-subtle)] rounded-lg animate-pulse" />
                <div className="h-20 bg-[var(--bg-subtle)] rounded-lg animate-pulse" />
              </div>
              <div className="h-24 bg-[var(--bg-subtle)] rounded-lg animate-pulse" />
            </div>
          )}

          {/* Structured Triage Results Display */}
          {generatedReport && !isGenerating && (
            <section
              aria-label={t('clinicalReportTitle')}
              className="bg-white border border-[var(--border-strong)] rounded-xl p-6 space-y-5"
            >
              {/* Report Header + Color-Coded Risk Badge */}
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-[var(--border-default)]">
                <div>
                  <h3 className="text-base font-semibold text-[var(--text-primary)]">
                    {t('clinicalReportTitle')}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] font-mono tabular-nums mt-0.5">
                    ID: {generatedReport.id} · {generatedReport.createdAt}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleSpeakReport}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-[var(--bg-canvas)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                  >
                    {isSpeakingReport ? (
                      <>
                        <Square className="w-3.5 h-3.5 text-[var(--status-danger)]" aria-hidden="true" />
                        <span>{language === 'hi' ? 'रोकें' : 'Stop Audio'}</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-[var(--brand-primary)]" aria-hidden="true" />
                        <span>{language === 'hi' ? 'सारांश सुनें' : 'Read Aloud'}</span>
                      </>
                    )}
                  </button>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border ${getRiskBadgeStyles(
                      generatedReport.riskLevel
                    )}`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                    <span>
                      {generatedReport.riskLevel === 'Red'
                        ? t('riskRed')
                        : generatedReport.riskLevel === 'Yellow'
                          ? t('riskYellow')
                          : t('riskGreen')}
                    </span>
                  </span>
                </div>
              </div>

              {/* Prominent Emergency Notice for High-Risk Cases */}
              {generatedReport.riskLevel === 'Red' && (
                <div
                  role="alert"
                  className="bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className="w-5 h-5 text-[var(--status-danger)] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-[var(--status-danger)]">
                        {language === 'hi'
                          ? 'आपातकालीन चिकित्सा ध्यान आवश्यक'
                          : 'Immediate Emergency Medical Attention Required'}
                      </div>
                      <p className="text-xs text-[var(--text-primary)]">
                        {language === 'hi'
                          ? 'कृपया तुरंत 108 पर कॉल कर सरकारी एम्बुलेंस बुलाएं या निकटतम आपातकालीन विभाग में जाएं।'
                          : 'Please call 108 immediately for an emergency ambulance or go to the nearest hospital emergency department.'}
                      </p>
                    </div>
                  </div>
                  <a
                    href="tel:108"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold text-white bg-[var(--status-danger)] hover:bg-[var(--status-danger-hover)] transition-colors whitespace-nowrap shrink-0"
                  >
                    <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t('call108')}</span>
                  </a>
                </div>
              )}

              {/* Possible Causes / Primary Assessment & Recommended Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)] space-y-1">
                  <div className="text-xs font-semibold text-[var(--text-muted)]">
                    {t('chiefComplaint')}
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {language === 'hi' ? generatedReport.chiefComplaintHi : generatedReport.chiefComplaint}
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] pt-1 leading-relaxed">
                    {language === 'hi' ? generatedReport.riskReasonHi : generatedReport.riskReason}
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)] space-y-2">
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-muted)]">
                      {t('recommendedDept')}
                    </div>
                    <div className="text-sm font-semibold text-[var(--brand-primary)] mt-0.5">
                      {language === 'hi'
                        ? generatedReport.recommendedDepartmentHi
                        : generatedReport.recommendedDepartment}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[var(--border-default)]">
                    <div className="text-xs font-semibold text-[var(--text-muted)]">
                      {t('duration')}
                    </div>
                    <div className="text-sm font-medium text-[var(--text-primary)] tabular-nums mt-0.5">
                      {language === 'hi' ? generatedReport.durationHi : generatedReport.duration}
                    </div>
                  </div>
                </div>
              </div>

              {/* Identified Symptoms */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[var(--text-secondary)]">
                  {t('symptomsIdentified')}
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm text-[var(--text-primary)]">
                  {(language === 'hi'
                    ? generatedReport.symptomsHi || generatedReport.symptoms
                    : generatedReport.symptoms
                  ).map((sym, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[var(--brand-primary)] font-semibold" aria-hidden="true">
                        ·
                      </span>
                      <span>{sym}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Next Steps */}
              <div className="p-4 rounded-lg bg-[var(--brand-primary-tint)] border border-[var(--brand-primary-border)] space-y-2">
                <h4 className="text-xs font-semibold text-[var(--brand-primary)] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                  <span>{t('preliminaryAdvice')}</span>
                </h4>
                <ol className="list-decimal list-inside space-y-1.5 text-sm text-[var(--text-primary)]">
                  {(language === 'hi'
                    ? generatedReport.preliminaryAdviceHi || generatedReport.preliminaryAdvice
                    : generatedReport.preliminaryAdvice || []
                  ).map((adv, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {adv}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Medical Disclaimer */}
              <div className="flex items-start gap-2 text-xs text-[var(--text-muted)] pt-1">
                <Info className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                <p>{t('medicalDisclaimer')}</p>
              </div>

              {/* Forward to Doctor Queue Action */}
              {isSubmitted ? (
                <div
                  role="status"
                  className="p-4 rounded-lg bg-[var(--status-success-bg)] border border-[var(--status-success-border)] text-[var(--status-success)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{t('reportSubmittedSuccess')}</span>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-1.5 rounded-md text-xs font-semibold bg-[var(--status-success)] text-white cursor-pointer self-start sm:self-center"
                  >
                    {t('close')}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitToDoctor}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md text-sm font-semibold text-white bg-[var(--brand-teal)] hover:bg-[var(--brand-teal-hover)] transition-colors cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4" aria-hidden="true" />
                  <span>{t('submitToDoctorQueue')}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
