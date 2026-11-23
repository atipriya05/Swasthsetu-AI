import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PhoneCall, X, AlertTriangle, Navigation, CheckCircle2 } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const [sosSent, setSosSent] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55"
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-lg w-full overflow-hidden shadow-[var(--shadow-elevated)] border border-[var(--border-default)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[var(--status-danger)] px-6 py-5 text-white flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <h2 id="emergency-modal-title" className="text-lg font-bold">
                {t('emergencyModalTitle')}
              </h2>
              <p className="text-xs text-red-100 mt-1 leading-relaxed">{t('sosDesc')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-red-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label={t('close')}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Emergency Helplines */}
        <div className="p-6 space-y-3">
          <a
            href="tel:108"
            className="w-full p-4 rounded-lg bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] hover:bg-red-100/70 transition-colors flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-md bg-[var(--status-danger)] text-white flex items-center justify-center shrink-0">
                <PhoneCall className="w-4 h-4" aria-hidden="true" />
              </div>
              <div>
                <div className="text-sm font-bold text-[var(--status-danger)]">{t('call108')}</div>
                <div className="text-xs text-[var(--text-secondary)]">
                  {language === 'hi'
                    ? '24x7 निःशुल्क सरकारी एम्बुलेंस सेवा'
                    : '24x7 Government Emergency Ambulance Dispatch'}
                </div>
              </div>
            </div>
            <span className="font-mono text-base font-bold text-[var(--status-danger)] tabular-nums">
              108
            </span>
          </a>

          <a
            href="tel:104"
            className="w-full p-3.5 rounded-lg bg-white border border-[var(--border-default)] hover:border-[var(--brand-primary)] transition-colors flex items-center justify-between gap-3"
          >
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">{t('call104')}</div>
              <div className="text-xs text-[var(--text-secondary)]">
                {language === 'hi'
                  ? 'सरकारी चिकित्सा परामर्श एवं स्वास्थ्य हेल्पलाइन'
                  : 'Government Health Advisory & Medical Helpline'}
              </div>
            </div>
            <span className="font-mono text-sm font-semibold text-[var(--brand-primary)] tabular-nums">
              104
            </span>
          </a>

          <a
            href="tel:+915862248100"
            className="w-full p-3.5 rounded-lg bg-white border border-[var(--border-default)] hover:border-[var(--brand-primary)] transition-colors flex items-center justify-between gap-3"
          >
            <div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                {t('callNearestPHC')}
              </div>
              <div className="text-xs text-[var(--text-secondary)]">
                Sitapur Primary Health Centre (2.1 km)
              </div>
            </div>
            <span className="font-mono text-xs font-semibold text-[var(--text-primary)] tabular-nums">
              05862-248100
            </span>
          </a>

          {/* Location Broadcast Option */}
          <div className="pt-2">
            {sosSent ? (
              <div
                role="status"
                className="p-3.5 rounded-lg bg-[var(--status-success-bg)] border border-[var(--status-success-border)] text-[var(--status-success)] text-xs font-medium flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>
                  {language === 'hi'
                    ? 'आपका संदर्भ स्थान (27.5684° N, 80.6829° E) 108 सहायता हेतु साझा कर दिया गया है।'
                    : 'Reference coordinates (27.5684° N, 80.6829° E) logged for 108 dispatch coordination.'}
                </span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setSosSent(true)}
                className="w-full py-2.5 px-4 rounded-md text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-subtle)] hover:bg-slate-200/80 border border-[var(--border-strong)] inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-[var(--brand-primary)]" aria-hidden="true" />
                <span>
                  {language === 'hi'
                    ? 'आपातकालीन कक्ष को जीपीएस स्थान साझा करें'
                    : 'Share GPS Coordinates with 108 Dispatch'}
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="px-6 py-3.5 bg-[var(--bg-canvas)] border-t border-[var(--border-default)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-semibold text-[var(--text-secondary)] bg-white border border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
          >
            {t('close')}
          </button>
        </div>
      </div>
    </div>
  );
};
