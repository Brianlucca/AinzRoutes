import type { ServiceHistoryPoint } from './types';

interface ServiceTrendChartProps {
  history: ServiceHistoryPoint[];
  status: 'online' | 'offline' | 'unstable' | 'unknown';
}

const getPointValue = (point: ServiceHistoryPoint) => {
  if (point.status === 'offline') {
    return 100;
  }

  if (point.status === 'unstable') {
    return Math.min(point.latency ?? 70, 85);
  }

  if (point.latency === null) {
    return 45;
  }

  return Math.min(Math.max(point.latency, 12), 70);
};

const getChartPalette = (status: ServiceTrendChartProps['status']) => {
  switch (status) {
    case 'online':
      return { stroke: '#16a34a', fill: 'rgba(22,163,74,0.14)', glow: 'rgba(22,163,74,0.18)' };
    case 'unstable':
      return { stroke: '#f59e0b', fill: 'rgba(245,158,11,0.16)', glow: 'rgba(245,158,11,0.20)' };
    case 'offline':
      return { stroke: '#dc2626', fill: 'rgba(220,38,38,0.14)', glow: 'rgba(220,38,38,0.18)' };
    default:
      return { stroke: '#94a3b8', fill: 'rgba(148,163,184,0.12)', glow: 'rgba(148,163,184,0.16)' };
  }
};

export const ServiceTrendChart = ({ history, status }: ServiceTrendChartProps) => {
  const width = 280;
  const height = 92;
  const padX = 8;
  const padY = 8;
  const points = history.length > 1 ? history : [...history, ...history, ...history].slice(0, 3);
  const palette = getChartPalette(status);

  if (points.length === 0) {
    return (
      <div className="h-[92px] rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-center justify-center text-xs text-slate-500">
        Aguardando histórico
      </div>
    );
  }

  const maxValue = Math.max(...points.map(getPointValue), 100);
  const minValue = Math.min(...points.map(getPointValue), 0);
  const range = Math.max(maxValue - minValue, 1);

  const coords = points.map((point, index) => {
    const x = padX + (index * (width - padX * 2)) / Math.max(points.length - 1, 1);
    const normalized = (getPointValue(point) - minValue) / range;
    const y = height - padY - normalized * (height - padY * 2);
    return { x, y };
  });

  const linePath = coords.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x} ${height - padY} L ${coords[0].x} ${height - padY} Z`;
  const lastPoint = coords[coords.length - 1];

  return (
    <div className="rounded-xl border border-emerald-100 bg-[#f7fff9] p-3">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Volume recente</p>
          <p className="text-xs text-slate-500">Cada ponto representa uma coleta recente do monitoramento.</p>
        </div>
        <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{points.length} pontos</div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[92px]" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <filter id={`glow-${status}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[0.25, 0.5, 0.75].map((ratio) => {
          const y = padY + ratio * (height - padY * 2);
          return <line key={ratio} x1={padX} x2={width - padX} y1={y} y2={y} stroke="rgba(148,163,184,0.35)" strokeDasharray="4 5" />;
        })}

        <path d={areaPath} fill={palette.fill} />
        <path d={linePath} fill="none" stroke={palette.stroke} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" filter={`url(#glow-${status})`} />
        <circle cx={lastPoint.x} cy={lastPoint.y} r="4.5" fill={palette.stroke} stroke={palette.glow} strokeWidth="6" />
      </svg>
    </div>
  );
};
