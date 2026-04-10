import { useEffect, useState } from 'react';
import { Activity, AlertTriangle, CheckCircle2, Globe, MapPinned, Server } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import type { MtrData } from '../../views/MtrVisualizerView';

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapUpdater = ({ lat, lon }: { lat: number; lon: number }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([lat, lon], 5, { animate: true });
  }, [lat, lon, map]);

  return null;
};

const HopMap = ({ hop }: { hop: MtrData }) => {
  if (!hop.geo?.lat || !hop.geo?.lon) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-6 text-center text-slate-600">
        Este hop ainda não tem coordenadas suficientes para exibir o mapa.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-100">
      <MapContainer
        center={[hop.geo.lat, hop.geo.lon]}
        zoom={5}
        scrollWheelZoom={false}
        className="h-[300px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[hop.geo.lat, hop.geo.lon]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{hop.host}</p>
              <p>
                {hop.geo.city || 'Cidade não identificada'}, {hop.geo.country || 'País não identificado'}
              </p>
            </div>
          </Popup>
        </Marker>
        <MapUpdater lat={hop.geo.lat} lon={hop.geo.lon} />
      </MapContainer>
    </div>
  );
};

const HopDetails = ({ hop }: { hop: MtrData }) => (
  <div className="mt-4 rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
    <div className="mb-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
      <div className="flex items-center gap-2">
        <MapPinned className="h-4 w-4 text-emerald-600" />
        <p className="text-sm font-semibold text-slate-900">Detalhes do hop selecionado</p>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        Este painel mostra a geolocalização e o mapa do hop aberto abaixo da rota clicada.
      </p>
    </div>

    <div className="mb-4 space-y-2">
      <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Hop selecionado</p>
      <p className="font-mono text-sm text-slate-900">{hop.host}</p>
      <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
        <p><span className="font-semibold text-slate-800">Hop:</span> {hop.hop}</p>
        <p><span className="font-semibold text-slate-800">Latência média:</span> {hop.avg.toFixed(1)} ms</p>
        <p><span className="font-semibold text-slate-800">Cidade:</span> {hop.geo?.city || 'Não identificada'}</p>
        <p><span className="font-semibold text-slate-800">País:</span> {hop.geo?.country || 'Não identificado'}</p>
        <p><span className="font-semibold text-slate-800">Região:</span> {hop.geo?.regionName || 'Não identificada'}</p>
        <p><span className="font-semibold text-slate-800">IP consultado:</span> {hop.geo?.query || hop.host}</p>
      </div>
    </div>

    <HopMap hop={hop} />
  </div>
);

export const MtrChart = ({ isGenerating, data }: { isGenerating: boolean; data: MtrData[] | null }) => {
  const [selectedHopIndex, setSelectedHopIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) {
      setSelectedHopIndex(null);
      return;
    }

    setSelectedHopIndex(null);
  }, [data]);

  if (isGenerating) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center text-slate-500">
          <Activity className="mb-3 h-12 w-12 animate-pulse text-emerald-600" />
          <p>Processando saltos e buscando localizações...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[300px] items-center justify-center rounded-2xl border border-emerald-100 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center text-slate-500">
          <Activity className="mb-3 h-12 w-12 opacity-20" />
          <p>O gráfico da rota aparecerá aqui após o processamento.</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
        Nenhum dado válido encontrado. Verifique o formato do texto inserido.
      </div>
    );
  }

  const maxAvg = Math.max(...data.map((d) => d.avg));
  const hopWithMapCount = data.filter((hop) => typeof hop.geo?.lat === 'number' && typeof hop.geo?.lon === 'number').length;

  return (
    <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm lg:p-8">
      <h3 className="mb-6 flex items-center border-b border-emerald-100 pb-4 text-xl font-semibold text-slate-900">
        <Activity className="mr-3 h-5 w-5 text-emerald-600" />
        Análise de rota, latência e mapa por hop
      </h3>

      <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
        <div className="flex items-center gap-2">
          <MapPinned className="h-4 w-4 text-emerald-600" />
          <p className="text-sm font-semibold text-slate-900">Como visualizar o mapa</p>
        </div>
        <p className="mt-2 text-sm text-slate-600">
          Clique em qualquer rota da lista para abrir, logo abaixo dela, os detalhes e o mapa do hop selecionado.
          {` ${hopWithMapCount} de ${data.length} hop(s) possuem coordenadas geográficas.`}
        </p>
      </div>

      <div className="relative">
        <div className="absolute bottom-4 left-6 top-4 hidden w-0.5 bg-emerald-100 sm:block" />

        <div className="space-y-4">
          {data.map((hop, index) => {
            const hasLoss = hop.loss > 0;
            const barWidth = Math.max((hop.avg / maxAvg) * 100, 1);
            const isHighLatency = hop.avg > 100;
            const isSelected = selectedHopIndex === index;

            return (
              <div key={`${hop.hop}-${hop.host}-${index}`} className="relative pl-0 sm:pl-16">
                <button
                  type="button"
                  onClick={() => setSelectedHopIndex((current) => (current === index ? null : index))}
                  className="relative flex w-full items-start text-left sm:items-center"
                >
                  <div
                    className={`absolute -left-12 z-10 hidden h-5 w-5 items-center justify-center rounded-full border-4 border-white sm:flex ${
                      hasLoss ? 'bg-red-500' : isHighLatency ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />

                  <div
                    className={`flex-1 rounded-xl border p-4 transition-colors ${
                      isSelected
                        ? 'border-emerald-300 bg-emerald-50/80 shadow-sm'
                        : hasLoss
                          ? 'border-red-200 bg-[#f7fff9]'
                          : isHighLatency
                            ? 'border-amber-200 bg-[#f7fff9]'
                            : 'border-emerald-100 bg-[#f7fff9] hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                      <div className="min-w-[250px] flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="rounded-lg border border-emerald-100 bg-white px-2 py-1 text-xs font-bold text-slate-600">
                            {hop.hop}
                          </span>
                          <span className={`font-mono text-sm sm:text-base ${hasLoss ? 'text-red-600' : 'text-slate-800'}`}>
                            {hop.host}
                          </span>
                        </div>

                        {(hop.geo || hop.asn) && (
                          <div className="mt-3 grid grid-cols-1 gap-2 rounded-lg border border-emerald-100 bg-white p-2 text-xs text-slate-600 sm:grid-cols-2">
                            {hop.geo && (
                              <div className="flex items-center truncate">
                                <Globe className="mr-1.5 h-3 w-3 flex-shrink-0 text-sky-600" />
                                <span className="truncate">
                                  {hop.geo.city || 'Cidade não identificada'}, {hop.geo.country || 'País não identificado'}
                                </span>
                              </div>
                            )}
                            {hop.asn && (
                              <div className="flex items-center truncate">
                                <Server className="mr-1.5 h-3 w-3 flex-shrink-0 text-emerald-600" />
                                <span className="truncate">{hop.asn.number} {hop.asn.org}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-3 flex items-center space-x-4 text-xs">
                          {hasLoss ? (
                            <span className="flex items-center rounded-lg border border-red-200 bg-red-50 px-2 py-1 font-medium text-red-600">
                              <AlertTriangle className="mr-1 h-3 w-3" />
                              {hop.loss}% Loss
                            </span>
                          ) : (
                            <span className="flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              0% Loss
                            </span>
                          )}
                          <span className="text-slate-500">
                            Enviados: {hop.sent} / Recv: {hop.recv}
                          </span>
                        </div>
                      </div>

                      <div className="flex w-full flex-1 flex-col justify-center lg:max-w-md">
                        <div className="mb-1 flex justify-between text-xs text-slate-500">
                          <span>Latência média</span>
                          <span className="font-mono text-emerald-700">{hop.avg.toFixed(1)} ms</span>
                        </div>
                        <div className="h-2.5 w-full rounded-full bg-emerald-100">
                          <div
                            className={`h-2.5 rounded-full ${hasLoss || isHighLatency ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                        <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                          <span>Best: {hop.best}ms</span>
                          <span>Worst: {hop.worst}ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {isSelected ? <HopDetails hop={hop} /> : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
