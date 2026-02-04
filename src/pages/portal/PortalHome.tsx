import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Upload, UserPlus, FileText, Receipt, FileCheck, Bell, ArrowRight, ArrowLeft, Calendar, TrendingUp, Gift, Calculator } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function PortalHome() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Atualização em Lote',
      description: 'Upload de arquivos eSocial, FGTS Digital, Excel e TXT com validação automatizada',
      icon: Upload,
      path: '/portal/atualizacao-lote',
      color: 'bg-blue-500',
    },
    {
      title: 'Atualização Individual',
      description: 'Cadastro manual de funcionários com formulários validados',
      icon: UserPlus,
      path: '/portal/atualizacao-individual',
      color: 'bg-green-500',
    },
    {
      title: 'Eventos de Folha',
      description: 'Manutenção de férias, faltas e afastamentos para faturamento',
      icon: Calendar,
      path: '/portal/eventos-folha',
      color: 'bg-orange-500',
    },
    {
      title: 'Cálculo e Emissão Automática',
      description: 'Calcule seu faturamento e emita boletos automaticamente',
      icon: Calculator,
      path: '/portal/calculo-automatico',
      color: 'bg-cyan-500',
    },
    {
      title: 'Boletos',
      description: 'Consulta, impressão e prorrogação de boletos de pagamento',
      icon: Receipt,
      path: '/portal/boletos',
      color: 'bg-brand-accent',
    },
    {
      title: 'Notas Fiscais (NFSe)',
      description: 'Consulta e download de notas fiscais eletrônicas de serviço',
      icon: FileCheck,
      path: '/portal/nfse',
      color: 'bg-purple-500',
    },
    {
      title: 'Relatórios de Movimentação',
      description: 'Acompanhamento percentual mensal e empresas faltantes',
      icon: TrendingUp,
      path: '/portal/relatorios-movimentacao',
      color: 'bg-teal-500',
    },
    {
      title: 'Campanhas de Incentivo',
      description: 'Confira campanhas ativas e benefícios disponíveis',
      icon: Gift,
      path: '/portal/campanhas',
      color: 'bg-pink-500',
    },
    {
      title: 'Relatórios',
      description: 'Extratos, memória de cálculo e acompanhamento da base',
      icon: FileText,
      path: '/portal/relatorios',
      color: 'bg-indigo-500',
    },
    {
      title: 'Alertas e Desvios',
      description: 'Notificações de inconsistências detectadas automaticamente',
      icon: Bell,
      path: '/portal/alertas',
      color: 'bg-red-500',
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
        <h1 className="text-3xl font-bold text-neutral-900">Portal do Cliente</h1>
        <p className="text-neutral-600 mt-2">
          Ferramentas para atualização de dados, consultas e relatórios
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
