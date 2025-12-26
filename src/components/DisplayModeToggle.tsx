import { MapPin, Route as RouteIcon, Flame } from 'lucide-react';
import type { DisplayModes } from '../types';

interface DisplayModeToggleProps {
  modes: DisplayModes;
  onModesChange: (modes: DisplayModes) => void;
}

export default function DisplayModeToggle({ modes, onModesChange }: DisplayModeToggleProps) {
  const toggleMode = (modeKey: keyof DisplayModes) => {
    onModesChange({
      ...modes,
      [modeKey]: !modes[modeKey],
    });
  };
  return (
    <div className="flex items-center bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      <button
        onClick={() => toggleMode('points')}
        className={`flex flex-1 justify-center items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
          modes.points
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        title="Points"
      >
        <MapPin className="w-4 h-4" />
        <span className="hidden xs:inline sm:inline">Points</span>
      </button>
      <button
        onClick={() => toggleMode('track')}
        className={`flex flex-1 justify-center items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
          modes.track
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        title="Track"
      >
        <RouteIcon className="w-4 h-4" />
        <span className="hidden xs:inline sm:inline">Track</span>
      </button>
      <button
        onClick={() => toggleMode('heatmap')}
        className={`flex flex-1 justify-center items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
          modes.heatmap
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50'
        }`}
        title="Heatmap"
      >
        <Flame className="w-4 h-4" />
        <span className="hidden xs:inline sm:inline">Heatmap</span>
      </button>
    </div>
  );
}
