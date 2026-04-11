import { memo } from 'react';
import { Bell, BellOff, Server, TimerReset, Trash2 } from 'lucide-react';
import { ServiceTrendChart } from './ServiceTrendChart';
import type { ServiceHistoryPoint, ServiceStatus } from './types';
import { getCategoryLabel, getMethodLabel, getSignalInfo, getStatusInfo } from './utils';

interface ServiceCardProps {
  service: ServiceStatus;
  history: ServiceHistoryPoint[];
  onClick: (service: ServiceStatus) => void;
  isWatched: boolean;
  onToggleWatch: (serviceId: string) => void;
  onDeleteCustom?: (serviceId: string) => void;
}

const getHistorySignature = (history: ServiceHistoryPoint[]) => {
  const last = history[history.length - 1];
  if (!last) {
    return 'empty';
  }

  return `${history.length}:${last.timestamp}:${last.status}:${last.latency ?? 'null'}`;
};

const ServiceCardComponent = ({ service, history, onClick, isWatched, onToggleWatch, onDeleteCustom }: ServiceCardProps) => {
  const config = getStatusInfo(service.status);
  const signalInfo = getSignalInfo(service.signal, service.sourceType);
  const Icon = config.icon;

  return (
    <div
      onClick={() => onClick(service)}
      className="relative cursor-pointer rounded-2xl border border-emerald-100 bg-white p-6 transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-[0_22px_42px_rgba(16,185,129,0.10)]"
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-slate-900">{service.name}</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <span className="flex items-center text-[10px] uppercase tracking-widest text-slate-500">
              <Server className="mr-1 h-3 w-3" />
              {service.id}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500">{getCategoryLabel(service.category)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onToggleWatch(service.id);
            }}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
              isWatched
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-emerald-100 bg-white text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
            title={isWatched ? 'Desativar alerta' : 'Ativar alerta'}
          >
            {isWatched ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
          </button>
          {service.isCustom && onDeleteCustom ? (
            <button
              onClick={(event) => {
                event.stopPropagation();
                onDeleteCustom(service.id);
              }}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-100 bg-white text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
              title="Excluir monitor personalizado"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
          <div className={`rounded-xl p-2 ${config.bg}`}>
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className={`rounded-full px-2 py-1 text-[11px] ${signalInfo.badgeClass}`}>{signalInfo.shortLabel}</span>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] text-slate-700">
          {getMethodLabel(service.method, service.port)}
        </span>
        {service.isCustom && service.customIntervalMinutes ? (
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-2 py-1 text-[11px] text-slate-700">
            <TimerReset className="mr-1 h-3 w-3 text-emerald-600" />A cada {service.customIntervalMinutes} min
          </span>
        ) : null}
        {isWatched ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-700">Alerta ativo</span>
        ) : null}
      </div>

      <div className="mb-4 space-y-2 text-sm">
        <p className="truncate text-slate-600" title={service.target || undefined}>
          Alvo: <span className="text-slate-800">{service.target || '--'}</span>
        </p>
        {service.resolvedTarget?.addresses?.length ? (
          <p className="truncate text-slate-600" title={service.resolvedTarget.addresses.join(', ')}>
            IP: <span className="text-slate-800">{service.resolvedTarget.addresses[0]}</span>
          </p>
        ) : (
          <p className="truncate text-slate-500">IP: --</p>
        )}
      </div>

      <div className="mb-4">
        <ServiceTrendChart history={history} status={service.status} />
      </div>

      <div className="flex items-end justify-between gap-4 border-t border-emerald-100 pt-4">
        <div>
          <div className="mb-1 flex items-center space-x-2">
            <Icon className={`h-4 w-4 ${config.color}`} />
            <p className="text-[10px] font-bold uppercase text-slate-500">Status</p>
          </div>
          <p className={`text-sm font-medium ${config.color}`}>{config.text}</p>
        </div>
        <div className="text-right">
          <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Latência</p>
          <p className="font-mono text-sm text-slate-800">{service.latency !== null ? `${service.latency}ms` : '--'}</p>
        </div>
      </div>
    </div>
  );
};

export const ServiceCard = memo(
  ServiceCardComponent,
  (prev, next) =>
    prev.isWatched === next.isWatched &&
    prev.service.id === next.service.id &&
    prev.service.status === next.service.status &&
    prev.service.latency === next.service.latency &&
    prev.service.target === next.service.target &&
    prev.service.customIntervalMinutes === next.service.customIntervalMinutes &&
    getHistorySignature(prev.history) === getHistorySignature(next.history)
);
