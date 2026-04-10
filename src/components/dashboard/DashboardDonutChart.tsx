import type { DashboardCount } from './types';

interface DashboardDonutChartProps {
  title: string;
  subtitle: string;
  data: DashboardCount[];
  colors?: string[];
}

const defaultColors = ['#16a34a', '#f59e0b', '#dc2626', '#0284c7', '#7c3aed', '#64748b'];

export const DashboardDonutChart = ({ title, subtitle, data, colors = defaultColors }: DashboardDonutChartProps) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 58;
  const stroke = 18;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  let cumulative = 0;

  return (
    <article className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm h-full">
      <div className="mb-5">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600 mt-1">{subtitle}</p>
      </div>

      {data.length === 0 || total === 0 ? (
        <div className="min-h-[260px] rounded-2xl bg-[#f7fff9] border border-emerald-100 flex items-center justify-center text-sm text-slate-500">
          Sem dados suficientes para montar este gráfico.
        </div>
      ) : (
        <div className="flex flex-col xl:flex-row gap-6 items-center">
          <div className="relative h-40 w-40 shrink-0">
            <svg viewBox="0 0 140 140" className="h-40 w-40 -rotate-90">
              <circle cx="70" cy="70" r={normalizedRadius} fill="transparent" stroke="#dcfce7" strokeWidth={stroke} />
              {data.map((item, index) => {
                const fraction = item.value / total;
                const dash = fraction * circumference;
                const gap = circumference - dash;
                const dashOffset = -cumulative * circumference;
                cumulative += fraction;

                return (
                  <circle
                    key={item.key}
                    cx="70"
                    cy="70"
                    r={normalizedRadius}
                    fill="transparent"
                    stroke={colors[index % colors.length]}
                    strokeWidth={stroke}
                    strokeDasharray={`${dash} ${gap}`}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-bold text-slate-900">{total}</span>
              <span className="text-xs uppercase tracking-[0.22em] text-slate-500">Itens</span>
            </div>
          </div>

          <div className="w-full space-y-3">
            {data.map((item, index) => {
              const percentage = Math.round((item.value / total) * 100);
              return (
                <div key={item.key} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: colors[index % colors.length] }} />
                    <span className="text-sm text-slate-700 truncate">{item.label}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-slate-900">{item.value}</p>
                    <p className="text-xs text-slate-500">{percentage}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </article>
  );
};
