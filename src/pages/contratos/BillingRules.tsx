import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Copy, Edit, Search, Filter } from 'lucide-react';
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

const billingRuleSchema = z.object({
  name: z.string().min(3, 'Nome obrigatório'),
  convention: z.string().optional(),
  work_location: z.string().optional(),
  rule_type: z.string().min(1, 'Tipo de regra obrigatório'),
  base_percentage: z.string().optional(),
  overtime_percentage: z.string().optional(),
  thirteenth_percentage: z.string().optional(),
  dependent_value: z.string().optional(),
  sampling_rule: z.string().optional(),
  valid_from: z.string().min(1, 'Data inicial obrigatória'),
  valid_until: z.string().optional(),
  active: z.enum(['true', 'false']),
});

type BillingRuleFormData = z.infer<typeof billingRuleSchema>;

interface BillingRule extends Omit<BillingRuleFormData, 'base_percentage' | 'overtime_percentage' | 'thirteenth_percentage' | 'dependent_value'> {
  id: string;
  percentages?: any;
  minimums?: any;
  exceptions?: any;
  created_at?: string;
  updated_at?: string;
}

interface Company {
  id: string;
  corporate_name: string;
}

export default function BillingRules() {
  const [rules, setRules] = useState<BillingRule[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<BillingRule | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<BillingRuleFormData>({
    resolver: zodResolver(billingRuleSchema),
    defaultValues: {
      active: 'true',
      rule_type: 'convention',
    }
  });

  const ruleType = watch('rule_type');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedRule) {
      const percentages = selectedRule.percentages || {};
      reset({
        name: selectedRule.name,
        convention: selectedRule.convention || '',
        work_location: selectedRule.work_location || '',
        rule_type: selectedRule.rule_type,
        base_percentage: percentages.base?.toString() || '',
        overtime_percentage: percentages.overtime?.toString() || '',
        thirteenth_percentage: percentages.thirteenth?.toString() || '',
        dependent_value: percentages.dependent?.toString() || '',
        sampling_rule: percentages.sampling || '',
        valid_from: selectedRule.valid_from,
        valid_until: selectedRule.valid_until || '',
        active: selectedRule.active ? 'true' : 'false',
      });
    } else {
      reset({
        name: '',
        convention: '',
        work_location: '',
        rule_type: 'convention',
        base_percentage: '',
        overtime_percentage: '',
        thirteenth_percentage: '',
        dependent_value: '',
        sampling_rule: '1/12',
        valid_from: '',
        valid_until: '',
        active: 'true',
      });
    }
  }, [selectedRule, reset]);

  const loadData = async () => {
    setLoading(true);

    const [rulesRes, companiesRes] = await Promise.all([
      supabase
        .from('billing_rules')
        .select('*')
        .order('valid_from', { ascending: false }),
      supabase
        .from('companies')
        .select('id, corporate_name')
        .eq('status', 'active')
        .order('corporate_name')
    ]);

    if (rulesRes.error) {
      toast.error('Erro ao carregar regras');
    } else {
      setRules(rulesRes.data || []);
    }

    if (companiesRes.error) {
      toast.error('Erro ao carregar empresas');
    } else {
      setCompanies(companiesRes.data || []);
    }

    setLoading(false);
  };

  const onSubmit = async (data: BillingRuleFormData) => {
    setSaving(true);
    try {
      const ruleData = {
        name: data.name,
        convention: data.convention || null,
        work_location: data.work_location || null,
        rule_type: data.rule_type,
        percentages: {
          base: data.base_percentage ? parseFloat(data.base_percentage) : null,
          overtime: data.overtime_percentage ? parseFloat(data.overtime_percentage) : null,
          thirteenth: data.thirteenth_percentage ? parseFloat(data.thirteenth_percentage) : null,
          dependent: data.dependent_value ? parseFloat(data.dependent_value) : null,
          sampling: data.sampling_rule || '1/12',
        },
        valid_from: data.valid_from,
        valid_until: data.valid_until || null,
        active: data.active === 'true',
      };

      if (selectedRule) {
        const { error } = await supabase
          .from('billing_rules')
          .update(ruleData)
          .eq('id', selectedRule.id);

        if (error) throw error;
        toast.success('Regra atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('billing_rules')
          .insert([ruleData]);

        if (error) throw error;
        toast.success('Regra cadastrada com sucesso!');
      }

      await loadData();
      setIsModalOpen(false);
      setSelectedRule(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar regra');
    } finally {
      setSaving(false);
    }
  };

  const handleDuplicate = async (rule: BillingRule) => {
    const newRule = {
      ...rule,
      name: `${rule.name} (Cópia)`,
      id: undefined,
      created_at: undefined,
      updated_at: undefined,
    };
    setSelectedRule(newRule as any);
    setIsModalOpen(true);
  };

  const filteredRules = rules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.convention?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.rule_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<BillingRule>[] = [
    {
      accessorKey: 'name',
      header: 'Nome da Regra',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-neutral-900">{row.original.name}</p>
          {row.original.work_location && (
            <p className="text-xs text-neutral-500">{row.original.work_location}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'convention',
      header: 'Convenção',
      cell: ({ row }) => (
        <Badge variant="info">{row.original.convention || 'Geral'}</Badge>
      ),
    },
    {
      accessorKey: 'rule_type',
      header: 'Tipo',
      cell: ({ row }) => {
        const typeLabels: Record<string, string> = {
          convention: 'Convenção',
          company: 'Por Empresa',
          location: 'Por Localidade',
        };
        return (
          <Badge variant="default">
            {typeLabels[row.original.rule_type] || row.original.rule_type}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'valid_from',
      header: 'Vigência',
      cell: ({ row }) => (
        <span className="text-sm text-neutral-700">
          {new Date(row.original.valid_from).toLocaleDateString('pt-BR')}
          {row.original.valid_until && (
            <> até {new Date(row.original.valid_until).toLocaleDateString('pt-BR')}</>
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
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedRule(row.original);
              setIsModalOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDuplicate(row.original);
            }}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Regras de Faturamento</h1>
          <p className="text-neutral-600 mt-1">
            Configuração de regras por convenção coletiva e empresa
          </p>
        </div>
        <Button onClick={() => { setSelectedRule(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Regra
        </Button>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Buscar por nome, convenção ou tipo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          ) : filteredRules.length === 0 ? (
            <EmptyState
              icon={Plus}
              title="Nenhuma regra encontrada"
              description="Comece criando uma nova regra de faturamento"
              action={{
                label: 'Nova Regra',
                onClick: () => { setSelectedRule(null); setIsModalOpen(true); }
              }}
            />
          ) : (
            <DataGrid
              data={filteredRules}
              columns={columns}
              onRowClick={(rule) => {
                setSelectedRule(rule);
                setIsModalOpen(true);
              }}
            />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRule(null);
        }}
        title={selectedRule ? 'Editar Regra de Faturamento' : 'Nova Regra de Faturamento'}
        size="xl"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            <div className="space-y-6">
              <div className="bg-neutral-50 p-4 rounded-lg">
                <h3 className="font-semibold text-neutral-900 mb-3">Informações Básicas</h3>
                <div className="space-y-4">
                  <Input
                    label="Nome da Regra *"
                    placeholder="Ex: SINDUSCON Capital 2025"
                    {...register('name')}
                    error={errors.name?.message}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Tipo de Regra *"
                      {...register('rule_type')}
                      error={errors.rule_type?.message}
                      options={[
                        { value: 'convention', label: 'Por Convenção Coletiva' },
                        { value: 'company', label: 'Por Empresa Específica' },
                        { value: 'location', label: 'Por Localidade' },
                      ]}
                    />
                    <Select
                      label="Status *"
                      {...register('active')}
                      options={[
                        { value: 'true', label: 'Ativa' },
                        { value: 'false', label: 'Inativa' },
                      ]}
                    />
                  </div>

                  {ruleType === 'convention' && (
                    <Input
                      label="Convenção Coletiva"
                      placeholder="Ex: SINDUSCON-SP, SECONCI-SP"
                      {...register('convention')}
                    />
                  )}

                  <Input
                    label="Localidade (opcional)"
                    placeholder="Ex: Capital, Interior, Grande São Paulo"
                    {...register('work_location')}
                  />
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-lg">
                <h3 className="font-semibold text-neutral-900 mb-3">Percentuais e Valores</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Percentual Base (%)"
                    type="number"
                    step="0.01"
                    placeholder="2.50"
                    {...register('base_percentage')}
                  />
                  <Input
                    label="Percentual Horas Extras (%)"
                    type="number"
                    step="0.01"
                    placeholder="3.00"
                    {...register('overtime_percentage')}
                  />
                  <Input
                    label="Percentual 13º Salário (%)"
                    type="number"
                    step="0.01"
                    placeholder="2.50"
                    {...register('thirteenth_percentage')}
                  />
                  <Input
                    label="Valor por Dependente (R$)"
                    type="number"
                    step="0.01"
                    placeholder="50.00"
                    {...register('dependent_value')}
                  />
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-lg">
                <h3 className="font-semibold text-neutral-900 mb-3">Configurações Adicionais</h3>
                <div className="space-y-4">
                  <Select
                    label="Regra de Amostragem"
                    {...register('sampling_rule')}
                    options={[
                      { value: '1/12', label: '1/12 - Média mensal' },
                      { value: 'full', label: 'Base completa' },
                      { value: 'custom', label: 'Personalizado' },
                    ]}
                  />
                </div>
              </div>

              <div className="bg-neutral-50 p-4 rounded-lg">
                <h3 className="font-semibold text-neutral-900 mb-3">Período de Vigência</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Data Inicial *"
                    type="date"
                    {...register('valid_from')}
                    error={errors.valid_from?.message}
                  />
                  <Input
                    label="Data Final (opcional)"
                    type="date"
                    {...register('valid_until')}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Deixe a data final em branco para regras sem prazo de término
                </p>
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedRule(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {selectedRule ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
