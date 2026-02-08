import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Search,
  Package,
  Truck,
  Store,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  MessageCircle,
  ChevronDown,
  QrCode
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// Dados mock de pedidos
const pedidosMock = [
  {
    id: 'PED-001234',
    cliente: { nome: 'João Silva', telefone: '11999998888' },
    itens: [{ nome: 'iPhone 15 Pro Max 256GB', quantidade: 1, preco: 8499.00 }],
    total: 8499.00,
    taxaEntrega: 15.00,
    tipo: 'entrega',
    status: 'pago',
    data: '2025-02-05T14:30:00',
    endereco: 'Rua das Flores, 123 - Centro'
  },
  {
    id: 'PED-001233',
    cliente: { nome: 'Maria Santos', telefone: '11988887777' },
    itens: [{ nome: 'AirPods Pro 2ª Geração', quantidade: 1, preco: 1899.00 }],
    total: 1914.00,
    taxaEntrega: 15.00,
    tipo: 'entrega',
    status: 'em_preparo',
    data: '2025-02-05T13:45:00',
    endereco: 'Av. Paulista, 1000 - Bela Vista'
  },
  {
    id: 'PED-001232',
    cliente: { nome: 'Pedro Costa', telefone: '11977776666' },
    itens: [{ nome: 'Carregador Anker 65W', quantidade: 2, preco: 299.00 }],
    total: 598.00,
    tipo: 'retirada',
    status: 'reservado',
    data: '2025-02-05T12:20:00',
    codigoRetirada: 'RET-784521'
  },
  {
    id: 'PED-001231',
    cliente: { nome: 'Ana Paula', telefone: '11966665555' },
    itens: [{ nome: 'Samsung Galaxy S24 Ultra', quantidade: 1, preco: 7999.00 }],
    total: 7999.00,
    tipo: 'retirada',
    status: 'pronto_retirada',
    data: '2025-02-05T10:15:00',
    codigoRetirada: 'RET-784520'
  },
  {
    id: 'PED-001230',
    cliente: { nome: 'Carlos Mendes', telefone: '11955554444' },
    itens: [{ nome: 'Sony WH-1000XM5', quantidade: 1, preco: 2199.00 }],
    total: 2199.00,
    taxaEntrega: 15.00,
    tipo: 'entrega',
    status: 'enviado',
    data: '2025-02-04T16:00:00',
    endereco: 'Rua Augusta, 500 - Consolação',
    entregador: { nome: 'Roberto', telefone: '11944443333' }
  }
];

const statusConfig: Record<string, { label: string; cor: string; icone: any }> = {
  pendente: { label: 'Pendente', cor: 'bg-yellow-100 text-yellow-700', icone: Clock },
  pago: { label: 'Pago', cor: 'bg-blue-100 text-blue-700', icone: CheckCircle },
  confirmado: { label: 'Confirmado', cor: 'bg-blue-100 text-blue-700', icone: CheckCircle },
  em_preparo: { label: 'Em Preparo', cor: 'bg-purple-100 text-purple-700', icone: Package },
  pronto_retirada: { label: 'Pronto p/ Retirada', cor: 'bg-emerald-100 text-emerald-700', icone: Store },
  enviado: { label: 'Enviado', cor: 'bg-orange-100 text-orange-700', icone: Truck },
  entregue: { label: 'Entregue', cor: 'bg-green-100 text-green-700', icone: CheckCircle },
  concluido: { label: 'Concluído', cor: 'bg-green-100 text-green-700', icone: CheckCircle },
  reservado: { label: 'Reservado', cor: 'bg-blue-100 text-blue-700', icone: Store },
};

export function LojistaPedidos() {
  const [termoBusca, setTermoBusca] = useState('');
  const [pedidoSelecionado, setPedidoSelecionado] = useState<any>(null);
  const [dialogDetalhes, setDialogDetalhes] = useState(false);
  const [dialogQRCode, setDialogQRCode] = useState(false);

  const pedidosFiltrados = pedidosMock.filter(p =>
    p.id.toLowerCase().includes(termoBusca.toLowerCase()) ||
    p.cliente.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const pedidosEntrega = pedidosFiltrados.filter(p => p.tipo === 'entrega');
  const pedidosRetirada = pedidosFiltrados.filter(p => p.tipo === 'retirada');

  const handleAtualizarStatus = (_pedidoId: string, novoStatus: string) => {
    toast.success(`Status atualizado para: ${statusConfig[novoStatus]?.label || novoStatus}`);
  };

  const renderPedido = (pedido: typeof pedidosMock[0]) => {
    const status = statusConfig[pedido.status];
    const StatusIcon = status.icone;

    return (
      <Card key={pedido.id} className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{pedido.id}</span>
                <Badge className={status.cor}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {status.label}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Date(pedido.data).toLocaleString('pt-BR')}
              </p>
            </div>
            <p className="font-bold text-emerald-600">
              {pedido.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>

          <div className="flex items-center gap-2 mb-3 text-sm">
            <span className="font-medium">{pedido.cliente.nome}</span>
            <a 
              href={`tel:${pedido.cliente.telefone}`}
              className="text-emerald-600 hover:underline flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              {pedido.cliente.telefone}
            </a>
          </div>

          <div className="space-y-1 mb-3">
            {pedido.itens.map((item, idx) => (
              <p key={idx} className="text-sm text-gray-600">
                {item.quantidade}x {item.nome}
              </p>
            ))}
          </div>

          {pedido.tipo === 'entrega' && pedido.endereco && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <MapPin className="w-4 h-4" />
              {pedido.endereco}
            </div>
          )}

          {pedido.tipo === 'retirada' && pedido.codigoRetirada && (
            <div className="bg-blue-50 rounded-lg p-3 mb-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600">Código de Retirada</p>
                  <p className="font-bold text-blue-900 tracking-wider">{pedido.codigoRetirada}</p>
                </div>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setDialogQRCode(true)}
                >
                  <QrCode className="w-4 h-4 mr-1" />
                  QR
                </Button>
              </div>
            </div>
          )}

          {pedido.entregador && (
            <div className="bg-orange-50 rounded-lg p-3 mb-3">
              <p className="text-sm text-orange-700">
                Entregador: {pedido.entregador.nome} • 
                <a href={`tel:${pedido.entregador.telefone}`} className="underline ml-1">
                  {pedido.entregador.telefone}
                </a>
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
              onClick={() => {
                setPedidoSelecionado(pedido);
                setDialogDetalhes(true);
              }}
            >
              Ver Detalhes
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Atualizar Status
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {pedido.tipo === 'entrega' ? (
                  <>
                    <DropdownMenuItem onClick={() => handleAtualizarStatus(pedido.id, 'confirmado')}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar Pedido
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAtualizarStatus(pedido.id, 'em_preparo')}>
                      <Package className="w-4 h-4 mr-2" />
                      Em Preparo
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAtualizarStatus(pedido.id, 'enviado')}>
                      <Truck className="w-4 h-4 mr-2" />
                      Enviado
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAtualizarStatus(pedido.id, 'entregue')}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Entregue
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => handleAtualizarStatus(pedido.id, 'confirmado')}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar Reserva
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAtualizarStatus(pedido.id, 'pronto_retirada')}>
                      <Store className="w-4 h-4 mr-2" />
                      Pronto p/ Retirada
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAtualizarStatus(pedido.id, 'concluido')}>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Cliente Retirou
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => {
                const mensagem = `Olá ${pedido.cliente.nome}! Aqui é da ${pedido.tipo === 'entrega' ? 'loja' : 'reserva'} sobre seu pedido ${pedido.id}`;
                window.open(`https://wa.me/${pedido.cliente.telefone}?text=${encodeURIComponent(mensagem)}`, '_blank');
              }}
            >
              <MessageCircle className="w-5 h-5 text-green-600" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/lojista/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Gerenciar Pedidos</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Barra de Busca */}
        <div className="flex gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar por número ou cliente..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="todos">
          <TabsList className="w-full">
            <TabsTrigger value="todos" className="flex-1">
              Todos ({pedidosFiltrados.length})
            </TabsTrigger>
            <TabsTrigger value="entrega" className="flex-1">
              <Truck className="w-4 h-4 mr-2" />
              Entrega ({pedidosEntrega.length})
            </TabsTrigger>
            <TabsTrigger value="retirada" className="flex-1">
              <Store className="w-4 h-4 mr-2" />
              Retirada ({pedidosRetirada.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="mt-6">
            {pedidosFiltrados.map(renderPedido)}
          </TabsContent>

          <TabsContent value="entrega" className="mt-6">
            {pedidosEntrega.map(renderPedido)}
          </TabsContent>

          <TabsContent value="retirada" className="mt-6">
            {pedidosRetirada.map(renderPedido)}
          </TabsContent>
        </Tabs>

        {pedidosFiltrados.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum pedido encontrado</h3>
            <p className="text-gray-500">Os pedidos aparecerão aqui</p>
          </div>
        )}
      </div>

      {/* Dialog Detalhes */}
      <Dialog open={dialogDetalhes} onOpenChange={setDialogDetalhes}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>
          {pedidoSelecionado && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Número</span>
                <span className="font-medium">{pedidoSelecionado.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cliente</span>
                <span className="font-medium">{pedidoSelecionado.cliente.nome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Telefone</span>
                <span>{pedidoSelecionado.cliente.telefone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total</span>
                <span className="font-bold text-emerald-600">
                  {pedidoSelecionado.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog QR Code */}
      <Dialog open={dialogQRCode} onOpenChange={setDialogQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Código de Retirada</DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <div className="w-64 h-64 mx-auto bg-gray-100 rounded-xl flex items-center justify-center mb-4">
              <QrCode className="w-48 h-48 text-gray-800" />
            </div>
            <p className="text-2xl font-bold tracking-wider">
              {pedidoSelecionado?.codigoRetirada}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
