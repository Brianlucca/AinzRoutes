import { CheckCircle2, RefreshCw, XCircle } from 'lucide-react';
import type { ProbeResult } from './types';
import { formatLatency } from './utils';

const ProbeRow = ({ test }: { test: ProbeResult }) => (
  <div className="grid grid-cols-1 gap-4 rounded-2xl border border-emerald-100 bg-white px-4 py-4 shadow-sm lg:grid-cols-[minmax(0,1.8fr)_140px_160px]">
    <div className="min-w-0">
      <div className="flex items-center gap-3">
        {test.success ? (
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
        ) : (
          <XCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
        )}
        <div className="min-w-0">
          <p className="font-medium text-slate-900">{test.label}</p>
          <p className="break-words text-sm text-slate-600">{test.detail}</p>
        </div>
      </div>
    </div>

    <div className="text-sm text-slate-700">
      <p className={`font-semibold ${test.success ? 'text-emerald-700' : 'text-red-600'}`}>
        {test.success ? 'bom' : 'falhou'}
      </p>
      <p className="text-slate-500">{formatLatency(test.latency)}</p>
    </div>

    <div className="text-sm text-slate-700">
      <p className="font-semibold">{test.transportLabel}</p>
      <p className="break-all font-mono text-xs text-slate-500">{test.address || '--'}</p>
    </div>
  </div>
);

interface ProbeResultsPanelProps {
  isLoading: boolean;
  score: number;
  tests: ProbeResult[];
}

export const ProbeResultsPanel = ({ isLoading, score, tests }: ProbeResultsPanelProps) => (
  <article className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">Resultados</p>
        <h3 className="mt-2 text-2xl font-bold text-slate-900">Como este teste chegou à nota final</h3>
        <p className="mt-2 text-sm leading-7 text-slate-600">
          O navegador tentou abrir endpoints públicos separados para IPv4, IPv6 e dual stack. Cada linha abaixo mostra sucesso, latência e qual protocolo foi usado.
        </p>
      </div>

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        Nota atual: <span className="font-semibold">{score}/10</span>
      </div>
    </div>

    <div className="mt-6 space-y-3">
      {isLoading && tests.length === 0 ? (
        <div className="flex justify-center py-10">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      ) : (
        tests.map((test) => <ProbeRow key={test.id} test={test} />)
      )}
    </div>
  </article>
);
