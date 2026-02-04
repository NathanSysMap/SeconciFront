import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { DataGrid } from '../../components/ui/DataGrid';
import { Modal, ModalContent, ModalFooter } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';

const penaltyApplicationSchema = z.object({
  company_id: z.string().min(1, 'Empresa obrigatória'),
  penalty_id: z.string().min(1, 'Penalidade obrigatória'),
  reference_month: z.string().min(1, 'Mês de referência obrigatório'),
  penalty_percentage: z.string().optional(),
  penalty_amount: z.string().optional(),
  reason: z.string().min(10, 'Justificativa obrigatória'),
  occurrence_count: z.string().min(1, 'Quantidade obrigatória'),
});

type PenaltyApplicationFormData = z.infer<typeof penaltyApplicationSchema>;

export default function PenaltyApplication() {
  const [applications, setApplications] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [penalties, setPenalties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PenaltyApplicationFormData>({
    resolver: zodResolver(penaltyApplicationSchema),
    defaultValues: {
      occurrence_count: '1',
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [appsRes, companiesRes, penaltiesRes] = await Promise.all([
      supabase.from('penalty_applications').select('*, companies(corporate_name, cnpj), penalties(description)').order('applied_date', { ascending: false }),
      supabase.from('companies').select('id, corporate_name, cnpj').eq('status', 'active').order('corporate_name'),
      supabase.from('penalties').select('*').eq('active', true).order('description')
    ]);

    if (!appsRes.error) setApplications(appsRes.data || []);
    if (!companiesRes.error) setCompanies(companiesRes.data || []);
    if (!penaltiesRes.error) setPenalties(penaltiesRes.data || []);
    setLoading(false);
  };

  const onSubmit = async (data: PenaltyApplicationFormData) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('penalty_applications').insert([{
        company_id: data.company_id,
        penalty_id: data.penalty_id,
        reference_month: data.reference_month,
        penalty_percentage: data.penalty_percentage ? parseFloat(data.penalty_percentage) : null,
        penalty_amount: data.penalty_amount ? parseFloat(data.penalty_amount) : 0,
        reason: data.reason,
        occurrence_count: parseInt(data.occurrence_count),
        applied_by: (await supabase.auth.getUser()).data.user?.id,
        status: 'applied',
      }]);

      if (error) throw error;
      toast.success('Penalidade aplicada com sucesso!');
      await loadData();
      setIsModalOpen(false);
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao aplicar penalidade');
    } finally {
      setSaving(false);
    }
  };

  const filteredApplications = applications.filter(app =>
    app.companies?.corporate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.companies?.cnpj.includes(searchTerm)
  );

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: 'companies.corporate_name',
      header: 'Empresa',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-neutral-900">{row.original.companies?.corporate_name}</p>
          <p className="text-xs text-neutral-500">{row.original.companies?.cnpj}</p>
        </div>
      ),
    },
    {
      accessorKey: 'penalties.description',
      header: 'Penalidade',
      cell: ({ row }) => <Badge variant="warning">{row.original.penalties?.description}</Badge>,
    },
    {
      accessorKey: 'reference_month',
      header: 'Mês Referência',
      cell: ({ row }) => new Date(row.original.reference_month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    },
    {
      accessorKey: 'penalty_amount',
      header: 'Valor',
      cell: ({ row }) => `R$ ${Number(row.original.penalty_amount).toFixed(2)}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'applied' ? 'success' : 'default'}>
          {row.original.status === 'applied' ? 'Aplicada' : row.original.status}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Aplicação de Penalidades</h1>
          <p className="text-neutral-600 mt-1">Aplicar penalidades por falta de atualização cadastral</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Aplicar Penalidade
        </Button>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
            <Input type="text" placeholder="Buscar por empresa ou CNPJ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <EmptyState icon={AlertTriangle} title="Nenhuma penalidade aplicada" description="Comece aplicando penalidades para empresas" action={{ label: 'Aplicar Penalidade', onClick: () => setIsModalOpen(true) }} />
          ) : (
            <DataGrid data={filteredApplications} columns={columns} />
          )}
        </CardContent>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); reset(); }} title="Aplicar Penalidade" size="lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            <div className="space-y-4">
              <Select label="Empresa *" {...register('company_id')} error={errors.company_id?.message} options={[{ value: '', label: 'Selecione uma empresa' }, ...companies.map(c => ({ value: c.id, label: `${c.corporate_name} - ${c.cnpj}` }))]} />
              <Select label="Penalidade *" {...register('penalty_id')} error={errors.penalty_id?.message} options={[{ value: '', label: 'Selecione uma penalidade' }, ...penalties.map(p => ({ value: p.id, label: p.description }))]} />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Mês de Referência *" type="month" {...register('reference_month')} error={errors.reference_month?.message} />
                <Input label="Ocorrências" type="number" {...register('occurrence_count')} error={errors.occurrence_count?.message} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Percentual (%)" type="number" step="0.01" {...register('penalty_percentage')} />
                <Input label="Valor (R$)" type="number" step="0.01" {...register('penalty_amount')} />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Justificativa *</label>
                <textarea {...register('reason')} rows={4} className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent" placeholder="Descreva o motivo da aplicação desta penalidade..." />
                {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason.message}</p>}
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button type="button" variant="outline" onClick={() => { setIsModalOpen(false); reset(); }}>Cancelar</Button>
            <Button type="submit" loading={saving}>Aplicar</Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
