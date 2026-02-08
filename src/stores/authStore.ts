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
import type { Usuario, Cliente, Lojista } from '@/types';

// Dados dos usuários em memória (simulando banco local)
const usuariosDB: Record<string, Usuario> = {};

interface AuthState {
  user: Usuario | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: Usuario | null) => void;
  setFirebaseUser: (user: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, nome: string, tipo: 'cliente' | 'lojista', dadosLoja?: any) => Promise<void>;
  logout: () => Promise<void>;
  initAuthListener: () => () => void;
  
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
          
          // Verificar se usuário já existe no nosso "banco"
          let usuario = usuariosDB[firebaseUser.uid];
          
          if (!usuario) {
            // Criar novo cliente
            usuario = {
              id: firebaseUser.uid,
              nome: firebaseUser.displayName || 'Usuário',
              email: firebaseUser.email || '',
              tipo: 'cliente',
              createdAt: new Date()
            };
            usuariosDB[firebaseUser.uid] = usuario;
          }
          
          set({ 
            firebaseUser, 
            user: usuario,
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
          const firebaseUser = result.user;
          
          // Buscar usuário no nosso "banco" local
          let usuario = usuariosDB[firebaseUser.uid];
          
          // Se não encontrou, criar um básico
          if (!usuario) {
            usuario = {
              id: firebaseUser.uid,
              nome: firebaseUser.displayName || email.split('@')[0],
              email: firebaseUser.email || email,
              tipo: 'cliente',
              createdAt: new Date()
            };
            usuariosDB[firebaseUser.uid] = usuario;
          }
          
          set({ 
            firebaseUser, 
            user: usuario,
            isLoading: false 
          });
        } catch (error: any) {
          let errorMessage = error.message;
          if (error.code === 'auth/invalid-credential') {
            errorMessage = 'Email ou senha incorretos.';
          } else if (error.code === 'auth/user-not-found') {
            errorMessage = 'Usuário não encontrado.';
          }
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },

      registerWithEmail: async (email, password, nome, tipo) => {
        set({ isLoading: true, error: null });
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password);
          const firebaseUser = result.user;
          
          let usuario: Usuario;
          
          if (tipo === 'lojista') {
            const lojista: Lojista = {
              id: firebaseUser.uid,
              nome,
              email,
              tipo: 'lojista',
              lojaId: firebaseUser.uid,
              createdAt: new Date()
            };
            usuario = lojista;
          } else {
            const cliente: Cliente = {
              id: firebaseUser.uid,
              nome,
              email,
              tipo: 'cliente',
              enderecos: [],
              favoritos: [],
              createdAt: new Date()
            };
            usuario = cliente;
          }
          
          // Salvar no "banco" local
          usuariosDB[firebaseUser.uid] = usuario;
          
          set({ 
            firebaseUser, 
            user: usuario,
            isLoading: false 
          });
        } catch (error: any) {
          let errorMessage = error.message;
          if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'Este email já está cadastrado. Use a opção "Entre aqui" para fazer login.';
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
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
          if (!firebaseUser) {
            set({ firebaseUser: null, user: null });
          } else {
            // Buscar ou criar usuário
            let usuario = usuariosDB[firebaseUser.uid];
            if (!usuario) {
              usuario = {
                id: firebaseUser.uid,
                nome: firebaseUser.displayName || 'Usuário',
                email: firebaseUser.email || '',
                tipo: 'cliente',
                createdAt: new Date()
              };
              usuariosDB[firebaseUser.uid] = usuario;
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
