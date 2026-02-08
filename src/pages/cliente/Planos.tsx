import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  Check, 
  X, 
  Zap, 
  TrendingUp, 
  Crown,
  ArrowRight,
  HelpCircle,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const planos = [
  {
    id: 'basico',
    nome: 'Básico',
    preco: 49.90,
    descricao: 'Ideal para lojas pequenas que estão começando',
    icone: Store,
    cor: 'emerald',
    popular: false,
    recursos: [
      { nome: 'Até 50 produtos cadastrados', incluido: true },
      { nome: 'Visibilidade na busca local', incluido: true },
      { nome: 'Recebimento de pedidos online', incluido: true },
      { nome: 'Suporte por email', incluido: true },
      { nome: 'Relatórios básicos', incluido: true },
      { nome: 'Integração WhatsApp', incluido: true },
      { nome: 'Entrega/Retirada configurável', incluido: true },
      { nome: 'Até 100 produtos', incluido: false },
      { nome: 'Destaque nas buscas', incluido: false },
      { nome: 'Suporte prioritário', incluido: false },
      { nome: 'Relatórios avançados', incluido: false },
      { nome: 'API de integração', incluido: false },
    ]
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    preco: 99.90,
    descricao: 'Perfeito para lojas em crescimento',
    icone: TrendingUp,
    cor: 'blue',
    popular: true,
    recursos: [
      { nome: 'Até 100 produtos cadastrados', incluido: true },
      { nome: 'Visibilidade na busca local', incluido: true },
      { nome: 'Recebimento de pedidos online', incluido: true },
      { nome: 'Suporte por email e chat', incluido: true },
      { nome: 'Relatórios avançados', incluido: true },
      { nome: 'Integração WhatsApp', incluido: true },
      { nome: 'Entrega/Retirada configurável', incluido: true },
      { nome: 'Destaque nas buscas', incluido: true },
      { nome: 'Banner promocional', incluido: true },
      { nome: 'Suporte prioritário', incluido: false },
      { nome: 'Produtos ilimitados', incluido: false },
      { nome: 'API de integração', incluido: false },
    ]
  },
  {
    id: 'premium',
    nome: 'Premium',
    preco: 199.90,
    descricao: 'Para lojas que querem dominar o mercado',
    icone: Crown,
    cor: 'purple',
    popular: false,
    recursos: [
      { nome: 'Produtos ilimitados', incluido: true },
      { nome: 'Visibilidade máxima', incluido: true },
      { nome: 'Recebimento de pedidos online', incluido: true },
      { nome: 'Suporte prioritário 24/7', incluido: true },
      { nome: 'Relatórios completos + insights', incluido: true },
      { nome: 'Integração WhatsApp', incluido: true },
      { nome: 'Entrega/Retirada configurável', incluido: true },
      { nome: 'Destaque nas buscas', incluido: true },
      { nome: 'Banner promocional premium', incluido: true },
      { nome: 'API de integração', incluido: true },
      { nome: 'Gerente de conta dedicado', incluido: true },
      { nome: 'Campanhas de marketing', incluido: true },
    ]
  }
];

const faqs = [
  {
    pergunta: 'Posso mudar de plano depois?',
    resposta: 'Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. O valor será ajustado proporcionalmente aos dias restantes do período.'
  },
  {
    pergunta: 'Tem período de teste gratuito?',
    resposta: 'Sim! Todos os planos incluem 7 dias de teste gratuito. Você pode experimentar todas as funcionalidades sem compromisso.'
  },
  {
    pergunta: 'Como funciona o pagamento?',
    resposta: 'Aceitamos pagamento via cartão de crédito, PIX e boleto. A cobrança é feita mensalmente, podendo ser cancelada a qualquer momento.'
  },
  {
    pergunta: 'Preciso pagar comissão sobre vendas?',
    resposta: 'Não! Não cobramos comissão sobre suas vendas. Você paga apenas a mensalidade do plano escolhido e recebe 100% do valor das vendas.'
  },
  {
    pergunta: 'Posso ter mais de uma loja?',
    resposta: 'Sim! Cada loja precisa ter sua própria assinatura. Oferecemos descontos especiais para quem gerencia múltiplas lojas.'
  },
  {
    pergunta: 'E se eu exceder o limite de produtos?',
    resposta: 'Quando você atinge 90% do limite do seu plano, enviamos um alerta. Para adicionar mais produtos, basta fazer upgrade para o próximo plano.'
  }
];

export function Planos() {
  const [periodo, setPeriodo] = useState<'mensal' | 'anual'>('mensal');
  const descontoAnual = 0.20; // 20% de desconto

  const calcularPreco = (preco: number) => {
    if (periodo === 'anual') {
      return (preco * (1 - descontoAnual)).toFixed(2);
    }
    return preco.toFixed(2);
  };

  const getCorClasses = (cor: string) => {
    const cores: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
      emerald: {
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
        border: 'border-emerald-200',
        gradient: 'from-emerald-500 to-teal-600'
      },
      blue: {
        bg: 'bg-blue-50',
        text: 'text-blue-600',
        border: 'border-blue-200',
        gradient: 'from-blue-500 to-cyan-600'
      },
      purple: {
        bg: 'bg-purple-50',
        text: 'text-purple-600',
        border: 'border-purple-200',
        gradient: 'from-purple-500 to-pink-600'
      }
    };
    return cores[cor] || cores.emerald;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <Badge className="mb-4 bg-white/20 text-white border-0 backdrop-blur-sm">
            <Zap className="w-3 h-3 mr-1" />
            7 dias grátis em todos os planos
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Escolha o plano ideal para sua loja
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-8">
            Alcance milhares de clientes na sua região e aumente suas vendas 
            com nossa plataforma completa.
          </p>

          {/* Toggle Mensal/Anual */}
          <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1">
            <button
              onClick={() => setPeriodo('mensal')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                periodo === 'mensal' 
                  ? 'bg-white text-emerald-600' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Mensal
            </button>
            <button
              onClick={() => setPeriodo('anual')}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
                periodo === 'anual' 
                  ? 'bg-white text-emerald-600' 
                  : 'text-white hover:bg-white/10'
              }`}
            >
              Anual
              <Badge className="bg-emerald-500 text-white text-xs">-20%</Badge>
            </button>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section className="py-16 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {planos.map((plano) => {
            const cores = getCorClasses(plano.cor);
            const Icone = plano.icone;

            return (
              <Card 
                key={plano.id}
                className={`relative overflow-hidden transition-all duration-300 hover:shadow-2xl ${
                  plano.popular ? 'border-emerald-500 border-2 shadow-lg scale-105' : 'border-gray-200'
                }`}
              >
                {plano.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-center py-1.5 text-sm font-medium">
                    <Star className="w-4 h-4 inline mr-1" />
                    Mais Popular
                  </div>
                )}

                <CardHeader className={`pt-8 pb-6 ${plano.popular ? 'pt-12' : ''}`}>
                  <div className={`w-14 h-14 rounded-xl ${cores.bg} flex items-center justify-center mb-4`}>
                    <Icone className={`w-7 h-7 ${cores.text}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{plano.nome}</h3>
                  <p className="text-gray-500 text-sm">{plano.descricao}</p>
                </CardHeader>

                <CardContent>
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        R$ {calcularPreco(plano.preco)}
                      </span>
                      <span className="text-gray-500">/mês</span>
                    </div>
                    {periodo === 'anual' && (
                      <p className="text-sm text-emerald-600 mt-1">
                        Economize R$ {((plano.preco * 12 * descontoAnual)).toFixed(2)} no ano
                      </p>
                    )}
                  </div>

                  <Link to={`/lojista/cadastro?plano=${plano.id}`}>
                    <Button 
                      className={`w-full mb-6 ${
                        plano.popular 
                          ? 'bg-emerald-600 hover:bg-emerald-700' 
                          : 'bg-gray-900 hover:bg-gray-800'
                      }`}
                      size="lg"
                    >
                      Começar Agora
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>

                  <div className="space-y-3">
                    {plano.recursos.map((recurso, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        {recurso.incluido ? (
                          <div className={`w-5 h-5 rounded-full ${cores.bg} flex items-center justify-center shrink-0`}>
                            <Check className={`w-3 h-3 ${cores.text}`} />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <X className="w-3 h-3 text-gray-400" />
                          </div>
                        )}
                        <span className={`text-sm ${recurso.incluido ? 'text-gray-700' : 'text-gray-400'}`}>
                          {recurso.nome}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Comparativo */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Compare os Planos</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Veja em detalhes o que cada plano oferece e escolha o melhor para o seu negócio
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full max-w-4xl mx-auto">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-4 px-4 font-medium text-gray-500">Recurso</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Básico</th>
                  <th className="text-center py-4 px-4 font-bold text-emerald-600">Profissional</th>
                  <th className="text-center py-4 px-4 font-bold text-gray-900">Premium</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Produtos</td>
                  <td className="text-center py-4 px-4">50</td>
                  <td className="text-center py-4 px-4 font-medium text-emerald-600">100</td>
                  <td className="text-center py-4 px-4">Ilimitado</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Visibilidade</td>
                  <td className="text-center py-4 px-4">Padrão</td>
                  <td className="text-center py-4 px-4 font-medium text-emerald-600">Destaque</td>
                  <td className="text-center py-4 px-4">Máxima</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Suporte</td>
                  <td className="text-center py-4 px-4">Email</td>
                  <td className="text-center py-4 px-4 font-medium text-emerald-600">Email + Chat</td>
                  <td className="text-center py-4 px-4">Prioritário 24/7</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">Relatórios</td>
                  <td className="text-center py-4 px-4">Básicos</td>
                  <td className="text-center py-4 px-4 font-medium text-emerald-600">Avançados</td>
                  <td className="text-center py-4 px-4">Completos + Insights</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-4 px-4 text-gray-700">API de Integração</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-emerald-500 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-4 px-4 text-gray-700">Gerente de Conta</td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><X className="w-5 h-5 text-gray-300 mx-auto" /></td>
                  <td className="text-center py-4 px-4"><Check className="w-5 h-5 text-emerald-500 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dúvidas Frequentes</h2>
            <p className="text-gray-500">
              Tire suas dúvidas sobre nossos planos
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger className="text-left font-medium text-gray-900">
                  {faq.pergunta}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600">
                  {faq.resposta}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ainda tem dúvidas?</h2>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Nossa equipe está pronta para ajudar você a escolher o melhor plano para seu negócio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/lojista/cadastro">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 px-8">
                Começar Grátis
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <a 
              href="https://wa.me/551140001234?text=Olá! Gostaria de saber mais sobre os planos do ONDE COMPRAR." 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button size="lg" variant="outline" className="border-gray-600 text-white hover:bg-gray-800 px-8">
                Falar com Vendas
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
