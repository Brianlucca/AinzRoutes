export type MonitorStatus = 'online' | 'offline' | 'unstable' | 'unknown';
export type MonitorMethod = 'tcp' | 'http' | 'official';
export type MonitorSignal = 'official_service_status' | 'page_reachability' | 'endpoint_reachability';
export type MonitorSourceType = 'official_api' | 'official_page' | 'public_endpoint';
export type MonitorCategory = 'productivity' | 'infrastructure' | 'social' | 'streaming' | 'gaming';

export interface ServiceStatus {
  id: string;
  name: string;
  isCustom?: boolean;
  category?: MonitorCategory;
  status: MonitorStatus;
  latency: number | null;
  method?: MonitorMethod;
  signal?: MonitorSignal;
  sourceType?: MonitorSourceType;
  url?: string | null;
  target?: string;
  port?: number | string | null;
  notes?: string | null;
  error?: string | null;
  httpStatus?: number | null;
  resolvedTarget?: {
    hostname: string;
    addresses: string[];
  } | null;
  measurement?: {
    measuredFrom: 'server';
    latencyPath: 'server_to_target';
    requesterIp: string | null;
    requestIpSource: 'x-forwarded-for' | 'remote-address' | 'unknown';
    serverAddress: string | null;
    canRepresentUserToTargetLatency: false;
  } | null;
}

export interface ModalData extends ServiceStatus {
  geoLoading?: boolean;
  geo?: {
    country: string;
    city: string;
    isp: string;
    as: string;
    lat?: number;
    lon?: number;
  };
}

export interface ServiceHistoryPoint {
  timestamp: number;
  status: MonitorStatus;
  latency: number | null;
}
