import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { PhoneCall, X, ShieldAlert, Navigation, Siren, CheckCircle2 } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const [sosSent, setSosSent] = useState(false);

  if (!isOpen) return null;

  const handleBroadcastSOS = () => {
    setSosSent(true);
    setTimeout(() => {
      // Keep state
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-gray-200">
        
        {/* Modal Header */}
        <div className="bg-[#E01B24] p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2 ring-4 ring-white/20 animate-bounce">
            <Siren className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            {t('emergencyModalTitle')}
          </h2>
          <p className="text-red-100 text-xs sm:text-sm mt-0.5">
            {t('sosDesc')}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-3">
          
          {/* Main 108 Ambulance Call Button */}
          <a
            href="tel:108"
            className="w-full bg-[#E01B24] hover:bg-[#c0171e] text-white p-4 rounded-xl flex items-center justify-between font-bold text-base shadow-xs transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PhoneCall className="w-5 h-5 fill-white" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold">{t('call108')}</div>
                <div className="text-xs text-red-100 font-normal">
                  {language === 'hi' ? '24x7 निःशुल्क सरकारी एम्बुलेंस सेवा' : '24x7 Free Govt Emergency Ambulance'}
                </div>
              </div>
            </div>
            <span className="bg-white text-[#E01B24] px-3 py-1 rounded-lg font-mono text-base font-bold">
              108
            </span>
          </a>

          {/* 104 National Health Helpline */}
          <a
            href="tel:104"
            className="w-full bg-[#1A5FB4] hover:bg-blue-700 text-white p-3.5 rounded-xl flex items-center justify-between font-bold text-sm shadow-xs transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">{t('call104')}</div>
                <div className="text-xs text-blue-100 font-normal">
                  {language === 'hi' ? 'चिकित्सकीय सलाह व स्वास्थ्य मार्गदर्शन' : 'Doctor Medical Advisory & Helpline'}
                </div>
              </div>
            </div>
            <span className="bg-white text-[#1A5FB4] px-2.5 py-0.5 rounded-md font-mono text-sm font-bold">
              104
            </span>
          </a>

          {/* Direct Call Nearest PHC Sitapur */}
          <a
            href="tel:+915862248100"
            className="w-full bg-[#26A269] hover:bg-emerald-700 text-white p-3 rounded-xl flex items-center justify-between font-bold text-xs shadow-xs transition-all"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                <Navigation className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="font-bold">{t('callNearestPHC')}</div>
                <div className="text-[11px] text-emerald-100">
                  Sitapur PHC Emergency (2.1 km)
                </div>
              </div>
            </div>
            <span className="text-xs font-mono bg-emerald-800 px-2 py-0.5 rounded-md">
              05862-248100
            </span>
          </a>

          {/* Live GPS Broadcast Simulation */}
          <div className="bg-[#F0F5F9] border border-gray-200 rounded-xl p-3.5 text-center mt-2">
            {sosSent ? (
              <div className="text-[#26A269] font-bold flex items-center justify-center gap-2 text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#26A269]" />
                {language === 'hi'
                  ? 'आपातकालीन संदेश व GPS (27.5684° N, 80.6829° E) 108 कंट्रोल रूम को भेजा गया!'
                  : 'Emergency Alert & GPS (27.5684° N, 80.6829° E) sent to 108 Control Room!'}
              </div>
            ) : (
              <button
                onClick={handleBroadcastSOS}
                className="w-full bg-[#1A1A1B] hover:bg-black text-white font-bold py-2.5 rounded-lg text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-amber-400" />
                {language === 'hi'
                  ? '📍 मेरा जीपीएस स्थान 108 एम्बुलेंस को भेजें'
                  : '📍 Broadcast My GPS Coordinates to 108'}
              </button>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs"
          >
            {t('close')}
          </button>
        </div>

      </div>
    </div>
  );
};
