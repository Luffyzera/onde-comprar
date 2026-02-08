import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  Store, 
  ChevronRight, 
  Clock,
  CheckCircle,
  MapPin,
  MessageCircle,
  Star,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Dados mock de pedidos
const pedidosMock = [
  {
    id: 'PED-2025-001234',
    data: '2025-02-05',
    status: 'pronto_retirada',
    tipo: 'retirada',
    loja: {
      nome: 'TechStore Centro',
      endereco: 'Rua da Consolação, 1234'
    },
    itens: [
      { nome: 'iPhone 15 Pro Max 256GB', quantidade: 1, preco: 8499.00 }
    ],
    total: 8499.00,
    codigoRetirada: 'RET-784521',
    dataExpiracao: '2025-02-06T18:00:00'
  },
  {
    id: 'PED-2025-001198',
    data: '2025-02-03',
    status: 'enviado',
    tipo: 'entrega',
    loja: {
      nome: 'EletroPlus',
      endereco: 'Av. Paulista, 1578'
    },
    itens: [
      { nome: 'AirPods Pro 2ª Geração', quantidade: 1, preco: 1899.00 }
    ],
    total: 1914.00,
    taxaEntrega: 15.00,
    entregador: {
      nome: 'João Silva',
      telefone: '11999998888'
    }
  },
  {
    id: 'PED-2025-001156',
    data: '2025-02-01',
    status: 'concluido',
    tipo: 'entrega',
    loja: {
      nome: 'TechStore Centro',
      endereco: 'Rua da Consolação, 1234'
    },
    itens: [
      { nome: 'Carregador Anker 65W GaN', quantidade: 2, preco: 299.00 }
    ],
    total: 598.00,
    avaliado: false
  },
  {
    id: 'PED-2025-001089',
    data: '2025-01-28',
    status: 'concluido',
    tipo: 'retirada',
    loja: {
      nome: 'EletroPlus',
      endereco: 'Av. Paulista, 1578'
    },
    itens: [
      { nome: 'Sony WH-1000XM5', quantidade: 1, preco: 2199.00 }
    ],
    total: 2199.00,
    avaliado: true
  }
];

const statusConfig: Record<string, { label: string; cor: string; icone: any }> = {
  pendente: { label: 'Pendente', cor: 'bg-yellow-100 text-yellow-700', icone: Clock },
  pago: { label: 'Pago', cor: 'bg-blue-100 text-blue-700', icone: CheckCircle },
  confirmado: { label: 'Confirmado', cor: 'bg-blue-100 text-blue-700', icone: CheckCircle },
  em_preparo: { label: 'Em Preparo', cor: 'bg-purple-100 text-purple-700', icone: Package },
  enviado: { label: 'Enviado', cor: 'bg-orange-100 text-orange-700', icone: Truck },
  entregue: { label: 'Entregue', cor: 'bg-green-100 text-green-700', icone: CheckCircle },
  concluido: { label: 'Concluído', cor: 'bg-green-100 text-green-700', icone: CheckCircle },
  reservado: { label: 'Reservado', cor: 'bg-blue-100 text-blue-700', icone: Store },
  pronto_retirada: { label: 'Pronto para Retirada', cor: 'bg-emerald-100 text-emerald-700', icone: Store },
  cancelado: { label: 'Cancelado', cor: 'bg-red-100 text-red-700', icone: Clock },
};

export function MeusPedidos() {
  const [qrCodeAberto, setQrCodeAberto] = useState<string | null>(null);

  const getStatusConfig = (status: string) => {
    return statusConfig[status] || { label: status, cor: 'bg-gray-100 text-gray-700', icone: Clock };
  };

  const renderPedido = (pedido: typeof pedidosMock[0]) => {
    const status = getStatusConfig(pedido.status);
    const StatusIcon = status.icone;

    return (
      <Card key={pedido.id} className="mb-4">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-bold text-gray-900">{pedido.id}</span>
                <Badge className={status.cor}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-500">
                {new Date(pedido.data).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg text-emerald-600">
                {pedido.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>

          {/* Loja */}
          <div className="flex items-center gap-2 mb-4 text-sm">
            <Store className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{pedido.loja.nome}</span>
            <span className="text-gray-400">•</span>
            <MapPin className="w-4 h-4 text-gray-400" />
            <span className="text-gray-500">{pedido.loja.endereco}</span>
          </div>

          {/* Itens */}
          <div className="space-y-2 mb-4">
            {pedido.itens.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.quantidade}x {item.nome}
                </span>
                <span className="font-medium">
                  {(item.preco * item.quantidade).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            ))}
          </div>

          {/* Ações específicas */}
          {pedido.tipo === 'retirada' && pedido.status === 'pronto_retirada' && (
            <div className="bg-emerald-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-700 font-medium">Código de Retirada</p>
                  <p className="text-2xl font-bold text-emerald-900 tracking-wider">
                    {pedido.codigoRetirada}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">
                    Válido até {new Date(pedido.dataExpiracao!).toLocaleString('pt-BR')}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setQrCodeAberto(pedido.codigoRetirada!)}
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Ver QR Code
                </Button>
              </div>
            </div>
          )}

          {pedido.tipo === 'entrega' && pedido.status === 'enviado' && (
            <div className="bg-orange-50 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">Pedido a caminho</p>
                  <p className="text-sm text-orange-700">
                    Entregador: {pedido.entregador?.nome} • 
                    <a href={`tel:${pedido.entregador?.telefone}`} className="underline ml-1">
                      {pedido.entregador?.telefone}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2">
            <Link to={`/pedido/${pedido.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                Ver Detalhes
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            
            {pedido.status === 'concluido' && !pedido.avaliado && (
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Star className="w-4 h-4 mr-2" />
                Avaliar
              </Button>
            )}
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                const mensagem = `Olá! Gostaria de informações sobre o pedido ${pedido.id}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(mensagem)}`, '_blank');
              }}
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const pedidosAtivos = pedidosMock.filter(p => 
    !['concluido', 'cancelado'].includes(p.status)
  );
  
  const pedidosConcluidos = pedidosMock.filter(p => 
    ['concluido', 'cancelado'].includes(p.status)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Meus Pedidos</h1>

        <Tabs defaultValue="ativos">
          <TabsList className="w-full">
            <TabsTrigger value="ativos" className="flex-1">
              Em Andamento ({pedidosAtivos.length})
            </TabsTrigger>
            <TabsTrigger value="concluidos" className="flex-1">
              Concluídos ({pedidosConcluidos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ativos" className="mt-6">
            {pedidosAtivos.length > 0 ? (
              pedidosAtivos.map(renderPedido)
            ) : (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Nenhum pedido em andamento</h3>
                <p className="text-gray-500">Seus pedidos ativos aparecerão aqui</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="concluidos" className="mt-6">
            {pedidosConcluidos.length > 0 ? (
              pedidosConcluidos.map(renderPedido)
            ) : (
              <div className="text-center py-16">
                <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Nenhum pedido concluído</h3>
                <p className="text-gray-500">Seu histórico de pedidos aparecerá aqui</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog QR Code */}
      <Dialog open={!!qrCodeAberto} onOpenChange={() => setQrCodeAberto(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Código de Retirada</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-64 h-64 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <QrCode className="w-48 h-48 text-gray-800" />
            </div>
            <p className="text-2xl font-bold tracking-wider">{qrCodeAberto}</p>
            <p className="text-sm text-gray-500 mt-2">
              Apresente este código na loja para retirar seu pedido
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
