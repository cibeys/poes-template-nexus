
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Thermometer, Scale, Ruler, Droplets, Clock } from "lucide-react";

type ConverterCategory = 'length' | 'weight' | 'temperature' | 'volume' | 'time';

interface UnitOption {
  value: string;
  label: string;
  conversion: number;  // Base conversion rate relative to the base unit
}

interface CategoryConfig {
  name: string;
  icon: JSX.Element;
  baseUnit: string;
  units: UnitOption[];
}

// Configuration for each converter category
const converterConfigs: Record<ConverterCategory, CategoryConfig> = {
  length: {
    name: "Length",
    icon: <Ruler className="h-5 w-5" />,
    baseUnit: "m",
    units: [
      { value: "mm", label: "Millimeters (mm)", conversion: 0.001 },
      { value: "cm", label: "Centimeters (cm)", conversion: 0.01 },
      { value: "m", label: "Meters (m)", conversion: 1 },
      { value: "km", label: "Kilometers (km)", conversion: 1000 },
      { value: "in", label: "Inches (in)", conversion: 0.0254 },
      { value: "ft", label: "Feet (ft)", conversion: 0.3048 },
      { value: "yd", label: "Yards (yd)", conversion: 0.9144 },
      { value: "mi", label: "Miles (mi)", conversion: 1609.344 },
    ]
  },
  weight: {
    name: "Weight",
    icon: <Scale className="h-5 w-5" />,
    baseUnit: "kg",
    units: [
      { value: "mg", label: "Milligrams (mg)", conversion: 0.000001 },
      { value: "g", label: "Grams (g)", conversion: 0.001 },
      { value: "kg", label: "Kilograms (kg)", conversion: 1 },
      { value: "t", label: "Metric Tons (t)", conversion: 1000 },
      { value: "oz", label: "Ounces (oz)", conversion: 0.0283495 },
      { value: "lb", label: "Pounds (lb)", conversion: 0.453592 },
      { value: "st", label: "Stone (st)", conversion: 6.35029 },
      { value: "ton", label: "US Tons", conversion: 907.185 },
    ]
  },
  temperature: {
    name: "Temperature",
    icon: <Thermometer className="h-5 w-5" />,
    baseUnit: "c", // Celsius is our base unit
    units: [
      { value: "c", label: "Celsius (°C)", conversion: 1 },
      { value: "f", label: "Fahrenheit (°F)", conversion: 1 }, // Placeholder, special handling for temperature
      { value: "k", label: "Kelvin (K)", conversion: 1 }, // Placeholder, special handling for temperature
    ]
  },
  volume: {
    name: "Volume",
    icon: <Droplets className="h-5 w-5" />,
    baseUnit: "l",
    units: [
      { value: "ml", label: "Milliliters (ml)", conversion: 0.001 },
      { value: "cl", label: "Centiliters (cl)", conversion: 0.01 },
      { value: "l", label: "Liters (l)", conversion: 1 },
      { value: "kl", label: "Kiloliters (kl)", conversion: 1000 },
      { value: "floz", label: "Fluid Ounces (fl oz)", conversion: 0.0295735 },
      { value: "pt", label: "Pints (pt)", conversion: 0.473176 },
      { value: "qt", label: "Quarts (qt)", conversion: 0.946353 },
      { value: "gal", label: "Gallons (gal)", conversion: 3.78541 },
    ]
  },
  time: {
    name: "Time",
    icon: <Clock className="h-5 w-5" />,
    baseUnit: "s",
    units: [
      { value: "ms", label: "Milliseconds (ms)", conversion: 0.001 },
      { value: "s", label: "Seconds (s)", conversion: 1 },
      { value: "min", label: "Minutes (min)", conversion: 60 },
      { value: "h", label: "Hours (h)", conversion: 3600 },
      { value: "day", label: "Days", conversion: 86400 },
      { value: "week", label: "Weeks", conversion: 604800 },
      { value: "month", label: "Months (avg)", conversion: 2629746 },
      { value: "year", label: "Years", conversion: 31556952 },
    ]
  },
};

export default function UnitConverter() {
  const [category, setCategory] = useState<ConverterCategory>('length');
  const [fromUnit, setFromUnit] = useState<string>(converterConfigs.length.units[0].value);
  const [toUnit, setToUnit] = useState<string>(converterConfigs.length.units[2].value);
  const [fromValue, setFromValue] = useState<string>('1');
  const [toValue, setToValue] = useState<string>('');
  const [reverse, setReverse] = useState<boolean>(false);

  // Handle conversion
  useEffect(() => {
    if (fromValue === '') {
      setToValue('');
      return;
    }

    const value = parseFloat(fromValue);
    
    if (isNaN(value)) {
      setToValue('Invalid input');
      return;
    }

    // Get configuration for current category
    const config = converterConfigs[category];
    
    // Find unit information
    const fromUnitInfo = config.units.find(u => u.value === fromUnit);
    const toUnitInfo = config.units.find(u => u.value === toUnit);
    
    if (!fromUnitInfo || !toUnitInfo) {
      setToValue('Error: Unit not found');
      return;
    }
    
    // Special handling for temperature
    if (category === 'temperature') {
      let result;
      
      // Convert to Celsius first (our base unit for temperature)
      let tempInCelsius;
      if (fromUnit === 'c') {
        tempInCelsius = value;
      } else if (fromUnit === 'f') {
        tempInCelsius = (value - 32) * (5/9);
      } else if (fromUnit === 'k') {
        tempInCelsius = value - 273.15;
      }
      
      // Then convert from Celsius to target unit
      if (toUnit === 'c') {
        result = tempInCelsius;
      } else if (toUnit === 'f') {
        result = (tempInCelsius * (9/5)) + 32;
      } else if (toUnit === 'k') {
        result = tempInCelsius + 273.15;
      }
      
      setToValue(result?.toFixed(4).replace(/\.?0+$/, '') || '');
    } else {
      // Standard conversion for other unit types
      // Convert from source unit to base unit, then to target unit
      const valueInBaseUnit = value * fromUnitInfo.conversion;
      const result = valueInBaseUnit / toUnitInfo.conversion;
      
      setToValue(result.toFixed(4).replace(/\.?0+$/, ''));
    }
  }, [category, fromUnit, toUnit, fromValue]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    const newCategory = value as ConverterCategory;
    setCategory(newCategory);
    
    // Reset to first and second units in the new category
    const config = converterConfigs[newCategory];
    setFromUnit(config.units[0].value);
    setToUnit(config.units[1].value);
  };

  // Handle reverse units
  const handleReverseUnits = () => {
    setReverse(!reverse);
    
    // Swap from and to units
    const tempUnit = fromUnit;
    const tempValue = fromValue;
    
    setFromUnit(toUnit);
    setToUnit(tempUnit);
    
    setFromValue(toValue);
    setToValue(tempValue);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">Unit Converter</h1>
        <p className="text-muted-foreground">
          Convert between different units of measurement
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {converterConfigs[category].icon}
              {converterConfigs[category].name} Converter
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Reverse</span>
              <Switch 
                checked={reverse} 
                onCheckedChange={handleReverseUnits} 
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={category} onValueChange={handleTabChange}>
            <TabsList className="grid grid-cols-5 mb-6">
              <TabsTrigger value="length" className="flex gap-1 items-center">
                <Ruler className="h-4 w-4" />
                <span className="hidden sm:inline">Length</span>
              </TabsTrigger>
              <TabsTrigger value="weight" className="flex gap-1 items-center">
                <Scale className="h-4 w-4" />
                <span className="hidden sm:inline">Weight</span>
              </TabsTrigger>
              <TabsTrigger value="temperature" className="flex gap-1 items-center">
                <Thermometer className="h-4 w-4" />
                <span className="hidden sm:inline">Temp</span>
              </TabsTrigger>
              <TabsTrigger value="volume" className="flex gap-1 items-center">
                <Droplets className="h-4 w-4" />
                <span className="hidden sm:inline">Volume</span>
              </TabsTrigger>
              <TabsTrigger value="time" className="flex gap-1 items-center">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Time</span>
              </TabsTrigger>
            </TabsList>
            
            <div className="space-y-6">
              {/* From Unit */}
              <div className="grid gap-1.5">
                <Label htmlFor="from-value">From</Label>
                <div className="flex gap-2">
                  <Input
                    id="from-value"
                    type="number"
                    value={fromValue}
                    onChange={(e) => setFromValue(e.target.value)}
                    className="flex-1"
                  />
                  <Select value={fromUnit} onValueChange={setFromUnit}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {converterConfigs[category].units.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* To Unit */}
              <div className="grid gap-1.5">
                <Label htmlFor="to-value">To</Label>
                <div className="flex gap-2">
                  <Input
                    id="to-value"
                    value={toValue}
                    readOnly
                    className="flex-1 bg-muted"
                  />
                  <Select value={toUnit} onValueChange={setToUnit}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {converterConfigs[category].units.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      <div className="mt-4 text-sm text-center text-muted-foreground">
        <p>Enter a value in the input field to see the converted result</p>
      </div>
    </div>
  );
}
