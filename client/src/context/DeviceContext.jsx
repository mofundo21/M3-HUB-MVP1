import React, { createContext, useContext } from 'react';
import { useDeviceDetection } from '../hooks/useDeviceDetection';

export const DeviceContext = createContext({
  isMobile: false,
  isTablet: false,
  isDesktop: true,
});

export function DeviceProvider({ children }) {
  const value = useDeviceDetection();
  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}

export function useDevice() {
  return useContext(DeviceContext);
}
