import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const clinics = [
  {
    name: 'Hôpital Universitaire de Mirebalais',
    address: 'Mirebalais, Haiti',
    lat: 18.8345,
    lng: -72.1065,
  },
  {
    name: 'Hôpital Saint Boniface',
    address: 'Fond-des-Blancs, Haiti',
    lat: 18.2833,
    lng: -73.0333,
  },
  {
    name: 'Hôpital Bernard Mevs',
    address: 'Port-au-Prince, Haiti',
    lat: 18.5447,
    lng: -72.3386,
  },
  {
    name: 'Hôpital Sainte-Thérèse',
    address: 'Hinche, Haiti',
    lat: 19.1442,
    lng: -72.0061,
  },
  {
    name: 'Hôpital La Providence',
    address: 'Gonaïves, Haiti',
    lat: 19.4456,
    lng: -72.6886,
  },
];

const haitiCenter = [18.9712, -72.2852];

export default function ClinicLocator() {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('clinic-map', {
        center: haitiCenter,
        zoom: 8,
        zoomControl: false,
      });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);
    }
    // Add clinic markers
    clinics.forEach((clinic) => {
      L.marker([clinic.lat, clinic.lng])
        .addTo(mapRef.current)
        .bindPopup(`<b>${clinic.name}</b><br/>${clinic.address}`);
    });
    // User location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        },
        () => {},
        { enableHighAccuracy: true }
      );
    }
    // Clean up on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (userLocation && mapRef.current) {
      const userMarker = L.circleMarker(userLocation, {
        radius: 8,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.8,
      }).addTo(mapRef.current);
      userMarker.bindPopup('Your Location');
      mapRef.current.setView(userLocation, 10);
      return () => userMarker.remove();
    }
  }, [userLocation]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Clinic Locator</h1>
      <div id="clinic-map" className="w-full max-w-3xl h-[500px] rounded-2xl shadow-lg border border-blue-100" />
      <div className="mt-6 text-gray-600 text-sm">Showing major clinics in Haiti. Your location is shown as a blue dot if permitted.</div>
    </div>
  );
} 