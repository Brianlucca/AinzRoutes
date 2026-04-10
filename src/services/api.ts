const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = {
  getMyIp: async () => {
    const response = await fetch(`${BASE_URL}/ip/me`);
    if (!response.ok) throw new Error('Falha ao buscar seu IP');
    return response.json();
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

  enrichMtr: async (mtrData: any[]) => {
    const response = await fetch(`${BASE_URL}/mtr/enrich`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mtrData })
    });
    if (!response.ok) throw new Error('Falha na comunicação com o backend');
    return response.json();
  },

  scanTarget: async (target: string, ports?: number[]) => {
    const response = await fetch(`${BASE_URL}/scanner/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, ports })
    });
    if (!response.ok) throw new Error('Falha na comunicação com o backend');
    return response.json();
  },

  executeCommand: async (command: string, target: string) => {
    const response = await fetch(`${BASE_URL}/terminal/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, target })
    });
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
      body: JSON.stringify({ target, type, port, monitorId })
    });
    if (!response.ok) throw new Error('Falha ao verificar serviço customizado');
    return response.json();
  }
};
