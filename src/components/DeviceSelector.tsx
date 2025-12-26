import { useEffect, useState } from 'react';
import { Smartphone, ChevronDown } from 'lucide-react';
import type { Device } from '../types';

interface DeviceSelectorProps {
  devices: Device[];
  selectedDevice: Device | null;
  onSelectDevice: (device: Device | null) => void;
  disabled?: boolean;
}

export default function DeviceSelector({
  devices,
  selectedDevice,
  onSelectDevice,
  disabled = false
}: DeviceSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.device-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSelect = (device: Device) => {
    onSelectDevice(device);
    setIsOpen(false);
  };

  const displayText = selectedDevice
    ? selectedDevice.device
    : 'All devices';

  return (
    <div className="device-selector relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
      >
        <Smartphone className="w-4 h-4 text-gray-600 flex-shrink-0" />
        <span className="flex-1 text-left text-xs sm:text-sm font-medium truncate">
          {displayText}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-600 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && devices.length > 0 && (
        <div className="absolute top-full mt-2 w-full max-w-sm bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] max-h-80 overflow-y-auto custom-scrollbar">
          <div className="p-2">
            <button
              onClick={() => handleSelect(null as any)}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 rounded transition-colors ${
                !selectedDevice ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-700'
              }`}
            >
              All devices
            </button>
            {devices.map((device) => {
              const key = `${device.user}/${device.device}`;
              const isSelected = selectedDevice?.device === device.device;

              return (
                <button
                  key={key}
                  onClick={() => handleSelect(device)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-blue-50 rounded transition-colors flex items-center gap-2 ${
                    isSelected ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <Smartphone className="w-3 h-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{device.device}</div>
                  </div>
                  {device.tid && (
                    <span className="text-xs font-mono bg-gray-200 px-2 py-0.5 rounded">
                      {device.tid}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
