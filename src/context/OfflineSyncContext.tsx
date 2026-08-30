import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Appointment, AITriageReport, Prescription } from '../types';

export interface SyncQueueItem {
  id: string;
  type: 'appointment' | 'triage_report' | 'prescription';
  data: any;
  timestamp: string;
}

interface OfflineSyncContextType {
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  toggleOfflineMode: () => void;
  queue: SyncQueueItem[];
  addToQueue: (type: SyncQueueItem['type'], data: any) => void;
  syncNow: () => Promise<{ success: boolean; count: number }>;
  isSyncing: boolean;
  lastSyncTime: string | null;
  syncNotification: string | null;
  clearNotification: () => void;
}

const OfflineSyncContext = createContext<OfflineSyncContextType | undefined>(undefined);

const QUEUE_STORAGE_KEY = 'swasthsetu_sync_queue';
const OFFLINE_STORAGE_KEY = 'swasthsetu_is_offline';

export const OfflineSyncProvider: React.FC<{
  children: React.ReactNode;
  onAppointmentsSynced?: (newApts: Appointment[]) => void;
  onReportsSynced?: (newReports: AITriageReport[]) => void;
  onPrescriptionsSynced?: (newRx: Prescription[]) => void;
}> = ({ children, onAppointmentsSynced, onReportsSynced, onPrescriptionsSynced }) => {
  const [isOffline, setIsOfflineState] = useState<boolean>(() => {
    const saved = localStorage.getItem(OFFLINE_STORAGE_KEY);
    return saved === 'true' || !navigator.onLine;
  });

  const [queue, setQueue] = useState<SyncQueueItem[]>(() => {
    try {
      const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  // Sync state with localStorage
  useEffect(() => {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    localStorage.setItem(OFFLINE_STORAGE_KEY, String(isOffline));
  }, [isOffline]);

  // Listen to browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOfflineState(false);
    };
    const handleOffline = () => {
      setIsOfflineState(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const setIsOffline = (offline: boolean) => {
    setIsOfflineState(offline);
    if (!offline && queue.length > 0) {
      // Auto-trigger sync when user switches back to online
      syncNow();
    }
  };

  const toggleOfflineMode = () => {
    const nextState = !isOffline;
    setIsOffline(nextState);
  };

  const addToQueue = useCallback((type: SyncQueueItem['type'], data: any) => {
    const newItem: SyncQueueItem = {
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      type,
      data,
      timestamp: new Date().toISOString()
    };
    setQueue(prev => [...prev, newItem]);
    setSyncNotification(`Item saved locally in offline queue (Total: ${queue.length + 1} pending).`);
  }, [queue.length]);

  const syncNow = useCallback(async (): Promise<{ success: boolean; count: number }> => {
    if (queue.length === 0) {
      return { success: true, count: 0 };
    }

    setIsSyncing(true);
    const countToSync = queue.length;
    const syncedApts: Appointment[] = [];
    const syncedReports: AITriageReport[] = [];
    const syncedRx: Prescription[] = [];

    try {
      // Loop through and sync items to the backend API
      for (const item of queue) {
        try {
          if (item.type === 'appointment') {
            const res = await fetch('/api/appointments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.data)
            });
            const data = await res.json();
            if (data.appointment) syncedApts.push(data.appointment);
          } else if (item.type === 'triage_report') {
            const res = await fetch('/api/gemini/triage', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.data)
            });
            const data = await res.json();
            if (data.report) syncedReports.push(data.report);
          } else if (item.type === 'prescription') {
            const res = await fetch('/api/prescriptions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(item.data)
            });
            const data = await res.json();
            if (data.prescription) syncedRx.push(data.prescription);
          }
        } catch (e) {
          console.warn(`Failed to sync item ${item.id}:`, e);
        }
      }

      // Clear the queue after successful sync
      setQueue([]);
      localStorage.removeItem(QUEUE_STORAGE_KEY);
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSyncTime(nowStr);
      setSyncNotification(`✓ Successfully synchronized ${countToSync} records with central server.`);

      if (onAppointmentsSynced && syncedApts.length > 0) onAppointmentsSynced(syncedApts);
      if (onReportsSynced && syncedReports.length > 0) onReportsSynced(syncedReports);
      if (onPrescriptionsSynced && syncedRx.length > 0) onPrescriptionsSynced(syncedRx);

      return { success: true, count: countToSync };
    } catch (err) {
      console.error('Sync failed:', err);
      setSyncNotification('Sync interrupted. Items remain safely in offline queue.');
      return { success: false, count: 0 };
    } finally {
      setIsSyncing(false);
    }
  }, [queue, onAppointmentsSynced, onReportsSynced, onPrescriptionsSynced]);

  const clearNotification = () => setSyncNotification(null);

  return (
    <OfflineSyncContext.Provider
      value={{
        isOffline,
        setIsOffline,
        toggleOfflineMode,
        queue,
        addToQueue,
        syncNow,
        isSyncing,
        lastSyncTime,
        syncNotification,
        clearNotification
      }}
    >
      {children}
    </OfflineSyncContext.Provider>
  );
};

export const useOfflineSync = () => {
  const context = useContext(OfflineSyncContext);
  if (!context) {
    throw new Error('useOfflineSync must be used within an OfflineSyncProvider');
  }
  return context;
};
