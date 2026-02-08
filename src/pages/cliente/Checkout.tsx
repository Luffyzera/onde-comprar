import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  MapPin, 
  Store, 
  Check, 
  Lock,
  ChevronLeft,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cartStore';

export function Checkout() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState<'endereco' | 'pagamento' | 'confirmacao'>('endereco');
  const [formaPagamento, setFormaPagamento] = useState<'cartao' | 'pix'>('cartao');
  const [isProcessando, setIsProcessando] = useState(false);

  const { itens, tipoEntrega, taxaEntrega, getSubtotal, getTotal, limparCarrinho } = useCartStore();

  const subtotal = getSubtotal();
  const total = getTotal();

  const handleFinalizarPedido = async () => {
    setIsProcessando(true);
    
    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessando(false);
    setEtapa('confirmacao');
    limparCarrinho();
    
    toast.success('Pedido realizado com sucesso!');
  };

  if (itens.length === 0 && etapa !== 'confirmacao') {
    navigate('/carrinho');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <button 
            onClick={() => navigate('/carrinho')}
            className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar ao Carrinho
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Progresso */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${etapa === 'endereco' ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                etapa === 'endereco' ? 'bg-emerald-600 text-white' : 'bg-gray-200'
              }`}>
                <MapPin className="w-4 h-4" />
              </div>
              <span className="ml-2 font-medium hidden sm:block">Endereço</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div className={`h-full bg-emerald-600 transition-all ${
                etapa === 'pagamento' || etapa === 'confirmacao' ? 'w-full' : 'w-0'
              }`} />
            </div>
            <div className={`flex items-center ${etapa === 'pagamento' ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                etapa === 'pagamento' ? 'bg-emerald-600 text-white' : 'bg-gray-200'
              }`}>
                <CreditCard className="w-4 h-4" />
              </div>
              <span className="ml-2 font-medium hidden sm:block">Pagamento</span>
            </div>
            <div className="flex-1 h-1 mx-4 bg-gray-200">
              <div className={`h-full bg-emerald-600 transition-all ${
                etapa === 'confirmacao' ? 'w-full' : 'w-0'
              }`} />
            </div>
            <div className={`flex items-center ${etapa === 'confirmacao' ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                etapa === 'confirmacao' ? 'bg-emerald-600 text-white' : 'bg-gray-200'
              }`}>
                <Check className="w-4 h-4" />
              </div>
              <span className="ml-2 font-medium hidden sm:block">Confirmação</span>
            </div>
          </div>
        </div>

        {etapa === 'endereco' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">
                  {tipoEntrega === 'entrega' ? 'Endereço de Entrega' : 'Endereço da Loja'}
                </h2>

                {tipoEntrega === 'entrega' ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label>CEP</Label>
                        <Input placeholder="00000-000" />
                      </div>
                      <div className="col-span-2">
                        <Label>Rua</Label>
                        <Input placeholder="Nome da rua" />
                      </div>
                      <div>
                        <Label>Número</Label>
                        <Input placeholder="123" />
                      </div>
                      <div>
                        <Label>Complemento</Label>
                        <Input placeholder="Apto, bloco..." />
                      </div>
                      <div>
                        <Label>Bairro</Label>
                        <Input placeholder="Bairro" />
                      </div>
                      <div>
                        <Label>Cidade</Label>
                        <Input placeholder="Cidade" />
                      </div>
                      <div>
                        <Label>Estado</Label>
                        <Input placeholder="UF" maxLength={2} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <Store className="w-6 h-6 text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold">{itens[0]?.produto.loja.nome}</h3>
                        <p className="text-gray-600 mt-1">
                          {itens[0]?.produto.loja.endereco.rua}, {itens[0]?.produto.loja.endereco.numero}
                        </p>
                        <p className="text-gray-600">
                          {itens[0]?.produto.loja.endereco.bairro}
                        </p>
                        <p className="text-gray-600">
                          {itens[0]?.produto.loja.endereco.cidade} - {itens[0]?.produto.loja.endereco.estado}
                        </p>
                        <Badge className="mt-3 bg-blue-100 text-blue-700">
                          Retirada em até 24h
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setEtapa('pagamento')}
                >
                  Continuar
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {etapa === 'pagamento' && (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-6">Forma de Pagamento</h2>

                {tipoEntrega === 'retirada' ? (
                  <div className="bg-amber-50 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-3">
                      <Store className="w-6 h-6 text-amber-600 mt-1" />
                      <div>
                        <h3 className="font-semibold">Pagamento na Loja</h3>
                        <p className="text-gray-600 mt-1">
                          Você pagará diretamente na loja ao retirar o produto.
                          Aceitamos dinheiro, PIX ou cartão.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Tabs value={formaPagamento} onValueChange={(v) => setFormaPagamento(v as 'cartao' | 'pix')}>
                    <TabsList className="w-full">
                      <TabsTrigger value="cartao" className="flex-1">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Cartão
                      </TabsTrigger>
                      <TabsTrigger value="pix" className="flex-1">
                        <QrCode className="w-4 h-4 mr-2" />
                        PIX
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="cartao" className="mt-6">
                      <div className="space-y-4">
                        <div>
                          <Label>Número do Cartão</Label>
                          <Input placeholder="0000 0000 0000 0000" />
                        </div>
                        <div>
                          <Label>Nome no Cartão</Label>
                          <Input placeholder="Como aparece no cartão" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Validade</Label>
                            <Input placeholder="MM/AA" />
                          </div>
                          <div>
                            <Label>CVV</Label>
                            <Input placeholder="123" />
                          </div>
                        </div>
                        <div>
                          <Label>Parcelas</Label>
                          <select className="w-full p-2 border rounded-lg">
                            <option>1x de {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} (à vista)</option>
                            <option>2x de {(total / 2).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</option>
                            <option>3x de {(total / 3).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</option>
                            <option>6x de {(total / 6).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</option>
                            <option>12x de {(total / 12).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</option>
                          </select>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="pix" className="mt-6">
                      <div className="text-center py-8">
                        <div className="w-48 h-48 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-4">
                          <QrCode className="w-24 h-24 text-gray-400" />
                        </div>
                        <p className="text-gray-600">
                          Escaneie o QR Code com seu app bancário
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}

                {/* Resumo */}
                <div className="bg-gray-50 rounded-xl p-4 mt-6">
                  <h4 className="font-semibold mb-3">Resumo</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span>{subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                    {tipoEntrega === 'entrega' && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Entrega</span>
                        <span>{taxaEntrega.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-emerald-600">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button 
                    variant="outline"
                    onClick={() => setEtapa('endereco')}
                  >
                    Voltar
                  </Button>
                  <Button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                    onClick={handleFinalizarPedido}
                    disabled={isProcessando}
                  >
                    {isProcessando ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4 mr-2" />
                        {tipoEntrega === 'retirada' ? 'Confirmar Reserva' : 'Pagar Agora'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {etapa === 'confirmacao' && (
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
              <Check className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {tipoEntrega === 'retirada' ? 'Reserva Confirmada!' : 'Pedido Realizado!'}
            </h2>
            <p className="text-gray-600 mb-8">
              {tipoEntrega === 'retirada' 
                ? 'Seu produto foi reservado. Você tem até 24h para retirá-lo na loja.'
                : 'Seu pagamento foi confirmado. A loja preparará seu pedido para entrega.'
              }
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
              <p className="text-sm text-gray-500 mb-2">Número do Pedido</p>
              <p className="text-2xl font-bold text-gray-900">#PED-2025-001234</p>
              
              {tipoEntrega === 'retirada' && (
                <div className="mt-4 p-4 bg-blue-100 rounded-lg">
                  <p className="text-sm text-blue-700 font-medium">Código de Retirada</p>
                  <p className="text-3xl font-bold text-blue-900 tracking-wider">RET-784521</p>
                  <p className="text-xs text-blue-600 mt-2">
                    Apresente este código na loja
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => navigate('/meus-pedidos')}
              >
                Acompanhar Pedido
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
              >
                Continuar Comprando
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
