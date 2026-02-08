import { Link } from 'react-router-dom';
import { MapPin, Truck, Store, Heart, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Produto } from '@/types';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

interface ProdutoCardProps {
  produto: Produto;
  mostrarDistancia?: boolean;
  distanciaKm?: number;
}

export function ProdutoCard({ produto, mostrarDistancia = false, distanciaKm }: ProdutoCardProps) {
  const { isAuthenticated } = useAuthStore();
  const { adicionarItem, podeAdicionar } = useCartStore();

  const precoAtual = produto.precoPromocional || produto.preco;
  const temDesconto = !!produto.precoPromocional;
  const percentualDesconto = temDesconto 
    ? Math.round(((produto.preco - produto.precoPromocional!) / produto.preco) * 100)
    : 0;

  const handleAdicionarCarrinho = (e: React.MouseEvent, tipoEntrega: 'entrega' | 'retirada') => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated()) {
      toast.error('Faça login para adicionar ao carrinho');
      return;
    }

    const validacao = podeAdicionar(produto);
    if (!validacao.valido) {
      toast.error(validacao.mensagem);
      return;
    }

    adicionarItem(produto, 1, tipoEntrega);
    toast.success(`${produto.nome} adicionado ao carrinho!`);
  };

  const handleWhatsApp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const mensagem = `Olá! Vi o produto *${produto.nome}* no ONDE COMPRAR e gostaria de mais informações.`;
    const url = `https://wa.me/${produto.loja.whatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-md">
      <Link to={`/produto/${produto.id}`}>
        {/* Imagem */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img
            src={produto.imagens[0]}
            alt={produto.nome}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {temDesconto && (
              <Badge className="bg-red-500 text-white font-bold">
                -{percentualDesconto}%
              </Badge>
            )}
            {produto.tipoOperacao === 'venda_online' && (
              <Badge className="bg-emerald-500 text-white">
                <Truck className="w-3 h-3 mr-1" />
                Entrega
              </Badge>
            )}
            {produto.tipoOperacao === 'reserva_retirada' && (
              <Badge className="bg-blue-500 text-white">
                <Store className="w-3 h-3 mr-1" />
                Retirada
              </Badge>
            )}
            {produto.tipoOperacao === 'ambos' && (
              <Badge className="bg-purple-500 text-white">
                Entrega + Retirada
              </Badge>
            )}
          </div>

          {/* Favorito */}
          <button 
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toast.success('Adicionado aos favoritos!');
            }}
          >
            <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
          </button>

          {/* Estoque baixo */}
          {produto.estoqueDisponivel <= 3 && produto.estoqueDisponivel > 0 && (
            <div className="absolute bottom-0 left-0 right-0 bg-orange-500 text-white text-xs py-1.5 text-center font-medium">
              Apenas {produto.estoqueDisponivel} unidades
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <CardContent className="p-4">
          {/* Loja */}
          <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            <Store className="w-3 h-3" />
            <span className="truncate">{produto.loja.nome}</span>
            {mostrarDistancia && distanciaKm !== undefined && (
              <>
                <span className="mx-1">•</span>
                <MapPin className="w-3 h-3" />
                <span>{distanciaKm.toFixed(1)} km</span>
              </>
            )}
          </div>

          {/* Nome */}
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
            {produto.nome}
          </h3>

          {/* Preço */}
          <div className="mb-3">
            {temDesconto && (
              <p className="text-sm text-gray-400 line-through">
                {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            )}
            <p className="text-xl font-bold text-emerald-600">
              {precoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          {/* Ações */}
          <div className="space-y-2">
            {produto.tipoOperacao !== 'reserva_retirada' && produto.loja.fazEntrega && (
              <Button
                size="sm"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={(e) => handleAdicionarCarrinho(e, 'entrega')}
              >
                <Truck className="w-4 h-4 mr-2" />
                Entregar
              </Button>
            )}
            
            {produto.tipoOperacao !== 'venda_online' && produto.loja.fazRetirada && (
              <Button
                size="sm"
                variant="outline"
                className="w-full border-blue-500 text-blue-600 hover:bg-blue-50"
                onClick={(e) => handleAdicionarCarrinho(e, 'retirada')}
              >
                <Store className="w-4 h-4 mr-2" />
                Retirar na Loja
              </Button>
            )}

            <Button
              size="sm"
              variant="ghost"
              className="w-full text-gray-600 hover:text-green-600 hover:bg-green-50"
              onClick={handleWhatsApp}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
