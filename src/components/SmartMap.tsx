import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { HealthcareFacility, FacilityType } from '../types';
import {
  Building2,
  Phone,
  MapPin,
  Clock,
  Stethoscope,
  Navigation,
  ExternalLink,
  Search
} from 'lucide-react';

interface SmartMapProps {
  facilities: HealthcareFacility[];
  selectedFacility: HealthcareFacility | null;
  onSelectFacility: (fac: HealthcareFacility) => void;
  onBookAppointment: (fac: HealthcareFacility) => void;
}

const FILTER_OPTIONS: Array<{ value: 'ALL' | FacilityType; labelKey: 'filterAll' | 'phc' | 'chc' | 'govtHospital' }> = [
  { value: 'ALL', labelKey: 'filterAll' },
  { value: 'PHC', labelKey: 'phc' },
  { value: 'CHC', labelKey: 'chc' },
  { value: 'GOVT_HOSPITAL', labelKey: 'govtHospital' }
];

export const SmartMap: React.FC<SmartMapProps> = ({
  facilities,
  selectedFacility,
  onSelectFacility,
  onBookAppointment
}) => {
  const { language, t } = useLanguage();

  const [filterType, setFilterType] = useState<'ALL' | FacilityType>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFacility, setActiveFacility] = useState<HealthcareFacility>(
    selectedFacility || facilities[0]
  );
  const [directionsFacilityId, setDirectionsFacilityId] = useState<string | null>(null);

  const filteredFacilities = facilities.filter((fac) => {
    const matchesType = filterType === 'ALL' || fac.type === filterType;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      fac.name.toLowerCase().includes(q) ||
      fac.nameHi.toLowerCase().includes(q) ||
      fac.address.toLowerCase().includes(q) ||
      fac.addressHi.toLowerCase().includes(q) ||
      fac.doctorName.toLowerCase().includes(q) ||
      fac.specialty.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  const getTypeLabel = (type: FacilityType) => {
    if (type === 'GOVT_HOSPITAL') return t('govtHospital');
    if (type === 'CHC') return t('chc');
    if (type === 'PHC') return t('phc');
    return t('specialistClinic');
  };

  const getDirectionsUrl = (fac: HealthcareFacility) =>
    `https://www.google.com/maps/dir/?api=1&destination=${fac.lat},${fac.lng}`;

  const pinPositions = [
    { top: '36%', left: '58%' },
    { top: '62%', left: '66%' },
    { top: '26%', left: '24%' },
    { top: '70%', left: '28%' }
  ];

  return (
    <div className="space-y-6 py-4">
      {/* Page Header & Filters */}
      <div className="bg-white rounded-xl p-6 border border-[var(--border-default)] shadow-[var(--shadow-card)] space-y-5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-[var(--text-primary)]">
              {t('mapViewTitle')}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              {t('mapViewSubtitle')}
            </p>
          </div>

          <div
            role="group"
            aria-label={language === 'hi' ? 'स्वास्थ्य केंद्र प्रकार फ़िल्टर' : 'Filter by facility type'}
            className="inline-flex flex-wrap items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-lg border border-[var(--border-default)]"
          >
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFilterType(opt.value)}
                aria-pressed={filterType === opt.value}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  filterType === opt.value
                    ? 'bg-white text-[var(--brand-primary)] font-semibold shadow-2xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Accessible Search Input */}
        <div className="max-w-md">
          <label htmlFor="facility-search" className="sr-only">
            {t('searchFacilitiesPlaceholder')}
          </label>
          <div className="relative">
            <Search
              className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="facility-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchFacilitiesPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:bg-white focus:border-[var(--brand-primary)] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Main Split: Facility Directory List + Interactive Location Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Tidy Hospital Finder Cards (6 cols) */}
        <section
          aria-label={t('mapTitle')}
          className="lg:col-span-6 space-y-3"
        >
          {filteredFacilities.length === 0 ? (
            <div className="bg-white rounded-xl p-8 border border-[var(--border-default)] text-center space-y-2">
              <p className="text-sm font-medium text-[var(--text-primary)]">
                {language === 'hi'
                  ? 'आपकी खोज से मेल खाने वाला कोई स्वास्थ्य केंद्र नहीं मिला।'
                  : 'No healthcare facilities match your current filter.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilterType('ALL');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-[var(--brand-primary)] hover:underline cursor-pointer"
              >
                {language === 'hi' ? 'फ़िल्टर रीसेट करें' : 'Reset filters'}
              </button>
            </div>
          ) : (
            filteredFacilities.map((fac) => {
              const isSelected = activeFacility?.id === fac.id;
              const isShowingRoute = directionsFacilityId === fac.id;

              return (
                <article
                  key={fac.id}
                  onClick={() => {
                    setActiveFacility(fac);
                    onSelectFacility(fac);
                  }}
                  className={`bg-white rounded-xl p-5 border transition-colors cursor-pointer shadow-[var(--shadow-card)] space-y-3.5 ${
                    isSelected
                      ? 'border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]'
                      : 'border-[var(--border-default)] hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-muted)] tabular-nums">
                        <span className="font-semibold text-[var(--brand-primary)]">
                          {getTypeLabel(fac.type)}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          {fac.distanceKm} km ({fac.travelTimeMins} {t('minutes')})
                        </span>
                        {fac.emergencyAvailable && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-medium text-[var(--status-danger)]">
                              24x7 Emergency
                            </span>
                          </>
                        )}
                      </div>
                      <h2 className="text-base font-semibold text-[var(--text-primary)]">
                        {language === 'hi' ? fac.nameHi : fac.name}
                      </h2>
                      <p className="text-sm text-[var(--text-secondary)]">
                        {language === 'hi' ? fac.addressHi : fac.address}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 border-t border-[var(--border-default)] text-xs text-[var(--text-secondary)] tabular-nums">
                    <div className="flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                      <span className="truncate">{fac.doctorName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                      <span className="truncate">
                        {language === 'hi' ? fac.opdTimingsHi : fac.opdTimings}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                      <a
                        href={`tel:${fac.contactNumber}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[var(--brand-primary)] font-medium hover:underline"
                      >
                        {fac.contactNumber}
                      </a>
                    </div>
                    <div>
                      {t('bedsAvailable')}:{' '}
                      <strong className="font-semibold text-[var(--text-primary)]">
                        {fac.bedsAvailable}/{fac.totalBeds}
                      </strong>
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookAppointment(fac);
                      }}
                      className="px-4 py-2 rounded-md text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
                    >
                      {t('bookOpdToken')}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveFacility(fac);
                        setDirectionsFacilityId(isShowingRoute ? null : fac.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-[var(--text-primary)] bg-white border border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
                    >
                      <Navigation className="w-3.5 h-3.5 text-[var(--brand-primary)]" aria-hidden="true" />
                      <span>{t('getDirections')}</span>
                    </button>

                    <a
                      href={`tel:${fac.contactNumber}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--brand-primary)] transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{t('callFacility')}</span>
                    </a>
                  </div>

                  {/* Expandable Route Summary + External Maps Link */}
                  {isShowingRoute && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2 p-3.5 rounded-lg bg-[var(--bg-canvas)] border border-[var(--border-default)] space-y-2 text-xs text-[var(--text-secondary)]"
                    >
                      <div className="font-semibold text-[var(--text-primary)]">
                        {language === 'hi' ? 'मार्ग विवरण (रामपुर से)' : 'Route Summary from Rampur Village'}
                      </div>
                      <p className="tabular-nums">
                        {language === 'hi'
                          ? `अनुमानित दूरी: ${fac.distanceKm} किमी · सड़क मार्ग समय: लगभग ${fac.travelTimeMins} मिनट · निर्देशांक: ${fac.lat.toFixed(4)}° N, ${fac.lng.toFixed(4)}° E`
                          : `Estimated distance: ${fac.distanceKm} km · Road travel time: approx. ${fac.travelTimeMins} min · Coordinates: ${fac.lat.toFixed(4)}° N, ${fac.lng.toFixed(4)}° E`}
                      </p>
                      <a
                        href={getDirectionsUrl(fac)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-semibold text-[var(--brand-primary)] hover:underline"
                      >
                        <span>
                          {language === 'hi'
                            ? 'Google Maps में मार्ग खोलें'
                            : 'Open turn-by-turn directions in Google Maps'}
                        </span>
                        <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>

        {/* Right: District Facility Map Overview (6 cols) */}
        <aside
          aria-label={language === 'hi' ? 'स्वास्थ्य केंद्र मानचित्र' : 'Facility location map'}
          className="lg:col-span-6 bg-white rounded-xl border border-[var(--border-default)] shadow-[var(--shadow-card)] overflow-hidden lg:sticky lg:top-24"
        >
          <div className="px-5 py-3.5 bg-[var(--bg-canvas)] border-b border-[var(--border-default)] flex items-center justify-between gap-2 text-xs">
            <span className="font-semibold text-[var(--text-primary)]">
              {language === 'hi'
                ? 'सीतापुर जिला स्वास्थ्य केंद्र मानचित्र'
                : 'Sitapur District Public Health Network'}
            </span>
            <span className="font-mono text-[var(--text-muted)] tabular-nums">
              27.5684° N, 80.6829° E
            </span>
          </div>

          {/* Clean Cartographic Map Surface */}
          <div className="relative h-[340px] sm:h-[400px] bg-slate-100 overflow-hidden">
            <div
              className="absolute inset-0 opacity-35"
              style={{
                backgroundImage: 'radial-gradient(#94A3B8 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
              <path
                d="M 0 130 Q 180 175 440 135 T 760 220"
                fill="none"
                stroke="#93C5FD"
                strokeWidth="3"
              />
              <path
                d="M 140 0 L 220 420"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              <path
                d="M 410 0 L 365 420"
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
            </svg>

            {/* Reference User Location Marker */}
            <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-sm border-2 border-white">
                <MapPin className="w-4 h-4" aria-hidden="true" />
              </div>
              <span className="mt-1 px-2 py-0.5 rounded bg-[var(--text-primary)] text-white text-[11px] font-medium whitespace-nowrap">
                {language === 'hi' ? 'आपका स्थान (रामपुर)' : 'Your Location (Rampur)'}
              </span>
            </div>

            {/* Facility Markers */}
            {filteredFacilities.map((fac, idx) => {
              const isSelected = activeFacility?.id === fac.id;
              const pos = pinPositions[idx % pinPositions.length];

              return (
                <button
                  key={fac.id}
                  type="button"
                  onClick={() => {
                    setActiveFacility(fac);
                    onSelectFacility(fac);
                  }}
                  style={{ top: pos.top, left: pos.left }}
                  aria-label={`${fac.name}, ${fac.distanceKm} km`}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer transition-transform ${
                    isSelected ? 'z-30 scale-105' : 'z-20 hover:scale-105'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-lg flex items-center justify-center border shadow-xs ${
                      isSelected
                        ? 'bg-[var(--brand-teal)] text-white border-white'
                        : 'bg-white text-[var(--brand-primary)] border-[var(--border-strong)]'
                    }`}
                  >
                    <Building2 className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <span
                    className={`mt-1 px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap shadow-xs border ${
                      isSelected
                        ? 'bg-[var(--brand-teal)] text-white border-[var(--brand-teal)]'
                        : 'bg-white text-[var(--text-primary)] border-[var(--border-default)]'
                    }`}
                  >
                    {fac.type === 'GOVT_HOSPITAL' ? 'District Hosp' : fac.type} · {fac.distanceKm} km
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected Facility Summary Panel */}
          {activeFacility && (
            <div className="p-5 border-t border-[var(--border-default)] space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[var(--brand-primary)]">
                    {getTypeLabel(activeFacility.type)} · {activeFacility.distanceKm} km
                  </p>
                  <h3 className="text-base font-semibold text-[var(--text-primary)] mt-0.5">
                    {language === 'hi' ? activeFacility.nameHi : activeFacility.name}
                  </h3>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                    {language === 'hi' ? activeFacility.addressHi : activeFacility.address}
                  </p>
                </div>
              </div>

              <div className="text-xs text-[var(--text-secondary)] space-y-1">
                <div>
                  <span className="text-[var(--text-muted)]">{t('doctorAssigned')}:</span>{' '}
                  <strong className="font-medium text-[var(--text-primary)]">
                    {activeFacility.doctorName}
                  </strong>{' '}
                  ({activeFacility.specialty})
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">{t('opdHours')}:</span>{' '}
                  {language === 'hi' ? activeFacility.opdTimingsHi : activeFacility.opdTimings}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => onBookAppointment(activeFacility)}
                  className="px-4 py-2 rounded-md text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
                >
                  {t('bookOpdToken')}
                </button>
                <a
                  href={getDirectionsUrl(activeFacility)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs font-semibold text-[var(--text-primary)] bg-white border border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] transition-colors"
                >
                  <span>{t('getDirections')}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--text-muted)]" aria-hidden="true" />
                </a>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};
