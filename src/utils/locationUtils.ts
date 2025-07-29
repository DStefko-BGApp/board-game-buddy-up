// Utility function to calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in miles
  return distance;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Parse location string to extract city and state
export function parseLocation(location: string): { city: string; state: string } | null {
  if (!location) return null;
  
  // Handle various formats: "City, State", "City State", "City, ST"
  const parts = location.split(',').map(part => part.trim());
  
  if (parts.length >= 2) {
    return {
      city: parts[0],
      state: parts[1]
    };
  }
  
  // Try space-separated format
  const spaceParts = location.split(' ');
  if (spaceParts.length >= 2) {
    const state = spaceParts[spaceParts.length - 1];
    const city = spaceParts.slice(0, -1).join(' ');
    return { city, state };
  }
  
  return null;
}

// Geocoding function (mock implementation - in real app would use geocoding service)
export async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  // This is a mock implementation
  // In a real app, you'd use a geocoding service like Mapbox, Google Maps, or similar
  
  // For demo purposes, return some mock coordinates for common cities
  const mockCoordinates: Record<string, { lat: number; lng: number }> = {
    'nashville, tn': { lat: 36.1627, lng: -86.7816 },
    'nashvegas, tn': { lat: 36.1627, lng: -86.7816 },
    'new york, ny': { lat: 40.7128, lng: -74.0060 },
    'los angeles, ca': { lat: 34.0522, lng: -118.2437 },
    'chicago, il': { lat: 41.8781, lng: -87.6298 },
    'austin, tx': { lat: 30.2672, lng: -97.7431 },
    'seattle, wa': { lat: 47.6062, lng: -122.3321 },
    'denver, co': { lat: 39.7392, lng: -104.9903 },
    'atlanta, ga': { lat: 33.7490, lng: -84.3880 },
  };
  
  const key = location.toLowerCase().trim();
  return mockCoordinates[key] || null;
}