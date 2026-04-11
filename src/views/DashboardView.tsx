import { useEffect, useState } from 'react';
import { ActivitySquare, Gauge, RefreshCw, Shield, Waypoints } from 'lucide-react';
import { DashboardBarChart } from '../components/dashboard/DashboardBarChart';
import { DashboardDonutChart } from '../components/dashboard/DashboardDonutChart';
import { DashboardHighlights } from '../components/dashboard/DashboardHighlights';
import { DashboardMetricCard } from '../components/dashboard/DashboardMetricCard';
import { buildOverviewFromServices } from '../components/dashboard/buildOverview';
import type { DashboardOverview } from '../components/dashboard/types';
import { FeatureCard } from '../components/ui/FeatureCard';
import { navItems } from '../config/navigation';
import { api } from '../services/api';

export const DashboardView = ({ setActiveTab }: any) => {
  const tools = navItems.filter((item) => item.id !== 'dashboard' && item.id !== 'terms');
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const services = await api.getServicesStatus();
      setOverview(buildOverviewFromServices(services));
    } catch (err: any) {
      setError(err.message || 'Falha ao montar o painel geral');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,#ffffff_0%,#f3fbf6_55%,#ecfdf5_100%)] p-7 shadow-sm">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">Painel Geral</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 xl:text-4xl">Centro de observabilidade do AinzRoutes</h1>
            <p className="mt-3 leading-relaxed text-slate-600">
              Um resumo operacional com indicadores reais do monitoramento de serviços, latência, distribuição de IPs resolvidos e portas acompanhadas pela API.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {overview ? (
              <div className="rounded-xl border border-emerald-100 bg-white/80 px-4 py-2 text-sm text-slate-500">
                Atualizado em {new Date(overview.generatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            ) : null}
            <button
              onClick={loadOverview}
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2.5 text-white transition-colors hover:bg-emerald-500 disabled:bg-emerald-200"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar painel
            </button>
          </div>
        </div>
      </section>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div> : null}

      {isLoading && !overview ? (
        <div className="flex justify-center rounded-2xl border border-emerald-100 bg-white p-12">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : null}

      {overview ? (
        <>
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            <DashboardMetricCard title="Serviços monitorados" value={overview.totals.services} description="Quantidade total de alvos acompanhados nesta coleta." icon={ActivitySquare} tone="green" />
            <DashboardMetricCard title="Saúde geral" value={`${overview.totals.online}/${overview.totals.services}`} description="Itens operacionais no panorama atual do monitoramento." icon={Gauge} tone="sky" />
            <DashboardMetricCard title="Latência média" value={overview.totals.averageLatency !== null ? `${overview.totals.averageLatency} ms` : '--'} description="Média da resposta entre o servidor da API e os alvos monitorados." icon={Waypoints} tone="amber" />
            <DashboardMetricCard title="Fonte oficial" value={overview.totals.withOfficialSignal} description="Itens com leitura derivada de API oficial de status." icon={Shield} tone="green" />
          </section>

          <section className="grid grid-cols-1 gap-6 2xl:grid-cols-12">
            <div className="2xl:col-span-4">
              <DashboardDonutChart title="Saúde dos serviços" subtitle="Distribuição atual entre online, instável e offline." data={overview.charts.statusDistribution} colors={['#16a34a', '#f59e0b', '#dc2626']} />
            </div>
            <div className="2xl:col-span-4">
              <DashboardBarChart title="Categorias monitoradas" subtitle="Quantidade de serviços por domínio operacional." data={overview.charts.categoryDistribution} />
            </div>
            <div className="2xl:col-span-4">
              <DashboardBarChart title="Latências mais altas" subtitle="Alvos com maior tempo de resposta nesta coleta." data={overview.charts.latencyRanking} mode="latency" />
            </div>
          </section>

          <section className="grid grid-cols-1 gap-6 2xl:grid-cols-12">
            <div className="2xl:col-span-3">
              <DashboardBarChart title="IPs resolvidos" subtitle="Como os alvos estão sendo resolvidos agora." data={overview.charts.resolvedAddressDistribution} />
            </div>
            <div className="2xl:col-span-3">
              <DashboardBarChart title="Portas monitoradas" subtitle="Portas envolvidas nos checks ativos." data={overview.charts.portDistribution} />
            </div>
            <div className="2xl:col-span-3">
              <DashboardDonutChart title="Fontes do monitoramento" subtitle="Mix entre APIs oficiais, páginas oficiais e endpoints públicos." data={overview.charts.sourceDistribution} colors={['#16a34a', '#0284c7', '#f59e0b']} />
            </div>
            <div className="2xl:col-span-3">
              <DashboardBarChart title="Métodos de coleta" subtitle="Distribuição entre HTTP, TCP e APIs oficiais." data={overview.charts.methodDistribution} />
            </div>
          </section>

          <DashboardHighlights overview={overview} />
        </>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Módulos operacionais</h2>
          <p className="mt-1 text-slate-600">Acesse rapidamente as ferramentas principais da plataforma.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <FeatureCard key={tool.id} item={tool} onClick={setActiveTab} />
          ))}
        </div>
      </section>
    </div>
  );
}
