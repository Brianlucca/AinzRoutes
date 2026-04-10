import { Play, UploadCloud, FileText } from 'lucide-react';
import { Button } from '../ui/Button';
import { useRef } from 'react';

export const MtrInput = ({ mtrText, setMtrText, onGenerate }: any) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setMtrText(evt.target.result as string);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="bg-white border border-emerald-100 rounded-2xl p-4 shadow-sm">
      <div className="flex justify-between items-center mb-2 px-1">
        <span className="text-sm font-medium text-slate-600 flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          Dados do MTR / Traceroute
        </span>

        <div>
          <input
            type="file"
            accept=".txt"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-sm text-emerald-600 hover:text-emerald-500 flex items-center transition-colors"
          >
            <UploadCloud className="w-4 h-4 mr-1" />
            Ler arquivo .TXT
          </button>
        </div>
      </div>

      <textarea
        value={mtrText}
        onChange={(e) => setMtrText(e.target.value)}
        className="w-full h-48 bg-[#f7fff9] border border-emerald-200 rounded-xl p-4 text-emerald-700 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        placeholder="Cole aqui o resultado do terminal ou faça o upload do arquivo..."
        spellCheck="false"
      />
      <div className="mt-4 flex justify-end">
        <Button icon={Play} onClick={onGenerate}>Gerar gráfico</Button>
      </div>
    </div>
  );
};
