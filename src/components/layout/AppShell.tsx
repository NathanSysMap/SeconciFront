import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2,
  FileText,
  DollarSign,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
  User,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../lib/auth-context';
import { Button } from '../ui/Button';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    {
      name: 'Portal do Cliente',
      icon: FileText,
      items: [
        { name: '🏠 Home', href: '/portal' },
        { name: 'Atualização em Lote', href: '/portal/atualizacao-lote' },
        { name: 'Atualização Individual', href: '/portal/atualizacao-individual' },
        { name: 'Eventos de Folha', href: '/portal/eventos-folha' },
        { name: 'Cálculo Automático', href: '/portal/calculo-automatico' },
        { name: 'Boletos', href: '/portal/boletos' },
        { name: 'NFSe', href: '/portal/nfse' },
        { name: 'Relatórios Movimentação', href: '/portal/relatorios-movimentacao' },
        { name: 'Campanhas de Incentivo', href: '/portal/campanhas' },
        { name: 'Relatórios', href: '/portal/relatorios' },
        { name: 'Alertas', href: '/portal/alertas' },
      ],
      roles: ['admin', 'operational', 'company'],
    },
    {
      name: 'Gestão de Contratos',
      icon: Building2,
      items: [
        { name: '🏠 Home', href: '/contratos' },
        { name: 'Empresas', href: '/contratos/empresas' },
        { name: 'Funcionários', href: '/contratos/funcionarios' },
        { name: 'Dependentes', href: '/contratos/dependentes' },
        { name: 'Regras de Faturamento', href: '/contratos/regras' },
        { name: 'Vigências', href: '/contratos/vigencias' },
        { name: 'Locais e Regras', href: '/contratos/locais-regras' },
      ],
      roles: ['admin', 'operational'],
    },
    {
      name: 'Faturamento',
      icon: DollarSign,
      items: [
        { name: '🏠 Home', href: '/faturamento' },
        { name: 'Pisos por Categoria', href: '/faturamento/pisos' },
        { name: 'Penalidades (Config)', href: '/faturamento/penalidades' },
        { name: 'Regras de Empresas', href: '/faturamento/atualizacao-regras' },
        { name: 'Regras por Local', href: '/contratos/locais-regras' },
        { name: 'Parâmetros de Cálculo', href: '/faturamento/parametros' },
        { name: 'Importações Complementares', href: '/faturamento/importacoes' },
        { name: 'Aplicar Penalidades', href: '/faturamento/aplicacao-penalidades' },
        { name: 'Ajustes de Folha', href: '/faturamento/ajustes-folha' },
        { name: 'Amostragem 1/12', href: '/faturamento/amostragem' },
        { name: 'Manual/Automático', href: '/faturamento/transferencia-modo' },
        { name: 'Faturamento Manual', href: '/faturamento/parametros-manuais' },
        { name: 'Lotes de Boletos', href: '/faturamento/lotes' },
        { name: 'Parâmetros Exportação', href: '/faturamento/parametros-exportacao' },
        { name: 'Conferência 360°', href: '/faturamento/conferencia' },
        { name: 'Grupos Econômicos', href: '/faturamento/grupos' },
        { name: 'Alertas de Desvios', href: '/faturamento/alertas' },
      ],
      roles: ['admin', 'operational'],
    },
    {
      name: 'Relatórios',
      icon: BarChart3,
      items: [
        { name: 'Dashboard', href: '/relatorios/dashboard' },
        { name: 'Integrações', href: '/relatorios/integracoes' },
        { name: 'Sobre a Aplicação', href: '/relatorios/sobre' },
      ],
      roles: ['admin', 'operational', 'company'],
    },
  ];

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const path = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    return { label, path };
  });

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-0'
        } bg-gradient-to-b from-[#007C92] to-[#005f70] transition-all duration-300 overflow-hidden flex flex-col shadow-xl`}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/20">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Seconci-SP</h1>
              <p className="text-xs text-white/80 font-medium">Faturamento Assistencial</p>
              <p className="text-xs text-white/50">by SysMap Solutions</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {navigation.map((section) => {
            if (!section.roles.includes(user?.role || '')) return null;

            return (
              <div key={section.name} className="mb-6">
                <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-white/60 uppercase tracking-wider">
                  <section.icon className="h-4 w-4" />
                  <span>{section.name}</span>
                </div>
                <ul className="space-y-1 mt-2">
                  {section.items.map((item) => {
                    const isActive = location.pathname === item.href;
                    const isHome = item.name.includes('🏠');
                    const needsAttention = item.name.toLowerCase().includes('alerta') ||
                                          item.name.toLowerCase().includes('penalidade') ||
                                          item.name.toLowerCase().includes('desvio');

                    return (
                      <li key={item.href}>
                        <Link
                          to={item.href}
                          className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                            isActive
                              ? 'bg-white text-[#007C92] shadow-lg scale-105'
                              : isHome
                              ? 'text-white bg-white/10 hover:bg-white/20 hover:shadow-md'
                              : needsAttention
                              ? 'text-white/90 hover:bg-[#F47920] hover:text-white hover:shadow-lg hover:scale-102'
                              : 'text-white/80 hover:bg-white/10 hover:text-white hover:shadow-md'
                          }`}
                        >
                          {isActive && (
                            <div className="w-1 h-6 bg-[#F47920] rounded-full" />
                          )}
                          <span className={isActive ? 'font-semibold' : ''}>{item.name}</span>
                          {needsAttention && !isActive && (
                            <div className="ml-auto w-2 h-2 bg-[#F47920] rounded-full animate-pulse" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 bg-black/10">
          <div className="px-3 py-2 text-xs text-white/60 space-y-1">
            <p className="font-semibold text-white/80">Sistema Integrado</p>
            <p>Versão 1.0.0</p>
            <p className="text-white/40">© 2025 SysMap</p>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-neutral-200 px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 text-[#007C92] hover:bg-[#007C92]/10 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              <nav className="flex items-center gap-2 text-sm">
                <Link to="/" className="text-neutral-500 hover:text-[#007C92] transition-colors font-medium">
                  Início
                </Link>
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-neutral-300" />
                    {index === breadcrumbs.length - 1 ? (
                      <span className="text-[#007C92] font-semibold">{crumb.label}</span>
                    ) : (
                      <Link to={crumb.path} className="text-neutral-500 hover:text-[#007C92] transition-colors">
                        {crumb.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#007C92]/5 to-[#007C92]/10 border border-[#007C92]/20 rounded-xl">
                <Calendar className="h-4 w-4 text-[#007C92]" />
                <select className="bg-transparent text-sm font-semibold text-[#007C92] focus:outline-none cursor-pointer">
                  <option>Out/2025</option>
                  <option>Set/2025</option>
                  <option>Ago/2025</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pl-4 border-l border-neutral-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#007C92] to-[#005f70] rounded-xl flex items-center justify-center shadow-md">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-neutral-900">{user?.full_name}</p>
                    <p className="text-xs text-neutral-500">
                      {user?.role === 'admin' ? 'Admin SysMap' : user?.role === 'operational' ? 'Operacional' : 'Cliente'}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
