import type { DashboardCount, DashboardLatencyRankingItem } from './types';

interface DashboardBarChartProps {
  title: string;
  subtitle: string;
  data: DashboardCount[] | DashboardLatencyRankingItem[];
  mode?: 'count' | 'latency';
}

const barColorByIndex = ['bg-emerald-500', 'bg-emerald-400', 'bg-sky-500', 'bg-amber-500', 'bg-red-500', 'bg-slate-400'];

export const DashboardBarChart = ({
  title,
  subtitle,
  data,
  mode = 'count'
}: DashboardBarChartProps) => {
  const normalized =
    mode === 'latency'
      ? (data as DashboardLatencyRankingItem[]).map((item) => ({
          key: item.id,
          label: item.name,
          value: item.latency,
          meta: item.status
        }))
      : (data as DashboardCount[]).map((item) => ({
          key: item.key,
          label: item.label,
          value: item.value,
          meta: null
        }));

  const max = Math.max(...normalized.map((item) => item.value), 1);

  return (
    <article className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm h-full">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
      </div>

      {normalized.length === 0 ? (
        <div className="min-h-[260px] rounded-2xl bg-[#f7fff9] border border-emerald-100 flex items-center justify-center text-sm text-slate-500">
          Sem dados suficientes para montar este gráfico.
        </div>
      ) : (
        <div className="space-y-4">
          {normalized.map((item, index) => (
            <div key={item.key} className="space-y-1.5">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{item.label}</p>
                  {item.meta ? <p className="text-xs text-slate-500 uppercase tracking-[0.18em]">{item.meta}</p> : null}
                </div>
                <span className="text-sm font-semibold text-slate-900 shrink-0">
                  {mode === 'latency' ? `${item.value} ms` : item.value}
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-emerald-50 overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColorByIndex[index % barColorByIndex.length]}`}
                  style={{ width: `${Math.max((item.value / max) * 100, 8)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
};
