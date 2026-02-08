import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  MapPin, 
  Store, 
  Truck, 
  Trash2, 
  Plus, 
  Minus, 
  ChevronRight,
  AlertCircle,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cartStore';
import { useAuthStore } from '@/stores/authStore';

export function Carrinho() {
  const navigate = useNavigate();
  
  const { 
    itens, 
    tipoEntrega, 
    taxaEntrega,
    getSubtotal, 
    getTotal, 
    getQuantidadeTotal,
    atualizarQuantidade, 
    removerItem, 
    limparCarrinho,
    setTipoEntrega
  } = useCartStore();
  
  const { isAuthenticated } = useAuthStore();

  const subtotal = getSubtotal();
  const total = getTotal();
  const quantidadeTotal = getQuantidadeTotal();

  const handleFinalizarCompra = () => {
    if (!isAuthenticated()) {
      toast.error('Faça login para continuar');
      navigate('/login', { state: { from: '/carrinho' } });
      return;
    }
    
    navigate('/checkout');
  };

  if (itens.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Seu carrinho está vazio
            </h2>
            <p className="text-gray-600 mb-6">
              Adicione produtos para começar a comprar
            </p>
            <Link to="/">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Agrupar itens por loja
  const itensPorLoja = new Map();
  itens.forEach(item => {
    const lojaId = item.produto.lojaId;
    if (!itensPorLoja.has(lojaId)) {
      itensPorLoja.set(lojaId, {
        loja: item.produto.loja,
        itens: []
      });
    }
    itensPorLoja.get(lojaId).itens.push(item);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Meu Carrinho</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Itens */}
          <div className="lg:col-span-2 space-y-6">
            {Array.from(itensPorLoja.entries()).map(([lojaId, { loja, itens: itensLoja }]) => (
              <Card key={lojaId}>
                <CardContent className="p-6">
                  {/* Header da Loja */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                      <Store className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{loja.nome}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        2.5 km de distância
                      </p>
                    </div>
                  </div>

                  {/* Tipo de Entrega */}
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Como deseja receber:</p>
                    <div className="flex gap-3">
                      {loja.fazEntrega && (
                        <button
                          onClick={() => setTipoEntrega('entrega')}
                          className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${
                            tipoEntrega === 'entrega'
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 hover:border-emerald-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Truck className={`w-5 h-5 ${tipoEntrega === 'entrega' ? 'text-emerald-600' : 'text-gray-400'}`} />
                            <span className="font-medium">Entrega</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {loja.tempoEntregaMin}-{loja.tempoEntregaMax} min
                          </p>
                          <p className="text-sm font-medium text-emerald-600 mt-1">
                            + {loja.taxaEntrega.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </button>
                      )}
                      
                      {loja.fazRetirada && (
                        <button
                          onClick={() => setTipoEntrega('retirada')}
                          className={`flex-1 p-3 rounded-lg border-2 text-left transition-all ${
                            tipoEntrega === 'retirada'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-blue-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Store className={`w-5 h-5 ${tipoEntrega === 'retirada' ? 'text-blue-600' : 'text-gray-400'}`} />
                            <span className="font-medium">Retirada</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Reserve e retire em 24h
                          </p>
                          <p className="text-sm font-medium text-blue-600 mt-1">
                            Grátis
                          </p>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Itens */}
                  <div className="space-y-4">
                    {itensLoja.map((item: typeof itens[0]) => (
                      <div key={item.produtoId} className="flex gap-4">
                        <img
                          src={item.produto.imagens[0]}
                          alt={item.produto.nome}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <Link 
                            to={`/produto/${item.produtoId}`}
                            className="font-medium hover:text-emerald-600 transition-colors"
                          >
                            {item.produto.nome}
                          </Link>
                          <p className="text-sm text-gray-500">
                            {(item.produto.precoPromocional || item.produto.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                          
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border rounded-lg">
                              <button
                                onClick={() => atualizarQuantidade(item.produtoId, item.quantidade - 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                                disabled={item.quantidade <= 1}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="w-10 text-center text-sm">{item.quantidade}</span>
                              <button
                                onClick={() => atualizarQuantidade(item.produtoId, item.quantidade + 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100"
                                disabled={item.quantidade >= item.produto.estoqueDisponivel}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            
                            <button
                              onClick={() => {
                                removerItem(item.produtoId);
                                toast.success('Item removido do carrinho');
                              }}
                              className="text-red-500 hover:text-red-600 p-2"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button 
              variant="ghost" 
              onClick={limparCarrinho}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Carrinho
            </Button>
          </div>

          {/* Resumo */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Resumo do Pedido</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({quantidadeTotal} {quantidadeTotal === 1 ? 'item' : 'itens'})</span>
                    <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  
                  {tipoEntrega === 'entrega' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxa de entrega</span>
                      <span>{taxaEntrega.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-emerald-600">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                </div>

                {tipoEntrega === 'entrega' ? (
                  <div className="mt-4 p-3 bg-emerald-50 rounded-lg text-sm">
                    <p className="flex items-center gap-2 text-emerald-700">
                      <Truck className="w-4 h-4" />
                      Entrega em até 2h
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm">
                    <p className="flex items-center gap-2 text-blue-700">
                      <Store className="w-4 h-4" />
                      Retirada em até 24h
                    </p>
                  </div>
                )}

                <Button 
                  className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700"
                  size="lg"
                  onClick={handleFinalizarCompra}
                >
                  Finalizar Compra
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>

                <Link to="/">
                  <Button 
                    variant="outline" 
                    className="w-full mt-3"
                  >
                    Continuar Comprando
                  </Button>
                </Link>

                <div className="mt-6 space-y-2 text-xs text-gray-500">
                  <p className="flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Produtos sujeitos à disponibilidade de estoque
                  </p>
                  <p className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Política de cancelamento na página do produto
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
