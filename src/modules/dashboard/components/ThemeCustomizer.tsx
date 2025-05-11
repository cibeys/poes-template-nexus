import React, { useState } from 'react';
import { useTheme } from '@/common/components/ThemeProvider';
import { RotateCcw, Settings, X, Check, Type, Palette, PanelRightOpen, PanelLeftClose, Laptop, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Create a local interface for the theme config since it's not part of ThemeContextType
interface ThemeConfig {
  fontFamily?: string;
  fontSize?: number;
  lineHeight?: number;
  borderRadius?: number;
  primaryColor?: string;
  accentColor?: string;
  backgroundColor?: string;
  textColor?: string;
  layout?: 'default' | 'wide';
}

// Create a mock implementation for theme customization
export default function ThemeCustomizer() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>({
    fontFamily: "Inter, system-ui, sans-serif",
    fontSize: 16,
    lineHeight: 1.5,
    borderRadius: 0.5,
    primaryColor: "#6366f1",
    accentColor: "#a855f7",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    layout: "default"
  });

  // Mock functions for theme customization
  const toggleCustomizer = () => setIsOpen(!isOpen);
  
  const updateThemeConfig = (newConfig: Partial<ThemeConfig>) => {
    setThemeConfig(prev => ({...prev, ...newConfig}));
  };
  
  const resetThemeConfig = () => {
    setThemeConfig({
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 16,
      lineHeight: 1.5,
      borderRadius: 0.5,
      primaryColor: "#6366f1",
      accentColor: "#a855f7",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      layout: "default"
    });
  };

  const [activeTab, setActiveTab] = useState<string>("theme");

  const fonts = [
    { name: "System Default", value: "system-ui, sans-serif" },
    { name: "Inter", value: "Inter, system-ui, sans-serif" },
    { name: "Roboto", value: "Roboto, system-ui, sans-serif" },
    { name: "Poppins", value: "Poppins, system-ui, sans-serif" },
    { name: "Montserrat", value: "Montserrat, system-ui, sans-serif" },
    { name: "Open Sans", value: "Open Sans, system-ui, sans-serif" },
    { name: "Playfair Display", value: "Playfair Display, serif" },
    { name: "Lora", value: "Lora, serif" },
    { name: "Fira Code", value: "Fira Code, monospace" },
  ];

  const colorPresets = [
    { name: "Default", primary: "#6366f1", accent: "#a855f7", background: "#ffffff", text: "#000000" },
    { name: "Ocean", primary: "#3b82f6", accent: "#06b6d4", background: "#f0f9ff", text: "#0f172a" },
    { name: "Forest", primary: "#10b981", accent: "#059669", background: "#f0fdf4", text: "#064e3b" },
    { name: "Sunset", primary: "#f97316", accent: "#db2777", background: "#fff7ed", text: "#7c2d12" },
    { name: "Lavender", primary: "#8b5cf6", accent: "#d946ef", background: "#f5f3ff", text: "#4c1d95" },
    { name: "Monochrome", primary: "#18181b", accent: "#525252", background: "#fafafa", text: "#18181b" },
  ];

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
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const ColorOption = ({ color, active, onClick }: { color: string; active: boolean; onClick: () => void }) => {
    return (
      <button
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center border-2",
          active ? "border-gray-900 dark:border-gray-100" : "border-transparent"
        )}
        style={{ backgroundColor: color }}
        onClick={onClick}
      >
        {active && <Check className="h-4 w-4 text-white stroke-2" />}
      </button>
    );
  };

  const handleApplyPreset = (preset: typeof colorPresets[0]) => {
    updateThemeConfig({
      primaryColor: preset.primary,
      accentColor: preset.accent,
      backgroundColor: preset.background,
      textColor: preset.text,
    });
  };

  // Apply theme styles
  React.useEffect(() => {
    const root = document.documentElement;
    
    if (themeConfig.fontFamily) {
      root.style.setProperty('--font-sans', themeConfig.fontFamily);
    }
    
    if (themeConfig.primaryColor) {
      root.style.setProperty('--primary', themeConfig.primaryColor);
    }
    
    if (themeConfig.accentColor) {
      root.style.setProperty('--accent', themeConfig.accentColor);
    }
    
    if (themeConfig.borderRadius !== undefined) {
      root.style.setProperty('--radius', `${themeConfig.borderRadius}rem`);
    }
    
    if (themeConfig.backgroundColor) {
      if (theme === 'light') {
        root.style.setProperty('--background', themeConfig.backgroundColor);
      }
    }
    
    if (themeConfig.textColor) {
      if (theme === 'light') {
        root.style.setProperty('--foreground', themeConfig.textColor);
      }
    }
    
  }, [themeConfig, theme]);

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
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
        {isOpen && (
          <motion.div
            className="fixed top-0 right-0 z-50 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between border-b p-4">
                <div className="flex items-center space-x-2 text-lg font-semibold">
                  <Settings className="h-5 w-5" />
                  <span>Theme Customizer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon" onClick={resetThemeConfig} title="Reset to defaults">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={toggleCustomizer}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
                <TabsList className="grid grid-cols-3 w-full rounded-none border-b">
                  <TabsTrigger value="theme" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                    <Sun className="h-4 w-4 mr-2" />
                    Theme
                  </TabsTrigger>
                  <TabsTrigger value="colors" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                    <Palette className="h-4 w-4 mr-2" />
                    Colors
                  </TabsTrigger>
                  <TabsTrigger value="fonts" className="data-[state=active]:border-b-2 data-[state=active]:border-primary">
                    <Type className="h-4 w-4 mr-2" />
                    Fonts
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
                        <h3 className="text-sm font-medium">Mode</h3>
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
                        <h3 className="text-sm font-medium">Layout</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <Button 
                            variant={themeConfig.layout === "default" ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => updateThemeConfig({ layout: "default" })}
                            className="justify-start"
                          >
                            <PanelLeftClose className="h-4 w-4 mr-2" />
                            Default
                          </Button>
                          <Button 
                            variant={themeConfig.layout === "wide" ? "default" : "outline"} 
                            size="sm" 
                            onClick={() => updateThemeConfig({ layout: "wide" })}
                            className="justify-start"
                          >
                            <PanelRightOpen className="h-4 w-4 mr-2" />
                            Wide
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="radius">Border Radius</Label>
                          <span className="text-xs text-muted-foreground">{themeConfig.borderRadius}rem</span>
                        </div>
                        <Slider
                          id="radius"
                          min={0}
                          max={2}
                          step={0.1}
                          value={[themeConfig.borderRadius || 0.5]}
                          onValueChange={(vals) => updateThemeConfig({ borderRadius: vals[0] })}
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">Preset Themes</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {colorPresets.map((preset, index) => (
                            <Button 
                              key={index}
                              variant="outline" 
                              size="sm"
                              className="justify-start h-auto py-2"
                              onClick={() => handleApplyPreset(preset)}
                            >
                              <div className="flex items-center">
                                <div 
                                  className="w-5 h-5 rounded mr-2" 
                                  style={{ backgroundColor: preset.primary }}
                                />
                                <span>{preset.name}</span>
                              </div>
                            </Button>
                          ))}
                        </div>
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
                      <div className="space-y-3">
                        <div>
                          <Label className="text-sm font-medium">Primary Color</Label>
                          <div className="mt-2 flex items-center gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-10 h-10 p-0 rounded-full"
                                  style={{ backgroundColor: themeConfig.primaryColor || '#6366f1' }}
                                />
                              </PopoverTrigger>
                              <PopoverContent className="w-64" align="start" alignOffset={0}>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-6 gap-2">
                                    {['#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#84cc16', '#eab308', '#f97316', '#ef4444', '#ec4899', '#8b5cf6', '#9ca3af', '#000000'].map((color) => (
                                      <ColorOption 
                                        key={color} 
                                        color={color} 
                                        active={themeConfig.primaryColor === color}
                                        onClick={() => updateThemeConfig({ primaryColor: color })} 
                                      />
                                    ))}
                                  </div>
                                  <div className="flex items-center">
                                    <Input 
                                      type="text" 
                                      value={themeConfig.primaryColor || '#6366f1'} 
                                      onChange={(e) => updateThemeConfig({ primaryColor: e.target.value })}
                                      className="flex-1"
                                    />
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Input 
                              type="text" 
                              value={themeConfig.primaryColor || '#6366f1'} 
                              onChange={(e) => updateThemeConfig({ primaryColor: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Accent Color</Label>
                          <div className="mt-2 flex items-center gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-10 h-10 p-0 rounded-full"
                                  style={{ backgroundColor: themeConfig.accentColor || '#a855f7' }}
                                />
                              </PopoverTrigger>
                              <PopoverContent className="w-64" align="start" alignOffset={0}>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-6 gap-2">
                                    {['#a855f7', '#3b82f6', '#06b6d4', '#10b981', '#84cc16', '#eab308', '#f97316', '#ef4444', '#ec4899', '#8b5cf6', '#9ca3af', '#000000'].map((color) => (
                                      <ColorOption 
                                        key={color} 
                                        color={color} 
                                        active={themeConfig.accentColor === color}
                                        onClick={() => updateThemeConfig({ accentColor: color })} 
                                      />
                                    ))}
                                  </div>
                                  <div className="flex items-center">
                                    <Input 
                                      type="text" 
                                      value={themeConfig.accentColor || '#a855f7'} 
                                      onChange={(e) => updateThemeConfig({ accentColor: e.target.value })}
                                      className="flex-1"
                                    />
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Input 
                              type="text" 
                              value={themeConfig.accentColor || '#a855f7'} 
                              onChange={(e) => updateThemeConfig({ accentColor: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Background Color (Light Mode)</Label>
                          <div className="mt-2 flex items-center gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-10 h-10 p-0 rounded-full"
                                  style={{ backgroundColor: themeConfig.backgroundColor || '#ffffff' }}
                                />
                              </PopoverTrigger>
                              <PopoverContent className="w-64" align="start" alignOffset={0}>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-6 gap-2">
                                    {['#ffffff', '#f8fafc', '#f1f5f9', '#f3f4f6', '#f5f5f5', '#fafaf9', '#f8f9fa', '#f0f9ff', '#f0fdfa', '#f7fee7', '#fffbeb', '#fef2f2'].map((color) => (
                                      <ColorOption 
                                        key={color} 
                                        color={color} 
                                        active={themeConfig.backgroundColor === color}
                                        onClick={() => updateThemeConfig({ backgroundColor: color })} 
                                      />
                                    ))}
                                  </div>
                                  <div className="flex items-center">
                                    <Input 
                                      type="text" 
                                      value={themeConfig.backgroundColor || '#ffffff'} 
                                      onChange={(e) => updateThemeConfig({ backgroundColor: e.target.value })}
                                      className="flex-1"
                                    />
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Input 
                              type="text" 
                              value={themeConfig.backgroundColor || '#ffffff'} 
                              onChange={(e) => updateThemeConfig({ backgroundColor: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Text Color (Light Mode)</Label>
                          <div className="mt-2 flex items-center gap-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  className="w-10 h-10 p-0 rounded-full"
                                  style={{ backgroundColor: themeConfig.textColor || '#000000' }}
                                />
                              </PopoverTrigger>
                              <PopoverContent className="w-64" align="start" alignOffset={0}>
                                <div className="space-y-3">
                                  <div className="grid grid-cols-6 gap-2">
                                    {['#000000', '#111827', '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb', '#f3f4f6', '#f9fafb', '#ffffff'].map((color) => (
                                      <ColorOption 
                                        key={color} 
                                        color={color} 
                                        active={themeConfig.textColor === color}
                                        onClick={() => updateThemeConfig({ textColor: color })} 
                                      />
                                    ))}
                                  </div>
                                  <div className="flex items-center">
                                    <Input 
                                      type="text" 
                                      value={themeConfig.textColor || '#000000'} 
                                      onChange={(e) => updateThemeConfig({ textColor: e.target.value })}
                                      className="flex-1"
                                    />
                                  </div>
                                </div>
                              </PopoverContent>
                            </Popover>
                            <Input 
                              type="text" 
                              value={themeConfig.textColor || '#000000'} 
                              onChange={(e) => updateThemeConfig({ textColor: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {activeTab === "fonts" && (
                    <motion.div 
                      className="space-y-6" 
                      variants={tabContentVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Font Family</Label>
                          <Select 
                            value={themeConfig.fontFamily || "system-ui, sans-serif"} 
                            onValueChange={(value) => updateThemeConfig({ fontFamily: value })}
                          >
                            <SelectTrigger className="mt-2">
                              <SelectValue placeholder="Select font" />
                            </SelectTrigger>
                            <SelectContent>
                              {fonts.map(font => (
                                <SelectItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                  {font.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="fontSize">Font Size</Label>
                            <span className="text-xs text-muted-foreground">{themeConfig.fontSize || 16}px</span>
                          </div>
                          <Slider
                            id="fontSize"
                            min={12}
                            max={20}
                            step={1}
                            value={[themeConfig.fontSize || 16]}
                            onValueChange={(vals) => updateThemeConfig({ fontSize: vals[0] })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="lineHeight">Line Height</Label>
                            <span className="text-xs text-muted-foreground">{themeConfig.lineHeight || 1.5}</span>
                          </div>
                          <Slider
                            id="lineHeight"
                            min={1}
                            max={2}
                            step={0.1}
                            value={[themeConfig.lineHeight || 1.5]}
                            onValueChange={(vals) => updateThemeConfig({ lineHeight: vals[0] })}
                          />
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <h3 className="text-sm font-medium mb-2">Preview</h3>
                        <div 
                          className="p-4 border rounded-lg"
                          style={{
                            fontFamily: themeConfig.fontFamily || 'system-ui, sans-serif',
                            fontSize: `${themeConfig.fontSize || 16}px`,
                            lineHeight: themeConfig.lineHeight || 1.5
                          }}
                        >
                          <h4 className="font-bold mb-1">The quick brown fox jumps over the lazy dog</h4>
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
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
