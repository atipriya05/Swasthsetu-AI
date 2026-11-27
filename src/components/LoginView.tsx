import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { User, Stethoscope, Smartphone, Lock, ShieldCheck, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface LoginViewProps {
  onSuccessLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccessLogin }) => {
  const { language, t } = useLanguage();
  const { loginPatient, loginDoctor } = useAuth();

  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');

  // Patient Login State (Password-verified)
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Doctor Login State
  const [doctorIdentifier, setDoctorIdentifier] = useState('');
  const [doctorPassword, setDoctorPassword] = useState('');
  const [showDoctorPassword, setShowDoctorPassword] = useState(false);

  const [error, setError] = useState('');

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanName = name.trim();
    const cleanMobile = mobile.trim().replace(/\D/g, '');
    const cleanPassword = password.trim();

    if (cleanName.length < 2) {
      setError(
        language === 'hi'
          ? 'कृपया अपना पूरा नाम (कम से कम 2 अक्षर) दर्ज करें।'
          : 'Please enter your full name (at least 2 characters).'
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

    if (cleanPassword.length < 4) {
      setError(
        language === 'hi'
          ? 'कृपया कम से कम 4 अक्षरों का पासवर्ड दर्ज करें।'
          : 'Please enter a password with at least 4 characters.'
      );
      return;
    }

    const success = loginPatient(cleanName, cleanMobile, cleanPassword);
    if (success) {
      onSuccessLogin();
    } else {
      setError(
        language === 'hi'
          ? 'लॉगिन असफल। कृपया अपनी जानकारी पुनः जांचें।'
          : 'Authentication failed. Please verify your details and try again.'
      );
    }
  };

  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanId = doctorIdentifier.trim();
    const cleanPassword = doctorPassword.trim();

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
          ? 'अमान्य क्रेडेंशियल्स। कृपया अधिकृत चिकित्सा अधिकारी आईडी और पासवर्ड दर्ज करें।'
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

        {/* Password-Verified Patient Sign In Form */}
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

            {/* Mobile Number Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="patient-mobile"
                className="block text-xs font-semibold text-[var(--text-primary)]"
              >
                {t('mobileNumber')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
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
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label
                htmlFor="patient-password"
                className="block text-xs font-semibold text-[var(--text-primary)]"
              >
                {t('patientPassword')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Lock
                  className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="patient-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('patientPasswordPlaceholder')}
                  className="w-full pl-10 pr-10 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-sm text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={name.trim().length < 2 || mobile.trim().length !== 10 || password.trim().length < 4}
              className={`w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold transition-colors cursor-pointer mt-2 ${
                name.trim().length < 2 || mobile.trim().length !== 10 || password.trim().length < 4
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
                  type={showDoctorPassword ? 'text' : 'password'}
                  value={doctorPassword}
                  onChange={(e) => setDoctorPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className="w-full pl-10 pr-10 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-sm text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowDoctorPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                  aria-label={showDoctorPassword ? 'Hide password' : 'Show password'}
                >
                  {showDoctorPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer shadow-xs mt-2"
            >
              <span>{t('doctorLoginBtn')}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        )}

        {/* Security & Official Trust Notice */}
        <div className="px-6 py-4 bg-[var(--bg-canvas)] border-t border-[var(--border-default)] flex items-center gap-2.5 text-xs text-[var(--text-secondary)]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-hidden="true" />
          <span>{t('abdmSecured')}</span>
        </div>
      </div>
    </div>
  );
};
