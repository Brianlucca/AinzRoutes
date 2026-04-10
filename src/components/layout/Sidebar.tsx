import { ArrowUpRight } from 'lucide-react';
import { navItems } from '../../config/navigation';

const sidebarLogoSrc = '/Logo-6.png';

export const Sidebar = ({ activeTab, setActiveTab }: any) => {
  return (
    <aside className="relative flex h-screen w-72 shrink-0 flex-col overflow-hidden border-r border-emerald-100 bg-white/95 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_62%)]" />

      <div className="relative border-b border-emerald-100 px-6 pb-5 pt-6">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white px-4 py-3 shadow-[0_18px_40px_rgba(16,185,129,0.12)]">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">
            <img
              src={sidebarLogoSrc}
              alt="AinzRoutes logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.28em] text-emerald-600/80">Network Toolkit</div>
            <span className="text-xl font-bold tracking-wide text-slate-900">AinzRoutes</span>
          </div>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          Painel operacional para diagnóstico de rede, serviços globais e ferramentas de infraestrutura.
        </p>
      </div>

      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group flex w-full items-center justify-between rounded-2xl border px-4 py-3 transition-all ${
                isActive
                  ? 'border-emerald-200 bg-gradient-to-r from-emerald-100 to-white text-emerald-700 shadow-[0_14px_28px_rgba(16,185,129,0.12)]'
                  : 'border-transparent text-slate-600 hover:bg-emerald-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center">
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-emerald-600'}`} />
                <span className="text-sm font-medium">{item.label}</span>
              </span>
              <ArrowUpRight className={`h-4 w-4 transition-all ${isActive ? 'text-emerald-600' : 'text-slate-300 opacity-0 group-hover:text-emerald-500 group-hover:opacity-100'}`} />
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
