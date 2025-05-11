
import React, { useState } from "react";
import { Check, Palette, PlusCircle, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useThemeCustomizer } from "@/contexts/ThemeContext";
import { Card } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

export default function ThemeCustomizer() {
  const { 
    themeSettings,
    updateThemeSetting,
    resetThemeSettings,
    isCustomizerOpen,
    toggleCustomizer,
    exportThemeConfig,
    importThemeConfig
  } = useThemeCustomizer();
  
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importConfig, setImportConfig] = useState("");
  
  const presets = [
    {
      name: "Aura",
      value: "aura",
      bgColor: "bg-gradient-to-br from-indigo-500 to-purple-500",
      primaryColor: "#8B5CF6",
      textColor: "text-white"
    },
    {
      name: "Lara",
      value: "lara",
      bgColor: "bg-white dark:bg-gray-900",
      primaryColor: "#3B82F6",
      textColor: "text-gray-900 dark:text-white"
    },
    {
      name: "Nora",
      value: "nora",
      bgColor: "bg-gradient-to-br from-gray-900 to-black",
      primaryColor: "#D946EF",
      textColor: "text-white"
    }
  ];
  
  const menuTypes = [
    { name: "Static", value: "static" },
    { name: "Overlay", value: "overlay" },
    { name: "Slim", value: "slim" },
    { name: "Slim+", value: "slim+" }
  ];
  
  const layoutThemes = [
    { name: "Color Scheme", value: "colorScheme" },
    { name: "Primary Color", value: "primaryColor" }
  ];

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>, type: "primaryColor" | "surfaceColor") => {
    updateThemeSetting(type, e.target.value);
  };

  const handleImport = () => {
    try {
      const config = JSON.parse(importConfig);
      importThemeConfig(config);
      setImportDialogOpen(false);
      toast({
        title: "Config Imported",
        description: "Theme configuration has been successfully imported.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid configuration format.",
        variant: "destructive"
      });
    }
  };

  if (!isCustomizerOpen) {
    return (
      <Button
        size="icon"
        variant="outline"
        className="fixed right-4 bottom-4 z-50 rounded-full shadow-lg animate-pulse"
        onClick={toggleCustomizer}
      >
        <Palette className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-50" onClick={toggleCustomizer} />
      <aside className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-xl z-50 overflow-y-auto animate-slide-in-right">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-medium text-lg flex items-center gap-2">
            <Palette className="h-5 w-5" /> Theme Customizer
          </h2>
          <Button variant="ghost" size="icon" onClick={toggleCustomizer}>
            <XCircle className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4">
          <Tabs defaultValue="presets">
            <TabsList className="grid grid-cols-3 w-full mb-4">
              <TabsTrigger value="presets">Presets</TabsTrigger>
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>
            
            <TabsContent value="presets" className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.value}
                    className={`rounded-lg p-3 border transition-all ${
                      themeSettings.preset === preset.value
                        ? "ring-2 ring-primary ring-offset-2"
                        : "hover:border-primary"
                    }`}
                    onClick={() => updateThemeSetting("preset", preset.value as "aura" | "lara" | "nora")}
                  >
                    <div className={`h-12 rounded-md mb-2 flex items-center justify-center ${preset.bgColor}`}>
                      {themeSettings.preset === preset.value && (
                        <Check className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <p className="text-xs text-center font-medium">{preset.name}</p>
                  </button>
                ))}
              </div>
              
              <p className="text-sm text-muted-foreground mt-2">
                Presets apply a combination of colors and layout settings.
              </p>
            </TabsContent>
            
            <TabsContent value="colors" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: themeSettings.primaryColor }}
                    />
                    <Input
                      id="primaryColor"
                      type="color"
                      value={themeSettings.primaryColor}
                      onChange={(e) => handleColorChange(e, "primaryColor")}
                      className="w-full h-8"
                    />
                    <Input
                      type="text"
                      value={themeSettings.primaryColor}
                      onChange={(e) => handleColorChange(e, "primaryColor")}
                      className="w-24 font-mono text-xs"
                      maxLength={7}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="surfaceColor">Surface Color</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div
                      className="w-8 h-8 rounded-full border"
                      style={{ backgroundColor: themeSettings.surfaceColor }}
                    />
                    <Input
                      id="surfaceColor"
                      type="color"
                      value={themeSettings.surfaceColor}
                      onChange={(e) => handleColorChange(e, "surfaceColor")}
                      className="w-full h-8"
                    />
                    <Input
                      type="text"
                      value={themeSettings.surfaceColor}
                      onChange={(e) => handleColorChange(e, "surfaceColor")}
                      className="w-24 font-mono text-xs"
                      maxLength={7}
                    />
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="mb-2 block">Color Scheme</Label>
                <RadioGroup
                  value={themeSettings.colorScheme}
                  onValueChange={(value) => updateThemeSetting("colorScheme", value as "light" | "dark" | "system")}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark">Dark</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="system" id="system" />
                    <Label htmlFor="system">System</Label>
                  </div>
                </RadioGroup>
              </div>
            </TabsContent>
            
            <TabsContent value="layout" className="space-y-4">
              <div>
                <Label className="mb-2 block">Menu Type</Label>
                <RadioGroup
                  value={themeSettings.menuType}
                  onValueChange={(value) => updateThemeSetting("menuType", value as "static" | "overlay" | "slim" | "slim+")}
                  className="grid grid-cols-2 gap-2"
                >
                  {menuTypes.map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.value} id={type.value} />
                      <Label htmlFor={type.value}>{type.name}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
              
              <Separator />
              
              <div>
                <Label className="mb-2 block">Layout Theme</Label>
                <RadioGroup
                  value={themeSettings.layoutTheme}
                  onValueChange={(value) => updateThemeSetting("layoutTheme", value as "colorScheme" | "primaryColor")}
                  className="space-y-2"
                >
                  {layoutThemes.map((theme) => (
                    <div key={theme.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={theme.value} id={theme.value} />
                      <Label htmlFor={theme.value}>{theme.name}</Label>
                    </div>
                  ))}
                </RadioGroup>
                <p className="text-xs text-muted-foreground mt-2">
                  Choose what determines your layout colors - color scheme or primary color.
                </p>
              </div>
            </TabsContent>
          </Tabs>
          
          <Separator className="my-4" />
          
          <div className="flex flex-col gap-3">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset to Default
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Theme Settings?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will reset all theme customizations to their default values.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={resetThemeSettings}>Reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => exportThemeConfig()}
              >
                Export
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setImportDialogOpen(true)}
              >
                Import
              </Button>
            </div>
          </div>
        </div>
      </aside>
      
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Theme Configuration</DialogTitle>
            <DialogDescription>
              Paste your exported theme configuration here.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Textarea 
              value={importConfig}
              onChange={(e) => setImportConfig(e.target.value)}
              className="font-mono text-xs"
              placeholder="{...}"
              rows={10}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleImport}>
              Import
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
