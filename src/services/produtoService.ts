import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import type { Produto } from '@/types';

const PRODUTOS_COLLECTION = 'produtos';

// Converter dados do Firestore para o formato da aplicação
const converterProduto = (docSnap: any): Produto => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    dataAtualizacao: data.dataAtualizacao?.toDate() || new Date(),
    createdAt: data.createdAt?.toDate() || new Date(),
    categoria: data.categoria || { id: '1', nome: 'Sem categoria', icone: 'box', ordem: 1, createdAt: new Date() },
    loja: data.loja || { id: data.lojaId, nome: 'Loja', cnpj: '', telefone: '', whatsapp: '', email: '', endereco: {} as any, fazEntrega: true, fazRetirada: true, taxaEntrega: 0, tempoEntregaMin: 30, tempoEntregaMax: 60, raioEntregaKm: 10, horarioFuncionamento: {} as any, planoId: 'basico', plano: {} as any, isAtiva: true, createdAt: new Date(), updatedAt: new Date() },
  } as Produto;
};

// Buscar todos os produtos ativos
export const getProdutos = async (): Promise<Produto[]> => {
  try {
    const q = query(
      collection(db, PRODUTOS_COLLECTION),
      where('isAtivo', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(converterProduto);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
};

// Buscar produtos de uma loja específica
export const getProdutosPorLoja = async (lojaId: string): Promise<Produto[]> => {
  try {
    const q = query(
      collection(db, PRODUTOS_COLLECTION),
      where('lojaId', '==', lojaId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(converterProduto);
  } catch (error) {
    console.error('Erro ao buscar produtos da loja:', error);
    return [];
  }
};

// Buscar produto por ID
export const getProdutoById = async (id: string): Promise<Produto | null> => {
  try {
    const docRef = doc(db, PRODUTOS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return converterProduto(docSnap);
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    return null;
  }
};

// Criar novo produto
export const criarProduto = async (produto: Partial<Produto>): Promise<Produto | null> => {
  try {
    const produtoData = {
      ...produto,
      isAtivo: true,
      dataAtualizacao: serverTimestamp(),
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, PRODUTOS_COLLECTION), produtoData);
    
    return {
      id: docRef.id,
      ...produtoData,
      dataAtualizacao: new Date(),
      createdAt: new Date(),
    } as Produto;
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    return null;
  }
};

// Atualizar produto
export const atualizarProduto = async (id: string, dados: Partial<Produto>): Promise<boolean> => {
  try {
    const docRef = doc(db, PRODUTOS_COLLECTION, id);
    await updateDoc(docRef, {
      ...dados,
      dataAtualizacao: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    return false;
  }
};

// Excluir produto (soft delete - marca como inativo)
export const excluirProduto = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, PRODUTOS_COLLECTION, id);
    await updateDoc(docRef, {
      isAtivo: false,
      dataAtualizacao: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    return false;
  }
};

// Deletar permanentemente (hard delete)
export const deletarProdutoPermanente = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, PRODUTOS_COLLECTION, id));
    return true;
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    return false;
  }
};

// Buscar produtos por categoria
export const getProdutosPorCategoria = async (categoriaId: string): Promise<Produto[]> => {
  try {
    const q = query(
      collection(db, PRODUTOS_COLLECTION),
      where('categoriaId', '==', categoriaId),
      where('isAtivo', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(converterProduto);
  } catch (error) {
    console.error('Erro ao buscar produtos por categoria:', error);
    return [];
  }
};

// Pesquisar produtos
export const pesquisarProdutos = async (termo: string): Promise<Produto[]> => {
  try {
    // Como o Firestore não suporta busca por texto parcial diretamente,
    // vamos buscar todos e filtrar no cliente (para volumes pequenos)
    // Em produção, considere usar Algolia ou ElasticSearch
    const q = query(
      collection(db, PRODUTOS_COLLECTION),
      where('isAtivo', '==', true),
      orderBy('nome')
    );
    const snapshot = await getDocs(q);
    const produtos = snapshot.docs.map(converterProduto);
    
    const termoLower = termo.toLowerCase();
    return produtos.filter(p =>
      p.nome.toLowerCase().includes(termoLower) ||
      p.descricao.toLowerCase().includes(termoLower)
    );
  } catch (error) {
    console.error('Erro ao pesquisar produtos:', error);
    return [];
  }
};
