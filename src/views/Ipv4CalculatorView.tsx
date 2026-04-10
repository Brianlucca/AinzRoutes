import { useState, useCallback } from 'react';
import IpInputForm from '../components/ipv4/IpInputForm';
import ResultsDisplay from '../components/ipv4/ResultsDisplay';
import SubnetVisualizer from '../components/ipv4/SubnetVisualizer';
import SubnetPlanner from '../components/ipv4/SubnetPlanner';
import { analyzeIp, type NetworkAnalysis } from '../utils/ipCalculator';

export const Ipv4CalculatorView = () => {
  const [analysisResult, setAnalysisResult] = useState<NetworkAnalysis | null>(null);

  const handleCalculate = useCallback((ip: string, subnetCidr: string) => {
    const result = analyzeIp(ip, subnetCidr);
    setAnalysisResult(result);
  }, []);

  return (
    <div className="space-y-8 w-full max-w-4xl mx-auto">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Calculadora e Analisador IPv4</h2>
        <p className="text-slate-600">Insira um endereço IP e selecione uma máscara de sub-rede (CIDR) para ver os detalhes.</p>
      </div>

      <IpInputForm onCalculate={handleCalculate} />
      {analysisResult && <ResultsDisplay analysis={analysisResult} />}
      {analysisResult && analysisResult.isValid && <SubnetVisualizer analysis={analysisResult} />}

      <hr className="border-emerald-100" />

      <SubnetPlanner />
    </div>
  );
};
