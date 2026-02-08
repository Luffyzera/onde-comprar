import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/custom/Header';
import { Footer } from '@/components/custom/Footer';
import { Home } from '@/pages/cliente/Home';
import { Busca } from '@/pages/cliente/Busca';
import { ProdutoDetalhe } from '@/pages/cliente/ProdutoDetalhe';
import { Carrinho } from '@/pages/cliente/Carrinho';
import { Checkout } from '@/pages/cliente/Checkout';
import { MeusPedidos } from '@/pages/cliente/MeusPedidos';
import { Favoritos } from '@/pages/cliente/Favoritos';
import { Planos } from '@/pages/cliente/Planos';
import { Lojas } from '@/pages/cliente/Lojas';
import { Login } from '@/pages/auth/Login';
import { Cadastro } from '@/pages/auth/Cadastro';
import { LojistaDashboard } from '@/pages/lojista/Dashboard';
import { LojistaProdutos } from '@/pages/lojista/Produtos';
import { LojistaProdutoForm } from '@/pages/lojista/ProdutoForm';
import { LojistaConfiguracoes } from '@/pages/lojista/Configuracoes';
import { LojistaPedidos } from '@/pages/lojista/Pedidos';
import { useAuthStore } from '@/stores/authStore';
// Layout para páginas do cliente
function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

// Layout para páginas do lojista (sem header/footer padrão)
function LojistaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}

// Rota protegida para clientes
function RotaCliente({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

// Rota protegida para lojistas
function RotaLojista({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  
  // Na prática, verificaria se é lojista
  // if (!isLojista()) {
  //   return <Navigate to="/" replace />;
  // }
  
  return <>{children}</>;
}

function App() {
  const { initAuthListener } = useAuthStore();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        richColors 
        closeButton
        toastOptions={{
          style: {
            fontFamily: 'inherit',
          },
        }}
      />
      <Routes>
        {/* Páginas Públicas - Cliente */}
        <Route 
          path="/" 
          element={
            <ClienteLayout>
              <Home />
            </ClienteLayout>
          } 
        />
        <Route 
          path="/busca" 
          element={
            <ClienteLayout>
              <Busca />
            </ClienteLayout>
          } 
        />
        <Route 
          path="/produto/:id" 
          element={
            <ClienteLayout>
              <ProdutoDetalhe />
            </ClienteLayout>
          } 
        />
        <Route 
          path="/carrinho" 
          element={
            <ClienteLayout>
              <Carrinho />
            </ClienteLayout>
          } 
        />
        <Route 
          path="/lojas" 
          element={
            <ClienteLayout>
              <Lojas />
            </ClienteLayout>
          } 
        />

        {/* Autenticação */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/lojista/login" element={<Login defaultTab="lojista" />} />
        <Route path="/lojista/cadastro" element={<Cadastro defaultTab="lojista" />} />

        {/* Páginas Protegidas - Cliente */}
        <Route 
          path="/checkout" 
          element={
            <RotaCliente>
              <ClienteLayout>
                <Checkout />
              </ClienteLayout>
            </RotaCliente>
          } 
        />
        <Route 
          path="/meus-pedidos" 
          element={
            <RotaCliente>
              <ClienteLayout>
                <MeusPedidos />
              </ClienteLayout>
            </RotaCliente>
          } 
        />
        <Route 
          path="/favoritos" 
          element={
            <RotaCliente>
              <ClienteLayout>
                <Favoritos />
              </ClienteLayout>
            </RotaCliente>
          } 
        />
        <Route 
          path="/planos" 
          element={
            <ClienteLayout>
              <Planos />
            </ClienteLayout>
          } 
        />

        {/* Área do Lojista */}
        <Route 
          path="/lojista/dashboard" 
          element={
            <RotaLojista>
              <LojistaLayout>
                <LojistaDashboard />
              </LojistaLayout>
            </RotaLojista>
          } 
        />
        <Route 
          path="/lojista/produtos" 
          element={
            <RotaLojista>
              <LojistaLayout>
                <LojistaProdutos />
              </LojistaLayout>
            </RotaLojista>
          } 
        />
        <Route 
          path="/lojista/produtos/novo" 
          element={
            <RotaLojista>
              <LojistaLayout>
                <LojistaProdutoForm />
              </LojistaLayout>
            </RotaLojista>
          } 
        />
        <Route 
          path="/lojista/produtos/editar/:id" 
          element={
            <RotaLojista>
              <LojistaLayout>
                <LojistaProdutoForm />
              </LojistaLayout>
            </RotaLojista>
          } 
        />
      
        <Route
          path="/lojista/pedidos" 
          element={
            <RotaLojista>
              <LojistaLayout>
                <LojistaPedidos />
              </LojistaLayout>
            </RotaLojista>
          } 
        />
        <Route
          path="/lojista/configuracoes" 
          element={
            <RotaLojista>
              <LojistaLayout>
                <LojistaConfiguracoes />
              </LojistaLayout>
            </RotaLojista>
          } 
        />
    

        {/* Redirecionamentos */}
        <Route path="/lojista" element={<Navigate to="/lojista/dashboard" replace />} />
        
        {/* 404 */}
        <Route 
          path="*" 
          element={
            <ClienteLayout>
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                  <p className="text-gray-600 mb-6">Página não encontrada</p>
                  <a href="/">
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      Voltar para Home
                    </Button>
                  </a>
                </div>
              </div>
            </ClienteLayout>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
