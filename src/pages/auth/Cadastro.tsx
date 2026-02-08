import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Store,
  Check,
  Smartphone
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

export function Cadastro({ defaultTab }: { defaultTab?: 'cliente' | 'lojista' } = {}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [tipoCadastro, setTipoCadastro] = useState<'cliente' | 'lojista'>(defaultTab || 'cliente');
  
  // Se a URL for /lojista/cadastro, forçar aba lojista
  useEffect(() => {
    if (location.pathname === '/lojista/cadastro') {
      setTipoCadastro('lojista');
    }
  }, [location.pathname]);
  
  // Campos comuns
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [aceitarTermos, setAceitarTermos] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Campos lojista
  const [nomeLoja, setNomeLoja] = useState('');
  const [cnpj, setCnpj] = useState('');

  const { registerWithEmail, loginWithGoogle } = useAuthStore();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (senha !== confirmarSenha) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (!aceitarTermos) {
      toast.error('Você precisa aceitar os termos de uso');
      return;
    }

    setIsLoading(true);

    try {
      const dadosLoja = tipoCadastro === 'lojista' ? {
        nomeLoja,
        cnpj,
        telefone
      } : undefined;
      
      await registerWithEmail(email, senha, nome, tipoCadastro, dadosLoja);
      toast.success('Cadastro realizado com sucesso!');
      
      if (tipoCadastro === 'lojista') {
        navigate('/lojista/dashboard');
      } else {
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      toast.success('Cadastro realizado com sucesso!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar com Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Criar Conta</h1>
          <p className="text-gray-600">Comece a comprar ou vender hoje</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs value={tipoCadastro} onValueChange={(v) => setTipoCadastro(v as 'cliente' | 'lojista')}>
              <TabsList className="w-full mb-6">
                <TabsTrigger value="cliente" className="flex-1">
                  <User className="w-4 h-4 mr-2" />
                  Quero Comprar
                </TabsTrigger>
                <TabsTrigger value="lojista" className="flex-1">
                  <Store className="w-4 h-4 mr-2" />
                  Quero Vender
                </TabsTrigger>
              </TabsList>

              <TabsContent value="cliente">
                {/* Cadastro Google (apenas cliente) */}
                <Button 
                  variant="outline" 
                  className="w-full mb-4"
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Cadastrar com Google
                </Button>

                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Ou cadastre-se com email</span>
                  </div>
                </div>

                <form onSubmit={handleCadastro}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome-cliente">Nome Completo</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="nome-cliente"
                          placeholder="Seu nome"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email-cliente">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email-cliente"
                          type="email"
                          placeholder="seu@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="telefone-cliente">Telefone</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="telefone-cliente"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="senha-cliente">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="senha-cliente"
                          type={mostrarSenha ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          className="pl-10 pr-10"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {mostrarSenha ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="confirmar-senha-cliente">Confirmar Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="confirmar-senha-cliente"
                          type={mostrarSenha ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmarSenha}
                          onChange={(e) => setConfirmarSenha(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox 
                        id="termos-cliente" 
                        checked={aceitarTermos}
                        onCheckedChange={(checked) => setAceitarTermos(checked as boolean)}
                      />
                      <Label htmlFor="termos-cliente" className="text-sm font-normal leading-tight">
                        Aceito os{' '}
                        <Link to="/termos" className="text-emerald-600 hover:underline">Termos de Uso</Link>
                        {' '}e{' '}
                        <Link to="/privacidade" className="text-emerald-600 hover:underline">Política de Privacidade</Link>
                      </Label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Criar Conta
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <p className="text-center mt-4 text-sm">
                  Já tem conta?{' '}
                  <Link to="/login" className="text-emerald-600 hover:underline font-medium">
                    Entre aqui
                  </Link>
                </p>
              </TabsContent>

              <TabsContent value="lojista">
                <div className="bg-emerald-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-emerald-900">Vantagens de ser lojista:</p>
                      <ul className="text-sm text-emerald-700 mt-1 space-y-1">
                        <li>• Alcance milhares de clientes na sua região</li>
                        <li>• Sistema completo de gestão de pedidos</li>
                        <li>• Pagamento seguro e rápido</li>
                        <li>• Planos a partir de R$ 49,90/mês</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleCadastro}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nome-lojista">Seu Nome</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="nome-lojista"
                          placeholder="Nome completo"
                          value={nome}
                          onChange={(e) => setNome(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="nome-loja">Nome da Loja</Label>
                      <div className="relative">
                        <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="nome-loja"
                          placeholder="Nome da sua loja"
                          value={nomeLoja}
                          onChange={(e) => setNomeLoja(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        placeholder="00.000.000/0000-00"
                        value={cnpj}
                        onChange={(e) => setCnpj(e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="email-lojista">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="email-lojista"
                          type="email"
                          placeholder="sua@loja.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="telefone-lojista">Telefone</Label>
                      <div className="relative">
                        <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="telefone-lojista"
                          type="tel"
                          placeholder="(11) 99999-9999"
                          value={telefone}
                          onChange={(e) => setTelefone(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="senha-lojista">Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="senha-lojista"
                          type={mostrarSenha ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={senha}
                          onChange={(e) => setSenha(e.target.value)}
                          className="pl-10 pr-10"
                          required
                          minLength={6}
                        />
                        <button
                          type="button"
                          onClick={() => setMostrarSenha(!mostrarSenha)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                          {mostrarSenha ? (
                            <EyeOff className="w-4 h-4 text-gray-400" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="confirmar-senha-lojista">Confirmar Senha</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                          id="confirmar-senha-lojista"
                          type={mostrarSenha ? 'text' : 'password'}
                          placeholder="••••••••"
                          value={confirmarSenha}
                          onChange={(e) => setConfirmarSenha(e.target.value)}
                          className="pl-10"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Checkbox 
                        id="termos-lojista" 
                        checked={aceitarTermos}
                        onCheckedChange={(checked) => setAceitarTermos(checked as boolean)}
                      />
                      <Label htmlFor="termos-lojista" className="text-sm font-normal leading-tight">
                        Aceito os{' '}
                        <Link to="/termos" className="text-emerald-600 hover:underline">Termos de Uso</Link>
                        {' '}e{' '}
                        <Link to="/privacidade" className="text-emerald-600 hover:underline">Política de Privacidade</Link>
                      </Label>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          Cadastrar Loja
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>

                <p className="text-center mt-4 text-sm">
                  Já tem conta de lojista?{' '}
                  <Link to="/login" className="text-emerald-600 hover:underline font-medium">
                    Entre aqui
                  </Link>
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
