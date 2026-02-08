import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapPin, Phone, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Loja } from '@/types';

// Estilos do Leaflet
import 'leaflet/dist/leaflet.css';

interface MapaLojasProps {
  lojas: Loja[];
  centro?: { lat: number; lng: number };
  zoom?: number;
  height?: string;
  onLojaSelecionada?: (loja: Loja) => void;
}

// Centro padrão: Itabuna - BA
const defaultCenter = {
  lat: -14.7856,
  lng: -39.2833
};

export function MapaLojas({ 
  lojas, 
  centro = defaultCenter, 
  zoom = 14,
  height = '100%',
  onLojaSelecionada 
}: MapaLojasProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [lojaSelecionada, setLojaSelecionada] = useState<Loja | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Validar lojas com coordenadas
  const validLojas = useMemo(() => {
    return lojas.filter(loja => 
      loja.endereco?.latitude && 
      loja.endereco?.longitude &&
      !isNaN(loja.endereco.latitude) &&
      !isNaN(loja.endereco.longitude)
    );
  }, [lojas]);

  // Inicializar mapa
  useEffect(() => {
    if (!isClient || !mapContainerRef.current || mapInstanceRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      try {
        const L = await import('leaflet');
        
        if (!isMounted || !mapContainerRef.current) return;

        // Cria o mapa
        const map = L.map(mapContainerRef.current).setView([centro.lat, centro.lng], zoom);

        // Adiciona camada do OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(map);

        // Ícone personalizado para o usuário
        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `<div style="
            width: 20px; 
            height: 20px; 
            background: #10B981; 
            border: 3px solid white; 
            border-radius: 50%; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        // Ícone personalizado para lojas
        const storeIcon = L.divIcon({
          className: 'custom-store-marker',
          html: `<div style="
            width: 32px; 
            height: 32px; 
            background: #059669; 
            border: 2px solid white; 
            border-radius: 6px; 
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 14px;
          ">L</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        // Marcador do usuário
        L.marker([centro.lat, centro.lng], { icon: userIcon })
          .addTo(map)
          .bindPopup('Você está aqui');

        // Marcadores das lojas
        validLojas.forEach((loja) => {
          const marker = L.marker(
            [loja.endereco.latitude, loja.endereco.longitude], 
            { icon: storeIcon }
          ).addTo(map);

          const popupContent = `
            <div style="font-family: system-ui, sans-serif; min-width: 200px;">
              <h3 style="font-weight: bold; margin-bottom: 4px; color: #111;">${loja.nome}</h3>
              <p style="font-size: 12px; color: #666; margin-bottom: 8px;">
                ${loja.endereco.rua}, ${loja.endereco.numero}<br/>
                ${loja.endereco.bairro}
              </p>
            </div>
          `;

          marker.bindPopup(popupContent);
          marker.on('click', () => {
            setLojaSelecionada(loja);
            onLojaSelecionada?.(loja);
          });
        });

        mapInstanceRef.current = map;
        setIsMapLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar mapa:', error);
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient, centro.lat, centro.lng, zoom, validLojas, onLojaSelecionada]);

  // Atualiza o centro do mapa quando muda
  useEffect(() => {
    if (mapInstanceRef.current && isMapLoaded) {
      mapInstanceRef.current.setView([centro.lat, centro.lng], zoom);
    }
  }, [centro.lat, centro.lng, zoom, isMapLoaded]);

  const handleDirections = useCallback((loja: Loja) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${loja.endereco.latitude},${loja.endereco.longitude}`;
    window.open(url, '_blank');
  }, []);

  const handleWhatsApp = useCallback((loja: Loja) => {
    const mensagem = `Olá! Encontrei sua loja no ONDE COMPRAR e gostaria de mais informações.`;
    const url = `https://wa.me/${loja.whatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  }, []);

  const openGoogleMaps = useCallback(() => {
    if (validLojas.length === 1) {
      const loja = validLojas[0];
      window.open(`https://www.google.com/maps/search/?api=1&query=${loja.endereco.latitude},${loja.endereco.longitude}`, '_blank');
    } else if (validLojas.length > 1) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${centro.lat},${centro.lng}`, '_blank');
    }
  }, [validLojas, centro]);

  // Se não houver lojas válidas
  if (validLojas.length === 0) {
    return (
      <div 
        className="w-full bg-gray-100 rounded-xl flex items-center justify-center p-8"
        style={{ height }}
      >
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Nenhuma loja com localização disponível</p>
        </div>
      </div>
    );
  }

  // Evitar hydration mismatch - renderiza fallback no servidor
  if (!isClient) {
    return (
      <div 
        className="w-full bg-gray-100 rounded-xl flex items-center justify-center"
        style={{ height }}
      >
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden">
      {/* Container do Mapa */}
      <div 
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ minHeight: '300px' }}
      />

      {/* Loading */}
      {!isMapLoaded && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center z-50">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      )}

      {/* Legenda */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs z-[400]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-white shadow" />
          <span>Você está aqui</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-600 border-2 border-white shadow" />
          <span>Lojas parceiras</span>
        </div>
      </div>

      {/* Contador de lojas */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg px-3 py-2 text-xs z-[400]">
        <span className="font-medium text-emerald-600">{validLojas.length}</span>
        <span className="text-gray-600 ml-1">loja{validLojas.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Botão Google Maps */}
      <button
        onClick={openGoogleMaps}
        className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg shadow-lg text-xs font-medium flex items-center gap-2 z-[400] transition-colors"
      >
        <ExternalLink className="w-3 h-3" />
        Abrir no Google Maps
      </button>

      {/* Info da loja selecionada */}
      {lojaSelecionada && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg p-4 min-w-[280px] max-w-[90%] z-[400]">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-gray-900">{lojaSelecionada.nome}</h3>
            <button 
              onClick={() => setLojaSelecionada(null)}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            {lojaSelecionada.endereco.rua}, {lojaSelecionada.endereco.numero}<br />
            {lojaSelecionada.endereco.bairro}
          </p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <Phone className="w-3 h-3" />
            {lojaSelecionada.telefone}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleDirections(lojaSelecionada)}
            >
              <Navigation className="w-3 h-3 mr-1" />
              Rota
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 border-green-500 text-green-600 hover:bg-green-50"
              onClick={() => handleWhatsApp(lojaSelecionada)}
            >
              WhatsApp
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
