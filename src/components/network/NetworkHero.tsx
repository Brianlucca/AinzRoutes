import { RefreshCw } from 'lucide-react';

interface NetworkHeroProps {
  isLoading: boolean;
  onRefresh: () => void;
}

export const NetworkHero = ({ isLoading, onRefresh }: NetworkHeroProps) => (
  <div className="rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-emerald-100/40 p-6 shadow-sm">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-emerald-700">Diagnóstico IPv6</p>
        <h2 className="mt-3 text-3xl font-bold text-slate-900">Teste real de conectividade IPv4, IPv6 e dual stack</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Esta tela executa testes reais no navegador, em estilo semelhante aos verificadores de compatibilidade IPv6.
          Ela mede se a sua sessão consegue acessar endpoints dedicados para IPv4, IPv6 e dual stack, além de gerar uma nota de 0 a 10.
        </p>
      </div>

      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="inline-flex items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-500 disabled:bg-emerald-200"
      >
        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        {isLoading ? 'Executando testes...' : 'Executar novamente'}
      </button>
    </div>
  </div>
);
