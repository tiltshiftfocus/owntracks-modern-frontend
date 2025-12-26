import { MapPin, Clock, Battery, Gauge, Mountain } from 'lucide-react';
import { format } from 'date-fns';
import type { LocationPoint } from '../types';

interface LocationInfoProps {
  location: LocationPoint | null;
  onClose: () => void;
}

export default function LocationInfo({ location, onClose }: LocationInfoProps) {
  if (!location) return null;

  const timestamp = location.isotst 
    ? new Date(location.isotst)
    : new Date(location.tst * 1000);

  return (
    <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-sm z-[1000]">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">Location Details</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-700">Coordinates</div>
            <div className="text-xs text-gray-600 font-mono">
              {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
            </div>
            {location.addr && (
              <div className="text-xs text-gray-500 mt-1">{location.addr}</div>
            )}
            {location.locality && !location.addr && (
              <div className="text-xs text-gray-500 mt-1">{location.locality}</div>
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          <Clock className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <div className="text-sm font-medium text-gray-700">Timestamp</div>
            <div className="text-xs text-gray-600">
              {format(timestamp, 'PPpp')}
            </div>
          </div>
        </div>

        {location.batt !== undefined && (
          <div className="flex items-start gap-2">
            <Battery className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">Battery</div>
              <div className="text-xs text-gray-600">{location.batt}%</div>
            </div>
          </div>
        )}

        {location.vel !== undefined && location.vel > 0 && (
          <div className="flex items-start gap-2">
            <Gauge className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">Velocity</div>
              <div className="text-xs text-gray-600">{location.vel} km/h</div>
            </div>
          </div>
        )}

        {location.alt !== undefined && (
          <div className="flex items-start gap-2">
            <Mountain className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">Altitude</div>
              <div className="text-xs text-gray-600">{location.alt} m</div>
            </div>
          </div>
        )}

        {location.tid && (
          <div className="pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Tracker ID: <span className="font-mono">{location.tid}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
