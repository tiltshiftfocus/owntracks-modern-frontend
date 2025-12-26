import { useState, useEffect } from 'react';
import { X, Server, Info as InfoIconLucide } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

interface InfoProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Info({ isOpen, onClose }: InfoProps) {
  const { settings, api } = useSettings();
  const [versionInfo, setVersionInfo] = useState<{ version: string; [key: string]: any } | null>(null);
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      loadVersionInfo();
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200); // Match animation duration
  };

  const loadVersionInfo = async () => {
    setLoading(true);
    try {
      const info = await api.getVersion();
      setVersionInfo(info);
    } catch (error) {
      console.error('Failed to load version info:', error);
      setVersionInfo({ version: 'Error loading version' });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

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
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <InfoIconLucide className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Server Information</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Server URL */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Server className="w-4 h-4" />
              <span>Connected Server</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <code className="text-sm text-gray-900 break-all">
                {settings.useProxy ? '/api/0 (Proxy)' : settings.serverUrl}
              </code>
            </div>
          </div>

          {/* Recorder Version */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <InfoIconLucide className="w-4 h-4" />
              <span>Recorder Version</span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              {loading ? (
                <div className="text-sm text-gray-500">Loading...</div>
              ) : versionInfo ? (
                <div className="space-y-1">
                  <div className="text-sm font-mono text-gray-900">
                    {versionInfo.version}
                  </div>
                  {Object.entries(versionInfo).map(([key, value]) => {
                    if (key === 'version') return null;
                    return (
                      <div key={key} className="text-xs text-gray-600">
                        <span className="font-medium">{key}:</span> {String(value)}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No version information available</div>
              )}
            </div>
          </div>

          {/* Authentication Status */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Authentication</div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
              <div className="text-sm text-gray-900">
                {settings.username ? (
                  <>
                    Authenticated as: <span className="font-mono">{settings.username}</span>
                  </>
                ) : (
                  <span className="text-gray-500">No authentication configured</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}