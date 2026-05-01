import { useState, useEffect } from 'react';

const MOBILE_MAX = 767;
const TABLET_MAX = 1023;

function read() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return { isMobile: false, isTablet: false, isDesktop: true };
  }
  const w = window.innerWidth;
  return {
    isMobile: w <= MOBILE_MAX,
    isTablet: w > MOBILE_MAX && w <= TABLET_MAX,
    isDesktop: w > TABLET_MAX,
  };
}

export function useDeviceDetection() {
  const [state, setState] = useState(read);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mqls = [
      window.matchMedia(`(max-width: ${MOBILE_MAX}px)`),
      window.matchMedia(`(max-width: ${TABLET_MAX}px)`),
      window.matchMedia('(orientation: portrait)'),
    ];

    const onChange = () => setState(read());
    mqls.forEach(m => m.addEventListener('change', onChange));

    return () => {
      mqls.forEach(m => m.removeEventListener('change', onChange));
    };
  }, []);

  return state;
}
