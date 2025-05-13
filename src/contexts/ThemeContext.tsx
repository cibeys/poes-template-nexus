
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from '@/common/components/ThemeProvider';
import { toast } from '@/hooks/use-toast';

export type MenuType = 'static' | 'overlay' | 'slim' | 'slim+';
export type PresetTheme = 'aura' | 'lara' | 'nora';

export interface ThemeSettings {
  colorScheme: 'light' | 'dark' | 'system';
  primaryColor: string;
  surfaceColor: string;
  menuType: MenuType;
  preset: PresetTheme;
  layoutTheme: 'colorScheme' | 'primaryColor';
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  borderRadius: number;
}

type ThemeContextType = {
  themeSettings: ThemeSettings;
  updateThemeSetting: <K extends keyof ThemeSettings>(key: K, value: ThemeSettings[K]) => void;
  resetThemeSettings: () => void;
  isCustomizerOpen: boolean;
  toggleCustomizer: () => void;
  exportThemeConfig: () => void;
  importThemeConfig: (config: ThemeSettings) => void;
};

const defaultThemeSettings: ThemeSettings = {
  colorScheme: 'system',
  primaryColor: '#3B82F6', // Default blue
  surfaceColor: '#f8fafc', // Light surface
  menuType: 'static',
  preset: 'aura',
  layoutTheme: 'colorScheme',
  fontFamily: 'font-sans',
  fontSize: 16,
  lineHeight: 1.5,
  borderRadius: 0.5,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeCustomizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setTheme } = useTheme();
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('tanoeluis-theme-settings');
      return savedTheme ? JSON.parse(savedTheme) : defaultThemeSettings;
    }
    return defaultThemeSettings;
  });

  useEffect(() => {
    // Apply color scheme
    setTheme(themeSettings.colorScheme);
    
    // Save settings to local storage
    if (typeof window !== 'undefined') {
      localStorage.setItem('tanoeluis-theme-settings', JSON.stringify(themeSettings));
    }
    
    // Apply CSS variables for custom colors
    document.documentElement.style.setProperty('--primary-rgb', hexToRgb(themeSettings.primaryColor));
    document.documentElement.style.setProperty('--surface-rgb', hexToRgb(themeSettings.surfaceColor));
    
    // Apply font family
    if (themeSettings.fontFamily) {
      document.documentElement.style.setProperty('--font-family', themeSettings.fontFamily);
      document.body.className = document.body.className.replace(/font-\w+/g, '');
      document.body.classList.add(themeSettings.fontFamily);
    }
    
    // Apply font size
    if (themeSettings.fontSize) {
      document.documentElement.style.setProperty('--font-size-base', `${themeSettings.fontSize}px`);
    }
    
    // Apply line height
    if (themeSettings.lineHeight) {
      document.documentElement.style.setProperty('--line-height-base', `${themeSettings.lineHeight}`);
    }
    
    // Apply border radius
    if (themeSettings.borderRadius !== undefined) {
      document.documentElement.style.setProperty('--radius', `${themeSettings.borderRadius}rem`);
    }
    
    // Apply preset class
    document.body.classList.remove('preset-aura', 'preset-lara', 'preset-nora');
    document.body.classList.add(`preset-${themeSettings.preset}`);
    
    // Apply menu type
    document.body.classList.remove('menu-static', 'menu-overlay', 'menu-slim', 'menu-slim-plus');
    document.body.classList.add(`menu-${themeSettings.menuType === 'slim+' ? 'slim-plus' : themeSettings.menuType}`);
    
  }, [themeSettings, setTheme]);

  function hexToRgb(hex: string): string {
    // Remove the # if it exists
    hex = hex.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `${r}, ${g}, ${b}`;
  }

  const updateThemeSetting = <K extends keyof ThemeSettings>(
    key: K, 
    value: ThemeSettings[K]
  ) => {
    setThemeSettings(prev => {
      const newSettings = { ...prev, [key]: value };
      
      // Apply preset-specific settings if preset is changed
      if (key === 'preset') {
        if (value === 'aura') {
          newSettings.primaryColor = '#8B5CF6';
          newSettings.surfaceColor = '#f8fafc';
          newSettings.fontFamily = 'font-sans';
        } else if (value === 'lara') {
          newSettings.primaryColor = '#3B82F6';
          newSettings.surfaceColor = '#ffffff';
          newSettings.fontFamily = 'font-sans';
        } else if (value === 'nora') {
          newSettings.primaryColor = '#D946EF';
          newSettings.surfaceColor = '#121212';
          newSettings.fontFamily = 'font-sans';
        }
      }
      
      return newSettings;
    });
  };

  const resetThemeSettings = () => {
    setThemeSettings(defaultThemeSettings);
    toast({
      title: "Settings Reset",
      description: "All theme settings have been reset to defaults",
    });
  };

  const toggleCustomizer = () => {
    setIsCustomizerOpen(prev => !prev);
  };

  const exportThemeConfig = () => {
    const dataStr = JSON.stringify(themeSettings, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = 'theme-config.json';
    link.href = url;
    link.click();
    
    toast({
      title: "Theme Exported",
      description: "Theme configuration has been exported as JSON",
    });
  };

  const importThemeConfig = (config: ThemeSettings) => {
    try {
      setThemeSettings(config);
      toast({
        title: "Theme Imported",
        description: "Theme configuration has been successfully applied",
      });
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "Failed to import theme configuration",
        variant: "destructive",
      });
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        themeSettings,
        updateThemeSetting,
        resetThemeSettings,
        isCustomizerOpen,
        toggleCustomizer,
        exportThemeConfig,
        importThemeConfig,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeCustomizer = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeCustomizer must be used within a ThemeCustomizerProvider');
  }
  return context;
};
