import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/firebase/firebase';
import type { Loja, Plano, Assinatura } from '@/types';

const LOJAS_COLLECTION = 'lojas';

// Planos disponíveis
export const PLANOS: Plano[] = [
  {
    id: 'basico',
    nome: 'Básico',
    preco: 49.90,
    limiteProdutos: 50,
    beneficios: [
      'Até 50 produtos',
      'Dashboard de vendas',
      'Pedidos via WhatsApp',
      'Suporte por email'
    ],
    createdAt: new Date()
  },
  {
    id: 'pro',
    nome: 'Profissional',
    preco: 99.90,
    limiteProdutos: 200,
    beneficios: [
      'Até 200 produtos',
      'Dashboard avançado',
      'Pedidos via WhatsApp',
      'Suporte prioritário',
      'Relatórios detalhados',
      'Destaque nas buscas'
    ],
    createdAt: new Date()
  },
  {
    id: 'empresarial',
    nome: 'Empresarial',
    preco: 199.90,
    limiteProdutos: 500,
    beneficios: [
      'Produtos ilimitados',
      'Dashboard completo',
      'API de integração',
      'Suporte 24/7',
      'Relatórios personalizados',
      'Destaque máximo',
      'Múltiplos usuários'
    ],
    createdAt: new Date()
  }
];

// Dias de trial para novos lojistas
const TRIAL_DIAS = 60; // 2 meses grátis

// Converter dados do Firestore
const converterLoja = (docSnap: any): Loja => {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    assinatura: data.assinatura ? {
      ...data.assinatura,
      dataInicio: data.assinatura.dataInicio?.toDate() || new Date(),
      dataFim: data.assinatura.dataFim?.toDate() || undefined,
      dataRenovacao: data.assinatura.dataRenovacao?.toDate() || undefined,
      createdAt: data.assinatura.createdAt?.toDate() || new Date(),
      updatedAt: data.assinatura.updatedAt?.toDate() || new Date(),
    } : undefined,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as Loja;
};

// Buscar todas as lojas ativas
export const getLojas = async (): Promise<Loja[]> => {
  try {
    const q = query(
      collection(db, LOJAS_COLLECTION),
      where('isAtiva', '==', true),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(converterLoja);
  } catch (error) {
    console.error('Erro ao buscar lojas:', error);
    return [];
  }
};

// Buscar loja por ID
export const getLojaById = async (id: string): Promise<Loja | null> => {
  try {
    const docRef = doc(db, LOJAS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return converterLoja(docSnap);
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar loja:', error);
    return null;
  }
};

// Buscar loja por ID do usuário
export const getLojaByUsuarioId = async (usuarioId: string): Promise<Loja | null> => {
  try {
    const q = query(
      collection(db, LOJAS_COLLECTION),
      where('usuarioId', '==', usuarioId)
    );
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return converterLoja(snapshot.docs[0]);
    }
    return null;
  } catch (error) {
    console.error('Erro ao buscar loja do usuário:', error);
    return null;
  }
};

// Criar nova loja com trial
export const criarLoja = async (dados: Partial<Loja>, usuarioId: string): Promise<Loja | null> => {
  try {
    const planoBasico = PLANOS.find(p => p.id === 'basico') || PLANOS[0];
    
    // Criar assinatura com trial
    const assinatura: Assinatura = {
      id: `assinatura-${Date.now()}`,
      lojaId: '', // Será preenchido depois
      planoId: planoBasico.id,
      plano: planoBasico,
      status: 'trial',
      dataInicio: new Date(),
      trialDiasRestantes: TRIAL_DIAS,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const lojaData = {
      ...dados,
      usuarioId,
      planoId: planoBasico.id,
      plano: planoBasico,
      assinatura,
      isAtiva: true,
      horarioFuncionamento: dados.horarioFuncionamento || {
        seg: { abre: '08:00', fecha: '18:00', aberto: true },
        ter: { abre: '08:00', fecha: '18:00', aberto: true },
        qua: { abre: '08:00', fecha: '18:00', aberto: true },
        qui: { abre: '08:00', fecha: '18:00', aberto: true },
        sex: { abre: '08:00', fecha: '18:00', aberto: true },
        sab: { abre: '08:00', fecha: '14:00', aberto: true },
        dom: { abre: '', fecha: '', aberto: false }
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, LOJAS_COLLECTION), lojaData);
    
    // Atualizar a assinatura com o ID correto da loja
    await updateDoc(docRef, {
      'assinatura.lojaId': docRef.id
    });

    return {
      id: docRef.id,
      ...lojaData,
      assinatura: {
        ...assinatura,
        lojaId: docRef.id
      },
      createdAt: new Date(),
      updatedAt: new Date()
    } as Loja;
  } catch (error) {
    console.error('Erro ao criar loja:', error);
    return null;
  }
};

// Atualizar loja
export const atualizarLoja = async (id: string, dados: Partial<Loja>): Promise<boolean> => {
  try {
    const docRef = doc(db, LOJAS_COLLECTION, id);
    await updateDoc(docRef, {
      ...dados,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Erro ao atualizar loja:', error);
    return false;
  }
};

// Atualizar assinatura da loja
export const atualizarAssinatura = async (lojaId: string, planoId: string): Promise<boolean> => {
  try {
    const plano = PLANOS.find(p => p.id === planoId);
    if (!plano) return false;

    const docRef = doc(db, LOJAS_COLLECTION, lojaId);
    
    const novaAssinatura = {
      lojaId,
      planoId: plano.id,
      plano,
      status: 'ativo',
      dataInicio: new Date(),
      dataRenovacao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 dias
      updatedAt: serverTimestamp()
    };

    await updateDoc(docRef, {
      planoId: plano.id,
      plano,
      assinatura: novaAssinatura,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao atualizar assinatura:', error);
    return false;
  }
};

// Calcular dias restantes do trial
export const getDiasRestantesTrial = (loja: Loja): number => {
  if (!loja.assinatura || loja.assinatura.status !== 'trial') return 0;
  
  const hoje = new Date();
  const inicio = loja.assinatura.dataInicio;
  const diffTime = hoje.getTime() - inicio.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, TRIAL_DIAS - diffDays);
};

// Verificar se trial está ativo
export const isTrialAtivo = (loja: Loja): boolean => {
  return getDiasRestantesTrial(loja) > 0;
};

// Desativar loja
export const desativarLoja = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, LOJAS_COLLECTION, id);
    await updateDoc(docRef, {
      isAtiva: false,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Erro ao desativar loja:', error);
    return false;
  }
};
