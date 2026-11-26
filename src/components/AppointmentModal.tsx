import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useOfflineSync } from '../context/OfflineSyncContext';
import { HealthcareFacility, Appointment } from '../types';
import { CheckCircle2, X, User, Users } from 'lucide-react';

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

  const [bookingFor, setBookingFor] = useState<'self' | 'relative'>('self');
  const [patientName, setPatientName] = useState(patient?.name || 'Rameshwar Lal Patel');
  const [patientAge, setPatientAge] = useState<number | string>(patient?.age || 58);
  const [patientGender, setPatientGender] = useState<string>(patient?.gender || 'Male');
  const [relationship, setRelationship] = useState<string>('Self');
  const [patientPhone, setPatientPhone] = useState<string>(patient?.mobile || '9876543210');

  const [chiefComplaint, setChiefComplaint] = useState(
    language === 'hi' ? 'बुखार एवं शरीर में दर्द (3 दिन)' : 'Fever and body ache (3 days)'
  );
  const [preferredSlot, setPreferredSlot] = useState('10:00 AM – 11:00 AM');
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    setChiefComplaint(
      language === 'hi' ? 'बुखार एवं शरीर में दर्द (3 दिन)' : 'Fever and body ache (3 days)'
    );
  }, [language]);

  useEffect(() => {
    if (!isOpen) {
      setBookedAppointment(null);
      setValidationError('');
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sync defaults on modal open
  useEffect(() => {
    if (isOpen) {
      setBookingFor('self');
      setPatientName(patient?.name || 'Rameshwar Lal Patel');
      setPatientAge(patient?.age || 58);
      setPatientGender(patient?.gender || 'Male');
      setRelationship('Self');
      setPatientPhone(patient?.mobile || '9876543210');
      setValidationError('');
    }
  }, [isOpen, patient]);

  if (!isOpen || !facility) return null;

  const handleSelectBookingFor = (type: 'self' | 'relative') => {
    setBookingFor(type);
    setValidationError('');
    if (type === 'self') {
      setPatientName(patient?.name || 'Rameshwar Lal Patel');
      setPatientAge(patient?.age || 58);
      setPatientGender(patient?.gender || 'Male');
      setRelationship('Self');
      setPatientPhone(patient?.mobile || '9876543210');
    } else {
      setPatientName('');
      setPatientAge('');
      setPatientGender('Female');
      setRelationship(language === 'hi' ? 'पत्नी' : 'Spouse');
      setPatientPhone(patient?.mobile || '9876543210');
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = patientName.trim();
    if (!cleanName) {
      setValidationError(
        language === 'hi'
          ? 'कृपया मरीज़ का नाम दर्ज करें।'
          : 'Please enter the patient name.'
      );
      return;
    }

    const numAge = Number(patientAge);
    if (!patientAge || isNaN(numAge) || numAge <= 0 || numAge > 125) {
      setValidationError(
        language === 'hi'
          ? 'कृपया वैध आयु दर्ज करें (1 - 120 वर्ष)।'
          : 'Please enter a valid age (1 - 120 years).'
      );
      return;
    }

    if (!chiefComplaint.trim()) {
      setValidationError(
        language === 'hi'
          ? 'कृपया परामर्श का मुख्य कारण दर्ज करें।'
          : 'Please enter the primary reason for consultation.'
      );
      return;
    }

    setValidationError('');
    setIsSubmitting(true);

    const payload = {
      patientName: cleanName,
      patientAge: numAge,
      patientGender: patientGender || 'Male',
      patientPhone: patientPhone.trim() || patient?.mobile || '9876543210',
      relationship: bookingFor === 'self' ? 'Self' : relationship,
      facilityId: facility.id,
      facilityName: facility.name,
      doctorId: 'doc-001',
      doctorName: facility.doctorName,
      specialty: facility.specialty,
      chiefComplaint: chiefComplaint.trim(),
      timeSlot: preferredSlot,
      riskLevel: 'Yellow' as const
    };

    if (isOffline) {
      const localApt: Appointment = {
        id: `apt-offline-${Date.now()}`,
        tokenNumber: Math.floor(Math.random() * 30) + 15,
        patientId: patient?.id || 'pat-001',
        estimatedWaitMinutes: 15,
        ...payload,
        appointmentDate: new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        status: 'WAITING'
      };

      addToQueue('appointment', payload);
      setBookedAppointment(localApt);
      onAppointmentBooked(localApt);
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
      }
    } catch (err) {
      console.error(err);
      setValidationError(
        language === 'hi'
          ? 'बुकिंग पूरी करने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
          : 'Unable to complete booking at this time. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-none sm:rounded-xl max-w-lg w-full h-[100dvh] sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-[var(--shadow-elevated)] border-0 sm:border border-[var(--border-default)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 sm:px-6 py-3.5 sm:py-5 border-b border-[var(--border-default)] flex items-start justify-between gap-3 sticky top-0 bg-white z-10">
          <div>
            <p className="text-xs font-semibold text-[var(--brand-teal)]">
              National Health Mission (NHM) · Jabalpur
            </p>
            <h2
              id="appointment-modal-title"
              className="text-lg font-bold text-[var(--text-primary)] mt-0.5"
            >
              {t('bookAppointmentBtn')}
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {language === 'hi' ? facility.nameHi : facility.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] cursor-pointer"
            aria-label={t('close')}
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Body */}
        {bookedAppointment ? (
          <div className="p-6 space-y-5 text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--status-success-bg)] text-[var(--status-success)] border border-[var(--status-success-border)] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" aria-hidden="true" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">
                {language === 'hi' ? 'ओपीडी टोकन आरक्षित हुआ' : 'OPD Token Reserved'}
              </h3>
              <p className="text-xs text-[var(--text-secondary)]">
                {language === 'hi'
                  ? 'यह टोकन संबंधित स्वास्थ्य केंद्र के डॉक्टर डैशबोर्ड पर दर्ज हो गया है।'
                  : 'Your outpatient token has been recorded in the facility OPD queue.'}
              </p>
            </div>

            <div className="bg-[var(--bg-canvas)] border border-[var(--border-default)] rounded-lg p-5 space-y-1.5">
              <div className="text-xs font-semibold text-[var(--text-muted)]">
                {t('tokenNumber')}
              </div>
              <div className="text-3xl font-mono font-bold text-[var(--brand-primary)] tabular-nums">
                #{bookedAppointment.tokenNumber}
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)] pt-1">
                {bookedAppointment.patientName}{' '}
                {bookedAppointment.relationship && bookedAppointment.relationship !== 'Self' ? (
                  <span className="text-xs font-medium text-[var(--brand-primary)]">
                    ({bookedAppointment.relationship})
                  </span>
                ) : null}{' '}
                · {facility.doctorName}
              </div>
              <div className="text-xs text-[var(--text-secondary)] tabular-nums">
                {bookedAppointment.appointmentDate} · {bookedAppointment.timeSlot} ·{' '}
                {bookedAppointment.patientGender || 'Male'}, {bookedAppointment.patientAge} yrs
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 rounded-md text-sm font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] transition-colors cursor-pointer"
            >
              {t('close')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleBook} className="p-4 sm:p-6 space-y-4" noValidate>
            {validationError && (
              <div
                role="alert"
                className="p-3 rounded-md text-xs font-medium bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger-border)]"
              >
                {validationError}
              </div>
            )}

            {/* Booking For Switcher: Self vs Relative */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[var(--text-primary)]">
                {language === 'hi' ? 'अपॉइंटमेंट किसके लिए है?' : 'Who is this appointment for?'}
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--bg-subtle)] rounded-lg border border-[var(--border-default)]">
                <button
                  type="button"
                  onClick={() => handleSelectBookingFor('self')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    bookingFor === 'self'
                      ? 'bg-white text-[var(--brand-primary)] shadow-sm border border-[var(--border-strong)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <User className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{language === 'hi' ? 'स्वयं (खुद के लिए)' : 'Myself'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectBookingFor('relative')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                    bookingFor === 'relative'
                      ? 'bg-white text-[var(--brand-primary)] shadow-sm border border-[var(--border-strong)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{language === 'hi' ? 'परिवार / रिश्तेदार' : 'Family / Relative'}</span>
                </button>
              </div>
            </div>

            {/* If relative, Relationship selector */}
            {bookingFor === 'relative' && (
              <div className="space-y-1.5 bg-blue-50/60 p-3 rounded-lg border border-blue-100">
                <label
                  htmlFor="apt-relationship"
                  className="block text-xs font-semibold text-[var(--brand-primary)]"
                >
                  {language === 'hi' ? 'मरीज़ से आपका संबंध (रिश्ता)' : 'Relationship with Patient'}
                </label>
                <select
                  id="apt-relationship"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[var(--border-strong)] rounded-md text-sm text-[var(--text-primary)] focus:border-[var(--brand-primary)]"
                >
                  <option value={language === 'hi' ? 'पत्नी' : 'Spouse'}>
                    {language === 'hi' ? 'जीवनसाथी (पति / पत्नी)' : 'Spouse (Wife / Husband)'}
                  </option>
                  <option value={language === 'hi' ? 'माता' : 'Mother'}>
                    {language === 'hi' ? 'माता (Mother)' : 'Mother'}
                  </option>
                  <option value={language === 'hi' ? 'पिता' : 'Father'}>
                    {language === 'hi' ? 'पिता (Father)' : 'Father'}
                  </option>
                  <option value={language === 'hi' ? 'बेटा' : 'Son'}>
                    {language === 'hi' ? 'बेटा (Son)' : 'Son'}
                  </option>
                  <option value={language === 'hi' ? 'बेटी' : 'Daughter'}>
                    {language === 'hi' ? 'बेटी (Daughter)' : 'Daughter'}
                  </option>
                  <option value={language === 'hi' ? 'भाई' : 'Brother'}>
                    {language === 'hi' ? 'भाई (Brother)' : 'Brother'}
                  </option>
                  <option value={language === 'hi' ? 'बहन' : 'Sister'}>
                    {language === 'hi' ? 'बहन (Sister)' : 'Sister'}
                  </option>
                  <option value={language === 'hi' ? 'अन्य परिजन' : 'Other Relative'}>
                    {language === 'hi' ? 'अन्य परिजन (Other Relative)' : 'Other Relative'}
                  </option>
                </select>
              </div>
            )}

            {/* Patient Name & Assigned Doctor */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="apt-patient-name"
                  className="block text-xs font-semibold text-[var(--text-primary)] flex items-center justify-between"
                >
                  <span>{t('patientName')}</span>
                  {bookingFor === 'relative' && (
                    <span className="text-[10px] text-[var(--brand-primary)] font-normal">
                      {language === 'hi' ? 'संपादनीय' : 'Editable'}
                    </span>
                  )}
                </label>
                <input
                  id="apt-patient-name"
                  type="text"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder={
                    bookingFor === 'relative'
                      ? language === 'hi'
                        ? 'उदा. सुनीता पटेल (रिश्तेदार का नाम)'
                        : 'e.g. Sunita Patel (Relative name)'
                      : language === 'hi'
                      ? 'उदा. रामेश्वर लाल पटेल'
                      : 'e.g. Rameshwar Lal Patel'
                  }
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-sm text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="apt-doctor-name"
                  className="block text-xs font-semibold text-[var(--text-primary)]"
                >
                  {t('doctorAssigned')}
                </label>
                <input
                  id="apt-doctor-name"
                  type="text"
                  readOnly
                  value={facility.doctorName}
                  className="w-full px-3.5 py-2.5 bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-md text-sm text-[var(--text-primary)]"
                />
              </div>
            </div>

            {/* Age, Gender & Contact Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="apt-patient-age"
                  className="block text-xs font-semibold text-[var(--text-primary)]"
                >
                  {language === 'hi' ? 'आयु (वर्ष)' : 'Age (years)'}
                </label>
                <input
                  id="apt-patient-age"
                  type="number"
                  min="1"
                  max="120"
                  value={patientAge}
                  onChange={(e) => setPatientAge(e.target.value)}
                  placeholder={language === 'hi' ? 'उदा. 32' : 'e.g. 32'}
                  className="w-full px-3 py-2 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-sm text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)]"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="apt-patient-gender"
                  className="block text-xs font-semibold text-[var(--text-primary)]"
                >
                  {language === 'hi' ? 'लिंग' : 'Gender'}
                </label>
                <select
                  id="apt-patient-gender"
                  value={patientGender}
                  onChange={(e) => setPatientGender(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-sm text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)]"
                >
                  <option value="Male">{language === 'hi' ? 'पुरुष (Male)' : 'Male'}</option>
                  <option value="Female">{language === 'hi' ? 'महिला (Female)' : 'Female'}</option>
                  <option value="Other">{language === 'hi' ? 'अन्य (Other)' : 'Other'}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="apt-patient-phone"
                  className="block text-xs font-semibold text-[var(--text-primary)]"
                >
                  {language === 'hi' ? 'संपर्क मोबाइल' : 'Contact Phone'}
                </label>
                <input
                  id="apt-patient-phone"
                  type="tel"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="10-digit mobile"
                  className="w-full px-3 py-2 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-sm text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)]"
                />
              </div>
            </div>

            {/* Chief Complaint */}
            <div className="space-y-1.5">
              <label
                htmlFor="apt-complaint"
                className="block text-xs font-semibold text-[var(--text-primary)]"
              >
                {t('chiefComplaint')}
              </label>
              <input
                id="apt-complaint"
                type="text"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'उदा. बुखार, खांसी या सामान्य जांच'
                    : 'e.g. Fever, cough, or routine consultation'
                }
                className="w-full px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-sm text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)]"
                required
              />
            </div>

            {/* Preferred Time Slot */}
            <div className="space-y-1.5">
              <label
                htmlFor="apt-slot"
                className="block text-xs font-semibold text-[var(--text-primary)]"
              >
                {t('timeSlot')}
              </label>
              <select
                id="apt-slot"
                value={preferredSlot}
                onChange={(e) => setPreferredSlot(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[var(--bg-canvas)] border border-[var(--border-strong)] rounded-md text-sm text-[var(--text-primary)] focus:bg-white focus:border-[var(--brand-primary)]"
              >
                <option value="09:00 AM – 10:00 AM">09:00 AM – 10:00 AM</option>
                <option value="10:00 AM – 11:00 AM">10:00 AM – 11:00 AM</option>
                <option value="11:00 AM – 12:00 PM">11:00 AM – 12:00 PM</option>
                <option value="12:00 PM – 01:00 PM">12:00 PM – 01:00 PM</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-md text-xs font-semibold text-[var(--text-secondary)] bg-white border border-[var(--border-strong)] hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-md text-xs font-semibold text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 transition-colors cursor-pointer"
              >
                {isSubmitting ? t('loading') : t('confirm')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
