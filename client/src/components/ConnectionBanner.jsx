import React, { useEffect, useState, useRef } from 'react';
import offlineManager from '../utils/OfflineManager';

export default function ConnectionBanner() {
  const [isOnline, setIsOnline] = useState(offlineManager.isOnline());
  const [visible, setVisible] = useState(true);
  const [show, setShow] = useState(true); // for animation
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleStatus = (status) => {
      setIsOnline(status);
      setVisible(true);
      setShow(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setShow(false), 1800); // start fade/slide out
      setTimeout(() => setVisible(false), 2000); // remove from DOM after animation
    };
    const cleanupListener = offlineManager.onStatusChange(handleStatus);
    // Show on mount for 2s
    setVisible(true);
    setShow(true);
    timeoutRef.current = setTimeout(() => setShow(false), 1800);
    setTimeout(() => setVisible(false), 2000);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (typeof cleanupListener === 'function') cleanupListener();
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`w-full z-[99999] text-center py-2 fixed top-0 left-0 transition-all duration-300 font-bold
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}
        ${isOnline ? 'bg-green-500' : 'bg-red-500'}
        text-white`}
      style={{
        transitionProperty: 'opacity, transform',
      }}
    >
      {isOnline ? '✓ Online' : '⚠ Offline - Working locally'}
    </div>
  );
}