import type { NetworkAnalysis } from '../../utils/ipCalculator';

interface SubnetVisualizerProps {
  analysis: NetworkAnalysis | null;
}

export default function SubnetVisualizer({ analysis }: SubnetVisualizerProps) {
  if (!analysis || !analysis.isValid) return null;

  const ipIsInRange = () => {
    if (analysis.cidr === 32 || analysis.cidr === 31) {
      return analysis.ipAddress === analysis.networkAddress || analysis.ipAddress === analysis.broadcastAddress;
    }
    const ipLong = analysis.ipAddress.split('.').reduce((acc, octet, index) => acc + (parseInt(octet, 10) << (24 - index * 8)), 0) >>> 0;
    const firstUsableLong = analysis.firstUsableHost !== 'N/A' ? analysis.firstUsableHost.split('.').reduce((acc, octet, index) => acc + (parseInt(octet, 10) << (24 - index * 8)), 0) >>> 0 : -1;
    const lastUsableLong = analysis.lastUsableHost !== 'N/A' ? analysis.lastUsableHost.split('.').reduce((acc, octet, index) => acc + (parseInt(octet, 10) << (24 - index * 8)), 0) >>> 0 : -1;
    return firstUsableLong !== -1 && lastUsableLong !== -1 && ipLong >= firstUsableLong && ipLong <= lastUsableLong;
  };

  const isIpNetworkOrBroadcast = analysis.ipAddress === analysis.networkAddress || analysis.ipAddress === analysis.broadcastAddress;

  return (
    <div className="p-6 bg-white border border-emerald-100 rounded-2xl text-slate-800 shadow-sm">
      <h3 className="text-xl font-semibold mb-6 border-b border-emerald-100 pb-4">
        Visualização da sub-rede
      </h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-center p-3 bg-[#f7fff9] rounded-xl border border-emerald-100">
          <div className="w-1/3 font-medium text-slate-500">Endereço de rede:</div>
          <div className={`w-2/3 font-mono ${analysis.ipAddress === analysis.networkAddress ? 'text-amber-500' : 'text-emerald-700'}`}>{analysis.networkAddress}</div>
        </div>

        {analysis.cidr < 31 && analysis.numberOfUsableHosts > 0 && (
          <div className="flex items-center p-3 bg-[#f7fff9] rounded-xl border border-emerald-100">
            <div className="w-1/3 font-medium text-slate-500">Primeiro host utilizável:</div>
            <div className={`w-2/3 font-mono ${analysis.ipAddress === analysis.firstUsableHost ? 'text-amber-500' : 'text-emerald-700'}`}>{analysis.firstUsableHost}</div>
          </div>
        )}

        {analysis.ipAddress && !isIpNetworkOrBroadcast && ipIsInRange() && (
          <div className="flex items-center p-3 bg-amber-50 border border-amber-200 rounded-xl my-2">
            <div className="w-1/3 font-medium text-amber-700">IP inserido:</div>
            <div className="w-2/3 font-mono text-amber-700">{analysis.ipAddress}</div>
          </div>
        )}

        {analysis.cidr < 31 && analysis.numberOfUsableHosts > 0 && (
          <div className="flex items-center p-3 bg-[#f7fff9] rounded-xl border border-emerald-100">
            <div className="w-1/3 font-medium text-slate-500">Último host utilizável:</div>
            <div className={`w-2/3 font-mono ${analysis.ipAddress === analysis.lastUsableHost ? 'text-amber-500' : 'text-emerald-700'}`}>{analysis.lastUsableHost}</div>
          </div>
        )}

        {analysis.cidr === 31 && (
          <>
            <div className="flex items-center p-3 bg-[#f7fff9] rounded-xl border border-emerald-100">
              <div className="w-1/3 font-medium text-slate-500">Host 1 (rede):</div>
              <div className={`w-2/3 font-mono ${analysis.ipAddress === analysis.networkAddress ? 'text-amber-500' : 'text-emerald-700'}`}>{analysis.networkAddress}</div>
            </div>
            <div className="flex items-center p-3 bg-[#f7fff9] rounded-xl border border-emerald-100">
              <div className="w-1/3 font-medium text-slate-500">Host 2 (broadcast):</div>
              <div className={`w-2/3 font-mono ${analysis.ipAddress === analysis.broadcastAddress ? 'text-amber-500' : 'text-emerald-700'}`}>{analysis.broadcastAddress}</div>
            </div>
          </>
        )}

        <div className="flex items-center p-3 bg-[#f7fff9] rounded-xl border border-emerald-100">
          <div className="w-1/3 font-medium text-slate-500">Endereço de broadcast:</div>
          <div className={`w-2/3 font-mono ${analysis.ipAddress === analysis.broadcastAddress ? 'text-amber-500' : 'text-emerald-700'}`}>{analysis.broadcastAddress}</div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row text-center text-xs h-16 items-stretch overflow-hidden rounded-xl">
        <div className={`p-2 flex items-center justify-center bg-red-100 border border-red-200 text-red-700 ${analysis.cidr >= 31 ? 'flex-1' : 'w-1/5 sm:w-auto'}`}>
          <div>
            <p>Rede</p>
            {analysis.cidr < 31 && <p className="font-mono hidden sm:block">{analysis.networkAddress}</p>}
          </div>
        </div>
        <div className={`p-2 flex items-center justify-center bg-emerald-100 border-y sm:border-y-0 sm:border-x border-emerald-200 text-emerald-700 flex-grow ${analysis.cidr >= 31 ? 'hidden' : ''}`}>
          <div>
            <p>Faixa utilizável</p>
            {analysis.cidr < 30 && <p className="font-mono hidden sm:block">{analysis.numberOfUsableHosts} hosts</p>}
          </div>
        </div>
        <div className={`p-2 flex items-center justify-center bg-sky-100 border border-sky-200 text-sky-700 ${analysis.cidr >= 31 ? 'flex-1' : 'w-1/5 sm:w-auto'}`}>
          <div>
            <p>Broadcast</p>
            {analysis.cidr < 31 && <p className="font-mono hidden sm:block">{analysis.broadcastAddress}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
