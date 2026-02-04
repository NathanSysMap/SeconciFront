import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { DataGrid } from '../../components/ui/DataGrid';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';

const penaltySchema = z.object({
  penalty_type: z.string().min(3, 'Tipo de penalidade obrigatório (mínimo 3 caracteres)'),
  description: z.string().min(10, 'Descrição obrigatória (mínimo 10 caracteres)'),
  percentage: z.string().min(1, 'Percentual obrigatório'),
  min_occurrences: z.string().min(1, 'Número mínimo de ocorrências obrigatório'),
  active: z.enum(['true', 'false']),
});

type PenaltyFormData = z.infer<typeof penaltySchema>;

interface Penalty {
  id: string;
  penalty_type: string;
  description: string | null;
  percentage: number;
  min_occurrences: number;
  active: boolean;
}

export default function Penalties() {
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string>('');

  const form = useForm<PenaltyFormData>({
    resolver: zodResolver(penaltySchema),
    defaultValues: {
      active: 'true',
    },
  });

  useEffect(() => {
    loadPenalties();
  }, []);

  const loadPenalties = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('penalties')
      .select('*')
      .order('penalty_type');
    setPenalties(data || []);
    setLoading(false);
  };

  const onSubmit = async (data: PenaltyFormData) => {
    setSaving(true);

    try {
      const percentage = parseFloat(data.percentage.replace(',', '.'));
      const minOccurrences = parseInt(data.min_occurrences);

      const penaltyData = {
        penalty_type: data.penalty_type,
        description: data.description,
        percentage: percentage,
        min_occurrences: minOccurrences,
        active: data.active === 'true',
      };

      if (editingId) {
        const { error } = await supabase
          .from('penalties')
          .update(penaltyData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Penalidade atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('penalties')
          .insert([penaltyData]);

        if (error) throw error;
        toast.success('Penalidade cadastrada com sucesso!');
      }

      await loadPenalties();
      setShowModal(false);
      setEditingId('');
      form.reset({ active: 'true' });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar penalidade');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (penalty: Penalty) => {
    setEditingId(penalty.id);
    form.reset({
      penalty_type: penalty.penalty_type,
      description: penalty.description || '',
      percentage: penalty.percentage.toString(),
      min_occurrences: penalty.min_occurrences.toString(),
      active: penalty.active ? 'true' : 'false',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir esta penalidade? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('penalties')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Penalidade excluída com sucesso');
      await loadPenalties();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir penalidade');
    }
  };

  const handleNewClick = () => {
    setEditingId('');
    form.reset({
      penalty_type: '',
      description: '',
      percentage: '',
      min_occurrences: '1',
      active: 'true',
    });
    setShowModal(true);
  };

  const columns: ColumnDef<Penalty>[] = [
    {
      accessorKey: 'penalty_type',
      header: 'Tipo de Penalidade',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <span className="font-medium text-neutral-900">{row.original.penalty_type}</span>
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Descrição',
      cell: ({ row }) => (
        <span className="text-sm text-neutral-600">{row.original.description}</span>
      ),
    },
    {
      accessorKey: 'percentage',
      header: 'Percentual',
      cell: ({ row }) => (
        <span className="font-mono font-medium text-red-700">
          {row.original.percentage.toFixed(2).replace('.', ',')}%
        </span>
      ),
    },
    {
      accessorKey: 'min_occurrences',
      header: 'Mín. Ocorrências',
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.min_occurrences}</span>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEdit(row.original)}
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  const activeCount = penalties.filter(p => p.active).length;
  const inactiveCount = penalties.filter(p => !p.active).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Penalidades</h1>
          <p className="text-neutral-600 mt-1">
            Configuração de penalidades e regras de aplicação no faturamento
          </p>
        </div>
        <Button onClick={handleNewClick}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Penalidade
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total</p>
                <p className="text-2xl font-bold text-neutral-900">{penalties.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Ativas</p>
                <p className="text-2xl font-bold text-green-700">{activeCount}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-green-700 font-bold">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Inativas</p>
                <p className="text-2xl font-bold text-neutral-500">{inactiveCount}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                <span className="text-neutral-500 font-bold">✕</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div>
            <h3 className="text-lg font-semibold">Penalidades Cadastradas</h3>
            <p className="text-sm text-neutral-600">
              {penalties.length} penalidade(s) cadastrada(s)
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          ) : penalties.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500 mb-4">Nenhuma penalidade cadastrada</p>
              <Button variant="outline" onClick={handleNewClick}>
                Cadastrar Primeira Penalidade
              </Button>
            </div>
          ) : (
            <DataGrid data={penalties} columns={columns} />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingId('');
          form.reset();
        }}
        title={editingId ? 'Editar Penalidade' : 'Nova Penalidade'}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-800">
                Penalidades são aplicadas automaticamente no faturamento quando
                as condições são atendidas. Configure com atenção.
              </p>
            </div>
          </div>

          <Input
            label="Tipo de Penalidade *"
            placeholder="Ex: Atraso na Entrega, Documentação Incompleta..."
            {...form.register('penalty_type')}
            error={form.formState.errors.penalty_type?.message}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Descrição *
            </label>
            <textarea
              {...form.register('description')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              rows={3}
              placeholder="Descreva quando e como esta penalidade será aplicada..."
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-600 mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Percentual (%) *"
              type="text"
              placeholder="0,00"
              {...form.register('percentage')}
              error={form.formState.errors.percentage?.message}
              helperText="Percentual de redução no faturamento"
            />
            <Input
              label="Mínimo de Ocorrências *"
              type="number"
              placeholder="1"
              {...form.register('min_occurrences')}
              error={form.formState.errors.min_occurrences?.message}
              helperText="Quantidade mínima para aplicar"
            />
          </div>

          <Select
            label="Status *"
            {...form.register('active')}
            error={form.formState.errors.active?.message}
            options={[
              { value: 'true', label: 'Ativa (será aplicada automaticamente)' },
              { value: 'false', label: 'Inativa (não será aplicada)' }
            ]}
          />

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <p className="text-xs text-yellow-800">
              Exemplo: Se configurar 5% com 3 ocorrências mínimas, a penalidade
              só será aplicada quando houver 3 ou mais ocorrências registradas,
              reduzindo o valor do faturamento em 5%.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingId('');
                form.reset();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingId ? 'Atualizar' : 'Cadastrar'} Penalidade
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
