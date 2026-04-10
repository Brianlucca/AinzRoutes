export interface DashboardCount {
  key: string;
  label: string;
  value: number;
}

export interface DashboardLatencyRankingItem {
  id: string;
  name: string;
  latency: number;
  status: 'online' | 'unstable' | 'offline';
  category: string;
}

export interface DashboardOverview {
  generatedAt: string;
  totals: {
    services: number;
    online: number;
    unstable: number;
    offline: number;
    withOfficialSignal: number;
    averageLatency: number | null;
  };
  charts: {
    statusDistribution: DashboardCount[];
    categoryDistribution: DashboardCount[];
    methodDistribution: DashboardCount[];
    sourceDistribution: DashboardCount[];
    portDistribution: DashboardCount[];
    resolvedAddressDistribution: DashboardCount[];
    latencyRanking: DashboardLatencyRankingItem[];
  };
  highlights: {
    unstableOrOfflineServices: Array<{
      id: string;
      name: string;
      status: 'online' | 'unstable' | 'offline';
      latency: number | null;
      category: string;
      target: string;
    }>;
    fastestServices: DashboardLatencyRankingItem[];
  };
}
