import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Store, 
  Truck, 
  Shield, 
  Clock, 
  Smartphone,
  ChevronRight,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ProdutoCard } from '@/components/custom/ProdutoCard';
import { MapaLojas } from '@/components/map/MapaLojas';
import { useProdutoStore } from '@/stores/produtoStore';
import { useAuthStore } from '@/stores/authStore';

export function Home() {
  const navigate = useNavigate();
  const [termoBusca, setTermoBusca] = useState('');
  const [localizacao, setLocalizacao] = useState<{ lat: number; lng: number } | null>(null);
  const { produtos, lojas, categorias } = useProdutoStore();
  const { user, isLojista } = useAuthStore();

  // Redirecionar lojistas logados para o dashboard
  useEffect(() => {
    if (user && isLojista()) {
      navigate('/lojista/dashboard', { replace: true });
    }
  }, [user, isLojista, navigate]);

  // Produtos em destaque
  const produtosDestaque = produtos.slice(0, 8);
  
  // Lojas próximas (simulado)
  const lojasProximas = lojas.slice(0, 5);

  useEffect(() => {
    // Tentar obter localização do usuário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocalizacao({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Localização padrão: Itabuna - BA
          setLocalizacao({ lat: -14.7856, lng: -39.2833 });
        }
      );
    }
  }, []);

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    if (termoBusca.trim()) {
      window.location.href = `/busca?q=${encodeURIComponent(termoBusca)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white py-16 md:py-24 overflow-hidden">
        {/* Padrão de fundo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-white/20 text-white border-0 backdrop-blur-sm">
              🚀 Novo: Entrega em até 2h!
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Encontre o produto que você quer{' '}
              <span className="text-emerald-200">na loja mais próxima</span>
            </h1>
            <p className="text-lg md:text-xl text-emerald-100 mb-8">
              Compare preços, reserve para retirar ou peça entrega. 
              Tudo em eletrônicos, perto de você.
            </p>

            {/* Barra de Busca Principal */}
            <form onSubmit={handleBusca} className="max-w-2xl mx-auto">
              <div className="relative flex items-center">
                <MapPin className="absolute left-4 w-5 h-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="O que você está procurando? (ex: iPhone, notebook...)"
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="w-full pl-12 pr-32 py-6 text-lg bg-white text-gray-900 border-0 rounded-xl shadow-2xl placeholder:text-gray-400"
                />
                <Button 
                  type="submit"
                  className="absolute right-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-5 rounded-lg"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Buscar
                </Button>
              </div>
            </form>

            {/* Tags populares */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="text-sm text-emerald-200">Populares:</span>
              {['iPhone', 'Samsung', 'MacBook', 'AirPods', 'PlayStation'].map((tag) => (
                <Link
                  key={tag}
                  to={`/busca?q=${tag}`}
                  className="text-sm text-white/80 hover:text-white underline underline-offset-2"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F9FAFB"/>
          </svg>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-12 container mx-auto px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Categorias</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categorias.map((categoria) => (
            <Link
              key={categoria.id}
              to={`/busca?categoria=${categoria.id}`}
              className="group bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-lg transition-all border hover:border-emerald-200"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                <Smartphone className="w-5 h-5 text-emerald-600 group-hover:text-white transition-colors" />
              </div>
              <span className="font-medium text-gray-700 group-hover:text-emerald-600 transition-colors">
                {categoria.nome}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Mapa de Lojas */}
      {localizacao && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Lojas Próximas</h2>
                <p className="text-gray-500">Encontre lojas parceiras perto de você</p>
              </div>
              <Link to="/lojas">
                <Button variant="outline">
                  Ver Todas
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="h-[400px] rounded-xl overflow-hidden shadow-lg">
              <MapaLojas 
                lojas={lojasProximas} 
                centro={localizacao}
                zoom={13}
              />
            </div>
          </div>
        </section>
      )}

      {/* Produtos em Destaque */}
      <section className="py-12 container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Produtos em Destaque</h2>
            <p className="text-gray-500">Os melhores preços em eletrônicos</p>
          </div>
          <Link to="/busca">
            <Button variant="outline">
              Ver Todos
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {produtosDestaque.map((produto) => (
            <ProdutoCard 
              key={produto.id} 
              produto={produto}
              mostrarDistancia={true}
              distanciaKm={2.5}
            />
          ))}
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Como Funciona</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Encontre, compare e compre dos melhores eletrônicos em lojas físicas perto de você
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">1. Busque</h3>
              <p className="text-gray-600">
                Encontre o produto que deseja e veja quais lojas próximas têm em estoque
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                <Store className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">2. Escolha</h3>
              <p className="text-gray-600">
                Compare preços e escolha: retire na loja ou peça entrega
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <Truck className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">3. Receba</h3>
              <p className="text-gray-600">
                Receba em casa ou retire na loja com segurança e praticidade
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Por que usar o ONDE COMPRAR?
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Lojas Próximas</h3>
                  <p className="text-gray-600">Encontre produtos em lojas físicas perto de você</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Entrega Rápida</h3>
                  <p className="text-gray-600">Receba em até 2h ou retire na loja no mesmo dia</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Compra Segura</h3>
                  <p className="text-gray-600">Pagamento protegido e garantia das lojas parceiras</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Melhores Preços</h3>
                  <p className="text-gray-600">Compare preços de várias lojas e economize</p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl transform rotate-3 opacity-20" />
            <img
              src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop"
              alt="Compras online"
              className="relative rounded-3xl shadow-2xl w-full"
            />
          </div>
        </div>
      </section>

      {/* CTA Lojistas */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">É lojista de eletrônicos?</h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Cadastre sua loja no ONDE COMPRAR e alcance milhares de clientes na sua região. 
            Planos a partir de R$ 49,90/mês.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/lojista/cadastro">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8">
                <Store className="w-5 h-5 mr-2" />
                Cadastrar Minha Loja
              </Button>
            </Link>
            <Link to="/planos">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100 px-8">
                Ver Planos
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
