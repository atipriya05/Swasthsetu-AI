import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  HealthcareFacility,
  Prescription,
  VaccinationRecord,
  Appointment,
  AITriageReport
} from '../types';
import {
  MapPin,
  Phone,
  Calendar,
  FileText,
  ArrowRight,
  Stethoscope,
  Syringe,
  MessageSquareText,
  ExternalLink,
  Info,
  ClipboardList
} from 'lucide-react';

interface PatientDashboardProps {
  facilities: HealthcareFacility[];
  prescriptions: Prescription[];
  vaccinations: VaccinationRecord[];
  appointments: Appointment[];
  triageReports: AITriageReport[];
  onSelectFacility: (fac: HealthcareFacility) => void;
  onOpenReportGenerator: () => void;
  onOpenChatbot?: () => void;
  onNavigateToMap: () => void;
  onNavigateToRecords: () => void;
  onBookAppointment: (fac: HealthcareFacility) => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  facilities,
  prescriptions,
  vaccinations,
  appointments,
  onSelectFacility,
  onOpenReportGenerator,
  onOpenChatbot,
  onNavigateToMap,
  onNavigateToRecords,
  onBookAppointment
}) => {
  const { language, t } = useLanguage();
  const { patient, quickDemoLogin } = useAuth();

  const nearestFacility = facilities[0] || null;
  const recentPrescription = prescriptions[0] || null;
  const userAppointments = appointments.filter(
    (a) =>
      a.patientName === (patient?.name || 'Rameshwar Lal Patel') ||
      a.patientId === (patient?.id || 'pat-001') ||
      a.patientPhone === (patient?.mobile || '9876543210')
  );

  const getFacilityTypeLabel = (type: HealthcareFacility['type']) => {
    switch (type) {
      case 'GOVT_HOSPITAL':
        return t('govtHospital');
      case 'CHC':
        return t('chc');
      case 'PHC':
        return t('phc');
      default:
        return t('specialistClinic');
    }
  };

  const getDirectionsUrl = (fac: HealthcareFacility) =>
    `https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}`;

  return (
    <div className="space-y-8 py-4">
      {/* Patient Context & Portal Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border-default)] text-sm">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">
            {language === 'hi' ? patient?.nameHi || patient?.name : patient?.name || 'Rameshwar Lal Patel'}
          </span>
          <span aria-hidden="true" className="text-[var(--border-strong)]">·</span>
          <span className="font-mono text-xs tabular-nums">
            {t('abhaNumber')}: {patient?.abhaId || '91-4829-1029-4820'}
          </span>
          <span aria-hidden="true" className="text-[var(--border-strong)]">·</span>
          <span className="text-xs">
            {language === 'hi' ? patient?.villageHi : patient?.village}, {patient?.district}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-[var(--text-muted)]">{t('switchRole')}:</span>
          <div
            role="group"
            aria-label={t('switchRole')}
            className="inline-flex bg-[var(--bg-subtle)] p-0.5 rounded-md border border-[var(--border-default)]"
          >
            <button
              type="button"
              onClick={() => quickDemoLogin('patient')}
              aria-pressed="true"
              className="px-2.5 py-1 rounded text-xs font-semibold bg-white text-[var(--brand-primary)] shadow-2xs cursor-pointer"
            >
              {t('navPatientPortal')}
            </button>
            <button
              type="button"
              onClick={() => quickDemoLogin('doctor')}
              aria-pressed="false"
              className="px-2.5 py-1 rounded text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {t('navDoctorPortal')}
            </button>
          </div>
        </div>
      </div>

      {/* Formal Hero Section — Clear H1, One-Line Value Prop, Single Primary CTA */}
      <section
        aria-labelledby="hero-heading"
        className="bg-white rounded-xl border border-[var(--border-default)] p-5 sm:p-10 shadow-[var(--shadow-card)]"
      >
        <div className="max-w-3xl space-y-4">
          <p className="text-xs font-semibold text-[var(--brand-teal)]">
            {t('sihTag')} · {t('appSubtitle')}
          </p>
          <h1
            id="hero-heading"
            className="text-xl sm:text-4xl font-bold text-[var(--text-primary)] leading-tight"
          >
            {t('heroHeadline')}
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed max-w-2xl">
            {t('heroSubheadline')}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={onOpenChatbot || onOpenReportGenerator}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-md text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
            >
              <MessageSquareText className="w-4 h-4" aria-hidden="true" />
              <span>{t('heroPrimaryCta')}</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToMap}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 rounded-md text-sm font-semibold text-[var(--brand-primary)] bg-white border border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
            >
              <span>{t('heroSecondaryCta')}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      {/* Active OPD Token Notice (if scheduled) */}
      {userAppointments.length > 0 && (
        <section
          aria-label={t('activeTokenTitle')}
          className="bg-[var(--brand-primary-tint)] border border-[var(--brand-primary-border)] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-start sm:items-center gap-4">
            <div className="px-3.5 py-2 rounded-lg bg-[var(--brand-primary)] text-white text-center shrink-0">
              <div className="text-[11px] font-medium text-blue-100">
                {language === 'hi' ? 'टोकन' : 'Token'}
              </div>
              <div className="text-lg font-mono font-semibold tabular-nums leading-tight">
                #{userAppointments[0].tokenNumber}
              </div>
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-[var(--brand-primary)]">
                {t('activeTokenTitle')} · {t('statusWaiting')}
              </p>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                {language === 'hi' && userAppointments[0].facilityNameHi
                  ? userAppointments[0].facilityNameHi
                  : userAppointments[0].facilityName}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] tabular-nums">
                <span className="font-medium text-[var(--text-primary)]">
                  {userAppointments[0].patientName}
                  {userAppointments[0].relationship && userAppointments[0].relationship !== 'Self'
                    ? ` (${userAppointments[0].relationship})`
                    : ''}
                </span>{' '}
                · {userAppointments[0].doctorName} · {userAppointments[0].appointmentDate} ·{' '}
                {userAppointments[0].timeSlot}
              </p>
            </div>
          </div>

          <div className="text-sm text-[var(--text-secondary)] md:text-right shrink-0">
            <div className="font-semibold text-[var(--text-primary)]">
              {language === 'hi' ? 'ओपीडी कक्ष 3' : 'Outpatient Room 3'}
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              {language === 'hi' ? 'कृपया 10 मिनट पूर्व पहुंचें' : 'Please arrive 10 minutes prior'}
            </div>
          </div>
        </section>
      )}

      {/* Core Services Grid — 4 Aligned, Uniform Cards */}
      <section aria-labelledby="services-heading" className="space-y-4">
        <div>
          <h2 id="services-heading" className="text-xl font-semibold text-[var(--text-primary)]">
            {t('quickActionsTitle')}
          </h2>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {t('quickActionsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Symptom Checker */}
          <button
            type="button"
            onClick={onOpenReportGenerator}
            className="text-left bg-white rounded-xl p-5 border border-[var(--border-default)] hover:border-[var(--brand-primary)] shadow-[var(--shadow-card)] transition-colors cursor-pointer flex flex-col justify-between min-h-[176px] group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary-tint)] text-[var(--brand-primary)] flex items-center justify-center">
                <ClipboardList className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                  {t('actionAIAssistant')}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {t('actionAIAssistantDesc')}
                </p>
              </div>
            </div>
            <span className="mt-4 pt-3 border-t border-[var(--border-default)] inline-flex items-center justify-between text-xs font-semibold text-[var(--brand-primary)] w-full">
              <span>{t('generateReportBtn')}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </span>
          </button>

          {/* Card 2: Hospital & PHC Finder */}
          <button
            type="button"
            onClick={onNavigateToMap}
            className="text-left bg-white rounded-xl p-5 border border-[var(--border-default)] hover:border-[var(--brand-primary)] shadow-[var(--shadow-card)] transition-colors cursor-pointer flex flex-col justify-between min-h-[176px] group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--brand-teal-tint)] text-[var(--brand-teal)] flex items-center justify-center">
                <MapPin className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                  {t('actionFindDoctor')}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {t('actionFindDoctorDesc')}
                </p>
              </div>
            </div>
            <span className="mt-4 pt-3 border-t border-[var(--border-default)] inline-flex items-center justify-between text-xs font-semibold text-[var(--brand-primary)] w-full">
              <span>{t('navMap')}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </span>
          </button>

          {/* Card 3: OPD Appointment Booking */}
          <button
            type="button"
            onClick={() => nearestFacility && onBookAppointment(nearestFacility)}
            className="text-left bg-white rounded-xl p-5 border border-[var(--border-default)] hover:border-[var(--brand-primary)] shadow-[var(--shadow-card)] transition-colors cursor-pointer flex flex-col justify-between min-h-[176px] group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary-tint)] text-[var(--brand-primary)] flex items-center justify-center">
                <Calendar className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                  {t('actionBookAppointment')}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {t('actionBookAppointmentDesc')}
                </p>
              </div>
            </div>
            <span className="mt-4 pt-3 border-t border-[var(--border-default)] inline-flex items-center justify-between text-xs font-semibold text-[var(--brand-primary)] w-full">
              <span>{t('bookOpdToken')}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </span>
          </button>

          {/* Card 4: ABHA Health Records */}
          <button
            type="button"
            onClick={onNavigateToRecords}
            className="text-left bg-white rounded-xl p-5 border border-[var(--border-default)] hover:border-[var(--brand-primary)] shadow-[var(--shadow-card)] transition-colors cursor-pointer flex flex-col justify-between min-h-[176px] group"
          >
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] text-[var(--text-primary)] flex items-center justify-center">
                <FileText className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--brand-primary)] transition-colors">
                  {t('actionHealthRecords')}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">
                  {t('actionHealthRecordsDesc')}
                </p>
              </div>
            </div>
            <span className="mt-4 pt-3 border-t border-[var(--border-default)] inline-flex items-center justify-between text-xs font-semibold text-[var(--brand-primary)] w-full">
              <span>{t('navHealthRecords')}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </span>
          </button>
        </div>
      </section>

      {/* Restrained Seasonal Public Health Advisory */}
      <aside
        aria-label={language === 'hi' ? 'सार्वजनिक स्वास्थ्य सूचना' : 'Public health advisory'}
        className="bg-[var(--brand-teal-tint)] border border-[var(--brand-teal-border)] rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-[var(--brand-teal)] shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              {language === 'hi' ? 'सार्वजनिक स्वास्थ्य परामर्श' : 'Public Health Advisory'}
            </h2>
            <p className="text-sm text-[var(--text-secondary)]">
              {language === 'hi'
                ? 'मानसून के दौरान उबला और स्वच्छ पेयजल पीने से डायरिया और पीलिया जैसे जलजनित रोगों का जोखिम काफी कम होता है।'
                : 'Boiling drinking water during the monsoon season significantly reduces the risk of water-borne illnesses such as acute gastroenteritis and hepatitis.'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenReportGenerator}
          className="px-4 py-2 rounded-md text-xs font-semibold text-[var(--brand-teal)] bg-white border border-[var(--brand-teal-border)] hover:bg-teal-50 transition-colors whitespace-nowrap shrink-0 self-start sm:self-center cursor-pointer"
        >
          {t('heroPrimaryCta')}
        </button>
      </aside>

      {/* Main Two-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (7 cols): Nearby Public Healthcare Facilities */}
        <section aria-labelledby="nearby-facilities-heading" className="lg:col-span-7 space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <h2
                id="nearby-facilities-heading"
                className="text-xl font-semibold text-[var(--text-primary)]"
              >
                {t('nearestFacilities')}
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                {language === 'hi'
                  ? 'उपलब्ध चिकित्सक, बेड संख्या एवं संपर्क विवरण'
                  : 'Verified public facilities with distance, contact numbers, and directions'}
              </p>
            </div>
            <button
              type="button"
              onClick={onNavigateToMap}
              className="text-xs font-semibold text-[var(--brand-primary)] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t('viewAllOnMap')}
            </button>
          </div>

          <div className="space-y-3">
            {facilities.slice(0, 3).map((fac) => (
              <article
                key={fac.id}
                className="bg-white rounded-xl p-5 border border-[var(--border-default)] shadow-[var(--shadow-card)] space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)] tabular-nums">
                      <span className="font-semibold text-[var(--brand-primary)]">
                        {getFacilityTypeLabel(fac.type)}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{fac.distanceKm} km ({fac.travelTimeMins} {t('minutes')})</span>
                      {fac.emergencyAvailable && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-medium text-[var(--status-danger)]">
                            {t('emergencyService')}
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-base font-semibold text-[var(--text-primary)]">
                      {language === 'hi' ? fac.nameHi : fac.name}
                    </h3>

                    <p className="text-sm text-[var(--text-secondary)]">
                      {language === 'hi' ? fac.addressHi : fac.address}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[var(--text-secondary)] tabular-nums pt-3 border-t border-[var(--border-default)]">
                  <span className="inline-flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                    <span>{fac.doctorName} ({fac.specialty})</span>
                  </span>
                  <span>
                    {t('bedsAvailable')}:{' '}
                    <strong className="font-semibold text-[var(--text-primary)]">
                      {fac.bedsAvailable}/{fac.totalBeds}
                    </strong>
                  </span>
                  <a
                    href={`tel:${fac.contactNumber}`}
                    className="inline-flex items-center gap-1 text-[var(--brand-primary)] hover:underline font-medium"
                  >
                    <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{fac.contactNumber}</span>
                  </a>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onBookAppointment(fac)}
                    className="px-4 py-2 rounded-md text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
                  >
                    {t('bookOpdToken')}
                  </button>
                  <a
                    href={getDirectionsUrl(fac)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-[var(--text-primary)] bg-white border border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] transition-colors"
                  >
                    <span>{t('getDirections')}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onSelectFacility(fac)}
                    className="px-3 py-2 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
                  >
                    {t('details')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Right Column (5 cols): Recent Prescription & Immunization Summary */}
        <div className="lg:col-span-5 space-y-6">
          {/* Recent Prescription */}
          <section
            aria-labelledby="recent-rx-heading"
            className="bg-white rounded-xl p-5 border border-[var(--border-default)] shadow-[var(--shadow-card)] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-default)]">
              <h2 id="recent-rx-heading" className="text-base font-semibold text-[var(--text-primary)]">
                {t('recentPrescription')}
              </h2>
              <button
                type="button"
                onClick={onNavigateToRecords}
                className="text-xs font-semibold text-[var(--brand-primary)] hover:underline cursor-pointer"
              >
                {t('viewAll')}
              </button>
            </div>

            {recentPrescription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-[var(--text-muted)] tabular-nums">
                  <span>{recentPrescription.date}</span>
                  <span className="font-mono font-medium text-[var(--text-secondary)]">
                    {recentPrescription.id}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-medium text-[var(--text-muted)]">
                    {t('diagnosis')}
                  </div>
                  <div className="text-sm font-semibold text-[var(--text-primary)]">
                    {language === 'hi' && recentPrescription.diagnosisHi
                      ? recentPrescription.diagnosisHi
                      : recentPrescription.diagnosis}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)]">
                    {recentPrescription.doctorName} · {recentPrescription.facilityName}
                  </div>
                </div>

                <div className="space-y-2 pt-3 border-t border-[var(--border-default)]">
                  <div className="text-xs font-semibold text-[var(--text-secondary)]">
                    {t('rxMedicines')}
                  </div>
                  <ul className="divide-y divide-[var(--border-default)]">
                    {recentPrescription.medicines.slice(0, 2).map((med, idx) => (
                      <li key={med.id || idx} className="py-2 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <div className="font-medium text-[var(--text-primary)]">{med.name}</div>
                          <div className="text-[var(--text-muted)] mt-0.5">
                            {language === 'hi' ? med.frequencyHi || med.frequency : med.frequency}
                          </div>
                        </div>
                        <span className="font-medium text-[var(--text-secondary)] tabular-nums whitespace-nowrap">
                          {med.duration}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">{t('noPrescriptionsYet')}</p>
            )}
          </section>

          {/* Immunization Schedule */}
          <section
            aria-labelledby="vaccine-heading"
            className="bg-white rounded-xl p-5 border border-[var(--border-default)] shadow-[var(--shadow-card)] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border-default)]">
              <div className="flex items-center gap-2">
                <Syringe className="w-4 h-4 text-[var(--brand-teal)]" aria-hidden="true" />
                <h2 id="vaccine-heading" className="text-base font-semibold text-[var(--text-primary)]">
                  {t('vaccineSchedule')}
                </h2>
              </div>
              <span className="text-xs text-[var(--text-muted)]">UIP</span>
            </div>

            <ul className="divide-y divide-[var(--border-default)]">
              {vaccinations.slice(0, 3).map((vac) => (
                <li
                  key={vac.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3 text-sm"
                >
                  <div className="space-y-0.5">
                    <div className="font-medium text-[var(--text-primary)]">
                      {language === 'hi' && vac.vaccineNameHi ? vac.vaccineNameHi : vac.vaccineName}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] tabular-nums">
                      {vac.dose} · {vac.dueDate || vac.dateAdministered}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap ${
                      vac.status === 'COMPLETED'
                        ? 'bg-[var(--status-success-bg)] text-[var(--status-success)]'
                        : 'bg-[var(--status-warning-bg)] text-[var(--status-warning)]'
                    }`}
                  >
                    {vac.status === 'COMPLETED' ? t('vaccineGiven') : t('vaccineDue')}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
