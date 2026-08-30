import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../context/OfflineSyncContext';
import { HealthcareFacility, Appointment } from '../types';
import { User, CheckCircle2, X, Stethoscope, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AppointmentModalProps {
  facility: HealthcareFacility | null;
  isOpen: boolean;
  onClose: () => void;
  onAppointmentBooked: (newApt: Appointment) => void;
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  facility,
  isOpen,
  onClose,
  onAppointmentBooked
}) => {
  const { language, t } = useLanguage();
  const { patient } = useAuth();
  const { isOffline, addToQueue } = useOfflineSync();

  const [chiefComplaint, setChiefComplaint] = useState(
    language === 'hi' ? 'तेज बुखार व बदन दर्द (3 दिन)' : 'High fever and body ache (3 days)'
  );
  const [preferredSlot, setPreferredSlot] = useState('10:00 AM - 11:00 AM');
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setChiefComplaint(
      language === 'hi' ? 'तेज बुखार व बदन दर्द (3 दिन)' : 'High fever and body ache (3 days)'
    );
  }, [language]);

  if (!isOpen || !facility) return null;

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      patientName: patient?.name || 'Rameshwar Lal Sharma',
      patientAge: patient?.age || 58,
      patientPhone: patient?.mobile || '9876543210',
      facilityId: facility.id,
      facilityName: facility.name,
      doctorId: 'doc-001',
      doctorName: facility.doctorName,
      specialty: facility.specialty,
      chiefComplaint,
      riskLevel: 'Yellow' as const
    };

    if (isOffline) {
      const localApt: Appointment = {
        id: `apt-offline-${Date.now()}`,
        tokenNumber: Math.floor(Math.random() * 40) + 1,
        patientId: patient?.id || 'pat-001',
        estimatedWaitMinutes: 15,
        ...payload,
        appointmentDate: new Date().toISOString().split('T')[0],
        timeSlot: preferredSlot,
        status: 'WAITING'
      };

      addToQueue('appointment', payload);
      setBookedAppointment(localApt);
      onAppointmentBooked(localApt);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (data.appointment) {
        setBookedAppointment(data.appointment);
        onAppointmentBooked(data.appointment);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-xl border border-gray-200">
        
        {/* Header in Clean Minimalism format */}
        <div className="bg-white border-b border-gray-200 p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 bg-[#DEE9F7] text-[#1A5FB4] text-xs font-bold px-2.5 py-0.5 rounded-full mb-2">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>National Health Mission (NHM)</span>
          </div>

          <h3 className="text-xl font-bold text-[#1A1A1B] tracking-tight">
            {t('bookAppointmentBtn')}
          </h3>
          <p className="text-gray-500 text-xs mt-0.5">
            {language === 'hi' ? facility.nameHi : facility.name}
          </p>
        </div>

        {/* Modal Body */}
        {bookedAppointment ? (
          <div className="p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 bg-emerald-100 text-[#26A269] rounded-full flex items-center justify-center mx-auto ring-4 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h4 className="text-xl font-bold text-[#1A1A1B]">
              {language === 'hi' ? 'ओपीडी टोकन सफलतापूर्वक बुक हुआ!' : 'OPD Token Confirmed!'}
            </h4>

            <div className="bg-[#F0F5F9] border-2 border-dashed border-[#26A269] rounded-2xl p-5 space-y-2">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                {t('tokenNumber')}
              </span>
              <div className="text-4xl font-mono font-bold text-[#26A269]">
                #{bookedAppointment.tokenNumber}
              </div>
              <div className="text-xs font-bold text-gray-800">
                {bookedAppointment.patientName} • {facility.doctorName}
              </div>
              <div className="text-xs text-gray-500">
                {bookedAppointment.appointmentDate} ({bookedAppointment.timeSlot})
              </div>
            </div>

            <p className="text-xs text-gray-600">
              {language === 'hi'
                ? 'कृपया समय से 10 मिनट पूर्व सीतापुर PHC के ओपीडी काउंटर पर पहुंचें। यह टोकन डॉक्टर के डैशबोर्ड पर भी लाइव दिख रहा है।'
                : 'Please report 10 minutes prior to OPD room. Token has synced to the doctor dashboard.'}
            </p>

            <button
              onClick={onClose}
              className="w-full bg-[#1A5FB4] hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-sm shadow-xs"
            >
              {t('close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleBook} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('patientName')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  readOnly
                  value={patient?.name || 'Rameshwar Lal Sharma'}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#F0F5F9] border border-gray-200 rounded-xl text-sm font-semibold text-[#1A1A1B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('doctorAssigned')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Stethoscope className="w-4 h-4 text-[#26A269]" />
                </div>
                <input
                  type="text"
                  readOnly
                  value={facility.doctorName}
                  className="w-full pl-10 pr-3 py-2.5 bg-[#F0F5F9] border border-gray-200 rounded-xl text-sm font-semibold text-[#1A1A1B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('chiefComplaint')}
              </label>
              <input
                type="text"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="उदा. बुखार, खांसी या कमजोरी"
                className="w-full p-2.5 bg-[#F0F5F9] border border-gray-200 rounded-xl text-sm text-[#1A1A1B] focus:bg-white focus:ring-2 focus:ring-[#1A5FB4] outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t('timeSlot')}
              </label>
              <select
                value={preferredSlot}
                onChange={(e) => setPreferredSlot(e.target.value)}
                className="w-full p-2.5 bg-[#F0F5F9] border border-gray-200 rounded-xl text-sm font-semibold text-[#1A1A1B]"
              >
                <option value="09:00 AM - 10:00 AM">Morning 09:00 AM - 10:00 AM</option>
                <option value="10:00 AM - 11:00 AM">Morning 10:00 AM - 11:00 AM (Recommended)</option>
                <option value="11:00 AM - 12:00 PM">Morning 11:00 AM - 12:00 PM</option>
                <option value="12:00 PM - 01:00 PM">Afternoon 12:00 PM - 01:00 PM</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#26A269] hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer mt-2"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>{isSubmitting ? t('loading') : t('confirm')}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
