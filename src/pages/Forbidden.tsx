import { useNavigate } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuth } from '../core/auth/AuthContext';

export default function Forbidden() {
  const navigate = useNavigate();
  const { session } = useAuth();

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldX className="h-10 w-10 text-red-600" />
          </div>

          <h1 className="text-3xl font-bold text-neutral-900 mb-3">Acesso Negado</h1>
          <p className="text-neutral-600 mb-2">Você não tem permissão para acessar esta página.</p>
          <p className="text-sm text-neutral-500 mb-8">
            Entre em contato com o administrador do sistema caso precise de acesso.
          </p>

          {session && (
            <div className="bg-neutral-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-xs font-medium text-neutral-500 uppercase mb-2">Seu Perfil</p>
              <p className="text-sm font-semibold text-neutral-900">{session.name}</p>
              <p className="text-xs text-neutral-600">{session.email}</p>
              <p className="text-xs text-neutral-500 mt-2">
                Escopo: <span className="font-medium">{session.scope}</span>
              </p>
            </div>
          )}

          <Button onClick={handleGoBack} className="w-full">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Página Inicial
          </Button>
        </div>
      </div>
    </div>
  );
}
