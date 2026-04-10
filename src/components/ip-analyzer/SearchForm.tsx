import { Search } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

export const SearchForm = ({ target, setTarget, onSearch }: any) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <Input icon={Search} value={target} onChange={(e: any) => setTarget(e.target.value)} placeholder="Digite um IP ou domínio (ex: 8.8.8.8 ou google.com)" />
      <Button onClick={onSearch}>Analisar</Button>
    </div>
  );
};
