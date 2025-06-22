import React, { useEffect, useRef, useState } from 'react';
import { FaPhone, FaDirections, FaAmbulance, FaHospital, FaMapMarkerAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';

// Custom hospital icon URL
const HOSPITAL_ICON_URL = 'https://cdn-icons-png.flaticon.com/512/484/484167.png';

export default function ClinicLocator() {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyHospitals, setNearbyHospitals] = useState([]);
  const [radius, setRadius] = useState(15000); // in meters for Google Places API
  const [loading, setLoading] = useState(true);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [showHospitalList, setShowHospitalList] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [service, setService] = useState(null);

  // Load Google Maps API
  useEffect(() => {
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;

      script.async = true;
      script.onload = () => {
        setGoogleMapsLoaded(true);
        setService(new window.google.maps.places.PlacesService(document.createElement('div')));
      };
      document.head.appendChild(script);
    } else {
      setGoogleMapsLoaded(true);
      setService(new window.google.maps.places.PlacesService(document.createElement('div')));
    }

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Find nearby hospitals using Google Places API
  const findNearbyHospitals = (location) => {
    if (!service || !googleMapsLoaded) return;

    const request = {
      location: new window.google.maps.LatLng(location[0], location[1]),
      radius: radius,
      type: 'hospital',
      keyword: 'hospital|clinic|medical center|pharmacy'
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        const hospitalsWithDetails = results.map(place => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          rating: place.rating,
          distance: calculateDistance(
            location[0],
            location[1],
            place.geometry.location.lat(),
            place.geometry.location.lng()
          )
        }));

        // Sort by distance
        const sortedHospitals = hospitalsWithDetails.sort((a, b) => a.distance - b.distance);
        setNearbyHospitals(sortedHospitals);
        
        // Add markers to map
        addMarkersToMap(sortedHospitals);
      } else {
        console.error('Google Places API error:', status);
      }
      setLoading(false);
    });
  };

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

  // Initialize map and markers
  const initializeMap = (location) => {
    if (!window.google) return;

    const map = new window.google.maps.Map(document.getElementById('clinic-map'), {
      center: { lat: location[0], lng: location[1] },
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false
    });

    // Add user location marker
    new window.google.maps.Marker({
      position: { lat: location[0], lng: location[1] },
      map: map,
      title: 'Your Location',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#3b82f6',
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: '#ffffff'
      }
    });

    // Add radius circle
    new window.google.maps.Circle({
      strokeColor: '#3b82f6',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: '#93c5fd',
      fillOpacity: 0.2,
      map: map,
      center: { lat: location[0], lng: location[1] },
      radius: radius
    });

    mapRef.current = map;
  };

  // Add markers to the map
  const addMarkersToMap = (hospitals) => {
    if (!mapRef.current) return;

    hospitals.forEach(hospital => {
      const marker = new window.google.maps.Marker({
        position: { lat: hospital.lat, lng: hospital.lng },
        map: mapRef.current,
        title: hospital.name,
        icon: {
          url: HOSPITAL_ICON_URL,
          scaledSize: new window.google.maps.Size(32, 32)
        }
      });

      // Add click event to show hospital details
      marker.addListener('click', () => {
        setSelectedHospital(hospital);
        if (window.innerWidth < 768) {
          setShowHospitalList(true);
        }
      });
    });
  };

  // Get user location and initialize map
  useEffect(() => {
    if (!googleMapsLoaded) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(location);
          initializeMap(location);
          findNearbyHospitals(location);
        },
        (err) => {
          console.error("Error getting location:", err);
          setLoading(false);
          // Fallback to default location if geolocation fails
          const defaultLocation = [18.9712, -72.2852]; // Haiti center
          setUserLocation(defaultLocation);
          initializeMap(defaultLocation);
          findNearbyHospitals(defaultLocation);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setLoading(false);
      // Fallback to default location if geolocation not supported
      const defaultLocation = [18.9712, -72.2852]; // Haiti center
      setUserLocation(defaultLocation);
      initializeMap(defaultLocation);
      findNearbyHospitals(defaultLocation);
    }
  }, [googleMapsLoaded, radius]);

  const getDirections = (hospital) => {
    if (!userLocation || !hospital) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${hospital.lat},${hospital.lng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const getPlaceDetails = (placeId) => {
    return new Promise((resolve) => {
      if (!service) return resolve(null);
      
      const request = {
        placeId: placeId,
        fields: ['formatted_phone_number', 'opening_hours', 'website']
      };

      service.getDetails(request, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK) {
          resolve(place);
        } else {
          resolve(null);
        }
      });
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Mobile Header */}
        <div className="md:hidden mb-4">
          <h1 className="text-2xl font-bold text-blue-800">Medical Facilities Locator</h1>
          <p className="text-sm text-gray-600">Find hospitals near you</p>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block mb-6">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">Emergency Medical Facilities Locator</h1>
          <p className="text-gray-600">Find hospitals within a {radius/1000}km radius of your location</p>
        </div>

        {/* Mobile Map Toggle */}
        <div className="md:hidden mb-4 flex justify-between items-center">
          <div className="flex items-center">
            <label htmlFor="radius" className="mr-2 text-sm text-gray-600">Radius (km):</label>
            <select 
              id="radius"
              value={radius/1000}
              onChange={(e) => setRadius(Number(e.target.value) * 1000)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </div>
          <button 
            onClick={() => setShowHospitalList(!showHospitalList)}
            className="flex items-center text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded"
          >
            {showHospitalList ? 'Show Map' : 'Show List'}
            {showHospitalList ? <FaChevronDown className="ml-1" /> : <FaChevronUp className="ml-1" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
          {/* Map Section */}
          <div className={`${showHospitalList ? 'hidden md:block' : ''} md:col-span-2`}>
            <div className="bg-white p-3 md:p-4 rounded-xl shadow-lg border border-gray-200">
              <h2 className="hidden md:block text-xl font-semibold text-blue-700 mb-4">Interactive Map</h2>
              <div id="clinic-map" className="w-full h-[300px] md:h-[500px] rounded-lg overflow-hidden" />
              <div className="mt-2 text-xs md:text-sm text-gray-500 flex items-center">
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-blue-500 mr-1 md:mr-2"></div>
                <span className="mr-2 md:mr-4">Your Location</span>
                <img src={HOSPITAL_ICON_URL} alt="Hospital" className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                <span>Medical Facilities</span>
              </div>
            </div>
          </div>

          {/* Hospitals List */}
          <div className={`${!showHospitalList ? 'hidden md:block' : ''} bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg md:text-xl font-semibold text-blue-700 flex items-center">
                <FaHospital className="mr-2 text-blue-500" />
                Nearby ({nearbyHospitals.length})
              </h2>
              <div className="hidden md:block">
                <label htmlFor="radius-desktop" className="mr-2 text-sm text-gray-600">Radius (km):</label>
                <select 
                  id="radius-desktop"
                  value={radius/1000}
                  onChange={(e) => setRadius(Number(e.target.value) * 1000)}
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="15">15</option>
                  <option value="20">20</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : userLocation ? (
              nearbyHospitals.length > 0 ? (
                <div className="space-y-3 md:space-y-4 max-h-[400px] overflow-y-auto">
                  {nearbyHospitals.map(hospital => (
                    <div 
                      key={hospital.id} 
                      className={`p-3 md:p-4 rounded-lg border cursor-pointer ${
                        selectedHospital?.id === hospital.id ? 
                        'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedHospital(hospital)}
                    >
                      <h3 className="font-bold text-sm md:text-base text-blue-800">{hospital.name}</h3>
                      <div className="flex items-center text-xs md:text-sm text-gray-600 mt-1">
                        <FaMapMarkerAlt className="mr-1" />
                        <span>{hospital.distance.toFixed(1)} km away</span>
                        {hospital.rating && (
                          <span className="ml-2 text-yellow-600">★ {hospital.rating}</span>
                        )}
                      </div>
                      <div className="mt-2 text-xs md:text-sm">
                        <div className="flex items-center">
                          <FaMapMarkerAlt className="text-gray-500 mr-1 md:mr-2" />
                          <span className="text-gray-600">{hospital.address}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            getDirections(hospital);
                          }}
                          className="flex items-center text-xs md:text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                        >
                          <FaDirections className="mr-1" /> Directions
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm md:text-base">
                  No hospitals found within {radius/1000} km radius.
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm md:text-base">
                Please enable location services to see nearby hospitals.
              </div>
            )}

            {/* Emergency Contacts */}
            <div className="mt-6">
              <h3 className="font-semibold text-red-700 text-sm md:text-base mb-2">Emergency Contacts</h3>
              <div className="bg-red-50 p-2 md:p-3 rounded-lg border border-red-100 text-xs md:text-sm">
                <div className="flex items-center mb-1">
                  <FaAmbulance className="text-red-500 mr-1 md:mr-2" />
                  <span className="font-medium">National Ambulance:</span>
                  <a href="tel:116" className="ml-1 md:ml-2 text-red-600">116</a>
                </div>
                <div className="flex items-center">
                  <FaPhone className="text-red-500 mr-1 md:mr-2" />
                  <span className="font-medium">Emergency Police:</span>
                  <a href="tel:114" className="ml-1 md:ml-2 text-red-600">114</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Hospital Details */}
        {selectedHospital && (
          <div className={`${window.innerWidth < 768 ? 'fixed inset-x-0 bottom-0 bg-white p-4 rounded-t-xl shadow-2xl border-t border-gray-200 z-50' : 'mt-6 bg-white p-4 md:p-6 rounded-xl shadow-lg border border-gray-200'}`}>
            {window.innerWidth < 768 && (
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-blue-800">{selectedHospital.name}</h2>
                <button 
                  onClick={() => setSelectedHospital(null)}
                  className="text-gray-500"
                >
                  ✕
                </button>
              </div>
            )}
            
            <div className="md:flex md:justify-between md:items-start">
              <div>
                <h2 className="hidden md:block text-xl md:text-2xl font-bold text-blue-800">{selectedHospital.name}</h2>
                <p className="text-gray-600 text-xs md:text-sm mt-1">
                  <FaMapMarkerAlt className="inline mr-1" />
                  {selectedHospital.address} • {selectedHospital.distance?.toFixed(1) || '--'} km away
                </p>
                {selectedHospital.rating && (
                  <p className="text-yellow-600 text-xs md:text-sm mt-1">
                    ★ {selectedHospital.rating} Rating
                  </p>
                )}
              </div>
              <button 
                onClick={() => getDirections(selectedHospital)}
                className="w-full md:w-auto flex items-center justify-center bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 mt-2 md:mt-0 text-sm md:text-base"
              >
                <FaDirections className="mr-2" /> Directions
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <h3 className="font-semibold text-blue-800 text-sm md:text-base mb-1 md:mb-2">Location</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  <FaMapMarkerAlt className="inline mr-1" />
                  {selectedHospital.address}
                </p>
              </div>

              <div className="bg-green-50 p-3 rounded-lg">
                <h3 className="font-semibold text-green-800 text-sm md:text-base mb-1 md:mb-2">Details</h3>
                <p className="text-xs md:text-sm text-gray-600">
                  {selectedHospital.distance?.toFixed(1) || '--'} km away
                </p>
                {selectedHospital.rating && (
                  <p className="text-xs md:text-sm text-gray-600 mt-1">
                    Rating: ★ {selectedHospital.rating}
                  </p>
                )}
              </div>

              <div className="bg-yellow-50 p-3 rounded-lg">
                <h3 className="font-semibold text-yellow-800 text-sm md:text-base mb-1 md:mb-2">Actions</h3>
                <div className="space-y-1 md:space-y-2">
                  <button 
                    onClick={() => getDirections(selectedHospital)}
                    className="w-full flex items-center justify-center bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 text-xs md:text-sm"
                  >
                    <FaDirections className="mr-1 md:mr-2" /> Directions
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