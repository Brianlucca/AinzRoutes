import type { DiagnosticsState, ProbeKind, ProbeResult } from './types';

export const IPV4_ENDPOINT = 'https://api4.ipify.org?format=json';
export const IPV6_ENDPOINT = 'https://api6.ipify.org?format=json';
export const DUAL_ENDPOINT = 'https://api64.ipify.org?format=json';

export const getIpVersion = (value: string | null | undefined): 4 | 6 | null => {
  if (!value) {
    return null;
  }

  const normalized = value.replace('::ffff:', '').trim();

  if (!normalized) {
    return null;
  }

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(normalized)) {
    return 4;
  }

  if (normalized.includes(':')) {
    return 6;
  }

  return null;
};

export const formatLatency = (latency: number | null) => {
  if (latency === null) {
    return 'falhou';
  }

  return `${latency} ms`;
};

export const buildProbeDetail = (label: string, success: boolean, version: 4 | 6 | null) => {
  if (!success) {
    return `${label} não respondeu corretamente nesta sessão.`;
  }

  if (version === 6) {
    return `${label} respondeu usando IPv6.`;
  }

  if (version === 4) {
    return `${label} respondeu usando IPv4.`;
  }

  return `${label} respondeu, mas a versão do IP não foi identificada.`;
};

export const runProbe = async (id: string, label: string, endpoint: string, kind: ProbeKind): Promise<ProbeResult> => {
  const start = performance.now();

  try {
    const cacheBustedUrl = `${endpoint}&ts=${Date.now()}-${id}`;
    const response = await fetch(cacheBustedUrl, { cache: 'no-store' });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const address = typeof data?.ip === 'string' ? data.ip : null;
    const version = getIpVersion(address);
    const latency = Math.round(performance.now() - start);
    const success =
      kind === 'dual'
        ? version === 4 || version === 6
        : kind === 'ipv4'
          ? version === 4
          : version === 6;

    return {
      id,
      label,
      success,
      latency,
      address,
      version,
      transportLabel: version ? `usando IPv${version}` : 'sem identificação de transporte',
      detail: buildProbeDetail(label, success, version),
    };
  } catch (error: any) {
    return {
      id,
      label,
      success: false,
      latency: null,
      address: null,
      version: null,
      transportLabel: 'falhou',
      detail: error?.message ? `${label} falhou: ${error.message}.` : `${label} falhou nesta sessão.`,
    };
  }
};

export const buildScore = (tests: ProbeResult[]) => {
  const testMap = Object.fromEntries(tests.map((test) => [test.id, test]));

  let score = 0;

  if (testMap.ipv4?.success) score += 2;
  if (testMap.ipv6?.success) score += 3;
  if (testMap.dualPrimary?.success) score += 2;
  if (testMap.dualPrimary?.version === 6) score += 1;
  if (testMap.dualRepeat?.success) score += 1;
  if (testMap.dnsIpv6?.success) score += 1;

  return Math.min(score, 10);
};

export const getCompatibilityMessage = (score: number, ipv6Detected: boolean) => {
  if (score >= 9 && ipv6Detected) {
    return 'Sua compatibilidade com IPv6 está excelente nesta sessão.';
  }

  if (score >= 6) {
    return 'Sua sessão tem compatibilidade parcial com IPv6 e dual stack.';
  }

  return 'Sua sessão depende principalmente de IPv4 ou apresentou falhas nos testes IPv6.';
};

export const buildFallbackDiagnostics = async (getMyIp: () => Promise<any>): Promise<DiagnosticsState> => {
  const session = await getMyIp();

  return {
    session,
    addressing: {
      ipv4: session?.ipVersion === 4 ? session.ip : null,
      ipv6: session?.ipVersion === 6 ? session.ip : null,
      currentTransportVersion: session?.ipVersion ? `IPv${session.ipVersion}` : 'indisponível',
    },
    provider: null,
    dns: {
      userDnsDetected: false,
      note: 'O diagnóstico completo não pôde ser carregado nesta execução.',
      serverResolvers: [],
    },
  };
};
