import type { ServiceStatus } from '../services/types';
import type { DashboardCount, DashboardLatencyRankingItem, DashboardOverview } from './types';

const buildCountMap = (entries: string[], labels?: Record<string, string>): DashboardCount[] => {
  const counts = new Map<string, number>();

  entries.forEach((entry) => {
    counts.set(entry, (counts.get(entry) || 0) + 1);
  });

  return [...counts.entries()]
    .map(([key, value]) => ({
      key,
      label: labels?.[key] || key,
      value
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label));
};

const toLatencyItems = (services: ServiceStatus[], direction: 'desc' | 'asc', limit: number): DashboardLatencyRankingItem[] =>
  services
    .filter((service) => service.latency !== null)
    .sort((a, b) => (direction === 'desc' ? (b.latency || 0) - (a.latency || 0) : (a.latency || 0) - (b.latency || 0)))
    .slice(0, limit)
    .map((service) => ({
      id: service.id,
      name: service.name,
      latency: service.latency || 0,
      status: service.status === 'unknown' ? 'offline' : service.status,
      category: service.category || 'infrastructure'
    }));

const getAddressKind = (service: ServiceStatus) => {
  const addresses = service.resolvedTarget?.addresses || [];

  if (!addresses.length) {
    return 'unresolved';
  }

  if (addresses.some((address) => address.includes(':'))) {
    return 'ipv6';
  }

  return 'ipv4';
};

export const buildOverviewFromServices = (services: ServiceStatus[]): DashboardOverview => {
  const online = services.filter((service) => service.status === 'online').length;
  const unstable = services.filter((service) => service.status === 'unstable').length;
  const offline = services.filter((service) => service.status === 'offline').length;
  const withOfficialSignal = services.filter((service) => service.signal === 'official_service_status').length;
  const latencyValues = services
    .map((service) => service.latency)
    .filter((latency): latency is number => latency !== null);

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      services: services.length,
      online,
      unstable,
      offline,
      withOfficialSignal,
      averageLatency: latencyValues.length ? Math.round(latencyValues.reduce((sum, latency) => sum + latency, 0) / latencyValues.length) : null
    },
    charts: {
      statusDistribution: buildCountMap(services.map((service) => service.status), {
        online: 'Online',
        unstable: 'Instável',
        offline: 'Offline'
      }),
      categoryDistribution: buildCountMap(services.map((service) => service.category || 'infrastructure'), {
        productivity: 'Produtividade',
        infrastructure: 'Infraestrutura',
        social: 'Social',
        streaming: 'Streaming',
        gaming: 'Games'
      }),
      methodDistribution: buildCountMap(services.map((service) => service.method || 'tcp'), {
        tcp: 'TCP',
        http: 'HTTP/HTTPS',
        official: 'API oficial'
      }),
      sourceDistribution: buildCountMap(services.map((service) => service.sourceType || 'public_endpoint'), {
        official_api: 'API oficial',
        official_page: 'Página oficial',
        public_endpoint: 'Endpoint público'
      }),
      portDistribution: buildCountMap(
        services
          .filter((service) => service.port)
          .map((service) => String(service.port))
      ),
      resolvedAddressDistribution: buildCountMap(services.map(getAddressKind), {
        ipv4: 'IPv4',
        ipv6: 'IPv6',
        unresolved: 'Não resolvido'
      }),
      latencyRanking: toLatencyItems(services, 'desc', 8)
    },
    highlights: {
      unstableOrOfflineServices: services
        .filter((service) => service.status === 'offline' || service.status === 'unstable')
        .slice(0, 10)
        .map((service) => ({
          id: service.id,
          name: service.name,
          status: service.status === 'unknown' ? 'offline' : service.status,
          latency: service.latency,
          category: service.category || 'infrastructure',
          target: service.target || '--'
        })),
      fastestServices: toLatencyItems(services, 'asc', 5)
    }
  };
};
