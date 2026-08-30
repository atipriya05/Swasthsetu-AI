import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { HealthcareFacility } from '../types';
import { 
  Building2, 
  Phone, 
  MapPin, 
  Clock, 
  Stethoscope, 
  Bed, 
  Navigation, 
  Filter, 
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface SmartMapProps {
  facilities: HealthcareFacility[];
  selectedFacility: HealthcareFacility | null;
  onSelectFacility: (fac: HealthcareFacility) => void;
  onBookAppointment: (fac: HealthcareFacility) => void;
}

export const SmartMap: React.FC<SmartMapProps> = ({
  facilities,
  selectedFacility,
  onSelectFacility,
  onBookAppointment
}) => {
  const { language, t } = useLanguage();

  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFacility, setActiveFacility] = useState<HealthcareFacility>(selectedFacility || facilities[0]);

  const filteredFacilities = facilities.filter(fac => {
    const matchesType = filterType === 'ALL' || fac.type === filterType;
    const matchesSearch = fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fac.nameHi.includes(searchQuery) ||
                          fac.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          fac.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-[#DEE9F7] text-[#1A5FB4] text-xs font-bold px-3 py-1 rounded-full mb-2 border border-blue-200">
            <MapPin className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'आयुष्मान भारत स्वास्थ्य केंद्र ट्रैकर' : 'Ayushman Bharat Healthcare Map'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1A1A1B] tracking-tight">
            {t('mapViewTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {t('mapViewSubtitle')}
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F0F5F9] p-1.5 rounded-full border border-gray-200">
          {['ALL', 'PHC', 'CHC', 'SubCenter', 'DH'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                filterType === type
                  ? 'bg-white text-[#1A5FB4] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {type === 'ALL' ? t('filterAll') : type}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left interactive Map Canvas + Right Facility Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Interactive GPS Map Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          
          {/* Top Map Control bar */}
          <div className="p-4 bg-[#F0F5F9] border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#26A269] animate-pulse" />
              <span>{language === 'hi' ? 'सीतापुर जिला स्वास्थ्य केंद्र (उ.प्र.)' : 'Sitapur District Health Facilities (UP)'}</span>
            </div>
            <span className="text-[11px] text-gray-500 font-mono">
              GPS: 27.5684° N, 80.6829° E
            </span>
          </div>

          {/* Map Surface Representation with Real Interactive Facility Pins */}
          <div className="relative h-[360px] sm:h-[440px] bg-slate-100 flex items-center justify-center overflow-hidden">
            {/* Grid Pattern */}
            <div 
              className="absolute inset-0 opacity-40" 
              style={{
                backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                backgroundSize: '24px 24px'
              }}
            />

            {/* Roads & Rivers Vector Graphics simulation */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-50">
              <path d="M 0 120 Q 200 180 500 130 T 900 250" fill="none" stroke="#60A5FA" strokeWidth="4" />
              <path d="M 150 0 L 250 450" fill="none" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="6 4" />
              <path d="M 450 0 L 400 450" fill="none" stroke="#CBD5E1" strokeWidth="3" strokeDasharray="6 4" />
            </svg>

            {/* Current Patient User Pin (Rampur Village) */}
            <div className="absolute top-1/2 left-1/3 transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <div className="bg-[#1A5FB4] text-white p-2 rounded-full shadow-lg ring-4 ring-blue-200 animate-bounce">
                <Navigation className="w-5 h-5 fill-white rotate-45" />
              </div>
              <div className="bg-[#1A1A1B] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md mt-1">
                {language === 'hi' ? 'आप (रामपुर गांव)' : 'You (Rampur)'}
              </div>
            </div>

            {/* Facility Pins positioned over map */}
            {filteredFacilities.map((fac, idx) => {
              const isSelected = activeFacility?.id === fac.id;
              // Deterministic positions based on index
              const positions = [
                { top: '35%', left: '55%' },
                { top: '65%', left: '60%' },
                { top: '25%', left: '20%' },
                { top: '70%', left: '25%' },
                { top: '80%', left: '75%' }
              ];
              const pos = positions[idx % positions.length];

              return (
                <button
                  key={fac.id}
                  onClick={() => {
                    setActiveFacility(fac);
                    onSelectFacility(fac);
                  }}
                  style={{ top: pos.top, left: pos.left }}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center group transition-all cursor-pointer ${
                    isSelected ? 'scale-125 z-40' : 'hover:scale-110'
                  }`}
                >
                  <div className={`p-2 rounded-xl shadow-md border-2 transition-all flex items-center justify-center ${
                    isSelected
                      ? 'bg-[#1A5FB4] text-white border-white ring-4 ring-blue-300'
                      : 'bg-white text-[#1A5FB4] border-gray-200 group-hover:border-[#1A5FB4]'
                  }`}>
                    <Building2 className="w-4 h-4" />
                  </div>

                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs mt-1 whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#1A5FB4] text-white'
                      : 'bg-white/95 text-gray-800 border border-gray-200'
                  }`}>
                    {language === 'hi' ? fac.nameHi : fac.name} ({fac.distanceKm} km)
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Facility Quick Card at bottom of map */}
          {activeFacility && (
            <div className="p-4 bg-white border-t border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-[#DEE9F7] text-[#1A5FB4]">
                    {activeFacility.type}
                  </span>
                  <span className="text-xs font-bold text-gray-500">
                    📍 {activeFacility.distanceKm} {language === 'hi' ? 'किमी दूर' : 'km away'}
                  </span>
                  <span className="text-xs font-bold text-[#26A269]">
                    🛏️ {activeFacility.availableBeds} {language === 'hi' ? 'बेड उपलब्ध' : 'beds free'}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[#1A1A1B] mt-1">
                  {language === 'hi' ? activeFacility.nameHi : activeFacility.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {language === 'hi' ? 'डॉक्टर:' : 'Doctor:'} <strong>{activeFacility.doctorName}</strong> ({activeFacility.specialty}) • {activeFacility.timing}
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => onBookAppointment(activeFacility)}
                  className="flex-1 sm:flex-none bg-[#1A5FB4] hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors cursor-pointer"
                >
                  {t('bookOpdToken')}
                </button>
                <a
                  href={`tel:${activeFacility.phone}`}
                  className="bg-emerald-50 hover:bg-emerald-100 text-[#26A269] font-bold p-2 rounded-xl border border-emerald-200"
                  title="Call Facility"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Searchable List of Facilities (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Search Box */}
          <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchFacilitiesPlaceholder')}
              className="w-full px-4 py-2.5 bg-[#F0F5F9] border border-gray-200 rounded-xl text-sm text-[#1A1A1B] placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-[#1A5FB4] outline-hidden"
            />
          </div>

          {/* Facilities List */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {filteredFacilities.map((fac) => {
              const isSelected = activeFacility?.id === fac.id;
              return (
                <div
                  key={fac.id}
                  onClick={() => {
                    setActiveFacility(fac);
                    onSelectFacility(fac);
                  }}
                  className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer shadow-sm ${
                    isSelected
                      ? 'border-[#1A5FB4] ring-2 ring-blue-100'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#DEE9F7] text-[#1A5FB4]">
                          {fac.type}
                        </span>
                        <span className="text-xs font-bold text-gray-500">
                          {fac.distanceKm} km
                        </span>
                      </div>
                      <h3 className="font-bold text-sm text-[#1A1A1B]">
                        {language === 'hi' ? fac.nameHi : fac.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {fac.village}, Sitapur
                      </p>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      fac.doctorStatus === 'Available'
                        ? 'bg-emerald-100 text-[#26A269]'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {fac.doctorStatus === 'Available' ? 'Doctor In' : 'On Rounds'}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-gray-500">
                      <span className="text-[#26A269] font-bold">
                        🛏️ {fac.availableBeds}/{fac.totalBeds} Beds
                      </span>
                      <span>⏱️ {fac.currentWaitTimeMin}m Wait</span>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookAppointment(fac);
                      }}
                      className="text-[#1A5FB4] font-bold hover:underline"
                    >
                      {t('bookOpdToken')} →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
};
