import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaPhone, FaDirections, FaAmbulance, FaHospital, FaMapMarkerAlt } from 'react-icons/fa';

// Extended hospital data with contact info and services
const hospitals = [
  {
    id: 101,
    name: 'Clinique Lumière',
    type: 'clinic',
    address: 'Delmas 75, Port-au-Prince',
    lat: 18.5432,
    lng: -72.3021,
    phone: '+509 3821 4567',
    emergency: null,
    services: ['General Medicine', 'Pediatrics', 'Vaccinations'],
    hours: 'Mon-Fri: 7am-5pm, Sat: 8am-1pm',
    distance: null,
    rating: 4.2
  },
  {
    id: 1,
    name: 'Hôpital Universitaire de Mirebalais',
    address: 'Mirebalais, Haiti',
    lat: 18.8345,
    lng: -72.1065,
    phone: '+509 2811 1111',
    ambulance: '+509 2811 1112',
    services: ['Emergency', 'Surgery', 'Pediatrics', 'Pharmacy'],
    distance: null
  },
  {
    id: 2,
    name: 'Hôpital Saint Boniface',
    address: 'Fond-des-Blancs, Haiti',
    lat: 18.2833,
    lng: -73.0333,
    phone: '+509 2812 2222',
    ambulance: '+509 2812 2223',
    services: ['Emergency', 'Maternity', 'Laboratory'],
    distance: null
  },
  {
    id: 3,
    name: 'Hôpital Bernard Mevs',
    address: 'Port-au-Prince, Haiti',
    lat: 18.5447,
    lng: -72.3386,
    phone: '+509 2813 3333',
    ambulance: '+509 2813 3334',
    services: ['Trauma Center', 'ICU', 'Burn Unit'],
    distance: null
  },
  {
    id: 4,
    name: 'Hôpital Sainte-Thérèse',
    address: 'Hinche, Haiti',
    lat: 19.1442,
    lng: -72.0061,
    phone: '+509 2814 4444',
    ambulance: '+509 2814 4445',
    services: ['General Medicine', 'Pediatrics', 'Pharmacy'],
    distance: null
  },
  {
    id: 5,
    name: 'Hôpital La Providence',
    address: 'Gonaïves, Haiti',
    lat: 19.4456,
    lng: -72.6886,
    phone: '+509 2815 5555',
    ambulance: '+509 2815 5556',
    services: ['Emergency', 'Surgery', 'Radiology'],
    distance: null
  },
  // Additional hospitals within potential 15km radius
  {
    id: 6,
    name: 'Centre Médical Communautaire',
    address: 'Croix-des-Bouquets, Haiti',
    lat: 18.5765,
    lng: -72.2263,
    phone: '+509 2816 6666',
    ambulance: '+509 2816 6667',
    services: ['Primary Care', 'Pediatrics', 'Pharmacy'],
    distance: null
  },
  {
    id: 7,
    name: 'Clinique Espoir',
    address: 'Carrefour, Haiti',
    lat: 18.5341,
    lng: -72.4094,
    phone: '+509 2817 7777',
    ambulance: '+509 2817 7778',
    services: ['Urgent Care', 'Laboratory'],
    distance: null
  },
  {
    id: 201,
    name: 'Pharmacie Bon Samaritain',
    type: 'pharmacy',
    address: 'Rue Capois, Port-au-Prince',
    lat: 18.5412,
    lng: -72.3389,
    phone: '+509 3845 6789',
    emergency: null,
    services: ['Prescriptions', 'Over-the-counter'],
    hours: 'Mon-Sun: 7am-9pm',
    distance: null,
    rating: 4.0
  },
  {
    id: 301,
    name: 'Centre de Traumatologie',
    type: 'trauma-center',
    address: 'Tabarre, Port-au-Prince',
    lat: 18.5798,
    lng: -72.2665,
    phone: '+509 3100 1234',
    emergency: '+509 3100 1235',
    services: ['Trauma Care', 'Orthopedics', 'Rehabilitation'],
    hours: '24/7',
    distance: null,
    rating: 4.7
  }
];

const haitiCenter = [18.9712, -72.2852];

// Custom hospital icon
const hospitalIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/484/484167.png',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

export default function ClinicLocator() {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [radius, setRadius] = useState(15); // 15km radius
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);

  // Calculate distance between two coordinates in km
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Initialize map
  useEffect(() => {
    if (!mapRef.current) {
      mapRef.current = L.map('clinic-map', {
        center: haitiCenter,
        zoom: 10,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(mapRef.current);

      // Add hospital markers
      hospitals.forEach((hospital) => {
        L.marker([hospital.lat, hospital.lng], { icon: hospitalIcon })
          .addTo(mapRef.current)
          .bindPopup(`<b>${hospital.name}</b><br/>${hospital.address}`)
          .on('click', () => {
            setSelectedHospital(hospital);
          });
      });
    }

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(location);
          mapRef.current.setView(location, 12);
          
          // Add user location marker
          const userMarker = L.circleMarker(location, {
            radius: 8,
            color: '#2563eb',
            fillColor: '#3b82f6',
            fillOpacity: 0.8,
          }).addTo(mapRef.current);
          userMarker.bindPopup('Your Location');

          // Add radius circle
          L.circle(location, {
            color: '#3b82f6',
            fillColor: '#93c5fd',
            fillOpacity: 0.2,
            radius: radius * 1000 // Convert km to meters
          }).addTo(mapRef.current);

          // Calculate distances and filter hospitals
          const hospitalsWithDistance = hospitals.map(hospital => ({
            ...hospital,
            distance: calculateDistance(
              pos.coords.latitude,
              pos.coords.longitude,
              hospital.lat,
              hospital.lng
            )
          }));

          const nearby = hospitalsWithDistance
            .filter(h => h.distance <= radius)
            .sort((a, b) => a.distance - b.distance);

          setNearbyHospitals(nearby);
          setLoading(false);
        },
        (err) => {
          console.error("Error getting location:", err);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLoading(false);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [radius]);

  const getDirections = (hospital) => {
    if (!userLocation) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${hospital.lat},${hospital.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-2">Emergency Medical Facilities Locator</h1>
        <p className="text-gray-600 mb-6">Find hospitals within a 15km radius of your location</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-blue-700">Interactive Map</h2>
                <div className="flex items-center">
                  <label htmlFor="radius" className="mr-2 text-sm text-gray-600">Radius:</label>
                  <select 
                    id="radius"
                    value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="5">5 km</option>
                    <option value="10">10 km</option>
                    <option value="15">15 km</option>
                    <option value="20">20 km</option>
                  </select>
                </div>
              </div>
              <div id="clinic-map" className="w-full h-[500px] rounded-lg overflow-hidden" />
              <div className="mt-3 text-sm text-gray-500 flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="mr-4">Your Location</span>
                <img src="https://cdn-icons-png.flaticon.com/512/484/484167.png" alt="Hospital" className="w-4 h-4 mr-2" />
                <span>Medical Facilities</span>
              </div>
            </div>
          </div>

          {/* Hospitals List */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center">
              <FaHospital className="mr-2 text-blue-500" />
              Nearby Medical Facilities ({nearbyHospitals.length})
            </h2>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : userLocation ? (
              nearbyHospitals.length > 0 ? (
                <div className="space-y-4">
                  {nearbyHospitals.map(hospital => (
                    <div 
                      key={hospital.id} 
                      className={`p-4 rounded-lg border ${selectedHospital?.id === hospital.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                      onClick={() => setSelectedHospital(hospital)}
                    >
                      <h3 className="font-bold text-blue-800">{hospital.name}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1">
                        <FaMapMarkerAlt className="mr-1" />
                        <span>{hospital.distance.toFixed(1)} km away</span>
                      </div>
                      <div className="mt-2 text-sm">
                        <div className="flex items-center">
                          <FaPhone className="text-blue-500 mr-2" />
                          <a href={`tel:${hospital.phone}`} className="text-blue-600 hover:underline">
                            {hospital.phone}
                          </a>
                        </div>
                        <div className="flex items-center mt-1">
                          <FaAmbulance className="text-red-500 mr-2" />
                          <span className="text-red-600">{hospital.ambulance}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button 
                          onClick={() => getDirections(hospital)}
                          className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                        >
                          <FaDirections className="mr-1" /> Get Directions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No hospitals found within {radius} km radius.
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                Please enable location services to see nearby hospitals.
              </div>
            )}

            {/* Emergency Contacts */}
            <div className="mt-8">
              <h3 className="font-semibold text-red-700 mb-2">Emergency Contacts</h3>
              <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                <div className="flex items-center mb-1">
                  <FaAmbulance className="text-red-500 mr-2" />
                  <span className="font-medium">National Ambulance:</span>
                  <a href="tel:116" className="ml-2 text-red-600">116</a>
                </div>
                <div className="flex items-center">
                  <FaPhone className="text-red-500 mr-2" />
                  <span className="font-medium">Emergency Police:</span>
                  <a href="tel:114" className="ml-2 text-red-600">114</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Hospital Details */}
        {selectedHospital && (
          <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-blue-800">{selectedHospital.name}</h2>
                <p className="text-gray-600 mt-1">
                  <FaMapMarkerAlt className="inline mr-1" />
                  {selectedHospital.address} • {selectedHospital.distance?.toFixed(1) || '--'} km away
                </p>
              </div>
              <button 
                onClick={() => getDirections(selectedHospital)}
                className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                <FaDirections className="mr-2" /> Directions
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Contact Information</h3>
                <ul className="space-y-2">
                  <li className="flex items-center">
                    <FaPhone className="text-blue-500 mr-2" />
                    <a href={`tel:${selectedHospital.phone}`} className="text-blue-600 hover:underline">
                      {selectedHospital.phone}
                    </a>
                  </li>
                  <li className="flex items-center">
                    <FaAmbulance className="text-red-500 mr-2" />
                    <span>Ambulance: {selectedHospital.ambulance}</span>
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Available Services</h3>
                <ul className="space-y-1">
                  {selectedHospital.services.map((service, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      {service}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800 mb-2">Quick Actions</h3>
                <div className="space-y-2">
                  <button className="w-full flex items-center justify-center bg-blue-100 text-blue-700 px-3 py-2 rounded hover:bg-blue-200">
                    <FaPhone className="mr-2" /> Call Hospital
                  </button>
                  <button 
                    onClick={() => getDirections(selectedHospital)}
                    className="w-full flex items-center justify-center bg-green-100 text-green-700 px-3 py-2 rounded hover:bg-green-200"
                  >
                    <FaDirections className="mr-2" /> Get Directions
                  </button>
                  <button className="w-full flex items-center justify-center bg-red-100 text-red-700 px-3 py-2 rounded hover:bg-red-200">
                    <FaAmbulance className="mr-2" /> Call Ambulance
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}