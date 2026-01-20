  import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Icon, LatLngBounds } from 'leaflet';
import 'leaflet.heat';
import { format } from 'date-fns';
import type { LocationPoint, DisplayModes } from '../types';

interface MapViewProps {
  locations: LocationPoint[];
  modes: DisplayModes;
  onPointClick: (location: LocationPoint) => void;
  onMapInteraction?: () => void;
}

// Component to handle map bounds
function MapBounds({ locations }: { locations: LocationPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length > 0) {
      const bounds = new LatLngBounds(
        locations.map(loc => [loc.lat, loc.lon])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [locations, map]);

  return null;
}

// Component to handle map interactions
function MapInteractionHandler({ onInteraction }: { onInteraction?: () => void }) {
  const map = useMap();

  useEffect(() => {
    if (!onInteraction) return;

    const handleDragStart = () => {
      onInteraction();
    };

    map.on('dragstart', handleDragStart);

    return () => {
      map.off('dragstart', handleDragStart);
    };
  }, [map, onInteraction]);

  return null;
}

// Component to render heatmap layer
function HeatmapLayer({ locations }: { locations: LocationPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || locations.length === 0) return;

    // Convert locations to heatmap data format [lat, lon, intensity]
    const heatData: [number, number, number][] = locations.map(loc => {
      // Use velocity as intensity if available, otherwise use 1
      const intensity = loc.vel !== undefined && loc.vel > 0 ? Math.min(loc.vel / 100, 1) : 0.5;
      return [loc.lat, loc.lon, intensity];
    });

    // Create heatmap layer with custom options
    // @ts-ignore - leaflet.heat types may not be fully compatible
    const heatLayer = (window as any).L.heatLayer(heatData, {
      radius: 25,
      blur: 15,
      maxZoom: 17,
      max: 1.0,
      gradient: {
        0.0: 'blue',
        0.3: 'cyan',
        0.5: 'lime',
        0.7: 'yellow',
        1.0: 'red'
      }
    });

    heatLayer.addTo(map);

    // Cleanup function to remove the layer when component unmounts
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, locations]);

  return null;
}

export default function MapView({ locations, modes, onPointClick, onMapInteraction }: MapViewProps) {
  const [center] = useState<[number, number]>([51.505, -0.09]); // Default to London

  // Create custom marker icon
  const markerIcon = new Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [13, 21],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [21, 21]
  });

  // Prepare polyline coordinates for track mode
  const polylinePositions: [number, number][] = locations.map(loc => [loc.lat, loc.lon]);

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <ZoomControl position='bottomright'/>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapInteractionHandler onInteraction={onMapInteraction} />

      {locations.length > 0 && <MapBounds locations={locations} />}

      {modes.heatmap && <HeatmapLayer locations={locations} />}

      {modes.points && (
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={50}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
        >
          {locations.map((location, idx) => {
            // Always use tst (Unix timestamp) - isotst parsing causes timezone issues
            const timestamp = new Date(location.tst * 1000);

            return (
              <Marker
                key={`${location.lat}-${location.lon}-${idx}`}
                position={[location.lat, location.lon]}
                icon={markerIcon}
                eventHandlers={{
                  click: () => onPointClick(location),
                }}
              >
                <Popup>
                  <div className="text-sm space-y-1">
                    <div className="font-semibold text-gray-900">
                      {format(timestamp, 'PPp')}
                    </div>
                    <div className="text-xs text-gray-600 font-mono">
                      {location.lat.toFixed(6)}, {location.lon.toFixed(6)}
                    </div>
                    {location.addr && (
                      <div className="text-xs text-gray-700 mt-1">{location.addr}</div>
                    )}
                    {location.batt !== undefined && (
                      <div className="text-xs text-gray-600">Battery: {location.batt}%</div>
                    )}
                    {location.vel !== undefined && location.vel > 0 && (
                      <div className="text-xs text-gray-600">Speed: {location.vel} km/h</div>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      )}

      {modes.track && polylinePositions.length > 1 && (
        <>
          <Polyline
            positions={polylinePositions}
            color="#3b82f6"
            weight={3}
            opacity={0.7}
          />
          {/* Show start marker */}
          {locations.length > 0 && (
            <Marker
              position={[locations[0].lat, locations[0].lon]}
              icon={new Icon({
                iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#22c55e" width="32" height="32">
                    <circle cx="12" cy="12" r="10" />
                    <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif">S</text>
                  </svg>
                `),
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              })}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold text-green-600">Start</div>
                  <div className="text-xs text-gray-600">
                    {format(new Date(locations[0].tst * 1000), 'PPp')}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
          {/* Show end marker */}
          {locations.length > 1 && (
            <Marker
              position={[locations[locations.length - 1].lat, locations[locations.length - 1].lon]}
              icon={new Icon({
                iconUrl: 'data:image/svg+xml;base64,' + btoa(`
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" width="32" height="32">
                    <circle cx="12" cy="12" r="10" />
                    <text x="12" y="16" text-anchor="middle" fill="white" font-size="12" font-weight="bold" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif">E</text>
                  </svg>
                `),
                iconSize: [32, 32],
                iconAnchor: [16, 16],
              })}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold text-red-600">End</div>
                  <div className="text-xs text-gray-600">
                    {format(new Date(locations[locations.length - 1].tst * 1000), 'PPp')}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </>
      )}
    </MapContainer>
  );
}
