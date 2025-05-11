
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTheme } from '@/common/components/ThemeProvider';

export type MenuType = 'static' | 'overlay' | 'slim' | 'slim+';
export type PresetTheme = 'aura' | 'lara' | 'nora';

export interface ThemeSettings {
  colorScheme: 'light' | 'dark' | 'system';
  primaryColor: string;
  surfaceColor: string;
  menuType: MenuType;
  preset: PresetTheme;
  layoutTheme: 'colorScheme' | 'primaryColor';
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
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeCustomizerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { setTheme } = useTheme();
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    const savedTheme = localStorage.getItem('poes-theme-settings');
    return savedTheme ? JSON.parse(savedTheme) : defaultThemeSettings;
  });

  useEffect(() => {
    // Apply color scheme
    setTheme(themeSettings.colorScheme);
    
    // Save settings to local storage
    localStorage.setItem('poes-theme-settings', JSON.stringify(themeSettings));
    
    // Apply CSS variables for custom colors
    document.documentElement.style.setProperty('--primary-color', themeSettings.primaryColor);
    document.documentElement.style.setProperty('--surface-color', themeSettings.surfaceColor);
    
  }, [themeSettings, setTheme]);

  const updateThemeSetting = <K extends keyof ThemeSettings>(
    key: K, 
    value: ThemeSettings[K]
  ) => {
    setThemeSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetThemeSettings = () => {
    setThemeSettings(defaultThemeSettings);
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
  };

  const importThemeConfig = (config: ThemeSettings) => {
    setThemeSettings(config);
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
