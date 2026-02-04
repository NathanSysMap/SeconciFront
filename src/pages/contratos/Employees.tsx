import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Filter, Edit, Users as UsersIcon } from 'lucide-react';
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

const employeeSchema = z.object({
  company_id: z.string().min(1, 'Empresa obrigatória'),
  cpf: z.string().min(11, 'CPF inválido'),
  full_name: z.string().min(3, 'Nome completo obrigatório'),
  registration_number: z.string().optional(),
  category: z.string().optional(),
  admission_date: z.string().optional(),
  termination_date: z.string().optional().nullable(),
  status: z.string(),
  salary: z.string().optional(),
  work_location: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface Employee extends Omit<EmployeeFormData, 'salary'> {
  id: string;
  salary: number | null;
  companies?: {
    corporate_name: string;
  };
}

interface Company {
  id: string;
  corporate_name: string;
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      status: 'active',
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      reset({
        ...selectedEmployee,
        salary: selectedEmployee.salary?.toString() || '',
        termination_date: selectedEmployee.termination_date || undefined,
      });
    } else {
      reset({
        company_id: '',
        cpf: '',
        full_name: '',
        registration_number: '',
        category: '',
        admission_date: '',
        termination_date: undefined,
        status: 'active',
        salary: '',
        work_location: '',
      });
    }
  }, [selectedEmployee, reset]);

  const loadData = async () => {
    setLoading(true);

    const [employeesRes, companiesRes] = await Promise.all([
      supabase
        .from('employees')
        .select(`
          *,
          companies (
            corporate_name
          )
        `)
        .order('full_name')
        .limit(100),
      supabase
        .from('companies')
        .select('id, corporate_name')
        .eq('status', 'active')
        .order('corporate_name')
    ]);

    if (employeesRes.error) {
      toast.error('Erro ao carregar funcionários');
    } else {
      setEmployees(employeesRes.data || []);
    }

    if (companiesRes.error) {
      toast.error('Erro ao carregar empresas');
    } else {
      setCompanies(companiesRes.data || []);
    }

    setLoading(false);
  };

  const onSubmit = async (data: EmployeeFormData) => {
    setSaving(true);
    try {
      const employeeData = {
        ...data,
        salary: data.salary ? parseFloat(data.salary) : null,
        termination_date: data.termination_date || null,
      };

      if (selectedEmployee) {
        const { error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', selectedEmployee.id);

        if (error) throw error;
        toast.success('Funcionário atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('employees')
          .insert([employeeData]);

        if (error) throw error;
        toast.success('Funcionário cadastrado com sucesso!');
      }

      await loadData();
      setIsModalOpen(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar funcionário');
    } finally {
      setSaving(false);
    }
  };

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.cpf.includes(searchTerm) ||
      emp.companies?.corporate_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'cpf',
      header: 'CPF',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.cpf}</span>,
    },
    {
      accessorKey: 'full_name',
      header: 'Nome Completo',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-neutral-900">{row.original.full_name}</p>
          <p className="text-xs text-neutral-500">{row.original.companies?.corporate_name}</p>
        </div>
      ),
    },
    {
      accessorKey: 'registration_number',
      header: 'Matrícula',
      cell: ({ row }) => row.original.registration_number || '-',
    },
    {
      accessorKey: 'category',
      header: 'Categoria',
      cell: ({ row }) => <Badge variant="info">{row.original.category || 'N/A'}</Badge>,
    },
    {
      accessorKey: 'admission_date',
      header: 'Data Admissão',
      cell: ({ row }) => row.original.admission_date ? new Date(row.original.admission_date).toLocaleDateString('pt-BR') : '-',
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
              setSelectedEmployee(row.original);
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
          <h1 className="text-2xl font-bold text-neutral-900">Funcionários</h1>
          <p className="text-neutral-600 mt-1">Gerenciamento de funcionários por empresa</p>
        </div>
        <Button onClick={() => { setSelectedEmployee(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Funcionário
        </Button>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Buscar por CPF, nome ou empresa..."
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
          ) : filteredEmployees.length === 0 ? (
            <EmptyState
              icon={UsersIcon}
              title="Nenhum funcionário encontrado"
              description="Comece adicionando funcionários ao sistema"
              action={{
                label: 'Novo Funcionário',
                onClick: () => { setSelectedEmployee(null); setIsModalOpen(true); }
              }}
            />
          ) : (
            <DataGrid
              data={filteredEmployees}
              columns={columns}
              onRowClick={(employee) => {
                setSelectedEmployee(employee);
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
          setSelectedEmployee(null);
        }}
        title={selectedEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
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
                  { value: '', label: 'Selecione uma empresa...' },
                  ...companies.map(c => ({ value: c.id, label: c.corporate_name }))
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
                  label="Matrícula"
                  placeholder="12345"
                  {...register('registration_number')}
                />
              </div>

              <Input
                label="Nome Completo *"
                placeholder="Nome completo do funcionário"
                {...register('full_name')}
                error={errors.full_name?.message}
              />

              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Categoria"
                  {...register('category')}
                  options={[
                    { value: '', label: 'Selecione...' },
                    { value: 'Engenheiro', label: 'Engenheiro' },
                    { value: 'Mestre de Obras', label: 'Mestre de Obras' },
                    { value: 'Pedreiro', label: 'Pedreiro' },
                    { value: 'Servente', label: 'Servente' },
                    { value: 'Auxiliar', label: 'Auxiliar' },
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

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Data de Admissão"
                  type="date"
                  {...register('admission_date')}
                />
                <Input
                  label="Data de Demissão"
                  type="date"
                  {...register('termination_date')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Salário"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  {...register('salary')}
                />
                <Input
                  label="Local de Trabalho"
                  placeholder="Obra/Escritório"
                  {...register('work_location')}
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
                setSelectedEmployee(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {selectedEmployee ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
