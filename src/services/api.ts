const BASE_URL = import.meta.env.VITE_API_BASE_URL;

const isLocalOrLoopbackIp = (value?: string | null) => {
  if (!value) {
    return true;
  }

  return value === '::1' || value === '127.0.0.1' || value === 'localhost' || value.startsWith('::ffff:127.0.0.1');
};

const getIpVersion = (value?: string | null): 4 | 6 | null => {
  if (!value) {
    return null;
  }

  if (value.includes(':')) {
    return 6;
  }

  if (value.includes('.')) {
    return 4;
  }

  return null;
};

const resolveBrowserPublicIp = async () => {
  const response = await fetch('https://api64.ipify.org?format=json');

  if (!response.ok) {
    throw new Error('Falha ao descobrir o IP público da sessão pelo navegador');
  }

  const data = await response.json();
  return data?.ip as string | undefined;
};

export const api = {
  getMyIp: async () => {
    const response = await fetch(`${BASE_URL}/ip/me`);
    if (!response.ok) throw new Error('Falha ao buscar seu IP');

    const data = await response.json();

    if (isLocalOrLoopbackIp(data?.ip)) {
      try {
        const browserIp = await resolveBrowserPublicIp();

        if (browserIp) {
          return {
            ...data,
            ip: browserIp,
            ipVersion: getIpVersion(browserIp),
            network: data?.network
              ? {
                  ...data.network,
                  requestIp: browserIp,
                  requestIpVersion: getIpVersion(browserIp),
                  note: 'O backend local retornou loopback, então o frontend usou a sessão real do navegador para preencher o IP público.',
                }
              : undefined,
          };
        }
      } catch {
        return data;
      }
    }

    return data;
  },

  getNetworkDiagnostics: async () => {
    const response = await fetch(`${BASE_URL}/network/diagnostics`);
    if (!response.ok) throw new Error('Falha ao buscar o diagnóstico de rede');
    return response.json();
  },

  analyzeIp: async (target: string) => {
    const response = await fetch(`${BASE_URL}/ip/analyze/${target}`);
    if (!response.ok) throw new Error('Falha ao buscar dados no backend');
    return response.json();
  },

  getDnsOptimizer: async (targets?: string[]) => {
    const query = targets?.length ? `?targets=${encodeURIComponent(targets.join(','))}` : '';
    const response = await fetch(`${BASE_URL}/dns/optimizer${query}`);
    if (!response.ok) throw new Error('Falha ao carregar o benchmark de DNS');
    return response.json();
  },

  enrichMtr: async (mtrData: any[]) => {
    const response = await fetch(`${BASE_URL}/mtr/enrich`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mtrData }),
    });
    if (!response.ok) throw new Error('Falha na comunicação com o backend');
    return response.json();
  },

  scanTarget: async (target: string, ports?: number[]) => {
    const response = await fetch(`${BASE_URL}/scanner/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, ports }),
    });
    if (!response.ok) throw new Error('Falha na comunicação com o backend');
    return response.json();
  },

  getServicesStatus: async () => {
    const response = await fetch(`${BASE_URL}/services/status`);
    if (!response.ok) throw new Error('Falha ao buscar o estado dos serviços');
    return response.json();
  },

  getServicesOverview: async () => {
    const response = await fetch(`${BASE_URL}/services/overview`);
    if (!response.ok) throw new Error('Falha ao buscar o overview do monitoramento');
    return response.json();
  },

  checkCustomService: async (target: string, type: string, port?: string, monitorId?: string) => {
    const response = await fetch(`${BASE_URL}/services/check`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, type, port, monitorId }),
    });
    if (!response.ok) throw new Error('Falha ao verificar serviço customizado');
    return response.json();
  },
};
