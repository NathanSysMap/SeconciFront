import { useState } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import {
  FileText,
  Building2,
  DollarSign,
  BarChart3,
  ChevronRight,
  ChevronDown,
  Upload,
  UserPlus,
  Calendar,
  Calculator,
  Receipt,
  FileCheck,
  TrendingUp,
  Gift,
  Bell,
  Users,
  ClipboardList,
  MapPin,
  DollarSign as Money,
  AlertTriangle,
  Settings,
  FileSpreadsheet,
  Package,
  CheckCircle,
  PieChart,
  Zap
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

interface Feature {
  name: string;
  description: string;
  type: 'tela' | 'aba' | 'modal' | 'funcionalidade';
  subFeatures?: Feature[];
}

interface Screen {
  name: string;
  route: string;
  icon: any;
  features: Feature[];
}

interface Module {
  name: string;
  icon: any;
  color: string;
  gradient: string;
  description: string;
  screens: Screen[];
}

export default function About() {
  const [expandedModules, setExpandedModules] = useState<string[]>(['Portal do Cliente']);
  const [expandedScreens, setExpandedScreens] = useState<string[]>([]);

  const modules: Module[] = [
    {
      name: 'Portal do Cliente',
      icon: FileText,
      color: 'text-[#007C92]',
      gradient: 'from-[#007C92] to-[#005f70]',
      description: 'Ferramentas self-service para empresas conveniadas',
      screens: [
        {
          name: 'Home do Portal',
          route: '/portal',
          icon: FileText,
          features: [
            { name: 'Dashboard de acesso rápido', description: '10 cards de navegação', type: 'funcionalidade' },
            { name: 'Cards interativos', description: 'Navegação visual por módulo', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Atualização em Lote',
          route: '/portal/atualizacao-lote',
          icon: Upload,
          features: [
            { name: 'Upload de arquivos', description: 'eSocial, FGTS Digital, Excel, TXT', type: 'funcionalidade' },
            { name: 'Validação automática', description: 'Verificação de formato e conteúdo', type: 'funcionalidade' },
            { name: 'Histórico de uploads', description: 'Rastreamento de lotes enviados', type: 'funcionalidade' },
            { name: 'Logs de processamento', description: 'Detalhamento de erros e sucessos', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Atualização Individual',
          route: '/portal/atualizacao-individual',
          icon: UserPlus,
          features: [
            { name: 'Formulário de cadastro', description: 'Funcionários e dependentes', type: 'funcionalidade' },
            { name: 'Validação em tempo real', description: 'CPF, datas, campos obrigatórios', type: 'funcionalidade' },
            { name: 'Modal de confirmação', description: 'Revisão antes de salvar', type: 'modal' },
            { name: 'Busca de funcionários', description: 'Por CPF, nome, matrícula', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Eventos de Folha',
          route: '/portal/eventos-folha',
          icon: Calendar,
          features: [
            { name: 'Gestão de férias', description: 'Lançamento e acompanhamento', type: 'funcionalidade' },
            { name: 'Registro de faltas', description: 'Justificadas e não justificadas', type: 'funcionalidade' },
            { name: 'Afastamentos', description: 'Temporários e definitivos', type: 'funcionalidade' },
            { name: 'Calendário visual', description: 'Visualização de eventos', type: 'funcionalidade' },
            { name: 'Modal de edição', description: 'Alteração de eventos', type: 'modal' },
          ],
        },
        {
          name: 'Cálculo e Emissão Automática',
          route: '/portal/calculo-automatico',
          icon: Calculator,
          features: [
            { name: 'Seletor de competência', description: 'Escolha do mês/ano', type: 'funcionalidade' },
            { name: 'Cálculo de prévia', description: 'Simulação sem compromisso', type: 'funcionalidade' },
            { name: 'Validações obrigatórias', description: 'Checagem de pendências', type: 'funcionalidade' },
            { name: 'Modal de prévia', description: 'Detalhamento de valores', type: 'modal', subFeatures: [
              { name: 'Breakdown de componentes', description: 'Base, dependentes, penalidades', type: 'funcionalidade' },
              { name: 'Identificação de bloqueios', description: 'Alertas impeditivos', type: 'funcionalidade' },
            ]},
            { name: 'Confirmação e emissão', description: 'Geração de boleto', type: 'funcionalidade' },
            { name: 'Histórico de solicitações', description: 'Status em tempo real', type: 'funcionalidade' },
            { name: 'Indicador ON/OFF', description: 'Status da funcionalidade', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Boletos',
          route: '/portal/boletos',
          icon: Receipt,
          features: [
            { name: 'Listagem de boletos', description: 'Por competência', type: 'funcionalidade' },
            { name: 'Filtros avançados', description: 'Status, valor, vencimento', type: 'funcionalidade' },
            { name: 'Download de PDF', description: 'Impressão de boletos', type: 'funcionalidade' },
            { name: 'Código de barras', description: 'Cópia rápida', type: 'funcionalidade' },
            { name: 'Modal de prorrogação', description: 'Solicitação de extensão', type: 'modal' },
            { name: 'Histórico de pagamentos', description: 'Comprovantes e datas', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Notas Fiscais (NFSe)',
          route: '/portal/nfse',
          icon: FileCheck,
          features: [
            { name: 'Consulta de notas', description: 'Por período', type: 'funcionalidade' },
            { name: 'Download de XML', description: 'Arquivo original', type: 'funcionalidade' },
            { name: 'Download de PDF', description: 'Visualização impressa', type: 'funcionalidade' },
            { name: 'Validação de autenticidade', description: 'Verificação online', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Relatórios de Movimentação',
          route: '/portal/relatorios-movimentacao',
          icon: TrendingUp,
          features: [
            { name: 'KPIs de movimentação', description: 'Percentual mensal', type: 'funcionalidade' },
            { name: 'Empresas faltantes', description: 'Lista com contatos', type: 'funcionalidade' },
            { name: 'Comparação temporal', description: 'Mês vs mês anterior', type: 'funcionalidade' },
            { name: 'Breakdown de eventos', description: 'Admissões, desligamentos, alterações', type: 'funcionalidade' },
            { name: 'Exportação CSV', description: 'Dados tabulares', type: 'funcionalidade' },
            { name: 'Histórico de relatórios', description: 'Últimos 12 meses', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Campanhas de Incentivo',
          route: '/portal/campanhas',
          icon: Gift,
          features: [
            { name: 'Listagem de campanhas', description: 'Ativas e vigentes', type: 'funcionalidade' },
            { name: 'Detalhes da campanha', description: 'Regras e benefícios', type: 'funcionalidade' },
            { name: 'Status de elegibilidade', description: 'Se você se qualifica', type: 'funcionalidade' },
            { name: 'Benefícios contemplados', description: 'Valor concedido', type: 'funcionalidade' },
            { name: 'Critérios visuais', description: 'Checklist de requisitos', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Relatórios',
          route: '/portal/relatorios',
          icon: FileText,
          features: [
            { name: 'Extratos de faturamento', description: 'Detalhamento mensal', type: 'funcionalidade' },
            { name: 'Memória de cálculo', description: 'Como foi calculado', type: 'funcionalidade' },
            { name: 'Acompanhamento de base', description: 'Evolução do cadastro', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Alertas e Desvios',
          route: '/portal/alertas',
          icon: Bell,
          features: [
            { name: 'Central de notificações', description: 'Inconsistências detectadas', type: 'funcionalidade' },
            { name: 'Filtros por tipo', description: 'Crítico, atenção, informativo', type: 'funcionalidade' },
            { name: 'Ações corretivas', description: 'Orientação para resolução', type: 'funcionalidade' },
            { name: 'Histórico de alertas', description: 'Resolvidos e pendentes', type: 'funcionalidade' },
          ],
        },
      ],
    },
    {
      name: 'Gestão de Contratos',
      icon: Building2,
      color: 'text-[#007C92]',
      gradient: 'from-[#007C92] to-[#00566a]',
      description: 'Cadastros base e regras de negócio',
      screens: [
        {
          name: 'Home de Contratos',
          route: '/contratos',
          icon: Building2,
          features: [
            { name: 'Dashboard de gestão', description: '7 cards de navegação', type: 'funcionalidade' },
            { name: 'Estatísticas rápidas', description: 'Total de empresas, funcionários', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Empresas',
          route: '/contratos/empresas',
          icon: Building2,
          features: [
            { name: 'Listagem paginada', description: 'DataGrid com filtros', type: 'funcionalidade' },
            { name: 'Modal de cadastro', description: 'Nova empresa', type: 'modal' },
            { name: 'Modal de edição', description: 'Atualização de dados', type: 'modal' },
            { name: 'Busca avançada', description: 'CNPJ, razão social, fantasia', type: 'funcionalidade' },
            { name: 'Validação de CNPJ', description: 'Verificação em tempo real', type: 'funcionalidade' },
            { name: 'Status de convênio', description: 'Ativo, suspenso, cancelado', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Funcionários',
          route: '/contratos/funcionarios',
          icon: Users,
          features: [
            { name: 'Listagem completa', description: 'Com filtros por empresa', type: 'funcionalidade' },
            { name: 'Modal de cadastro', description: 'Novo funcionário', type: 'modal' },
            { name: 'Modal de edição', description: 'Atualização cadastral', type: 'modal' },
            { name: 'Gestão de anexos', description: 'Documentos do funcionário', type: 'funcionalidade' },
            { name: 'Histórico de vínculos', description: 'Admissões e desligamentos', type: 'funcionalidade' },
            { name: 'Status de vínculo', description: 'Ativo, afastado, desligado', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Dependentes',
          route: '/contratos/dependentes',
          icon: Users,
          features: [
            { name: 'Listagem por titular', description: 'Associação com funcionário', type: 'funcionalidade' },
            { name: 'Modal de cadastro', description: 'Novo dependente', type: 'modal' },
            { name: 'Modal de edição', description: 'Atualização de dados', type: 'modal' },
            { name: 'Validação de parentesco', description: 'Regras de elegibilidade', type: 'funcionalidade' },
            { name: 'Cálculo de idade', description: 'Automático com alertas', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Regras de Faturamento',
          route: '/contratos/regras',
          icon: ClipboardList,
          features: [
            { name: 'Listagem de regras', description: 'Por empresa', type: 'funcionalidade' },
            { name: 'Modal de criação', description: 'Nova regra', type: 'modal' },
            { name: 'Modal de edição', description: 'Atualização de regra', type: 'modal' },
            { name: 'Configuração de pisos', description: 'Por categoria', type: 'funcionalidade' },
            { name: 'Regras de dependentes', description: 'Limites e valores', type: 'funcionalidade' },
            { name: 'Regras de afastamento', description: 'Descontos aplicáveis', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Vigências de Contrato',
          route: '/contratos/vigencias',
          icon: Calendar,
          features: [
            { name: 'Linha do tempo', description: 'Visualização de períodos', type: 'funcionalidade' },
            { name: 'Modal de nova vigência', description: 'Definir período', type: 'modal' },
            { name: 'Alertas de vencimento', description: 'Contratos próximos do fim', type: 'funcionalidade' },
            { name: 'Renovação automática', description: 'Configuração de recorrência', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Locais de Trabalho e Regras',
          route: '/contratos/locais-regras',
          icon: MapPin,
          features: [
            { name: 'Cadastro de locais', description: 'Obras e instalações', type: 'funcionalidade' },
            { name: 'Associação com empresas', description: 'Vínculo múltiplo', type: 'funcionalidade' },
            { name: 'Regras específicas por local', description: 'Override de valores', type: 'funcionalidade' },
            { name: 'Modal de configuração', description: 'Parâmetros por local', type: 'modal' },
          ],
        },
      ],
    },
    {
      name: 'Faturamento Assistencial',
      icon: DollarSign,
      color: 'text-[#F47920]',
      gradient: 'from-[#F47920] to-[#D66714]',
      description: 'Ciclo completo de cálculo e emissão',
      screens: [
        {
          name: 'Home de Faturamento',
          route: '/faturamento',
          icon: DollarSign,
          features: [
            { name: 'Dashboard operacional', description: '17 cards de navegação', type: 'funcionalidade' },
            { name: 'Status do ciclo', description: 'Etapa atual do faturamento', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Pisos por Categoria',
          route: '/faturamento/pisos',
          icon: Money,
          features: [
            { name: 'Tabela de pisos', description: 'Por categoria profissional', type: 'funcionalidade' },
            { name: 'Modal de edição', description: 'Atualização de valores', type: 'modal' },
            { name: 'Histórico de reajustes', description: 'Evolução temporal', type: 'funcionalidade' },
            { name: 'Vigência de valores', description: 'Data de aplicação', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Penalidades (Configuração)',
          route: '/faturamento/penalidades',
          icon: AlertTriangle,
          features: [
            { name: 'Tipos de penalidade', description: 'Atraso, inconsistência, outros', type: 'funcionalidade' },
            { name: 'Modal de criação', description: 'Nova penalidade', type: 'modal' },
            { name: 'Configuração de valores', description: 'Percentual ou fixo', type: 'funcionalidade' },
            { name: 'Regras de aplicação', description: 'Condições e triggers', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Atualização de Regras de Empresas',
          route: '/faturamento/atualizacao-regras',
          icon: Settings,
          features: [
            { name: 'Atualização em lote', description: 'Múltiplas empresas', type: 'funcionalidade' },
            { name: 'Modal de seleção', description: 'Filtros e critérios', type: 'modal' },
            { name: 'Preview de impacto', description: 'Simulação de mudanças', type: 'funcionalidade' },
            { name: 'Confirmação de atualização', description: 'Aplicação efetiva', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Parâmetros de Cálculo',
          route: '/faturamento/parametros',
          icon: Settings,
          features: [
            { name: 'Configurações globais', description: 'Regras gerais do sistema', type: 'funcionalidade' },
            { name: 'Fórmulas de cálculo', description: 'Base, dependentes, afastados', type: 'funcionalidade' },
            { name: 'Thresholds e limites', description: 'Valores mínimos e máximos', type: 'funcionalidade' },
            { name: 'Modal de edição', description: 'Atualização de parâmetros', type: 'modal' },
          ],
        },
        {
          name: 'Importações Complementares',
          route: '/faturamento/importacoes',
          icon: Upload,
          features: [
            { name: 'Upload de planilhas', description: 'Dados adicionais', type: 'funcionalidade' },
            { name: 'Mapeamento de colunas', description: 'Correspondência de campos', type: 'funcionalidade' },
            { name: 'Validação de dados', description: 'Consistência e formato', type: 'funcionalidade' },
            { name: 'Log de importação', description: 'Erros e sucessos', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Aplicação de Penalidades',
          route: '/faturamento/aplicacao-penalidades',
          icon: AlertTriangle,
          features: [
            { name: 'Seleção de empresas', description: 'Filtros múltiplos', type: 'funcionalidade' },
            { name: 'Escolha de penalidade', description: 'Tipo e valor', type: 'funcionalidade' },
            { name: 'Modal de confirmação', description: 'Review antes de aplicar', type: 'modal' },
            { name: 'Histórico de aplicações', description: 'Auditoria completa', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Ajustes de Folha',
          route: '/faturamento/ajustes-folha',
          icon: FileSpreadsheet,
          features: [
            { name: 'Lançamentos manuais', description: 'Correções e ajustes', type: 'funcionalidade' },
            { name: 'Modal de novo ajuste', description: 'Formulário completo', type: 'modal' },
            { name: 'Justificativa obrigatória', description: 'Motivo do ajuste', type: 'funcionalidade' },
            { name: 'Aprovação hierárquica', description: 'Workflow de validação', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Grupos de Amostragem 1/12',
          route: '/faturamento/amostragem',
          icon: Users,
          features: [
            { name: 'Configuração de grupos', description: 'Divisão de empresas', type: 'funcionalidade' },
            { name: 'Seleção aleatória', description: 'Algoritmo de distribuição', type: 'funcionalidade' },
            { name: 'Visualização de grupos', description: 'Quem está em cada grupo', type: 'funcionalidade' },
            { name: 'Rebalanceamento', description: 'Redistribuição manual', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Transferência Manual/Automático',
          route: '/faturamento/transferencia-modo',
          icon: Zap,
          features: [
            { name: 'Seleção de empresas', description: 'Múltipla seleção', type: 'funcionalidade' },
            { name: 'Alteração de modo', description: 'Manual ↔ Automático', type: 'funcionalidade' },
            { name: 'Modal de confirmação', description: 'Impacto da mudança', type: 'modal' },
            { name: 'Histórico de alterações', description: 'Auditoria de mudanças', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Parâmetros de Faturamento Manual',
          route: '/faturamento/parametros-manuais',
          icon: Settings,
          features: [
            { name: 'Lançamento manual de valores', description: 'Por empresa/competência', type: 'funcionalidade' },
            { name: 'Override de cálculo', description: 'Ignorar automático', type: 'funcionalidade' },
            { name: 'Modal de edição', description: 'Formulário de valores', type: 'modal' },
            { name: 'Comparativo automático vs manual', description: 'Diferenças destacadas', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Lotes de Faturamento',
          route: '/faturamento/lotes',
          icon: Package,
          features: [
            { name: 'Criação de lote', description: 'Agrupamento de boletos', type: 'funcionalidade' },
            { name: 'Modal de configuração', description: 'Parâmetros do lote', type: 'modal' },
            { name: 'Processamento em batch', description: 'Geração massiva', type: 'funcionalidade' },
            { name: 'Status de processamento', description: 'Progresso em tempo real', type: 'funcionalidade' },
            { name: 'Download de remessa', description: 'Arquivo para banco', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Parâmetros de Exportação',
          route: '/faturamento/parametros-exportacao',
          icon: FileSpreadsheet,
          features: [
            { name: 'Configuração de layouts', description: 'Formato de arquivo', type: 'funcionalidade' },
            { name: 'Mapeamento de campos', description: 'Correspondência de dados', type: 'funcionalidade' },
            { name: 'Templates salvos', description: 'Reutilização de configs', type: 'funcionalidade' },
            { name: 'Preview de exportação', description: 'Visualização antes de gerar', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Conferência 360°',
          route: '/faturamento/conferencia',
          icon: CheckCircle,
          features: [
            { name: 'Dashboard de conferência', description: 'Visão consolidada', type: 'funcionalidade' },
            { name: 'Aba: Dados Cadastrais', description: 'Verificação de cadastros', type: 'aba' },
            { name: 'Aba: Cálculos', description: 'Validação de valores', type: 'aba' },
            { name: 'Aba: Penalidades', description: 'Review de aplicações', type: 'aba' },
            { name: 'Aba: Campanhas', description: 'Benefícios concedidos', type: 'aba' },
            { name: 'Aprovação final', description: 'Liberação para emissão', type: 'funcionalidade' },
            { name: 'Rejeição com motivo', description: 'Retorno para correção', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Grupos Econômicos',
          route: '/faturamento/grupos',
          icon: Building2,
          features: [
            { name: 'Cadastro de grupos', description: 'Empresas relacionadas', type: 'funcionalidade' },
            { name: 'Modal de criação', description: 'Novo grupo', type: 'modal' },
            { name: 'Associação de empresas', description: 'Vínculo múltiplo', type: 'funcionalidade' },
            { name: 'Consolidação de valores', description: 'Totalização por grupo', type: 'funcionalidade' },
            { name: 'Faturamento unificado', description: 'Boleto único opcional', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Alertas de Desvios',
          route: '/faturamento/alertas',
          icon: Bell,
          features: [
            { name: 'Detecção automática', description: 'Algoritmos de análise', type: 'funcionalidade' },
            { name: 'Classificação de severidade', description: 'Crítico, alto, médio, baixo', type: 'funcionalidade' },
            { name: 'Dashboard de alertas', description: 'Visão geral', type: 'funcionalidade' },
            { name: 'Modal de detalhes', description: 'Informações completas', type: 'modal' },
            { name: 'Ações corretivas', description: 'Sugestões de resolução', type: 'funcionalidade' },
            { name: 'Histórico de resolução', description: 'Como foi solucionado', type: 'funcionalidade' },
          ],
        },
      ],
    },
    {
      name: 'Relatórios e Analytics',
      icon: BarChart3,
      color: 'text-purple-600',
      gradient: 'from-purple-600 to-purple-800',
      description: 'Inteligência de negócio e integração',
      screens: [
        {
          name: 'Dashboard Executivo',
          route: '/relatorios/dashboard',
          icon: PieChart,
          features: [
            { name: 'KPIs principais', description: 'Métricas de negócio', type: 'funcionalidade' },
            { name: 'Gráficos interativos', description: 'Drill-down de dados', type: 'funcionalidade' },
            { name: 'Filtros temporais', description: 'Por período', type: 'funcionalidade' },
            { name: 'Comparativos', description: 'Período vs período', type: 'funcionalidade' },
            { name: 'Exportação de relatórios', description: 'PDF, Excel', type: 'funcionalidade' },
          ],
        },
        {
          name: 'Integrações',
          route: '/relatorios/integracoes',
          icon: Zap,
          features: [
            { name: 'Status de integrações', description: 'Health check', type: 'funcionalidade' },
            { name: 'Logs de sincronização', description: 'Histórico de trocas', type: 'funcionalidade' },
            { name: 'Configuração de APIs', description: 'Endpoints e credenciais', type: 'funcionalidade' },
            { name: 'Modal de teste', description: 'Validação de conexão', type: 'modal' },
          ],
        },
      ],
    },
  ];

  const toggleModule = (moduleName: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleName)
        ? prev.filter(m => m !== moduleName)
        : [...prev, moduleName]
    );
  };

  const toggleScreen = (screenName: string) => {
    setExpandedScreens(prev =>
      prev.includes(screenName)
        ? prev.filter(s => s !== screenName)
        : [...prev, screenName]
    );
  };

  const getTotalScreens = () => {
    return modules.reduce((acc, module) => acc + module.screens.length, 0);
  };

  const getTotalFeatures = () => {
    return modules.reduce((acc, module) => {
      return acc + module.screens.reduce((screenAcc, screen) => {
        const countFeatures = (features: Feature[]): number => {
          return features.reduce((fAcc, feature) => {
            return fAcc + 1 + (feature.subFeatures ? countFeatures(feature.subFeatures) : 0);
          }, 0);
        };
        return screenAcc + countFeatures(screen.features);
      }, 0);
    }, 0);
  };

  const getFeatureIcon = (type: string) => {
    switch (type) {
      case 'tela': return '📄';
      case 'aba': return '📑';
      case 'modal': return '🪟';
      case 'funcionalidade': return '⚙️';
      default: return '•';
    }
  };

  const renderFeature = (feature: Feature, level: number = 0) => {
    return (
      <div key={feature.name} className={`${level > 0 ? 'ml-6 border-l-2 border-neutral-200 pl-4' : ''}`}>
        <div className="flex items-start gap-3 py-2">
          <span className="text-lg">{getFeatureIcon(feature.type)}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-neutral-900">{feature.name}</p>
              <Badge variant={
                feature.type === 'tela' ? 'default' :
                feature.type === 'aba' ? 'warning' :
                feature.type === 'modal' ? 'danger' :
                'success'
              } className="text-xs">
                {feature.type}
              </Badge>
            </div>
            <p className="text-sm text-neutral-600">{feature.description}</p>
          </div>
        </div>
        {feature.subFeatures && feature.subFeatures.length > 0 && (
          <div className="mt-2">
            {feature.subFeatures.map(subFeature => renderFeature(subFeature, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Sobre a Aplicação</h1>
        <p className="text-neutral-600 mt-1">
          Documentação completa de todas as funcionalidades do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="elevated">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#007C92] to-[#005f70] rounded-xl flex items-center justify-center mx-auto mb-3">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-[#007C92] mb-1">{modules.length}</p>
            <p className="text-sm text-neutral-600 font-medium">Módulos</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#007C92] to-[#005f70] rounded-xl flex items-center justify-center mx-auto mb-3">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-[#007C92] mb-1">{getTotalScreens()}</p>
            <p className="text-sm text-neutral-600 font-medium">Telas</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F47920] to-[#D66714] rounded-xl flex items-center justify-center mx-auto mb-3">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-[#F47920] mb-1">{getTotalFeatures()}</p>
            <p className="text-sm text-neutral-600 font-medium">Funcionalidades</p>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <p className="text-3xl font-bold text-green-600 mb-1">v1.0</p>
            <p className="text-sm text-neutral-600 font-medium">Versão</p>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-[#007C92]" />
            <h2 className="text-xl font-bold text-neutral-900">Legenda</h2>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">📄</span>
              <span className="text-sm font-medium text-neutral-700">Tela</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📑</span>
              <span className="text-sm font-medium text-neutral-700">Aba</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🪟</span>
              <span className="text-sm font-medium text-neutral-700">Modal</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              <span className="text-sm font-medium text-neutral-700">Funcionalidade</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {modules.map((module) => {
          const ModuleIcon = module.icon;
          const isExpanded = expandedModules.includes(module.name);

          return (
            <Card key={module.name} variant="elevated" className="overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${module.gradient}`} />

              <CardHeader
                className="cursor-pointer hover:bg-neutral-50 transition-colors"
                onClick={() => toggleModule(module.name)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${module.gradient} rounded-xl flex items-center justify-center`}>
                      <ModuleIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold ${module.color}`}>{module.name}</h3>
                      <p className="text-sm text-neutral-600">{module.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-neutral-900">{module.screens.length}</p>
                      <p className="text-xs text-neutral-500">telas</p>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-6 w-6 text-neutral-400" />
                    ) : (
                      <ChevronRight className="h-6 w-6 text-neutral-400" />
                    )}
                  </div>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="border-t border-neutral-200 bg-neutral-50">
                  <div className="space-y-4">
                    {module.screens.map((screen) => {
                      const ScreenIcon = screen.icon;
                      const isScreenExpanded = expandedScreens.includes(`${module.name}-${screen.name}`);

                      return (
                        <Card key={screen.name} className="bg-white">
                          <CardHeader
                            className="cursor-pointer hover:bg-neutral-50 transition-colors"
                            onClick={() => toggleScreen(`${module.name}-${screen.name}`)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <ScreenIcon className={`h-5 w-5 ${module.color}`} />
                                <div>
                                  <h4 className="font-semibold text-neutral-900">{screen.name}</h4>
                                  <p className="text-xs text-neutral-500">{screen.route}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant="default">{screen.features.length} features</Badge>
                                {isScreenExpanded ? (
                                  <ChevronDown className="h-5 w-5 text-neutral-400" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-neutral-400" />
                                )}
                              </div>
                            </div>
                          </CardHeader>

                          {isScreenExpanded && (
                            <CardContent className="border-t border-neutral-100 bg-neutral-50">
                              <div className="space-y-1">
                                {screen.features.map(feature => renderFeature(feature))}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      <Card variant="elevated" className="bg-gradient-to-br from-[#007C92]/5 to-[#F47920]/5">
        <CardContent className="p-8 text-center">
          <Building2 className="h-12 w-12 text-[#007C92] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neutral-900 mb-2">
            Sistema de Faturamento Assistencial Seconci-SP
          </h3>
          <p className="text-neutral-600 mb-4">
            Desenvolvido por SysMap Solutions © 2025
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-neutral-600">
            <span>Versão 1.0.0</span>
            <span>•</span>
            <span>{getTotalScreens()} Telas</span>
            <span>•</span>
            <span>{getTotalFeatures()} Funcionalidades</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
