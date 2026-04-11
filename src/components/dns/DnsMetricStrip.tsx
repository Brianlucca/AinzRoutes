interface MetricItem {
  label: string;
  value: string;
  helper: string;
}

interface DnsMetricStripProps {
  metrics: MetricItem[];
}

export const DnsMetricStrip = ({ metrics }: DnsMetricStripProps) => {
  return (
    <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {metrics.map((metric) => (
        <div key={metric.label} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{metric.label}</p>
          <p className="mt-3 text-3xl font-bold text-slate-900">{metric.value}</p>
          <p className="mt-2 text-sm text-slate-600">{metric.helper}</p>
        </div>
      ))}
    </section>
  );
};
