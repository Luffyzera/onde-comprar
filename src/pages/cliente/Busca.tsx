import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from '@/components/ui/sheet';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ProdutoCard } from '@/components/custom/ProdutoCard';
import { useProdutoStore } from '@/stores/produtoStore';
import type { Produto } from '@/types';

export function Busca() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [termoBusca, setTermoBusca] = useState(searchParams.get('q') || '');
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  
  // Filtros
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<string>(searchParams.get('categoria') || '');
  const [lojaSelecionada, setLojaSelecionada] = useState<string>(searchParams.get('loja') || '');
  const [faixaPreco, setFaixaPreco] = useState<string>('');
  const [tipoEntrega, setTipoEntrega] = useState<string>('');
  const [ordenarPor, setOrdenarPor] = useState<string>('relevancia');

  const { categorias, buscarProdutos, produtos } = useProdutoStore();

  // Get loja name for display
  const nomeLojaSelecionada = useMemo(() => {
    if (!lojaSelecionada) return '';
    const loja = produtos.find(p => p.lojaId === lojaSelecionada)?.loja;
    return loja?.nome || '';
  }, [lojaSelecionada, produtos]);

  useEffect(() => {
    const termo = searchParams.get('q') || '';
    const categoria = searchParams.get('categoria') || '';
    const loja = searchParams.get('loja') || '';
    setTermoBusca(termo);
    setCategoriaSelecionada(categoria);
    setLojaSelecionada(loja);
    
    let resultado = buscarProdutos(termo, categoria || undefined);
    
    // Filtrar por loja
    if (loja) {
      resultado = resultado.filter(p => p.lojaId === loja);
    }
    
    // Aplicar filtros adicionais
    if (faixaPreco) {
      const [min, max] = faixaPreco.split('-').map(Number);
      resultado = resultado.filter(p => {
        const preco = p.precoPromocional || p.preco;
        return preco >= min && (max ? preco <= max : true);
      });
    }
    
    if (tipoEntrega) {
      resultado = resultado.filter(p => {
        if (tipoEntrega === 'entrega') return p.tipoOperacao === 'venda_online' || p.tipoOperacao === 'ambos';
        if (tipoEntrega === 'retirada') return p.tipoOperacao === 'reserva_retirada' || p.tipoOperacao === 'ambos';
        return true;
      });
    }
    
    // Ordenar
    switch (ordenarPor) {
      case 'menor_preco':
        resultado.sort((a, b) => (a.precoPromocional || a.preco) - (b.precoPromocional || b.preco));
        break;
      case 'maior_preco':
        resultado.sort((a, b) => (b.precoPromocional || b.preco) - (a.precoPromocional || a.preco));
        break;
      case 'mais_proximo':
        // Simulação - na prática usaria distância real
        break;
    }
    
    setProdutosFiltrados(resultado);
  }, [searchParams, faixaPreco, tipoEntrega, ordenarPor, buscarProdutos, produtos]);

  const handleBusca = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (termoBusca) {
      params.set('q', termoBusca);
    } else {
      params.delete('q');
    }
    setSearchParams(params);
  };

  const limparFiltros = () => {
    setCategoriaSelecionada('');
    setLojaSelecionada('');
    setFaixaPreco('');
    setTipoEntrega('');
    setOrdenarPor('relevancia');
    setSearchParams({});
  };

  const filtrosAtivos = categoriaSelecionada || lojaSelecionada || faixaPreco || tipoEntrega;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header da Busca */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleBusca} className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar produtos..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
                className="pl-10 pr-4 h-11"
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="w-5 h-5 mr-2" />
                  Filtros
                  {filtrosAtivos && (
                    <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-emerald-500">
                      !
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[350px]">
                <SheetHeader>
                  <SheetTitle>Filtros</SheetTitle>
                </SheetHeader>
                <div className="py-6 space-y-6">
                  {/* Categoria */}
                  <div>
                    <h4 className="font-medium mb-3">Categoria</h4>
                    <div className="space-y-2">
                      {categorias.map((cat) => (
                        <div key={cat.id} className="flex items-center">
                          <Checkbox
                            id={`cat-${cat.id}`}
                            checked={categoriaSelecionada === cat.id}
                            onCheckedChange={() => {
                              setCategoriaSelecionada(categoriaSelecionada === cat.id ? '' : cat.id);
                            }}
                          />
                          <Label htmlFor={`cat-${cat.id}`} className="ml-2 cursor-pointer">
                            {cat.nome}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preço */}
                  <div>
                    <h4 className="font-medium mb-3">Faixa de Preço</h4>
                    <div className="space-y-2">
                      {[
                        { label: 'Até R$ 500', value: '0-500' },
                        { label: 'R$ 500 a R$ 1.000', value: '500-1000' },
                        { label: 'R$ 1.000 a R$ 3.000', value: '1000-3000' },
                        { label: 'R$ 3.000 a R$ 5.000', value: '3000-5000' },
                        { label: 'Acima de R$ 5.000', value: '5000-' },
                      ].map((opcao) => (
                        <div key={opcao.value} className="flex items-center">
                          <Checkbox
                            id={`preco-${opcao.value}`}
                            checked={faixaPreco === opcao.value}
                            onCheckedChange={() => {
                              setFaixaPreco(faixaPreco === opcao.value ? '' : opcao.value);
                            }}
                          />
                          <Label htmlFor={`preco-${opcao.value}`} className="ml-2 cursor-pointer">
                            {opcao.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tipo de Entrega */}
                  <div>
                    <h4 className="font-medium mb-3">Tipo de Entrega</h4>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Checkbox
                          id="tipo-entrega"
                          checked={tipoEntrega === 'entrega'}
                          onCheckedChange={() => {
                            setTipoEntrega(tipoEntrega === 'entrega' ? '' : 'entrega');
                          }}
                        />
                        <Label htmlFor="tipo-entrega" className="ml-2 cursor-pointer">
                          Entrega em casa
                        </Label>
                      </div>
                      <div className="flex items-center">
                        <Checkbox
                          id="tipo-retirada"
                          checked={tipoEntrega === 'retirada'}
                          onCheckedChange={() => {
                            setTipoEntrega(tipoEntrega === 'retirada' ? '' : 'retirada');
                          }}
                        />
                        <Label htmlFor="tipo-retirada" className="ml-2 cursor-pointer">
                          Retirada na loja
                        </Label>
                      </div>
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={limparFiltros}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Limpar Filtros
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </form>

          {/* Filtros ativos */}
          {filtrosAtivos && (
            <div className="flex flex-wrap gap-2 mt-3">
              {lojaSelecionada && (
                <Badge variant="secondary" className="gap-1">
                  Loja: {nomeLojaSelecionada}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => {
                      setLojaSelecionada('');
                      const params = new URLSearchParams(searchParams);
                      params.delete('loja');
                      setSearchParams(params);
                    }}
                  />
                </Badge>
              )}
              {categoriaSelecionada && (
                <Badge variant="secondary" className="gap-1">
                  {categorias.find(c => c.id === categoriaSelecionada)?.nome}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setCategoriaSelecionada('')}
                  />
                </Badge>
              )}
              {faixaPreco && (
                <Badge variant="secondary" className="gap-1">
                  {faixaPreco === '0-500' && 'Até R$ 500'}
                  {faixaPreco === '500-1000' && 'R$ 500 a R$ 1.000'}
                  {faixaPreco === '1000-3000' && 'R$ 1.000 a R$ 3.000'}
                  {faixaPreco === '3000-5000' && 'R$ 3.000 a R$ 5.000'}
                  {faixaPreco === '5000-' && 'Acima de R$ 5.000'}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setFaixaPreco('')}
                  />
                </Badge>
              )}
              {tipoEntrega && (
                <Badge variant="secondary" className="gap-1">
                  {tipoEntrega === 'entrega' ? 'Entrega' : 'Retirada'}
                  <X 
                    className="w-3 h-3 cursor-pointer" 
                    onClick={() => setTipoEntrega('')}
                  />
                </Badge>
              )}
              <button 
                onClick={limparFiltros}
                className="text-sm text-emerald-600 hover:underline"
              >
                Limpar todos
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Resultados */}
      <div className="container mx-auto px-4 py-6">
        {/* Barra de ordenação */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {produtosFiltrados.length} {produtosFiltrados.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Ordenar por:</span>
            <Select value={ordenarPor} onValueChange={setOrdenarPor}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevancia">Relevância</SelectItem>
                <SelectItem value="menor_preco">Menor preço</SelectItem>
                <SelectItem value="maior_preco">Maior preço</SelectItem>
                <SelectItem value="mais_proximo">Mais próximo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid de produtos */}
        {produtosFiltrados.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {produtosFiltrados.map((produto) => (
              <ProdutoCard 
                key={produto.id} 
                produto={produto}
                mostrarDistancia={true}
                distanciaKm={Math.random() * 5 + 1}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-600 mb-6">
              Tente buscar com outros termos ou ajuste os filtros
            </p>
            <Button onClick={limparFiltros} variant="outline">
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
