import type { LucideIcon } from 'lucide-react';

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  tone?: 'green' | 'amber' | 'red' | 'sky';
}

const toneClassMap = {
  green: {
    iconWrap: 'bg-emerald-50 border-emerald-100',
    icon: 'text-emerald-600'
  },
  amber: {
    iconWrap: 'bg-amber-50 border-amber-100',
    icon: 'text-amber-500'
  },
  red: {
    iconWrap: 'bg-red-50 border-red-100',
    icon: 'text-red-600'
  },
  sky: {
    iconWrap: 'bg-sky-50 border-sky-100',
    icon: 'text-sky-600'
  }
};

export const DashboardMetricCard = ({
  title,
  value,
  description,
  icon: Icon,
  tone = 'green'
}: DashboardMetricCardProps) => {
  const palette = toneClassMap[tone];

  return (
    <article className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-3">{value}</p>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{description}</p>
        </div>
        <div className={`h-11 w-11 rounded-2xl border flex items-center justify-center ${palette.iconWrap}`}>
          <Icon className={`w-5 h-5 ${palette.icon}`} />
        </div>
      </div>
    </article>
  );
};
