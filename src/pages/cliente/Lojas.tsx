import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Store, 
  Phone, 
  Clock, 
  Navigation,
  Star,
  Search,
  ChevronRight,
  Package,
  Truck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MapaLojas } from '@/components/map/MapaLojas';
import { useProdutoStore } from '@/stores/produtoStore';
import type { Loja } from '@/types';

export function Lojas() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState('');
  const [lojaSelecionada, setLojaSelecionada] = useState<Loja | null>(null);
  const { produtos } = useProdutoStore();

  // Extrair lojas únicas dos produtos
  const lojas = useMemo(() => {
    const lojasMap = new Map<string, Loja>();
    produtos.forEach(produto => {
      if (!lojasMap.has(produto.loja.id)) {
        lojasMap.set(produto.loja.id, produto.loja);
      }
    });
    return Array.from(lojasMap.values());
  }, [produtos]);

  // Filtrar lojas pela busca
  const lojasFiltradas = useMemo(() => {
    if (!busca.trim()) return lojas;
    const termo = busca.toLowerCase();
    return lojas.filter(loja => 
      loja.nome.toLowerCase().includes(termo) ||
      loja.descricao?.toLowerCase().includes(termo) ||
      loja.endereco.bairro.toLowerCase().includes(termo)
    );
  }, [lojas, busca]);

  // Calcular centro do mapa baseado nas lojas
  const centroMapa = useMemo(() => {
    if (lojasFiltradas.length === 0) {
      return { lat: -14.7856, lng: -39.2833 }; // Centro de Itabuna
    }
    const lat = lojasFiltradas.reduce((sum, l) => sum + l.endereco.latitude, 0) / lojasFiltradas.length;
    const lng = lojasFiltradas.reduce((sum, l) => sum + l.endereco.longitude, 0) / lojasFiltradas.length;
    return { lat, lng };
  }, [lojasFiltradas]);

  const handleVerLoja = (lojaId: string) => {
    navigate(`/busca?loja=${lojaId}`);
  };

  const handleRota = (loja: Loja) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${loja.endereco.latitude},${loja.endereco.longitude}`;
    window.open(url, '_blank');
  };

  const handleWhatsApp = (loja: Loja) => {
    const mensagem = `Olá! Encontrei sua loja no ONDE COMPRAR e gostaria de mais informações.`;
    const url = `https://wa.me/${loja.whatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  // Contar produtos por loja
  const getQuantidadeProdutos = (lojaId: string) => {
    return produtos.filter(p => p.lojaId === lojaId).length;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da página */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lojas Parceiras</h1>
          <p className="text-gray-600">
            Encontre as melhores lojas de eletrônicos em Itabuna
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de Lojas */}
          <div className="lg:col-span-1 space-y-4">
            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar lojas..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Cards das Lojas */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {lojasFiltradas.map((loja) => (
                <Card
                  key={loja.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                    lojaSelecionada?.id === loja.id 
                      ? 'ring-2 ring-emerald-500 border-emerald-500' 
                      : ''
                  }`}
                  onClick={() => setLojaSelecionada(loja)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                      <Store className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{loja.nome}</h3>
                      <p className="text-sm text-gray-500 truncate">
                        {loja.endereco.bairro}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-xs text-yellow-500">
                          <Star className="w-3 h-3 fill-yellow-500" />
                          <span>4.8</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500">
                          {getQuantidadeProdutos(loja.id)} produtos
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t flex items-center gap-2 text-sm">
                    {loja.fazEntrega && (
                      <Badge variant="secondary" className="text-xs">
                        <Truck className="w-3 h-3 mr-1" />
                        Entrega
                      </Badge>
                    )}
                    {loja.fazRetirada && (
                      <Badge variant="secondary" className="text-xs">
                        <Package className="w-3 h-3 mr-1" />
                        Retirada
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}

              {lojasFiltradas.length === 0 && (
                <div className="text-center py-8">
                  <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Nenhuma loja encontrada</p>
                </div>
              )}
            </div>
          </div>

          {/* Mapa e Detalhes */}
          <div className="lg:col-span-2 space-y-4">
            {/* Mapa */}
            <Card className="overflow-hidden">
              <div className="h-[400px]">
                <MapaLojas
                  lojas={lojasFiltradas}
                  centro={lojaSelecionada ? {
                    lat: lojaSelecionada.endereco.latitude,
                    lng: lojaSelecionada.endereco.longitude
                  } : centroMapa}
                  zoom={lojaSelecionada ? 16 : 14}
                  onLojaSelecionada={setLojaSelecionada}
                />
              </div>
            </Card>

            {/* Detalhes da Loja Selecionada */}
            {lojaSelecionada ? (
              <Card className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Store className="w-8 h-8 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{lojaSelecionada.nome}</h2>
                      <p className="text-gray-600 mt-1">{lojaSelecionada.descricao}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="flex items-center gap-1 text-yellow-500">
                          <Star className="w-4 h-4 fill-yellow-500" />
                          4.8 (127 avaliações)
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-gray-500">{getQuantidadeProdutos(lojaSelecionada.id)} produtos</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Endereço</h4>
                      <p className="text-sm text-gray-600">
                        {lojaSelecionada.endereco.rua}, {lojaSelecionada.endereco.numero}
                        <br />
                        {lojaSelecionada.endereco.bairro}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Contato</h4>
                      <p className="text-sm text-gray-600">{lojaSelecionada.telefone}</p>
                      <p className="text-sm text-gray-600">{lojaSelecionada.email}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm">Funcionamento</h4>
                      <p className="text-sm text-gray-600">
                        Seg - Sex: 9h às 18h
                        <br />
                        Sáb: 10h às 14h
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => handleVerLoja(lojaSelecionada.id)}
                  >
                    <Package className="w-4 h-4 mr-2" />
                    Ver Produtos
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleRota(lojaSelecionada)}
                  >
                    <Navigation className="w-4 h-4 mr-2" />
                    Como Chegar
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-green-500 text-green-600 hover:bg-green-50"
                    onClick={() => handleWhatsApp(lojaSelecionada)}
                  >
                    Falar no WhatsApp
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center">
                <Store className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Selecione uma loja</h3>
                <p className="text-gray-500">
                  Clique em uma loja na lista ou no mapa para ver mais detalhes
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
