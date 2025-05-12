
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { CloudRain, Wind, Droplets, Thermometer, Locate, Search, Sun, Cloud, CloudSnow, CloudLightning } from 'lucide-react';

interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
}

export default function WeatherChecker() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const { toast } = useToast();

  const API_KEY = "4a1f8a61b74546df9a4160523241205"; // This is a free API key for WeatherAPI.com

  const fetchWeather = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!city.trim()) {
      toast({
        title: "Error",
        description: "Please enter a city name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(
        `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}&aqi=no`
      );
      
      if (!response.ok) {
        throw new Error("City not found");
      }
      
      const data = await response.json();
      
      setWeather({
        city: data.location.name,
        country: data.location.country,
        temp: data.current.temp_c,
        feels_like: data.current.feelslike_c,
        humidity: data.current.humidity,
        wind_speed: data.current.wind_kph,
        description: data.current.condition.text,
        icon: data.current.condition.icon,
      });
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch weather data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    
    if (desc.includes('thunder') || desc.includes('lightning')) {
      return <CloudLightning size={64} className="text-yellow-500" />;
    } else if (desc.includes('rain') || desc.includes('drizzle')) {
      return <CloudRain size={64} className="text-blue-500" />;
    } else if (desc.includes('snow')) {
      return <CloudSnow size={64} className="text-blue-200" />;
    } else if (desc.includes('cloud') || desc.includes('overcast')) {
      return <Cloud size={64} className="text-gray-400" />;
    } else {
      return <Sun size={64} className="text-yellow-500" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-3">Weather Checker</h1>
        <p className="text-muted-foreground">
          Check current weather conditions for any city around the world
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CloudRain size={24} className="text-primary" />
            Search for a City
          </CardTitle>
          <CardDescription>Enter a city name to get current weather</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={fetchWeather} className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter city name..."
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <Search size={16} className="mr-2" />
                  Search
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {weather && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8"
        >
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-primary p-6 text-white">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">{weather.city}</h2>
                  <p className="text-white/90">{weather.country}</p>
                  <p className="text-white/80 text-sm mt-1">{weather.description}</p>
                </div>
                <div className="flex flex-col items-center">
                  {weather.icon ? (
                    <img src={`https:${weather.icon}`} alt={weather.description} width={80} height={80} />
                  ) : (
                    getWeatherIcon(weather.description)
                  )}
                  <span className="text-4xl font-bold">{weather.temp}°C</span>
                </div>
              </div>
            </div>
            
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Thermometer size={20} className="text-orange-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Feels Like</p>
                    <p className="font-bold">{weather.feels_like}°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets size={20} className="text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Humidity</p>
                    <p className="font-bold">{weather.humidity}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Wind size={20} className="text-gray-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Wind Speed</p>
                    <p className="font-bold">{weather.wind_speed} km/h</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Locate size={20} className="text-purple-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-bold truncate">{weather.city}, {weather.country}</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 dark:bg-gray-900 text-xs text-muted-foreground">
              Data provided by WeatherAPI.com
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
