import { Activity, AlertTriangle, CheckCircle2, Globe, Server } from 'lucide-react';
import type { MtrData } from '../../views/MtrVisualizerView';

export const MtrChart = ({ isGenerating, data }: { isGenerating: boolean; data: MtrData[] | null }) => {
  if (isGenerating) {
    return (
      <div className="bg-white border border-emerald-100 rounded-2xl p-8 min-h-[300px] flex items-center justify-center shadow-sm">
        <div className="text-center text-slate-500 flex flex-col items-center">
          <Activity className="w-12 h-12 mb-3 animate-pulse text-emerald-600" />
          <p>Processando saltos e buscando localizações...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white border border-emerald-100 rounded-2xl p-8 min-h-[300px] flex items-center justify-center shadow-sm">
        <div className="text-center text-slate-500 flex flex-col items-center">
          <Activity className="w-12 h-12 mb-3 opacity-20" />
          <p>O gráfico da rota aparecerá aqui após o processamento.</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-8 flex items-center justify-center text-red-700">
        Nenhum dado válido encontrado. Verifique o formato do texto inserido.
      </div>
    );
  }

  const maxAvg = Math.max(...data.map((d) => d.avg));

  return (
    <div className="bg-white border border-emerald-100 rounded-2xl p-6 lg:p-8 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900 mb-8 border-b border-emerald-100 pb-4 flex items-center">
        <Activity className="w-5 h-5 mr-3 text-emerald-600" />
        Análise de Rota e Latência
      </h3>

      <div className="relative">
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-emerald-100 hidden sm:block"></div>

        <div className="space-y-4">
          {data.map((hop, index) => {
            const hasLoss = hop.loss > 0;
            const barWidth = Math.max((hop.avg / maxAvg) * 100, 1);
            const isHighLatency = hop.avg > 100;

            return (
              <div key={index} className="relative flex items-start sm:items-center pl-0 sm:pl-16">
                <div className={`absolute left-4 w-5 h-5 rounded-full border-4 border-white hidden sm:flex items-center justify-center z-10 ${hasLoss ? 'bg-red-500' : isHighLatency ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>

                <div className={`flex-1 bg-[#f7fff9] border rounded-xl p-4 transition-colors ${hasLoss ? 'border-red-200' : isHighLatency ? 'border-amber-200' : 'border-emerald-100 hover:border-emerald-200'}`}>
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 min-w-[250px]">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold bg-white text-slate-600 px-2 py-1 rounded-lg border border-emerald-100">
                          {hop.hop}
                        </span>
                        <span className={`font-mono text-sm sm:text-base ${hasLoss ? 'text-red-600' : 'text-slate-800'}`}>
                          {hop.host}
                        </span>
                      </div>

                      {(hop.geo || hop.asn) && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 bg-white p-2 rounded-lg border border-emerald-100">
                          {hop.geo && (
                            <div className="flex items-center truncate">
                              <Globe className="w-3 h-3 mr-1.5 text-sky-600 flex-shrink-0" />
                              <span className="truncate">{hop.geo.city}, {hop.geo.country}</span>
                            </div>
                          )}
                          {hop.asn && (
                            <div className="flex items-center truncate">
                              <Server className="w-3 h-3 mr-1.5 text-emerald-600 flex-shrink-0" />
                              <span className="truncate">{hop.asn.number} {hop.asn.org}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex items-center space-x-4 text-xs">
                        {hasLoss ? (
                          <span className="flex items-center text-red-600 font-medium bg-red-50 px-2 py-1 rounded-lg border border-red-200">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {hop.loss}% Loss
                          </span>
                        ) : (
                          <span className="flex items-center text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            0% Loss
                          </span>
                        )}
                        <span className="text-slate-500">
                          Enviados: {hop.sent} / Recv: {hop.recv}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 w-full lg:max-w-md flex flex-col justify-center">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>Latência média</span>
                        <span className="font-mono text-emerald-700">{hop.avg.toFixed(1)} ms</span>
                      </div>
                      <div className="w-full bg-emerald-100 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${hasLoss || isHighLatency ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${barWidth}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>Best: {hop.best}ms</span>
                        <span>Worst: {hop.worst}ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
