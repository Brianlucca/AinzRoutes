import { useEffect, useState } from 'react';
import { Lock, Shield } from 'lucide-react';
import { TargetInput } from '../components/scanner/TargetInput';
import { api } from '../services/api';

export const PortScannerView = () => {
  const [target, setTarget] = useState('');
  const [customPorts, setCustomPorts] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyIp = async () => {
      try {
        const result = await api.getMyIp();
        if (result && result.ip) {
          setTarget(result.ip);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchMyIp();
  }, []);

  const parseCustomPorts = () =>
    customPorts
      .split(',')
      .map((value) => Number.parseInt(value.trim(), 10))
      .filter((value) => Number.isInteger(value) && value >= 1 && value <= 65535);

  const handleScan = async () => {
    if (!target) return;
    setIsScanning(true);
    setError(null);
    setScanData(null);

    try {
      const data = await api.scanTarget(target, parseCustomPorts());
      setScanData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Radar de Segurança e Portas</h2>
        <p className="text-slate-600">Verifique portas abertas, escolha portas específicas e valide a expiração de certificados SSL pelo servidor.</p>
      </div>

      <TargetInput target={target} setTarget={setTarget} customPorts={customPorts} setCustomPorts={setCustomPorts} onScan={handleScan} />

      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="text-emerald-600 w-6 h-6" />
            <h3 className="text-lg font-semibold text-slate-900">Portas verificadas</h3>
          </div>
          {isScanning ? (
            <p className="text-slate-500 animate-pulse">Escaneando...</p>
          ) : scanData?.ports ? (
            <div className="space-y-2">
              {scanData.ports.map((p: any) => (
                <div key={p.port} className="flex justify-between border-b border-emerald-100 pb-1">
                  <span className="text-slate-700">Porta {p.port}</span>
                  <span className={p.isOpen ? 'text-emerald-600' : 'text-red-600'}>{p.isOpen ? 'Aberta' : 'Fechada'}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500">Nenhuma verificação iniciada.</p>
          )}
        </div>

        <div className="bg-white border border-emerald-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <Lock className="text-amber-400 w-6 h-6" />
            <h3 className="text-lg font-semibold text-slate-900">Certificado SSL</h3>
          </div>
          {isScanning ? (
            <p className="text-slate-500 animate-pulse">Verificando certificado...</p>
          ) : scanData ? (
            scanData.ssl ? (
              <div className="space-y-2 text-slate-700">
                <p>Status: <span className="text-emerald-600 font-bold">Válido</span></p>
                <p>Emissor: {scanData.ssl.issuer}</p>
                <p>Vence em: <span className={scanData.ssl.daysRemaining < 30 ? 'text-amber-500' : 'text-emerald-600'}>{scanData.ssl.daysRemaining} dias</span></p>
              </div>
            ) : (
              <p className="text-red-600">Nenhum certificado SSL encontrado ou porta fechada.</p>
            )
          ) : (
            <p className="text-slate-500">Nenhuma verificação iniciada.</p>
          )}
        </div>
      </div>
    </div>
  );
};
