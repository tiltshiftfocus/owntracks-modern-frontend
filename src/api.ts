import type {
  Device,
  User,
  LastPosition,
  LocationsResponse,
  LocationPoint,
  ApiConfig
} from './types';

class OwnTracksAPI {
  private baseUrl: string;
  private auth?: string;

  constructor(config: ApiConfig) {
    this.baseUrl = config.baseUrl || '/api/0';
    if (config.username && config.password) {
      this.auth = btoa(`${config.username}:${config.password}`);
    }
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(this.auth && { 'Authorization': `Basic ${this.auth}` }),
      ...options?.headers,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getUsers(): Promise<User[]> {
    try {
      const response = await this.fetch<{ [key: string]: LastPosition }>('/last');

      // Group devices by user
      const userMap = new Map<string, Device[]>();

      Object.values(response).forEach((position) => {
        const userName = position.username;
        if (!userMap.has(userName)) {
          userMap.set(userName, []);
        }

        const devices = userMap.get(userName)!;
        const deviceExists = devices.some(d => d.device === position.device);

        if (!deviceExists) {
          devices.push({
            user: position.username,
            device: position.device,
            tid: position.tid,
          });
        }
      });

      // Convert to User array
      return Array.from(userMap.entries()).map(([name, devices]) => ({
        name,
        devices,
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getDevices(): Promise<Device[]> {
    try {
      const response = await this.fetch<{ [key: string]: LastPosition }>('/last');

      // Convert the response object to an array of devices
      const devices: Device[] = [];
      const seen = new Set<string>();

      Object.values(response).forEach((position) => {
        const key = `${position.username}/${position.device}`;
        if (!seen.has(key)) {
          seen.add(key);
          devices.push({
            user: position.username,
            device: position.device,
            tid: position.tid,
          });
        }
      });

      return devices;
    } catch (error) {
      console.error('Error fetching devices:', error);
      return [];
    }
  }

  async getLastPositions(user?: string, device?: string): Promise<LastPosition[]> {
    try {
      let endpoint = '/last';
      const params = new URLSearchParams();
      
      if (user) params.append('user', user);
      if (device) params.append('device', device);
      
      if (params.toString()) {
        endpoint += `?${params.toString()}`;
      }

      const response = await this.fetch<{ [key: string]: LastPosition }>(endpoint);
      return Object.values(response);
    } catch (error) {
      console.error('Error fetching last positions:', error);
      return [];
    }
  }

  async getLocations(
    user: string,
    device?: string,
    from?: Date,
    to?: Date,
    format: 'json' | 'geojson' | 'linestring' = 'json'
  ): Promise<LocationPoint[]> {
    try {
      const params = new URLSearchParams({
        user,
        format,
      });

      // Only add device if specified (otherwise get all devices for user)
      if (device) {
        params.append('device', device);
      }

      if (from) {
        params.append('from', this.formatDate(from));
      }
      if (to) {
        params.append('to', this.formatDate(to));
      }

      const endpoint = `/locations?${params.toString()}`;
      
      if (format === 'json') {
        const response = await this.fetch<LocationsResponse>(endpoint);
        return response.data || [];
      } else if (format === 'geojson') {
        const response = await this.fetch<GeoJSON.FeatureCollection>(endpoint);
        return response.features.map(feature => ({
          ...(feature.properties as any),
          lat: (feature.geometry as GeoJSON.Point).coordinates[1],
          lon: (feature.geometry as GeoJSON.Point).coordinates[0],
        }));
      } else {
        // linestring format
        const response = await this.fetch<GeoJSON.Feature>(endpoint);
        if (response.geometry.type === 'LineString') {
          return (response.geometry as GeoJSON.LineString).coordinates.map((coord, idx) => ({
            _type: 'location' as const,
            lat: coord[1],
            lon: coord[0],
            tst: Date.now() / 1000 - idx, // Approximate timestamp
          }));
        }
        return [];
      }
    } catch (error) {
      console.error('Error fetching locations:', error);
      return [];
    }
  }

  async getVersion(): Promise<{ version: string; [key: string]: any }> {
    try {
      const response = await this.fetch<{ version: string; [key: string]: any }>('/version');
      return response;
    } catch (error) {
      console.error('Error fetching version:', error);
      return { version: 'unknown' };
    }
  }

  private formatDate(date: Date): string {
    return date.toISOString(); // Full ISO 8601 datetime in UTC (YYYY-MM-DDTHH:mm:ss.sssZ)
  }
}

// Create singleton instance
const apiConfig: ApiConfig = {
  baseUrl: import.meta.env.VITE_API_URL || '/api/0',
  username: import.meta.env.VITE_API_USERNAME,
  password: import.meta.env.VITE_API_PASSWORD,
};

export const api = new OwnTracksAPI(apiConfig);
export default OwnTracksAPI;
