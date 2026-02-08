import { create } from 'zustand';
import type { Produto, Loja, Categoria } from '@/types';
import { lojasItabuna, categoriasItabuna, produtosItabuna } from '@/data/dadosItabuna';
import * as produtoService from '@/services/produtoService';

// Dados mockados para fallback ou quando não houver conexão
const lojasMock: Loja[] = lojasItabuna as Loja[];
const categoriasMock: Categoria[] = categoriasItabuna as Categoria[];
const produtosMock: Produto[] = produtosItabuna as Produto[];

interface ProdutoState {
  produtos: Produto[];
  lojas: Loja[];
  categorias: Categoria[];
  produtoSelecionado: Produto | null;
  isLoading: boolean;
  
  // Ações de leitura
  setProdutoSelecionado: (produto: Produto | null) => void;
  carregarProdutos: () => Promise<void>;
  carregarProdutosPorLoja: (lojaId: string) => Promise<void>;
  buscarProdutos: (termo: string, categoriaId?: string) => Produto[];
  getProdutosPorLoja: (lojaId: string) => Produto[];
  getProdutosPorCategoria: (categoriaId: string) => Produto[];
  getLojasProximas: (lat: number, lng: number, raioKm?: number) => Loja[];
  calcularDistancia: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
  getProdutoById: (id: string) => Produto | undefined;
  contarProdutosPorLoja: (lojaId: string) => number;
  
  // Ações de escrita (CRUD)
  addProduto: (produto: Partial<Produto>) => Promise<Produto | null>;
  updateProduto: (id: string, dados: Partial<Produto>) => Promise<boolean>;
  deleteProduto: (id: string) => Promise<boolean>;
  addProdutosEmMassa: (produtos: Partial<Produto>[]) => Promise<number>;
}

export const useProdutoStore = create<ProdutoState>((set, get) => ({
  produtos: produtosMock, // Iniciar com dados mockados, depois carregar do Firebase
  lojas: lojasMock,
  categorias: categoriasMock,
  produtoSelecionado: null,
  isLoading: false,

  setProdutoSelecionado: (produto) => set({ produtoSelecionado: produto }),

  // Carregar todos os produtos do Firebase
  carregarProdutos: async () => {
    set({ isLoading: true });
    try {
      const produtos = await produtoService.getProdutos();
      if (produtos.length > 0) {
        set({ produtos });
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Carregar produtos de uma loja específica
  carregarProdutosPorLoja: async (lojaId: string) => {
    set({ isLoading: true });
    try {
      const produtos = await produtoService.getProdutosPorLoja(lojaId);
      set({ produtos });
    } catch (error) {
      console.error('Erro ao carregar produtos da loja:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  buscarProdutos: (termo, categoriaId) => {
    const { produtos } = get();
    let resultado = produtos;

    if (termo) {
      const termoLower = termo.toLowerCase();
      resultado = resultado.filter(p =>
        p.nome.toLowerCase().includes(termoLower) ||
        p.descricao.toLowerCase().includes(termoLower)
      );
    }

    if (categoriaId) {
      resultado = resultado.filter(p => p.categoriaId === categoriaId);
    }

    return resultado.filter(p => p.isAtivo);
  },

  getProdutosPorLoja: (lojaId) => {
    return get().produtos.filter(p => p.lojaId === lojaId && p.isAtivo);
  },

  getProdutosPorCategoria: (categoriaId) => {
    return get().produtos.filter(p => p.categoriaId === categoriaId && p.isAtivo);
  },

  getLojasProximas: (lat, lng, raioKm = 10) => {
    return get().lojas.filter(loja => {
      const distancia = get().calcularDistancia(
        lat, lng,
        loja.endereco.latitude,
        loja.endereco.longitude
      );
      return distancia <= raioKm && loja.isAtiva;
    });
  },

  calcularDistancia: (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Raio da Terra em km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  getProdutoById: (id) => {
    return get().produtos.find(p => p.id === id);
  },

  contarProdutosPorLoja: (lojaId) => {
    return get().produtos.filter(p => p.lojaId === lojaId && p.isAtivo).length;
  },

  // CRUD - Create (Firebase)
  addProduto: async (produto) => {
    const novoProduto = await produtoService.criarProduto(produto);
    if (novoProduto) {
      set((state) => ({
        produtos: [novoProduto, ...state.produtos]
      }));
    }
    return novoProduto;
  },

  // CRUD - Update (Firebase)
  updateProduto: async (id, dados) => {
    const sucesso = await produtoService.atualizarProduto(id, dados);
    if (sucesso) {
      set((state) => ({
        produtos: state.produtos.map(p => 
          p.id === id 
            ? { ...p, ...dados, dataAtualizacao: new Date() }
            : p
        )
      }));
    }
    return sucesso;
  },

  // CRUD - Delete (Firebase)
  deleteProduto: async (id) => {
    const sucesso = await produtoService.excluirProduto(id);
    if (sucesso) {
      set((state) => ({
        produtos: state.produtos.filter(p => p.id !== id)
      }));
    }
    return sucesso;
  },

  // Cadastro em massa (Firebase)
  addProdutosEmMassa: async (produtosParaAdicionar) => {
    let adicionados = 0;
    
    for (const produto of produtosParaAdicionar) {
      const resultado = await produtoService.criarProduto(produto);
      if (resultado) {
        adicionados++;
        // Adicionar ao estado local
        set((state) => ({
          produtos: [resultado, ...state.produtos]
        }));
      }
    }

    return adicionados;
  },
}));
