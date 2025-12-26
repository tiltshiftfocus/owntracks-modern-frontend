import { useEffect, useState } from 'react';
import { RefreshCw, Loader2, Settings as SettingsIcon, InfoIcon, Menu, X } from 'lucide-react';
import { subHours } from 'date-fns';
import MapView from './components/MapView';
import UserSelector from './components/UserSelector';
import DeviceSelector from './components/DeviceSelector';
import DateRangePicker from './components/DateRangePicker';
import DisplayModeToggle from './components/DisplayModeToggle';
import LocationInfo from './components/LocationInfo';
import Settings from './components/Settings';
import Info from './components/Info';
import { useSettings } from './contexts/SettingsContext';
import type { User, Device, LocationPoint, DateRange, DisplayModes } from './types';

function App() {
  const { api } = useSettings();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subHours(new Date(), 12),
    to: new Date(),
  });
  const [displayModes, setDisplayModes] = useState<DisplayModes>({
    points: true,
    track: false,
    heatmap: false,
  });
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationPoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Load users on mount and when API changes
  useEffect(() => {
    loadUsers();
  }, [api]);

  // Load locations when filters change
  useEffect(() => {
    if (selectedUser && dateRange.from && dateRange.to) {
      loadLocations();
    }
  }, [selectedUser, selectedDevice, dateRange]);

  // Clear device selection when user changes
  useEffect(() => {
    setSelectedDevice(null);
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      setError(null);
      const userList = await api.getUsers();
      setUsers(userList);

      // Auto-select first user if available
      if (userList.length > 0 && !selectedUser) {
        setSelectedUser(userList[0]);
      }
    } catch (err) {
      setError('Failed to load users. Please check your connection.');
      console.error('Error loading users:', err);
    }
  };

  const loadLocations = async () => {
    if (!selectedUser || !dateRange.from || !dateRange.to) return;

    try {
      setLoading(true);
      setError(null);

      const format = displayModes.track ? 'linestring' : 'json';
      let allLocationData: LocationPoint[] = [];

      if (selectedDevice) {
        // Fetch for single device
        const locationData = await api.getLocations(
          selectedUser.name,
          selectedDevice.device,
          dateRange.from,
          dateRange.to,
          format
        );
        allLocationData = locationData;
      } else {
        // Fetch for all devices and aggregate
        const locationPromises = selectedUser.devices.map(device =>
          api.getLocations(
            selectedUser.name,
            device.device,
            dateRange.from!,
            dateRange.to!,
            format
          )
        );

        const results = await Promise.all(locationPromises);

        // Combine all results and sort by timestamp
        allLocationData = results
          .flat()
          .sort((a, b) => a.tst - b.tst);
      }

      setLocations(allLocationData);

      if (allLocationData.length === 0) {
        setError('No location data found for the selected period.');
      }
    } catch (err) {
      setError('Failed to load location data. Please try again.');
      console.error('Error loading locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (selectedUser) {
      loadLocations();
    } else {
      loadUsers();
    }
  };

  const handleMapInteraction = () => {
    if (controlsVisible) {
      setControlsVisible(false);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Map */}
      <MapView
        locations={locations}
        modes={displayModes}
        onPointClick={setSelectedLocation}
        onMapInteraction={handleMapInteraction}
      />


      {/* Error Message */}
        {error && (
          <div className="absolute right-4 bottom-4 left-4 sm:left-auto sm:right-6 sm:bottom-10 pointer-events-auto bg-red-50 border border-red-200 px-4 py-3 rounded-lg shadow-md sm:max-w-md z-[1000]">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 pointer-events-none z-[1000]">
        <div className="flex gap-2 sm:gap-3 pointer-events-auto">
          <div className="bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-md border border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setInfoOpen(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Info"
            >
              <InfoIcon className="w-5 h-5" />
            </button>
          </div>
          <div className="bg-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-md border border-gray-200 flex items-center justify-between">
            <button
              onClick={() => setSettingsOpen(true)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Settings"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Toggle Controls Button */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 pointer-events-none z-[1000]">
        <button
          onClick={() => setControlsVisible(!controlsVisible)}
          className="pointer-events-auto bg-white/95 backdrop-blur-sm p-2 sm:p-3 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          title={controlsVisible ? 'Hide controls' : 'Show controls'}
        >
          {controlsVisible ? (
            <X className="w-5 h-5 text-gray-700" />
          ) : (
            <Menu className="w-5 h-5 text-gray-700" />
          )}
        </button>
      </div>

      {/* Floating Controls */}
      {controlsVisible && (
        <div className="absolute top-4 left-16 sm:top-6 sm:left-20 right-4 sm:right-auto pointer-events-none z-[1000]">
          <div className="flex flex-col gap-3 pointer-events-auto w-full sm:max-w-sm">
            {/* Filters */}
            <div className="bg-white/95 backdrop-blur-sm p-3 sm:p-4 rounded-lg shadow-lg border border-gray-200 space-y-2 sm:space-y-3">
              <UserSelector
                users={users}
                selectedUser={selectedUser}
                onSelectUser={setSelectedUser}
              />

              {selectedUser && (
                <DeviceSelector
                  devices={selectedUser.devices}
                  selectedDevice={selectedDevice}
                  onSelectDevice={setSelectedDevice}
                />
              )}

              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />

              <DisplayModeToggle
                modes={displayModes}
                onModesChange={setDisplayModes}
              />

              <button
                onClick={handleRefresh}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs sm:text-sm font-medium">Loading...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-medium">Refresh</span>
                  </>
                )}
              </button>
            </div>

            {/* Stats */}
            {locations.length > 0 && (
              <div className="bg-white/95 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3 rounded-lg shadow-md border border-gray-200 -z-10">
                <div className="text-xs sm:text-sm text-gray-600">
                  <span className="font-semibold text-gray-900">{locations.length}</span> location points
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Location Info Panel */}
      <LocationInfo
        location={selectedLocation}
        onClose={() => setSelectedLocation(null)}
      />

      {/* Info Modal */}
      <Info
        isOpen={infoOpen}
        onClose={() => setInfoOpen(false)}
      />

      {/* Settings Modal */}
      <Settings
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-[2000] pointer-events-none">
          <div className="bg-white px-6 py-4 rounded-lg shadow-xl flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Loading location data...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
