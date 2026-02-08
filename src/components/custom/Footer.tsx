import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sobre */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                ONDE COMPRAR
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Encontre os melhores produtos eletrônicos nas lojas físicas mais próximas de você. 
              Compare preços, reserve ou peça entrega.
            </p>
          </div>

          {/* Links Rápidos */}
          <div>
            <h3 className="text-white font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-emerald-400 transition-colors">Início</Link>
              </li>
              <li>
                <Link to="/busca" className="hover:text-emerald-400 transition-colors">Buscar Produtos</Link>
              </li>
              <li>
                <Link to="/lojas" className="hover:text-emerald-400 transition-colors">Lojas Parceiras</Link>
              </li>
            </ul>
          </div>

          {/* Para Lojistas */}
          <div>
            <h3 className="text-white font-semibold mb-4">Para Lojistas</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/lojista/cadastro" className="hover:text-emerald-400 transition-colors">Cadastrar Loja</Link>
              </li>
              <li>
                <Link to="/lojista/login" className="hover:text-emerald-400 transition-colors">Área do Lojista</Link>
              </li>
              <li>
                <Link to="/planos" className="hover:text-emerald-400 transition-colors">Planos e Preços</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2025 ONDE COMPRAR. Todos os direitos reservados.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="/privacidade" className="hover:text-emerald-400 transition-colors">Política de Privacidade</Link>
            <Link to="/termos" className="hover:text-emerald-400 transition-colors">Termos de Uso</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
