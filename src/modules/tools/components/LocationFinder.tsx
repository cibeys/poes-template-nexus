
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin, Navigation, Search } from 'lucide-react';

export default function LocationFinder() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const googleScriptRef = useRef<HTMLScriptElement | null>(null);
  const { toast } = useToast();

  // Initialize Google Maps
  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
    if (existingScript) {
      // If script already exists, don't add another one
      initMap();
      return;
    }

    // Function to load Google Maps API
    const loadGoogleMapsAPI = () => {
      const googleMapsScript = document.createElement('script');
      googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBXDe0zEDI8JMV0NZYNOsWZzYZ-Yuetiy4&libraries=places&loading=async`;
      googleMapsScript.async = true;
      googleMapsScript.defer = true;
      googleMapsScript.onload = initMap;
      document.head.appendChild(googleMapsScript);
      googleScriptRef.current = googleMapsScript;
    };

    // Initialize map
    function initMap() {
      if (mapRef.current && !mapInstanceRef.current && window.google && window.google.maps) {
        // Default to a central location
        const defaultLocation = { lat: 40.7128, lng: -74.006 };
        
        mapInstanceRef.current = new google.maps.Map(mapRef.current, {
          center: defaultLocation,
          zoom: 12,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        });
        
        // Try to get user's current location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setCenter(userLocation);
                
                // Add marker for user's location
                markerRef.current = new google.maps.Marker({
                  position: userLocation,
                  map: mapInstanceRef.current,
                  title: "Your Location",
                  animation: google.maps.Animation.DROP,
                });
                
                // Create info window
                const infowindow = new google.maps.InfoWindow({
                  content: "<strong>Your Current Location</strong>"
                });
                
                // Open info window on click
                markerRef.current.addListener("click", () => {
                  if (mapInstanceRef.current && markerRef.current) {
                    infowindow.open(mapInstanceRef.current, markerRef.current);
                  }
                });
              }
            },
            (error) => {
              console.error("Error getting location:", error);
              toast({
                title: "Location Error",
                description: "Unable to get your location. Using default view.",
                variant: "destructive"
              });
            }
          );
        }
        
        setMapLoaded(true);
      } else if (!window.google || !window.google.maps) {
        // If Google Maps is not loaded yet, try again
        loadGoogleMapsAPI();
      }
    }

    // First try to initialize if Google Maps is already loaded
    if (window.google && window.google.maps) {
      initMap();
    } else {
      loadGoogleMapsAPI();
    }
    
    return () => {
      // Clean up
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, [toast]);

  // Search location
  const searchLocation = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!search.trim()) {
      toast({
        title: "Error",
        description: "Please enter a location to search",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    
    if (mapLoaded && mapInstanceRef.current && window.google && window.google.maps) {
      const geocoder = new google.maps.Geocoder();
      
      geocoder.geocode({ address: search }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const location = results[0].geometry.location;
          
          // Center map on the found location
          mapInstanceRef.current?.setCenter(location);
          mapInstanceRef.current?.setZoom(14);
          
          // Clear existing marker if any
          if (markerRef.current) {
            markerRef.current.setMap(null);
          }
          
          // Create new marker
          markerRef.current = new google.maps.Marker({
            map: mapInstanceRef.current,
            position: location,
            animation: google.maps.Animation.DROP,
            title: results[0].formatted_address
          });
          
          // Create info window with address details
          const infowindow = new google.maps.InfoWindow({
            content: `<strong>${results[0].formatted_address}</strong>`
          });
          
          // Open info window on click
          markerRef.current.addListener("click", () => {
            if (mapInstanceRef.current && markerRef.current) {
              infowindow.open(mapInstanceRef.current, markerRef.current);
            }
          });
          
          // Open info window initially
          infowindow.open(mapInstanceRef.current, markerRef.current);
          
          toast({
            title: "Location Found",
            description: `Found: ${results[0].formatted_address}`,
          });
        } else {
          toast({
            title: "Search Error",
            description: "Location not found. Please try again with a different search term.",
            variant: "destructive"
          });
        }
        
        setLoading(false);
      });
    } else {
      toast({
        title: "Map Error",
        description: "Map is not yet loaded. Please wait and try again.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = () => {
    if (!mapLoaded) {
      toast({
        title: "Map Error",
        description: "Map is not yet loaded. Please wait and try again.",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          if (mapInstanceRef.current && window.google && window.google.maps) {
            mapInstanceRef.current.setCenter(userLocation);
            mapInstanceRef.current.setZoom(14);
            
            // Clear existing marker if any
            if (markerRef.current) {
              markerRef.current.setMap(null);
            }
            
            // Create new marker
            markerRef.current = new google.maps.Marker({
              position: userLocation,
              map: mapInstanceRef.current,
              title: "Your Location",
              animation: google.maps.Animation.DROP,
            });
            
            // Create info window
            const infowindow = new google.maps.InfoWindow({
              content: "<strong>Your Current Location</strong>"
            });
            
            // Open info window
            infowindow.open(mapInstanceRef.current, markerRef.current);
          
            // Reverse geocode to get address
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: userLocation }, (results, status) => {
              if (status === "OK" && results && results[0]) {
                setSearch(results[0].formatted_address);
              }
            });
          }
          
          setLoading(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          toast({
            title: "Location Error",
            description: "Unable to get your location. Please check your browser permissions.",
            variant: "destructive"
          });
          setLoading(false);
        }
      );
    } else {
      toast({
        title: "Browser Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-3">Location Finder</h1>
        <p className="text-muted-foreground">
          Find and track locations on an interactive map
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Search Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={searchLocation} className="flex gap-2 mb-2">
            <Input
              type="text"
              placeholder="Enter address, city, or landmark..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
              Search
            </Button>
          </form>
          <Button
            variant="outline"
            type="button"
            onClick={getCurrentLocation}
            disabled={loading}
            className="w-full mt-2"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Use My Current Location
          </Button>
        </CardContent>
      </Card>

      <Card className="h-[500px] overflow-hidden">
        <div
          ref={mapRef}
          className="w-full h-full"
          style={{ borderRadius: "calc(var(--radius) - 2px)" }}
        >
          {!mapLoaded && (
            <div className="flex items-center justify-center w-full h-full bg-gray-100 dark:bg-gray-800">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2">Loading map...</p>
              </div>
            </div>
          )}
        </div>
      </Card>
      
      <p className="text-xs text-center text-muted-foreground mt-4">
        Map data provided by Google Maps. Your location is only used to center the map and is not stored.
      </p>
    </div>
  );
}
