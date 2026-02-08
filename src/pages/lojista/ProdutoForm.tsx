import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  Upload, 
  Plus,
  X,
  Save,
  Package,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Check,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useProdutoStore } from '@/stores/produtoStore';
import { useAuthStore } from '@/stores/authStore';
import { useLojaStore } from '@/stores/lojaStore';
import type { Produto, Categoria } from '@/types';

const categoriasPadrao: Categoria[] = [
  { id: '1', nome: 'Smartphones', icone: 'smartphone', ordem: 1, createdAt: new Date() },
  { id: '2', nome: 'Acessórios', icone: 'headphones', ordem: 2, createdAt: new Date() },
  { id: '3', nome: 'Eletrônicos', icone: 'tv', ordem: 3, createdAt: new Date() },
  { id: '4', nome: 'Informática', icone: 'laptop', ordem: 4, createdAt: new Date() },
  { id: '5', nome: 'Áudio', icone: 'speaker', ordem: 5, createdAt: new Date() },
  { id: '6', nome: 'Gaming', icone: 'gamepad', ordem: 6, createdAt: new Date() },
  { id: '7', nome: 'Casa Inteligente', icone: 'home', ordem: 7, createdAt: new Date() },
  { id: '8', nome: 'Fotografia', icone: 'camera', ordem: 8, createdAt: new Date() },
];

// Componente de upload de imagem
function ImageUpload({ 
  imagens, 
  onChange,
  maxImages = 5 
}: { 
  imagens: string[]; 
  onChange: (imagens: string[]) => void;
  maxImages?: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (imagens.length + files.length > maxImages) {
      toast.error(`Máximo de ${maxImages} imagens permitidas`);
      return;
    }

    Array.from(files).forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`A imagem ${file.name} é muito grande. Máximo 5MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          onChange([...imagens, event.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    onChange(imagens.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {imagens.map((img, index) => (
          <div key={index} className="relative group">
            <img
              src={img}
              alt={`Produto ${index + 1}`}
              className="w-24 h-24 object-cover rounded-lg border"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full 
                         flex items-center justify-center opacity-0 group-hover:opacity-100 
                         transition-opacity shadow-lg"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        
        {imagens.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg 
                       flex flex-col items-center justify-center gap-1
                       hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
          >
            <Upload className="w-6 h-6 text-gray-400" />
            <span className="text-xs text-gray-500">Adicionar</span>
          </button>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />
      
      <p className="text-xs text-gray-500">
        {imagens.length} de {maxImages} imagens • Máx 5MB cada
      </p>
    </div>
  );
}

// Componente de importação em massa
function ImportacaoMassaDialog({ 
  open, 
  onClose, 
  onImport 
}: { 
  open: boolean; 
  onClose: () => void;
  onImport: (produtos: Partial<Produto>[]) => void;
}) {
  const [preview, setPreview] = useState<Partial<Produto>[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      
      // Pular cabeçalho
      const dataLines = lines.slice(1);
      
      const produtos: Partial<Produto>[] = dataLines.map((line, index) => {
        const cols = line.split(',').map(c => c.trim());
        return {
          id: `import-${Date.now()}-${index}`,
          nome: cols[0] || '',
          descricao: cols[1] || '',
          preco: parseFloat(cols[2]) || 0,
          estoque: parseInt(cols[3]) || 0,
          categoriaId: cols[4] || '1',
          tipoOperacao: (cols[5] as any) || 'venda_online',
          isAtivo: true,
        };
      }).filter(p => p.nome); // Só produtos com nome

      setPreview(produtos);
    };
    reader.readAsText(file);
  };

  const handleConfirm = () => {
    onImport(preview);
    setPreview([]);
    onClose();
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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Importar Produtos em Massa</DialogTitle>
          <DialogDescription>
            Faça upload de um arquivo CSV com seus produtos
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex gap-3">
            <Button variant="outline" onClick={downloadTemplate}>
              <Download className="w-4 h-4 mr-2" />
              Baixar Template
            </Button>
            <Button onClick={() => fileInputRef.current?.click()}>
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Selecionar Arquivo CSV
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />

          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p className="font-medium mb-2">Formato esperado:</p>
            <code className="text-xs text-gray-600 block">
              Nome, Descrição, Preço, Estoque, Categoria, Tipo de Operação
            </code>
            <p className="text-xs text-gray-500 mt-2">
              Categorias: 1=Smartphones, 2=Acessórios, 3=Eletrônicos, etc.
              <br />
              Tipo: venda_online, retirada, ambos
            </p>
          </div>

          {preview.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b">
                <p className="font-medium">Pré-visualização ({preview.length} produtos)</p>
              </div>
              <div className="max-h-48 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left">Nome</th>
                      <th className="px-4 py-2 text-left">Preço</th>
                      <th className="px-4 py-2 text-left">Estoque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((p, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-4 py-2">{p.nome}</td>
                        <td className="px-4 py-2">
                          {p.preco?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </td>
                        <td className="px-4 py-2">{p.estoque}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={preview.length === 0}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <Check className="w-4 h-4 mr-2" />
            Importar {preview.length} Produtos
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function LojistaProdutoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { produtos, addProduto, updateProduto, getProdutosPorLoja } = useProdutoStore();
  const { user } = useAuthStore();
  const isEditing = Boolean(id);

  // Estados do formulário
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState('');
  const [precoPromocional, setPrecoPromocional] = useState('');
  const [estoque, setEstoque] = useState('');
  const [imagens, setImagens] = useState<string[]>([]);
  const [categoriaId, setCategoriaId] = useState('1');
  const [tipoOperacao, setTipoOperacao] = useState<'venda_online' | 'reserva_retirada' | 'ambos'>('venda_online');
  const [isAtivo, setIsAtivo] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // Dialog de importação
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // Carregar produto se estiver editando
  useEffect(() => {
    if (isEditing && id) {
      const produto = produtos.find(p => p.id === id);
      if (produto) {
        setNome(produto.nome);
        setDescricao(produto.descricao);
        setPreco(produto.preco.toString());
        setPrecoPromocional(produto.precoPromocional?.toString() || '');
        setEstoque(produto.estoque.toString());
        setImagens(produto.imagens);
        setCategoriaId(produto.categoriaId);
        setTipoOperacao(produto.tipoOperacao);
        setIsAtivo(produto.isAtivo);
      }
    }
  }, [isEditing, id, produtos]);

  // Verificar limite de produtos
  const lojaId = user?.id || 'loja1'; // Usar ID do usuário logado
  const { getLojaByUsuarioId, getLimiteProdutos } = useLojaStore();
  const loja = user ? getLojaByUsuarioId(user.id) : null;
  const produtosDaLoja = getProdutosPorLoja(lojaId);
  const quantidadeProdutos = produtosDaLoja.length;
  const LIMITE_PRODUTOS = loja ? getLimiteProdutos(loja.id) : 50;
  const atingiuLimite = quantidadeProdutos >= LIMITE_PRODUTOS && !isEditing;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (atingiuLimite) {
      toast.error(`Você atingiu o limite de ${LIMITE_PRODUTOS} produtos`);
      return;
    }

    if (imagens.length === 0) {
      toast.error('Adicione pelo menos uma imagem do produto');
      return;
    }

    setIsLoading(true);

    try {
      const categoria = categoriasPadrao.find(c => c.id === categoriaId) || categoriasPadrao[0];
      
      const produtoData: Partial<Produto> = {
        nome,
        descricao,
        preco: parseFloat(preco),
        precoPromocional: precoPromocional ? parseFloat(precoPromocional) : undefined,
        estoque: parseInt(estoque),
        estoqueDisponivel: parseInt(estoque),
        estoqueReservado: 0,
        imagens,
        categoriaId,
        categoria,
        lojaId,
        tipoOperacao,
        isAtivo,
        dataAtualizacao: new Date(),
      };

      if (isEditing && id) {
        updateProduto(id, produtoData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        addProduto(produtoData);
        toast.success('Produto cadastrado com sucesso!');
      }

      navigate('/lojista/produtos');
    } catch (error) {
      toast.error('Erro ao salvar produto');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = (produtosImportados: Partial<Produto>[]) => {
    const disponivel = LIMITE_PRODUTOS - quantidadeProdutos;
    
    if (produtosImportados.length > disponivel) {
      toast.error(`Você pode importar apenas ${disponivel} produtos. Limite: ${LIMITE_PRODUTOS}`);
      return;
    }

    produtosImportados.forEach((p, index) => {
      const categoria = categoriasPadrao.find(c => c.id === p.categoriaId) || categoriasPadrao[0];
      setTimeout(() => {
        addProduto({
          ...p,
          imagens: ['/placeholder-product.png'],
          categoria,
          lojaId,
          estoqueDisponivel: p.estoque || 0,
          estoqueReservado: 0,
          dataAtualizacao: new Date(),
        });
      }, index * 100);
    });

    toast.success(`${produtosImportados.length} produtos importados com sucesso!`);
    navigate('/lojista/produtos');
  };

  if (atingiuLimite && !isEditing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to="/lojista/produtos">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Novo Produto</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-lg mx-auto">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Limite de Produtos Atingido
              </h2>
              <p className="text-gray-600 mb-6">
                Você já cadastrou {LIMITE_PRODUTOS} produtos, que é o limite permitido 
                para o seu plano atual.
              </p>
              <div className="flex gap-3 justify-center">
                <Link to="/lojista/produtos">
                  <Button variant="outline">
                    Voltar para Produtos
                  </Button>
                </Link>
                <Link to="/lojista/planos">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Ver Planos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/lojista/produtos">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">
                {isEditing ? 'Editar Produto' : 'Novo Produto'}
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Badge de limite */}
              <Badge 
                variant={quantidadeProdutos >= LIMITE_PRODUTOS ? "destructive" : "secondary"}
                className="hidden sm:flex"
              >
                {quantidadeProdutos}/{LIMITE_PRODUTOS} produtos
              </Badge>

              {!isEditing && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setImportDialogOpen(true)}>
                        <FileSpreadsheet className="w-4 h-4 mr-2" />
                        Importar CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              <Button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditing ? 'Salvar' : 'Cadastrar'}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Alerta de limite próximo */}
            {quantidadeProdutos >= LIMITE_PRODUTOS - 5 && !isEditing && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">
                    Você tem {LIMITE_PRODUTOS - quantidadeProdutos} slots restantes
                  </p>
                  <p className="text-sm text-amber-700">
                    Aproveite para cadastrar seus melhores produtos!
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Coluna principal */}
              <div className="lg:col-span-2 space-y-6">
                {/* Informações básicas */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h2 className="font-semibold flex items-center gap-2">
                      <Package className="w-5 h-5 text-emerald-600" />
                      Informações do Produto
                    </h2>

                    <div>
                      <Label htmlFor="nome">Nome do Produto *</Label>
                      <Input
                        id="nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        placeholder="Ex: iPhone 15 Pro Max 256GB"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={descricao}
                        onChange={(e) => setDescricao(e.target.value)}
                        placeholder="Descreva as características do produto..."
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="preco">Preço *</Label>
                        <Input
                          id="preco"
                          type="number"
                          step="0.01"
                          min="0"
                          value={preco}
                          onChange={(e) => setPreco(e.target.value)}
                          placeholder="0,00"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="precoPromocional">Preço Promocional</Label>
                        <Input
                          id="precoPromocional"
                          type="number"
                          step="0.01"
                          min="0"
                          value={precoPromocional}
                          onChange={(e) => setPrecoPromocional(e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="estoque">Estoque *</Label>
                      <Input
                        id="estoque"
                        type="number"
                        min="0"
                        value={estoque}
                        onChange={(e) => setEstoque(e.target.value)}
                        placeholder="Quantidade disponível"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Imagens */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-semibold flex items-center gap-2 mb-4">
                      <Upload className="w-5 h-5 text-emerald-600" />
                      Imagens do Produto
                    </h2>
                    <ImageUpload imagens={imagens} onChange={setImagens} />
                  </CardContent>
                </Card>
              </div>

              {/* Coluna lateral */}
              <div className="space-y-6">
                {/* Categoria e tipo */}
                <Card>
                  <CardContent className="p-6 space-y-4">
                    <h2 className="font-semibold">Categoria e Tipo</h2>

                    <div>
                      <Label htmlFor="categoria">Categoria *</Label>
                      <select
                        id="categoria"
                        value={categoriaId}
                        onChange={(e) => setCategoriaId(e.target.value)}
                        className="w-full p-2 border rounded-lg mt-1"
                        required
                      >
                        {categoriasPadrao.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.nome}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="tipoOperacao">Tipo de Operação *</Label>
                      <select
                        id="tipoOperacao"
                        value={tipoOperacao}
                        onChange={(e) => setTipoOperacao(e.target.value as any)}
                        className="w-full p-2 border rounded-lg mt-1"
                        required
                      >
                        <option value="venda_online">Entrega</option>
                        <option value="reserva_retirada">Retirada na Loja</option>
                        <option value="ambos">Ambos</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <Checkbox
                        id="isAtivo"
                        checked={isAtivo}
                        onCheckedChange={(checked) => setIsAtivo(checked as boolean)}
                      />
                      <Label htmlFor="isAtivo" className="font-normal cursor-pointer">
                        Produto ativo e visível
                      </Label>
                    </div>
                  </CardContent>
                </Card>

                {/* Resumo */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="font-semibold mb-4">Resumo</h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status:</span>
                        <Badge variant={isAtivo ? "default" : "secondary"}>
                          {isAtivo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Imagens:</span>
                        <span>{imagens.length} adicionadas</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Produtos:</span>
                        <span className={quantidadeProdutos >= LIMITE_PRODUTOS ? 'text-red-600 font-medium' : ''}>
                          {quantidadeProdutos}/{LIMITE_PRODUTOS}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Dialog de importação */}
      <ImportacaoMassaDialog
        open={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        onImport={handleImport}
      />
    </div>
  );
}
