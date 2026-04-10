import { AlertTriangle, CheckCircle2, ServerCrash } from 'lucide-react';
import type { DashboardOverview } from './types';

interface DashboardHighlightsProps {
  overview: DashboardOverview;
}

const statusConfig = {
  online: {
    label: 'Online',
    className: 'text-emerald-700 bg-emerald-50 border-emerald-200'
  },
  unstable: {
    label: 'Instável',
    className: 'text-amber-700 bg-amber-50 border-amber-200'
  },
  offline: {
    label: 'Offline',
    className: 'text-red-700 bg-red-50 border-red-200'
  }
};

export const DashboardHighlights = ({ overview }: DashboardHighlightsProps) => {
  return (
    <div className="grid grid-cols-1 2xl:grid-cols-2 gap-6">
      <article className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm h-full">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
            <ServerCrash className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Pontos de atenção</h3>
            <p className="text-sm text-slate-600">Itens instáveis ou offline no monitoramento atual.</p>
          </div>
        </div>

        <div className="space-y-3">
          {overview.highlights.unstableOrOfflineServices.length === 0 ? (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-800">
              Nenhum serviço em alerta agora.
            </div>
          ) : (
            overview.highlights.unstableOrOfflineServices.map((service) => (
              <div key={service.id} className="rounded-xl border border-emerald-100 bg-[#f7fff9] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{service.name}</p>
                    <p className="text-sm text-slate-600 truncate">{service.target}</p>
                  </div>
                  <span className={`text-[11px] px-2 py-1 rounded-full border shrink-0 ${statusConfig[service.status].className}`}>
                    {statusConfig[service.status].label}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </article>

      <article className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm h-full">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Mais rápidos agora</h3>
            <p className="text-sm text-slate-600">Serviços com menor latência na coleta atual.</p>
          </div>
        </div>

        <div className="space-y-3">
          {overview.highlights.fastestServices.length === 0 ? (
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-amber-800 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Sem latências disponíveis nesta coleta.
            </div>
          ) : (
            overview.highlights.fastestServices.map((service) => (
              <div key={service.id} className="rounded-xl border border-emerald-100 bg-[#f7fff9] p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">{service.name}</p>
                  <p className="text-sm text-slate-600 truncate">{service.category}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-emerald-700">{service.latency} ms</p>
                  <p className="text-xs text-slate-500 uppercase tracking-[0.18em]">Latência</p>
                </div>
              </div>
            ))
          )}
        </div>
      </article>
    </div>
  );
};
