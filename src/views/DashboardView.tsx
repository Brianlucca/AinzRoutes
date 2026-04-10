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
      <section className="bg-[linear-gradient(135deg,#ffffff_0%,#f3fbf6_55%,#ecfdf5_100%)] border border-emerald-100 rounded-[28px] p-7 shadow-sm overflow-hidden relative">
        <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-emerald-100/60 blur-3xl" />
        <div className="relative flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div className="max-w-3xl">
            <p className="text-xs uppercase tracking-[0.32em] text-emerald-700 font-semibold">Painel Geral</p>
            <h1 className="text-3xl xl:text-4xl font-bold text-slate-900 mt-3">Centro de observabilidade do AinzRoutes</h1>
            <p className="text-slate-600 mt-3 leading-relaxed">
              Um resumo operacional com indicadores reais do monitoramento de serviços, latência, distribuição de IPs resolvidos e portas acompanhadas pela API.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            {overview ? (
              <div className="text-sm text-slate-500 bg-white/80 border border-emerald-100 rounded-xl px-4 py-2">
                Atualizado em {new Date(overview.generatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            ) : null}
            <button
              onClick={loadOverview}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-200 text-white rounded-xl transition-colors"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar painel
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">{error}</div>
      ) : null}

      {isLoading && !overview ? (
        <div className="bg-white border border-emerald-100 rounded-2xl p-12 flex justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : null}

      {overview ? (
        <>
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            <DashboardMetricCard
              title="Serviços monitorados"
              value={overview.totals.services}
              description="Quantidade total de alvos acompanhados nesta coleta."
              icon={ActivitySquare}
              tone="green"
            />
            <DashboardMetricCard
              title="Saúde geral"
              value={`${overview.totals.online}/${overview.totals.services}`}
              description="Itens operacionais no panorama atual do monitoramento."
              icon={Gauge}
              tone="sky"
            />
            <DashboardMetricCard
              title="Latência média"
              value={overview.totals.averageLatency !== null ? `${overview.totals.averageLatency} ms` : '--'}
              description="Média da resposta entre o servidor da API e os alvos monitorados."
              icon={Waypoints}
              tone="amber"
            />
            <DashboardMetricCard
              title="Fonte oficial"
              value={overview.totals.withOfficialSignal}
              description="Itens com leitura derivada de API oficial de status."
              icon={Shield}
              tone="green"
            />
          </section>

          <section className="grid grid-cols-1 2xl:grid-cols-12 gap-6">
            <div className="2xl:col-span-4">
              <DashboardDonutChart
                title="Saúde dos serviços"
                subtitle="Distribuição atual entre online, instável e offline."
                data={overview.charts.statusDistribution}
                colors={['#16a34a', '#f59e0b', '#dc2626']}
              />
            </div>
            <div className="2xl:col-span-4">
              <DashboardBarChart
                title="Categorias monitoradas"
                subtitle="Quantidade de serviços por domínio operacional."
                data={overview.charts.categoryDistribution}
              />
            </div>
            <div className="2xl:col-span-4">
              <DashboardBarChart
                title="Latências mais altas"
                subtitle="Alvos com maior tempo de resposta nesta coleta."
                data={overview.charts.latencyRanking}
                mode="latency"
              />
            </div>
          </section>

          <section className="grid grid-cols-1 2xl:grid-cols-12 gap-6">
            <div className="2xl:col-span-3">
              <DashboardBarChart
                title="IPs resolvidos"
                subtitle="Como os alvos estão sendo resolvidos agora."
                data={overview.charts.resolvedAddressDistribution}
              />
            </div>
            <div className="2xl:col-span-3">
              <DashboardBarChart
                title="Portas monitoradas"
                subtitle="Portas envolvidas nos checks ativos."
                data={overview.charts.portDistribution}
              />
            </div>
            <div className="2xl:col-span-3">
              <DashboardDonutChart
                title="Fontes do monitoramento"
                subtitle="Mix entre APIs oficiais, páginas oficiais e endpoints públicos."
                data={overview.charts.sourceDistribution}
                colors={['#16a34a', '#0284c7', '#f59e0b']}
              />
            </div>
            <div className="2xl:col-span-3">
              <DashboardBarChart
                title="Métodos de coleta"
                subtitle="Distribuição entre HTTP, TCP e APIs oficiais."
                data={overview.charts.methodDistribution}
              />
            </div>
          </section>

          <DashboardHighlights overview={overview} />
        </>
      ) : null}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Módulos operacionais</h2>
          <p className="text-slate-600 mt-1">Acesse rapidamente as ferramentas principais da plataforma.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <FeatureCard key={tool.id} item={tool} onClick={setActiveTab} />
          ))}
        </div>
      </section>
    </div>
  );
};
