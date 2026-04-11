import { memo, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ServiceHistoryPoint } from './types';

interface ServiceTrendChartProps {
  history: ServiceHistoryPoint[];
  status: 'online' | 'offline' | 'unstable' | 'unknown';
  variant?: 'card' | 'modal';
}

const STATUS_SEVERITY: Record<ServiceHistoryPoint['status'], number> = {
  online: 18,
  unstable: 58,
  offline: 92,
  unknown: 42,
};

const getPalette = (status: ServiceTrendChartProps['status']) => {
  switch (status) {
    case 'online':
      return { stroke: '#16a34a', fill: '#86efac', label: 'Estável' };
    case 'unstable':
      return { stroke: '#f59e0b', fill: '#fcd34d', label: 'Oscilando' };
    case 'offline':
      return { stroke: '#dc2626', fill: '#fca5a5', label: 'Crítico' };
    default:
      return { stroke: '#64748b', fill: '#cbd5e1', label: 'Sem leitura' };
  }
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const getMetricValue = (point: ServiceHistoryPoint) => {
  const severity = STATUS_SEVERITY[point.status];
  const latencyFactor = point.latency === null ? 10 : clamp(point.latency / 8, 2, 30);
  return clamp(severity + latencyFactor, 8, 100);
};

const sampleHistory = (history: ServiceHistoryPoint[], maxPoints: number) => {
  if (history.length <= maxPoints) {
    return history;
  }

  const step = (history.length - 1) / (maxPoints - 1);
  const sampled: ServiceHistoryPoint[] = [];

  for (let index = 0; index < maxPoints; index += 1) {
    const sourceIndex = Math.round(index * step);
    sampled.push(history[sourceIndex]);
  }

  return sampled;
};

const buildChartData = (history: ServiceHistoryPoint[], variant: 'card' | 'modal') => {
  const basePoints = history.length >= 2 ? history : [...history, ...history, ...history].slice(0, 3);
  const points = sampleHistory(basePoints, variant === 'card' ? 18 : 28);

  return points.map((point, index) => ({
    index,
    time: new Date(point.timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      ...(variant === 'modal' ? { second: '2-digit' as const } : {}),
    }),
    score: getMetricValue(point),
    latency: point.latency,
    status: point.status,
  }));
};

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ payload: { time: string; latency: number | null; status: string } }>;
}) => {
  if (!active || !payload?.length) {
    return null;
  }

  const point = payload[0].payload;

  return (
    <div className="rounded-xl border border-emerald-100 bg-white/95 px-3 py-2 shadow-lg backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{point.time}</p>
      <p className="mt-1 text-sm font-semibold text-slate-900">
        {point.latency !== null ? `${point.latency} ms` : 'Latência indisponível'}
      </p>
      <p className="mt-1 text-xs text-slate-500">Status: {point.status}</p>
    </div>
  );
};

const getLastPointSignature = (history: ServiceHistoryPoint[]) => {
  const last = history[history.length - 1];
  if (!last) {
    return 'empty';
  }

  return `${history.length}:${last.timestamp}:${last.status}:${last.latency ?? 'null'}`;
};

const ServiceTrendChartComponent = ({ history, status, variant = 'card' }: ServiceTrendChartProps) => {
  const isModal = variant === 'modal';
  const palette = getPalette(status);
  const chartData = useMemo(() => buildChartData(history, variant), [history, variant]);
  const latestLatency = chartData[chartData.length - 1]?.latency;

  if (chartData.length === 0) {
    return (
      <div className={`${isModal ? 'h-[188px]' : 'h-[110px]'} flex items-center justify-center rounded-2xl border border-emerald-100 bg-[linear-gradient(180deg,#fbfffc_0%,#f2fbf5_100%)] text-xs text-slate-500`}>
        Aguardando histórico
      </div>
    );
  }

  return (
    <div className={`overflow-hidden rounded-2xl border border-emerald-100 bg-[linear-gradient(180deg,#fbfffc_0%,#f2fbf5_100%)] ${isModal ? 'p-5' : 'p-3'}`}>
      <div className={`flex items-start justify-between gap-4 ${isModal ? 'mb-4' : 'mb-3'}`}>
        <div>
          <p className="text-[10px] uppercase tracking-[0.26em] text-slate-500">Faixa histórica recente</p>
          <p className="mt-1 text-xs text-slate-500">{chartData.length} coletas visíveis</p>
        </div>
        {isModal ? (
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Leitura atual</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{palette.label}</p>
          </div>
        ) : null}
      </div>

      <div className={isModal ? 'h-[188px] w-full min-w-0' : 'h-[110px] w-full min-w-0'}>
        <ResponsiveContainer width="100%" height="100%" minWidth={120} minHeight={isModal ? 188 : 110}>
          <AreaChart
            data={chartData}
            margin={isModal ? { top: 4, right: 2, left: -24, bottom: 0 } : { top: 12, right: 8, left: 8, bottom: 8 }}
          >
            <defs>
              <linearGradient id={`serviceTrendFill-${variant}-${status}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.fill} stopOpacity={0.34} />
                <stop offset="100%" stopColor={palette.fill} stopOpacity={0.03} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="4 6" vertical={false} />

            {isModal ? (
              <>
                <XAxis
                  dataKey="time"
                  tickLine={false}
                  axisLine={false}
                  minTickGap={28}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis hide domain={[0, 105]} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(15,23,42,0.08)', strokeWidth: 1 }} />
              </>
            ) : (
              <>
                <XAxis dataKey="index" hide />
                <YAxis hide domain={[0, 112]} padding={{ top: 12, bottom: 12 }} />
              </>
            )}

            <Area
              type="monotone"
              dataKey="score"
              stroke={palette.stroke}
              strokeWidth={isModal ? 3 : 2}
              fill={`url(#serviceTrendFill-${variant}-${status})`}
              dot={false}
              isAnimationActive={false}
              animationDuration={0}
              activeDot={
                isModal
                  ? {
                      r: 5,
                      strokeWidth: 2,
                      stroke: '#ffffff',
                      fill: palette.stroke,
                    }
                  : false
              }
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className={`mt-3 grid ${isModal ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
        <div className="rounded-xl border border-emerald-100 bg-white/80 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Última latência</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            {latestLatency !== null && latestLatency !== undefined ? `${latestLatency} ms` : '--'}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-100 bg-white/80 px-3 py-2">
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">{isModal ? 'Estado visual' : 'Amostras'}</p>
          <p className="mt-1 text-sm font-semibold text-slate-800">{isModal ? palette.label : chartData.length}</p>
        </div>
        {isModal ? (
          <div className="rounded-xl border border-emerald-100 bg-white/80 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Amostras</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{chartData.length}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export const ServiceTrendChart = memo(
  ServiceTrendChartComponent,
  (prev, next) =>
    prev.status === next.status &&
    prev.variant === next.variant &&
    getLastPointSignature(prev.history) === getLastPointSignature(next.history)
);
