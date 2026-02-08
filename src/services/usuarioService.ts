import { 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import type { Usuario, Cliente, Lojista } from '@/types';

const USUARIOS_COLLECTION = 'usuarios';

// Buscar usuário por ID
export const getUsuarioById = async (id: string): Promise<Usuario | null> => {
  try {
    const docRef = doc(db, USUARIOS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
      } as Usuario;
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
};

// Criar usuário cliente
export const criarUsuarioCliente = async (dados: {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  fotoURL?: string;
}): Promise<Cliente | null> => {
  try {
    const cliente: Cliente = {
      id: dados.id,
      nome: dados.nome,
      email: dados.email,
      tipo: 'cliente',
      telefone: dados.telefone,
      fotoURL: dados.fotoURL,
      enderecos: [],
      favoritos: [],
      createdAt: new Date()
    };

    await setDoc(doc(db, USUARIOS_COLLECTION, dados.id), {
      ...cliente,
      createdAt: serverTimestamp(),
    });

    return cliente;
  } catch (error) {
    console.error('Erro ao criar usuário cliente:', error);
    return null;
  }
};

// Criar usuário lojista
export const criarUsuarioLojista = async (dados: {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  fotoURL?: string;
  lojaId: string;
  assinatura?: any;
}): Promise<Lojista | null> => {
  try {
    const lojista: Lojista = {
      id: dados.id,
      nome: dados.nome,
      email: dados.email,
      tipo: 'lojista',
      telefone: dados.telefone,
      fotoURL: dados.fotoURL,
      lojaId: dados.lojaId,
      assinatura: dados.assinatura,
      createdAt: new Date()
    };

    await setDoc(doc(db, USUARIOS_COLLECTION, dados.id), {
      ...lojista,
      createdAt: serverTimestamp(),
    });

    return lojista;
  } catch (error) {
    console.error('Erro ao criar usuário lojista:', error);
    return null;
  }
};
