import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

// pk_test_51SxaPoRovCiHMlWe0ePkTnmq9nDLCjhMWVyUvoUNQFb4VzLFTyBTmTNPPqKS2kZu6iqxj8QV6r8DH7X5eqn8Uo5600Y4t3TVyv
const stripePromise = loadStripe('pk_test_SUA_CHAVE_AQUI');

function CheckoutForm({ total, onSuccess }: { total: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast.error('Stripe não carregou');
      return;
    }

    setIsLoading(true);

    // Simulação de pagamento (em produção, chama seu backend)
    setTimeout(() => {
      toast.success('Pagamento realizado com sucesso!');
      setIsLoading(false);
      onSuccess();
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg bg-white">
        <CardElement 
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': { color: '#aab7c4' }
              }
            }
          }}
        />
      </div>
      <Button 
        type="submit" 
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={!stripe || isLoading}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        ) : null}
        Pagar {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
      </Button>
    </form>
  );
}

export function StripePayment({ total, onSuccess }: { total: number; onSuccess: () => void }) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm total={total} onSuccess={onSuccess} />
    </Elements>
  );
}