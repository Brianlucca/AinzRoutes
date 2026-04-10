import { ActivitySquare, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { MonitorCategory, MonitorMethod, MonitorSignal, MonitorSourceType, ServiceStatus } from './types';

export const getAnalyzeTarget = (service: Pick<ServiceStatus, 'resolvedTarget' | 'target' | 'url'>) => {
  const resolvedAddress = service.resolvedTarget?.addresses?.[0];

  if (resolvedAddress) {
    return resolvedAddress;
  }

  if (service.target) {
    return service.target;
  }

  if (service.url) {
    try {
      return new URL(service.url).hostname;
    } catch {
      return service.url.replace(/^https?:\/\//, '').split('/')[0];
    }
  }

  return '';
};

export const getStatusInfo = (status: string) => {
  switch (status) {
    case 'online':
      return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', text: 'Operacional' };
    case 'offline':
      return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', text: 'Fora do ar' };
    case 'unstable':
      return { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50', text: 'Instável' };
    default:
      return { icon: ActivitySquare, color: 'text-slate-500', bg: 'bg-slate-100', text: 'Desconhecido' };
  }
};

export const getSignalInfo = (signal?: MonitorSignal, sourceType?: MonitorSourceType) => {
  if (signal === 'official_service_status' && sourceType === 'official_api') {
    return {
      shortLabel: 'Status oficial',
      longLabel: 'Status oficial do serviço via API pública.',
      badgeClass: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    };
  }

  if (signal === 'page_reachability' && sourceType === 'official_page') {
    return {
      shortLabel: 'Página oficial',
      longLabel: 'Disponibilidade da página oficial de status.',
      badgeClass: 'bg-sky-50 text-sky-700 border border-sky-200'
    };
  }

  return {
    shortLabel: 'Reachability',
    longLabel: 'Alcance de endpoint público, sem status oficial do serviço.',
    badgeClass: 'bg-amber-50 text-amber-700 border border-amber-200'
  };
};

export const getMethodLabel = (method?: MonitorMethod, port?: string | number | null) => {
  if (method === 'official') {
    return 'API oficial';
  }

  if (method === 'http') {
    return 'HTTP/HTTPS';
  }

  if (method === 'tcp') {
    return `TCP${port ? `:${port}` : ''}`;
  }

  return 'Não informado';
};

export const getCategoryLabel = (category?: MonitorCategory) => {
  switch (category) {
    case 'productivity':
      return 'Produtividade';
    case 'infrastructure':
      return 'Infraestrutura';
    case 'social':
      return 'Social';
    case 'streaming':
      return 'Streaming';
    case 'gaming':
      return 'Games';
    default:
      return 'Geral';
  }
};

export const groupTitleBySignal = (signal: MonitorSignal) => {
  switch (signal) {
    case 'official_service_status':
      return 'Status oficial';
    case 'page_reachability':
      return 'Páginas oficiais';
    default:
      return 'Reachability de endpoint';
  }
};

export const groupDescriptionBySignal = (signal: MonitorSignal) => {
  switch (signal) {
    case 'official_service_status':
      return 'Leituras vindas de APIs oficiais de status, com maior confiabilidade sobre a saúde do serviço.';
    case 'page_reachability':
      return 'Mostra se a página oficial de status está acessível. Não significa, sozinha, que o serviço está saudável.';
    default:
      return 'Testes de conectividade em domínios e endpoints públicos. Bom para alcance, não para saúde oficial.';
  }
};
