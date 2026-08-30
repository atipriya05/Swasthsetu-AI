import React, { createContext, useContext, useState } from 'react';
import { PatientProfile, DoctorProfile } from '../types';
import { MOCK_PATIENT, MOCK_DOCTOR } from '../data/mockData';

export type UserRole = 'patient' | 'doctor' | null;

interface AuthContextType {
  role: UserRole;
  patient: PatientProfile | null;
  doctor: DoctorProfile | null;
  loginPatient: (mobile: string, otp: string) => boolean;
  loginDoctor: (identifier: string, password: string) => boolean;
  quickDemoLogin: (role: 'patient' | 'doctor') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('patient'); // Default to logged in as patient for immediate interactive exploration
  const [patient, setPatient] = useState<PatientProfile | null>(MOCK_PATIENT);
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);

  const loginPatient = (mobile: string, otp: string) => {
    if (mobile.length >= 10 && (otp === '123456' || otp.length === 6 || otp === '1234')) {
      setRole('patient');
      setPatient(MOCK_PATIENT);
      setDoctor(null);
      return true;
    }
    return false;
  };

  const loginDoctor = (identifier: string, password: string) => {
    if (identifier.trim().length > 0 && (password === 'health123' || password.length >= 4)) {
      setRole('doctor');
      setDoctor(MOCK_DOCTOR);
      setPatient(null);
      return true;
    }
    return false;
  };

  const quickDemoLogin = (targetRole: 'patient' | 'doctor') => {
    if (targetRole === 'patient') {
      setRole('patient');
      setPatient(MOCK_PATIENT);
      setDoctor(null);
    } else {
      setRole('doctor');
      setDoctor(MOCK_DOCTOR);
      setPatient(null);
    }
  };

  const logout = () => {
    setRole(null);
    setPatient(null);
    setDoctor(null);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        patient,
        doctor,
        loginPatient,
        loginDoctor,
        quickDemoLogin,
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
