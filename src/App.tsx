import { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardView } from './views/DashboardView';
import { DnsOptimizerView } from './views/DnsOptimizerView';
import { IpAnalyzerView } from './views/IpAnalyzerView';
import { Ipv4CalculatorView } from './views/Ipv4CalculatorView';
import { Ipv6DiagnostickView } from './views/Ipv6DiagnostickView';
import { MtrVisualizerView } from './views/MtrVisualizerView';
import { PortScannerView } from './views/PortScannerView';
import { ServicesStatusView } from './views/ServicesStatusView';
import { TermsView } from './views/TermsView';

const viewRegistry: Record<string, React.FC<any>> = {
  dashboard: DashboardView,
  services: ServicesStatusView,
  ip: IpAnalyzerView,
  'dns-optimizer': DnsOptimizerView,
  ports: PortScannerView,
  network: Ipv6DiagnostickView,
  mtr: MtrVisualizerView,
  ipv4: Ipv4CalculatorView,
  terms: TermsView,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const ActiveView = viewRegistry[activeTab] || viewRegistry.dashboard;

  return (
    <MainLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <ActiveView setActiveTab={setActiveTab} />
    </MainLayout>
  );
}
