import type { ServiceHistoryPoint } from './types';

interface ServiceTrendChartProps {
  history: ServiceHistoryPoint[];
  status: 'online' | 'offline' | 'unstable' | 'unknown';
  variant?: 'card' | 'modal';
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

export const ServiceTrendChart = ({ history, status, variant = 'card' }: ServiceTrendChartProps) => {
  const isModal = variant === 'modal';
  const width = isModal ? 760 : 280;
  const height = isModal ? 168 : 92;
  const padX = isModal ? 18 : 8;
  const padY = isModal ? 16 : 8;
  const points = history.length > 1 ? history : [...history, ...history, ...history].slice(0, 3);
  const palette = getChartPalette(status);
  const strokeWidth = isModal ? 5 : 3;
  const pointRadius = isModal ? 6.5 : 4.5;
  const pointGlow = isModal ? 10 : 6;
  const chartHeightClass = isModal ? 'h-[168px]' : 'h-[92px]';
  const wrapperPadding = isModal ? 'p-4 md:p-5' : 'p-3';
  const headingClass = isModal ? 'text-[11px]' : 'text-[10px]';
  const subheadingClass = isModal ? 'text-sm' : 'text-xs';

  if (points.length === 0) {
    return (
      <div className={`${chartHeightClass} rounded-xl border border-emerald-100 bg-emerald-50/50 flex items-center justify-center text-xs text-slate-500`}>
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
    <div className={`rounded-xl border border-emerald-100 bg-[#f7fff9] ${wrapperPadding}`}>
      <div className={`flex items-center justify-between ${isModal ? 'mb-4' : 'mb-2'}`}>
        <div>
          <p className={`${headingClass} uppercase tracking-[0.24em] text-slate-500`}>Volume recente</p>
          <p className={`${subheadingClass} text-slate-500`}>Cada ponto representa uma coleta recente do monitoramento.</p>
        </div>
        <div className={`${headingClass} uppercase tracking-[0.22em] text-slate-500`}>{points.length} pontos</div>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className={`w-full ${chartHeightClass}`}
        preserveAspectRatio={isModal ? 'xMidYMid meet' : 'none'}
        shapeRendering="geometricPrecision"
        aria-hidden="true"
      >
        <defs>
          <filter id={`glow-${status}`}>
            <feGaussianBlur stdDeviation={isModal ? '2.6' : '3'} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
          const y = padY + ratio * (height - padY * 2);
          return (
            <line
              key={ratio}
              x1={padX}
              x2={width - padX}
              y1={y}
              y2={y}
              stroke="rgba(148,163,184,0.28)"
              strokeDasharray={isModal ? '6 8' : '4 5'}
            />
          );
        })}

        <path d={areaPath} fill={palette.fill} />
        <path
          d={linePath}
          fill="none"
          stroke={palette.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${status})`}
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={lastPoint.x} cy={lastPoint.y} r={pointRadius} fill={palette.stroke} stroke={palette.glow} strokeWidth={pointGlow} />
      </svg>
    </div>
  );
};
