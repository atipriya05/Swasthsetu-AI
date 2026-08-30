import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { User, Stethoscope, Smartphone, Lock, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

interface LoginViewProps {
  onSuccessLogin: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onSuccessLogin }) => {
  const { language, t } = useLanguage();
  const { loginPatient, loginDoctor, quickDemoLogin } = useAuth();

  const [activeTab, setActiveTab] = useState<'patient' | 'doctor'>('patient');

  // Patient Login State
  const [mobile, setMobile] = useState('9876543210');
  const [otp, setOtp] = useState('123456');

  // Doctor Login State
  const [doctorIdentifier, setDoctorIdentifier] = useState('DOC-UP-8842');
  const [password, setPassword] = useState('health123');

  const [error, setError] = useState('');

  const handlePatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = loginPatient(mobile, otp);
    if (success) {
      onSuccessLogin();
    } else {
      setError(language === 'hi' ? 'कृपया 10 अंकों का मोबाइल व 6 अंकों का सही OTP (उदा. 123456) दर्ज करें।' : 'Please enter 10-digit mobile number and valid 6-digit OTP (e.g. 123456).');
    }
  };

  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = loginDoctor(doctorIdentifier, password);
    if (success) {
      onSuccessLogin();
    } else {
      setError(language === 'hi' ? 'अमान्य डॉक्टर आईडी या पासवर्ड। डेमो: DOC-UP-8842 / health123' : 'Invalid Doctor ID or password. Demo: DOC-UP-8842 / health123');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 px-4">
      
      {/* Portal Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-6 text-center">
        <div className="inline-flex items-center gap-1.5 bg-[#DEE9F7] text-[#1A5FB4] text-xs font-bold px-3 py-1 rounded-full mb-3 border border-blue-200">
          <Sparkles className="w-3.5 h-3.5 text-[#1A5FB4]" />
          {t('sihTag')}
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1B] tracking-tight">
          {t('loginTitle')}
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-md mx-auto">
          {t('loginSubtitle')}
        </p>

        {/* 1-Click Instant Demo Credentials */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-2.5">
            ⚡ {t('quickDemoCredentials')}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                quickDemoLogin('patient');
                onSuccessLogin();
              }}
              className="bg-[#DEE9F7] hover:bg-blue-100 text-[#1A5FB4] font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 border border-blue-200 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-[#1A5FB4]" />
              <span>{t('loginAsPatientDemo')}</span>
            </button>

            <button
              onClick={() => {
                quickDemoLogin('doctor');
                onSuccessLogin();
              }}
              className="bg-emerald-50 hover:bg-emerald-100 text-[#26A269] font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 border border-emerald-200 transition-colors cursor-pointer"
            >
              <Stethoscope className="w-4 h-4 text-[#26A269]" />
              <span>{t('loginAsDoctorDemo')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Dual Login Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1.5 bg-[#F0F5F9] gap-1.5 border-b border-gray-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('patient');
              setError('');
            }}
            className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'patient'
                ? 'bg-white text-[#1A5FB4] shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{t('patientTab')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('doctor');
              setError('');
            }}
            className={`py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              activeTab === 'doctor'
                ? 'bg-white text-[#26A269] shadow-2xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>{t('doctorTab')}</span>
          </button>
        </div>

        {/* Error Notice */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-[#E01B24] text-xs font-semibold rounded-xl">
            {error}
          </div>
        )}

        {/* Patient Form (Mobile + OTP) */}
        {activeTab === 'patient' && (
          <form onSubmit={handlePatientSubmit} className="p-6 sm:p-8 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('mobileNumber')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder={t('mobilePlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F0F5F9] border border-gray-200 rounded-xl text-sm font-medium text-[#1A1A1B] focus:bg-white focus:ring-2 focus:ring-[#1A5FB4] outline-hidden transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">
                  {t('enterOtp')}
                </label>
                <span className="text-[11px] font-semibold text-[#26A269] bg-emerald-50 px-2 py-0.5 rounded">
                  Demo OTP: 123456
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder={t('otpPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F0F5F9] border border-gray-200 rounded-xl text-sm font-mono tracking-widest font-bold text-[#1A1A1B] focus:bg-white focus:ring-2 focus:ring-[#1A5FB4] outline-hidden transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#1A5FB4] hover:bg-blue-700 active:scale-98 text-white font-bold py-3.5 px-6 rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer mt-2"
            >
              <span>{t('verifyLogin')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-[11px] text-gray-400">
              {language === 'hi' 
                ? 'राष्ट्रीय स्वास्थ्य प्राधिकरण (NHA) एवं आयुष्मान भारत डिजिटल मिशन (ABDM) सुरक्षा मानकों के अनुकूल।'
                : 'Secured under National Health Authority (NHA) & Ayushman Bharat Digital Mission.'}
            </p>
          </form>
        )}

        {/* Doctor Form (Doctor ID + Password) */}
        {activeTab === 'doctor' && (
          <form onSubmit={handleDoctorSubmit} className="p-6 sm:p-8 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('doctorIdentifier')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Stethoscope className="w-4 h-4 text-[#26A269]" />
                </div>
                <input
                  type="text"
                  value={doctorIdentifier}
                  onChange={(e) => setDoctorIdentifier(e.target.value)}
                  placeholder={t('doctorPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F0F5F9] border border-gray-200 rounded-xl text-sm font-medium text-[#1A1A1B] focus:bg-white focus:ring-2 focus:ring-[#26A269] outline-hidden transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">
                  {t('password')}
                </label>
                <span className="text-[11px] font-semibold text-[#26A269] bg-emerald-50 px-2 py-0.5 rounded">
                  Demo: health123
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('passwordPlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F0F5F9] border border-gray-200 rounded-xl text-sm font-medium text-[#1A1A1B] focus:bg-white focus:ring-2 focus:ring-[#26A269] outline-hidden transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-[#26A269] hover:bg-emerald-700 active:scale-98 text-white font-bold py-3.5 px-6 rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer mt-2"
            >
              <span>{t('doctorLoginBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-[11px] text-gray-400">
              {language === 'hi'
                ? 'प्राथमिक स्वास्थ्य केंद्र (PHC) एवं सामुदायिक स्वास्थ्य केंद्र (CHC) डॉक्टरों के लिए अधिकृत पोर्टल।'
                : 'Authorized login for PHC, CHC, and District Hospital Medical Officers.'}
            </p>
          </form>
        )}

      </div>

    </div>
  );
};
