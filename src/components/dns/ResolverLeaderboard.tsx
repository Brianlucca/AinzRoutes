import { ArrowUpRight, ShieldCheck, TimerReset } from 'lucide-react';

interface ResolverItem {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  latency: string;
  latencyNote?: string;
  consistency: string;
  privacy: string;
  profile: string;
  badge: string;
}

interface ResolverLeaderboardProps {
  resolvers: ResolverItem[];
}

export const ResolverLeaderboard = ({ resolvers }: ResolverLeaderboardProps) => {
  return (
    <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Ranking dos DNS testados</h2>
          <p className="mt-1 text-sm text-slate-600">Lista ordenada pelo menor tempo médio de resposta nesta rodada.</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          Teste atual
        </span>
      </div>

      <div className="space-y-4">
        {resolvers.map((resolver, index) => (
          <article
            key={resolver.id}
            className="rounded-2xl border border-emerald-100 bg-[linear-gradient(135deg,#ffffff_0%,#f8fffb_100%)] p-5"
          >
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] xl:items-start">
              <div className="grid min-w-0 grid-cols-[64px_minmax(0,1fr)] gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-lg font-bold text-emerald-700">
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold leading-tight text-slate-900">{resolver.name}</h3>
                    <span className="rounded-full border border-emerald-200 bg-white px-2 py-1 text-[11px] font-medium text-emerald-700">
                      {resolver.badge}
                    </span>
                  </div>

                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">{resolver.profile}</p>

                  <div className="mt-4 space-y-2 text-xs text-slate-500">
                    <p>DNS principal: {resolver.primary}</p>
                    <p>DNS secundário: {resolver.secondary}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div className="flex min-h-[112px] flex-col rounded-xl border border-emerald-100 bg-white px-4 py-3">
                  <div className="flex items-center text-xs uppercase tracking-[0.18em] text-slate-500">
                    <TimerReset className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                    Tempo médio
                  </div>
                  <div className="mt-3 flex min-h-[52px] flex-col justify-center">
                    <p className={`text-xl font-semibold leading-tight ${resolver.latencyNote ? 'text-slate-700' : 'text-slate-900'}`}>
                      {resolver.latency}
                    </p>
                    {resolver.latencyNote ? <p className="mt-1 text-xs text-slate-500">{resolver.latencyNote}</p> : null}
                  </div>
                </div>

                <div className="flex min-h-[112px] flex-col rounded-xl border border-emerald-100 bg-white px-4 py-3">
                  <div className="flex items-center text-xs uppercase tracking-[0.18em] text-slate-500">
                    <ArrowUpRight className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                    Sucesso
                  </div>
                  <div className="mt-3 flex min-h-[52px] items-center">
                    <p className="text-xl font-semibold text-slate-900">{resolver.consistency}</p>
                  </div>
                </div>

                <div className="flex min-h-[112px] flex-col rounded-xl border border-emerald-100 bg-white px-4 py-3">
                  <div className="flex items-center text-xs uppercase tracking-[0.18em] text-slate-500">
                    <ShieldCheck className="mr-2 h-3.5 w-3.5 text-emerald-600" />
                    Privacidade
                  </div>
                  <div className="mt-3 flex min-h-[52px] items-center">
                    <p className="text-xl font-semibold text-slate-900">{resolver.privacy}</p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
