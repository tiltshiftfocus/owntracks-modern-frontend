import React, { createContext, useContext, useState } from 'react';
import OwnTracksAPI from '../api';

interface Settings {
  serverUrl: string;
  username: string;
  password: string;
  useProxy: boolean;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Settings) => void;
  api: OwnTracksAPI;
}

const defaultSettings: Settings = {
  serverUrl: import.meta.env.VITE_API_URL || '/api/0',
  username: import.meta.env.VITE_API_USERNAME || '',
  password: import.meta.env.VITE_API_PASSWORD || '',
  useProxy: true, // Default to using proxy to avoid CORS issues
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load settings from localStorage or use defaults
  const [settings, setSettings] = useState<Settings>(() => {
    const savedSettings = localStorage.getItem('owntracks-settings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
      }
    }
    return defaultSettings;
  });

  // Create API instance based on current settings
  const [api, setApi] = useState<OwnTracksAPI>(
    () => new OwnTracksAPI({
      baseUrl: settings.useProxy ? '/api/0' : settings.serverUrl,
      username: settings.username,
      password: settings.password,
    })
  );

  // Update settings and recreate API instance
  const updateSettings = (newSettings: Settings) => {
    setSettings(newSettings);
    localStorage.setItem('owntracks-settings', JSON.stringify(newSettings));

    // Create new API instance with updated settings
    setApi(new OwnTracksAPI({
      baseUrl: newSettings.useProxy ? '/api/0' : newSettings.serverUrl,
      username: newSettings.username,
      password: newSettings.password,
    }));
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, api }}>
      {children}
    </SettingsContext.Provider>
  );
};
