import { Activity, ActivitySquare, Calculator, FileText, LayoutDashboard, Network, Shield, Wifi } from 'lucide-react';

export const navItems = [
  { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
  { id: 'services', label: 'Status de Serviços', icon: ActivitySquare },
  { id: 'ip', label: 'Raio-X IP/Dominio', icon: Network },
  { id: 'ports', label: 'Scanner de Portas', icon: Shield },
  { id: 'network', label: 'IPv6 e IPv4', icon: Wifi },
  { id: 'mtr', label: 'MTR Visualizer', icon: Activity },
  { id: 'ipv4', label: 'Calculadora IPv4', icon: Calculator },
  { id: 'terms', label: 'Termos de Uso', icon: FileText }
];
