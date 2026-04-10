import { useState } from 'react';
import { MtrInput } from '../components/mtr/MtrInput';
import { MtrChart } from '../components/mtr/MtrChart';
import { api } from '../services/api';

export interface MtrData {
  hop: number;
  host: string;
  loss: number;
  sent: number;
  recv: number;
  best: number;
  avg: number;
  worst: number;
  last: number;
  geo?: {
    country: string;
    city: string;
    regionName?: string;
    lat?: number;
    lon?: number;
    query?: string;
  };
  asn?: {
    org: string;
    number: string;
  };
}

export const MtrVisualizerView = () => {
  const [mtrText, setMtrText] = useState('');
  const [parsedData, setParsedData] = useState<MtrData[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const parseMtrOutput = (text: string) => {
    const lines = text.split('\n');
    const data: MtrData[] = [];
    let hopCount = 1;

    for (const line of lines) {
      if (!line.includes('|') || line.includes('---') || line.includes('Host') || line.includes('WinMTR')) {
        continue;
      }

      const parts = line.split('|').map((s) => s.trim()).filter((s) => s !== '');

      if (parts.length >= 7) {
        const hostLoss = parts[0].split('-');
        const host = hostLoss.slice(0, -1).join('-').trim();
        const loss = parseFloat(hostLoss[hostLoss.length - 1].trim());

        data.push({
          hop: hopCount++,
          host: host || 'Desconhecido',
          loss: isNaN(loss) ? 0 : loss,
          sent: parseInt(parts[1]) || 0,
          recv: parseInt(parts[2]) || 0,
          best: parseFloat(parts[3]) || 0,
          avg: parseFloat(parts[4]) || 0,
          worst: parseFloat(parts[5]) || 0,
          last: parseFloat(parts[6]) || 0
        });
      }
    }
    return data;
  };

  const handleGenerate = async () => {
    if (!mtrText.trim()) return;
    setIsGenerating(true);

    const baseData = parseMtrOutput(mtrText);

    try {
      const enrichedData = await api.enrichMtr(baseData);
      setParsedData(enrichedData);
    } catch {
      setParsedData(baseData);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 w-full max-w-5xl mx-auto">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">MTR Visualizer e Geo-Tracker</h2>
        <p className="text-slate-600">Cole a saída do seu comando MTR ou faça upload do arquivo `.txt`. O back-end mapeará a geolocalização automaticamente.</p>
      </div>

      <MtrInput mtrText={mtrText} setMtrText={setMtrText} onGenerate={handleGenerate} />
      <MtrChart isGenerating={isGenerating} data={parsedData} />
    </div>
  );
};
