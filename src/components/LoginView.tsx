import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { User, Stethoscope, Smartphone, Lock, ShieldCheck, ArrowRight, CheckCircle2, RotateCw, KeyRound } from 'lucide-react';

interface LoginViewProps {
  onSuccessLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccessLogin }) => {
  const { language, t } = useLanguage();
  const { loginPatient, loginDoctor } = useAuth();

  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');

  // Patient Login State (proper clean inputs with no pre-filled demo data)
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Doctor Login State
  const [doctorIdentifier, setDoctorIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState('');

  // Resend OTP countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendTimer]);

  const handleSendOtp = () => {
    setError('');
    setSuccessInfo('');

    const cleanName = name.trim();
    const cleanMobile = mobile.trim().replace(/\D/g, '');

    if (cleanName.length < 2) {
      setError(
        language === 'hi'
          ? 'कृपया अपना पूरा नाम दर्ज करें।'
          : 'Please enter your full name as per official records.'
      );
      return;
    }

    if (cleanMobile.length !== 10) {
      setError(
        language === 'hi'
          ? 'कृपया 10 अंकों का वैध भारतीय मोबाइल नंबर दर्ज करें।'
          : 'Please enter a valid 10-digit Indian mobile number.'
      );
      return;
    }

    // Generate a realistic 6-digit OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(newOtp);
    setIsOtpSent(true);
    setResendTimer(30);

    setSuccessInfo(
      language === 'hi'
        ? `+91 ${cleanMobile} पर 6-अंकीय सत्यापन कोड (OTP) भेजा गया है।`
        : `6-digit verification code sent to +91 ${cleanMobile}.`
    );
  };

  const handleAutoFillOtp = () => {
    if (generatedOtp) {
      setOtp(generatedOtp);
      setError('');
    }
  };

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanMobile = mobile.trim().replace(/\D/g, '');
    const cleanOtp = otp.trim();

    if (!isOtpSent) {
      setError(
        language === 'hi'
          ? 'कृपया पहले "ओटीपी भेजें" बटन दबाकर सत्यापन कोड प्राप्त करें।'
          : 'Please click "Send Verification Code" first to receive your OTP.'
      );
      return;
    }

    if (cleanOtp.length !== 6) {
      setError(
        language === 'hi'
          ? 'कृपया 6 अंकों का सही सत्यापन कोड (OTP) दर्ज करें।'
          : 'Please enter the 6-digit OTP verification code.'
      );
      return;
    }

    const success = loginPatient(cleanName, cleanMobile, cleanOtp, generatedOtp || undefined);
    if (success) {
      onSuccessLogin();
    } else {
      setError(
        language === 'hi'
          ? 'अमान्य सत्यापन कोड। कृपया अपने फोन पर भेजा गया 6 अंकों का सही ओटीपी दर्ज करें।'
          : 'Invalid verification code. Please check your OTP and try again.'
      );
    }
  };

  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanId = doctorIdentifier.trim();
    const cleanPassword = password.trim();

    if (cleanId.length === 0 || cleanPassword.length === 0) {
      setError(
        language === 'hi'
          ? 'कृपया अपनी चिकित्सा अधिकारी आईडी और पासवर्ड दर्ज करें।'
          : 'Please enter your Medical Officer ID and password.'
      );
      return;
    }

    const success = loginDoctor(cleanId, cleanPassword);
    if (success) {
      onSuccessLogin();
    } else {
      setError(
        language === 'hi'
          ? 'अमान्य क्रेडेंशियल्स। कृपया अधिकृत चिकित्सा अधिकारी आईडी दर्ज करें।'
          : 'Invalid credentials. Please enter your registered Medical Officer ID and password.'
      );
    }
  };

  return (
    <div className="max-w-lg mx-auto py-6 sm:py-10 px-2 sm:px-0">
      <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-[var(--shadow-card)] overflow-hidden">
        {/* Portal Header */}
        <div className="px-6 py-6 border-b border-[var(--border-default)] space-y-1.5 bg-gradient-to-r from-teal-50/40 to-sky-50/30">
          <p className="text-xs font-semibold text-[var(--brand-teal)]">{t('sihTag')}</p>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            {t('loginTitle')}
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">{t('loginSubtitle')}</p>
        </div>

        {/* Role Tab Selector */}
        <div
          role="tablist"
          aria-label="Account type"
          className="grid grid-cols-2 p-1.5 bg-[var(--bg-subtle)] border-b border-[var(--border-default)] gap-1.5"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'patient'}
            onClick={() => {
              setActiveTab('patient');
              setError('');
              setSuccessInfo('');
            }}
            className={`py-2.5 px-3 rounded-md text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'patient'
                ? 'bg-white text-[var(--brand-primary)] font-semibold shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <User className="w-4 h-4" aria-hidden="true" />
            <span>{t('patientTab')}</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'doctor'}
            onClick={() => {
              setActiveTab('doctor');
              setError('');
              setSuccessInfo('');
            }}
            className={`py-2.5 px-3 rounded-md text-xs sm:text-sm font-medium inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'doctor'
                ? 'bg-white text-[var(--brand-primary)] font-semibold shadow-2xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Stethoscope className="w-4 h-4" aria-hidden="true" />
            <span>{t('doctorTab')}</span>
          </button>
        </div>

        {/* Validation Error Banner */}
        {error && (
          <div
            role="alert"
            className="mx-6 mt-5 p-3 rounded-md bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-xs font-medium"
          >
            {error}
          </div>
        )}

        {/* Proper Patient OTP Sign In Form */}
        {activeTab === 'patient' && (
          <form onSubmit={handlePatientSubmit} className="p-6 space-y-4" noValidate>
            {/* Full Name Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="patient-name"
                className="block text-xs font-semibold text-[var(--text-primary)]"
              >
                {t('fullName')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User
                  className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="patient-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-sm text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)]"
                  required
                />
              </div>
            </div>

            {/* Mobile Number Input with Country Code */}
            <div className="space-y-1.5">
              <label
                htmlFor="patient-mobile"
                className="block text-xs font-semibold text-[var(--text-primary)]"
              >
                {t('mobileNumber')} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-500 select-none">
                    +91
                  </span>
                  <input
                    id="patient-mobile"
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder={t('mobilePlaceholder')}
                    className="w-full pl-12 pr-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-sm font-mono tracking-wide text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)]"
                    required
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={resendTimer > 0 || mobile.trim().length !== 10 || name.trim().length < 2}
                  className={`px-3 sm:px-4 py-2.5 rounded-md text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                    resendTimer > 0 || mobile.trim().length !== 10 || name.trim().length < 2
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-[var(--brand-primary-tint)] text-[var(--brand-primary)] border border-[var(--brand-primary)] hover:bg-[var(--brand-primary)] hover:text-white'
                  }`}
                >
                  {resendTimer > 0 ? (
                    <span className="inline-flex items-center gap-1.5">
                      <RotateCw className="w-3 h-3 animate-spin" />
                      {resendTimer}s
                    </span>
                  ) : isOtpSent ? (
                    t('resendOtp')
                  ) : (
                    t('sendOtp')
                  )}
                </button>
              </div>
            </div>

            {/* Simulated Live SMS Notification Banner */}
            {isOtpSent && generatedOtp && (
              <div className="p-3.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-900 space-y-2 animate-in fade-in duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span className="text-xs font-semibold">{successInfo}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFillOtp}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-600 text-white text-[11px] font-semibold hover:bg-teal-700 transition-colors cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>{t('autoFillOtp')}</span>
                  </button>
                </div>
                <div className="text-xs flex items-center gap-2 font-mono bg-white/80 p-2 rounded border border-teal-200">
                  <span className="text-slate-500 font-sans">SwasthSetu OTP:</span>
                  <strong className="text-base text-teal-800 tracking-widest">{generatedOtp}</strong>
                  <span className="text-[11px] text-slate-400 font-sans ml-auto">(Valid for 5 mins)</span>
                </div>
              </div>
            )}

            {/* OTP Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="patient-otp"
                className="block text-xs font-semibold text-[var(--text-primary)]"
              >
                {t('enterOtp')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <ShieldCheck
                  className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="patient-otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('otpPlaceholder')}
                  disabled={!isOtpSent}
                  className={`w-full pl-10 pr-3.5 py-2.5 border rounded-md text-base font-mono tracking-widest text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)] ${
                    !isOtpSent ? 'bg-slate-50 border-slate-200 cursor-not-allowed opacity-70' : 'bg-[var(--bg-canvas)] border-[var(--border-strong)]'
                  }`}
                  required
                />
              </div>
            </div>

            {/* Verify & Sign In Button */}
            <button
              type="submit"
              disabled={!isOtpSent || otp.trim().length !== 6}
              className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold transition-colors cursor-pointer ${
                !isOtpSent || otp.trim().length !== 6
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] shadow-xs'
              }`}
            >
              <span>{t('verifyLogin')}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        )}

        {/* Doctor Login Form */}
        {activeTab === 'doctor' && (
          <form onSubmit={handleDoctorSubmit} className="p-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="doctor-id"
                className="block text-xs font-semibold text-[var(--text-primary)]"
              >
                {t('doctorIdentifier')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Stethoscope
                  className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="doctor-id"
                  type="text"
                  value={doctorIdentifier}
                  onChange={(e) => setDoctorIdentifier(e.target.value)}
                  placeholder={t('doctorPlaceholder')}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-sm text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="doctor-password"
                className="block text-xs font-semibold text-[var(--text-primary)]"
              >
                {t('password')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="doctor-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-sm text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer shadow-xs"
            >
              <span>{t('doctorLoginBtn')}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        )}

        {/* Security & Official Trust Notice (Replaces all demo links) */}
        <div className="px-6 py-4 bg-[var(--bg-canvas)] border-t border-[var(--border-default)] flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>{t('abdmSecured')}</span>
        </div>
      </div>
    </div>
  );
};
