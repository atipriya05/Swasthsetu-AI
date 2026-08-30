import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../context/OfflineSyncContext';
import { 
  Activity, 
  MapPin, 
  FileText, 
  Bot, 
  Stethoscope, 
  LogOut, 
  Sparkles,
  Wifi,
  WifiOff,
  RefreshCw,
  PhoneCall
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openEmergencyModal: () => void;
  openReportGenerator: () => void;
  openChatbot?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  openEmergencyModal,
  openReportGenerator,
  openChatbot
}) => {
  const { language, setLanguage, t } = useLanguage();
  const { role, patient, doctor, quickDemoLogin, logout } = useAuth();
  const { isOffline, toggleOfflineMode, syncNow, isSyncing, queue } = useOfflineSync();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-2xs">
      {/* Top Ministry & Quick Role Bar */}
      <div className="bg-[#111827] text-slate-200 text-xs px-4 sm:px-8 py-1 flex items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-3.5 h-3.5 rounded-full bg-blue-400/20 text-blue-400 flex items-center justify-center font-bold text-[8px] border border-blue-400/40 shrink-0">
            ★
          </div>
          <span className="font-medium text-slate-300 text-[11px] truncate">
            {language === 'hi' 
              ? 'राष्ट्रीय स्वास्थ्य मिशन (NHM) • भारत सरकार' 
              : language === 'mr'
              ? 'राष्ट्रीय आरोग्य अभियान (NHM) • भारत सरकार'
              : 'National Health Mission (NHM) • Govt. of India'}
          </span>
        </div>

        {/* Role Quick Switcher bar */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="hidden sm:inline text-slate-400 text-[11px] font-medium mr-0.5">
            {language === 'hi' ? 'भूमिका:' : language === 'mr' ? 'भूमिका:' : 'Role:'}
          </span>
          <button
            onClick={() => {
              quickDemoLogin('patient');
              setCurrentTab('dashboard');
            }}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
              role === 'patient' 
                ? 'bg-[#1A5FB4] text-white shadow-2xs font-bold' 
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {language === 'hi' ? 'मरीज़' : language === 'mr' ? 'रुग्ण' : 'Patient'}
          </button>
          <button
            onClick={() => {
              quickDemoLogin('doctor');
              setCurrentTab('doctor');
            }}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
              role === 'doctor' 
                ? 'bg-[#26A269] text-white shadow-2xs font-bold' 
                : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            {language === 'hi' ? 'डॉक्टर' : language === 'mr' ? 'डॉक्टर' : 'Doctor'}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-15 sm:h-16 gap-3">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => setCurrentTab(role === 'doctor' ? 'doctor' : 'dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-[#1A5FB4] to-[#164E93] p-1.5 shadow-xs group-hover:scale-105 transition-transform flex items-center justify-center text-white shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M2 12h20"/>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg sm:text-xl font-black tracking-tight text-[#1A5FB4] whitespace-nowrap">
                  SwasthSetu <span className="text-[#26A269]">AI</span>
                </span>
                <span className="hidden md:inline-flex bg-[#DEE9F7] text-[#1A5FB4] text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200 whitespace-nowrap">
                  Ayushman Bharat
                </span>
              </div>
            </div>
          </div>

          {/* Center Segmented Navigation (Desktop XL) */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-100/90 p-1 rounded-full border border-slate-200/90 shadow-2xs">
            {role === 'patient' && (
              <>
                <button
                  onClick={() => setCurrentTab('dashboard')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentTab === 'dashboard'
                      ? 'bg-white text-[#1A5FB4] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-[#1A5FB4]" />
                  <span>{t('navHome')}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('map')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentTab === 'map'
                      ? 'bg-white text-[#1A5FB4] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-[#26A269]" />
                  <span>{t('navMap')}</span>
                </button>

                {openChatbot && (
                  <button
                    onClick={openChatbot}
                    className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 text-[#1A5FB4] bg-[#DEE9F7]/90 hover:bg-[#c9ddf5] border border-blue-200/80 transition-all cursor-pointer shadow-2xs"
                  >
                    <Bot className="w-3.5 h-3.5 text-[#1A5FB4]" />
                    <span>{language === 'hi' ? 'AI चिकित्सक' : language === 'mr' ? 'AI डॉक्टर' : 'AI Assistant'}</span>
                  </button>
                )}

                <button
                  onClick={openReportGenerator}
                  className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 text-indigo-700 bg-indigo-50/90 hover:bg-indigo-100 border border-indigo-200/80 transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{language === 'hi' ? 'क्लीनिकल रिपोर्ट' : language === 'mr' ? 'वैद्यकीय अहवाल' : 'Clinical Report'}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('records')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentTab === 'records'
                      ? 'bg-white text-[#1A5FB4] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-[#1A5FB4]" />
                  <span>{t('navHealthRecords')}</span>
                </button>
              </>
            )}

            {role === 'doctor' && (
              <>
                <button
                  onClick={() => setCurrentTab('doctor')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentTab === 'doctor'
                      ? 'bg-white text-[#26A269] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <Stethoscope className="w-3.5 h-3.5 text-[#26A269]" />
                  <span>{t('doctorDashboardTitle')}</span>
                </button>

                <button
                  onClick={() => setCurrentTab('map')}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
                    currentTab === 'map'
                      ? 'bg-white text-[#26A269] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-[#26A269]" />
                  <span>{t('navMap')}</span>
                </button>
              </>
            )}

            {!role && (
              <button
                onClick={() => setCurrentTab('login')}
                className="px-4 py-1.5 rounded-full text-xs font-bold text-[#1A5FB4] bg-white shadow-xs cursor-pointer"
              >
                {t('loginTitle')}
              </button>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* Online / Offline Status Badge */}
            <button
              onClick={isOffline ? syncNow : toggleOfflineMode}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 border transition-all cursor-pointer shrink-0 ${
                isOffline
                  ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                  : 'bg-emerald-50 text-[#26A269] border-emerald-200 hover:bg-emerald-100/70'
              }`}
              title={isOffline ? 'Offline mode - tap to sync' : 'Online network connected'}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3 h-3 text-amber-700" />
                  <span className="hidden sm:inline">Offline {queue.length > 0 ? `(${queue.length})` : ''}</span>
                  {queue.length > 0 && <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-amber-700' : ''}`} />}
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="hidden sm:inline">Online</span>
                </>
              )}
            </button>

            {/* Language Switcher Pill */}
            <div className="flex bg-gray-100 p-0.5 rounded-full border border-gray-200 shrink-0 shadow-2xs">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-white shadow-xs text-[#1A5FB4]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('hi')}
                className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  language === 'hi'
                    ? 'bg-white shadow-xs text-[#1A5FB4]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Emergency SOS Button */}
            <button
              onClick={openEmergencyModal}
              className="bg-[#E01B24] hover:bg-[#c0171e] active:scale-95 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-black tracking-wide text-xs sm:text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
              title="108 Emergency Ambulance"
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">
                {language === 'hi' ? '108 आपातकाल' : language === 'mr' ? '१०८ आपत्कालीन' : '108 EMERGENCY'}
              </span>
            </button>

            {/* User Session or Login Button */}
            {role ? (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => setCurrentTab(role === 'doctor' ? 'doctor' : 'dashboard')}
                  className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-full text-xs font-bold text-slate-800 border border-slate-200 transition-colors"
                  title="View Profile"
                >
                  <div className="w-5 h-5 rounded-full bg-[#1A5FB4] text-white flex items-center justify-center text-[10px] font-bold">
                    {role === 'doctor' ? 'Dr' : 'R'}
                  </div>
                  <span className="max-w-[80px] truncate text-[11px]">
                    {role === 'doctor' ? doctor?.name?.split(' ')[1] || 'Doctor' : patient?.name?.split(' ')[0] || 'Patient'}
                  </span>
                </button>
                <button
                  onClick={logout}
                  className="p-1.5 text-gray-500 hover:text-[#E01B24] hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('login')}
                className="bg-[#1A5FB4] hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-full text-xs font-bold shadow-xs cursor-pointer shrink-0"
              >
                {t('loginTitle')}
              </button>
            )}

          </div>
        </div>

        {/* Mobile / Tablet Sub-Navigation Bar (visible below XL) */}
        <div className="flex xl:hidden overflow-x-auto py-2 gap-1.5 border-t border-gray-100 no-scrollbar items-center">
          {role === 'patient' && (
            <>
              <button
                onClick={() => setCurrentTab('dashboard')}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  currentTab === 'dashboard' ? 'bg-[#1A5FB4] text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{t('navHome')}</span>
              </button>

              <button
                onClick={() => setCurrentTab('map')}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  currentTab === 'map' ? 'bg-[#1A5FB4] text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{t('navMap')}</span>
              </button>

              {openChatbot && (
                <button
                  onClick={openChatbot}
                  className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 bg-[#DEE9F7] text-[#1A5FB4] border border-blue-200 shadow-2xs"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{language === 'hi' ? 'AI चिकित्सक' : 'AI Assistant'}</span>
                </button>
              )}

              <button
                onClick={openReportGenerator}
                className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 bg-indigo-600 text-white shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'क्लीनिकल रिपोर्ट' : 'Clinical Report'}</span>
              </button>

              <button
                onClick={() => setCurrentTab('records')}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  currentTab === 'records' ? 'bg-[#1A5FB4] text-white shadow-2xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{t('navHealthRecords')}</span>
              </button>
            </>
          )}

          {role === 'doctor' && (
            <>
              <button
                onClick={() => setCurrentTab('doctor')}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  currentTab === 'doctor' ? 'bg-[#26A269] text-white shadow-2xs' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>{t('doctorDashboardTitle')}</span>
              </button>
              <button
                onClick={() => setCurrentTab('map')}
                className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  currentTab === 'map' ? 'bg-[#26A269] text-white shadow-2xs' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{t('navMap')}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
