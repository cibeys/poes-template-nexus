
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Settings, Palette, Type, LayoutGrid, Sun, Moon, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useTheme } from '@/common/components/ThemeProvider';
import { useThemeCustomizer } from '@/contexts/ThemeContext';

interface ColorOption {
  name: string;
  value: string;
}

const primaryColors: ColorOption[] = [
  { name: "Slate", value: "#1e293b" },
  { name: "Emerald", value: "#10b981" },
  { name: "Green", value: "#22c55e" },
  { name: "Lime", value: "#84cc16" },
  { name: "Orange", value: "#f97316" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Sky", value: "#0ea5e9" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Violet", value: "#8b5cf6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Fuchsia", value: "#d946ef" },
  { name: "Pink", value: "#ec4899" },
  { name: "Rose", value: "#f43f5e" }
];

const surfaceColors: ColorOption[] = [
  { name: "White", value: "#ffffff" },
  { name: "Gray 50", value: "#f9fafb" },
  { name: "Gray 100", value: "#f3f4f6" },
  { name: "Gray 200", value: "#e5e7eb" },
  { name: "Gray 300", value: "#d1d5db" },
  { name: "Gray 400", value: "#9ca3af" },
  { name: "Gray 500", value: "#6b7280" },
  { name: "Gray 600", value: "#4b5563" },
  { name: "Gray 700", value: "#374151" },
];

const fontFamilies = [
  { name: "Inter", value: "font-sans" },
  { name: "Playfair", value: "font-playfair" },
  { name: "Poppins", value: "font-poppins" },
  { name: "Montserrat", value: "font-montserrat" },
  { name: "Roboto", value: "font-roboto" },
  { name: "Open Sans", value: "font-opensans" },
  { name: "Lora", value: "font-lora" },
];

export default function ThemeCustomizer() {
  const { theme, setTheme } = useTheme();
  const { 
    themeSettings, 
    updateThemeSetting, 
    isCustomizerOpen, 
    toggleCustomizer,
    resetThemeSettings
  } = useThemeCustomizer();
  
  const [activeTab, setActiveTab] = useState<string>("theme");

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, x: 300 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 25, stiffness: 300 } },
    exit: { opacity: 0, x: 300, transition: { duration: 0.2 } }
  };

  const tabContentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5 },
    exit: { opacity: 0 }
  };

  return (
    <>
      {/* Fixed settings button */}
      <Button 
        size="icon"
        variant="outline"
        className="fixed bottom-4 right-4 z-50 h-10 w-10 rounded-full shadow-lg"
        onClick={toggleCustomizer}
      >
        <Settings className="h-5 w-5" />
        <span className="sr-only">Open settings</span>
      </Button>

      {/* Overlay */}
      <AnimatePresence>
        {isCustomizerOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black"
            onClick={toggleCustomizer}
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
        )}
      </AnimatePresence>
      
      {/* Customizer drawer */}
      <AnimatePresence>
        {isCustomizerOpen && (
          <motion.div
            className="fixed top-0 right-0 z-50 h-full w-80 bg-background border-l shadow-2xl overflow-hidden"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center space-x-2 text-lg font-semibold">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={resetThemeSettings}
                    title="Reset to defaults"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={toggleCustomizer}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="flex-1 overflow-hidden"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="theme">
                    <Sun className="mr-2 h-4 w-4" />
                    Theme
                  </TabsTrigger>
                  <TabsTrigger value="colors">
                    <Palette className="mr-2 h-4 w-4" />
                    Colors
                  </TabsTrigger>
                  <TabsTrigger value="typography">
                    <Type className="mr-2 h-4 w-4" />
                    Typography
                  </TabsTrigger>
                </TabsList>
                
                <div className="flex-1 overflow-y-auto p-4">
                  {activeTab === "theme" && (
                    <motion.div 
                      className="space-y-6" 
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Primary</h3>
                        <div className="grid grid-cols-5 gap-2">
                          {primaryColors.slice(0, 10).map(color => (
                            <button
                              key={color.value}
                              className={`w-8 h-8 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-transform ${
                                themeSettings.primaryColor === color.value ? "scale-110 ring-2 ring-offset-2 ring-offset-background ring-primary" : ""
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                              onClick={() => updateThemeSetting('primaryColor', color.value)}
                            >
                              {themeSettings.primaryColor === color.value && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Surface</h3>
                        <div className="grid grid-cols-5 gap-2">
                          {surfaceColors.slice(0, 10).map(color => (
                            <button
                              key={color.value}
                              className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                                color.value === '#ffffff' ? 'border-gray-200' : 'border-transparent'
                              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-transform ${
                                themeSettings.surfaceColor === color.value ? "scale-110 ring-2 ring-offset-2 ring-offset-background ring-primary" : ""
                              }`}
                              style={{ backgroundColor: color.value }}
                              title={color.name}
                              onClick={() => updateThemeSetting('surfaceColor', color.value)}
                            >
                              {themeSettings.surfaceColor === color.value && (
                                <Check className={`h-3 w-3 ${parseInt(color.value.slice(1), 16) > 0xffffff / 2 ? 'text-black' : 'text-white'}`} />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Presets</h3>
                        <div className="grid grid-cols-3 gap-2">
                          <Button 
                            variant={themeSettings.preset === 'aura' ? "default" : "outline"}
                            className="justify-start h-8"
                            onClick={() => updateThemeSetting('preset', 'aura')}
                          >
                            Aura
                          </Button>
                          <Button 
                            variant={themeSettings.preset === 'lara' ? "default" : "outline"}
                            className="justify-start h-8"
                            onClick={() => updateThemeSetting('preset', 'lara')}
                          >
                            Lara
                          </Button>
                          <Button 
                            variant={themeSettings.preset === 'nora' ? "default" : "outline"}
                            className="justify-start h-8"
                            onClick={() => updateThemeSetting('preset', 'nora')}
                          >
                            Nora
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Color Scheme</h3>
                        <div className="grid grid-cols-3 gap-2">
                          <Button 
                            variant={theme === "light" ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => setTheme("light")}
                            className="justify-start"
                          >
                            <Sun className="h-4 w-4 mr-2" />
                            Light
                          </Button>
                          <Button 
                            variant={theme === "dark" ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => setTheme("dark")}
                            className="justify-start"
                          >
                            <Moon className="h-4 w-4 mr-2" />
                            Dark
                          </Button>
                          <Button 
                            variant={theme === "system" ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => setTheme("system")}
                            className="justify-start"
                          >
                            <Laptop className="h-4 w-4 mr-2" />
                            System
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Menu Type</h3>
                        <RadioGroup 
                          value={themeSettings.menuType} 
                          onValueChange={(value) => updateThemeSetting('menuType', value as any)}
                          className="grid grid-cols-2 gap-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="static" id="menu-static" />
                            <Label htmlFor="menu-static">Static</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="overlay" id="menu-overlay" />
                            <Label htmlFor="menu-overlay">Overlay</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="slim" id="menu-slim" />
                            <Label htmlFor="menu-slim">Slim</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="slim+" id="menu-slim-plus" />
                            <Label htmlFor="menu-slim-plus">Slim+</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Layout Theme</h3>
                        <RadioGroup 
                          value={themeSettings.layoutTheme} 
                          onValueChange={(value) => updateThemeSetting('layoutTheme', value as any)}
                          className="grid gap-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="colorScheme" id="layout-colorscheme" />
                            <Label htmlFor="layout-colorscheme">Color Scheme</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="primaryColor" id="layout-primarycolor" />
                            <Label htmlFor="layout-primarycolor">Primary Color (Light Only)</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === "colors" && (
                    <motion.div 
                      className="space-y-6" 
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">All Primary Colors</h3>
                          <div className="grid grid-cols-5 gap-2">
                            {primaryColors.map(color => (
                              <button
                                key={color.value}
                                className={`w-8 h-8 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-transform ${
                                  themeSettings.primaryColor === color.value ? "scale-110 ring-2 ring-offset-2 ring-offset-background ring-primary" : ""
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                                onClick={() => updateThemeSetting('primaryColor', color.value)}
                              >
                                {themeSettings.primaryColor === color.value && (
                                  <Check className="h-3 w-3 text-white" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">All Surface Colors</h3>
                          <div className="grid grid-cols-5 gap-2">
                            {surfaceColors.map(color => (
                              <button
                                key={color.value}
                                className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                                  color.value === '#ffffff' ? 'border-gray-200' : 'border-transparent'
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-primary transition-transform ${
                                  themeSettings.surfaceColor === color.value ? "scale-110 ring-2 ring-offset-2 ring-offset-background ring-primary" : ""
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                                onClick={() => updateThemeSetting('surfaceColor', color.value)}
                              >
                                {themeSettings.surfaceColor === color.value && (
                                  <Check className={`h-3 w-3 ${parseInt(color.value.slice(1), 16) > 0xffffff / 2 ? 'text-black' : 'text-white'}`} />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Border Radius</h3>
                          <Slider 
                            value={[themeSettings.borderRadius || 0.5]}
                            min={0}
                            max={2}
                            step={0.1}
                            onValueChange={(values) => updateThemeSetting('borderRadius', values[0])}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Square</span>
                            <span>{themeSettings.borderRadius || 0.5}rem</span>
                            <span>Round</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === "typography" && (
                    <motion.div 
                      className="space-y-6" 
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <h3 className="text-sm font-medium">Font Family</h3>
                          <div className="space-y-2">
                            {fontFamilies.map(font => (
                              <button
                                key={font.value}
                                onClick={() => updateThemeSetting('fontFamily', font.value)}
                                className={`w-full text-left px-4 py-2 rounded-md text-base ${font.value} ${
                                  themeSettings.fontFamily === font.value 
                                    ? "bg-primary text-primary-foreground" 
                                    : "hover:bg-muted"
                                }`}
                              >
                                {font.name}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Font Size</h3>
                            <span className="text-xs text-muted-foreground">{themeSettings.fontSize || 16}px</span>
                          </div>
                          <Slider 
                            value={[themeSettings.fontSize || 16]}
                            min={12}
                            max={20}
                            step={1}
                            onValueChange={(values) => updateThemeSetting('fontSize', values[0])}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>12px</span>
                            <span>20px</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">Line Height</h3>
                            <span className="text-xs text-muted-foreground">{themeSettings.lineHeight || 1.5}x</span>
                          </div>
                          <Slider 
                            value={[themeSettings.lineHeight || 1.5]}
                            min={1}
                            max={2}
                            step={0.1}
                            onValueChange={(values) => updateThemeSetting('lineHeight', values[0])}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Tight</span>
                            <span>Loose</span>
                          </div>
                        </div>
                        
                        <div className="border rounded-md p-4 mt-6">
                          <h3 className="text-lg font-bold mb-2">Preview</h3>
                          <p className={`${themeSettings.fontFamily}`}>
                            The quick brown fox jumps over the lazy dog.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </Tabs>
              
              <div className="border-t p-4">
                <Button className="w-full" onClick={toggleCustomizer}>Apply & Close</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
