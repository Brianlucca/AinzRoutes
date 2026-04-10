import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, Square } from 'lucide-react';
import { api } from '../services/api';

export const TerminalView = () => {
  const [target, setTarget] = useState('');
  const [commandType, setCommandType] = useState('ping');
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const handleExecute = async () => {
    if (!target) return;
    setIsRunning(true);
    setOutput([`> Executando ${commandType} em ${target} via Servidor AinzRoutes...`, '']);

    try {
      const data = await api.executeCommand(commandType, target);

      if (data.error) {
        setOutput((prev) => [...prev, `Erro: ${data.error}`]);
      } else {
        setOutput((prev) => [...prev, ...data.output]);
      }
    } catch (error: any) {
      setOutput((prev) => [...prev, `Erro de conexão com o backend: ${error.message}`]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setOutput([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 flex items-center">
          <TerminalIcon className="w-6 h-6 mr-2 text-emerald-600" />
          Web Terminal
        </h2>
        <p className="text-slate-600">Execute diagnósticos reais de rede a partir do servidor Node.js.</p>
      </div>

      <div className="bg-white border border-emerald-100 rounded-2xl p-6 flex flex-col sm:flex-row gap-4 items-end shadow-sm">
        <div className="flex-1 w-full">
          <label className="block text-sm font-medium text-slate-600 mb-2">Comando</label>
          <select
            value={commandType}
            onChange={(e) => setCommandType(e.target.value)}
            className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="ping">Ping (ICMP)</option>
            <option value="traceroute">Traceroute / Tracert</option>
            <option value="nslookup">NSLookup (DNS)</option>
          </select>
        </div>

        <div className="flex-[2] w-full">
          <label className="block text-sm font-medium text-slate-600 mb-2">Destino (IP ou Domínio)</label>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="ex: 8.8.8.8 ou google.com"
            className="w-full bg-white border border-emerald-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
            disabled={isRunning}
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={handleExecute}
            disabled={isRunning}
            className={`flex-1 sm:flex-none flex items-center justify-center px-6 py-3 rounded-xl font-medium transition-colors ${isRunning ? 'bg-emerald-100 text-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
          >
            {isRunning ? <Square className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {isRunning ? 'Executando...' : 'Executar'}
          </button>

          <button
            onClick={handleClear}
            className="flex-1 sm:flex-none bg-white hover:bg-emerald-50 border border-emerald-200 text-slate-700 px-6 py-3 rounded-xl font-medium transition-colors"
          >
            Limpar
          </button>
        </div>
      </div>

      <div className="bg-[#f7fff9] border border-emerald-100 rounded-2xl p-4 h-[400px] overflow-y-auto font-mono text-sm shadow-inner">
        {output.length === 0 ? (
          <div className="text-slate-500 italic">Terminal pronto. Aguardando comando...</div>
        ) : (
          <div className="space-y-1">
            {output.map((line, index) => (
              <div key={index} className="text-emerald-700 break-all">
                {line === '' ? <br /> : line}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>
    </div>
  );
};
