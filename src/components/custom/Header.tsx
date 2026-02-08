import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  MapPin, 
  User, 
  Menu, 
  X, 
  LogOut,
  Store,
  Package
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/stores/authStore';
import { useCartStore } from '@/stores/cartStore';

export function Header() {
  const navigate = useNavigate();
  const [termoBusca, setTermoBusca] = useState('');
  const { user, isAuthenticated, isCliente, isLojista, logout } = useAuthStore();
  const { getQuantidadeTotal } = useCartStore();
  
  const quantidadeCarrinho = getQuantidadeTotal();

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (termoBusca.trim()) {
      navigate(`/busca?q=${encodeURIComponent(termoBusca)}`);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <MapPin className="w-5 h-5 text-white" />
          </div>
          <span className="hidden sm:block text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            ONDE COMPRAR
          </span>
        </Link>

        {/* Barra de Busca */}
        <form onSubmit={handleBusca} className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar produtos, lojas..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="pl-10 pr-4 h-10 bg-gray-100 border-0 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </form>

        {/* Ações Desktop */}
        <div className="hidden md:flex items-center gap-2">
          {/* Carrinho */}
          <Link to="/carrinho">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="w-5 h-5" />
              {quantidadeCarrinho > 0 && (
                <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-emerald-500 text-[10px]">
                  {quantidadeCarrinho}
                </Badge>
              )}
            </Button>
          </Link>

          {/* Usuário */}
          {isAuthenticated() ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    {user?.fotoURL ? (
                      <img src={user.fotoURL} alt={user.nome} className="w-8 h-8 rounded-full" />
                    ) : (
                      <User className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <span className="max-w-[100px] truncate">{user?.nome}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-3 py-2">
                  <p className="text-sm font-medium">{user?.nome}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                
                {isCliente() && (
                  <>
                    <DropdownMenuItem onClick={() => navigate('/meus-pedidos')}>
                      <Package className="w-4 h-4 mr-2" />
                      Meus Pedidos
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/favoritos')}>
                      <MapPin className="w-4 h-4 mr-2" />
                      Favoritos
                    </DropdownMenuItem>
                  </>
                )}
                
                {isLojista() && (
                  <DropdownMenuItem onClick={() => navigate('/lojista/dashboard')}>
                    <Store className="w-4 h-4 mr-2" />
                    Área do Lojista
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Entrar</Button>
              </Link>
              <Link to="/cadastro">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  Criar Conta
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Menu Mobile */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px]">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between py-4 border-b">
                <span className="font-bold text-lg">Menu</span>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon">
                    <X className="w-5 h-5" />
                  </Button>
                </SheetClose>
              </div>

              <nav className="flex-1 py-4 space-y-2">
                <Link to="/">
                  <Button variant="ghost" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Início
                  </Button>
                </Link>
                <Link to="/carrinho">
                  <Button variant="ghost" className="w-full justify-start">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Carrinho
                    {quantidadeCarrinho > 0 && (
                      <Badge className="ml-auto bg-emerald-500">{quantidadeCarrinho}</Badge>
                    )}
                  </Button>
                </Link>
                
                {isAuthenticated() ? (
                  <>
                    <div className="px-4 py-2 border-t mt-2">
                      <p className="font-medium">{user?.nome}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                    
                    {isCliente() && (
                      <>
                        <Link to="/meus-pedidos">
                          <Button variant="ghost" className="w-full justify-start">
                            <Package className="w-4 h-4 mr-2" />
                            Meus Pedidos
                          </Button>
                        </Link>
                      </>
                    )}
                    
                    {isLojista() && (
                      <Link to="/lojista/dashboard">
                        <Button variant="ghost" className="w-full justify-start">
                          <Store className="w-4 h-4 mr-2" />
                          Área do Lojista
                        </Button>
                      </Link>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="border-t mt-2 pt-2 space-y-2">
                      <Link to="/login">
                        <Button variant="outline" className="w-full">
                          Entrar
                        </Button>
                      </Link>
                      <Link to="/cadastro">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                          Criar Conta
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
