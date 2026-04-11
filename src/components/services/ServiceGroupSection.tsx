import { ServiceCard } from './ServiceCard';
import type { MonitorSignal, ServiceHistoryPoint, ServiceStatus } from './types';
import { groupDescriptionBySignal, groupTitleBySignal } from './utils';

interface ServiceGroupSectionProps {
  signal: MonitorSignal;
  services: ServiceStatus[];
  historyByService: Record<string, ServiceHistoryPoint[]>;
  onServiceClick: (service: ServiceStatus) => void;
  watchedServiceIds: string[];
  onToggleWatch: (serviceId: string) => void;
  onDeleteCustom?: (serviceId: string) => void;
}

export const ServiceGroupSection = ({
  signal,
  services,
  historyByService,
  onServiceClick,
  watchedServiceIds,
  onToggleWatch,
  onDeleteCustom,
}: ServiceGroupSectionProps) => {
  if (services.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{groupTitleBySignal(signal)}</h3>
          <p className="mt-1 max-w-3xl text-sm text-slate-600">{groupDescriptionBySignal(signal)}</p>
        </div>
        <div className="text-xs uppercase tracking-widest text-slate-500">{services.length} itens</div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            history={historyByService[service.id] || []}
            onClick={onServiceClick}
            isWatched={watchedServiceIds.includes(service.id)}
            onToggleWatch={onToggleWatch}
            onDeleteCustom={onDeleteCustom}
          />
        ))}
      </div>
    </section>
  );
};
