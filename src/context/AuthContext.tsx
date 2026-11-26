import React, { createContext, useContext, useState, useEffect } from 'react';
import { PatientProfile, DoctorProfile } from '../types';
import { MOCK_PATIENT, MOCK_DOCTOR } from '../data/mockData';

export type UserRole = 'patient' | 'doctor' | null;

export interface WelcomeToastData {
  id: string;
  name: string;
  role: 'patient' | 'doctor';
  autoSpeak: boolean;
}

interface AuthContextType {
  role: UserRole;
  patient: PatientProfile | null;
  doctor: DoctorProfile | null;
  welcomeToast: WelcomeToastData | null;
  loginPatient: (name: string, mobile: string, otp: string, generatedOtp?: string) => boolean;
  loginDoctor: (identifier: string, password: string) => boolean;
  quickDemoLogin: (role: 'patient' | 'doctor') => void;
  triggerWelcomeToast: (role: 'patient' | 'doctor', customName?: string) => void;
  dismissWelcomeToast: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('swasthsetu_current_role');
    return saved === 'patient' || saved === 'doctor' ? (saved as UserRole) : null;
  });

  const [patient, setPatient] = useState<PatientProfile | null>(() => {
    const saved = localStorage.getItem('swasthsetu_current_patient');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });

  const [doctor, setDoctor] = useState<DoctorProfile | null>(() => {
    const savedRole = localStorage.getItem('swasthsetu_current_role');
    return savedRole === 'doctor' ? MOCK_DOCTOR : null;
  });

  const [welcomeToast, setWelcomeToast] = useState<WelcomeToastData | null>(null);

  // Show a visual welcome toast when user opens the app in this session if already logged in
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('swasthsetu_welcomed');
    if (!hasSeenWelcome && role) {
      sessionStorage.setItem('swasthsetu_welcomed', 'true');
      setWelcomeToast({
        id: `welcome-init-${Date.now()}`,
        name: role === 'patient' ? (patient?.name || 'Citizen') : MOCK_DOCTOR.name,
        role,
        autoSpeak: false
      });
    }
  }, [role, patient]);

  const loginPatient = (name: string, mobile: string, otp: string, generatedOtp?: string) => {
    const cleanName = name.trim();
    const cleanMobile = mobile.trim();
    const cleanOtp = otp.trim();

    const isOtpValid =
      cleanOtp.length === 6 &&
      (cleanOtp === generatedOtp || cleanOtp === '123456' || (Boolean(generatedOtp) && cleanOtp === generatedOtp));

    if (cleanName.length >= 2 && cleanMobile.length === 10 && isOtpValid) {
      const customPatient: PatientProfile = {
        ...MOCK_PATIENT,
        id: `pat-${cleanMobile.slice(-4)}-${Date.now().toString().slice(-4)}`,
        name: cleanName,
        nameHi: cleanName,
        mobile: cleanMobile,
        abhaId: `91-${cleanMobile.slice(-4)}-${Math.floor(1000 + Math.random() * 9000)}-4820`
      };

      setRole('patient');
      setPatient(customPatient);
      setDoctor(null);
      localStorage.setItem('swasthsetu_current_patient', JSON.stringify(customPatient));
      localStorage.setItem('swasthsetu_current_role', 'patient');

      setWelcomeToast({
        id: `welcome-${Date.now()}`,
        name: cleanName,
        role: 'patient',
        autoSpeak: true
      });
      return true;
    }
    return false;
  };

  const loginDoctor = (identifier: string, password: string) => {
    if (identifier.trim().length > 0 && password.trim().length >= 4) {
      setRole('doctor');
      setDoctor(MOCK_DOCTOR);
      setPatient(null);
      localStorage.setItem('swasthsetu_current_role', 'doctor');

      setWelcomeToast({
        id: `welcome-${Date.now()}`,
        name: MOCK_DOCTOR.name,
        role: 'doctor',
        autoSpeak: true
      });
      return true;
    }
    return false;
  };

  const quickDemoLogin = (targetRole: 'patient' | 'doctor') => {
    if (targetRole === 'patient') {
      const p = patient || MOCK_PATIENT;
      setRole('patient');
      setPatient(p);
      setDoctor(null);
      localStorage.setItem('swasthsetu_current_role', 'patient');
      localStorage.setItem('swasthsetu_current_patient', JSON.stringify(p));
      setWelcomeToast({
        id: `welcome-${Date.now()}`,
        name: p.name,
        role: 'patient',
        autoSpeak: true
      });
    } else {
      setRole('doctor');
      setDoctor(MOCK_DOCTOR);
      setPatient(null);
      localStorage.setItem('swasthsetu_current_role', 'doctor');
      setWelcomeToast({
        id: `welcome-${Date.now()}`,
        name: MOCK_DOCTOR.name,
        role: 'doctor',
        autoSpeak: true
      });
    }
  };

  const triggerWelcomeToast = (targetRole: 'patient' | 'doctor', customName?: string) => {
    setWelcomeToast({
      id: `welcome-${Date.now()}`,
      name: customName || (targetRole === 'patient' ? (patient?.name || MOCK_PATIENT.name) : MOCK_DOCTOR.name),
      role: targetRole,
      autoSpeak: true
    });
  };

  const dismissWelcomeToast = () => {
    setWelcomeToast(null);
  };

  const logout = () => {
    setRole(null);
    setPatient(null);
    setDoctor(null);
    setWelcomeToast(null);
    localStorage.removeItem('swasthsetu_current_role');
    localStorage.removeItem('swasthsetu_current_patient');
    sessionStorage.removeItem('swasthsetu_welcomed');
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        patient,
        doctor,
        welcomeToast,
        loginPatient,
        loginDoctor,
        quickDemoLogin,
        triggerWelcomeToast,
        dismissWelcomeToast,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
