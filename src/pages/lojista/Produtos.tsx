import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  MoreVertical,
  Package,
  AlertTriangle,
  Check,
  ArrowLeft,
  FileSpreadsheet,
  Upload,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useProdutoStore } from '@/stores/produtoStore';
import { useAuthStore } from '@/stores/authStore';
import { useLojaStore } from '@/stores/lojaStore';

export function LojistaProdutos() {
  const [termoBusca, setTermoBusca] = useState('');
  const [produtoExcluir, setProdutoExcluir] = useState<string | null>(null);
  const [produtoEditando, setProdutoEditando] = useState<any>(null);
  const [dialogEditarAberto, setDialogEditarAberto] = useState(false);
  const [dialogImportarAberto, setDialogImportarAberto] = useState(false);
  const [produtosSelecionados, setProdutosSelecionados] = useState<string[]>([]);
  
  const { deleteProduto, updateProduto, addProdutosEmMassa, getProdutosPorLoja, contarProdutosPorLoja, carregarProdutosPorLoja } = useProdutoStore();
  const { user } = useAuthStore();
  const { getLojaByUsuarioId, getLimiteProdutos } = useLojaStore();
  
  const lojaId = user?.id || 'loja1';
  const loja = user ? getLojaByUsuarioId(user.id) : null;
  const LIMITE_PRODUTOS = loja ? getLimiteProdutos(loja.id) : 50;
  const produtosLoja = getProdutosPorLoja(lojaId);
  const quantidadeProdutos = contarProdutosPorLoja(lojaId);
  
  const produtosFiltrados = produtosLoja.filter(p =>
    p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    p.descricao.toLowerCase().includes(termoBusca.toLowerCase())
  );

  // Carregar produtos do Firebase quando montar o componente
  useEffect(() => {
    if (user) {
      carregarProdutosPorLoja(user.id);
    }
  }, [user]);

  const handleExcluirProduto = (produtoId: string) => {
    deleteProduto(produtoId);
    toast.success('Produto excluído com sucesso!');
    setProdutoExcluir(null);
  };

  const handleSalvarEdicao = () => {
    if (!produtoEditando) return;
    
    updateProduto(produtoEditando.id, {
      nome: produtoEditando.nome,
      preco: parseFloat(produtoEditando.preco) || 0,
      precoPromocional: produtoEditando.precoPromocional ? parseFloat(produtoEditando.precoPromocional) : undefined,
      estoque: parseInt(produtoEditando.estoque) || 0,
      estoqueDisponivel: parseInt(produtoEditando.estoque) || 0,
      tipoOperacao: produtoEditando.tipoOperacao,
      isAtivo: produtoEditando.isAtivo,
    });
    
    toast.success('Produto atualizado com sucesso!');
    setDialogEditarAberto(false);
    setProdutoEditando(null);
  };

  const handleAtivarDesativar = (produtoId: string, isAtivo: boolean) => {
    updateProduto(produtoId, { isAtivo });
    toast.success(isAtivo ? 'Produto ativado!' : 'Produto desativado!');
  };

  const handleImportarCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const disponivel = LIMITE_PRODUTOS - quantidadeProdutos;
    
    if (disponivel <= 0) {
      toast.error(`Você atingiu o limite de ${LIMITE_PRODUTOS} produtos`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      const dataLines = lines.slice(1); // Pular cabeçalho

      const produtosImportar: any[] = [];
      
      dataLines.slice(0, disponivel).forEach((line) => {
        const cols = line.split(',').map(c => c.trim());
        if (cols[0]) { // Só se tiver nome
          produtosImportar.push({
            nome: cols[0],
            descricao: cols[1] || '',
            preco: parseFloat(cols[2]) || 0,
            estoque: parseInt(cols[3]) || 0,
            categoriaId: cols[4] || '1',
            tipoOperacao: cols[5] || 'venda_online',
            lojaId: lojaId,
            imagens: ['/placeholder-product.png'],
            isAtivo: true,
          });
        }
      });

      if (produtosImportar.length > 0) {
        const adicionados = addProdutosEmMassa(produtosImportar);
        toast.success(`${adicionados} produtos importados com sucesso!`);
        
        if (dataLines.length > disponivel) {
          toast.warning(`${dataLines.length - disponivel} produtos não foram importados por causa do limite`);
        }
      } else {
        toast.error('Nenhum produto válido encontrado no arquivo');
      }

      setDialogImportarAberto(false);
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = `Nome,Descrição,Preço,Estoque,Categoria,Tipo de Operação
iPhone 15,Smartphone Apple,6999.00,10,1,venda_online
AirPods,Fone Bluetooth,1299.00,20,2,ambos
Carregador USB,Carregador 20W,99.00,50,2,retirada`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template-produtos.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const produtosEstoqueBaixo = produtosFiltrados.filter(p => p.estoqueDisponivel <= 5);

  // Edição rápida de preço
  const handleEditarPreco = (produtoId: string, novoPreco: string) => {
    const preco = parseFloat(novoPreco);
    if (isNaN(preco) || preco < 0) return;
    
    updateProduto(produtoId, { 
      preco,
      dataAtualizacao: new Date()
    });
    toast.success('Preço atualizado!');
  };

  // Edição rápida de estoque
  const handleEditarEstoque = (produtoId: string, novoEstoque: string) => {
    const estoque = parseInt(novoEstoque);
    if (isNaN(estoque) || estoque < 0) return;
    
    updateProduto(produtoId, { 
      estoque,
      estoqueDisponivel: estoque,
      dataAtualizacao: new Date()
    });
    toast.success('Estoque atualizado!');
  };

  // Excluir produtos selecionados em massa
  const handleExcluirSelecionados = () => {
    if (produtosSelecionados.length === 0) {
      toast.error('Selecione pelo menos um produto');
      return;
    }
    
    produtosSelecionados.forEach(id => {
      deleteProduto(id);
    });
    
    toast.success(`${produtosSelecionados.length} produtos excluídos!`);
    setProdutosSelecionados([]);
  };

  // Selecionar todos os produtos filtrados
  const handleSelecionarTodos = () => {
    if (produtosSelecionados.length === produtosFiltrados.length) {
      setProdutosSelecionados([]);
    } else {
      setProdutosSelecionados(produtosFiltrados.map(p => p.id));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <Link to="/lojista/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Meus Produtos</h1>
                <p className="text-sm text-gray-500">
                  {quantidadeProdutos} de {LIMITE_PRODUTOS} produtos
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDialogImportarAberto(true)}
                disabled={quantidadeProdutos >= LIMITE_PRODUTOS}
              >
                <Upload className="w-4 h-4 mr-2" />
                Importar
              </Button>
              
              <Link to="/lojista/produtos/novo">
                <Button 
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={quantidadeProdutos >= LIMITE_PRODUTOS}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Produto
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Barra de progresso do limite */}
        <div className="bg-white rounded-lg p-4 mb-6 border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Limite de Produtos</span>
            <span className={`text-sm font-medium ${quantidadeProdutos >= LIMITE_PRODUTOS ? 'text-red-600' : 'text-gray-600'}`}>
              {quantidadeProdutos}/{LIMITE_PRODUTOS}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all ${
                quantidadeProdutos >= LIMITE_PRODUTOS ? 'bg-red-500' : 
                quantidadeProdutos >= LIMITE_PRODUTOS * 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min((quantidadeProdutos / LIMITE_PRODUTOS) * 100, 100)}%` }}
            />
          </div>
          {quantidadeProdutos >= LIMITE_PRODUTOS && (
            <p className="text-xs text-red-600 mt-2">
              Você atingiu o limite de produtos. Exclua alguns produtos ou atualize seu plano.
            </p>
          )}
        </div>

        {/* Alerta Estoque Baixo */}
        {produtosEstoqueBaixo.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <p className="font-medium text-amber-900">
                  {produtosEstoqueBaixo.length} {produtosEstoqueBaixo.length === 1 ? 'produto com' : 'produtos com'} estoque baixo
                </p>
                <p className="text-sm text-amber-700">
                  Reabasteça para não perder vendas
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Barra de Busca e Ações */}
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Buscar produtos..."
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Ações em Massa */}
        {produtosFiltrados.length > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <Checkbox 
              checked={produtosSelecionados.length === produtosFiltrados.length && produtosFiltrados.length > 0}
              onCheckedChange={handleSelecionarTodos}
            />
            <span className="text-sm text-gray-600">
              {produtosSelecionados.length > 0 
                ? `${produtosSelecionados.length} selecionado(s)` 
                : 'Selecionar todos'}
            </span>
            
            {produtosSelecionados.length > 0 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={handleExcluirSelecionados}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Excluir Selecionados
              </Button>
            )}
          </div>
        )}

        {/* Lista de Produtos */}
        <div className="space-y-4">
          {produtosFiltrados.map((produto) => (
            <Card key={produto.id} className={!produto.isAtivo ? 'opacity-60' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Checkbox */}
                  <Checkbox 
                    checked={produtosSelecionados.includes(produto.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setProdutosSelecionados([...produtosSelecionados, produto.id]);
                      } else {
                        setProdutosSelecionados(produtosSelecionados.filter(id => id !== produto.id));
                      }
                    }}
                  />

                  {/* Imagem */}
                  <img
                    src={produto.imagens[0]}
                    alt={produto.nome}
                    className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder-product.png';
                    }}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 truncate">{produto.nome}</h3>
                        <p className="text-sm text-gray-500">{produto.categoria.nome}</p>
                        
                        {/* Edição rápida de preço e estoque */}
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-gray-500">R$</span>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              defaultValue={produto.preco}
                              onBlur={(e) => handleEditarPreco(produto.id, e.target.value)}
                              className="w-24 h-8 text-sm"
                            />
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-4 h-4 text-gray-400" />
                            <Input
                              type="number"
                              min="0"
                              defaultValue={produto.estoque}
                              onBlur={(e) => handleEditarEstoque(produto.id, e.target.value)}
                              className={`w-20 h-8 text-sm ${
                                produto.estoque <= 5 ? 'border-red-300 focus:border-red-500' : ''
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <Badge variant={produto.isAtivo ? 'default' : 'secondary'}>
                          {produto.isAtivo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        <p className={`text-sm mt-1 ${
                          produto.estoqueDisponivel <= 5 ? 'text-red-600 font-medium' : 'text-gray-500'
                        }`}>
                          {produto.estoqueDisponivel} em estoque
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        setProdutoEditando({
                          id: produto.id,
                          nome: produto.nome,
                          preco: produto.preco,
                          precoPromocional: produto.precoPromocional || '',
                          estoque: produto.estoque,
                          tipoOperacao: produto.tipoOperacao,
                          isAtivo: produto.isAtivo,
                        });
                        setDialogEditarAberto(true);
                      }}>
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        onClick={() => handleAtivarDesativar(produto.id, !produto.isAtivo)}
                      >
                        {produto.isAtivo ? (
                          <>
                            <X className="w-4 h-4 mr-2" />
                            Desativar
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Ativar
                          </>
                        )}
                      </DropdownMenuItem>
                      
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => setProdutoExcluir(produto.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {produtosFiltrados.length === 0 && (
          <div className="text-center py-16">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Nenhum produto encontrado</h3>
            <p className="text-gray-500 mb-4">
              {termoBusca ? 'Tente outro termo de busca' : 'Cadastre seu primeiro produto'}
            </p>
            {!termoBusca && (
              <div className="flex gap-3 justify-center">
                <Button 
                  variant="outline"
                  onClick={() => setDialogImportarAberto(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importar CSV
                </Button>
                <Link to="/lojista/produtos/novo">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Produto
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialog Confirmar Exclusão */}
      <Dialog open={Boolean(produtoExcluir)} onOpenChange={() => setProdutoExcluir(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProdutoExcluir(null)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive"
              onClick={() => produtoExcluir && handleExcluirProduto(produtoExcluir)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Editar Produto */}
      <Dialog open={dialogEditarAberto} onOpenChange={setDialogEditarAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Produto</DialogTitle>
            <DialogDescription>
              Atualize as informações do produto
            </DialogDescription>
          </DialogHeader>

          {produtoEditando && (
            <div className="space-y-4 py-4">
              <div>
                <Label>Nome do Produto</Label>
                <Input 
                  value={produtoEditando.nome}
                  onChange={(e) => setProdutoEditando({...produtoEditando, nome: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Preço</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={produtoEditando.preco}
                    onChange={(e) => setProdutoEditando({...produtoEditando, preco: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Preço Promocional</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={produtoEditando.precoPromocional}
                    onChange={(e) => setProdutoEditando({...produtoEditando, precoPromocional: e.target.value})}
                    placeholder="Opcional"
                  />
                </div>
              </div>

              <div>
                <Label>Estoque</Label>
                <Input 
                  type="number"
                  value={produtoEditando.estoque}
                  onChange={(e) => setProdutoEditando({...produtoEditando, estoque: e.target.value})}
                />
              </div>

              <div>
                <Label>Tipo de Operação</Label>
                <select 
                  className="w-full p-2 border rounded-lg mt-1"
                  value={produtoEditando.tipoOperacao}
                  onChange={(e) => setProdutoEditando({...produtoEditando, tipoOperacao: e.target.value})}
                >
                  <option value="venda_online">Entrega</option>
                  <option value="reserva_retirada">Retirada na Loja</option>
                  <option value="ambos">Ambos</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="editar-ativo"
                  checked={produtoEditando.isAtivo}
                  onCheckedChange={(checked) => setProdutoEditando({...produtoEditando, isAtivo: checked})}
                />
                <Label htmlFor="editar-ativo" className="font-normal cursor-pointer">
                  Produto ativo
                </Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogEditarAberto(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleSalvarEdicao}
            >
              <Check className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Importar CSV */}
      <Dialog open={dialogImportarAberto} onOpenChange={setDialogImportarAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Importar Produtos em Massa</DialogTitle>
            <DialogDescription>
              Você pode importar até {LIMITE_PRODUTOS - quantidadeProdutos} produtos
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800">
                <strong>Limite:</strong> Você tem {LIMITE_PRODUTOS - quantidadeProdutos} 
                slots disponíveis de {LIMITE_PRODUTOS}.
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={downloadTemplate} className="flex-1">
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Baixar Template
              </Button>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-2">
                Arraste um arquivo CSV ou clique para selecionar
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleImportarCSV}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload">
                <Button variant="outline" asChild>
                  <span>Selecionar Arquivo</span>
                </Button>
              </label>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg text-sm">
              <p className="font-medium mb-1">Formato esperado:</p>
              <code className="text-xs text-gray-600">
                Nome, Descrição, Preço, Estoque, Categoria, Tipo
              </code>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogImportarAberto(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
