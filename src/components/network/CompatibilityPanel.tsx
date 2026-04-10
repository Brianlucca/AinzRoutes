import { Globe, Network, ShieldCheck } from 'lucide-react';

interface CompatibilityPanelProps {
  score: number;
  compatibilityMessage: string;
  ipv4Address: string | null;
  ipv6Address: string | null;
  dualStackVersion: 4 | 6 | null;
}

const SummaryChip = ({
  title,
  value,
  icon: Icon
}: {
  title: string;
  value: string;
  icon: typeof Network;
}) => (
  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-emerald-600" />
      <p className="text-sm font-semibold text-slate-900">{title}</p>
    </div>
    <p className="mt-3 break-all font-mono text-sm text-slate-700">{value}</p>
  </div>
);

export const CompatibilityPanel = ({
  score,
  compatibilityMessage,
  ipv4Address,
  ipv6Address,
  dualStackVersion
}: CompatibilityPanelProps) => (
  <article className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
    <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Compatibilidade</p>
        <h3 className="mt-3 text-2xl font-bold text-slate-900">Sua nota de compatibilidade</h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{compatibilityMessage}</p>
      </div>

      <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center self-start rounded-full border-[10px] border-emerald-200 bg-emerald-50 text-3xl font-bold text-emerald-700">
        {score}
      </div>
    </div>

    <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <SummaryChip title="Endereço IPv4" value={ipv4Address || 'Não identificado'} icon={Network} />
      <SummaryChip title="Endereço IPv6" value={ipv6Address || 'Não identificado'} icon={Globe} />
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <p className="text-sm font-semibold text-slate-900">Preferência dual stack</p>
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-800">
          {dualStackVersion ? `Rota IPv${dualStackVersion}` : 'Não identificado'}
        </p>
      </div>
    </div>
  </article>
);
