import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, RefreshCw, Search, Filter, Calendar } from 'lucide-react';
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

const ruleUpdateSchema = z.object({
  company_id: z.string().min(1, 'Empresa obrigatória'),
  billing_rule_id: z.string().min(1, 'Regra obrigatória'),
  effective_date: z.string().min(1, 'Data efetiva obrigatória'),
  end_date: z.string().optional(),
  assignment_reason: z.string().min(10, 'Justificativa obrigatória (mín. 10 caracteres)'),
});

type RuleUpdateFormData = z.infer<typeof ruleUpdateSchema>;

interface CompanyRuleAssignment {
  id: string;
  company_id: string;
  billing_rule_id: string;
  effective_date: string;
  end_date?: string;
  assignment_reason: string;
  active: boolean;
  created_at: string;
  companies: {
    corporate_name: string;
    cnpj: string;
  };
  billing_rules: {
    name: string;
    rule_type: string;
  };
}

interface Company {
  id: string;
  corporate_name: string;
  cnpj: string;
}

interface BillingRule {
  id: string;
  name: string;
  rule_type: string;
}

export default function CompanyRuleUpdate() {
  const [assignments, setAssignments] = useState<CompanyRuleAssignment[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [rules, setRules] = useState<BillingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<CompanyRuleAssignment | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RuleUpdateFormData>({
    resolver: zodResolver(ruleUpdateSchema),
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [assignmentsRes, companiesRes, rulesRes] = await Promise.all([
      supabase
        .from('company_billing_rules')
        .select(`
          *,
          companies(corporate_name, cnpj),
          billing_rules(name, rule_type)
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('companies')
        .select('id, corporate_name, cnpj')
        .eq('status', 'active')
        .order('corporate_name'),
      supabase
        .from('billing_rules')
        .select('id, name, rule_type')
        .eq('active', true)
        .order('name')
    ]);

    if (assignmentsRes.error) {
      toast.error('Erro ao carregar atribuições');
    } else {
      setAssignments(assignmentsRes.data || []);
    }

    if (companiesRes.error) {
      toast.error('Erro ao carregar empresas');
    } else {
      setCompanies(companiesRes.data || []);
    }

    if (rulesRes.error) {
      toast.error('Erro ao carregar regras');
    } else {
      setRules(rulesRes.data || []);
    }

    setLoading(false);
  };

  const onSubmit = async (data: RuleUpdateFormData) => {
    setSaving(true);
    try {
      const assignmentData = {
        company_id: data.company_id,
        billing_rule_id: data.billing_rule_id,
        effective_date: data.effective_date,
        end_date: data.end_date || null,
        assignment_reason: data.assignment_reason,
        assigned_by: (await supabase.auth.getUser()).data.user?.id,
        active: true,
      };

      if (selectedAssignment) {
        const { error } = await supabase
          .from('company_billing_rules')
          .update(assignmentData)
          .eq('id', selectedAssignment.id);

        if (error) throw error;
        toast.success('Regra atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('company_billing_rules')
          .insert([assignmentData]);

        if (error) throw error;
        toast.success('Regra atribuída com sucesso!');
      }

      await loadData();
      setIsModalOpen(false);
      setSelectedAssignment(null);
      reset();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar regra');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      const { error } = await supabase
        .from('company_billing_rules')
        .update({ active: false, end_date: new Date().toISOString().split('T')[0] })
        .eq('id', id);

      if (error) throw error;
      toast.success('Regra desativada com sucesso!');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao desativar regra');
    }
  };

  const filteredAssignments = assignments.filter(
    (assignment) =>
      assignment.companies?.corporate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.companies?.cnpj.includes(searchTerm) ||
      assignment.billing_rules?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<CompanyRuleAssignment>[] = [
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
      accessorKey: 'billing_rules.name',
      header: 'Regra de Faturamento',
      cell: ({ row }) => (
        <Badge variant="info">{row.original.billing_rules?.name}</Badge>
      ),
    },
    {
      accessorKey: 'effective_date',
      header: 'Vigência',
      cell: ({ row }) => (
        <span className="text-sm text-neutral-700">
          {new Date(row.original.effective_date).toLocaleDateString('pt-BR')}
          {row.original.end_date && (
            <> até {new Date(row.original.end_date).toLocaleDateString('pt-BR')}</>
          )}
        </span>
      ),
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.active ? 'success' : 'default'}>
          {row.original.active ? 'Ativa' : 'Inativa'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.active && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Desativar esta regra?')) {
                  handleDeactivate(row.original.id);
                }
              }}
            >
              Desativar
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Atualização de Regras de Empresas</h1>
          <p className="text-neutral-600 mt-1">
            Atribuir e gerenciar regras de faturamento para empresas
          </p>
        </div>
        <Button onClick={() => { setSelectedAssignment(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Atribuição
        </Button>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Buscar por empresa, CNPJ ou regra..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={loadData}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          ) : filteredAssignments.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhuma atribuição encontrada"
              description="Comece atribuindo regras de faturamento para empresas"
              action={{
                label: 'Nova Atribuição',
                onClick: () => { setSelectedAssignment(null); setIsModalOpen(true); }
              }}
            />
          ) : (
            <DataGrid
              data={filteredAssignments}
              columns={columns}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedAssignment(null);
          reset();
        }}
        title="Atribuir Regra de Faturamento"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            <div className="space-y-4">
              <Select
                label="Empresa *"
                {...register('company_id')}
                error={errors.company_id?.message}
                options={[
                  { value: '', label: 'Selecione uma empresa' },
                  ...companies.map(c => ({
                    value: c.id,
                    label: `${c.corporate_name} - ${c.cnpj}`
                  }))
                ]}
              />

              <Select
                label="Regra de Faturamento *"
                {...register('billing_rule_id')}
                error={errors.billing_rule_id?.message}
                options={[
                  { value: '', label: 'Selecione uma regra' },
                  ...rules.map(r => ({
                    value: r.id,
                    label: r.name
                  }))
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Data de Início *"
                  type="date"
                  {...register('effective_date')}
                  error={errors.effective_date?.message}
                />
                <Input
                  label="Data de Término"
                  type="date"
                  {...register('end_date')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Justificativa *
                </label>
                <textarea
                  {...register('assignment_reason')}
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
                  placeholder="Descreva o motivo desta atribuição de regra..."
                />
                {errors.assignment_reason && (
                  <p className="mt-1 text-sm text-red-600">{errors.assignment_reason.message}</p>
                )}
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedAssignment(null);
                reset();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Atribuir Regra
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
