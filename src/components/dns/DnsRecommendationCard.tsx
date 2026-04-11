import { CheckCircle2 } from 'lucide-react';

interface DnsRecommendationCardProps {
  title: string;
  summary: string;
  recommendation: string;
  notes: string;
}

export const DnsRecommendationCard = ({ title, summary, recommendation, notes }: DnsRecommendationCardProps) => {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">{title}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-600">{summary}</p>
      <div className="mt-4 rounded-xl border border-emerald-100 bg-[#f7fff9] p-4">
        <div className="flex items-center text-sm font-semibold text-slate-900">
          <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-600" />
          Leitura da rodada
        </div>
        <p className="mt-2 text-sm text-slate-700">{recommendation}</p>
        <p className="mt-2 text-xs text-slate-500">{notes}</p>
      </div>
    </div>
  );
};
