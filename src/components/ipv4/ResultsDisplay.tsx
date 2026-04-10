import type { NetworkAnalysis } from '../../utils/ipCalculator';

interface ResultsDisplayProps {
  analysis: NetworkAnalysis | null;
}

export default function ResultsDisplay({ analysis }: ResultsDisplayProps) {
  if (!analysis) return null;

  if (!analysis.isValid) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700">
        <h3 className="text-xl font-semibold mb-2">Erro na análise</h3>
        <p>{analysis.error}</p>
      </div>
    );
  }

  const ResultItem = ({ label, value }: { label: string; value: string | number | boolean }) => (
    <div className="py-3 px-4 bg-[#f7fff9] rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center border border-emerald-100">
      <span className="text-slate-600 mb-1 sm:mb-0">{label}:</span>
      <span className="font-mono text-emerald-700 text-sm sm:text-base">
        {typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : String(value)}
      </span>
    </div>
  );

  return (
    <div className="p-6 bg-white border border-emerald-100 rounded-2xl shadow-sm">
      <h3 className="text-xl font-semibold text-slate-900 mb-6 border-b border-emerald-100 pb-4">
        Resultados da análise de rede
      </h3>
      <div className="space-y-2">
        <ResultItem label="Endereço IP inserido" value={analysis.ipAddress} />
        <ResultItem label="Máscara de sub-rede" value={`${analysis.subnetMask} (/${analysis.cidr})`} />
        <div className="py-2" />
        <ResultItem label="Endereço de rede" value={analysis.networkAddress} />
        <ResultItem label="Endereço de broadcast" value={analysis.broadcastAddress} />
        <ResultItem label="Primeiro host utilizável" value={analysis.firstUsableHost} />
        <ResultItem label="Último host utilizável" value={analysis.lastUsableHost} />
        <ResultItem label="Número de hosts utilizáveis" value={analysis.numberOfUsableHosts} />
        <ResultItem label="Máscara wildcard" value={analysis.wildcardMask} />
        <div className="py-2" />
        <ResultItem label="IP privado" value={analysis.isPrivate} />
      </div>
    </div>
  );
}
