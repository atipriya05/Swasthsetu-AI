import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../context/OfflineSyncContext';
import { PhoneCall, Menu, X, WifiOff, RefreshCw, LogOut } from 'lucide-react';

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
  const { role, logout } = useAuth();
  const { isOffline, syncNow, isSyncing, queue } = useOfflineSync();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[var(--border-default)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-6">
          {/* Zone 1: Brand Wordmark (single line, clean emblem) */}
          <button
            type="button"
            onClick={() => setCurrentTab(role === 'doctor' ? 'doctor' : 'dashboard')}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 cursor-pointer rounded-md focus-visible:outline-2 focus-visible:outline-[var(--brand-primary)]"
            aria-label={t('appName')}
          >
            <span
              className="w-8 h-8 rounded-md bg-[var(--brand-primary)] text-white flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <svg
                width="18"
                height="18"
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
            <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              SwasthSetu <span className="text-[var(--brand-primary)]">AI</span>
            </span>
          </button>

          {/* Zone 2: Clean Single-Line Navigation Links (Desktop) */}
          <nav
            aria-label="Primary navigation"
            className="hidden lg:flex items-center gap-7"
          >
            {role === 'patient' && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentTab('dashboard')}
                  className={`py-2 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                    currentTab === 'dashboard'
                      ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {t('navHome')}
                </button>

                {openChatbot && (
                  <button
                    type="button"
                    onClick={openChatbot}
                    className="py-2 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 border-transparent text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
                  >
                    {t('navAIHealth')}
                  </button>
                )}

                <button
                  type="button"
                  onClick={openReportGenerator}
                  className="py-2 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 border-transparent text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
                >
                  {t('navClinicalReport')}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab('map')}
                  className={`py-2 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                    currentTab === 'map'
                      ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {t('navMap')}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab('records')}
                  className={`py-2 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                    currentTab === 'records'
                      ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {t('navHealthRecords')}
                </button>
              </>
            )}

            {role === 'doctor' && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentTab('doctor')}
                  className={`py-2 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                    currentTab === 'doctor'
                      ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {t('navDoctorPortal')}
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentTab('map')}
                  className={`py-2 text-sm font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                    currentTab === 'map'
                      ? 'border-[var(--brand-primary)] text-[var(--brand-primary)] font-semibold'
                      : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {t('navMap')}
                </button>
              </>
            )}

            {!role && (
              <button
                type="button"
                onClick={() => setCurrentTab('login')}
                className="py-2 text-sm font-semibold whitespace-nowrap shrink-0 border-b-2 border-[var(--brand-primary)] text-[var(--brand-primary)] cursor-pointer"
              >
                {t('loginTitle')}
              </button>
            )}
          </nav>

          {/* Zone 3: Language Switcher & Primary Emergency Action */}
          <div className="flex items-center gap-3 shrink-0">
            {isOffline && (
              <button
                type="button"
                onClick={syncNow}
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning-border)] cursor-pointer whitespace-nowrap"
                title="Offline mode active — click to synchronize queued items"
              >
                <WifiOff className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Offline{queue.length > 0 ? ` (${queue.length})` : ''}</span>
                {queue.length > 0 && (
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} aria-hidden="true" />
                )}
              </button>
            )}

            {/* English / Hindi Language Selector */}
            <div
              role="group"
              aria-label="Language selection"
              className="inline-flex items-center bg-[var(--bg-subtle)] p-0.5 rounded-md border border-[var(--border-default)] shrink-0"
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                aria-pressed={language === 'en'}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  language === 'en'
                    ? 'bg-white text-[var(--brand-primary)] shadow-2xs font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                aria-pressed={language === 'hi'}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  language === 'hi'
                    ? 'bg-white text-[var(--brand-primary)] shadow-2xs font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                हिंदी
              </button>
            </div>

            {/* Emergency 108 Action */}
            <button
              type="button"
              onClick={openEmergencyModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-white bg-[var(--status-danger)] hover:bg-[var(--status-danger-hover)] transition-colors cursor-pointer whitespace-nowrap shrink-0"
              aria-label={t('emergencySOS')}
            >
              <PhoneCall className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span>{t('emergencySOS')}</span>
            </button>

            {/* Sign out icon button (desktop) */}
            {role && (
              <button
                type="button"
                onClick={logout}
                className="hidden lg:inline-flex items-center justify-center w-9 h-9 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                aria-label={t('logout')}
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
              </button>
            )}

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Collapsible Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden bg-white border-t border-[var(--border-default)] px-4 py-3 space-y-1 shadow-sm"
        >
          {role === 'patient' && (
            <>
              <button
                type="button"
                onClick={() => handleNavClick(() => setCurrentTab('dashboard'))}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'dashboard'
                    ? 'bg-[var(--brand-primary-tint)] text-[var(--brand-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {t('navHome')}
              </button>
              {openChatbot && (
                <button
                  type="button"
                  onClick={() => handleNavClick(openChatbot)}
                  className="w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                >
                  {t('navAIHealth')}
                </button>
              )}
              <button
                type="button"
                onClick={() => handleNavClick(openReportGenerator)}
                className="w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
              >
                {t('navClinicalReport')}
              </button>
              <button
                type="button"
                onClick={() => handleNavClick(() => setCurrentTab('map'))}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'map'
                    ? 'bg-[var(--brand-primary-tint)] text-[var(--brand-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {t('navMap')}
              </button>
              <button
                type="button"
                onClick={() => handleNavClick(() => setCurrentTab('records'))}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'records'
                    ? 'bg-[var(--brand-primary-tint)] text-[var(--brand-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {t('navHealthRecords')}
              </button>
            </>
          )}

          {role === 'doctor' && (
            <>
              <button
                type="button"
                onClick={() => handleNavClick(() => setCurrentTab('doctor'))}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'doctor'
                    ? 'bg-[var(--brand-primary-tint)] text-[var(--brand-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {t('navDoctorPortal')}
              </button>
              <button
                type="button"
                onClick={() => handleNavClick(() => setCurrentTab('map'))}
                className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  currentTab === 'map'
                    ? 'bg-[var(--brand-primary-tint)] text-[var(--brand-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                {t('navMap')}
              </button>
            </>
          )}

          {role && (
            <div className="pt-2 mt-2 border-t border-[var(--border-default)]">
              <button
                type="button"
                onClick={() => handleNavClick(logout)}
                className="w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] transition-colors cursor-pointer"
              >
                {t('logout')}
              </button>
            </div>
          )}
        </nav>
      )}
    </header>
  );
};
