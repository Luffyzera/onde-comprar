import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProdutoCard } from '@/components/custom/ProdutoCard';
import { useAuthStore } from '@/stores/authStore';
import { useProdutoStore } from '@/stores/produtoStore';
import type { Produto } from '@/types';
import { toast } from 'sonner';

export function Favoritos() {
  const { user, isCliente } = useAuthStore();
  const { produtos, getProdutoById } = useProdutoStore();
  const [favoritos, setFavoritos] = useState<Produto[]>([]);

  useEffect(() => {
    if (user && isCliente()) {
      const cliente = user as { favoritos?: string[] };
      if (cliente.favoritos && cliente.favoritos.length > 0) {
        // Buscar produtos favoritos
        const produtosFavoritos = cliente.favoritos
          .map(id => getProdutoById(id))
          .filter((p): p is Produto => p !== undefined);
        setFavoritos(produtosFavoritos);
      } else {
        setFavoritos([]);
      }
    }
  }, [user, produtos, getProdutoById, isCliente]);

  const handleRemoverFavorito = (produtoId: string) => {
    // Simula remoção (em produção, atualizaria no backend)
    setFavoritos(prev => prev.filter(p => p.id !== produtoId));
    toast.success('Removido dos favoritos');
  };

  const limparFavoritos = () => {
    setFavoritos([]);
    toast.success('Todos os favoritos foram removidos');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link to="/" className="hover:text-emerald-600 transition-colors">
            Início
          </Link>
          <span>/</span>
          <span className="text-gray-900">Meus Favoritos</span>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500" />
              Meus Favoritos
            </h1>
            <p className="text-gray-500 mt-1">
              {favoritos.length} {favoritos.length === 1 ? 'produto salvo' : 'produtos salvos'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {favoritos.length > 0 && (
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
                onClick={limparFavoritos}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar
              </Button>
            )}
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continuar Comprando
              </Button>
            </Link>
          </div>
        </div>

        {/* Lista de Favoritos */}
        {favoritos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favoritos.map((produto) => (
              <div key={produto.id} className="relative group">
                <ProdutoCard produto={produto} mostrarDistancia={true} distanciaKm={2.5} />
                <button
                  onClick={() => handleRemoverFavorito(produto.id)}
                  className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                  title="Remover dos favoritos"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          /* Estado Vazio */
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
              <Heart className="w-10 h-10 text-red-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Nenhum favorito ainda
            </h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Você ainda não adicionou nenhum produto aos favoritos. 
              Clique no coração nos produtos que gostar para salvá-los aqui.
            </p>
            <Link to="/busca">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Explorar Produtos
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
