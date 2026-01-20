export type DateOrNull = Date | null
export interface LocationPoint {
  _type: 'location';
  lat: number;
  lon: number;
  tst: number;
  tid?: string;
  batt?: number;
  vel?: number;
  alt?: number;
  acc?: number;
  SSID?: string;
  conn?: string;
  addr?: string;
  locality?: string;
  cc?: string;
  ghash?: string;
  isotst?: string;
  isorcv?: string;
  disptst?: string;
}

export interface User {
  name: string;
  devices: Device[];
}

export interface Device {
  user: string;
  device: string;
  tid?: string;
}

export interface LastPosition extends LocationPoint {
  username: string;
  device: string;
  topic: string;
}

export interface LocationsResponse {
  count: number;
  data: LocationPoint[];
  status: number;
}

export interface LastPositionsResponse {
  [key: string]: LastPosition;
}

export interface DateRange {
  from: Date | null;
  to: Date | null;
}

export interface DisplayModes {
  points: boolean;
  track: boolean;
  heatmap: boolean;
}

export interface ApiConfig {
  baseUrl: string;
  username?: string;
  password?: string;
  useProxy?: boolean;
}
