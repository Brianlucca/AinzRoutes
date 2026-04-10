import { AlertTriangle, CheckCircle2, RadioTower, XCircle } from 'lucide-react';
import type { ServiceStatus } from './types';

interface ServiceSummaryProps {
  services: ServiceStatus[];
}

export const ServiceSummary = ({ services }: ServiceSummaryProps) => {
  const onlineCount = services.filter((service) => service.status === 'online').length;
  const unstableCount = services.filter((service) => service.status === 'unstable').length;
  const offlineCount = services.filter((service) => service.status === 'offline').length;
  const officialCount = services.filter((service) => service.signal === 'official_service_status').length;

  const summaryCards = [
    { label: 'Operacionais', value: onlineCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Instáveis', value: unstableCount, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Fora do ar', value: offlineCount, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
    { label: 'Com fonte oficial', value: officialCount, icon: RadioTower, color: 'text-sky-600', bg: 'bg-sky-50' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {summaryCards.map((item) => {
        const Icon = item.icon;

        return (
          <div key={item.label} className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-500">{item.label}</p>
                <p className="text-3xl font-bold text-slate-900 mt-2">{item.value}</p>
              </div>
              <div className={`p-2 rounded-xl border border-white ${item.bg}`}>
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
