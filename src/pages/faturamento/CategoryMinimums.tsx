import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { DataGrid } from '../../components/ui/DataGrid';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';

const categoryMinimumSchema = z.object({
  category: z.string().min(2, 'Categoria obrigatória (mínimo 2 caracteres)'),
  minimum_value: z.string().min(1, 'Valor mínimo obrigatório'),
  valid_from: z.string().min(1, 'Data de vigência inicial obrigatória'),
  valid_until: z.string().optional(),
});

type CategoryMinimumFormData = z.infer<typeof categoryMinimumSchema>;

interface CategoryMinimum {
  id: string;
  category: string;
  minimum_value: number;
  valid_from: string;
  valid_until: string | null;
}

export default function CategoryMinimums() {
  const [minimums, setMinimums] = useState<CategoryMinimum[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string>('');

  const form = useForm<CategoryMinimumFormData>({
    resolver: zodResolver(categoryMinimumSchema),
  });

  useEffect(() => {
    loadMinimums();
  }, []);

  const loadMinimums = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('category_minimums')
      .select('*')
      .order('category');
    setMinimums(data || []);
    setLoading(false);
  };

  const onSubmit = async (data: CategoryMinimumFormData) => {
    setSaving(true);

    try {
      const minimumValue = parseFloat(data.minimum_value.replace(',', '.'));

      const minimumData = {
        category: data.category,
        minimum_value: minimumValue,
        valid_from: data.valid_from,
        valid_until: data.valid_until || null,
      };

      if (editingId) {
        const { error } = await supabase
          .from('category_minimums')
          .update(minimumData)
          .eq('id', editingId);

        if (error) throw error;
        toast.success('Piso atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('category_minimums')
          .insert([minimumData]);

        if (error) throw error;
        toast.success('Piso cadastrado com sucesso!');
      }

      await loadMinimums();
      setShowModal(false);
      setEditingId('');
      form.reset();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar piso');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (minimum: CategoryMinimum) => {
    setEditingId(minimum.id);
    form.reset({
      category: minimum.category,
      minimum_value: minimum.minimum_value.toString(),
      valid_from: minimum.valid_from,
      valid_until: minimum.valid_until || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este piso? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('category_minimums')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Piso excluído com sucesso');
      await loadMinimums();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir piso');
    }
  };

  const handleNewClick = () => {
    setEditingId('');
    form.reset({
      category: '',
      minimum_value: '',
      valid_from: '',
      valid_until: '',
    });
    setShowModal(true);
  };

  const columns: ColumnDef<CategoryMinimum>[] = [
    {
      accessorKey: 'category',
      header: 'Categoria',
      cell: ({ row }) => (
        <span className="font-medium text-neutral-900">{row.original.category}</span>
      ),
    },
    {
      accessorKey: 'minimum_value',
      header: 'Valor Mínimo',
      cell: ({ row }) => (
        <span className="font-mono text-green-700 font-medium">
          R$ {row.original.minimum_value.toFixed(2).replace('.', ',')}
        </span>
      ),
    },
    {
      accessorKey: 'valid_from',
      header: 'Vigência Inicial',
      cell: ({ row }) => (
        <span className="text-sm">
          {new Date(row.original.valid_from).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      accessorKey: 'valid_until',
      header: 'Vigência Final',
      cell: ({ row }) => (
        <span className="text-sm">
          {row.original.valid_until
            ? new Date(row.original.valid_until).toLocaleDateString('pt-BR')
            : <span className="text-neutral-500 italic">Indeterminada</span>
          }
        </span>
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Pisos por Categoria</h1>
          <p className="text-neutral-600 mt-1">
            Valores mínimos por categoria profissional
          </p>
        </div>
        <Button onClick={handleNewClick}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Piso
        </Button>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div>
            <h3 className="text-lg font-semibold">Pisos Cadastrados</h3>
            <p className="text-sm text-neutral-600">
              {minimums.length} categoria(s) cadastrada(s)
            </p>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          ) : minimums.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-neutral-500 mb-4">Nenhum piso cadastrado</p>
              <Button variant="outline" onClick={handleNewClick}>
                Cadastrar Primeiro Piso
              </Button>
            </div>
          ) : (
            <DataGrid data={minimums} columns={columns} />
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
        title={editingId ? 'Editar Piso por Categoria' : 'Novo Piso por Categoria'}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-xs text-blue-800">
              Defina o valor mínimo que será cobrado para cada categoria profissional,
              independente do número de atendimentos ou serviços prestados.
            </p>
          </div>

          <Input
            label="Categoria Profissional *"
            placeholder="Ex: Médico, Enfermeiro, Técnico..."
            {...form.register('category')}
            error={form.formState.errors.category?.message}
          />

          <Input
            label="Valor Mínimo (R$) *"
            type="text"
            placeholder="0,00"
            {...form.register('minimum_value')}
            error={form.formState.errors.minimum_value?.message}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Vigência Inicial *"
              type="date"
              {...form.register('valid_from')}
              error={form.formState.errors.valid_from?.message}
            />
            <Input
              label="Vigência Final"
              type="date"
              {...form.register('valid_until')}
              error={form.formState.errors.valid_until?.message}
              helperText="Deixe em branco para vigência indeterminada"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <p className="text-xs text-yellow-800">
              O valor mínimo será aplicado automaticamente no cálculo do faturamento
              para todos os profissionais desta categoria, mesmo que não haja atendimentos registrados.
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
              {editingId ? 'Atualizar' : 'Cadastrar'} Piso
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
