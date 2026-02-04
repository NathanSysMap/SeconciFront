import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Calendar, Edit, Search, Filter, Building2, FileText } from 'lucide-react';
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

const contractValiditySchema = z.object({
  company_id: z.string().min(1, 'Empresa obrigatória'),
  billing_rule_id: z.string().min(1, 'Regra de faturamento obrigatória'),
  valid_from: z.string().min(1, 'Data inicial obrigatória'),
  valid_until: z.string().optional(),
  status: z.string(),
});

type ContractValidityFormData = z.infer<typeof contractValiditySchema>;

interface ContractValidity extends ContractValidityFormData {
  id: string;
  companies?: {
    corporate_name: string;
    cnpj: string;
  };
  billing_rules?: {
    name: string;
    convention: string | null;
  };
  created_at?: string;
  updated_at?: string;
}

interface Company {
  id: string;
  corporate_name: string;
  cnpj: string;
}

interface BillingRule {
  id: string;
  name: string;
  convention: string | null;
  active: boolean;
}

export default function ContractValidities() {
  const [validities, setValidities] = useState<ContractValidity[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [billingRules, setBillingRules] = useState<BillingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedValidity, setSelectedValidity] = useState<ContractValidity | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContractValidityFormData>({
    resolver: zodResolver(contractValiditySchema),
    defaultValues: {
      status: 'active',
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedValidity) {
      reset({
        company_id: selectedValidity.company_id,
        billing_rule_id: selectedValidity.billing_rule_id,
        valid_from: selectedValidity.valid_from,
        valid_until: selectedValidity.valid_until || '',
        status: selectedValidity.status,
      });
    } else {
      reset({
        company_id: '',
        billing_rule_id: '',
        valid_from: '',
        valid_until: '',
        status: 'active',
      });
    }
  }, [selectedValidity, reset]);

  const loadData = async () => {
    setLoading(true);

    const [validitiesRes, companiesRes, rulesRes] = await Promise.all([
      supabase
        .from('contract_validities')
        .select(`
          *,
          companies (
            corporate_name,
            cnpj
          ),
          billing_rules (
            name,
            convention
          )
        `)
        .order('valid_from', { ascending: false }),
      supabase
        .from('companies')
        .select('id, corporate_name, cnpj')
        .eq('status', 'active')
        .order('corporate_name'),
      supabase
        .from('billing_rules')
        .select('id, name, convention, active')
        .eq('active', true)
        .order('name')
    ]);

    if (validitiesRes.error) {
      toast.error('Erro ao carregar vigências');
    } else {
      setValidities(validitiesRes.data || []);
    }

    if (companiesRes.error) {
      toast.error('Erro ao carregar empresas');
    } else {
      setCompanies(companiesRes.data || []);
    }

    if (rulesRes.error) {
      toast.error('Erro ao carregar regras');
    } else {
      setBillingRules(rulesRes.data || []);
    }

    setLoading(false);
  };

  const onSubmit = async (data: ContractValidityFormData) => {
    setSaving(true);
    try {
      const validityData = {
        company_id: data.company_id,
        billing_rule_id: data.billing_rule_id,
        valid_from: data.valid_from,
        valid_until: data.valid_until || null,
        status: data.status,
      };

      if (selectedValidity) {
        const { error } = await supabase
          .from('contract_validities')
          .update(validityData)
          .eq('id', selectedValidity.id);

        if (error) throw error;
        toast.success('Vigência atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('contract_validities')
          .insert([validityData]);

        if (error) throw error;
        toast.success('Vigência cadastrada com sucesso!');
      }

      await loadData();
      setIsModalOpen(false);
      setSelectedValidity(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar vigência');
    } finally {
      setSaving(false);
    }
  };

  const getStatusInfo = (validity: ContractValidity) => {
    const now = new Date();
    const from = new Date(validity.valid_from);
    const until = validity.valid_until ? new Date(validity.valid_until) : null;

    if (validity.status !== 'active') {
      return { label: 'Inativa', variant: 'default' as const };
    }

    if (now < from) {
      return { label: 'Futura', variant: 'info' as const };
    }

    if (until && now > until) {
      return { label: 'Encerrada', variant: 'default' as const };
    }

    return { label: 'Ativa', variant: 'success' as const };
  };

  const filteredValidities = validities.filter(
    (validity) =>
      validity.companies?.corporate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      validity.companies?.cnpj.includes(searchTerm) ||
      validity.billing_rules?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<ContractValidity>[] = [
    {
      accessorKey: 'companies.corporate_name',
      header: 'Empresa',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-neutral-900">
            {row.original.companies?.corporate_name}
          </p>
          <p className="text-xs text-neutral-500 font-mono">
            {row.original.companies?.cnpj}
          </p>
        </div>
      ),
    },
    {
      accessorKey: 'billing_rules.name',
      header: 'Regra de Faturamento',
      cell: ({ row }) => (
        <div>
          <p className="text-sm font-medium text-neutral-900">
            {row.original.billing_rules?.name}
          </p>
          {row.original.billing_rules?.convention && (
            <p className="text-xs text-neutral-500">
              {row.original.billing_rules.convention}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'valid_from',
      header: 'Período de Vigência',
      cell: ({ row }) => (
        <div className="text-sm text-neutral-700">
          <p className="font-medium">
            {new Date(row.original.valid_from).toLocaleDateString('pt-BR')}
          </p>
          {row.original.valid_until && (
            <p className="text-neutral-500">
              até {new Date(row.original.valid_until).toLocaleDateString('pt-BR')}
            </p>
          )}
          {!row.original.valid_until && (
            <p className="text-neutral-500">Vigência indeterminada</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusInfo = getStatusInfo(row.original);
        return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
      },
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
              setSelectedValidity(row.original);
              setIsModalOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Vigências de Contratos</h1>
          <p className="text-neutral-600 mt-1">
            Gestão de períodos contratuais e regras de faturamento por empresa
          </p>
        </div>
        <Button onClick={() => { setSelectedValidity(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Vigência
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
          ) : filteredValidities.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Nenhuma vigência encontrada"
              description="Comece criando a primeira vigência contratual"
              action={{
                label: 'Nova Vigência',
                onClick: () => { setSelectedValidity(null); setIsModalOpen(true); }
              }}
            />
          ) : (
            <DataGrid
              data={filteredValidities}
              columns={columns}
              onRowClick={(validity) => {
                setSelectedValidity(validity);
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
          setSelectedValidity(null);
        }}
        title={selectedValidity ? 'Editar Vigência de Contrato' : 'Nova Vigência de Contrato'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Sobre Vigências de Contrato
                    </h4>
                    <p className="text-sm text-blue-700">
                      Configure o período em que uma empresa estará vinculada a uma regra de faturamento específica.
                      Cada empresa pode ter múltiplas vigências em períodos diferentes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Select
                  label="Empresa Cliente *"
                  {...register('company_id')}
                  error={errors.company_id?.message}
                  options={[
                    { value: '', label: 'Selecione uma empresa...' },
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
                    { value: '', label: 'Selecione uma regra...' },
                    ...billingRules.map(r => ({
                      value: r.id,
                      label: r.convention
                        ? `${r.name} (${r.convention})`
                        : r.name
                    }))
                  ]}
                />
              </div>

              <div className="bg-neutral-50 p-4 rounded-lg">
                <h3 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Período de Vigência
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Data Inicial *"
                    type="date"
                    {...register('valid_from')}
                    error={errors.valid_from?.message}
                  />
                  <Input
                    label="Data Final"
                    type="date"
                    {...register('valid_until')}
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-2">
                  Deixe a data final em branco para vigência sem prazo de término
                </p>
              </div>

              <Select
                label="Status *"
                {...register('status')}
                options={[
                  { value: 'active', label: 'Ativo' },
                  { value: 'inactive', label: 'Inativo' },
                  { value: 'suspended', label: 'Suspenso' },
                ]}
              />

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-900 mb-1">
                      Importante
                    </h4>
                    <ul className="text-sm text-amber-700 space-y-1">
                      <li>• Evite sobreposição de períodos para a mesma empresa</li>
                      <li>• A regra selecionada será aplicada em todos os cálculos do período</li>
                      <li>• Vigências futuras podem ser cadastradas antecipadamente</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedValidity(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {selectedValidity ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
