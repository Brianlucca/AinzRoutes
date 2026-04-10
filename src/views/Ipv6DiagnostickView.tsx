import { useEffect, useMemo, useState } from 'react';
import { CompatibilityPanel } from '../components/network/CompatibilityPanel';
import { NetworkHero } from '../components/network/NetworkHero';
import { ProbeResultsPanel } from '../components/network/ProbeResultsPanel';
import type { DiagnosticsState, ProbeResult } from '../components/network/types';
import {
  buildFallbackDiagnostics,
  buildScore,
  DUAL_ENDPOINT,
  getCompatibilityMessage,
  IPV4_ENDPOINT,
  IPV6_ENDPOINT,
  runProbe
} from '../components/network/utils';
import { api } from '../services/api';

const TechnicalInfoPanel = ({ diagnostics }: { diagnostics: DiagnosticsState | null }) => (
  <article className="rounded-[28px] border border-emerald-100 bg-white p-6 shadow-sm">
    <h3 className="text-lg font-semibold text-slate-900">Informações técnicas da rede</h3>

    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">IP da sessão</p>
        <p className="mt-2 break-all font-mono text-sm text-slate-800">{diagnostics?.session?.ip || '--'}</p>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Transporte para a API</p>
        <p className="mt-2 text-sm font-semibold text-slate-800">{diagnostics?.addressing?.currentTransportVersion || '--'}</p>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Provedor</p>
        <p className="mt-2 text-sm text-slate-800">{diagnostics?.provider?.isp || '--'}</p>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">ASN</p>
        <p className="mt-2 text-sm text-slate-800">{diagnostics?.provider?.as || '--'}</p>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Organização</p>
        <p className="mt-2 text-sm text-slate-800">{diagnostics?.provider?.org || '--'}</p>
      </div>
      <div className="rounded-2xl border border-emerald-100 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Cidade / região</p>
        <p className="mt-2 text-sm text-slate-800">
          {diagnostics?.provider?.city || '--'}
          {diagnostics?.provider?.regionName ? `, ${diagnostics.provider.regionName}` : ''}
        </p>
      </div>
    </div>
  </article>
);

export const Ipv6DiagnostickView = () => {
  const [backendDiagnostics, setBackendDiagnostics] = useState<DiagnosticsState | null>(null);
  const [tests, setTests] = useState<ProbeResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDiagnostics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [diagnostics, ipv4Test, ipv6Test, dualPrimaryTest, dualRepeatTest] = await Promise.all([
        api.getNetworkDiagnostics().catch(() => buildFallbackDiagnostics(api.getMyIp)),
        runProbe('ipv4', 'Teste com um endpoint IPv4 dedicado', IPV4_ENDPOINT, 'ipv4'),
        runProbe('ipv6', 'Teste com um endpoint IPv6 dedicado', IPV6_ENDPOINT, 'ipv6'),
        runProbe('dualPrimary', 'Teste com um endpoint dual stack', DUAL_ENDPOINT, 'dual'),
        runProbe('dualRepeat', 'Teste dual stack em segunda tentativa', DUAL_ENDPOINT, 'dual')
      ]);

      const dnsIpv6: ProbeResult = {
        id: 'dnsIpv6',
        label: 'Teste se o resolvedor da sessão alcança recursos IPv6',
        success: ipv6Test.success,
        latency: ipv6Test.latency,
        address: ipv6Test.address,
        version: ipv6Test.version,
        transportLabel: ipv6Test.success ? 'resolver com alcance IPv6' : 'sem alcance IPv6 detectado',
        detail: ipv6Test.success
          ? 'A sessão conseguiu resolver e acessar um recurso IPv6 público.'
          : 'A sessão não conseguiu resolver ou acessar corretamente um recurso IPv6 público.'
      };

      setBackendDiagnostics(diagnostics);
      setTests([ipv4Test, ipv6Test, dualPrimaryTest, dualRepeatTest, dnsIpv6]);
    } catch (err: any) {
      setError(err?.message || 'Falha ao executar o teste de conectividade IPv6.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiagnostics();
  }, []);

  const score = useMemo(() => buildScore(tests), [tests]);
  const ipv4Address = tests.find((test) => test.id === 'ipv4')?.address || backendDiagnostics?.addressing?.ipv4 || null;
  const ipv6Address = tests.find((test) => test.id === 'ipv6')?.address || backendDiagnostics?.addressing?.ipv6 || null;
  const dualStackVersion = tests.find((test) => test.id === 'dualPrimary')?.version || null;
  const ipv6Detected = Boolean(ipv6Address);
  const compatibilityMessage = getCompatibilityMessage(score, ipv6Detected);

  return (
    <div className="space-y-6">
      <NetworkHero isLoading={isLoading} onRefresh={loadDiagnostics} />

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-red-700">{error}</div> : null}

      <CompatibilityPanel
        score={score}
        compatibilityMessage={compatibilityMessage}
        ipv4Address={ipv4Address}
        ipv6Address={ipv6Address}
        dualStackVersion={dualStackVersion}
      />

      <ProbeResultsPanel isLoading={isLoading} score={score} tests={tests} />

      <TechnicalInfoPanel diagnostics={backendDiagnostics} />
    </div>
  );
};
