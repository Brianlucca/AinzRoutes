import { Router, ShieldCheck } from 'lucide-react';
import type { DiagnosticsState } from './types';

interface TechnicalInfoPanelProps {
  diagnostics: DiagnosticsState | null;
}

export const TechnicalInfoPanel = ({ diagnostics }: TechnicalInfoPanelProps) => (
  <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
    <article className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <Router className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-slate-900">Informações técnicas da rede</h3>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">IP da sessão</p>
          <p className="mt-2 break-all font-mono text-sm text-slate-800">{diagnostics?.session?.ip || '--'}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Transporte para a API</p>
          <p className="mt-2 text-sm font-semibold text-slate-800">{diagnostics?.addressing?.currentTransportVersion || '--'}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Provedor</p>
          <p className="mt-2 text-sm text-slate-800">{diagnostics?.provider?.isp || '--'}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">ASN</p>
          <p className="mt-2 text-sm text-slate-800">{diagnostics?.provider?.as || '--'}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Organização</p>
          <p className="mt-2 text-sm text-slate-800">{diagnostics?.provider?.org || '--'}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Cidade / região</p>
          <p className="mt-2 text-sm text-slate-800">
            {diagnostics?.provider?.city || '--'}
            {diagnostics?.provider?.regionName ? `, ${diagnostics.provider.regionName}` : ''}
          </p>
        </div>
      </div>
    </article>

    <article className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600" />
        <h3 className="text-lg font-semibold text-slate-900">DNS e interpretação do resultado</h3>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
          <p className="text-sm leading-7 text-slate-700">
            O site consegue inferir compatibilidade IPv6 da sessão porque o navegador acessa endpoints reais que respondem apenas por IPv4, apenas por IPv6 ou por dual stack.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
          <p className="text-sm leading-7 text-slate-700">
            Isso é diferente de um comando como <span className="font-mono">ipconfig</span>, que enxerga a rede local completa da máquina. Aqui o foco é a conectividade real da sessão na web.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
          <p className="text-sm font-semibold text-slate-900">Resolvedores do servidor da API</p>
          <p className="mt-2 break-words text-sm text-slate-600">
            {diagnostics?.dns?.serverResolvers?.join(', ') || 'Não informado'}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            {diagnostics?.dns?.note || 'Sem observações adicionais sobre DNS nesta execução.'}
          </p>
        </div>
      </div>
    </article>
  </div>
);
