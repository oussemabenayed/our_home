import React, { createContext, useContext, useState } from 'react';

const AppointmentContext = createContext();

export const useAppointmentRefresh = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error('useAppointmentRefresh must be used within an AppointmentProvider');
  }
  return context;
};

export const AppointmentProvider = ({ children }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [refreshCallbacks, setRefreshCallbacks] = useState([]);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    refreshCallbacks.forEach(callback => callback());
  };

  const registerRefreshCallback = (callback) => {
    setRefreshCallbacks(prev => [...prev, callback]);
    return () => {
      setRefreshCallbacks(prev => prev.filter(cb => cb !== callback));
    };
  };

  return (
    <AppointmentContext.Provider value={{
      refreshTrigger,
      triggerRefresh,
      registerRefreshCallback
    }}>
      {children}
    </AppointmentContext.Provider>
  );
};