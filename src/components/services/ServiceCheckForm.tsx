import { Plus, RefreshCw } from 'lucide-react';

interface ServiceCheckFormProps {
  customTarget: string;
  customType: 'http' | 'tcp';
  customPort: string;
  customIntervalMinutes: string;
  recentSearches: string[];
  isAddingCustom: boolean;
  onCustomTargetChange: (value: string) => void;
  onCustomTypeChange: (value: 'http' | 'tcp') => void;
  onCustomPortChange: (value: string) => void;
  onCustomIntervalChange: (value: string) => void;
  onUseRecent: (value: string) => void;
  onSubmit: () => void;
}

export const ServiceCheckForm = ({
  customTarget,
  customType,
  customPort,
  customIntervalMinutes,
  recentSearches,
  isAddingCustom,
  onCustomTargetChange,
  onCustomTypeChange,
  onCustomPortChange,
  onCustomIntervalChange,
  onUseRecent,
  onSubmit,
}: ServiceCheckFormProps) => {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Monitor personalizado</h3>
          <p className="mt-1 text-sm text-slate-600">
            Adicione um domínio, URL ou host TCP com intervalo recorrente para acompanhar disponibilidade, queda e recuperação.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">API oficial</span>
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-1 text-sky-700">Página oficial</span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-amber-700">Reachability</span>
        </div>
      </div>

      {recentSearches.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="flex items-center text-xs text-slate-500">Recentes:</span>
          {recentSearches.map((search) => (
            <button
              key={search}
              onClick={() => onUseRecent(search)}
              className="rounded-lg border border-emerald-100 bg-emerald-50 px-2 py-1 text-xs text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              {search}
            </button>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-1 items-end gap-4 xl:grid-cols-[minmax(0,1fr)_180px_130px_190px_auto]">
        <div>
          <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Destino</label>
          <input
            type="text"
            value={customTarget}
            onChange={(event) => onCustomTargetChange(event.target.value)}
            placeholder="Ex.: api.exemplo.com, 1.1.1.1 ou https://status.exemplo.com"
            className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Método</label>
          <select
            value={customType}
            onChange={(event) => onCustomTypeChange(event.target.value as 'http' | 'tcp')}
            className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="http">HTTP/HTTPS</option>
            <option value="tcp">TCP</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Porta</label>
          <input
            type="number"
            value={customPort}
            onChange={(event) => onCustomPortChange(event.target.value)}
            placeholder={customType === 'tcp' ? '443' : '--'}
            disabled={customType !== 'tcp'}
            className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-slate-800 outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold uppercase text-slate-500">Intervalo</label>
          <div className="flex overflow-hidden rounded-xl border border-emerald-200 bg-white focus-within:ring-2 focus-within:ring-emerald-500">
            <input
              type="number"
              min={1}
              max={1440}
              step={1}
              value={customIntervalMinutes}
              onChange={(event) => onCustomIntervalChange(event.target.value)}
              placeholder="5"
              className="w-full bg-transparent px-4 py-3 text-slate-800 outline-none"
            />
            <div className="flex items-center border-l border-emerald-100 bg-emerald-50 px-4 text-sm font-medium text-emerald-700">
              min
            </div>
          </div>
        </div>

        <button
          onClick={onSubmit}
          disabled={isAddingCustom || !customTarget}
          className={`flex w-full items-center justify-center rounded-xl px-6 py-3 font-medium transition-colors xl:w-auto ${
            isAddingCustom || !customTarget ? 'bg-emerald-100 text-emerald-400' : 'bg-emerald-600 text-white hover:bg-emerald-500'
          }`}
        >
          {isAddingCustom ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          Adicionar monitor
        </button>
      </div>
    </div>
  );
};
