import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { MapPin } from 'lucide-react';
import { calculateDistance, geocodeLocation } from '@/utils/locationUtils';
import { useProfile } from '@/hooks/useProfile';

interface LocationFilterProps {
  onFilterChange: (filter: { enabled: boolean; radius: number; userCoords: { lat: number; lng: number } | null }) => void;
  className?: string;
}

export const LocationFilter: React.FC<LocationFilterProps> = ({ onFilterChange, className }) => {
  const { profile } = useProfile();
  const [locationFilterEnabled, setLocationFilterEnabled] = useState(false);
  const [radius, setRadius] = useState([25]); // Default 25 mile radius
  const [userCoordinates, setUserCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const loadUserLocation = async () => {
      if (profile?.location) {
        const coords = await geocodeLocation(profile.location);
        setUserCoordinates(coords);
      }
    };

    if (profile?.location) {
      loadUserLocation();
    }
  }, [profile?.location]);

  useEffect(() => {
    onFilterChange({
      enabled: locationFilterEnabled && !!userCoordinates,
      radius: radius[0],
      userCoords: userCoordinates
    });
  }, [locationFilterEnabled, radius, userCoordinates, onFilterChange]);

  if (!profile?.location) {
    return (
      <div className={`p-4 border border-muted rounded-lg bg-muted/50 ${className}`}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">Add your location in Settings to filter events by distance</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          <Label htmlFor="location-filter" className="text-sm font-medium">
            Filter by location
          </Label>
        </div>
        <Switch
          id="location-filter"
          checked={locationFilterEnabled}
          onCheckedChange={setLocationFilterEnabled}
        />
      </div>
      
      {locationFilterEnabled && (
        <div className="space-y-3 pl-6">
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            Your location: {profile.location}
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Radius</Label>
              <span className="text-sm text-muted-foreground">{radius[0]} miles</span>
            </div>
            <Slider
              value={radius}
              onValueChange={setRadius}
              max={100}
              min={5}
              step={5}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};