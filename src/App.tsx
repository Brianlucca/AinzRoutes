import { useState } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { DashboardView } from './views/DashboardView';
import { IpAnalyzerView } from './views/IpAnalyzerView';
import { Ipv6DiagnostickView } from './views/Ipv6DiagnostickView';
import { MtrVisualizerView } from './views/MtrVisualizerView';
import { PortScannerView } from './views/PortScannerView';
import { Ipv4CalculatorView } from './views/Ipv4CalculatorView';
import { ServicesStatusView } from './views/ServicesStatusView';
import { TermsView } from './views/TermsView';

const viewRegistry: Record<string, React.FC<any>> = {
  dashboard: DashboardView,
  ip: IpAnalyzerView,
  network: Ipv6DiagnostickView,
  mtr: MtrVisualizerView,
  ports: PortScannerView,
  ipv4: Ipv4CalculatorView,
  services: ServicesStatusView,
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
