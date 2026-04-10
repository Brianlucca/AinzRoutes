import { Plus, RefreshCw } from 'lucide-react';

interface ServiceCheckFormProps {
  customTarget: string;
  customType: 'http' | 'tcp';
  customPort: string;
  recentSearches: string[];
  isAddingCustom: boolean;
  onCustomTargetChange: (value: string) => void;
  onCustomTypeChange: (value: 'http' | 'tcp') => void;
  onCustomPortChange: (value: string) => void;
  onUseRecent: (value: string) => void;
  onSubmit: () => void;
}

export const ServiceCheckForm = ({
  customTarget,
  customType,
  customPort,
  recentSearches,
  isAddingCustom,
  onCustomTargetChange,
  onCustomTypeChange,
  onCustomPortChange,
  onUseRecent,
  onSubmit
}: ServiceCheckFormProps) => {
  return (
    <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Verificação personalizada</h3>
          <p className="text-sm text-slate-600 mt-1">Teste rapidamente um domínio, URL ou host TCP com o mesmo backend usado nos cards.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">API oficial</span>
          <span className="px-2 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-200">Página oficial</span>
          <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Reachability</span>
        </div>
      </div>

      {recentSearches.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-slate-500 flex items-center">Recentes:</span>
          {recentSearches.map((search) => (
            <button
              key={search}
              onClick={() => onUseRecent(search)}
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg transition-colors border border-emerald-100"
            >
              {search}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_180px_120px_auto] gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Destino</label>
          <input
            type="text"
            value={customTarget}
            onChange={(event) => onCustomTargetChange(event.target.value)}
            placeholder="Ex: api.exemplo.com, 1.1.1.1 ou https://status.exemplo.com"
            className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Método</label>
          <select
            value={customType}
            onChange={(event) => onCustomTypeChange(event.target.value as 'http' | 'tcp')}
            className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="http">HTTP/HTTPS</option>
            <option value="tcp">TCP</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Porta</label>
          <input
            type="number"
            value={customPort}
            onChange={(event) => onCustomPortChange(event.target.value)}
            placeholder={customType === 'tcp' ? '443' : '--'}
            disabled={customType !== 'tcp'}
            className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
          />
        </div>
        <button
          onClick={onSubmit}
          disabled={isAddingCustom || !customTarget}
          className={`w-full lg:w-auto flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-colors ${isAddingCustom || !customTarget ? 'bg-emerald-100 text-emerald-400' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
        >
          {isAddingCustom ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          Verificar
        </button>
      </div>
    </div>
  );
};
