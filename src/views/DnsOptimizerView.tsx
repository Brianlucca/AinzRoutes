import { useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { DnsHero } from '../components/dns/DnsHero';
import { DnsMetricStrip } from '../components/dns/DnsMetricStrip';
import { DnsRecommendationCard } from '../components/dns/DnsRecommendationCard';
import { ResolverLeaderboard } from '../components/dns/ResolverLeaderboard';
import { dnsProfiles } from '../components/dns/data';
import { api } from '../services/api';

interface DnsCatalogPayload {
  measuredFrom: 'browser';
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
    dohUrl: string;
    category: 'performance' | 'security' | 'family' | 'general';
  }>;
}

interface ResolverBenchmark {
  averageLatency: number | null;
  successRate: number;
  samples: number;
  failures: string[];
}

type ResolverCatalogEntry = DnsCatalogPayload['resolvers'][number];

type TestedResolver = ResolverCatalogEntry & {
  benchmark: ResolverBenchmark;
};

interface DnsOptimizerResult {
  measuredFrom: 'browser';
  benchmarkTargets: string[];
  generatedAt: string;
  notes: string;
  resolvers: TestedResolver[];
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

const DNS_QUERY_TIMEOUT_MS = 4000;

const toBase64Url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const buildDnsWireQuery = (hostname: string) => {
  const labels = hostname
    .trim()
    .split('.')
    .filter(Boolean);

  const qnameBytes = labels.flatMap((label) => [label.length, ...Array.from(label).map((char) => char.charCodeAt(0))]);
  const query = new Uint8Array([
    0x12, 0x34, 0x01, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ...qnameBytes,
    0x00, 0x00, 0x01, 0x00, 0x01,
  ]);

  return toBase64Url(query);
};

const runDohQuery = async (dohUrl: string, hostname: string) => {
  const queryParam = buildDnsWireQuery(hostname);
  const url = `${dohUrl}${dohUrl.includes('?') ? '&' : '?'}dns=${queryParam}`;
  const runDirectFetch = async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), DNS_QUERY_TIMEOUT_MS);
    const start = performance.now();

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          accept: 'application/dns-message',
        },
        cache: 'no-store',
        signal: controller.signal,
      });

      const buffer = await response.arrayBuffer();

      if (!response.ok || buffer.byteLength < 12) {
        throw new Error(`HTTP ${response.status || 0}`);
      }

      return Math.round(performance.now() - start);
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  const runOpaqueFetch = async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), DNS_QUERY_TIMEOUT_MS);
    const start = performance.now();

    try {
      await fetch(url, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store',
        signal: controller.signal,
      });

      return Math.round(performance.now() - start);
    } finally {
      window.clearTimeout(timeoutId);
    }
  };

  try {
    return await runDirectFetch();
  } catch {
    return runOpaqueFetch();
  }
};

const probeDnsFromBrowser = async (resolver: ResolverCatalogEntry, targets: string[]): Promise<TestedResolver> => {
  const measurements: number[] = [];
  const failures: string[] = [];

  for (const target of targets) {
    try {
      const latency = await runDohQuery(resolver.dohUrl, target);
      measurements.push(latency);
    } catch (error: any) {
      failures.push(`${target}: ${error?.message || 'Falha no teste'}`);
    }
  }

  return {
    ...resolver,
    benchmark: {
      averageLatency: measurements.length
        ? Math.round(measurements.reduce((total, current) => total + current, 0) / measurements.length)
        : null,
      successRate: Math.round((measurements.length / targets.length) * 100),
      samples: measurements.length,
      failures,
    },
  };
};

const pickRecommendations = (resolvers: TestedResolver[]) => {
  const byLatency = [...resolvers]
    .filter((resolver) => resolver.benchmark.averageLatency !== null)
    .sort((left, right) => (left.benchmark.averageLatency || Number.MAX_SAFE_INTEGER) - (right.benchmark.averageLatency || Number.MAX_SAFE_INTEGER));

  const bestLatency = byLatency[0] || null;

  const bestSecurity =
    [...resolvers]
      .filter((resolver) => resolver.category === 'security' && resolver.benchmark.averageLatency !== null)
      .sort((left, right) => {
        if (right.benchmark.successRate !== left.benchmark.successRate) {
          return right.benchmark.successRate - left.benchmark.successRate;
        }

        return (left.benchmark.averageLatency || Number.MAX_SAFE_INTEGER) - (right.benchmark.averageLatency || Number.MAX_SAFE_INTEGER);
      })[0] || null;

  return {
    bestLatency: bestLatency
      ? {
          id: bestLatency.id,
          name: bestLatency.name,
          averageLatency: bestLatency.benchmark.averageLatency,
          rationale: 'Este foi o DNS com menor tempo médio de resposta na sua conexão atual.',
        }
      : null,
    bestSecurity: bestSecurity
      ? {
          id: bestSecurity.id,
          name: bestSecurity.name,
          rationale: 'Entre as opções com foco em proteção, esta teve a melhor combinação de resposta e estabilidade no seu teste.',
        }
      : null,
  };
};

export const DnsOptimizerView = () => {
  const [payload, setPayload] = useState<DnsOptimizerResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOptimizer = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const catalog = (await api.getDnsOptimizer()) as DnsCatalogPayload;
      const testedResolvers = await Promise.all(catalog.resolvers.map((resolver) => probeDnsFromBrowser(resolver, catalog.benchmarkTargets)));

      setPayload({
        measuredFrom: 'browser',
        benchmarkTargets: catalog.benchmarkTargets,
        generatedAt: new Date().toISOString(),
        notes: 'Os resultados abaixo foram medidos da sua conexão atual até os serviços de DNS testados.',
        resolvers: testedResolvers,
        recommendations: pickRecommendations(testedResolvers),
      });
    } catch (err: any) {
      setError(err.message || 'Falha ao carregar o teste de DNS');
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
        { label: 'DNS testados', value: '--', helper: 'Sem dados carregados.' },
        { label: 'Mais rápido', value: '--', helper: 'Aguardando resultado.' },
        { label: 'Destinos do teste', value: '--', helper: 'Aguardando teste.' },
      ];
    }

    const bestLatency = payload.recommendations.bestLatency?.averageLatency;
    const healthyResolvers = payload.resolvers.filter((item) => item.benchmark.successRate >= 100).length;

    return [
      {
        label: 'DNS testados',
        value: String(payload.resolvers.length),
        helper: `${healthyResolvers} responderam sem falha nesta rodada.`,
      },
      {
        label: 'Mais rápido',
        value: bestLatency !== null && bestLatency !== undefined ? `${bestLatency} ms` : '--',
        helper: 'Menor tempo médio medido na sua conexão atual.',
      },
      {
        label: 'Destinos do teste',
        value: String(payload.benchmarkTargets.length),
        helper: payload.benchmarkTargets.join(', '),
      },
    ];
  }, [payload]);

  const dnsList = useMemo(() => {
    if (!payload) {
      return [];
    }

    return payload.resolvers
      .slice()
      .sort((a, b) => (a.benchmark.averageLatency ?? Number.MAX_SAFE_INTEGER) - (b.benchmark.averageLatency ?? Number.MAX_SAFE_INTEGER))
      .map((item, index) => ({
        id: item.id,
        name: item.name,
        primary: item.primary,
        secondary: item.secondary,
        latency: item.benchmark.averageLatency !== null ? `${item.benchmark.averageLatency} ms` : 'Sem resposta',
        latencyNote: item.benchmark.averageLatency === null ? 'Nesta rodada' : undefined,
        consistency: `${item.benchmark.successRate}%`,
        privacy: privacyLabelMap[item.privacy],
        profile: item.profile,
        badge:
          payload.recommendations.bestLatency?.id === item.id
            ? 'Mais rápido'
            : index === 1
              ? 'Boa opção'
              : 'Testado',
      }));
  }, [payload]);

  return (
    <div className="space-y-8">
      <DnsHero
        eyebrow="DNS Optimizer"
        title="Compare DNS públicos na sua conexão"
        description="Esta tela testa serviços de DNS a partir da sua rede atual para mostrar qual respondeu mais rápido, qual ficou mais estável e qual pode fazer mais sentido para jogos, uso geral ou foco em segurança."
        accent="bg-emerald-100/70"
      />

      <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="max-w-4xl">
          <p className="text-base font-medium leading-relaxed text-slate-800">
            {payload?.notes || 'Executando teste de DNS na sua conexão...'}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Se algum DNS aparecer sem resposta nesta rodada, isso pode indicar bloqueio da rede, política do navegador, timeout momentâneo ou indisponibilidade temporária do provedor.
          </p>
          {payload ? (
            <p className="mt-3 text-sm text-slate-500">
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
          className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:bg-emerald-200"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Atualizando...' : 'Refazer teste'}
        </button>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}

      <DnsMetricStrip metrics={metrics} />

      {isLoading && !payload ? (
        <div className="flex justify-center rounded-3xl border border-emerald-100 bg-white p-12 shadow-sm">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : null}

      {payload ? <ResolverLeaderboard resolvers={dnsList} /> : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Resultados da rodada</h2>
          <p className="mt-1 text-sm text-slate-600">Resumo direto para ajudar na escolha do DNS da sua rede.</p>
        </div>
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <DnsRecommendationCard
            title="DNS mais rápido"
            summary="Mostra qual opção teve o menor tempo médio no teste feito da sua conexão."
            recommendation={
              payload?.recommendations.bestLatency
                ? `${payload.recommendations.bestLatency.name} foi o DNS mais rápido no seu teste, com média de ${payload.recommendations.bestLatency.averageLatency ?? '--'} ms.`
                : 'Nenhum DNS respondeu com dados suficientes para definir qual foi o mais rápido nesta rodada.'
            }
            notes={payload?.recommendations.bestLatency?.rationale || 'Se a diferença entre os DNS for pequena, vale repetir o teste em outro horário antes de mudar a configuração da rede. Ausência de resposta em uma rodada não significa automaticamente que o DNS é ruim.'}
          />
          <DnsRecommendationCard
            title="DNS para segurança"
            summary="Mostra qual opção faz mais sentido quando proteção importa mais que velocidade."
            recommendation={
              payload?.recommendations.bestSecurity
                ? `${payload.recommendations.bestSecurity.name} foi a melhor opção entre os DNS com foco em segurança no seu teste atual.`
                : 'Nenhuma opção com foco em segurança respondeu bem o suficiente nesta rodada.'
            }
            notes={payload?.recommendations.bestSecurity?.rationale || 'Esse resultado considera apenas as opções com foco em segurança que responderam na sua conexão. Se um DNS falhar nesta rodada, vale repetir o teste antes de descartar a opção.'}
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
