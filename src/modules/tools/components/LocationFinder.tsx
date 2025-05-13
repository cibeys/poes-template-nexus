import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

// Define types for Google Maps
interface GoogleLatLng {
  lat: number;
  lng: number;
}

interface GoogleMapOptions {
  center: GoogleLatLng;
  zoom: number;
  disableDefaultUI?: boolean;
  zoomControl?: boolean;
}

interface GeocodeResult {
  formatted_address: string;
  geometry: {
    location: GoogleLatLng;
  };
}

export default function LocationFinder() {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  
  const { toast } = useToast();
  
  // Initialize map when component mounts
  useEffect(() => {
    if (!window.google || !mapRef.current) return;
    
    const mapOptions: GoogleMapOptions = {
      center: { lat: 40.7128, lng: -74.006 },
      zoom: 12,
      disableDefaultUI: true,
      zoomControl: true
    };
    
    // Create map instance
    const map = new window.google.maps.Map(mapRef.current, mapOptions);
    googleMapRef.current = map;
    
    // Create geocoder instance
    geocoderRef.current = new window.google.maps.Geocoder();
    
    // Try to get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          // Center map on user location
          map.setCenter(pos);
          
          // Create marker for user location
          const marker = new window.google.maps.Marker({
            position: pos,
            map,
            title: 'Your Location',
            animation: window.google.maps.Animation.DROP,
          });
          markerRef.current = marker;
          
          // Reverse geocode to get address
          reverseGeocode(pos);
        },
        () => {
          setError('Error: The Geolocation service failed.');
        }
      );
    } else {
      setError('Error: Your browser doesn\'t support geolocation.');
    }
    
    // Add click event listener to map
    map.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const clickedPos = {
          lat: e.latLng.lat(),
          lng: e.latLng.lng()
        };
        
        // Update marker position
        if (markerRef.current) {
          markerRef.current.setPosition(clickedPos);
        } else {
          markerRef.current = new window.google.maps.Marker({
            position: clickedPos,
            map: googleMapRef.current,
            animation: window.google.maps.Animation.DROP,
          });
        }
        
        // Reverse geocode to get address
        reverseGeocode(clickedPos);
      }
    });
  }, []);
  
  // Function to geocode an address and update the map
  const geocodeAddress = (address: string) => {
    if (!geocoderRef.current || !googleMapRef.current) return;
    
    setLoading(true);
    setError(null);
    
    geocoderRef.current.geocode({ address }, (results, status) => {
      setLoading(false);
      
      if (status === 'OK' && results && results.length > 0) {
        const location = results[0].geometry.location;
        const pos = { 
          lat: location.lat(), 
          lng: location.lng() 
        };
        
        // Update map
        googleMapRef.current?.setCenter(pos);
        googleMapRef.current?.setZoom(16);
        
        // Update or create marker
        if (markerRef.current) {
          markerRef.current.setPosition(pos);
        } else {
          markerRef.current = new window.google.maps.Marker({
            position: pos,
            map: googleMapRef.current,
            animation: window.google.maps.Animation.DROP,
          });
        }
        
        // Update location state
        setLocation({
          address: results[0].formatted_address,
          lat: pos.lat,
          lng: pos.lng
        });
        
        toast({
          title: "Location found",
          description: results[0].formatted_address,
        });
      } else {
        setError(`Geocoding failed: ${status}`);
        toast({
          variant: "destructive",
          title: "Error finding location",
          description: `Could not find "${address}". Please try a different search.`,
        });
      }
    });
  };
  
  // Function to reverse geocode coordinates to get address
  const reverseGeocode = (latLng: GoogleLatLng) => {
    if (!geocoderRef.current) return;
    
    geocoderRef.current.geocode({ location: latLng }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        setLocation({
          address: results[0].formatted_address,
          lat: latLng.lat,
          lng: latLng.lng
        });
      } else {
        console.error('Reverse geocoding failed:', status);
      }
    });
  };
  
  // Handle search form submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    geocodeAddress(searchQuery);
  };
  
  // Handle map clicks to set location
  const handleMapClick = (e: any) => {
    if (!e.latLng) return;
    
    const clickedPos = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng()
    };
    
    // Update marker position
    if (markerRef.current) {
      markerRef.current.setPosition(clickedPos);
    } else if (googleMapRef.current) {
      markerRef.current = new window.google.maps.Marker({
        position: clickedPos,
        map: googleMapRef.current,
        animation: window.google.maps.Animation.DROP,
      });
    }
    
    // Reverse geocode to get address
    reverseGeocode(clickedPos);
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Location Finder</h1>
        <p className="text-muted-foreground">
          Find any location on the map with detailed information
        </p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        {/* Search Panel */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Search Location</CardTitle>
            <CardDescription>Enter an address or place name</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-grow">
                  <Input
                    className="pr-8"
                    placeholder="Enter location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="animate-spin h-4 w-4 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </form>
            
            {error && (
              <div className="mt-4 p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {error}
              </div>
            )}
            
            {location && (
              <div className="mt-4 space-y-3">
                <h3 className="text-sm font-medium">Location Details</h3>
                <div className="p-3 bg-muted rounded-md text-sm space-y-2">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>{location.address}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
                    <div>Latitude: {location.lat.toFixed(6)}</div>
                    <div>Longitude: {location.lng.toFixed(6)}</div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(`${location.lat},${location.lng}`);
                      toast({
                        description: "Coordinates copied to clipboard",
                      });
                    }}
                  >
                    Copy Coordinates
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(location.address);
                      toast({
                        description: "Address copied to clipboard",
                      });
                    }}
                  >
                    Copy Address
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Map Panel */}
        <Card className="md:col-span-2">
          <CardContent className="p-0">
            <div 
              ref={mapRef} 
              className="h-[500px] w-full rounded-md overflow-hidden"
              onClick={(e) => {
                // This is a workaround since we can't directly attach event listeners to the map
                // The actual click handling is done through the Google Maps API
              }}
            ></div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-6 text-sm text-center text-muted-foreground">
        <p>Click anywhere on the map to get location information</p>
      </div>
    </div>
  );
}
