import { Activity, Globe, MapPin, Server, ShieldAlert } from 'lucide-react';
import { ResultBox } from '../ui/ResultBox';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const renderBlacklistStatus = (data: any) => {
  const reputation = data?.reputation;

  if (!reputation) {
    return <p className="text-slate-600">Sem dados de reputação disponíveis.</p>;
  }

  const spamhausZen = reputation.providers?.spamhausZen;
  const spamhausDbl = reputation.providers?.spamhausDbl;

  return (
    <div className="space-y-3">
      <div className={`rounded-xl border p-3 ${reputation.listed ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
        <p className={`font-semibold ${reputation.listed ? 'text-red-700' : 'text-emerald-700'}`}>
          {reputation.listed ? 'Há indício de blacklist em ao menos uma verificação.' : 'Nenhuma listagem detectada nas verificações aplicadas.'}
        </p>
      </div>

      {spamhausZen ? (
        <div className="space-y-1">
          <p><span className="font-semibold text-slate-700">Spamhaus ZEN:</span> {spamhausZen.supported ? (spamhausZen.listed ? 'Listado' : 'Não listado') : 'Consulta não suportada para este alvo'}</p>
          {spamhausZen.checkedValue ? <p><span className="font-semibold text-slate-700">IP verificado:</span> {spamhausZen.checkedValue}</p> : null}
          {spamhausZen.codes?.length ? <p><span className="font-semibold text-slate-700">Códigos:</span> {spamhausZen.codes.join(', ')}</p> : null}
        </div>
      ) : null}

      {spamhausDbl ? (
        <div className="space-y-1">
          <p><span className="font-semibold text-slate-700">Spamhaus DBL:</span> {spamhausDbl.listed ? 'Domínio listado' : 'Domínio não listado'}</p>
          <p><span className="font-semibold text-slate-700">Alvo verificado:</span> {spamhausDbl.checkedValue}</p>
        </div>
      ) : null}

      {reputation.resolvedAddresses?.length ? (
        <p><span className="font-semibold text-slate-700">IPs resolvidos:</span> {reputation.resolvedAddresses.join(', ')}</p>
      ) : null}
    </div>
  );
};

export const AnalysisResults = ({ isSearching, data }: any) => {
  if (isSearching) {
    return (
      <div className="bg-white border border-emerald-100 rounded-2xl p-8 flex items-center justify-center shadow-sm">
        <div className="flex flex-col items-center text-emerald-600">
          <Activity className="w-10 h-10 animate-pulse mb-4" />
          <span>Analisando alvo via servidor seguro...</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        <ResultBox title="Geolocalização" icon={Globe} iconColor="text-sky-600">
          <div className="space-y-2">
            <p><span className="font-semibold text-slate-700">País:</span> {data.country} ({data.countryCode})</p>
            <p><span className="font-semibold text-slate-700">Estado/Região:</span> {data.regionName} ({data.region})</p>
            <p><span className="font-semibold text-slate-700">Cidade:</span> {data.city}</p>
            <p><span className="font-semibold text-slate-700">Fuso horário:</span> {data.timezone}</p>
          </div>
        </ResultBox>

        <ResultBox title="ASN e Provedor" icon={Server} iconColor="text-emerald-600">
          <div className="space-y-2">
            <p><span className="font-semibold text-slate-700">ISP:</span> {data.isp}</p>
            <p><span className="font-semibold text-slate-700">Organização:</span> {data.org}</p>
            <p><span className="font-semibold text-slate-700">ASN:</span> {data.as}</p>
            <p><span className="font-semibold text-slate-700">AS Name:</span> {data.asname}</p>
          </div>
        </ResultBox>

        <ResultBox title="Riscos e Infraestrutura" icon={ShieldAlert} iconColor={data.proxy || data.hosting ? 'text-amber-500' : 'text-emerald-600'}>
          <div className="space-y-2">
            <p><span className="font-semibold text-slate-700">Tipo de conexão:</span> {data.mobile ? 'Mobile/Celular' : 'Banda larga/Datacenter'}</p>
            <p><span className="font-semibold text-slate-700">É Proxy/VPN?</span> {data.proxy ? 'Sim' : 'Não detectado'}</p>
            <p><span className="font-semibold text-slate-700">É Datacenter/Hosting?</span> {data.hosting ? 'Sim' : 'Não'}</p>
          </div>
        </ResultBox>

        <ResultBox title="Blacklist e Reputação" icon={ShieldAlert} iconColor={data.reputation?.listed ? 'text-red-600' : 'text-emerald-600'}>
          {renderBlacklistStatus(data)}
        </ResultBox>
      </div>

      <div className="bg-white border border-emerald-100 rounded-2xl overflow-hidden h-[400px] relative z-0 shadow-sm">
        <div className="absolute top-4 left-4 z-10 bg-white/95 p-3 border border-emerald-100 rounded-xl backdrop-blur-sm pointer-events-none">
          <h4 className="text-slate-900 font-semibold flex items-center mb-1">
            <MapPin className="w-4 h-4 mr-2 text-emerald-600" />
            Coordenadas estimadas
          </h4>
          <p className="text-xs text-slate-600">Lat: {data.lat}</p>
          <p className="text-xs text-slate-600">Lon: {data.lon}</p>
        </div>

        <MapContainer center={[data.lat, data.lon]} zoom={11} scrollWheelZoom className="w-full h-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            className="map-tiles-light"
          />
          <Marker position={[data.lat, data.lon]}>
            <Popup className="custom-popup">
              <div className="font-semibold text-slate-800">{data.city}, {data.region}</div>
              <div className="text-xs text-slate-600">{data.isp}</div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>

      <style>{`
        .map-tiles-light {
          filter: saturate(0.95) hue-rotate(-8deg) brightness(1.02);
        }
        .leaflet-container {
          background: #ecfdf5;
        }
      `}</style>
    </div>
  );
};
