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
      if (isOnline) setShowOfflineSaved(false);
    };
    offlineManager.onStatusChange(handleStatusChange);
    return () => {};
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
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/triage`, {
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
    transition={{ duration: 0.4, ease: "easeOut" }}
    className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden border-0"
  >
    {/* Mobile-optimized Card Header */}
    <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 p-4 sm:p-6 text-white">
      <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-blue-700/30 rounded-full transform translate-x-10 -translate-y-10 sm:translate-x-16 sm:-translate-y-16"></div>
      
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center mb-3 sm:mb-0">
          <div className="bg-white/20 p-2 sm:p-3 rounded-lg backdrop-blur-sm mr-3">
            <FaClinicMedical className="text-xl sm:text-2xl text-blue-200" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">
            Medical Triage Report
          </h2>
        </div>
        
        <div className={`px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-md ${
          result.triageResult.urgency === 'High' ? 'bg-red-100 text-red-800 animate-pulse' :
          result.triageResult.urgency === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {result.triageResult.urgency} Priority
        </div>
      </div>
    </div>

    {/* Card Body */}
    <div className="p-4 sm:p-6 space-y-6">
      {/* Warning Alert - Mobile compact */}
      {result.warning && (
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded-lg flex items-start"
        >
          <svg className="flex-shrink-0 h-4 w-4 sm:h-5 sm:w-5 text-yellow-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="ml-3">
            <p className="text-xs sm:text-sm text-yellow-700">{result.warning}</p>
          </div>
        </motion.div>
      )}

      {/* Patient Input Section - Stacked on mobile */}
      <div className="bg-gray-50 p-4 sm:p-5 rounded-xl">
        <h3 className="text-base sm:text-lg font-medium text-blue-800 mb-3 flex items-center">
          <div className="bg-blue-100 p-1 sm:p-2 rounded-lg mr-2 sm:mr-3">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          Patient Reported Symptoms
        </h3>
        
        <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4">
          {result.inputCreole && (
            <div className="space-y-2">
              <div className="flex items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Original (Haitian Creole)</span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Kreyòl Ayisyen</span>
              </div>
              <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
                <p className="text-sm sm:text-base text-gray-800">"{result.inputCreole}"</p>
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="flex items-center">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Translated (English)</span>
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Translated</span>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
              <p className="text-sm sm:text-base text-gray-800">"{result.inputEnglish}"</p>
              {result.translationService && (
                <p className="text-xs text-gray-500 mt-1 sm:mt-2">
                  Translated via {result.translationService}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Medical Assessment Section - Mobile optimized */}
      <div className="border border-gray-200 rounded-xl p-3 sm:p-4">
        <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
          <h3 className="text-base sm:text-lg font-medium text-blue-800 mb-4 flex items-center">
            <div className="bg-blue-100 p-1 sm:p-2 rounded-lg mr-2 sm:mr-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            Clinical Assessment
          </h3>

          {/* Stack cards on mobile */}
          <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-4 sm:space-y-0 mb-4 sm:mb-5">
            {/* Condition Card */}
            <div className="bg-white p-3 sm:p-4 rounded-lg border border-blue-100 shadow-sm">
              <div className="bg-blue-50 p-2 sm:p-3 rounded-lg inline-block mb-2 sm:mb-3">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">Suspected Condition</p>
              <p className="text-base sm:text-lg font-medium text-blue-900">{result.triageResult.condition}</p>
            </div>

            {/* Urgency Card */}
            <div className={`p-3 sm:p-4 rounded-lg border shadow-sm ${
              result.triageResult.urgency === 'High' ? 'bg-red-50 border-red-200' :
              result.triageResult.urgency === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
              'bg-green-50 border-green-200'
            }`}>
              <div className={`p-2 sm:p-3 rounded-lg inline-block mb-2 sm:mb-3 ${
                result.triageResult.urgency === 'High' ? 'bg-red-100' :
                result.triageResult.urgency === 'Medium' ? 'bg-yellow-100' :
                'bg-green-100'
              }`}>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${
                result.triageResult.urgency === 'High' ? 'text-red-600' :
                result.triageResult.urgency === 'Medium' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                Medical Urgency
              </p>
              <p className={`text-base sm:text-lg font-bold ${
                result.triageResult.urgency === 'High' ? 'text-red-700' :
                result.triageResult.urgency === 'Medium' ? 'text-yellow-700' :
                'text-green-700'
              }`}>
                {result.triageResult.urgency}
                {result.triageResult.urgency === 'High' && (
                  <span className="ml-1 sm:ml-2 text-xs sm:text-sm text-red-500 animate-pulse">⚠️ Critical</span>
                )}
              </p>
            </div>
          </div>

          {/* Action Card - Full width */}
          <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="bg-gray-100 p-2 sm:p-3 rounded-lg inline-block mb-2 sm:mb-3">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">Recommended Action</p>
            <p className="text-sm sm:text-base text-gray-900 font-medium">{result.triageResult.action}</p>
          </div>
        </div>
      </div>

      {/* Next Steps - Mobile compact */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h3 className="text-base sm:text-lg font-medium text-blue-800 flex items-center">
            <div className="bg-blue-100 p-1 sm:p-2 rounded-lg mr-2 sm:mr-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            Next Steps
          </h3>
        </div>
        <div className="p-4">
          {result.triageResult.urgency === 'High' ? (
            <div className="bg-red-50 p-3 rounded-lg">
              <div className="flex items-start">
                <span className="text-red-500 text-lg sm:text-xl mr-2 sm:mr-3">🚨</span>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-red-800 mb-1 sm:mb-2">Emergency Action Required</h4>
                  <p className="text-xs sm:text-sm text-red-700">Seek medical care immediately. This condition requires urgent attention.</p>
                  <p className="text-xs text-red-600 mt-1 sm:mt-2">Recommended facility: Trauma Center or Emergency Department</p>
                </div>
              </div>
            </div>
          ) : result.triageResult.urgency === 'Medium' ? (
            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-start">
                <span className="text-yellow-500 text-lg sm:text-xl mr-2 sm:mr-3">⚠️</span>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-yellow-800 mb-1">Recommended Action</h4>
                  <p className="text-xs sm:text-sm text-yellow-700">Schedule a doctor's appointment within 24-48 hours.</p>
                  <ul className="list-disc list-inside text-xs text-yellow-700 mt-1 space-y-1">
                    <li>Monitor symptoms closely</li>
                    <li>Return if symptoms worsen</li>
                    <li>Follow up with primary care</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="flex items-start">
                <span className="text-green-500 text-lg sm:text-xl mr-2 sm:mr-3">✓</span>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-green-800 mb-1">Self-Care Recommended</h4>
                  <p className="text-xs sm:text-sm text-green-700">This condition appears non-urgent. Follow these recommendations:</p>
                  <ul className="list-disc list-inside text-xs text-green-700 mt-1 space-y-1">
                    <li>{result.triageResult.action}</li>
                    <li>Monitor for any changes</li>
                    <li>Consult if symptoms persist</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer - Stacked on mobile */}
      <div className="flex flex-col sm:flex-row justify-between items-center pt-3 sm:pt-4 border-t border-gray-200 text-xs sm:text-sm text-gray-500">
        <div className="mb-2 sm:mb-0">
          <span>AI Assessment Generated: {new Date().toLocaleString()}</span>
        </div>
        <div className="flex space-x-2 sm:space-x-4">
          <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-xs sm:text-sm">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </button>
          <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center text-xs sm:text-sm">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Share
          </button>
        </div>
      </div>
    </div>
  </motion.div>
);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto"
      >
        {/* Form Card - Mobile optimized */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          {/* Header - Mobile compact */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4 sm:p-6 text-white">
            <motion.h1 
              className="text-2xl sm:text-3xl font-bold text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <FaHeartbeat className="inline-block mr-2 sm:mr-3" />
              Symptom Triage
            </motion.h1>
            <motion.p 
              className="text-center mt-1 sm:mt-2 text-sm sm:text-base text-blue-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              AI-powered medical guidance
            </motion.p>
          </div>

          {/* Main Form - Mobile optimized */}
          <div className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Language Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Select Language:
                </label>
                <select
                  className="w-full p-2 sm:p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
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

              {/* Symptoms Input - Mobile optimized */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Describe Your Symptoms:
                </label>
                <textarea
                  className="w-full p-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px] sm:min-h-[150px] pr-12 sm:pr-16 bg-white"
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
                
                {/* Voice Input Button - Mobile compact */}
                <motion.button
                  type="button"
                  onClick={toggleRecording}
                  className={`absolute right-2 bottom-2 p-2 sm:p-3 rounded-full ${
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
                        <FaMicrophoneSlash className="text-base" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="start"
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0.8 }}
                      >
                        <FaMicrophone className="text-base" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
                
                {isRecording && (
                  <div className="absolute left-3 bottom-3 flex items-center text-xs sm:text-sm text-red-600">
                    <FaSpinner className="animate-spin mr-1" />
                    Listening...
                  </div>
                )}
              </div>

              {/* Submit Button - Mobile optimized */}
              <motion.button
                type="submit"
                className={`w-full py-3 px-4 sm:py-4 sm:px-6 text-sm sm:text-base rounded-lg font-bold text-white ${
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
                    Analyzing...
                  </span>
                ) : (
                  'Get Triage Assessment'
                )}
              </motion.button>
            </form>

            {/* Browser Support Warning - Mobile compact */}
            {!browserSupportsSpeech && (
              <div className="mt-3 p-2 sm:p-3 bg-yellow-50 border-l-4 border-yellow-400 text-xs sm:text-sm text-yellow-700 rounded">
                <p>Voice input not supported. Please type your symptoms.</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Section - Mobile optimized */}
        <div className="mt-6">
          {showOfflineSaved && !offlineManager.isOnline() && (
            <div className="mb-3 p-3 bg-yellow-50 border-l-4 border-yellow-400 text-xs sm:text-sm text-yellow-800 rounded">
              Saved locally - will sync when online
            </div>
          )}
          {syncedResults.length > 0 && (
            <div className="mb-4">
              <h2 className="text-base sm:text-lg font-bold text-green-700">Recently Synced Results</h2>
              {syncedResults.map((res, idx) =>
                res.data && res.data.triageResult ? (
                  renderTriageResultCard(res.data)
                ) : (
                  <div key={res.id || idx} className="p-3 my-2 bg-red-50 border border-red-200 rounded text-xs sm:text-sm">
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