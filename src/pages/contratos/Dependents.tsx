import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Filter, Edit, Heart } from 'lucide-react';
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

const dependentSchema = z.object({
  employee_id: z.string().min(1, 'Funcionário obrigatório'),
  cpf: z.string().min(11, 'CPF inválido'),
  full_name: z.string().min(3, 'Nome completo obrigatório'),
  relationship: z.string().min(1, 'Grau de parentesco obrigatório'),
  birth_date: z.string().optional(),
  status: z.string(),
});

type DependentFormData = z.infer<typeof dependentSchema>;

interface Dependent extends DependentFormData {
  id: string;
  employees?: {
    full_name: string;
    companies?: {
      corporate_name: string;
    };
  };
}

interface Employee {
  id: string;
  full_name: string;
  cpf: string;
  company_name?: string;
}

export default function Dependents() {
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDependent, setSelectedDependent] = useState<Dependent | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DependentFormData>({
    resolver: zodResolver(dependentSchema),
    defaultValues: {
      status: 'active',
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedDependent) {
      reset(selectedDependent);
    } else {
      reset({
        employee_id: '',
        cpf: '',
        full_name: '',
        relationship: '',
        birth_date: '',
        status: 'active',
      });
    }
  }, [selectedDependent, reset]);

  const loadData = async () => {
    setLoading(true);

    const [dependentsRes, employeesRes] = await Promise.all([
      supabase
        .from('dependents')
        .select(`
          *,
          employees (
            full_name,
            companies (
              corporate_name
            )
          )
        `)
        .order('full_name'),
      supabase
        .from('employees')
        .select(`
          id,
          full_name,
          cpf,
          companies (
            corporate_name
          )
        `)
        .eq('status', 'active')
        .order('full_name')
        .limit(200)
    ]);

    if (dependentsRes.error) {
      toast.error('Erro ao carregar dependentes');
    } else {
      setDependents(dependentsRes.data || []);
    }

    if (employeesRes.error) {
      toast.error('Erro ao carregar funcionários');
    } else {
      const employeesData = employeesRes.data?.map(emp => ({
        id: emp.id,
        full_name: emp.full_name,
        cpf: emp.cpf,
        company_name: (emp as any).companies?.corporate_name || '',
      })) || [];
      setEmployees(employeesData);
    }

    setLoading(false);
  };

  const onSubmit = async (data: DependentFormData) => {
    setSaving(true);
    try {
      if (selectedDependent) {
        const { error } = await supabase
          .from('dependents')
          .update(data)
          .eq('id', selectedDependent.id);

        if (error) throw error;
        toast.success('Dependente atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('dependents')
          .insert([data]);

        if (error) throw error;
        toast.success('Dependente cadastrado com sucesso!');
      }

      await loadData();
      setIsModalOpen(false);
      setSelectedDependent(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar dependente');
    } finally {
      setSaving(false);
    }
  };

  const filteredDependents = dependents.filter(
    (dep) =>
      dep.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.cpf.includes(searchTerm) ||
      dep.employees?.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dep.employees?.companies?.corporate_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<Dependent>[] = [
    {
      accessorKey: 'cpf',
      header: 'CPF',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.cpf}</span>,
    },
    {
      accessorKey: 'full_name',
      header: 'Nome Completo',
      cell: ({ row }) => (
        <p className="font-medium text-neutral-900">{row.original.full_name}</p>
      ),
    },
    {
      accessorKey: 'employees.full_name',
      header: 'Funcionário',
      cell: ({ row }) => (
        <span className="text-sm text-neutral-700">{row.original.employees?.full_name || '-'}</span>
      ),
    },
    {
      accessorKey: 'employees.companies.corporate_name',
      header: 'Empresa',
      cell: ({ row }) => (
        <span className="text-sm text-neutral-700">{row.original.employees?.companies?.corporate_name || '-'}</span>
      ),
    },
    {
      accessorKey: 'relationship',
      header: 'Grau de Parentesco',
      cell: ({ row }) => <Badge variant="info">{row.original.relationship}</Badge>,
    },
    {
      accessorKey: 'birth_date',
      header: 'Data de Nascimento',
      cell: ({ row }) => row.original.birth_date ? new Date(row.original.birth_date).toLocaleDateString('pt-BR') : '-',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'success' : 'default'}>
          {row.original.status === 'active' ? 'Ativo' : 'Inativo'}
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
              setSelectedDependent(row.original);
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
          <h1 className="text-2xl font-bold text-neutral-900">Dependentes</h1>
          <p className="text-neutral-600 mt-1">Gerenciamento de dependentes dos funcionários</p>
        </div>
        <Button onClick={() => { setSelectedDependent(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Dependente
        </Button>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Buscar por CPF, nome ou funcionário..."
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
          ) : filteredDependents.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Nenhum dependente encontrado"
              description="Comece adicionando dependentes ao sistema"
              action={{
                label: 'Novo Dependente',
                onClick: () => { setSelectedDependent(null); setIsModalOpen(true); }
              }}
            />
          ) : (
            <DataGrid
              data={filteredDependents}
              columns={columns}
              onRowClick={(dependent) => {
                setSelectedDependent(dependent);
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
          setSelectedDependent(null);
        }}
        title={selectedDependent ? 'Editar Dependente' : 'Novo Dependente'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            <div className="space-y-4">
              <Select
                label="Funcionário *"
                {...register('employee_id')}
                error={errors.employee_id?.message}
                options={[
                  { value: '', label: 'Selecione um funcionário...' },
                  ...employees.map(e => ({
                    value: e.id,
                    label: `${e.full_name} - ${e.cpf} (${e.company_name})`
                  }))
                ]}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="CPF *"
                  placeholder="000.000.000-00"
                  {...register('cpf')}
                  error={errors.cpf?.message}
                />
                <Input
                  label="Data de Nascimento"
                  type="date"
                  {...register('birth_date')}
                />
              </div>

              <Input
                label="Nome Completo *"
                placeholder="Nome completo do dependente"
                {...register('full_name')}
                error={errors.full_name?.message}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Grau de Parentesco *"
                  {...register('relationship')}
                  error={errors.relationship?.message}
                  options={[
                    { value: '', label: 'Selecione...' },
                    { value: 'Cônjuge', label: 'Cônjuge' },
                    { value: 'Companheiro(a)', label: 'Companheiro(a)' },
                    { value: 'Filho(a)', label: 'Filho(a)' },
                    { value: 'Enteado(a)', label: 'Enteado(a)' },
                    { value: 'Pai/Mãe', label: 'Pai/Mãe' },
                    { value: 'Irmão/Irmã', label: 'Irmão/Irmã' },
                  ]}
                />
                <Select
                  label="Status *"
                  {...register('status')}
                  options={[
                    { value: 'active', label: 'Ativo' },
                    { value: 'inactive', label: 'Inativo' },
                  ]}
                />
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedDependent(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {selectedDependent ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
