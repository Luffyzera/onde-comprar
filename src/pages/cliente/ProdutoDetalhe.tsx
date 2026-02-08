import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Store, 
  Truck, 
  MessageCircle, 
  ChevronLeft,
  Star,
  Clock,
  Shield,
  Check,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useProdutoStore } from '@/stores/produtoStore';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';
import { MapaLojas } from '@/components/map/MapaLojas';

export function ProdutoDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quantidade, setQuantidade] = useState(1);
  const [tipoEntrega, setTipoEntrega] = useState<'entrega' | 'retirada'>('retirada');
  const [imagemAtual, setImagemAtual] = useState(0);

  const { produtos, setProdutoSelecionado } = useProdutoStore();
  const { isAuthenticated } = useAuthStore();
  const { adicionarItem, podeAdicionar } = useCartStore();

  const produto = produtos.find(p => p.id === id);

  useEffect(() => {
    if (produto) {
      setProdutoSelecionado(produto);
      // Definir tipo de entrega padrão baseado no produto
      if (produto.tipoOperacao === 'venda_online') {
        setTipoEntrega('entrega');
      } else if (produto.tipoOperacao === 'reserva_retirada') {
        setTipoEntrega('retirada');
      }
    }
    return () => setProdutoSelecionado(null);
  }, [produto, setProdutoSelecionado]);

  if (!produto) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Produto não encontrado</h2>
          <Button onClick={() => navigate('/')} variant="outline">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Voltar para Home
          </Button>
        </div>
      </div>
    );
  }

  const precoAtual = produto.precoPromocional || produto.preco;
  const temDesconto = !!produto.precoPromocional;
  const percentualDesconto = temDesconto 
    ? Math.round(((produto.preco - produto.precoPromocional!) / produto.preco) * 100)
    : 0;

  const handleAdicionarCarrinho = () => {
    if (!isAuthenticated()) {
      toast.error('Faça login para adicionar ao carrinho');
      navigate('/login');
      return;
    }

    const validacao = podeAdicionar(produto);
    if (!validacao.valido) {
      toast.error(validacao.mensagem);
      return;
    }

    adicionarItem(produto, quantidade, tipoEntrega);
    toast.success(`${produto.nome} adicionado ao carrinho!`);
  };

  const handleComprarAgora = () => {
    handleAdicionarCarrinho();
    navigate('/carrinho');
  };

  const handleWhatsApp = () => {
    const mensagem = `Olá! Vi o produto *${produto.nome}* no ONDE COMPRAR e gostaria de mais informações.`;
    const url = `https://wa.me/${produto.loja.whatsapp}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, '_blank');
  };

  const taxaEntrega = tipoEntrega === 'entrega' ? produto.loja.taxaEntrega : 0;
  const total = (precoAtual * quantidade) + taxaEntrega;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-emerald-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Voltar
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Imagens */}
          <div className="space-y-4">
            <div className="aspect-square bg-white rounded-2xl overflow-hidden shadow-sm">
              <img
                src={produto.imagens[imagemAtual]}
                alt={produto.nome}
                className="w-full h-full object-cover"
              />
            </div>
            {produto.imagens.length > 1 && (
              <div className="flex gap-2">
                {produto.imagens.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setImagemAtual(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      imagemAtual === idx ? 'border-emerald-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt={`${produto.nome} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informações */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{produto.categoria.nome}</Badge>
                {temDesconto && (
                  <Badge className="bg-red-500">-{percentualDesconto}%</Badge>
                )}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                {produto.nome}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Store className="w-4 h-4" />
                  {produto.loja.nome}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  2.5 km
                </span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span>4.8</span>
                  <span className="text-gray-400">(127 avaliações)</span>
                </div>
              </div>
            </div>

            {/* Preço */}
            <div className="bg-gray-100 rounded-xl p-6">
              {temDesconto && (
                <p className="text-lg text-gray-500 line-through mb-1">
                  {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              )}
              <p className="text-4xl font-bold text-emerald-600">
                {precoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Em até 12x de {(precoAtual / 12).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} sem juros
              </p>
            </div>

            {/* Tipo de Entrega */}
            {(produto.tipoOperacao === 'ambos' || produto.tipoOperacao === 'venda_online') && produto.loja.fazEntrega && (
              <div 
                onClick={() => setTipoEntrega('entrega')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  tipoEntrega === 'entrega' 
                    ? 'border-emerald-500 bg-emerald-50' 
                    : 'border-gray-200 hover:border-emerald-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tipoEntrega === 'entrega' ? 'bg-emerald-500' : 'bg-gray-200'
                  }`}>
                    <Truck className={`w-5 h-5 ${tipoEntrega === 'entrega' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Entrega em Casa</h4>
                      {tipoEntrega === 'entrega' && <Check className="w-5 h-5 text-emerald-500" />}
                    </div>
                    <p className="text-sm text-gray-600">
                      {produto.loja.tempoEntregaMin}-{produto.loja.tempoEntregaMax} min • 
                      Taxa: {produto.loja.taxaEntrega.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {(produto.tipoOperacao === 'ambos' || produto.tipoOperacao === 'reserva_retirada') && produto.loja.fazRetirada && (
              <div 
                onClick={() => setTipoEntrega('retirada')}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  tipoEntrega === 'retirada' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    tipoEntrega === 'retirada' ? 'bg-blue-500' : 'bg-gray-200'
                  }`}>
                    <Store className={`w-5 h-5 ${tipoEntrega === 'retirada' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Retirada na Loja</h4>
                      {tipoEntrega === 'retirada' && <Check className="w-5 h-5 text-blue-500" />}
                    </div>
                    <p className="text-sm text-gray-600">
                      Grátis • Reserve e retire em até 24h
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {produto.loja.endereco.rua}, {produto.loja.endereco.numero}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Quantidade */}
            <div className="flex items-center gap-4">
              <span className="font-medium">Quantidade:</span>
              <div className="flex items-center border rounded-lg">
                <button
                  onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                  disabled={quantidade <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantidade}</span>
                <button
                  onClick={() => setQuantidade(Math.min(produto.estoqueDisponivel, quantidade + 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100"
                  disabled={quantidade >= produto.estoqueDisponivel}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <span className="text-sm text-gray-500">
                {produto.estoqueDisponivel} disponíveis
              </span>
            </div>

            {/* Total */}
            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total:</span>
                <span className="text-2xl font-bold text-emerald-600">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              {tipoEntrega === 'entrega' && (
                <p className="text-sm text-gray-500 mt-1">
                  (inclui taxa de entrega)
                </p>
              )}
            </div>

            {/* Ações */}
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                onClick={handleComprarAgora}
              >
                {tipoEntrega === 'entrega' ? 'Comprar Agora' : 'Reservar para Retirar'}
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="w-full"
                onClick={handleAdicionarCarrinho}
              >
                Adicionar ao Carrinho
              </Button>
              <Button 
                size="lg" 
                variant="ghost" 
                className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                onClick={handleWhatsApp}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Falar no WhatsApp
              </Button>
            </div>

            {/* Benefícios */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="w-4 h-4 text-emerald-500" />
                Garantia do lojista
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4 text-emerald-500" />
                Entrega rápida
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Check className="w-4 h-4 text-emerald-500" />
                Produto original
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Store className="w-4 h-4 text-emerald-500" />
                Loja verificada
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="descricao">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="descricao">Descrição</TabsTrigger>
              <TabsTrigger value="loja">Sobre a Loja</TabsTrigger>
              <TabsTrigger value="localizacao">Localização</TabsTrigger>
              <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="descricao" className="mt-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Descrição do Produto</h3>
                <p className="text-gray-600 leading-relaxed">
                  {produto.descricao}
                </p>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Marca</p>
                    <p className="font-medium">Original</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Modelo</p>
                    <p className="font-medium">2024</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Garantia</p>
                    <p className="font-medium">12 meses</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg text-center">
                    <p className="text-sm text-gray-500">Estoque</p>
                    <p className="font-medium">{produto.estoqueDisponivel} unidades</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="loja" className="mt-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Store className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{produto.loja.nome}</h3>
                    <p className="text-gray-600">{produto.loja.descricao}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        4.8 (127 avaliações)
                      </span>
                      <span>•</span>
                      <span>500+ vendas</span>
                    </div>
                  </div>
                </div>
                <Separator className="my-6" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Endereço</h4>
                    <p className="text-sm text-gray-600">
                      {produto.loja.endereco.rua}, {produto.loja.endereco.numero}
                      <br />
                      {produto.loja.endereco.bairro}
                      <br />
                      {produto.loja.endereco.cidade} - {produto.loja.endereco.estado}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Contato</h4>
                    <p className="text-sm text-gray-600">
                      {produto.loja.telefone}
                      <br />
                      {produto.loja.email}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Horário de Funcionamento</h4>
                    <p className="text-sm text-gray-600">
                      Seg - Sex: 9h às 18h
                      <br />
                      Sáb: 10h às 14h
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="localizacao" className="mt-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold mb-4">Localização da Loja</h3>
                <div className="h-[400px] rounded-xl overflow-hidden">
                  <MapaLojas 
                    lojas={[produto.loja]} 
                    centro={{
                      lat: produto.loja.endereco.latitude,
                      lng: produto.loja.endereco.longitude
                    }}
                    zoom={16}
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="avaliacoes" className="mt-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold">Avaliações dos Clientes</h3>
                  <Button variant="outline">Escrever Avaliação</Button>
                </div>
                <div className="text-center py-12">
                  <Star className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhuma avaliação ainda. Seja o primeiro!</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
