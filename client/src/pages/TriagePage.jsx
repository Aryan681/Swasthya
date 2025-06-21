import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaMicrophone, FaMicrophoneSlash, FaSpinner, FaHeartbeat, FaClinicMedical } from 'react-icons/fa';
import { getLocalCache, setLocalCache } from '../utils/useCache';
import offlineManager from '../utils/OfflineManager';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ht', label: 'Kreyòl Ayisyen' },
];

const TriagePage = ({ syncedResults = [] }) => {
  const [symptoms, setSymptoms] = useState('');
  const [language, setLanguage] = useState('ht');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [browserSupportsSpeech, setBrowserSupportsSpeech] = useState(false);
  const recognitionRef = useRef(null);
  const [showOfflineSaved, setShowOfflineSaved] = useState(false);

  // Check browser support for speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setBrowserSupportsSpeech(true);
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'ht' ? 'ht-HT' : 'en-US';
      recognitionRef.current.onresult = handleSpeechResult;
      recognitionRef.current.onerror = handleSpeechError;
      recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, [language]);

  const handleSpeechResult = (event) => {
    const transcript = Array.from(event.results)
      .map(result => result[0])
      .map(result => result.transcript)
      .join('');
    setSymptoms(transcript);
  };

  const handleSpeechError = (event) => {
    setError('Voice recognition failed. Please type your symptoms instead.');
    setIsRecording(false);
  };

  const startRecording = () => {
    if (!browserSupportsSpeech) {
      setError('Voice input is not supported in your browser');
      return;
    }
    setError(null);
    setSymptoms('');
    setIsRecording(true);
    try {
      recognitionRef.current.lang = language === 'ht' ? 'ht-HT' : 'en-US';
      recognitionRef.current.start();
    } catch (err) {
      setError('Failed to start voice recording');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  useEffect(() => {
    const handleStatusChange = (isOnline) => {
      if (isOnline) {
        setShowOfflineSaved(false);
      }
    };
    offlineManager.onStatusChange(handleStatusChange);
    return () => {
      // No cleanup needed for now
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    if (!symptoms.trim()) {
      setError('Please describe your symptoms');
      setLoading(false);
      return;
    }
  
    const submissionData = {
      symptoms: symptoms.trim(),
      language,
      timestamp: new Date().toISOString()
    };
  
    try {
      if (offlineManager.isOnline()) {
        const response = await fetch('/api/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(submissionData)
        });
  
        if (!response.ok) throw new Error('Network response was not ok');
        
        const result = await response.json();
        setResult(result);
      } else {
        offlineManager.saveSubmission(submissionData);
        setShowOfflineSaved(true);
      }
    } catch (err) {
      offlineManager.saveSubmission(submissionData);
      setShowOfflineSaved(true);
    } finally {
      setLoading(false);
    }
  };

  // Helper to render a triage result card
  const renderTriageResultCard = (result) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
    >
      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 text-white">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center">
            <FaClinicMedical className="mr-3 text-blue-200" />
            Medical Triage Report
          </h2>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
            result.triageResult.urgency === 'High' ? 'bg-red-100 text-red-800' :
            result.triageResult.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {result.triageResult.urgency} Priority
          </span>
        </div>
      </div>
      {/* Card Body */}
      <div className="p-6 space-y-6">
        {/* Warnings */}
        {result.warning && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">{result.warning}</p>
              </div>
            </div>
          </div>
        )}
        {/* Patient Input Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-3 flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            Patient Reported Symptoms
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {result.inputCreole && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Original (Creole)</p>
                <p className="text-gray-800 bg-white p-3 rounded border border-gray-200">"{result.inputCreole}"</p>
              </div>
            )}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Translated (English)</p>
              <p className="text-gray-800 bg-white p-3 rounded border border-gray-200">"{result.inputEnglish}"</p>
            </div>
          </div>
        </div>
        {/* Medical Assessment Section */}
        <div className="border-t border-b border-gray-200 py-5">
          <h3 className="text-lg font-medium text-blue-800 mb-4 flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Clinical Assessment
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Condition Card */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">Suspected Condition</p>
              <p className="text-lg font-medium text-blue-900">{result.triageResult.condition}</p>
            </div>
            {/* Urgency Card */}
            <div className={`p-4 rounded-lg border ${
              result.triageResult.urgency === 'High' ? 'bg-red-50 border-red-100' :
              result.triageResult.urgency === 'Medium' ? 'bg-yellow-50 border-yellow-100' :
              'bg-green-50 border-green-100'
            }`}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2 ${
                result.triageResult.urgency === 'High' ? 'text-red-600' :
                result.triageResult.urgency === 'Medium' ? 'text-yellow-600' :
                'text-green-600'
              }">
                Medical Urgency
              </p>
              <p className={`text-lg font-bold ${
                result.triageResult.urgency === 'High' ? 'text-red-700' :
                result.triageResult.urgency === 'Medium' ? 'text-yellow-700' :
                'text-green-700'
              }`}>
                {result.triageResult.urgency}
                {result.triageResult.urgency === 'High' && (
                  <span className="ml-2 text-red-500 animate-pulse">⚠️ Critical</span>
                )}
              </p>
            </div>
            {/* Action Card */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">Recommended Action</p>
              <p className="text-gray-900 font-medium">{result.triageResult.action}</p>
            </div>
          </div>
        </div>
        {/* Next Steps */}
        <div>
          <h3 className="text-lg font-medium text-blue-800 mb-3 flex items-center">
            <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Next Steps
          </h3>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            {result.triageResult.urgency === 'High' ? (
              <div className="text-red-700 font-medium">
                <p className="flex items-start mb-2">
                  <span className="mr-2">🚨</span>
                  Seek emergency medical care immediately. This condition requires urgent attention.
                </p>
              </div>
            ) : result.triageResult.urgency === 'Medium' ? (
              <div className="text-yellow-700">
                <p className="mb-2">Schedule a doctor's appointment within 24-48 hours.</p>
                <p>Monitor symptoms closely and return if they worsen.</p>
              </div>
            ) : (
              <div className="text-green-700">
                <p>This condition appears non-urgent. Follow the recommended action and monitor symptoms.</p>
              </div>
            )}
          </div>
        </div>
        {/* Footer */}
        <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
          <div className="flex justify-between items-center">
            <div>
              {result.translationService && (
                <span>Translated via {result.translationService} • </span>
              )}
              <span>AI Assessment Generated: {new Date().toLocaleString()}</span>
            </div>
            <button className="text-blue-600 hover:text-blue-800 font-medium">
              Print Report
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
   
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
            <motion.h1 
              className="text-3xl font-bold text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FaHeartbeat className="inline-block mr-3" />
              Symptom Triage Assessment
            </motion.h1>
            <motion.p 
              className="text-center mt-2 text-blue-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Describe your symptoms for immediate AI-powered medical guidance
            </motion.p>
          </div>

          {/* Main Form */}
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Language Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Language:
                </label>
                <select
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  disabled={isRecording}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Symptoms Input */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe Your Symptoms:
                </label>
                <textarea
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[150px] pr-16 bg-white"
                  placeholder={
                    language === 'ht' 
                      ? "Antre sentòm ou..." 
                      : "Enter your symptoms here..."
                  }
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  required
                  disabled={isRecording}
                />
                
                {/* Voice Input Button */}
                <motion.button
                  type="button"
                  onClick={toggleRecording}
                  className={`absolute right-3 bottom-3 p-3 rounded-full ${
                    isRecording 
                      ? 'bg-red-500 text-white shadow-lg animate-pulse' 
                      : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                  }`}
                  whileTap={{ scale: 0.9 }}
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
                >
                  <AnimatePresence mode="wait">
                    {isRecording ? (
                      <motion.div
                        key="stop"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.8 }}
                      >
                        <FaMicrophoneSlash className="text-lg" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="start"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.8 }}
                      >
                        <FaMicrophone className="text-lg" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
                
                {isRecording && (
                  <div className="absolute left-4 bottom-4 flex items-center text-sm text-red-600">
                    <FaSpinner className="animate-spin mr-2" />
                    Listening...
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className={`w-full py-4 px-6 rounded-xl font-bold text-white ${
                  loading || isRecording
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 shadow-lg'
                }`}
                disabled={loading || isRecording}
                whileHover={!loading && !isRecording ? { scale: 1.02 } : {}}
                whileTap={!loading && !isRecording ? { scale: 0.98 } : {}}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <FaSpinner className="animate-spin" />
                    Analyzing Symptoms...
                  </span>
                ) : (
                  'Get Triage Assessment'
                )}
              </motion.button>
            </form>

            {/* Browser Support Warning */}
            {!browserSupportsSpeech && (
              <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 rounded">
                <p>Voice input is not supported in your browser. Please type your symptoms.</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section: Show synced results first, then current result */}
        <div className="mt-8">
          {showOfflineSaved && !offlineManager.isOnline() && (
            <div className="mb-6">
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <h3 className="text-lg font-medium text-yellow-800">Saved Locally</h3>
                <p className="text-yellow-700">Saved locally - will sync when online.</p>
              </div>
            </div>
          )}
          {syncedResults.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-green-700">Recently Synced Results</h2>
              {syncedResults.map((res, idx) =>
                res.data && res.data.triageResult ? (
                  renderTriageResultCard(res.data)
                ) : (
                  <div key={res.id || idx} className="p-4 my-2 bg-red-50 border border-red-200 rounded">
                    <span>Error: {res.error}</span>
                  </div>
                )
              )}
            </div>
          )}
          <AnimatePresence>
            {result && renderTriageResultCard(result)}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default TriagePage;    