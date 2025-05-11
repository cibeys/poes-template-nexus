
import React, { useRef } from 'react';
import { X, RotateCcw, Save, Upload } from 'lucide-react';
import { 
  useThemeCustomizer, 
  ThemeSettings,
  MenuType, 
  PresetTheme
} from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface ColorPickerProps {
  label: string;
  colors: string[];
  value: string;
  onChange: (color: string) => void;
}

const ColorPicker = ({ label, colors, value, onChange }: ColorPickerProps) => (
  <div className="space-y-2">
    <h3 className="text-lg font-medium">{label}</h3>
    <div className="grid grid-cols-7 gap-2">
      {colors.map((color) => (
        <button
          key={color}
          className={cn(
            "w-8 h-8 rounded-full border-2", 
            value === color ? "border-slate-950 dark:border-slate-50" : "border-transparent"
          )}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
          type="button"
          aria-label={`Select ${color} as ${label}`}
        />
      ))}
    </div>
  </div>
);

const ThemeCustomizer = () => {
  const { 
    themeSettings, 
    updateThemeSetting, 
    resetThemeSettings, 
    isCustomizerOpen, 
    toggleCustomizer,
    exportThemeConfig,
    importThemeConfig
  } = useThemeCustomizer();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const primaryColors = [
    "#1e293b", // Dark Blue
    "#3B82F6", // Blue
    "#10b981", // Green
    "#a3e635", // Lime
    "#f97316", // Orange
    "#f59e0b", // Amber
    "#eab308", // Yellow
    "#06b6d4", // Cyan
    "#06aed4", // Light Teal
    "#0ea5e9", // Sky
    "#3b82f6", // Light Blue
    "#6366f1", // Indigo
    "#8b5cf6", // Violet
    "#a855f7", // Purple
    "#d946ef", // Fuchsia
    "#ec4899", // Pink
    "#f43f5e", // Rose
  ];

  const surfaceColors = [
    "#f8fafc", // Light
    "#64748b", // Slate
    "#4b5563", // Gray
    "#3f3f46", // Zinc
    "#525252", // Neutral
    "#44403c", // Stone
    "#292524", // Charcoal
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string) as ThemeSettings;
        importThemeConfig(config);
        toast.success("Theme config imported successfully!");
      } catch (error) {
        toast.error("Failed to import theme config. Invalid format.");
      }
    };
    reader.readAsText(file);
  };

  if (!isCustomizerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 h-full overflow-y-auto shadow-lg animate-slide-in-right">
        <div className="p-4 flex items-center justify-between border-b">
          <h2 className="text-xl font-bold">Settings</h2>
          <Button variant="ghost" size="icon" onClick={toggleCustomizer}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4 space-y-8">
          <ColorPicker 
            label="Primary" 
            colors={primaryColors}
            value={themeSettings.primaryColor}
            onChange={(color) => updateThemeSetting('primaryColor', color)}
          />
          
          <Separator />
          
          <ColorPicker 
            label="Surface" 
            colors={surfaceColors}
            value={themeSettings.surfaceColor}
            onChange={(color) => updateThemeSetting('surfaceColor', color)}
          />
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Presets</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['aura', 'lara', 'nora'] as PresetTheme[]).map((preset) => (
                <Button
                  key={preset}
                  variant={themeSettings.preset === preset ? "default" : "outline"}
                  className={cn(
                    "capitalize",
                    themeSettings.preset === preset && "border-primary"
                  )}
                  onClick={() => updateThemeSetting('preset', preset)}
                >
                  {preset}
                </Button>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Color Scheme</h3>
            <div className="grid grid-cols-2 gap-2">
              {(['light', 'dark'] as const).map((scheme) => (
                <Button
                  key={scheme}
                  variant={themeSettings.colorScheme === scheme ? "default" : "outline"}
                  className={cn(
                    "capitalize",
                    themeSettings.colorScheme === scheme && "border-primary"
                  )}
                  onClick={() => updateThemeSetting('colorScheme', scheme)}
                >
                  {scheme}
                </Button>
              ))}
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Menu Type</h3>
            <RadioGroup 
              value={themeSettings.menuType} 
              onValueChange={(value) => updateThemeSetting('menuType', value as MenuType)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="static" id="static" />
                <Label htmlFor="static">Static</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="overlay" id="overlay" />
                <Label htmlFor="overlay">Overlay</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="slim" id="slim" />
                <Label htmlFor="slim">Slim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="slim+" id="slim+" />
                <Label htmlFor="slim+">Slim+</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Layout Theme</h3>
            <RadioGroup 
              value={themeSettings.layoutTheme} 
              onValueChange={(value) => updateThemeSetting('layoutTheme', value as "colorScheme" | "primaryColor")}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="colorScheme" id="colorScheme" />
                <Label htmlFor="colorScheme">Color Scheme</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="primaryColor" id="primaryColor" />
                <Label htmlFor="primaryColor">Primary Color (Light Only)</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Separator />
          
          <div className="flex flex-col space-y-2">
            <Button variant="outline" onClick={resetThemeSettings}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset to Default
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={exportThemeConfig}>
                <Save className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeCustomizer;
