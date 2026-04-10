import { useEffect, useState } from 'react';
import { AnalysisResults } from '../components/ip-analyzer/AnalysisResults';
import { SearchForm } from '../components/ip-analyzer/SearchForm';
import { api } from '../services/api';

interface NetworkInfo {
  ip: string;
  ipVersion: 4 | 6 | null;
  network?: {
    requestIp: string;
    requestIpVersion: 4 | 6 | null;
    ipv6DetectedOnCurrentSession: boolean;
    detectionMode: string;
    note: string;
  };
}

export const IpAnalyzerView = () => {
  const [target, setTarget] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo | null>(null);

  useEffect(() => {
    const fetchMyIp = async () => {
      try {
        const result = await api.getMyIp();
        setNetworkInfo(result);

        if (result && result.ip) {
          setTarget(result.ip);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchMyIp();
  }, []);

  const handleSearch = async () => {
    if (!target) return;
    setIsSearching(true);
    setError(null);
    setData(null);

    try {
      const result = await api.analyzeIp(target);
      if (result.status === 'fail') {
        throw new Error(result.message || 'IP ou domínio inválido');
      }
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Raio-X de IP e Domínio</h2>
        <p className="text-slate-600">Consulte geolocalização, ASN, reputação, blacklist e o tipo de conectividade da sua sessão.</p>
      </div>

      {networkInfo?.network ? (
        <section className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-emerald-700 font-semibold">Conectividade da sessão</p>
              <h3 className="text-lg font-semibold text-slate-900 mt-2">
                {networkInfo.network.ipv6DetectedOnCurrentSession ? 'IPv6 detectado nesta sessão' : 'Sessão atual chegou por IPv4'}
              </h3>
              <p className="text-sm text-slate-600 mt-2 max-w-3xl">{networkInfo.network.note}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-[280px]">
              <div className="rounded-xl border border-emerald-100 bg-[#f7fff9] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">IP atual</p>
                <p className="font-mono text-slate-900 mt-2 break-all">{networkInfo.ip}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-[#f7fff9] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Versão detectada</p>
                <p className="text-slate-900 mt-2 font-semibold">{networkInfo.ipVersion ? `IPv${networkInfo.ipVersion}` : 'Não identificada'}</p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <SearchForm target={target} setTarget={setTarget} onSearch={handleSearch} />

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>}

      <AnalysisResults isSearching={isSearching} data={data} />
    </div>
  );
};
