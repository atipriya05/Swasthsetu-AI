import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { SpeechService } from '../utils/speech';
import { Volume2, VolumeX, X, CheckCircle2 } from 'lucide-react';

export const WelcomeToast: React.FC = () => {
  const { welcomeToast, dismissWelcomeToast } = useAuth();
  const { language, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!welcomeToast) return;

    const speechText =
      language === 'hi'
        ? `नमस्ते, स्वास्थ्यसेतु में आपका स्वागत है!`
        : `Hi, welcome to SwasthSetu!`;

    if (welcomeToast.autoSpeak) {
      SpeechService.speak(
        speechText,
        language,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }

    // Auto-dismiss countdown (6.5 seconds)
    const startTime = Date.now();
    const duration = 6500;
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        dismissWelcomeToast();
      }
    }, 50);

    return () => {
      clearInterval(interval);
    };
  }, [welcomeToast, language, dismissWelcomeToast]);

  if (!welcomeToast) return null;

  const handleManualSpeak = () => {
    if (isSpeaking) {
      SpeechService.stop();
      setIsSpeaking(false);
      return;
    }

    const speechText =
      language === 'hi'
        ? `नमस्ते, स्वास्थ्यसेतु में आपका स्वागत है!`
        : `Hi, welcome to SwasthSetu!`;

    SpeechService.speak(
      speechText,
      language,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      () => setIsSpeaking(false)
    );
  };

  const displayName = welcomeToast.name;
  const isDoctor = welcomeToast.role === 'doctor';

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed top-3 sm:top-5 right-3 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100vw-1.5rem)] pointer-events-auto shadow-2xl rounded-xl transition-all"
    >
      <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-[0_12px_36px_rgba(15,76,129,0.2)] overflow-hidden">
        <div className="p-4 sm:p-4.5 flex items-start gap-3.5">
          {/* Animated Avatar / Waving Badge */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm text-lg select-none">
            👋
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--brand-teal)]">
                {language === 'hi' ? 'प्रवेश सफल' : 'Signed In'}
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" aria-hidden="true" />
            </div>

            <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] leading-snug mt-0.5">
              {t('welcomeGreetingTitle')}
            </h2>

            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
              {isDoctor
                ? language === 'hi'
                  ? `स्वागत है ${displayName}! ${t('welcomeGreetingSubtitleDoctor')}`
                  : `Welcome ${displayName}! ${t('welcomeGreetingSubtitleDoctor')}`
                : language === 'hi'
                ? `स्वागत है ${displayName}! ${t('welcomeGreetingSubtitlePatient')}`
                : `Glad to have you here, ${displayName}! ${t('welcomeGreetingSubtitlePatient')}`}
            </p>

            {/* Listen / Voice Action */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                onClick={handleManualSpeak}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[var(--brand-primary-tint)] text-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white transition-colors cursor-pointer"
                title={t('hearGreeting')}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
                    <span>{language === 'hi' ? 'आवाज़ रोकें' : 'Stop Audio'}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{t('hearGreeting')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            type="button"
            onClick={dismissWelcomeToast}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-md hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer shrink-0"
            aria-label="Dismiss greeting"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dismiss countdown progress bar */}
        <div className="h-1 w-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-[var(--brand-primary)] transition-all ease-linear duration-50"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
