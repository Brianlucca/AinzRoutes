import { Bell, BellOff, Globe, Loader2, MapPin, Server, X } from 'lucide-react';
import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import type { ModalData, ServiceHistoryPoint } from './types';
import { ServiceTrendChart } from './ServiceTrendChart';
import { getCategoryLabel, getMethodLabel, getSignalInfo, getStatusInfo } from './utils';

interface ServiceDetailsModalProps {
  data: ModalData | null;
  onClose: () => void;
  isWatched?: boolean;
  onToggleWatch?: () => void;
  history?: ServiceHistoryPoint[];
}

export const ServiceDetailsModal = ({ data, onClose, isWatched = false, onToggleWatch, history = [] }: ServiceDetailsModalProps) => {
  if (!data) {
    return null;
  }

  const modalSignalInfo = getSignalInfo(data.signal, data.sourceType);
  const modalStatusInfo = getStatusInfo(data.status);

  return (
    <div className="fixed inset-0 z-[100] min-h-screen w-screen bg-slate-950/45 backdrop-blur-[3px]" onClick={onClose}>
      <div className="flex min-h-screen items-center justify-center p-4">
      <div className="bg-white border border-emerald-100 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl relative" onClick={(event) => event.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 z-10 bg-white/90 border border-emerald-100 rounded-full p-1">
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 max-h-[85vh] overflow-y-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pr-10">
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-1 truncate">{data.name}</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                <span className={`text-[11px] px-2 py-1 rounded-full ${modalSignalInfo.badgeClass}`}>{modalSignalInfo.shortLabel}</span>
                <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-slate-700 border border-emerald-200">
                  {getMethodLabel(data.method, data.port)}
                </span>
                <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-50 text-slate-700 border border-emerald-200">
                  {getCategoryLabel(data.category)}
                </span>
              </div>
            </div>

            {onToggleWatch ? (
              <button
                onClick={onToggleWatch}
                className={`inline-flex items-center px-4 py-2 rounded-xl border transition-colors ${
                  isWatched
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-white border-emerald-100 text-slate-700 hover:bg-emerald-50'
                }`}
              >
                {isWatched ? <Bell className="w-4 h-4 mr-2" /> : <BellOff className="w-4 h-4 mr-2" />}
                {isWatched ? 'Desativar alerta' : 'Ativar alerta'}
              </button>
            ) : null}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#f7fff9] rounded-xl p-4 border border-emerald-100">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</p>
              <p className={`text-lg font-bold flex items-center ${modalStatusInfo.color}`}>{modalStatusInfo.text}</p>
            </div>
            <div className="bg-[#f7fff9] rounded-xl p-4 border border-emerald-100">
              <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Latência</p>
              <p className="text-lg font-mono text-slate-800">{data.latency !== null ? `${data.latency}ms` : '--'}</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Essa latência mostra o tempo entre o servidor da API e o alvo monitorado. Ela não representa a rota real entre o navegador do usuário e o serviço final.
              </p>
            </div>
          </div>

          <div className="bg-[#f7fff9] rounded-xl p-4 border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between gap-4 border-b border-emerald-100 pb-2">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Histórico recente do monitoramento</h4>
              </div>
            </div>
            <ServiceTrendChart history={history} status={data.status} />
          </div>

          <div className="bg-[#f7fff9] rounded-xl p-4 border border-emerald-100 space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 border-b border-emerald-100 pb-2">Leitura do monitoramento</h4>
            <p className="text-sm text-slate-700">{modalSignalInfo.longLabel}</p>
            {data.notes ? <p className="text-sm text-slate-600">{data.notes}</p> : null}
            {data.error ? <p className="text-sm text-red-600">Erro retornado: {data.error}</p> : null}
            {data.httpStatus ? <p className="text-sm text-slate-600">HTTP status: {data.httpStatus}</p> : null}
          </div>

          <div className="bg-[#f7fff9] rounded-xl p-4 border border-emerald-100 space-y-4">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center border-b border-emerald-100 pb-2">
              {data.method === 'tcp' ? <Server className="w-4 h-4 mr-2 text-emerald-600" /> : <Globe className="w-4 h-4 mr-2 text-emerald-600" />}
              Destino monitorado
            </h4>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <p className="flex justify-between gap-4">
                  <span className="text-slate-500">Alvo informado:</span>
                  <span className="text-slate-700 text-right break-all">{data.target || '--'}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-slate-500">URL:</span>
                  <span className="text-slate-700 text-right break-all">{data.url || '--'}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-slate-500">Porta:</span>
                  <span className="text-slate-700 text-right">{data.port || '--'}</span>
                </p>
              </div>

              <div className="space-y-3">
                <p className="flex justify-between gap-4">
                  <span className="text-slate-500">Hostname resolvido:</span>
                  <span className="text-slate-700 text-right break-all">{data.resolvedTarget?.hostname || '--'}</span>
                </p>
                <p className="flex justify-between gap-4">
                  <span className="text-slate-500">IPs resolvidos:</span>
                  <span className="text-slate-700 text-right break-all">
                    {data.resolvedTarget?.addresses?.length ? data.resolvedTarget.addresses.join(', ') : '--'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#f7fff9] rounded-xl p-4 border border-emerald-100 space-y-3 min-h-[100px] flex flex-col justify-center">
            <h4 className="text-sm font-semibold text-slate-900 flex items-center border-b border-emerald-100 pb-2 mb-2">
              <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
              Informações de roteamento
            </h4>

            {data.geoLoading ? (
              <div className="flex flex-col items-center justify-center py-4 text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mb-2 text-emerald-600" />
                <span className="text-xs">Rastreando localização...</span>
              </div>
            ) : data.geo ? (
              <>
                <div className="space-y-1 text-sm mb-4">
                  <p className="flex justify-between">
                    <span className="text-slate-500">Local:</span>
                    <span className="text-slate-700 text-right">
                      {data.geo.city}, {data.geo.country}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Provedor:</span>
                    <span className="text-slate-700 text-right truncate ml-4" title={data.geo.isp}>
                      {data.geo.isp}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">ASN:</span>
                    <span className="text-slate-700 text-right">{data.geo.as}</span>
                  </p>
                </div>
                {data.geo.lat && data.geo.lon && (
                  <div className="h-[220px] w-full rounded-xl overflow-hidden border border-emerald-100 relative z-0">
                    <MapContainer center={[data.geo.lat, data.geo.lon]} zoom={12} scrollWheelZoom className="w-full h-full">
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
                )}
              </>
            ) : (
              <div className="text-center py-4 text-slate-500 text-sm">Geolocalização não disponível para este alvo.</div>
            )}
          </div>
        </div>
        <div className="bg-[#f7fff9] p-4 border-t border-emerald-100 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-colors">
            Fechar
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};
