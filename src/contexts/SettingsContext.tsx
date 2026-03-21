import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../db';
import { AppSettings, LLMConfig } from '../types';

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  isLoaded: boolean;
}

const defaultLLM: LLMConfig = {
  provider: 'gemini',
  modelName: 'gemini-3-flash-preview',
};

const defaultSettings: AppSettings = {
  id: 'current',
  isAutoUpdate: true,
  fontSize: 14,
  lineWrap: true,
  theme: 'dark',
  visualTheme: 'cyberpunk',
  accentColor: '#00FFFF',
  activePlugins: ['backlinks', 'canvas', 'command', 'daily', 'recovery'],
  language: 'English',
  llm: defaultLLM,
  defaultNoteLocation: 'root',
  deleteBehavior: 'trash',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const saved = await db.settings.get('current');
      if (saved) {
        setSettings(saved);
        document.body.setAttribute('data-theme', saved.visualTheme || 'cyberpunk');
        if (saved.accentColor) {
          document.documentElement.style.setProperty('--theme-cyan', saved.accentColor);
        }
      } else {
        await db.settings.put(defaultSettings);
        document.body.setAttribute('data-theme', defaultSettings.visualTheme || 'cyberpunk');
        if (defaultSettings.accentColor) {
          document.documentElement.style.setProperty('--theme-cyan', defaultSettings.accentColor);
        }
      }
      setIsLoaded(true);
    };
    loadSettings();
  }, []);

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    await db.settings.put(newSettings);
    
    if (updates.visualTheme) {
      document.body.setAttribute('data-theme', updates.visualTheme);
    }

    // Apply theme to body
    if (updates.theme) {
      document.documentElement.classList.remove('light', 'dark');
      if (updates.theme !== 'system') {
        document.documentElement.classList.add(updates.theme);
      }
    }
    
    // Apply accent color to CSS variable
    if (updates.accentColor) {
      document.documentElement.style.setProperty('--theme-cyan', updates.accentColor);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoaded }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
