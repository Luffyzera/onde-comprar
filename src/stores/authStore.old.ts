import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from '@/firebase/firebase';
import type { Usuario, Cliente } from '@/types';
import { useLojaStore } from './lojaStore';
import * as usuarioService from '@/services/usuarioService';

interface AuthState {
  user: Usuario | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: string | null;
  
  // Ações
  setUser: (user: Usuario | null) => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Métodos de autenticação
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, nome: string, tipo: 'cliente' | 'lojista', dadosLoja?: { nomeLoja?: string; cnpj?: string; telefone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  initAuthListener: () => () => void;
  
  // Getters
  isCliente: () => boolean;
  isLojista: () => boolean;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setFirebaseUser: (firebaseUser) => set({ firebaseUser }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      loginWithGoogle: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await signInWithPopup(auth, googleProvider);
          const firebaseUser = result.user;
          
          // Criar usuário cliente
          const cliente: Cliente = {
            id: firebaseUser.uid,
            nome: firebaseUser.displayName || 'Usuário',
            email: firebaseUser.email || '',
            fotoURL: firebaseUser.photoURL || undefined,
            tipo: 'cliente',
            telefone: firebaseUser.phoneNumber || undefined,
            enderecos: [],
            favoritos: [],
            createdAt: new Date()
          };
          
          set({ 
            firebaseUser, 
            user: cliente,
            isLoading: false 
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      loginWithEmail: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const result = await signInWithEmailAndPassword(auth, email, password);
          
          // Tentar buscar dados do usuário no Firestore
          let usuario = await usuarioService.getUsuarioById(result.user.uid);
          
          // Se não encontrou no Firestore, criar um usuário básico
          if (!usuario) {
            usuario = {
              id: result.user.uid,
              nome: result.user.displayName || 'Usuário',
              email: result.user.email || '',
              tipo: 'cliente', // Padrão é cliente
              createdAt: new Date()
            };
          }
          
          set({ 
            firebaseUser: result.user, 
            user: usuario,
            isLoading: false 
          });
        } catch (error: any) {
          let errorMessage = error.message;
          
          // Traduzir erros comuns do Firebase
          if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Email ou senha incorretos.';
          } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'Usuário não encontrado. Verifique seu email ou cadastre-se.';
          } else if (error.code === 'auth/wrong-password') {
            errorMessage = 'Senha incorreta.';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email inválido.';
          } else if (error.code === 'auth/too-many-requests') {
            errorMessage = 'Muitas tentativas. Tente novamente mais tarde.';
          }
          
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      registerWithEmail: async (email, password, nome, tipo, dadosLoja?: { nomeLoja?: string; cnpj?: string; telefone?: string }) => {
        set({ isLoading: true, error: null });
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = result.user;
          
          if (tipo === 'lojista') {
            // Criar loja para o lojista
            const lojaStore = useLojaStore.getState();
            const novaLoja = await lojaStore.criarLoja({
              nome: dadosLoja?.nomeLoja || nome,
              cnpj: dadosLoja?.cnpj || '',
              email,
              telefone: dadosLoja?.telefone || '',
              whatsapp: dadosLoja?.telefone || ''
            }, firebaseUser.uid);
            
            if (!novaLoja) {
              throw new Error('Erro ao criar loja');
            }
            
            // Criar usuário lojista no Firestore
            const lojista = await usuarioService.criarUsuarioLojista({
              id: firebaseUser.uid,
              nome,
              email,
              telefone: dadosLoja?.telefone,
              lojaId: novaLoja.id,
              assinatura: novaLoja.assinatura
            });
            
            if (!lojista) {
              throw new Error('Erro ao criar usuário lojista');
            }
            
            set({ 
              firebaseUser, 
              user: lojista,
              isLoading: false 
            });
          } else {
            // Criar usuário cliente no Firestore
            const cliente = await usuarioService.criarUsuarioCliente({
              id: firebaseUser.uid,
              nome,
              email,
              telefone: dadosLoja?.telefone
            });
            
            if (!cliente) {
              throw new Error('Erro ao criar usuário cliente');
            }
            
            set({ 
              firebaseUser, 
              user: cliente,
              isLoading: false 
            });
          }
        } catch (error: any) {
          let errorMessage = error.message;
          
          // Traduzir erros comuns do Firebase
          if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Este email já está cadastrado. Use a opção "Entre aqui" para fazer login.';
          } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'Email inválido. Verifique o formato do email.';
          } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Senha muito fraca. Use pelo menos 6 caracteres.';
          } else if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Email ou senha incorretos.';
          }
          
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await signOut(auth);
          set({ 
            user: null, 
            firebaseUser: null, 
            isLoading: false,
            error: null 
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      initAuthListener: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (!firebaseUser) {
            set({ firebaseUser: null, user: null });
          } else {
            // Buscar dados do usuário no Firestore
            let usuario = await usuarioService.getUsuarioById(firebaseUser.uid);
            
            // Se não encontrou no Firestore, criar um usuário básico
            if (!usuario) {
              usuario = {
                id: firebaseUser.uid,
                nome: firebaseUser.displayName || 'Usuário',
                email: firebaseUser.email || '',
                tipo: 'cliente',
                createdAt: new Date()
              };
            }
            
            set({ firebaseUser, user: usuario });
          }
        });
        return unsubscribe;
      },

      isCliente: () => get().user?.tipo === 'cliente',
      isLojista: () => get().user?.tipo === 'lojista',
      isAuthenticated: () => !!get().firebaseUser
    }),
    {
      name: 'onde-comprar-auth',
      partialize: (state) => ({ user: state.user })
    }
  )
);
