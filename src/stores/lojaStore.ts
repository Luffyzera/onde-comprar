import { create } from 'zustand';
import type { Loja, Plano } from '@/types';
import * as lojaService from '@/services/lojaService';

// Exportar planos
export const PLANOS = lojaService.PLANOS;

interface LojaState {
  lojas: Loja[];
  planos: Plano[];
  lojaAtual: Loja | null;
  isLoading: boolean;
  
  // Ações
  setLojaAtual: (loja: Loja | null) => void;
  carregarLoja: (id: string) => Promise<void>;
  carregarLojaPorUsuario: (usuarioId: string) => Promise<void>;
  getLojaById: (id: string) => Loja | undefined;
  getLojaByUsuarioId: (usuarioId: string) => Loja | null;
  getLimiteProdutos: (lojaId: string) => number;
  getDiasRestantesTrial: (lojaId: string) => number;
  isTrialAtivo: (lojaId: string) => boolean;
  
  // CRUD
  criarLoja: (dados: Partial<Loja>, usuarioId: string) => Promise<Loja | null>;
  atualizarLoja: (id: string, dados: Partial<Loja>) => Promise<boolean>;
  atualizarAssinatura: (lojaId: string, planoId: string) => Promise<boolean>;
  cancelarAssinatura: () => Promise<boolean>;
}

export const useLojaStore = create<LojaState>((set, get) => ({
  lojas: [],
  planos: PLANOS,
  lojaAtual: null,
  isLoading: false,

  setLojaAtual: (loja) => set({ lojaAtual: loja }),

  carregarLoja: async (id: string) => {
    set({ isLoading: true });
    try {
      const loja = await lojaService.getLojaById(id);
      if (loja) {
        set({ lojaAtual: loja });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  carregarLojaPorUsuario: async (usuarioId: string) => {
    set({ isLoading: true });
    try {
      const loja = await lojaService.getLojaByUsuarioId(usuarioId);
      if (loja) {
        set({ lojaAtual: loja });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  getLojaById: (id: string) => {
    return get().lojas.find((l: Loja) => l.id === id) || get().lojaAtual || undefined;
  },

  getLojaByUsuarioId: (usuarioId: string) => {
    const loja = get().lojas.find((l: Loja) => l.id === usuarioId) || get().lojaAtual;
    return loja || null;
  },

  getLimiteProdutos: (lojaId: string) => {
    const loja = get().getLojaById(lojaId);
    if (!loja) return 50;
    return loja.plano?.limiteProdutos || 50;
  },

  getDiasRestantesTrial: (lojaId: string) => {
    const loja = get().getLojaById(lojaId);
    if (!loja) return 0;
    return lojaService.getDiasRestantesTrial(loja);
  },

  isTrialAtivo: (lojaId: string) => {
    const loja = get().getLojaById(lojaId);
    if (!loja) return false;
    return lojaService.isTrialAtivo(loja);
  },

  criarLoja: async (dados: Partial<Loja>, usuarioId: string) => {
    set({ isLoading: true });
    try {
      const novaLoja = await lojaService.criarLoja(dados, usuarioId);
      if (novaLoja) {
        set({ 
          lojaAtual: novaLoja,
          lojas: [...get().lojas, novaLoja]
        });
      }
      return novaLoja;
    } finally {
      set({ isLoading: false });
    }
  },

  atualizarLoja: async (id: string, dados: Partial<Loja>) => {
    const sucesso = await lojaService.atualizarLoja(id, dados);
    if (sucesso) {
      set((state) => ({
        lojas: state.lojas.map((l: Loja) => 
          l.id === id 
            ? { ...l, ...dados, updatedAt: new Date() }
            : l
        ),
        lojaAtual: state.lojaAtual?.id === id 
          ? { ...state.lojaAtual, ...dados, updatedAt: new Date() }
          : state.lojaAtual
      }));
    }
    return sucesso;
  },

  atualizarAssinatura: async (lojaId: string, planoId: string) => {
    const sucesso = await lojaService.atualizarAssinatura(lojaId, planoId);
    if (sucesso) {
      const lojaAtualizada = await lojaService.getLojaById(lojaId);
      if (lojaAtualizada) {
        set((state) => ({
          lojas: state.lojas.map((l: Loja) => l.id === lojaId ? lojaAtualizada : l),
          lojaAtual: state.lojaAtual?.id === lojaId ? lojaAtualizada : state.lojaAtual
        }));
      }
    }
    return sucesso;
  },

  cancelarAssinatura: async () => {
    return true;
  }
}));
