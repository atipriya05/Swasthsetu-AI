import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { User, Stethoscope, Smartphone, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

interface LoginViewProps {
  onSuccessLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccessLogin }) => {
  const { language, t } = useLanguage();
  const { loginPatient, loginDoctor, quickDemoLogin } = useAuth();

  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');

  const [mobile, setMobile] = useState('9876543210');
  const [otp, setOtp] = useState('123456');

  const [doctorIdentifier, setDoctorIdentifier] = useState('DOC-UP-8842');
  const [password, setPassword] = useState('health123');

  const [error, setError] = useState('');

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = loginPatient(mobile.trim(), otp.trim());
    if (success) {
      onSuccessLogin();
    } else {
      setError(
        language === 'hi'
          ? 'कृपया वैध 10-अंकीय मोबाइल नंबर और 6-अंकीय ओटीपी (डेमो: 123456) दर्ज करें।'
          : 'Please enter a valid 10-digit mobile number and 6-digit passcode (demo: 123456).'
      );
    }
  };

  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = loginDoctor(doctorIdentifier.trim(), password);
    if (success) {
      onSuccessLogin();
    } else {
      setError(
        language === 'hi'
          ? 'अमान्य चिकित्सा अधिकारी आईडी या पासवर्ड। डेमो: DOC-UP-8842 / health123'
          : 'Invalid Medical Officer ID or password. Demo credentials: DOC-UP-8842 / health123'
      );
    }
  };

  return (
    <div className="max-w-lg mx-auto py-8 sm:py-12">
      <div className="bg-white rounded-xl border border-[var(--border-default)] shadow-[var(--shadow-card)] overflow-hidden">
        {/* Portal Header */}
        <div className="px-6 py-6 border-b border-[var(--border-default)] space-y-1.5">
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

        {/* Validation Error */}
        {error && (
          <div
            role="alert"
            className="mx-6 mt-5 p-3 rounded-md bg-[var(--status-danger-bg)] border border-[var(--status-danger-border)] text-[var(--status-danger)] text-xs font-medium"
          >
            {error}
          </div>
        )}

        {/* Patient Form */}
        {activeTab === 'patient' && (
          <form onSubmit={handlePatientSubmit} className="p-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="patient-mobile"
                className="block text-xs font-semibold text-[var(--text-primary)]"
              >
                {t('mobileNumber')}
              </label>
              <div className="relative">
                <Smartphone
                  className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="patient-mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder={t('mobilePlaceholder')}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-sm text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)]"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="patient-otp"
                  className="text-xs font-semibold text-[var(--text-primary)]"
                >
                  {t('enterOtp')}
                </label>
                <span className="text-xs text-[var(--text-muted)] font-mono">Demo: 123456</span>
              </div>
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
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder={t('otpPlaceholder')}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-sm font-mono tracking-widest text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
            >
              <span>{t('verifyLogin')}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        )}

        {/* Doctor Form */}
        {activeTab === 'doctor' && (
          <form onSubmit={handleDoctorSubmit} className="p-6 space-y-4" noValidate>
            <div className="space-y-1.5">
              <label
                htmlFor="doctor-id"
                className="block text-xs font-semibold text-[var(--text-primary)]"
              >
                {t('doctorIdentifier')}
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
              <div className="flex items-center justify-between">
                <label
                  htmlFor="doctor-password"
                  className="text-xs font-semibold text-[var(--text-primary)]"
                >
                  {t('password')}
                </label>
                <span className="text-xs text-[var(--text-muted)] font-mono">Demo: health123</span>
              </div>
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
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
            >
              <span>{t('doctorLoginBtn')}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        )}

        {/* Quick Demo Access Footer */}
        <div className="px-6 py-4 bg-[var(--bg-canvas)] border-t border-[var(--border-default)] space-y-2.5">
          <div className="text-xs font-semibold text-[var(--text-muted)]">
            {t('quickDemoCredentials')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => {
                quickDemoLogin('patient');
                onSuccessLogin();
              }}
              className="py-2 px-3 rounded-md text-xs font-semibold text-[var(--brand-primary)] bg-white border border-[var(--border-strong)] hover:bg-[var(--brand-primary-tint)] transition-colors cursor-pointer"
            >
              {t('loginAsPatientDemo')}
            </button>
            <button
              type="button"
              onClick={() => {
                quickDemoLogin('doctor');
                onSuccessLogin();
              }}
              className="py-2 px-3 rounded-md text-xs font-semibold text-[var(--brand-teal)] bg-white border border-[var(--border-strong)] hover:bg-[var(--brand-teal-tint)] transition-colors cursor-pointer"
            >
              {t('loginAsDoctorDemo')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
