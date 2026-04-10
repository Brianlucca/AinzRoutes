import { useEffect, useRef, useState } from 'react';
import { ActivitySquare, RefreshCw, ShieldAlert } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { ServiceCard } from '../components/services/ServiceCard';
import { ServiceCheckForm } from '../components/services/ServiceCheckForm';
import { ServiceDetailsModal } from '../components/services/ServiceDetailsModal';
import { ServiceGroupSection } from '../components/services/ServiceGroupSection';
import { ServiceSummary } from '../components/services/ServiceSummary';
import type { ModalData, MonitorSignal, MonitorStatus, ServiceHistoryPoint, ServiceStatus } from '../components/services/types';
import { getAnalyzeTarget } from '../components/services/utils';
import { api } from '../services/api';

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const SERVICE_HISTORY_KEY = 'ainzroutes_service_history';
const SERVICE_ALERTS_KEY = 'ainzroutes_service_alerts';
const CUSTOM_MONITORS_KEY = 'ainzroutes_custom_monitors';
const HISTORY_WINDOW_MS = 24 * 60 * 60 * 1000;

interface CustomMonitorConfig {
  id: string;
  target: string;
  type: 'http' | 'tcp';
  port?: string;
}

const statusMessageMap: Record<Exclude<MonitorStatus, 'unknown'>, string> = {
  online: 'voltou ao normal',
  unstable: 'ficou instável',
  offline: 'ficou offline'
};

export const ServicesStatusView = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [historyByService, setHistoryByService] = useState<Record<string, ServiceHistoryPoint[]>>(() => {
    const saved = localStorage.getItem(SERVICE_HISTORY_KEY);
    return saved ? JSON.parse(saved) : {};
  });
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    const saved = localStorage.getItem('ainzroutes_recent_searches');
    return saved ? JSON.parse(saved) : [];
  });
  const [watchedServiceIds, setWatchedServiceIds] = useState<string[]>(() => {
    const saved = localStorage.getItem(SERVICE_ALERTS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [customMonitors, setCustomMonitors] = useState<CustomMonitorConfig[]>(() => {
    const saved = localStorage.getItem(CUSTOM_MONITORS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customTarget, setCustomTarget] = useState('');
  const [customType, setCustomType] = useState<'http' | 'tcp'>('http');
  const [customPort, setCustomPort] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const hasLoadedInitialStatus = useRef(false);
  const previousStatusMapRef = useRef<Record<string, MonitorStatus>>({});

  const triggerServiceNotification = (service: ServiceStatus, previousStatus: MonitorStatus) => {
    if (notificationPermission !== 'granted' || service.status === 'unknown' || previousStatus === service.status) {
      return;
    }

    const body =
      service.status === 'online'
        ? `${service.name} voltou ao normal. Última latência: ${service.latency !== null ? `${service.latency}ms` : 'indisponível'}.`
        : `${service.name} ${statusMessageMap[service.status]}. Acompanhe o monitoramento para validar recuperação.`;

    new Notification('AinzRoutes Monitoramento', {
      body,
      tag: `service-${service.id}`,
      silent: false
    });
  };

  const updateHistoryWindow = (nextServices: ServiceStatus[]) => {
    setHistoryByService((prev) => {
      const nextHistory = { ...prev };
      const now = Date.now();

      nextServices.forEach((service) => {
        const point: ServiceHistoryPoint = {
          timestamp: now,
          status: service.status,
          latency: service.latency
        };

        const current = nextHistory[service.id] || [];
        const last = current[current.length - 1];
        const shouldAppend =
          !last ||
          last.status !== point.status ||
          last.latency !== point.latency ||
          now - last.timestamp > 45_000;

        const updated = shouldAppend ? [...current, point] : current;
        nextHistory[service.id] = updated.filter((item) => now - item.timestamp <= HISTORY_WINDOW_MS);
      });

      localStorage.setItem(SERVICE_HISTORY_KEY, JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  const fetchStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [baseServices, customResults] = await Promise.all([
        api.getServicesStatus(),
        Promise.all(
          customMonitors.map((monitor) =>
            api.checkCustomService(monitor.target, monitor.type, monitor.port, monitor.id)
          )
        )
      ]);

      const mergedServices: ServiceStatus[] = [
        ...baseServices,
        ...customResults.map((service: ServiceStatus) => ({ ...service, isCustom: true }))
      ];

      setServices(mergedServices);
      updateHistoryWindow(mergedServices);

      const nextStatusMap: Record<string, MonitorStatus> = {};
      mergedServices.forEach((service) => {
        nextStatusMap[service.id] = service.status;

        if (hasLoadedInitialStatus.current && watchedServiceIds.includes(service.id)) {
          const previousStatus = previousStatusMapRef.current[service.id];
          if (previousStatus && previousStatus !== service.status) {
            triggerServiceNotification(service, previousStatus);
          }
        }
      });

      previousStatusMapRef.current = nextStatusMap;
      hasLoadedInitialStatus.current = true;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60000);
    return () => clearInterval(interval);
  }, [customMonitors, watchedServiceIds, notificationPermission]);

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotificationPermission('unsupported');
      return 'unsupported' as const;
    }

    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    return permission;
  };

  const toggleServiceAlert = async (serviceId: string) => {
    let effectivePermission = notificationPermission;

    if (effectivePermission === 'default') {
      const shouldRequestPermission = window.confirm(
        'Para ativar esse alerta, o AinzRoutes precisa da permissão de notificações do navegador. Ela será usada apenas para avisar quando o serviço ficar instável, offline ou voltar ao normal. Deseja continuar?'
      );

      if (!shouldRequestPermission) {
        return;
      }

      effectivePermission = await requestNotificationPermission();
    }

    if (effectivePermission === 'denied' || effectivePermission === 'unsupported') {
      setError('As notificações do navegador não estão disponíveis ou foram bloqueadas.');
      return;
    }

    setWatchedServiceIds((prev) => {
      const next = prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId];
      localStorage.setItem(SERVICE_ALERTS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const enrichGeoForTarget = async (service: Pick<ServiceStatus, 'resolvedTarget' | 'target' | 'url'>) => {
    const targetToAnalyze = getAnalyzeTarget(service);
    if (!targetToAnalyze) return undefined;

    try {
      const ipInfo = await api.analyzeIp(targetToAnalyze);
      if (ipInfo.status === 'success') {
        return {
          country: ipInfo.country,
          city: ipInfo.city,
          isp: ipInfo.isp,
          as: ipInfo.as,
          lat: ipInfo.lat,
          lon: ipInfo.lon
        };
      }
    } catch (geoError) {
      console.error(geoError);
    }

    return undefined;
  };

  const handleAddCustomService = async (targetToUse = customTarget) => {
    if (!targetToUse) return;

    setIsAddingCustom(true);
    setError(null);

    try {
      const config: CustomMonitorConfig = {
        id: `custom_monitor_${Date.now()}`,
        target: targetToUse,
        type: customType,
        port: customPort || undefined
      };

      const result = await api.checkCustomService(config.target, config.type, config.port, config.id);
      const geo = await enrichGeoForTarget(result);
      setModalData({ ...result, isCustom: true, geo });

      setCustomMonitors((prev) => {
        const next = [...prev, config];
        localStorage.setItem(CUSTOM_MONITORS_KEY, JSON.stringify(next));
        return next;
      });

      if (!recentSearches.includes(targetToUse)) {
        const newSearches = [targetToUse, ...recentSearches].slice(0, 5);
        setRecentSearches(newSearches);
        localStorage.setItem('ainzroutes_recent_searches', JSON.stringify(newSearches));
      }

      setCustomTarget('');
      setCustomPort('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAddingCustom(false);
    }
  };

  const handleServiceClick = async (service: ServiceStatus) => {
    setModalData({ ...service, geoLoading: true });
    const geo = await enrichGeoForTarget(service);
    setModalData((prev) => (prev ? { ...prev, geoLoading: false, geo } : null));
  };

  const offlineCount = services.filter((service) => service.status === 'offline').length;
  const offlinePercentage = services.length > 0 ? (offlineCount / services.length) * 100 : 0;
  const isMajorityOffline = offlinePercentage >= 80;

  const groupedServices: Record<MonitorSignal, ServiceStatus[]> = {
    official_service_status: [],
    page_reachability: [],
    endpoint_reachability: []
  };

  const customServices = services.filter((service) => service.isCustom);
  const builtInServices = services.filter((service) => !service.isCustom);

  builtInServices.forEach((service) => {
    const signal = service.signal || 'endpoint_reachability';
    groupedServices[signal].push(service);
  });

  return (
    <div className="relative space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-col space-y-2">
          <h2 className="flex items-center text-2xl font-bold text-slate-900">
            <ActivitySquare className="mr-2 h-6 w-6 text-emerald-600" />
            Status Global de Serviços
          </h2>
          <p className="text-slate-600">
            Monitoramento organizado por confiabilidade da fonte. A latência exibida é medida do servidor da API até o alvo monitorado.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={fetchStatus}
            disabled={isLoading}
            className="flex items-center rounded-xl bg-emerald-600 px-4 py-2 text-white shadow-sm transition-colors hover:bg-emerald-500"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Atualizando...' : 'Atualizar agora'}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-700">
          <span className="font-semibold text-slate-900">{watchedServiceIds.length}</span> serviço(s) em alerta.
          {' '}Ao ativar um alerta em um serviço, o navegador pode pedir permissão para enviar notificações de instabilidade, queda e recuperação.
        </p>
      </div>

      <ServiceSummary services={services} />

      <ServiceCheckForm
        customTarget={customTarget}
        customType={customType}
        customPort={customPort}
        recentSearches={recentSearches}
        isAddingCustom={isAddingCustom}
        onCustomTargetChange={setCustomTarget}
        onCustomTypeChange={setCustomType}
        onCustomPortChange={setCustomPort}
        onUseRecent={setCustomTarget}
        onSubmit={() => handleAddCustomService(customTarget)}
      />

      {customServices.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Monitores personalizados</h3>
              <p className="mt-1 max-w-3xl text-sm text-slate-600">Os itens adicionados por você também entram na rotina de atualização automática do monitoramento.</p>
            </div>
            <div className="text-xs uppercase tracking-widest text-slate-500">{customServices.length} itens</div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {customServices.map((service) => (
              <ServiceCard
                key={service.id}
                service={service}
                history={historyByService[service.id] || []}
                onClick={handleServiceClick}
                isWatched={watchedServiceIds.includes(service.id)}
                onToggleWatch={toggleServiceAlert}
              />
            ))}
          </div>
        </section>
      ) : null}

      {isMajorityOffline && (
        <div className="flex items-start space-x-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <ShieldAlert className="mt-1 h-6 w-6 flex-shrink-0 text-amber-500" />
          <p className="text-sm leading-relaxed text-amber-800">
            Se 80% ou mais dos itens retornarem offline, pode haver instabilidade no próprio ambiente de origem ou na rede entre o navegador e a API. Itens marcados como reachability não equivalem a um status oficial do serviço.
          </p>
        </div>
      )}

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      <div>
        {isLoading && services.length === 0 ? (
          <div className="col-span-full flex justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="space-y-10">
            <ServiceGroupSection
              signal="official_service_status"
              services={groupedServices.official_service_status}
              historyByService={historyByService}
              onServiceClick={handleServiceClick}
              watchedServiceIds={watchedServiceIds}
              onToggleWatch={toggleServiceAlert}
            />
            <ServiceGroupSection
              signal="page_reachability"
              services={groupedServices.page_reachability}
              historyByService={historyByService}
              onServiceClick={handleServiceClick}
              watchedServiceIds={watchedServiceIds}
              onToggleWatch={toggleServiceAlert}
            />
            <ServiceGroupSection
              signal="endpoint_reachability"
              services={groupedServices.endpoint_reachability}
              historyByService={historyByService}
              onServiceClick={handleServiceClick}
              watchedServiceIds={watchedServiceIds}
              onToggleWatch={toggleServiceAlert}
            />
          </div>
        )}
      </div>

      <ServiceDetailsModal
        data={modalData}
        onClose={() => setModalData(null)}
        isWatched={modalData ? watchedServiceIds.includes(modalData.id) : false}
        onToggleWatch={modalData ? () => toggleServiceAlert(modalData.id) : undefined}
        history={modalData ? historyByService[modalData.id] || [] : []}
      />
    </div>
  );
};
