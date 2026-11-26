import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Home, MapPin, ClipboardList, MessageSquareText, FileText, Users, LogOut } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openReportGenerator: () => void;
  openChatbot: () => void;
  activeAppointmentsCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  setCurrentTab,
  openReportGenerator,
  openChatbot,
  activeAppointmentsCount = 0
}) => {
  const { language } = useLanguage();
  const { role, logout } = useAuth();

  if (!role || currentTab === 'login') return null;

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[var(--border-default)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] px-2 py-1 safe-area-pb"
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-lg mx-auto">
        {role === 'patient' && (
          <>
            {/* 1. Dashboard / Home */}
            <button
              type="button"
              onClick={() => setCurrentTab('dashboard')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-colors cursor-pointer relative ${
                currentTab === 'dashboard'
                  ? 'text-[var(--brand-primary)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Home className="w-5 h-5 mb-0.5" aria-hidden="true" />
              <span className="text-[10px] leading-tight truncate w-full text-center">
                {language === 'hi' ? 'होम' : 'Home'}
              </span>
              {currentTab === 'dashboard' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] mt-0.5" />
              )}
            </button>

            {/* 2. Hospital / PHC Finder */}
            <button
              type="button"
              onClick={() => setCurrentTab('map')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-colors cursor-pointer relative ${
                currentTab === 'map'
                  ? 'text-[var(--brand-primary)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <MapPin className="w-5 h-5 mb-0.5" aria-hidden="true" />
              <span className="text-[10px] leading-tight truncate w-full text-center">
                {language === 'hi' ? 'अस्पताल' : 'Hospitals'}
              </span>
              {currentTab === 'map' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] mt-0.5" />
              )}
            </button>

            {/* 3. AI Triage Report Generator (Center Highlighted) */}
            <button
              type="button"
              onClick={openReportGenerator}
              className="flex flex-col items-center justify-center py-1 px-1 rounded-lg text-[var(--brand-primary)] transition-transform active:scale-95 cursor-pointer relative"
            >
              <div className="w-9 h-9 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-md -mt-3.5 border-2 border-white">
                <ClipboardList className="w-5 h-5" aria-hidden="true" />
              </div>
              <span className="text-[10px] font-semibold text-[var(--brand-primary)] mt-0.5 leading-tight truncate w-full text-center">
                {language === 'hi' ? 'ट्राइएज' : 'Triage'}
              </span>
            </button>

            {/* 4. AI Symptom Assistant Chat */}
            <button
              type="button"
              onClick={openChatbot}
              className="flex flex-col items-center justify-center py-1.5 px-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer relative"
            >
              <MessageSquareText className="w-5 h-5 mb-0.5 text-[var(--brand-teal)]" aria-hidden="true" />
              <span className="text-[10px] leading-tight truncate w-full text-center">
                {language === 'hi' ? 'सहायक' : 'AI Assistant'}
              </span>
            </button>

            {/* 5. Health Records / ABHA */}
            <button
              type="button"
              onClick={() => setCurrentTab('records')}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-lg transition-colors cursor-pointer relative ${
                currentTab === 'records'
                  ? 'text-[var(--brand-primary)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <FileText className="w-5 h-5 mb-0.5" aria-hidden="true" />
              <span className="text-[10px] leading-tight truncate w-full text-center">
                {language === 'hi' ? 'रिकॉर्ड' : 'Records'}
              </span>
              {currentTab === 'records' && (
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand-primary)] mt-0.5" />
              )}
            </button>
          </>
        )}

        {role === 'doctor' && (
          <>
            {/* 1. OPD Queue */}
            <button
              type="button"
              onClick={() => setCurrentTab('doctor')}
              className={`col-span-2 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors cursor-pointer ${
                currentTab === 'doctor'
                  ? 'text-[var(--brand-primary)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="relative">
                <Users className="w-5 h-5 mb-0.5" aria-hidden="true" />
                {activeAppointmentsCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 bg-[var(--brand-primary)] text-white text-[9px] font-bold rounded-full">
                    {activeAppointmentsCount}
                  </span>
                )}
              </div>
              <span className="text-[11px] leading-tight">
                {language === 'hi' ? 'ओपीडी कतार (OPD Queue)' : 'OPD Queue'}
              </span>
            </button>

            {/* 2. Hospital / Network Map */}
            <button
              type="button"
              onClick={() => setCurrentTab('map')}
              className={`col-span-2 flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors cursor-pointer ${
                currentTab === 'map'
                  ? 'text-[var(--brand-primary)] font-semibold'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <MapPin className="w-5 h-5 mb-0.5" aria-hidden="true" />
              <span className="text-[11px] leading-tight">
                {language === 'hi' ? 'अस्पताल नेटवर्क' : 'Facility Map'}
              </span>
            </button>

            {/* 3. Logout */}
            <button
              type="button"
              onClick={logout}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[var(--status-danger)] hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5 mb-0.5" aria-hidden="true" />
              <span className="text-[11px] leading-tight">
                {language === 'hi' ? 'निकास' : 'Sign Out'}
              </span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
