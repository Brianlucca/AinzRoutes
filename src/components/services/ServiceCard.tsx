import { Bell, BellOff, Server } from 'lucide-react';
import type { ServiceHistoryPoint, ServiceStatus } from './types';
import { ServiceTrendChart } from './ServiceTrendChart';
import { getCategoryLabel, getMethodLabel, getSignalInfo, getStatusInfo } from './utils';

interface ServiceCardProps {
  service: ServiceStatus;
  history: ServiceHistoryPoint[];
  onClick: (service: ServiceStatus) => void;
  isWatched: boolean;
  onToggleWatch: (serviceId: string) => void;
}

export const ServiceCard = ({ service, history, onClick, isWatched, onToggleWatch }: ServiceCardProps) => {
  const config = getStatusInfo(service.status);
  const signalInfo = getSignalInfo(service.signal, service.sourceType);
  const Icon = config.icon;

  return (
    <div
      onClick={() => onClick(service)}
      className="relative bg-white border rounded-2xl p-6 cursor-pointer transform transition-all hover:-translate-y-1 hover:shadow-[0_22px_42px_rgba(16,185,129,0.10)] border-emerald-100 hover:border-emerald-300"
    >
      <div className="flex justify-between items-start gap-3 mb-6">
        <div className="min-w-0">
          <h3 className="text-lg font-semibold truncate text-slate-900">{service.name}</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-[10px] uppercase tracking-widest text-slate-500 flex items-center">
              <Server className="w-3 h-3 mr-1" />
              {service.id}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-slate-500">{getCategoryLabel(service.category)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onToggleWatch(service.id);
            }}
            className={`h-10 w-10 rounded-xl border flex items-center justify-center transition-colors ${
              isWatched
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-white border-emerald-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
            }`}
            title={isWatched ? 'Desativar alerta' : 'Ativar alerta'}
          >
            {isWatched ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          <div className={`p-2 rounded-xl ${config.bg}`}>
            <Icon className={`w-5 h-5 ${config.color}`} />
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className={`text-[11px] px-2 py-1 rounded-full ${signalInfo.badgeClass}`}>{signalInfo.shortLabel}</span>
        <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-slate-700 border border-emerald-200">
          {getMethodLabel(service.method, service.port)}
        </span>
        {isWatched ? (
          <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            Alerta ativo
          </span>
        ) : null}
      </div>

      <div className="space-y-2 text-sm mb-4">
        <p className="text-slate-600 truncate" title={service.target || undefined}>
          Alvo: <span className="text-slate-800">{service.target || '--'}</span>
        </p>
        {service.resolvedTarget?.addresses?.length ? (
          <p className="text-slate-600 truncate" title={service.resolvedTarget.addresses.join(', ')}>
            IP: <span className="text-slate-800">{service.resolvedTarget.addresses[0]}</span>
          </p>
        ) : (
          <p className="text-slate-500 truncate">IP: --</p>
        )}
      </div>

      <div className="mb-4">
        <ServiceTrendChart history={history} status={service.status} />
      </div>

      <div className="flex justify-between items-end border-t border-emerald-100 pt-4 gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Icon className={`w-4 h-4 ${config.color}`} />
            <p className="text-[10px] text-slate-500 uppercase font-bold">Status</p>
          </div>
          <p className={`text-sm font-medium ${config.color}`}>{config.text}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Latência</p>
          <p className="font-mono text-sm text-slate-800">{service.latency !== null ? `${service.latency}ms` : '--'}</p>
        </div>
      </div>
    </div>
  );
};
