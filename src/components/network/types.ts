export type ProbeKind = 'ipv4' | 'ipv6' | 'dual';

export interface ProbeResult {
  id: string;
  label: string;
  success: boolean;
  latency: number | null;
  address: string | null;
  version: 4 | 6 | null;
  transportLabel: string;
  detail: string;
}

export interface DiagnosticsState {
  session: any;
  addressing: {
    ipv4: string | null;
    ipv6: string | null;
    currentTransportVersion: string;
  };
  provider: any;
  dns: {
    userDnsDetected: boolean;
    note: string;
    serverResolvers: string[];
  };
  diagnostics?: {
    ipInfoProviderStatus?: string;
    ipInfoProviderMessage?: string | null;
  };
}
