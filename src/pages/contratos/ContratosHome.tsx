import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/Card';
import { Building2, Users, Heart, FileSpreadsheet, Calendar, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export default function ContratosHome() {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Empresas',
      description: 'Cadastro e gestão de empresas conveniadas com CNPJ, convenção e contatos',
      icon: Building2,
      path: '/contratos/empresas',
      color: 'bg-brand-primary',
    },
    {
      title: 'Funcionários',
      description: 'Gestão completa de funcionários vinculados a empresas',
      icon: Users,
      path: '/contratos/funcionarios',
      color: 'bg-green-500',
    },
    {
      title: 'Dependentes',
      description: 'Cadastro de dependentes vinculados a funcionários',
      icon: Heart,
      path: '/contratos/dependentes',
      color: 'bg-pink-500',
    },
    {
      title: 'Regras de Faturamento',
      description: 'Configuração de regras por convenção e localidade',
      icon: FileSpreadsheet,
      path: '/contratos/regras',
      color: 'bg-blue-500',
    },
    {
      title: 'Vigências de Contratos',
      description: 'Timeline de vigências e impacto de regras aplicadas',
      icon: Calendar,
      path: '/contratos/vigencias',
      color: 'bg-purple-500',
    },
    {
      title: 'Locais e Regras',
      description: 'Locais de trabalho e regras específicas de faturamento por local',
      icon: MapPin,
      path: '/contratos/locais-regras',
      color: 'bg-orange-500',
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
        <h1 className="text-3xl font-bold text-neutral-900">Gestão de Contratos</h1>
        <p className="text-neutral-600 mt-2">
          Cadastros e configurações de empresas, funcionários e dependentes
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
