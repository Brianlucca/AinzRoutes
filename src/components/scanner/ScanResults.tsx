import { Shield, Lock } from 'lucide-react';
import { ResultBox } from '../ui/ResultBox';

export const ScanResults = ({ isScanning }: any) => {
  const statusText = isScanning ? "Escaneando..." : "Nenhuma verificação iniciada.";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <ResultBox title="Portas Comuns" icon={Shield} iconColor="text-emerald-400">
        <p>{statusText}</p>
      </ResultBox>
      <ResultBox title="Certificado SSL (443)" icon={Lock} iconColor="text-amber-400">
        <p>{statusText}</p>
      </ResultBox>
    </div>
  );
};