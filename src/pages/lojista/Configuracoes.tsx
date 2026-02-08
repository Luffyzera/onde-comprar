import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Store, 
  Phone, 
  MapPin, 
  Clock,
  Save,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';

// Dados mockados da loja - em produção viriam do banco
interface LojaConfig {
  nome: string;
  telefone: string;
  whatsapp: string;
  endereco: string;
  horarioFuncionamento: {
    seg: { abre: string; fecha: string; aberto: boolean };
    ter: { abre: string; fecha: string; aberto: boolean };
    qua: { abre: string; fecha: string; aberto: boolean };
    qui: { abre: string; fecha: string; aberto: boolean };
    sex: { abre: string; fecha: string; aberto: boolean };
    sab: { abre: string; fecha: string; aberto: boolean };
    dom: { abre: string; fecha: string; aberto: boolean };
  };
}

export function LojistaConfiguracoes() {
  const { user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<LojaConfig>({
    nome: 'Minha Loja',
    telefone: '',
    whatsapp: '',
    endereco: '',
    horarioFuncionamento: {
      seg: { abre: '08:00', fecha: '18:00', aberto: true },
      ter: { abre: '08:00', fecha: '18:00', aberto: true },
      qua: { abre: '08:00', fecha: '18:00', aberto: true },
      qui: { abre: '08:00', fecha: '18:00', aberto: true },
      sex: { abre: '08:00', fecha: '18:00', aberto: true },
      sab: { abre: '08:00', fecha: '14:00', aberto: true },
      dom: { abre: '', fecha: '', aberto: false },
    }
  });

  // Carregar configurações salvas
  useEffect(() => {
    const saved = localStorage.getItem(`loja-config-${user?.id}`);
    if (saved) {
      setConfig(JSON.parse(saved));
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    
    // Salvar no localStorage (em produção, salvar no Firebase)
    localStorage.setItem(`loja-config-${user?.id}`, JSON.stringify(config));
    
    toast.success('Configurações salvas com sucesso!');
    setIsLoading(false);
  };

  // Gerar link do WhatsApp
  const getWhatsAppLink = () => {
    const numero = config.whatsapp.replace(/\D/g, '');
    return `https://wa.me/55${numero}`;
  };

  const diasSemana = [
    { key: 'seg', label: 'Segunda' },
    { key: 'ter', label: 'Terça' },
    { key: 'qua', label: 'Quarta' },
    { key: 'qui', label: 'Quinta' },
    { key: 'sex', label: 'Sexta' },
    { key: 'sab', label: 'Sábado' },
    { key: 'dom', label: 'Domingo' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/lojista/dashboard">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Configurações da Loja</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-600" />
                Informações da Loja
              </h2>

              <div>
                <Label htmlFor="nome">Nome da Loja</Label>
                <Input
                  id="nome"
                  value={config.nome}
                  onChange={(e) => setConfig({ ...config, nome: e.target.value })}
                  placeholder="Ex: TechStore Centro"
                />
              </div>

              <div>
                <Label htmlFor="endereco">Endereço</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="endereco"
                    value={config.endereco}
                    onChange={(e) => setConfig({ ...config, endereco: e.target.value })}
                    placeholder="Rua, número, bairro, cidade"
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contato e WhatsApp */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-emerald-600" />
                Contato e WhatsApp
              </h2>

              <div>
                <Label htmlFor="telefone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    id="telefone"
                    value={config.telefone}
                    onChange={(e) => setConfig({ ...config, telefone: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="whatsapp">WhatsApp (para clientes)</Label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
                  <Input
                    id="whatsapp"
                    value={config.whatsapp}
                    onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Os clientes serão redirecionados para este número via WhatsApp
                </p>
              </div>

              {config.whatsapp && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800 font-medium">Link do WhatsApp:</p>
                  <a 
                    href={getWhatsAppLink()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-green-600 hover:underline break-all"
                  >
                    {getWhatsAppLink()}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Horário de Funcionamento */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Horário de Funcionamento
              </h2>

              <div className="space-y-3">
                {diasSemana.map((dia) => (
                  <div key={dia.key} className="flex items-center gap-3">
                    <div className="w-24">
                      <span className="text-sm font-medium">{dia.label}</span>
                    </div>
                    
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.horarioFuncionamento[dia.key].aberto}
                        onChange={(e) => setConfig({
                          ...config,
                          horarioFuncionamento: {
                            ...config.horarioFuncionamento,
                            [dia.key]: {
                              ...config.horarioFuncionamento[dia.key],
                              aberto: e.target.checked
                            }
                          }
                        })}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm">Aberto</span>
                    </label>

                    {config.horarioFuncionamento[dia.key].aberto && (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          type="time"
                          value={config.horarioFuncionamento[dia.key].abre}
                          onChange={(e) => setConfig({
                            ...config,
                            horarioFuncionamento: {
                              ...config.horarioFuncionamento,
                              [dia.key]: {
                                ...config.horarioFuncionamento[dia.key],
                                abre: e.target.value
                              }
                            }
                          })}
                          className="w-24"
                        />
                        <span className="text-gray-500">até</span>
                        <Input
                          type="time"
                          value={config.horarioFuncionamento[dia.key].fecha}
                          onChange={(e) => setConfig({
                            ...config,
                            horarioFuncionamento: {
                              ...config.horarioFuncionamento,
                              [dia.key]: {
                                ...config.horarioFuncionamento[dia.key],
                                fecha: e.target.value
                              }
                            }
                          })}
                          className="w-24"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
