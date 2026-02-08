import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ItemCarrinho, Produto } from '@/types';

interface CartState {
  itens: ItemCarrinho[];
  lojaId: string | null;
  tipoEntrega: 'entrega' | 'retirada';
  taxaEntrega: number;
  
  // Getters
  getSubtotal: () => number;
  getTotal: () => number;
  getQuantidadeTotal: () => number;
  getItensPorLoja: () => Map<string, ItemCarrinho[]>;
  
  // Ações
  adicionarItem: (produto: Produto, quantidade: number, tipoEntrega: 'entrega' | 'retirada') => void;
  removerItem: (produtoId: string) => void;
  atualizarQuantidade: (produtoId: string, quantidade: number) => void;
  limparCarrinho: () => void;
  setTipoEntrega: (tipo: 'entrega' | 'retirada') => void;
  setTaxaEntrega: (taxa: number) => void;
  
  // Validação
  podeAdicionar: (produto: Produto) => { valido: boolean; mensagem?: string };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      itens: [],
      lojaId: null,
      tipoEntrega: 'retirada',
      taxaEntrega: 0,

      getSubtotal: () => {
        return get().itens.reduce((total, item) => {
          const preco = item.produto.precoPromocional || item.produto.preco;
          return total + (preco * item.quantidade);
        }, 0);
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const taxa = get().tipoEntrega === 'entrega' ? get().taxaEntrega : 0;
        return subtotal + taxa;
      },

      getQuantidadeTotal: () => {
        return get().itens.reduce((total, item) => total + item.quantidade, 0);
      },

      getItensPorLoja: () => {
        const map = new Map<string, ItemCarrinho[]>();
        get().itens.forEach(item => {
          const lojaId = item.produto.lojaId;
          if (!map.has(lojaId)) {
            map.set(lojaId, []);
          }
          map.get(lojaId)!.push(item);
        });
        return map;
      },

      adicionarItem: (produto, quantidade, tipoEntrega) => {
        const state = get();
        
        // Verificar se é da mesma loja
        if (state.lojaId && state.lojaId !== produto.lojaId) {
          // Substituir carrinho
          set({
            itens: [{
              produtoId: produto.id,
              produto,
              quantidade,
              tipoEntrega
            }],
            lojaId: produto.lojaId,
            tipoEntrega,
            taxaEntrega: tipoEntrega === 'entrega' ? produto.loja.taxaEntrega : 0
          });
          return;
        }

        // Verificar se item já existe
        const itemExistente = state.itens.find(item => item.produtoId === produto.id);
        
        if (itemExistente) {
          set({
            itens: state.itens.map(item =>
              item.produtoId === produto.id
                ? { ...item, quantidade: item.quantidade + quantidade }
                : item
            )
          });
        } else {
          set({
            itens: [...state.itens, {
              produtoId: produto.id,
              produto,
              quantidade,
              tipoEntrega
            }],
            lojaId: produto.lojaId,
            tipoEntrega,
            taxaEntrega: tipoEntrega === 'entrega' ? produto.loja.taxaEntrega : 0
          });
        }
      },

      removerItem: (produtoId) => {
        const state = get();
        const novosItens = state.itens.filter(item => item.produtoId !== produtoId);
        
        set({
          itens: novosItens,
          lojaId: novosItens.length > 0 ? state.lojaId : null
        });
      },

      atualizarQuantidade: (produtoId, quantidade) => {
        if (quantidade <= 0) {
          get().removerItem(produtoId);
          return;
        }
        
        set(state => ({
          itens: state.itens.map(item =>
            item.produtoId === produtoId
              ? { ...item, quantidade }
              : item
          )
        }));
      },

      limparCarrinho: () => {
        set({
          itens: [],
          lojaId: null,
          tipoEntrega: 'retirada',
          taxaEntrega: 0
        });
      },

      setTipoEntrega: (tipo) => {
        set(state => ({
          tipoEntrega: tipo,
          taxaEntrega: tipo === 'entrega' && state.itens.length > 0
            ? state.itens[0].produto.loja.taxaEntrega
            : 0
        }));
      },

      setTaxaEntrega: (taxa) => {
        set({ taxaEntrega: taxa });
      },

      podeAdicionar: (produto) => {
        const state = get();
        
        if (produto.estoqueDisponivel <= 0) {
          return { valido: false, mensagem: 'Produto fora de estoque' };
        }
        
        const itemExistente = state.itens.find(item => item.produtoId === produto.id);
        const quantidadeAtual = itemExistente?.quantidade || 0;
        
        if (quantidadeAtual + 1 > produto.estoqueDisponivel) {
          return { valido: false, mensagem: 'Quantidade máxima disponível atingida' };
        }
        
        if (state.lojaId && state.lojaId !== produto.lojaId) {
          return { 
            valido: true, 
            mensagem: 'Seu carrinho será substituído (produtos de loja diferente)' 
          };
        }
        
        return { valido: true };
      }
    }),
    {
      name: 'onde-comprar-carrinho'
    }
  )
);
