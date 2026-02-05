import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Chrome, UserCog, Users } from 'lucide-react';
import { useAuth } from '../core/auth/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, signInAsAdminMaster, signInAsClientAdmin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password, rememberMe);
      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Credenciais inválidas. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Login com Google realizado com sucesso!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao fazer login com Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdminMaster = async () => {
    setLoading(true);
    try {
      await signInAsAdminMaster();
      toast.success('Login como Admin Master realizado!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao fazer login de demonstração.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClientAdmin = async () => {
    setLoading(true);
    try {
      await signInAsClientAdmin();
      toast.success('Login como Admin do Cliente realizado!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao fazer login de demonstração.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#007C92] via-[#005f70] to-[#004450] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#007C92] to-[#005f70] rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Building2 className="h-9 w-9 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 text-center">Seconci-SP</h1>
            <p className="text-neutral-600 text-center mt-1">Faturamento Assistencial</p>
            <p className="text-xs text-neutral-400 mt-1">by SysMap Solutions</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-[#007C92] focus:ring-[#007C92] border-neutral-300 rounded"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-neutral-700">
                Lembrar-me por 30 dias
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-neutral-500">Ou continue com</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mb-6"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Chrome className="h-5 w-5 mr-2" />
            Entrar com Google
          </Button>

          <div className="pt-6 border-t border-neutral-200">
            <p className="text-sm font-medium text-neutral-700 mb-3 text-center">Acessos de Demonstração</p>
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full bg-gradient-to-r from-[#007C92]/5 to-[#007C92]/10 border-[#007C92]/30 hover:bg-[#007C92]/20"
                onClick={handleDemoAdminMaster}
                disabled={loading}
              >
                <UserCog className="h-5 w-5 mr-2 text-[#007C92]" />
                <span className="text-[#007C92] font-medium">Entrar como Admin Master (Backoffice)</span>
              </Button>
              <Button
                variant="outline"
                className="w-full bg-gradient-to-r from-[#F47920]/5 to-[#F47920]/10 border-[#F47920]/30 hover:bg-[#F47920]/20"
                onClick={handleDemoClientAdmin}
                disabled={loading}
              >
                <Users className="h-5 w-5 mr-2 text-[#F47920]" />
                <span className="text-[#F47920] font-medium">Entrar como Admin do Cliente (Portal)</span>
              </Button>
            </div>
            <p className="text-xs text-neutral-500 mt-3 text-center">
              Use os botões acima para testar os diferentes perfis de acesso
            </p>
          </div>
        </div>

        <p className="text-center text-white/80 text-sm mt-6">
          Sistema protegido por controle de acesso RBAC
        </p>
      </div>
    </div>
  );
}
