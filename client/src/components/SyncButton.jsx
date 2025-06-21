    import React, { useEffect, useState } from 'react';
    import offlineManager from '../utils/OfflineManager';

    export default function SyncButton({ apiUrl, onResults }) {
    const [pending, setPending] = useState([]);
    const [syncing, setSyncing] = useState(false);
    const [feedback, setFeedback] = useState('');
    const [lastSynced, setLastSynced] = useState(null);

    const refresh = () => {
        setPending(offlineManager.getPendingSubmissions().filter(s => s.status === 'pending'));
    };

    useEffect(() => {
        refresh();
        
        const statusListener = () => refresh();
        offlineManager.onStatusChange(statusListener);
        
        window.addEventListener('storage', refresh);
        
        return () => {
        window.removeEventListener('storage', refresh);
        };
    }, []);

   const handleSync = async () => {
  setSyncing(true);
  setFeedback('');
  const { synced, failed, results } = await offlineManager.syncSubmissions(apiUrl);
  if (synced > 0) setFeedback(`${synced} submissions synced!`);
  if (failed > 0) setFeedback(`${failed} submissions failed to sync.`);
  offlineManager.removeSynced();
  refresh();
  setSyncing(false);
  setLastSynced(new Date());
  if (onResults && results && results.length > 0) {
    onResults(results);
  }
};

    if (!navigator.onLine || pending.length === 0) return null;

    return (
        <div className="fixed top-12 right-4 z-50 flex items-center space-x-2">
        <button
            className={`px-4 py-2 rounded shadow ${
            syncing 
                ? 'bg-gray-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
            onClick={handleSync}
            disabled={syncing}
        >
            {syncing ? 'Syncing...' : 'Sync Now'}
        </button>
        
        <span className="bg-yellow-400 text-black px-2 py-1 rounded-full font-bold">
            {pending.length}
        </span>
        
        {feedback && (
            <span className={`ml-2 ${
            feedback.includes('failed') ? 'text-red-600' : 'text-green-700'
            }`}>
            {feedback}
            </span>
        )}
        
        {lastSynced && (
            <span className="text-xs text-gray-500 ml-2">
            Last sync: {lastSynced.toLocaleTimeString()}
            </span>
        )}
        </div>
    );
    }