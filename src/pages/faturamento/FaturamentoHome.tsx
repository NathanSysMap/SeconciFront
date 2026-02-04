import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { TrendingUp, AlertTriangle, Settings, Upload, Package, CheckCircle, Building, ArrowRight, ArrowLeft, RefreshCw, FileEdit, Users, ArrowLeftRight, Wrench, Download, Bell } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function FaturamentoHome() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Atualização de Regras',
      description: 'Atualizar regras de faturamento das empresas cadastradas',
      icon: RefreshCw,
      path: '/faturamento/atualizacao-regras',
      color: 'bg-blue-600',
    },
    {
      title: 'Aplicação de Penalidades',
      description: 'Aplicar penalidades por falta de atualização cadastral',
      icon: AlertTriangle,
      path: '/faturamento/aplicacao-penalidades',
      color: 'bg-red-500',
    },
    {
      title: 'Ajustes de Folha',
      description: 'Ajustar faturamento baseado em folha informada',
      icon: FileEdit,
      path: '/faturamento/ajustes-folha',
      color: 'bg-orange-500',
    },
    {
      title: 'Amostragem 1/12',
      description: 'Separação de amostragem de clientes por regra',
      icon: Users,
      path: '/faturamento/amostragem',
      color: 'bg-teal-500',
    },
    {
      title: 'Transferência Manual/Auto',
      description: 'Transferir empresas entre faturamento manual e automático',
      icon: ArrowLeftRight,
      path: '/faturamento/transferencia-modo',
      color: 'bg-cyan-500',
    },
    {
      title: 'Parâmetros Manuais',
      description: 'Parâmetros para faturamento manual',
      icon: Wrench,
      path: '/faturamento/parametros-manuais',
      color: 'bg-slate-500',
    },
    {
      title: 'Lotes de Faturamento',
      description: 'Agrupamento de empresas para geração de boletos',
      icon: Package,
      path: '/faturamento/lotes',
      color: 'bg-brand-accent',
    },
    {
      title: 'Parâmetros de Exportação',
      description: 'Configurar formatos e regras de exportação',
      icon: Download,
      path: '/faturamento/parametros-exportacao',
      color: 'bg-emerald-500',
    },
    {
      title: 'Conferência de Faturamento',
      description: 'Visão 360° do faturamento por competência e empresa',
      icon: CheckCircle,
      path: '/faturamento/conferencia',
      color: 'bg-indigo-500',
    },
    {
      title: 'Grupos Econômicos',
      description: 'Consolidação e visão agregada de grupos empresariais',
      icon: Building,
      path: '/faturamento/grupos',
      color: 'bg-brand-primary',
    },
    {
      title: 'Alertas de Desvios',
      description: 'Monitorar desvios de funcionários e valores',
      icon: Bell,
      path: '/faturamento/alertas',
      color: 'bg-yellow-500',
    },
    {
      title: 'Pisos por Categoria',
      description: 'Valores mínimos de cobrança por categoria profissional',
      icon: TrendingUp,
      path: '/faturamento/pisos',
      color: 'bg-green-500',
    },
    {
      title: 'Penalidades (Config)',
      description: 'Configuração de penalidades e regras',
      icon: Settings,
      path: '/faturamento/penalidades',
      color: 'bg-red-600',
    },
    {
      title: 'Parâmetros de Cálculo',
      description: 'Configuração de percentuais, 13º e dependentes',
      icon: Settings,
      path: '/faturamento/parametros',
      color: 'bg-blue-500',
    },
    {
      title: 'Importações Complementares',
      description: 'Carteirinhas, dependentes, afastados e estagiários',
      icon: Upload,
      path: '/faturamento/importacoes',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Faturamento Assistencial</h1>
        <p className="text-neutral-600 mt-2">
          Gestão completa do ciclo de faturamento assistencial com controle de competências
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card
              key={feature.path}
              variant="elevated"
              className="group cursor-pointer transform transition-all duration-200 hover:scale-105"
              onClick={() => navigate(feature.path)}
            >
              <CardContent className="p-6">
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  {feature.title}
                </h3>

                <p className="text-sm text-neutral-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>

                <div className="flex items-center gap-2 text-brand-primary text-sm font-medium group-hover:gap-3 transition-all">
                  <span>Acessar</span>
                  <ArrowRight className="h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
