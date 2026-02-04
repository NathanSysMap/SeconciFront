import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DataGrid } from '../../components/ui/DataGrid';
import { FileText, Download, Calendar, DollarSign, Clock, CreditCard } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';

const reportFilterSchema = z.object({
  start_date: z.string().min(1, 'Data inicial obrigatória'),
  end_date: z.string().min(1, 'Data final obrigatória'),
});

const boletoExtensionSchema = z.object({
  company_id: z.string().min(1, 'Selecione uma empresa'),
  boleto_number: z.string().min(1, 'Número do boleto obrigatório'),
  original_due_date: z.string().min(1, 'Data de vencimento original obrigatória'),
  requested_due_date: z.string().min(1, 'Nova data de vencimento obrigatória'),
  reason: z.string().min(10, 'Motivo deve ter no mínimo 10 caracteres'),
});

type ReportFilterData = z.infer<typeof reportFilterSchema>;
type BoletoExtensionData = z.infer<typeof boletoExtensionSchema>;

interface Company {
  id: string;
  name: string;
}

interface BoletoExtensionRequest {
  id: string;
  company_id: string;
  boleto_number: string;
  original_due_date: string;
  requested_due_date: string;
  reason: string;
  status: string;
  created_at: string;
  companies?: {
    name: string;
  };
}

type ReportCategory = 'schedules' | 'attendance' | 'billing' | 'calculation' | 'boleto_extension';

export default function Reports() {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('schedules');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [extensionRequests, setExtensionRequests] = useState<BoletoExtensionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);

  const reportForm = useForm<ReportFilterData>({
    resolver: zodResolver(reportFilterSchema),
  });

  const extensionForm = useForm<BoletoExtensionData>({
    resolver: zodResolver(boletoExtensionSchema),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [companiesRes, extensionRequestsRes] = await Promise.all([
      supabase.from('companies').select('id, name').order('name'),
      supabase
        .from('boleto_extension_requests')
        .select(`
          *,
          companies (name)
        `)
        .order('created_at', { ascending: false })
    ]);

    if (!companiesRes.error) setCompanies(companiesRes.data || []);
    if (!extensionRequestsRes.error) setExtensionRequests(extensionRequestsRes.data || []);

    setLoading(false);
  };

  const handleGenerateReport = (reportType: string) => {
    const data = reportForm.getValues();

    if (!data.start_date || !data.end_date) {
      toast.error('Selecione o período para gerar o relatório');
      return;
    }

    toast.success(`Gerando relatório de ${reportType}...`);
  };

  const onExtensionSubmit = async (data: BoletoExtensionData) => {
    setSaving(true);

    try {
      const { error } = await supabase
        .from('boleto_extension_requests')
        .insert([{
          company_id: data.company_id,
          boleto_number: data.boleto_number,
          original_due_date: data.original_due_date,
          requested_due_date: data.requested_due_date,
          reason: data.reason,
          status: 'pending',
        }]);

      if (error) throw error;

      toast.success('Solicitação de prorrogação enviada com sucesso!');
      setShowExtensionModal(false);
      extensionForm.reset();
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar solicitação');
    } finally {
      setSaving(false);
    }
  };

  const extensionColumns: ColumnDef<BoletoExtensionRequest>[] = [
    {
      accessorKey: 'boleto_number',
      header: 'Nº Boleto',
      cell: ({ row }) => (
        <span className="font-mono text-sm font-medium">{row.original.boleto_number}</span>
      ),
    },
    {
      accessorKey: 'companies.name',
      header: 'Empresa',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.companies?.name}</span>
      ),
    },
    {
      accessorKey: 'original_due_date',
      header: 'Vencimento Original',
      cell: ({ row }) => (
        <span className="text-sm">{new Date(row.original.original_due_date).toLocaleDateString('pt-BR')}</span>
      ),
    },
    {
      accessorKey: 'requested_due_date',
      header: 'Nova Data Solicitada',
      cell: ({ row }) => (
        <span className="text-sm font-medium text-blue-600">
          {new Date(row.original.requested_due_date).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusMap = {
          pending: { label: 'Pendente', variant: 'info' as const },
          approved: { label: 'Aprovado', variant: 'success' as const },
          rejected: { label: 'Rejeitado', variant: 'default' as const },
        };
        const status = statusMap[row.original.status as keyof typeof statusMap];
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Solicitado em',
      cell: ({ row }) => (
        <span className="text-sm text-neutral-600">
          {new Date(row.original.created_at).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
  ];

  const reportCategories = [
    {
      id: 'schedules',
      name: 'Agendamentos',
      icon: Calendar,
      color: 'blue',
      reports: [
        { type: 'schedules_summary', name: 'Resumo de Agendamentos', description: 'Agendamentos por período' },
        { type: 'schedules_detailed', name: 'Agendamentos Detalhados', description: 'Lista completa de agendamentos' },
      ]
    },
    {
      id: 'attendance',
      name: 'Atendimentos',
      icon: Clock,
      color: 'green',
      reports: [
        { type: 'attendance_summary', name: 'Resumo de Atendimentos', description: 'Atendimentos realizados por período' },
        { type: 'attendance_by_employee', name: 'Atendimentos por Funcionário', description: 'Detalhamento por funcionário' },
      ]
    },
    {
      id: 'billing',
      name: 'Faturamento',
      icon: DollarSign,
      color: 'purple',
      reports: [
        { type: 'billing_summary', name: 'Extrato de Faturamento', description: 'Resumo do faturamento por período' },
        { type: 'billing_detailed', name: 'Faturamento Detalhado', description: 'Detalhamento completo do faturamento' },
      ]
    },
    {
      id: 'calculation',
      name: 'Memória de Cálculo',
      icon: FileText,
      color: 'orange',
      reports: [
        { type: 'calculation_by_employee', name: 'Cálculo por Funcionário', description: 'Cálculo detalhado individual' },
        { type: 'calculation_by_company', name: 'Cálculo por Empresa', description: 'Consolidado por empresa' },
      ]
    },
    {
      id: 'boleto_extension',
      name: 'Prorrogação de Boletos',
      icon: CreditCard,
      color: 'red',
      reports: []
    },
  ];

  const activeReports = reportCategories.find(cat => cat.id === activeCategory);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Relatórios e Solicitações</h1>
        <p className="text-neutral-600 mt-1">
          Extraia relatórios e solicite prorrogação de boletos
        </p>
      </div>

      <div className="border-b border-neutral-200">
        <nav className="flex gap-2 overflow-x-auto">
          {reportCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as ReportCategory)}
                className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeCategory === category.id
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Icon className="h-4 w-4 inline mr-2" />
                {category.name}
              </button>
            );
          })}
        </nav>
      </div>

      {activeCategory !== 'boleto_extension' ? (
        <>
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-${activeReports?.color}-100 rounded-lg flex items-center justify-center`}>
                  {activeReports?.icon && <activeReports.icon className={`h-5 w-5 text-${activeReports.color}-600`} />}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Período de Extração</h3>
                  <p className="text-sm text-neutral-600">Selecione as datas para gerar os relatórios</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Data Início *"
                  type="date"
                  {...reportForm.register('start_date')}
                  error={reportForm.formState.errors.start_date?.message}
                />
                <Input
                  label="Data Fim *"
                  type="date"
                  {...reportForm.register('end_date')}
                  error={reportForm.formState.errors.end_date?.message}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeReports?.reports.map((report) => (
              <Card key={report.type} variant="elevated">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 bg-${activeReports.color}-100 rounded-lg flex items-center justify-center`}>
                      <FileText className={`h-5 w-5 text-${activeReports.color}-600`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">{report.name}</h3>
                      <p className="text-sm text-neutral-500">{report.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleGenerateReport(report.name)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Gerar Relatório
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-end">
            <Button onClick={() => setShowExtensionModal(true)}>
              <CreditCard className="h-4 w-4 mr-2" />
              Nova Solicitação
            </Button>
          </div>

          <Card variant="elevated">
            <CardHeader>
              <div>
                <h3 className="text-lg font-semibold">Solicitações de Prorrogação</h3>
                <p className="text-sm text-neutral-600">
                  {extensionRequests.length} solicitação(ões) registrada(s)
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
                </div>
              ) : extensionRequests.length === 0 ? (
                <div className="text-center py-12">
                  <CreditCard className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500">Nenhuma solicitação de prorrogação</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowExtensionModal(true)}
                  >
                    Criar Primeira Solicitação
                  </Button>
                </div>
              ) : (
                <DataGrid data={extensionRequests} columns={extensionColumns} />
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Modal
        isOpen={showExtensionModal}
        onClose={() => {
          setShowExtensionModal(false);
          extensionForm.reset();
        }}
        title="Solicitar Prorrogação de Boleto"
      >
        <form onSubmit={extensionForm.handleSubmit(onExtensionSubmit)} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg mb-4">
            <p className="text-xs text-blue-800">
              Preencha as informações do boleto que deseja prorrogar. A solicitação será analisada pela equipe financeira.
            </p>
          </div>

          <Select
            label="Empresa *"
            {...extensionForm.register('company_id')}
            error={extensionForm.formState.errors.company_id?.message}
            options={[
              { value: '', label: 'Selecione a empresa...' },
              ...companies.map(comp => ({ value: comp.id, label: comp.name }))
            ]}
          />

          <Input
            label="Número do Boleto *"
            placeholder="Ex: 23793.12345 67890.123456 78901.234567 1 23456789012345"
            {...extensionForm.register('boleto_number')}
            error={extensionForm.formState.errors.boleto_number?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Vencimento Original *"
              type="date"
              {...extensionForm.register('original_due_date')}
              error={extensionForm.formState.errors.original_due_date?.message}
            />
            <Input
              label="Nova Data Solicitada *"
              type="date"
              {...extensionForm.register('requested_due_date')}
              error={extensionForm.formState.errors.requested_due_date?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Motivo da Solicitação *
            </label>
            <textarea
              {...extensionForm.register('reason')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              rows={4}
              placeholder="Descreva o motivo da solicitação de prorrogação..."
            />
            {extensionForm.formState.errors.reason && (
              <p className="text-sm text-red-600 mt-1">
                {extensionForm.formState.errors.reason.message}
              </p>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <p className="text-xs text-yellow-800">
              A aprovação está sujeita à análise da equipe financeira. Você receberá uma resposta em até 2 dias úteis.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setShowExtensionModal(false);
                extensionForm.reset();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Enviar Solicitação
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
