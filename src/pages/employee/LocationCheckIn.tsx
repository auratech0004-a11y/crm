import React, { useState, useEffect, useRef } from 'react';
import { Employee, Attendance } from '@/types';
import { storage } from '@/lib/store';
import { MapPin, Check, X, Loader2, Navigation } from 'lucide-react';
import { toast } from 'sonner';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationCheckInProps {
  user: Employee;
  onComplete: () => void;
  onCancel: () => void;
}

const MAPBOX_TOKEN = 'pk.eyJ1IjoibG92YWJsZS1kZW1vIiwiYSI6ImNsczVhOWxsMDA4OHAya3BjMnlhbjBjMHYifQ.gVng8mPx0gX9GXyG_Yw9Yw';

const LocationCheckIn: React.FC<LocationCheckInProps> = ({ user, onComplete, onCancel }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        zoom: 15,
        center: [67.0011, 24.8607], // Default Karachi
        pitch: 45,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        'top-right'
      );

      map.current.on('load', () => {
        setMapLoaded(true);
        // If no location yet, fetch; otherwise the next effect/update will position
        if (!location) {
          getLocation();
        }
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError(true);
        // Still allow location check-in even if map fails
        setIsLoading(false);
      });

      // Kick off location immediately; do not wait for map style load
      getLocation();
    } catch (err) {
      console.error('Map init error:', err);
      setMapError(true);
      setIsLoading(false);
    }

    return () => {
      marker.current?.remove();
      map.current?.remove();
    };
  }, []);

  const getLocation = () => {
    setIsLoading(true);
    
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            address: ''
          };
          
          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${loc.lng},${loc.lat}.json?access_token=${MAPBOX_TOKEN}`
            );
            const data = await response.json();
            if (data.features && data.features.length > 0) {
              loc.address = data.features[0].place_name;
            } else {
              loc.address = `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
            }
          } catch {
            loc.address = `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
          }
          
          setLocation(loc);
          updateMap(loc);
          setIsLoading(false);
        },
        (error) => {
          console.error('Location error:', error);
          const defaultLoc = {
            lat: 24.8607,
            lng: 67.0011,
            address: 'Karachi, Pakistan (Default Location)'
          };
          setLocation(defaultLoc);
          updateMap(defaultLoc);
          setIsLoading(false);
          toast.error('Could not get your location. Using default.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      const defaultLoc = {
        lat: 24.8607,
        lng: 67.0011,
        address: 'Karachi, Pakistan (Default Location)'
      };
      setLocation(defaultLoc);
      updateMap(defaultLoc);
      setIsLoading(false);
    }
  };

  const updateMap = (loc: { lat: number; lng: number }) => {
    if (!map.current || !mapLoaded) return;

    map.current.flyTo({
      center: [loc.lng, loc.lat],
      zoom: 16,
      pitch: 60,
      bearing: -20,
      duration: 2000
    });

    // Remove existing marker
    marker.current?.remove();

    // Add pulsing dot marker
    const el = document.createElement('div');
    el.className = 'location-marker';
    el.innerHTML = `
      <div style="
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)));
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 20px rgba(0,0,0,0.3);
        animation: pulse 2s infinite;
      "></div>
    `;

    marker.current = new mapboxgl.Marker(el)
      .setLngLat([loc.lng, loc.lat])
      .addTo(map.current);
  };

  const handleCheckIn = () => {
    if (!location) {
      getLocation();
      return;
    }

    const newAttendance: Attendance = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: user.id,
      date: new Date().toISOString().split('T')[0],
      checkIn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'Present',
      method: 'Manual',
      location
    };

    const allAttendance = storage.getAttendance();
    storage.setAttendance([...allAttendance, newAttendance]);
    storage.addLog('Check-In', `${user.name} checked in at ${location.address}`, user.name);
    
    toast.success('Attendance marked successfully!');
    onComplete();
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">Location Check-In</h1>
          <p className="text-muted-foreground mt-1">Mark your attendance with GPS verification</p>
        </div>
        <button
          onClick={getLocation}
          disabled={isLoading}
          className="p-3 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors"
        >
          <Navigation className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Full Map */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
        <div 
          ref={mapContainer} 
          className="w-full h-[400px] relative"
        >
          {isLoading && (
            <div className="absolute inset-0 bg-secondary/80 backdrop-blur-sm flex items-center justify-center z-10">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-3" />
                <p className="text-muted-foreground font-medium">Getting your location...</p>
              </div>
            </div>
          )}
          {mapError && (
            <div className="absolute top-3 left-3 z-20 px-3 py-2 rounded-lg bg-destructive/10 text-destructive text-xs font-bold border border-destructive/20">
              Map failed to load. You can still check-in.
            </div>
          )}
        </div>
        
        {/* Location Info */}
        {location && (
          <div className="p-6 border-t border-border bg-secondary/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Your Location</p>
                <p className="text-foreground font-bold truncate">{location.address}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={onCancel}
          className="py-4 border border-border rounded-2xl font-bold text-muted-foreground hover:bg-secondary transition-colors flex items-center justify-center gap-2"
        >
          <X className="w-5 h-5" />
          Cancel
        </button>
        <button
          onClick={handleCheckIn}
          disabled={isLoading}
          className="py-4 gradient-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Check className="w-5 h-5" />
              Check In
            </>
          )}
        </button>
      </div>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LocationCheckIn;
