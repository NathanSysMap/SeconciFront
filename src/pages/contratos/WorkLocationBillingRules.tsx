import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DataGrid } from '../../components/ui/DataGrid';
import { MapPin, Plus, Edit, Trash2, Settings } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';

const locationSchema = z.object({
  company_id: z.string().min(1, 'Selecione uma empresa'),
  location_name: z.string().min(3, 'Nome do local obrigatório (mínimo 3 caracteres)'),
  address: z.string().min(5, 'Endereço obrigatório (mínimo 5 caracteres)'),
  city: z.string().min(2, 'Cidade obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres (UF)'),
  postal_code: z.string().optional(),
  active: z.enum(['true', 'false']),
});

const billingRuleSchema = z.object({
  work_location_id: z.string().min(1, 'Selecione um local de trabalho'),
  rule_type: z.string().min(3, 'Tipo de regra obrigatório'),
  base_value: z.string().min(1, 'Valor base obrigatório'),
  percentage: z.string().min(1, 'Percentual obrigatório'),
  minimum_value: z.string().min(1, 'Valor mínimo obrigatório'),
  valid_from: z.string().min(1, 'Data inicial obrigatória'),
  valid_until: z.string().optional(),
  active: z.enum(['true', 'false']),
  notes: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;
type BillingRuleFormData = z.infer<typeof billingRuleSchema>;

interface Company {
  id: string;
  name: string;
}

interface WorkLocation {
  id: string;
  company_id: string;
  location_name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string | null;
  active: boolean;
  companies?: { name: string };
}

interface LocationBillingRule {
  id: string;
  work_location_id: string;
  rule_type: string;
  base_value: number;
  percentage: number;
  minimum_value: number;
  valid_from: string;
  valid_until: string | null;
  active: boolean;
  notes: string | null;
  work_locations?: {
    location_name: string;
    companies?: { name: string };
  };
}

export default function WorkLocationBillingRules() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [locations, setLocations] = useState<WorkLocation[]>([]);
  const [rules, setRules] = useState<LocationBillingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string>('');
  const [editingRuleId, setEditingRuleId] = useState<string>('');
  const [filterCompanyId, setFilterCompanyId] = useState<string>('');

  const locationForm = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: { active: 'true' },
  });

  const ruleForm = useForm<BillingRuleFormData>({
    resolver: zodResolver(billingRuleSchema),
    defaultValues: { active: 'true' },
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const [companiesRes, locationsRes, rulesRes] = await Promise.all([
      supabase.from('companies').select('id, name').order('name'),
      supabase
        .from('work_locations')
        .select('*, companies (name)')
        .order('location_name'),
      supabase
        .from('location_billing_rules')
        .select('*, work_locations (location_name, companies (name))')
        .order('created_at', { ascending: false }),
    ]);

    if (!companiesRes.error) setCompanies(companiesRes.data || []);
    if (!locationsRes.error) setLocations(locationsRes.data || []);
    if (!rulesRes.error) setRules(rulesRes.data || []);

    setLoading(false);
  };

  const onSubmitLocation = async (data: LocationFormData) => {
    setSaving(true);

    try {
      const locationData = {
        company_id: data.company_id,
        location_name: data.location_name,
        address: data.address,
        city: data.city,
        state: data.state.toUpperCase(),
        postal_code: data.postal_code || null,
        active: data.active === 'true',
      };

      if (editingLocationId) {
        const { error } = await supabase
          .from('work_locations')
          .update(locationData)
          .eq('id', editingLocationId);

        if (error) throw error;
        toast.success('Local de trabalho atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('work_locations')
          .insert([locationData]);

        if (error) throw error;
        toast.success('Local de trabalho cadastrado com sucesso!');
      }

      await loadData();
      setShowLocationModal(false);
      setEditingLocationId('');
      locationForm.reset({ active: 'true' });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar local de trabalho');
    } finally {
      setSaving(false);
    }
  };

  const onSubmitRule = async (data: BillingRuleFormData) => {
    setSaving(true);

    try {
      const baseValue = parseFloat(data.base_value.replace(',', '.'));
      const percentage = parseFloat(data.percentage.replace(',', '.'));
      const minimumValue = parseFloat(data.minimum_value.replace(',', '.'));

      const ruleData = {
        work_location_id: data.work_location_id,
        rule_type: data.rule_type,
        base_value: baseValue,
        percentage: percentage,
        minimum_value: minimumValue,
        valid_from: data.valid_from,
        valid_until: data.valid_until || null,
        active: data.active === 'true',
        notes: data.notes || null,
      };

      if (editingRuleId) {
        const { error } = await supabase
          .from('location_billing_rules')
          .update(ruleData)
          .eq('id', editingRuleId);

        if (error) throw error;
        toast.success('Regra de faturamento atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('location_billing_rules')
          .insert([ruleData]);

        if (error) throw error;
        toast.success('Regra de faturamento cadastrada com sucesso!');
      }

      await loadData();
      setShowRuleModal(false);
      setEditingRuleId('');
      ruleForm.reset({ active: 'true' });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar regra de faturamento');
    } finally {
      setSaving(false);
    }
  };

  const handleEditLocation = (location: WorkLocation) => {
    setEditingLocationId(location.id);
    locationForm.reset({
      company_id: location.company_id,
      location_name: location.location_name,
      address: location.address,
      city: location.city,
      state: location.state,
      postal_code: location.postal_code || '',
      active: location.active ? 'true' : 'false',
    });
    setShowLocationModal(true);
  };

  const handleDeleteLocation = async (id: string) => {
    if (!confirm('Deseja realmente excluir este local? As regras de faturamento vinculadas também serão excluídas.')) {
      return;
    }

    try {
      const { error } = await supabase.from('work_locations').delete().eq('id', id);
      if (error) throw error;
      toast.success('Local excluído com sucesso');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir local');
    }
  };

  const handleEditRule = (rule: LocationBillingRule) => {
    setEditingRuleId(rule.id);
    ruleForm.reset({
      work_location_id: rule.work_location_id,
      rule_type: rule.rule_type,
      base_value: rule.base_value.toString(),
      percentage: rule.percentage.toString(),
      minimum_value: rule.minimum_value.toString(),
      valid_from: rule.valid_from,
      valid_until: rule.valid_until || '',
      active: rule.active ? 'true' : 'false',
      notes: rule.notes || '',
    });
    setShowRuleModal(true);
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta regra de faturamento?')) {
      return;
    }

    try {
      const { error } = await supabase.from('location_billing_rules').delete().eq('id', id);
      if (error) throw error;
      toast.success('Regra excluída com sucesso');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir regra');
    }
  };

  const filteredLocations = locations.filter(loc => {
    if (filterCompanyId && loc.company_id !== filterCompanyId) return false;
    return true;
  });

  const filteredRules = rules.filter(rule => {
    if (filterCompanyId) {
      const location = locations.find(l => l.id === rule.work_location_id);
      if (location && location.company_id !== filterCompanyId) return false;
    }
    return true;
  });

  const locationColumns: ColumnDef<WorkLocation>[] = [
    {
      accessorKey: 'companies.name',
      header: 'Empresa',
      cell: ({ row }) => (
        <span className="font-medium text-neutral-900">{row.original.companies?.name}</span>
      ),
    },
    {
      accessorKey: 'location_name',
      header: 'Local de Trabalho',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-blue-600" />
          <span className="font-medium">{row.original.location_name}</span>
        </div>
      ),
    },
    {
      accessorKey: 'city',
      header: 'Cidade/UF',
      cell: ({ row }) => `${row.original.city} - ${row.original.state}`,
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.active ? 'success' : 'default'}>
          {row.original.active ? 'Ativo' : 'Inativo'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEditLocation(row.original)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDeleteLocation(row.original.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  const ruleColumns: ColumnDef<LocationBillingRule>[] = [
    {
      accessorKey: 'work_locations.location_name',
      header: 'Local de Trabalho',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-neutral-900">{row.original.work_locations?.location_name}</p>
          <p className="text-xs text-neutral-500">{row.original.work_locations?.companies?.name}</p>
        </div>
      ),
    },
    {
      accessorKey: 'rule_type',
      header: 'Tipo de Regra',
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.rule_type}</span>
      ),
    },
    {
      accessorKey: 'base_value',
      header: 'Valor Base',
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          R$ {row.original.base_value.toFixed(2).replace('.', ',')}
        </span>
      ),
    },
    {
      accessorKey: 'percentage',
      header: 'Percentual',
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.percentage.toFixed(2).replace('.', ',')}%
        </span>
      ),
    },
    {
      accessorKey: 'minimum_value',
      header: 'Valor Mínimo',
      cell: ({ row }) => (
        <span className="font-mono text-sm text-green-700">
          R$ {row.original.minimum_value.toFixed(2).replace('.', ',')}
        </span>
      ),
    },
    {
      accessorKey: 'valid_from',
      header: 'Vigência',
      cell: ({ row }) => (
        <div className="text-xs">
          <p>{new Date(row.original.valid_from).toLocaleDateString('pt-BR')}</p>
          <p className="text-neutral-500">
            {row.original.valid_until
              ? `até ${new Date(row.original.valid_until).toLocaleDateString('pt-BR')}`
              : 'Indeterminada'}
          </p>
        </div>
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
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEditRule(row.original)}>
            <Edit className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleDeleteRule(row.original.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Regras de Faturamento por Local</h1>
        <p className="text-neutral-600 mt-1">
          Gerencie locais de trabalho e suas regras específicas de faturamento
        </p>
      </div>

      <div className="flex gap-3">
        <Select
          value={filterCompanyId}
          onChange={(e) => setFilterCompanyId(e.target.value)}
          options={[
            { value: '', label: 'Todas as empresas' },
            ...companies.map(comp => ({ value: comp.id, label: comp.name }))
          ]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Locais de Trabalho</h3>
                <p className="text-sm text-neutral-600">{filteredLocations.length} local(is)</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setEditingLocationId('');
                  locationForm.reset({ active: 'true' });
                  setShowLocationModal(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Local
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
              </div>
            ) : (
              <DataGrid data={filteredLocations} columns={locationColumns} />
            )}
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Regras de Faturamento</h3>
                <p className="text-sm text-neutral-600">{filteredRules.length} regra(s)</p>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setEditingRuleId('');
                  ruleForm.reset({ active: 'true' });
                  setShowRuleModal(true);
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                Nova Regra
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
              </div>
            ) : (
              <DataGrid data={filteredRules} columns={ruleColumns} />
            )}
          </CardContent>
        </Card>
      </div>

      <Modal
        isOpen={showLocationModal}
        onClose={() => {
          setShowLocationModal(false);
          setEditingLocationId('');
          locationForm.reset();
        }}
        title={editingLocationId ? 'Editar Local de Trabalho' : 'Novo Local de Trabalho'}
      >
        <form onSubmit={locationForm.handleSubmit(onSubmitLocation)} className="space-y-4">
          <Select
            label="Empresa *"
            {...locationForm.register('company_id')}
            error={locationForm.formState.errors.company_id?.message}
            options={[
              { value: '', label: 'Selecione a empresa...' },
              ...companies.map(comp => ({ value: comp.id, label: comp.name }))
            ]}
          />

          <Input
            label="Nome do Local *"
            placeholder="Ex: Obra Centro, Canteiro Norte..."
            {...locationForm.register('location_name')}
            error={locationForm.formState.errors.location_name?.message}
          />

          <Input
            label="Endereço Completo *"
            placeholder="Rua, número, complemento..."
            {...locationForm.register('address')}
            error={locationForm.formState.errors.address?.message}
          />

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <Input
                label="Cidade *"
                placeholder="São Paulo"
                {...locationForm.register('city')}
                error={locationForm.formState.errors.city?.message}
              />
            </div>
            <Input
              label="UF *"
              placeholder="SP"
              maxLength={2}
              {...locationForm.register('state')}
              error={locationForm.formState.errors.state?.message}
            />
          </div>

          <Input
            label="CEP"
            placeholder="00000-000"
            {...locationForm.register('postal_code')}
            error={locationForm.formState.errors.postal_code?.message}
          />

          <Select
            label="Status *"
            {...locationForm.register('active')}
            error={locationForm.formState.errors.active?.message}
            options={[
              { value: 'true', label: 'Ativo' },
              { value: 'false', label: 'Inativo' }
            ]}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setShowLocationModal(false);
                setEditingLocationId('');
                locationForm.reset();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingLocationId ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={showRuleModal}
        onClose={() => {
          setShowRuleModal(false);
          setEditingRuleId('');
          ruleForm.reset();
        }}
        title={editingRuleId ? 'Editar Regra de Faturamento' : 'Nova Regra de Faturamento'}
      >
        <form onSubmit={ruleForm.handleSubmit(onSubmitRule)} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-xs text-blue-800">
              Configure regras específicas de faturamento para cada local de trabalho.
              As regras são aplicadas automaticamente no cálculo.
            </p>
          </div>

          <Select
            label="Local de Trabalho *"
            {...ruleForm.register('work_location_id')}
            error={ruleForm.formState.errors.work_location_id?.message}
            options={[
              { value: '', label: 'Selecione o local...' },
              ...filteredLocations.map(loc => ({
                value: loc.id,
                label: `${loc.location_name} - ${loc.companies?.name}`
              }))
            ]}
          />

          <Input
            label="Tipo de Regra *"
            placeholder="Ex: Adicional por distância, Horário especial..."
            {...ruleForm.register('rule_type')}
            error={ruleForm.formState.errors.rule_type?.message}
          />

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Valor Base (R$) *"
              type="text"
              placeholder="0,00"
              {...ruleForm.register('base_value')}
              error={ruleForm.formState.errors.base_value?.message}
            />
            <Input
              label="Percentual (%) *"
              type="text"
              placeholder="0,00"
              {...ruleForm.register('percentage')}
              error={ruleForm.formState.errors.percentage?.message}
            />
            <Input
              label="Valor Mínimo (R$) *"
              type="text"
              placeholder="0,00"
              {...ruleForm.register('minimum_value')}
              error={ruleForm.formState.errors.minimum_value?.message}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Vigência Inicial *"
              type="date"
              {...ruleForm.register('valid_from')}
              error={ruleForm.formState.errors.valid_from?.message}
            />
            <Input
              label="Vigência Final"
              type="date"
              {...ruleForm.register('valid_until')}
              error={ruleForm.formState.errors.valid_until?.message}
              helperText="Deixe vazio para indeterminada"
            />
          </div>

          <Select
            label="Status *"
            {...ruleForm.register('active')}
            error={ruleForm.formState.errors.active?.message}
            options={[
              { value: 'true', label: 'Ativa' },
              { value: 'false', label: 'Inativa' }
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Observações
            </label>
            <textarea
              {...ruleForm.register('notes')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              rows={2}
              placeholder="Informações adicionais sobre esta regra..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setShowRuleModal(false);
                setEditingRuleId('');
                ruleForm.reset();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingRuleId ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
