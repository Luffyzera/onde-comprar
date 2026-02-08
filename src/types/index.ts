// Tipos de Usuário
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  fotoURL?: string;
  tipo: 'cliente' | 'lojista';
  createdAt: Date;
}

export interface Cliente extends Usuario {
  tipo: 'cliente';
  enderecos: Endereco[];
  favoritos: string[]; // IDs de produtos
}

export interface Lojista extends Usuario {
  tipo: 'lojista';
  lojaId: string;
  assinatura?: Assinatura;
}

// Endereço
export interface Endereco {
  id: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  latitude: number;
  longitude: number;
  isPrincipal: boolean;
}

// Plano
export interface Plano {
  id: string;
  nome: string;
  preco: number;
  limiteProdutos: number;
  beneficios: string[];
  createdAt: Date;
}

// Assinatura da Loja
export interface Assinatura {
  id: string;
  lojaId: string;
  planoId: string;
  plano: Plano;
  status: 'trial' | 'ativo' | 'cancelado' | 'expirado';
  dataInicio: Date;
  dataFim?: Date;
  dataRenovacao?: Date;
  trialDiasRestantes?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Loja
export interface Loja {
  id: string;
  nome: string;
  cnpj: string;
  descricao?: string;
  logoURL?: string;
  bannerURL?: string;
  telefone: string;
  whatsapp: string;
  email: string;
  endereco: Endereco;
  
  // Configurações de entrega
  fazEntrega: boolean;
  fazRetirada: boolean;
  taxaEntrega: number;
  tempoEntregaMin: number;
  tempoEntregaMax: number;
  raioEntregaKm: number;
  
  // Horário de funcionamento
  horarioFuncionamento: {
    seg: { abre: string; fecha: string; aberto: boolean };
    ter: { abre: string; fecha: string; aberto: boolean };
    qua: { abre: string; fecha: string; aberto: boolean };
    qui: { abre: string; fecha: string; aberto: boolean };
    sex: { abre: string; fecha: string; aberto: boolean };
    sab: { abre: string; fecha: string; aberto: boolean };
    dom: { abre: string; fecha: string; aberto: boolean };
  };
  
  planoId: string;
  plano: Plano;
  assinatura?: Assinatura;
  isAtiva: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Categoria
export interface Categoria {
  id: string;
  nome: string;
  icone: string;
  ordem: number;
  createdAt: Date;
}

// Produto
export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  precoPromocional?: number;
  estoque: number;
  estoqueDisponivel: number;
  estoqueReservado: number;
  imagens: string[];
  categoriaId: string;
  categoria: Categoria;
  lojaId: string;
  loja: Loja;
  
  // Tipo de operação
  tipoOperacao: 'venda_online' | 'reserva_retirada' | 'ambos';
  formaPagamentoLoja?: 'dinheiro' | 'pix' | 'cartao' | 'pendente';
  
  isAtivo: boolean;
  dataAtualizacao: Date;
  createdAt: Date;
}

// Item do Carrinho
export interface ItemCarrinho {
  produtoId: string;
  produto: Produto;
  quantidade: number;
  tipoEntrega: 'entrega' | 'retirada';
}

// Carrinho
export interface Carrinho {
  id: string;
  clienteId: string;
  lojaId: string;
  itens: ItemCarrinho[];
  tipoEntrega: 'entrega' | 'retirada';
  taxaEntrega: number;
  subtotal: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

// Pedido
export interface Pedido {
  id: string;
  clienteId: string;
  cliente: Cliente;
  lojaId: string;
  loja: Loja;
  itens: ItemCarrinho[];
  
  // Tipo e status
  tipoOperacao: 'entrega' | 'retirada';
  status: StatusPedidoEntrega | StatusPedidoRetirada;
  
  // Valores
  subtotal: number;
  taxaEntrega: number;
  total: number;
  
  // Pagamento
  pagamentoNoApp: boolean;
  formaPagamento?: 'cartao' | 'pix' | 'dinheiro';
  statusPagamento?: 'pendente' | 'aprovado' | 'recusado' | 'estornado';
  valorRecebidoLoja?: number;
  
  // Entrega
  enderecoEntrega?: Endereco;
  entregadorNome?: string;
  entregadorTelefone?: string;
  
  // Retirada
  codigoConfirmacao?: string;
  dataExpiracao?: Date;
  
  // Timeline
  dataPedido: Date;
  dataConfirmacao?: Date;
  dataPreparo?: Date;
  dataEnvio?: Date;
  dataEntrega?: Date;
  dataConclusao?: Date;
  
  // Avaliação
  avaliacao?: {
    nota: number;
    comentario: string;
    data: Date;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

export type StatusPedidoEntrega = 
  | 'pendente'
  | 'pago'
  | 'confirmado'
  | 'em_preparo'
  | 'enviado'
  | 'entregue'
  | 'concluido'
  | 'cancelado';

export type StatusPedidoRetirada = 
  | 'reservado'
  | 'confirmado'
  | 'pronto_retirada'
  | 'pago_na_loja'
  | 'concluido'
  | 'cancelado'
  | 'expirado';

// Clique WhatsApp
export interface CliqueWhatsApp {
  id: string;
  lojaId: string;
  produtoId?: string;
  clienteId?: string;
  data: Date;
}

// Notificação
export interface Notificacao {
  id: string;
  usuarioId: string;
  titulo: string;
  mensagem: string;
  tipo: 'pedido' | 'promocao' | 'sistema';
  lida: boolean;
  data: Date;
}
