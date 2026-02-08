import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  DollarSign,
  ArrowUpRight,
  CheckCircle,
  Store,
  Settings,
  LogOut,
  Menu,
  Gift,
  Calendar,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { useLojaStore } from '@/stores/lojaStore';
import { useProdutoStore } from '@/stores/produtoStore';

export function LojistaDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout, user } = useAuthStore();
  const { lojaAtual, getLojaByUsuarioId, getDiasRestantesTrial, isTrialAtivo, carregarLojaPorUsuario } = useLojaStore();
  const { getProdutosPorLoja, carregarProdutosPorLoja } = useProdutoStore();
  
  // Buscar loja do usuário logado
  const loja = lojaAtual || (user ? getLojaByUsuarioId(user.id) : null);
  const produtosLoja = loja ? getProdutosPorLoja(loja.id) : [];
  const diasTrial = loja ? getDiasRestantesTrial(loja.id) : 0;
  const trialAtivo = loja ? isTrialAtivo(loja.id) : false;

  useEffect(() => {
    if (user) {
      // Carregar loja do usuário
      if (!lojaAtual) {
        carregarLojaPorUsuario(user.id);
      }
      // Carregar produtos da loja
      carregarProdutosPorLoja(user.id);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success('Sessão encerrada');
    window.location.href = '/';
  };

  // Dados mockados para novas lojas (sem histórico ainda)
  const stats = {
    vendasHoje: 0,
    vendasOntem: 0,
    pedidosHoje: 0,
    pedidosPendentes: 0,
    cliquesWhatsApp: 0,
    produtosAtivos: produtosLoja.length
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
            <Store className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold truncate">{loja?.nome || 'Minha Loja'}</p>
            <div className="flex items-center gap-1">
              <p className="text-xs text-gray-500">{loja?.plano?.nome || 'Plano Básico'}</p>
              {trialAtivo && (
                <Badge variant="secondary" className="text-[10px] px-1 py-0 bg-emerald-100 text-emerald-700">
                  <Gift className="w-3 h-3 mr-1" />
                  {diasTrial} dias grátis
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        <Link to="/lojista/dashboard">
          <Button variant="secondary" className="w-full justify-start">
            <LayoutDashboard className="w-4 h-4 mr-2" />
            Dashboard
          </Button>
        </Link>
        <Link to="/lojista/pedidos">
          <Button variant="ghost" className="w-full justify-start">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Pedidos
            <Badge className="ml-auto bg-red-500">0</Badge>
          </Button>
        </Link>
        <Link to="/lojista/produtos">
          <Button variant="ghost" className="w-full justify-start">
            <Package className="w-4 h-4 mr-2" />
            Produtos
            <Badge className="ml-auto bg-gray-500">{produtosLoja.length}</Badge>
          </Button>
        </Link>
        <Link to="/lojista/configuracoes">
          <Button variant="ghost" className="w-full justify-start">
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </Link>
      </nav>

      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className="w-full justify-start text-red-600"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:block w-64 bg-white border-r fixed h-full">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
              <h1 className="text-xl font-bold">Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/">
                <Button variant="outline" size="sm">
                  Ver Loja
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* Banner de Trial */}
          {trialAtivo && (
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 mb-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5" />
                    <h2 className="text-lg font-bold">Período Gratuito Ativo!</h2>
                  </div>
                  <p className="text-emerald-100">
                    Você tem <strong>{diasTrial} dias</strong> gratuitos restantes. 
                    Aproveite para cadastrar seus produtos e começar a vender!
                  </p>
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-3xl font-bold">{diasTrial}</p>
                  <p className="text-sm text-emerald-100">dias restantes</p>
                </div>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Vendas Hoje</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.vendasHoje.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    {stats.vendasHoje > 0 && (
                      <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>+0%</span>
                        <span className="text-gray-400">vs ontem</span>
                      </div>
                    )}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Pedidos Hoje</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pedidosHoje}</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Produtos Ativos</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.produtosAtivos}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      de {loja?.plano?.limiteProdutos || 50} permitidos
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Status da Conta</p>
                    <p className="text-lg font-bold text-gray-900">
                      {trialAtivo ? 'Trial Ativo' : 'Plano Ativo'}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      {trialAtivo 
                        ? `${diasTrial} dias grátis restantes` 
                        : loja?.plano?.nome || 'Básico'}
                    </p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    trialAtivo ? 'bg-emerald-100' : 'bg-green-100'
                  }`}>
                    <Calendar className={`w-6 h-6 ${
                      trialAtivo ? 'text-emerald-600' : 'text-green-600'
                    }`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mensagem para nova loja sem produtos */}
          {produtosLoja.length === 0 && (
            <Card className="mb-8 border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-8 text-center">
                <Package className="w-16 h-16 text-emerald-600 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Bem-vindo à sua loja!
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Comece cadastrando seus primeiros produtos. Você pode adicionar até {loja?.plano?.limiteProdutos || 50} produtos no seu plano.
                </p>
                <div className="flex gap-3 justify-center">
                  <Link to="/lojista/produtos/novo">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Cadastrar Primeiro Produto
                    </Button>
                  </Link>
                  <Link to="/lojista/produtos">
                    <Button variant="outline">
                      Ver Todos os Produtos
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pedidos Recentes */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Pedidos Recentes</CardTitle>
                <Link to="/lojista/pedidos">
                  <Button variant="ghost" size="sm">
                    Ver Todos
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                {stats.pedidosHoje === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">Nenhum pedido ainda</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Seus pedidos aparecerão aqui
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Lista de pedidos quando houver */}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Produtos */}
            <Card>
              <CardHeader>
                <CardTitle>Seus Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                {produtosLoja.length === 0 ? (
                  <div className="text-center py-6">
                    <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">Nenhum produto cadastrado</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {produtosLoja.slice(0, 5).map((produto, idx) => (
                      <div key={produto.id} className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-emerald-600 text-sm">
                          {idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{produto.nome}</p>
                          <p className="text-sm text-gray-500">
                            {produto.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                        <Badge variant={produto.estoque <= 5 ? 'destructive' : 'secondary'}>
                          {produto.estoque} em estoque
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                <Link to="/lojista/produtos">
                  <Button variant="outline" className="w-full mt-6">
                    Gerenciar Produtos
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Ações Rápidas */}
          <div className="mt-8">
            <h2 className="text-lg font-bold mb-4">Ações Rápidas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link to="/lojista/produtos/novo">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Package className="w-6 h-6" />
                  <span>Adicionar Produto</span>
                </Button>
              </Link>
              <Link to="/lojista/pedidos">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <CheckCircle className="w-6 h-6" />
                  <span>Ver Pedidos</span>
                </Button>
              </Link>
              <Link to="/lojista/configuracoes">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <Settings className="w-6 h-6" />
                  <span>Configurar Loja</span>
                </Button>
              </Link>
              <Link to="/lojista/planos">
                <Button variant="outline" className="w-full h-24 flex flex-col items-center justify-center gap-2">
                  <TrendingUp className="w-6 h-6" />
                  <span>Ver Planos</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


