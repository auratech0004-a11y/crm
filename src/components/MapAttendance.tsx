import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { storage } from '@/lib/store';
import { Employee, Attendance } from '@/types';
import { toast } from 'sonner';
import { MapPin, Check, X } from 'lucide-react';

// Fix for default marker icons in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapAttendanceProps {
  user: Employee;
  onComplete: () => void;
  onCancel: () => void;
}

const MapAttendance: React.FC<MapAttendanceProps> = ({ user, onComplete, onCancel }) => {
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    getLocation();
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
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${loc.lat}&lon=${loc.lng}`
            );
            const data = await response.json();
            if (data.display_name) {
              loc.address = data.display_name;
            } else {
              loc.address = `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
            }
          } catch {
            loc.address = `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
          }

          setLocation(loc);
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
          setMapError(true);
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
      setMapError(true);
      setIsLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!location) {
      toast.error('Location not available');
      return;
    }

    const newAttendance: Attendance = {
      id: Math.random().toString(36).substr(2, 9),
      employeeId: user.id,
      date: new Date().toISOString().split('T')[0],
      checkIn: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      status: 'Present',
      method: 'Manual',
      location: {
        lat: location.lat,
        lng: location.lng,
        address: location.address
      }
    };

    const success = await storage.addAttendance(newAttendance);
    if (success) {
      toast.success('Attendance marked successfully!');
      onComplete();
    } else {
      toast.error('Failed to mark attendance');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-slide-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-foreground">Location Check-In</h1>
            <p className="text-muted-foreground mt-1">Mark your attendance with GPS verification</p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
          <div className="w-full h-96 flex items-center justify-center bg-secondary">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
              <p className="text-muted-foreground font-medium">Getting your location...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-foreground">Location Check-In</h1>
          <p className="text-muted-foreground mt-1">Mark your attendance with GPS verification</p>
        </div>
      </div>
      
      {/* Map Container */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-card">
        <div className="w-full h-96 relative">
          {location ? (
            <MapContainer 
              center={[location.lat, location.lng]} 
              zoom={13} 
              style={{ height: '100%', width: '100%' }}
              className="rounded-t-3xl"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[location.lat, location.lng]}>
                <Popup>
                  Your Location: {location.address}
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-secondary">
              <p className="text-muted-foreground">Map not available</p>
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
          <X className="w-5 h-5" /> Cancel
        </button>
        <button
          onClick={handleCheckIn}
          className="py-4 gradient-primary text-primary-foreground rounded-2xl font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Check className="w-5 h-5" /> Check In
        </button>
      </div>
    </div>
  );
};

export default MapAttendance;