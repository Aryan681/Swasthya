import React, { useEffect, useState } from 'react';
import offlineManager from '../utils/OfflineManager';

export default function ConnectionBanner() {
  const [isOnline, setIsOnline] = useState(offlineManager.isOnline());

  useEffect(() => {
    const cleanupListener = offlineManager.onStatusChange(setIsOnline);
    return cleanupListener;
  }, []);

  return (
    <div
      className={`w-full text-center py-2 fixed top-0 left-0 z-50 ${
        isOnline ? 'bg-green-500' : 'bg-red-500'
      } text-white font-bold transition-colors duration-300`}
    >
      {isOnline ? '✓ Online' : '⚠ Offline - Working locally'}
    </div>
  );
}