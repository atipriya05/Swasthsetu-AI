import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Phone, Mail, ShieldCheck, X } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
  onOpenChatbot: () => void;
  onOpenReportGenerator: () => void;
}

type InfoModalType = 'privacy' | 'disclaimer' | 'accessibility' | null;

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenChatbot,
  onOpenReportGenerator
}) => {
  const { language, t } = useLanguage();
  const [activeInfoModal, setActiveInfoModal] = useState<InfoModalType>(null);

  return (
    <>
      <footer className="bg-white border-t border-[var(--border-default)] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Column 1: About */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span
                  className="w-7 h-7 rounded-md bg-[var(--brand-primary)] text-white flex items-center justify-center shrink-0"
                  aria-hidden="true"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 4v16M4 12h16" />
                  </svg>
                </span>
                <span className="text-base font-bold text-[var(--text-primary)]">
                  {t('appName')}
                </span>
              </div>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {t('footerAboutText')}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {language === 'hi'
                  ? 'राष्ट्रीय डिजिटल स्वास्थ्य मिशन (ABDM) के सिद्धांतों के अनुरूप।'
                  : 'Aligned with National Digital Health Mission (ABDM) standards.'}
              </p>
            </div>

            {/* Column 2: Services */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {t('footerServicesTitle')}
              </h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li>
                  <button
                    type="button"
                    onClick={onOpenChatbot}
                    className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
                  >
                    {t('navAIHealth')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={onOpenReportGenerator}
                    className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
                  >
                    {t('navClinicalReport')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('map')}
                    className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
                  >
                    {t('navMap')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('records')}
                    className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
                  >
                    {t('navHealthRecords')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onNavigate('doctor')}
                    className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
                  >
                    {t('navDoctorPortal')}
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Helplines & Contact */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {t('footerContactTitle')}
              </h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)] tabular-nums">
                <li>
                  <a
                    href="tel:108"
                    className="inline-flex items-center gap-2 hover:text-[var(--brand-primary)] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[var(--status-danger)]" aria-hidden="true" />
                    <span>
                      {language === 'hi' ? '108 — आपातकालीन एम्बुलेंस (24x7)' : '108 — Emergency Ambulance (24x7)'}
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:104"
                    className="inline-flex items-center gap-2 hover:text-[var(--brand-primary)] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[var(--brand-primary)]" aria-hidden="true" />
                    <span>
                      {language === 'hi' ? '104 — स्वास्थ्य परामर्श हेल्पलाइन' : '104 — National Health Helpline'}
                    </span>
                  </a>
                </li>
                <li>
                  <a
                    href="tel:14555"
                    className="inline-flex items-center gap-2 hover:text-[var(--brand-primary)] transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-[var(--brand-teal)]" aria-hidden="true" />
                    <span>
                      {language === 'hi' ? '14555 — आयुष्मान भारत PM-JAY' : '14555 — Ayushman Bharat PM-JAY'}
                    </span>
                  </a>
                </li>
                <li className="pt-1">
                  <a
                    href="mailto:support@swasthsetu-health.org"
                    className="inline-flex items-center gap-2 hover:text-[var(--brand-primary)] transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                    <span>support@swasthsetu-health.org</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4: Legal & Medical Disclaimer */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                {t('footerLegalTitle')}
              </h3>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveInfoModal('disclaimer')}
                    className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
                  >
                    {t('footerDisclaimer')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveInfoModal('privacy')}
                    className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
                  >
                    {t('footerPrivacy')}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveInfoModal('accessibility')}
                    className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
                  >
                    {t('footerAccessibility')}
                  </button>
                </li>
              </ul>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed pt-1">
                {t('medicalDisclaimer')}
              </p>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-[var(--border-default)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[var(--text-muted)]">
            <p>{t('footerCopyright')}</p>
            <p className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[var(--brand-teal)]" aria-hidden="true" />
              <span>{language === 'hi' ? 'गोपनीय एवं सुरक्षित स्वास्थ्य पोर्टल' : 'Privacy-first public health guidance'}</span>
            </p>
          </div>
        </div>
      </footer>

      {/* Policy & Disclaimer Info Modal */}
      {activeInfoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="footer-info-title"
          onClick={() => setActiveInfoModal(null)}
        >
          <div
            className="bg-white rounded-xl max-w-lg w-full border border-[var(--border-default)] shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
              <h2 id="footer-info-title" className="text-base font-semibold text-[var(--text-primary)]">
                {activeInfoModal === 'disclaimer' && t('footerDisclaimer')}
                {activeInfoModal === 'privacy' && t('footerPrivacy')}
                {activeInfoModal === 'accessibility' && t('footerAccessibility')}
              </h2>
              <button
                type="button"
                onClick={() => setActiveInfoModal(null)}
                className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
                aria-label={t('close')}
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-3 text-sm text-[var(--text-secondary)] leading-relaxed">
              {activeInfoModal === 'disclaimer' && (
                <>
                  <p>{t('medicalDisclaimer')}</p>
                  <p>
                    {language === 'hi'
                      ? 'यदि आपको सीने में दर्द, सांस लेने में गंभीर कठिनाई, बेहोशी, या अत्यधिक रक्तस्राव जैसे आपातकालीन लक्षण हों, तो तुरंत 108 पर कॉल करें या निकटतम आपातकालीन अस्पताल जाएं।'
                      : 'If you experience severe chest pain, acute shortness of breath, loss of consciousness, uncontrolled bleeding, or other life-threatening symptoms, call 108 immediately or go to the nearest emergency hospital.'}
                  </p>
                </>
              )}
              {activeInfoModal === 'privacy' && (
                <>
                  <p>
                    {language === 'hi'
                      ? 'स्वास्थ्य सेतु AI आपकी स्वास्थ्य जानकारी की गोपनीयता का सम्मान करता है। लक्षण विवरण केवल प्रारंभिक ट्राइएज सारांश और चिकित्सक परामर्श सहायता के लिए उपयोग किया जाता है।'
                      : 'SwasthSetu AI handles health inputs with strict confidentiality. Symptom entries are used solely to generate preliminary triage summaries and facilitate outpatient care coordination.'}
                  </p>
                  <p>
                    {language === 'hi'
                      ? 'आपकी भाषा प्राथमिकता और ऑफ़लाइन कतार केवल आपके ब्राउज़र में स्थानीय रूप से सहेजी जाती है।'
                      : 'Language preferences and offline appointment queues are stored locally in your browser and synchronized only when connectivity is active.'}
                  </p>
                </>
              )}
              {activeInfoModal === 'accessibility' && (
                <p>
                  {language === 'hi'
                    ? 'यह पोर्टल WCAG 2.1 AA कंट्रास्ट मानकों, कीबोर्ड नेविगेशन, स्क्रीन रीडर लेबल और हिंदी व अंग्रेज़ी में आवाज़ सहायता के साथ डिज़ाइन किया गया है।'
                    : 'This portal is designed to support WCAG 2.1 AA color contrast, full keyboard navigation, visible focus states, screen-reader landmarks, and bilingual voice input/output in English and Hindi.'}
                </p>
              )}
            </div>
            <div className="px-6 py-3.5 bg-[var(--bg-canvas)] border-t border-[var(--border-default)] flex justify-end">
              <button
                type="button"
                onClick={() => setActiveInfoModal(null)}
                className="px-4 py-2 rounded-md text-xs font-semibold bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] text-white transition-colors cursor-pointer"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
