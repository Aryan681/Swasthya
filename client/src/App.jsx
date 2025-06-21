import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import TriagePage from './pages/TriagePage';
import ClinicLocator from './pages/MapPage';
import AboutPage from './pages/AboutPage';
import ConnectionBanner from './components/ConnectionBanner';
import SyncButton from './components/SyncButton';
import './App.css';

function App() {
  const [syncedResults, setSyncedResults] = useState([]);
  return (
    <>
      <ConnectionBanner />
      <SyncButton apiUrl={`${import.meta.env.VITE_BACKEND_URL}/api/triage`} onResults={setSyncedResults} />

      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/triage" element={<TriagePage syncedResults={syncedResults} />} />
        <Route path="/map" element={<ClinicLocator />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </>
  );
}

export default App;
