import { Bell, BellOff, Globe, Loader2, MapPin, Server, TimerReset, Trash2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import { ServiceTrendChart } from './ServiceTrendChart';
import type { ModalData, ServiceHistoryPoint } from './types';
import { getCategoryLabel, getMethodLabel, getSignalInfo, getStatusInfo } from './utils';

interface ServiceDetailsModalProps {
  data: ModalData | null;
  onClose: () => void;
  isWatched?: boolean;
  onToggleWatch?: () => void;
  onDeleteCustom?: () => void;
  history?: ServiceHistoryPoint[];
}

export const ServiceDetailsModal = ({
  data,
  onClose,
  isWatched = false,
  onToggleWatch,
  onDeleteCustom,
  history = [],
}: ServiceDetailsModalProps) => {
  if (!data || typeof document === 'undefined') {
    return null;
  }

  const modalSignalInfo = getSignalInfo(data.signal, data.sourceType);
  const modalStatusInfo = getStatusInfo(data.status);

  return createPortal(
    <div className="fixed inset-0 z-[220] h-dvh w-screen overflow-y-auto bg-slate-950/55 backdrop-blur-sm" onClick={onClose}>
      <div className="flex min-h-dvh items-center justify-center p-4 md:p-6">
        <div
          className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-emerald-100 bg-white shadow-[0_32px_90px_rgba(15,23,42,0.28)]"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 rounded-full border border-emerald-100 bg-white/90 p-1 text-slate-500 hover:text-slate-900"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="max-h-[88dvh] space-y-6 overflow-y-auto p-6">
            <div className="flex flex-col gap-4 pr-10 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="mb-1 truncate text-xl font-bold text-slate-900">{data.name}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`rounded-full px-2 py-1 text-[11px] ${modalSignalInfo.badgeClass}`}>{modalSignalInfo.shortLabel}</span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] text-slate-700">
                    {getMethodLabel(data.method, data.port)}
                  </span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] text-slate-700">
                    {getCategoryLabel(data.category)}
                  </span>
                  {data.isCustom && data.customIntervalMinutes ? (
                    <span className="inline-flex items-center rounded-full border border-emerald-200 bg-white px-2 py-1 text-[11px] text-slate-700">
                      <TimerReset className="mr-1 h-3 w-3 text-emerald-600" />
                      A cada {data.customIntervalMinutes} min
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {onDeleteCustom && data.isCustom ? (
                  <button
                    onClick={onDeleteCustom}
                    className="inline-flex items-center rounded-xl border border-red-100 bg-white px-4 py-2 text-slate-700 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Excluir monitor
                  </button>
                ) : null}
                {onToggleWatch ? (
                  <button
                    onClick={onToggleWatch}
                    className={`inline-flex items-center rounded-xl border px-4 py-2 transition-colors ${
                      isWatched
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : 'border-emerald-100 bg-white text-slate-700 hover:bg-emerald-50'
                    }`}
                  >
                    {isWatched ? <Bell className="mr-2 h-4 w-4" /> : <BellOff className="mr-2 h-4 w-4" />}
                    {isWatched ? 'Desativar alerta' : 'Ativar alerta'}
                  </button>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-emerald-100 bg-[#f7fff9] p-4">
                <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Status</p>
                <p className={`flex items-center text-lg font-bold ${modalStatusInfo.color}`}>{modalStatusInfo.text}</p>
              </div>
              <div className="rounded-xl border border-emerald-100 bg-[#f7fff9] p-4">
                <p className="mb-1 text-[10px] font-bold uppercase text-slate-500">Latência</p>
                <p className="text-lg font-mono text-slate-800">{data.latency !== null ? `${data.latency}ms` : '--'}</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  Essa latência mostra o tempo entre o servidor da API e o alvo monitorado. Ela não representa a rota real entre o navegador do usuário e o serviço final.
                </p>
              </div>
            </div>

            <div className="space-y-4 rounded-xl border border-emerald-100 bg-[#f7fff9] p-4">
              <div className="flex items-center justify-between gap-4 border-b border-emerald-100 pb-2">
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">Histórico recente do monitoramento</h4>
                </div>
              </div>
              <ServiceTrendChart history={history} status={data.status} variant="modal" />
            </div>

            <div className="space-y-3 rounded-xl border border-emerald-100 bg-[#f7fff9] p-4">
              <h4 className="border-b border-emerald-100 pb-2 text-sm font-semibold text-slate-900">Leitura do monitoramento</h4>
              <p className="text-sm text-slate-700">{modalSignalInfo.longLabel}</p>
              {data.notes ? <p className="text-sm text-slate-600">{data.notes}</p> : null}
              {data.error ? <p className="text-sm text-red-600">Erro retornado: {data.error}</p> : null}
              {data.httpStatus ? <p className="text-sm text-slate-600">HTTP status: {data.httpStatus}</p> : null}
            </div>

            <div className="space-y-4 rounded-xl border border-emerald-100 bg-[#f7fff9] p-4">
              <h4 className="flex items-center border-b border-emerald-100 pb-2 text-sm font-semibold text-slate-900">
                {data.method === 'tcp' ? <Server className="mr-2 h-4 w-4 text-emerald-600" /> : <Globe className="mr-2 h-4 w-4 text-emerald-600" />}
                Destino monitorado
              </h4>

              <div className="grid grid-cols-1 gap-4 text-sm lg:grid-cols-2">
                <div className="space-y-3">
                  <p className="flex justify-between gap-4">
                    <span className="text-slate-500">Alvo informado:</span>
                    <span className="break-all text-right text-slate-700">{data.target || '--'}</span>
                  </p>
                  <p className="flex justify-between gap-4">
                    <span className="text-slate-500">URL:</span>
                    <span className="break-all text-right text-slate-700">{data.url || '--'}</span>
                  </p>
                  <p className="flex justify-between gap-4">
                    <span className="text-slate-500">Porta:</span>
                    <span className="text-right text-slate-700">{data.port || '--'}</span>
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="flex justify-between gap-4">
                    <span className="text-slate-500">Hostname resolvido:</span>
                    <span className="break-all text-right text-slate-700">{data.resolvedTarget?.hostname || '--'}</span>
                  </p>
                  <p className="flex justify-between gap-4">
                    <span className="text-slate-500">IPs resolvidos:</span>
                    <span className="break-all text-right text-slate-700">
                      {data.resolvedTarget?.addresses?.length ? data.resolvedTarget.addresses.join(', ') : '--'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex min-h-[100px] flex-col justify-center space-y-3 rounded-xl border border-emerald-100 bg-[#f7fff9] p-4">
              <h4 className="mb-2 flex items-center border-b border-emerald-100 pb-2 text-sm font-semibold text-slate-900">
                <MapPin className="mr-2 h-4 w-4 text-emerald-600" />
                Informações de roteamento
              </h4>

              {data.geoLoading ? (
                <div className="flex flex-col items-center justify-center py-4 text-slate-500">
                  <Loader2 className="mb-2 h-5 w-5 animate-spin text-emerald-600" />
                  <span className="text-xs">Rastreando localização...</span>
                </div>
              ) : data.geo ? (
                <>
                  <div className="mb-4 space-y-1 text-sm">
                    <p className="flex justify-between">
                      <span className="text-slate-500">Local:</span>
                      <span className="text-right text-slate-700">
                        {data.geo.city}, {data.geo.country}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">Provedor:</span>
                      <span className="ml-4 truncate text-right text-slate-700" title={data.geo.isp}>
                        {data.geo.isp}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-slate-500">ASN:</span>
                      <span className="text-right text-slate-700">{data.geo.as}</span>
                    </p>
                  </div>
                  {data.geo.lat && data.geo.lon ? (
                    <div className="relative z-0 h-[220px] w-full overflow-hidden rounded-xl border border-emerald-100">
                      <MapContainer center={[data.geo.lat, data.geo.lon]} zoom={12} scrollWheelZoom className="h-full w-full">
                        <TileLayer
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          className="map-tiles-light"
                        />
                        <Marker position={[data.geo.lat, data.geo.lon]} />
                      </MapContainer>
                      <style>{`
                        .map-tiles-light {
                          filter: saturate(0.95) hue-rotate(-8deg) brightness(1.02);
                        }
                        .leaflet-container {
                          background: #ecfdf5;
                        }
                      `}</style>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="py-4 text-center text-sm text-slate-500">Geolocalização não disponível para este alvo.</div>
              )}
            </div>
          </div>

          <div className="flex justify-end border-t border-emerald-100 bg-[#f7fff9] p-4">
            <button onClick={onClose} className="rounded-xl bg-emerald-600 px-4 py-2 text-white transition-colors hover:bg-emerald-500">
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
