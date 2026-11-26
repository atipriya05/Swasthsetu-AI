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
  loginPatient: (mobile: string, otp: string) => boolean;
  loginDoctor: (identifier: string, password: string) => boolean;
  quickDemoLogin: (role: 'patient' | 'doctor') => void;
  triggerWelcomeToast: (role: 'patient' | 'doctor', customName?: string) => void;
  dismissWelcomeToast: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('patient'); // Default to logged in as patient for immediate interactive exploration
  const [patient, setPatient] = useState<PatientProfile | null>(MOCK_PATIENT);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [welcomeToast, setWelcomeToast] = useState<WelcomeToastData | null>(null);

  // Show a visual welcome toast when user opens the app in this session
  useEffect(() => {
    const hasSeenWelcome = sessionStorage.getItem('swasthsetu_welcomed');
    if (!hasSeenWelcome && role) {
      sessionStorage.setItem('swasthsetu_welcomed', 'true');
      setWelcomeToast({
        id: `welcome-init-${Date.now()}`,
        name: role === 'patient' ? MOCK_PATIENT.name : MOCK_DOCTOR.name,
        role,
        autoSpeak: false
      });
    }
  }, []);

  const loginPatient = (mobile: string, otp: string) => {
    if (mobile.length >= 10 && (otp === '123456' || otp.length === 6 || otp === '1234')) {
      setRole('patient');
      setPatient(MOCK_PATIENT);
      setDoctor(null);
      setWelcomeToast({
        id: `welcome-${Date.now()}`,
        name: MOCK_PATIENT.name,
        role: 'patient',
        autoSpeak: true
      });
      return true;
    }
    return false;
  };

  const loginDoctor = (identifier: string, password: string) => {
    if (identifier.trim().length > 0 && (password === 'health123' || password.length >= 4)) {
      setRole('doctor');
      setDoctor(MOCK_DOCTOR);
      setPatient(null);
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
      setRole('patient');
      setPatient(MOCK_PATIENT);
      setDoctor(null);
      setWelcomeToast({
        id: `welcome-${Date.now()}`,
        name: MOCK_PATIENT.name,
        role: 'patient',
        autoSpeak: true
      });
    } else {
      setRole('doctor');
      setDoctor(MOCK_DOCTOR);
      setPatient(null);
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
      name: customName || (targetRole === 'patient' ? MOCK_PATIENT.name : MOCK_DOCTOR.name),
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
