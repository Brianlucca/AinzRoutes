import type { MonitorSignal, ServiceHistoryPoint, ServiceStatus } from './types';
import { groupDescriptionBySignal, groupTitleBySignal } from './utils';
import { ServiceCard } from './ServiceCard';

interface ServiceGroupSectionProps {
  signal: MonitorSignal;
  services: ServiceStatus[];
  historyByService: Record<string, ServiceHistoryPoint[]>;
  onServiceClick: (service: ServiceStatus) => void;
  watchedServiceIds: string[];
  onToggleWatch: (serviceId: string) => void;
}

export const ServiceGroupSection = ({
  signal,
  services,
  historyByService,
  onServiceClick,
  watchedServiceIds,
  onToggleWatch
}: ServiceGroupSectionProps) => {
  if (services.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{groupTitleBySignal(signal)}</h3>
          <p className="text-sm text-slate-600 mt-1 max-w-3xl">{groupDescriptionBySignal(signal)}</p>
        </div>
        <div className="text-xs text-slate-500 uppercase tracking-widest">{services.length} itens</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            history={historyByService[service.id] || []}
            onClick={onServiceClick}
            isWatched={watchedServiceIds.includes(service.id)}
            onToggleWatch={onToggleWatch}
          />
        ))}
      </div>
    </section>
  );
};
