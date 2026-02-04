import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import {
  Building2,
  FileText,
  DollarSign,
  ArrowRight,
  BarChart3,
  Upload,
  Calculator,
  CheckCircle,
  Gift,
  TrendingUp,
  Receipt,
  FileCheck,
  AlertCircle,
  Calendar
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  const modules = [
    {
      title: 'Portal do Cliente',
      description: 'Ferramentas self-service para empresas conveniadas',
      icon: FileText,
      gradient: 'from-[#007C92] to-[#005f70]',
      path: '/portal',
      count: 10,
      features: [
        { icon: Upload, text: 'Atualização em Lote (eSocial, FGTS)' },
        { icon: Calculator, text: 'Cálculo e Emissão Automática' },
        { icon: Receipt, text: 'Boletos e Prorrogação' },
        { icon: FileCheck, text: 'Notas Fiscais (NFSe)' },
        { icon: TrendingUp, text: 'Relatórios de Movimentação' },
        { icon: Gift, text: 'Campanhas de Incentivo' },
      ],
    },
    {
      title: 'Gestão de Contratos',
      description: 'Cadastros base e regras de negócio',
      icon: Building2,
      gradient: 'from-[#007C92] to-[#00566a]',
      path: '/contratos',
      count: 7,
      features: [
        { icon: Building2, text: 'Empresas Conveniadas' },
        { icon: CheckCircle, text: 'Funcionários e Dependentes' },
        { icon: FileText, text: 'Regras de Faturamento' },
        { icon: Calendar, text: 'Vigências de Contrato' },
        { icon: Building2, text: 'Locais de Trabalho' },
      ],
    },
    {
      title: 'Faturamento Assistencial',
      description: 'Ciclo completo de cálculo e emissão',
      icon: DollarSign,
      gradient: 'from-[#F47920] to-[#D66714]',
      path: '/faturamento',
      count: 17,
      features: [
        { icon: TrendingUp, text: 'Pisos por Categoria' },
        { icon: AlertCircle, text: 'Penalidades e Regras' },
        { icon: Calculator, text: 'Parâmetros de Cálculo' },
        { icon: Upload, text: 'Importações Complementares' },
        { icon: CheckCircle, text: 'Conferência 360°' },
        { icon: Receipt, text: 'Lotes de Boletos' },
        { icon: AlertCircle, text: 'Alertas de Desvios' },
      ],
    },
    {
      title: 'Relatórios e Analytics',
      description: 'Inteligência de negócio e integração',
      icon: BarChart3,
      gradient: 'from-purple-600 to-purple-800',
      path: '/relatorios',
      count: 2,
      features: [
        { icon: BarChart3, text: 'Dashboard Executivo' },
        { icon: FileText, text: 'Integrações e Exports' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#007C92]/5 via-white to-[#F47920]/5">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-[#007C92] to-[#005f70] rounded-3xl flex items-center justify-center shadow-2xl ring-4 ring-[#007C92]/20">
              <Building2 className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#007C92] to-[#005f70] bg-clip-text text-transparent mb-4">
            Sistema de Faturamento Assistencial
          </h1>
          <p className="text-xl text-neutral-600 max-w-3xl mx-auto mb-6">
            Seconci-SP - Serviço Social da Construção Civil do Estado de São Paulo
          </p>
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg border border-[#007C92]/10">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-semibold text-neutral-700">
              Sistema operacional - Competência Out/2025
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Card
                key={module.path}
                variant="elevated"
                className="group cursor-pointer transform transition-all duration-300 hover:scale-102 hover:shadow-2xl border-2 border-transparent hover:border-[#007C92]/20 overflow-hidden"
                onClick={() => navigate(module.path)}
              >
                <div className={`h-2 bg-gradient-to-r ${module.gradient}`} />

                <CardContent className="p-8">
                  <div className="flex items-start mb-6">
                    <div className={`w-16 h-16 bg-gradient-to-br ${module.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    {module.title}
                  </h2>

                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    {module.description}
                  </p>

                  <div className="space-y-3 mb-8">
                    {module.features.map((feature, index) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div key={index} className="flex items-center gap-3 text-sm text-neutral-700">
                          <div className={`w-8 h-8 bg-gradient-to-br ${module.gradient} rounded-lg flex items-center justify-center opacity-10 group-hover:opacity-20 transition-opacity`}>
                            <FeatureIcon className="h-4 w-4 text-white" />
                          </div>
                          <span className="font-medium">{feature.text}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-neutral-200">
                    <div className="flex items-center gap-2 text-[#007C92] font-bold group-hover:gap-4 transition-all">
                      <span>Acessar módulo</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-[#007C92] rounded-full opacity-30"></div>
                      <div className="w-2 h-2 bg-[#007C92] rounded-full opacity-60"></div>
                      <div className="w-2 h-2 bg-[#007C92] rounded-full"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-20 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-100">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#007C92] to-[#005f70] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-[#007C92] mb-1">36</p>
                <p className="text-sm text-neutral-600 font-medium">Telas totais</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-100">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#007C92] to-[#005f70] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-[#007C92] mb-1">4</p>
                <p className="text-sm text-neutral-600 font-medium">Módulos</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-100">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#F47920] to-[#D66714] rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-[#F47920] mb-1">100%</p>
                <p className="text-sm text-neutral-600 font-medium">Funcional</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-neutral-100">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <p className="text-3xl font-bold text-green-600 mb-1">v1.0</p>
                <p className="text-sm text-neutral-600 font-medium">Versão atual</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-neutral-500">
            Desenvolvido por <span className="font-semibold text-[#007C92]">SysMap Solutions</span> © 2025
          </p>
        </div>
      </div>
    </div>
  );
}
