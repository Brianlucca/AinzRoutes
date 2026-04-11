import { useEffect, useMemo, useRef, useState } from 'react';
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
import { TurnstileModal } from '../components/security/TurnstileModal';
import type { ModalData, MonitorSignal, MonitorStatus, ServiceHistoryPoint, ServiceStatus } from '../components/services/types';
import { getAnalyzeTarget } from '../components/services/utils';
import { api } from '../services/api';

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const SERVICE_HISTORY_KEY = 'ainzroutes_service_history';
const SERVICE_ALERTS_KEY = 'ainzroutes_service_alerts';
const CUSTOM_MONITORS_KEY = 'ainzroutes_custom_monitors';
const RECENT_SEARCHES_KEY = 'ainzroutes_recent_searches';
const HISTORY_WINDOW_MS = 24 * 60 * 60 * 1000;

interface CustomMonitorConfig {
  id: string;
  target: string;
  type: 'http' | 'tcp';
  port?: string;
  intervalMinutes: number;
  lastCheckedAt?: number;
}

const statusMessageMap: Record<Exclude<MonitorStatus, 'unknown'>, string> = {
  online: 'voltou ao normal',
  unstable: 'ficou instável',
  offline: 'ficou offline',
};

const readStorage = <T,>(key: string, fallback: T): T => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
};

export const ServicesStatusView = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [historyByService, setHistoryByService] = useState<Record<string, ServiceHistoryPoint[]>>(() => readStorage(SERVICE_HISTORY_KEY, {}));
  const [recentSearches, setRecentSearches] = useState<string[]>(() => readStorage(RECENT_SEARCHES_KEY, []));
  const [watchedServiceIds, setWatchedServiceIds] = useState<string[]>(() => readStorage(SERVICE_ALERTS_KEY, []));
  const [customMonitors, setCustomMonitors] = useState<CustomMonitorConfig[]>(() => readStorage(CUSTOM_MONITORS_KEY, []));
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customTarget, setCustomTarget] = useState('');
  const [customType, setCustomType] = useState<'http' | 'tcp'>('http');
  const [customPort, setCustomPort] = useState('');
  const [customIntervalMinutes, setCustomIntervalMinutes] = useState('5');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [turnstileOpen, setTurnstileOpen] = useState(false);
  const [pendingCustomTarget, setPendingCustomTarget] = useState<string | null>(null);

  const hasLoadedInitialStatus = useRef(false);
  const previousStatusMapRef = useRef<Record<string, MonitorStatus>>({});
  const servicesRef = useRef<ServiceStatus[]>([]);
  const customMonitorsRef = useRef<CustomMonitorConfig[]>(customMonitors);

  useEffect(() => {
    servicesRef.current = services;
  }, [services]);

  useEffect(() => {
    customMonitorsRef.current = customMonitors;
  }, [customMonitors]);

  const customMonitorSignature = useMemo(
    () =>
      customMonitors
        .map((monitor) => `${monitor.id}:${monitor.target}:${monitor.type}:${monitor.port ?? ''}:${monitor.intervalMinutes}`)
        .join('|'),
    [customMonitors]
  );

  const persistHistory = (next: Record<string, ServiceHistoryPoint[]>) => {
    localStorage.setItem(SERVICE_HISTORY_KEY, JSON.stringify(next));
    return next;
  };

  const persistAlerts = (next: string[]) => {
    localStorage.setItem(SERVICE_ALERTS_KEY, JSON.stringify(next));
    return next;
  };

  const persistCustomMonitors = (next: CustomMonitorConfig[]) => {
    localStorage.setItem(CUSTOM_MONITORS_KEY, JSON.stringify(next));
    return next;
  };

  const persistRecentSearches = (next: string[]) => {
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    return next;
  };

  const triggerServiceNotification = (service: ServiceStatus, previousStatus: MonitorStatus) => {
    if (notificationPermission !== 'granted' || service.status === 'unknown' || previousStatus === service.status) {
      return;
    }

    const body =
      service.status === 'online'
        ? `${service.name} voltou ao normal. Última latência: ${service.latency !== null ? `${service.latency}ms` : 'indisponível'}.`
        : `${service.name} ${statusMessageMap[service.status]}. Acompanhe o monitoramento para validar a recuperação.`;

    new Notification('AinzRoutes Monitoramento', {
      body,
      tag: `service-${service.id}`,
      silent: false,
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
          latency: service.latency,
        };

        const current = nextHistory[service.id] || [];
        const last = current[current.length - 1];
        const shouldAppend = !last || last.status !== point.status || last.latency !== point.latency || now - last.timestamp > 45_000;
        const updated = shouldAppend ? [...current, point] : current;
        nextHistory[service.id] = updated.filter((item) => now - item.timestamp <= HISTORY_WINDOW_MS);
      });

      return persistHistory(nextHistory);
    });
  };

  const updateCustomMonitorCheckpoints = (checkedAtById: Record<string, number>) => {
    if (Object.keys(checkedAtById).length === 0) {
      return;
    }

    setCustomMonitors((prev) => {
      const next = prev.map((monitor) =>
        checkedAtById[monitor.id] ? { ...monitor, lastCheckedAt: checkedAtById[monitor.id] } : monitor
      );
      return persistCustomMonitors(next);
    });
  };

  const removeCustomMonitor = (serviceId: string) => {
    setCustomMonitors((prev) => persistCustomMonitors(prev.filter((monitor) => monitor.id !== serviceId)));
    setServices((prev) => prev.filter((service) => service.id !== serviceId));
    setHistoryByService((prev) => {
      const next = { ...prev };
      delete next[serviceId];
      return persistHistory(next);
    });
    setWatchedServiceIds((prev) => persistAlerts(prev.filter((id) => id !== serviceId)));
    setModalData((prev) => (prev?.id === serviceId ? null : prev));
  };

  const fetchStatus = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const now = Date.now();
      const currentCustomMonitors = customMonitorsRef.current;

      const [baseServices, customCheckResults] = await Promise.all([
        api.getServicesStatus(),
        Promise.all(
          currentCustomMonitors.map(async (monitor) => {
            const existing = servicesRef.current.find((service) => service.id === monitor.id);
            const intervalMs = Math.max(monitor.intervalMinutes, 1) * 60_000;
            const shouldCheck = !monitor.lastCheckedAt || now - monitor.lastCheckedAt >= intervalMs || !existing;

            if (!shouldCheck && existing) {
              return {
                service: {
                  ...existing,
                  isCustom: true,
                  customIntervalMinutes: monitor.intervalMinutes,
                  lastCheckedAt: monitor.lastCheckedAt,
                } satisfies ServiceStatus,
                checkedAt: null as number | null,
              };
            }

            const result = await api.refreshCustomService(monitor.target, monitor.type, monitor.port, monitor.id);
            return {
              service: {
                ...result,
                isCustom: true,
                customIntervalMinutes: monitor.intervalMinutes,
                lastCheckedAt: now,
              } satisfies ServiceStatus,
              checkedAt: now,
            };
          })
        ),
      ]);

      const checkedAtById = customCheckResults.reduce<Record<string, number>>((acc, item) => {
        if (item.checkedAt && item.service.id) {
          acc[item.service.id] = item.checkedAt;
        }
        return acc;
      }, {});

      const mergedServices: ServiceStatus[] = [...baseServices, ...customCheckResults.map((item) => item.service)];

      setServices(mergedServices);
      updateHistoryWindow(mergedServices);
      updateCustomMonitorCheckpoints(checkedAtById);

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
    const interval = setInterval(fetchStatus, 60_000);
    return () => clearInterval(interval);
  }, [customMonitorSignature, watchedServiceIds, notificationPermission]);

  const toggleServiceAlert = async (serviceId: string) => {
    let effectivePermission = notificationPermission;

    if (effectivePermission === 'default') {
      if (typeof window === 'undefined' || !('Notification' in window)) {
        setNotificationPermission('unsupported');
        setError('As notificações do navegador não estão disponíveis neste dispositivo.');
        return;
      }

      const shouldRequestPermission = window.confirm(
        'Para ativar esse alerta, o AinzRoutes precisa da permissão de notificações do navegador. Ela será usada apenas para avisar quando o serviço ficar instável, offline ou voltar ao normal. Deseja continuar?'
      );

      if (!shouldRequestPermission) {
        return;
      }

      effectivePermission = await Notification.requestPermission();
      setNotificationPermission(effectivePermission);
    }

    if (effectivePermission === 'denied' || effectivePermission === 'unsupported') {
      setError('As notificações do navegador não estão disponíveis ou foram bloqueadas.');
      return;
    }

    setWatchedServiceIds((prev) => {
      const next = prev.includes(serviceId) ? prev.filter((id) => id !== serviceId) : [...prev, serviceId];
      return persistAlerts(next);
    });
  };

  const enrichGeoForTarget = async (service: Pick<ServiceStatus, 'resolvedTarget' | 'target' | 'url'>, turnstileToken?: string) => {
    const targetToAnalyze = getAnalyzeTarget(service);
    if (!targetToAnalyze) return undefined;

    try {
      const ipInfo = await api.analyzeIp(targetToAnalyze, turnstileToken);
      if (ipInfo.status === 'success') {
        return {
          country: ipInfo.country,
          city: ipInfo.city,
          isp: ipInfo.isp,
          as: ipInfo.as,
          lat: ipInfo.lat,
          lon: ipInfo.lon,
        };
      }
    } catch (geoError) {
      console.error(geoError);
    }

    return undefined;
  };

  const performAddCustomService = async (turnstileToken: string) => {
    const targetToUse = pendingCustomTarget || customTarget;

    if (!targetToUse) return;

    setIsAddingCustom(true);
    setError(null);

    try {
      const parsedInterval = Number(customIntervalMinutes);
      const checkedAt = Date.now();
      const config: CustomMonitorConfig = {
        id: `custom_monitor_${Date.now()}`,
        target: targetToUse,
        type: customType,
        port: customPort || undefined,
        intervalMinutes: Math.min(parsedInterval, 1440),
        lastCheckedAt: checkedAt,
      };

      const result = await api.checkCustomService(config.target, config.type, config.port, config.id, turnstileToken);
      const nextService: ServiceStatus = {
        ...result,
        isCustom: true,
        customIntervalMinutes: config.intervalMinutes,
        lastCheckedAt: checkedAt,
      };
      const geo = await enrichGeoForTarget(nextService, turnstileToken);
      setModalData({ ...nextService, geo });

      setCustomMonitors((prev) => persistCustomMonitors([...prev, config]));

      if (!recentSearches.includes(targetToUse)) {
        const newSearches = [targetToUse, ...recentSearches].slice(0, 5);
        setRecentSearches(persistRecentSearches(newSearches));
      }

      setCustomTarget('');
      setCustomPort('');
      setCustomIntervalMinutes('5');
      setPendingCustomTarget(null);
      setTurnstileOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsAddingCustom(false);
    }
  };

  const handleAddCustomService = async (targetToUse = customTarget) => {
    if (!targetToUse) return;

    const parsedInterval = Number(customIntervalMinutes);
    if (!Number.isFinite(parsedInterval) || parsedInterval < 1) {
      setError('Informe um intervalo válido em minutos para o monitor personalizado.');
      return;
    }

    setError(null);
    setPendingCustomTarget(targetToUse);
    setTurnstileOpen(true);
  };

  const handleServiceClick = async (service: ServiceStatus) => {
    setModalData(service);
  };


  const offlineCount = services.filter((service) => service.status === 'offline').length;
  const offlinePercentage = services.length > 0 ? (offlineCount / services.length) * 100 : 0;
  const isMajorityOffline = offlinePercentage >= 80;

  const groupedServices: Record<MonitorSignal, ServiceStatus[]> = {
    official_service_status: [],
    page_reachability: [],
    endpoint_reachability: [],
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
            Monitoramento organizado por confiabilidade da fonte. A latência exibida é medida do servidor da API até o alvo monitorado          </p>
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
          <span className="font-semibold text-slate-900">{watchedServiceIds.length}</span> serviço(s) em alerta. Ao ativar um alerta em um serviço, o navegador pode pedir permissão para enviar notificações de instabilidade, queda e recuperação.
        </p>
      </div>

      <ServiceSummary services={services} />

      <ServiceCheckForm
        customTarget={customTarget}
        customType={customType}
        customPort={customPort}
        customIntervalMinutes={customIntervalMinutes}
        recentSearches={recentSearches}
        isAddingCustom={isAddingCustom}
        onCustomTargetChange={setCustomTarget}
        onCustomTypeChange={setCustomType}
        onCustomPortChange={setCustomPort}
        onCustomIntervalChange={setCustomIntervalMinutes}
        onUseRecent={setCustomTarget}
        onSubmit={() => handleAddCustomService(customTarget)}
      />

      {customServices.length > 0 ? (
        <section className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Monitores personalizados</h3>
              <p className="mt-1 max-w-3xl text-sm text-slate-600">
                Cada item define seu próprio intervalo de verificação e continua sendo armazenado localmente no navegador do usuário.
              </p>
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
                onDeleteCustom={removeCustomMonitor}
              />
            ))}
          </div>
        </section>
      ) : null}

      {isMajorityOffline ? (
        <div className="flex items-start space-x-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <ShieldAlert className="mt-1 h-6 w-6 flex-shrink-0 text-amber-500" />
          <p className="text-sm leading-relaxed text-amber-800">
            Se 80% ou mais dos itens retornarem offline, pode haver instabilidade no próprio ambiente de origem ou na rede entre o navegador e a API. Itens marcados como reachability não equivalem a um status oficial do serviço.
          </p>
        </div>
      ) : null}

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}

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
        onDeleteCustom={modalData?.isCustom ? () => removeCustomMonitor(modalData.id) : undefined}
        history={modalData ? historyByService[modalData.id] || [] : []}
      />

      <TurnstileModal
        open={turnstileOpen}
        action="service_monitor"
        title="Validar monitor personalizado"
        description="Conclua a verificação para criar ou atualizar um monitor personalizado no AinzRoutes."
        isSubmitting={isAddingCustom}
        onClose={() => {
          setTurnstileOpen(false);
          setPendingCustomTarget(null);
        }}
        onConfirm={performAddCustomService}
      />

    </div>
  );
};
