import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const TargetInput = ({ target, setTarget, customPorts, setCustomPorts, onScan }: any) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px_auto] gap-4">
      <Input value={target} onChange={(e: any) => setTarget(e.target.value)} placeholder="IP ou domínio alvo" />
      <Input value={customPorts} onChange={(e: any) => setCustomPorts(e.target.value)} placeholder="Portas customizadas: 80,443,8080" />
      <Button onClick={onScan}>Escanear</Button>
    </div>
  );
};
