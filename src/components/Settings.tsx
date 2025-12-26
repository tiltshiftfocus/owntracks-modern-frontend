import { useState, useEffect } from 'react';
import { X, Save, Settings as SettingsIcon } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const { settings, updateSettings } = useSettings();
  const [formData, setFormData] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200); // Match animation duration
  };

  const handleSave = () => {
    updateSettings(formData);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      handleClose();
    }, 1000);
  };

  const handleChange = (field: keyof typeof formData, value: string | boolean) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[3000] p-4 transition-opacity duration-200 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl max-w-md w-full transition-all duration-200 ${
          isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Server Settings</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-4 space-y-4">
          {/* CORS Proxy Toggle */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="useProxy"
                checked={formData.useProxy}
                onChange={(e) => handleChange('useProxy', e.target.checked)}
                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor="useProxy" className="text-sm font-medium text-gray-900 cursor-pointer">
                  Use Development Proxy (Recommended)
                </label>
                <p className="mt-1 text-xs text-gray-600">
                  Bypasses CORS errors during development. Requires setting VITE_PROXY_TARGET environment variable to your server URL.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="serverUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Server URL
            </label>
            <input
              type="text"
              id="serverUrl"
              value={formData.serverUrl}
              onChange={(e) => handleChange('serverUrl', e.target.value)}
              placeholder="https://your-server.com/api/0"
              disabled={formData.useProxy}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <p className="mt-1 text-xs text-gray-500">
              {formData.useProxy
                ? 'Using proxy - configure VITE_PROXY_TARGET in .env file'
                : 'Direct connection (may have CORS issues if server not configured)'}
            </p>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username (Optional)
            </label>
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={(e) => handleChange('username', e.target.value)}
              placeholder="username"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password (Optional)
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              placeholder="password"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
            <p className="mt-1 text-xs text-gray-500">
              Leave empty if authentication is handled by reverse proxy
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-green-600"
          >
            {saved ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm font-medium">Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span className="text-sm font-medium">Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
