
import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, Loader2 } from "lucide-react";

// Declare the global Google Maps callback
declare global {
  interface Window {
    initMap: () => void;
    __googleMapsCallback: (e?: any) => void;
  }
}

export default function LocationFinder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const API_KEY = "AIzaSyD2vxA2-V5-DTLGF-hobxzGmmuHpCiK8h0"; // Replace with your Google Maps API key if needed

  // Load Google Maps script once
  useEffect(() => {
    // Early return if Maps API is already loading or loaded
    if (window.google?.maps || document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
      setMapLoaded(true);
      return;
    }
    
    const loadGoogleMaps = () => {
      setLoading(true);
      setError(null);
      
      // Define the callback function
      window.__googleMapsCallback = () => {
        setMapLoaded(true);
        setLoading(false);
      };

      // Create script element
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&loading=async&callback=__googleMapsCallback`;
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        setError("Failed to load Google Maps. Please check your internet connection.");
        setLoading(false);
      };
      
      document.head.appendChild(script);
    };
    
    loadGoogleMaps();
    
    // Cleanup function
    return () => {
      // Only remove the callback if we set it
      if (window.__googleMapsCallback) {
        window.__googleMapsCallback = () => {};
      }
    };
  }, [API_KEY]);

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;
    
    try {
      // Default location (New York City)
      const defaultLocation = { lat: 40.7128, lng: -74.006 };
      
      // Create a new map instance
      const mapOptions: google.maps.MapOptions = {
        center: location || defaultLocation,
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
      };
      
      if (!mapInstanceRef.current) {
        mapInstanceRef.current = new google.maps.Map(mapRef.current, mapOptions);
      } else {
        mapInstanceRef.current.setOptions(mapOptions);
      }
      
      // Create geocoder
      if (!geocoderRef.current) {
        geocoderRef.current = new google.maps.Geocoder();
      }
      
      // Add marker if we have a location
      if (location && mapInstanceRef.current) {
        if (markerRef.current) {
          markerRef.current.setPosition(location);
        } else {
          markerRef.current = new google.maps.Marker({
            position: location,
            map: mapInstanceRef.current,
            animation: google.maps.Animation.DROP,
            title: address || "Selected location",
          });
        }
        
        mapInstanceRef.current.setCenter(location);
      }
    } catch (err) {
      console.error("Error initializing map:", err);
      setError("Failed to initialize map");
    }
  }, [mapLoaded, location, address]);

  const searchLocation = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a location to search");
      return;
    }
    
    if (!geocoderRef.current || !mapInstanceRef.current) {
      setError("Map is not initialized yet");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await geocoderRef.current.geocode({ address: searchQuery });
      
      if (result.results && result.results[0]) {
        const place = result.results[0];
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        
        setLocation(newLocation);
        setAddress(place.formatted_address);
        
        // Update marker
        if (markerRef.current) {
          markerRef.current.setPosition(newLocation);
        } else {
          markerRef.current = new google.maps.Marker({
            position: newLocation,
            map: mapInstanceRef.current,
            animation: google.maps.Animation.DROP,
            title: place.formatted_address,
          });
        }
        
        mapInstanceRef.current.setCenter(newLocation);
        mapInstanceRef.current.setZoom(15);
      } else {
        setError("Location not found");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      setError("Failed to search for location");
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const userLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        
        setLocation(userLocation);
        
        // Reverse geocode to get the address
        if (geocoderRef.current) {
          try {
            const result = await geocoderRef.current.geocode({ location: userLocation });
            if (result.results && result.results[0]) {
              setAddress(result.results[0].formatted_address);
            }
          } catch (err) {
            console.error("Reverse geocoding error:", err);
          }
        }
        
        setLoading(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError(`Failed to get your location: ${err.message}`);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Location Finder</h1>
        <p className="text-muted-foreground">
          Find locations using Google Maps
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-primary" />
            Search Location
          </CardTitle>
          <CardDescription>
            Enter an address, city, or place name to find it on the map
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="Enter a location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && searchLocation()}
            />
            <div className="flex gap-2">
              <Button onClick={searchLocation} disabled={loading || !mapLoaded}>
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Search
              </Button>
              <Button
                variant="outline"
                onClick={getUserLocation}
                disabled={loading || !mapLoaded}
                title="Use your current location"
              >
                <MapPin className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-md">
              {error}
            </div>
          )}
          
          {address && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="font-medium">Found Address:</p>
              <p>{address}</p>
              {location && (
                <p className="text-xs text-muted-foreground mt-1">
                  Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div
            ref={mapRef}
            className="w-full rounded-md overflow-hidden"
            style={{ height: "400px" }}
          >
            {!mapLoaded && (
              <div className="flex items-center justify-center w-full h-full bg-muted">
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p>Loading map...</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
