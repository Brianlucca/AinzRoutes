import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { DnsHero } from '../components/dns/DnsHero';
import { DnsMetricStrip } from '../components/dns/DnsMetricStrip';
import { DnsRecommendationCard } from '../components/dns/DnsRecommendationCard';
import { ResolverLeaderboard } from '../components/dns/ResolverLeaderboard';
import { dnsProfiles } from '../components/dns/data';
import { api } from '../services/api';

interface DnsOptimizerPayload {
  measuredFrom: 'server';
  benchmarkTargets: string[];
  generatedAt: string;
  notes: string;
  resolvers: Array<{
    id: string;
    name: string;
    primary: string;
    secondary: string;
    profile: string;
    privacy: 'high' | 'medium';
    benchmark: {
      averageLatency: number | null;
      successRate: number;
      samples: number;
      failures: string[];
    };
  }>;
  recommendations: {
    bestLatency: {
      id: string;
      name: string;
      averageLatency: number | null;
      rationale: string;
    } | null;
    bestSecurity: {
      id: string;
      name: string;
      rationale: string;
    } | null;
  };
}

const privacyLabelMap: Record<'high' | 'medium', string> = {
  high: 'Alta',
  medium: 'Média',
};

export const DnsOptimizerView = () => {
  const [payload, setPayload] = useState<DnsOptimizerPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOptimizer = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await api.getDnsOptimizer();
      setPayload(data);
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar o benchmark de DNS');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOptimizer();
  }, []);

  const metrics = useMemo(() => {
    if (!payload) {
      return [
        { label: 'Resolvers avaliados', value: '--', helper: 'Aguardando benchmark real do backend.' },
        { label: 'Melhor média', value: '--', helper: 'Aguardando resposta da API.' },
        { label: 'Alvos testados', value: '--', helper: 'Sem amostra carregada ainda.' },
      ];
    }

    const bestLatency = payload.recommendations.bestLatency?.averageLatency;
    const healthyResolvers = payload.resolvers.filter((resolver) => resolver.benchmark.successRate >= 100).length;

    return [
      { label: 'Resolvers avaliados', value: String(payload.resolvers.length), helper: `${healthyResolvers} com 100% de sucesso nesta rodada.` },
      { label: 'Melhor média', value: bestLatency !== null && bestLatency !== undefined ? `${bestLatency} ms` : '--', helper: 'Menor tempo médio observado a partir do servidor da API.' },
      { label: 'Alvos testados', value: String(payload.benchmarkTargets.length), helper: payload.benchmarkTargets.join(', ') },
    ];
  }, [payload]);

  const resolvers = useMemo(() => {
    if (!payload) {
      return [];
    }

    return payload.resolvers
      .slice()
      .sort((a, b) => (a.benchmark.averageLatency ?? Number.MAX_SAFE_INTEGER) - (b.benchmark.averageLatency ?? Number.MAX_SAFE_INTEGER))
      .map((resolver, index) => ({
        id: resolver.id,
        name: resolver.name,
        primary: resolver.primary,
        secondary: resolver.secondary,
        latency: resolver.benchmark.averageLatency !== null ? `${resolver.benchmark.averageLatency} ms` : 'Sem resposta',
        consistency: `${resolver.benchmark.successRate}%`,
        privacy: privacyLabelMap[resolver.privacy],
        profile: resolver.profile,
        badge:
          payload.recommendations.bestLatency?.id === resolver.id
            ? 'Melhor média'
            : index === 1
              ? 'Boa opção'
              : 'Avaliado',
      }));
  }, [payload]);

  return (
    <div className="space-y-8">
      <DnsHero
        eyebrow="DNS Optimizer"
        title="Escolha estratégica de DNS com benchmark real do backend"
        description="Esta área agora consome a API para comparar resolvers públicos por tempo médio de resolução, taxa de sucesso e leitura consultiva. A medição atual acontece do servidor da API até os resolvers testados."
        accent="bg-emerald-100/70"
      />

      <div className="flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-slate-700">{payload?.notes || 'Carregando benchmark ativo de DNS...'}</p>
          {payload ? (
            <p className="mt-1 text-xs text-slate-500">
              Atualizado em{' '}
              {new Date(payload.generatedAt).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          ) : null}
        </div>
        <button
          onClick={loadOptimizer}
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-white transition-colors hover:bg-emerald-500 disabled:bg-emerald-200"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Atualizando...' : 'Atualizar benchmark'}
        </button>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}

      <DnsMetricStrip metrics={metrics} />

      {isLoading && !payload ? (
        <div className="flex justify-center rounded-3xl border border-emerald-100 bg-white p-12 shadow-sm">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : null}

      {payload ? <ResolverLeaderboard resolvers={resolvers} /> : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Leitura consultiva</h2>
          <p className="mt-1 text-sm text-slate-600">Combinação entre benchmark real do backend e orientação pensada para produto técnico.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <DnsRecommendationCard
            title="Melhor latência observada"
            summary="Resumo direto do resolver com menor média na rodada atual."
            recommendation={
              payload?.recommendations.bestLatency
                ? `${payload.recommendations.bestLatency.name} com média de ${payload.recommendations.bestLatency.averageLatency ?? '--'} ms.`
                : 'Nenhum resolver respondeu bem o suficiente nesta rodada.'
            }
            notes={payload?.recommendations.bestLatency?.rationale || 'Tente rodar uma nova coleta para comparar outra amostra.'}
          />
          <DnsRecommendationCard
            title="Melhor perfil de segurança"
            summary="Sugerido para cenários em que filtragem e postura defensiva importam mais do que a menor latência absoluta."
            recommendation={payload?.recommendations.bestSecurity ? payload.recommendations.bestSecurity.name : 'Sem recomendação de segurança disponível no momento.'}
            notes={payload?.recommendations.bestSecurity?.rationale || 'O backend pode enriquecer esse bloco depois com mais critérios de risco e bloqueio.'}
          />
          <DnsRecommendationCard
            title={dnsProfiles[0].title}
            summary={dnsProfiles[0].summary}
            recommendation={dnsProfiles[0].recommendation}
            notes={dnsProfiles[0].notes}
          />
        </div>
      </section>
    </div>
  );
};
