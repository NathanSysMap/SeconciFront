import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, User, DollarSign, FileText, Search, CheckCircle, Trash2, File, UserPlus, UserX, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { DataGrid } from '../../components/ui/DataGrid';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';

const attachmentSchema = z.object({
  employee_id: z.string().min(1, 'Selecione um funcionário'),
  attachment_type: z.enum(['payroll', 'fgts']),
  reference_month: z.string().min(1, 'Mês de referência obrigatório'),
  notes: z.string().optional(),
});

const employeeSchema = z.object({
  id: z.string().optional(),
  full_name: z.string().min(3, 'Nome completo obrigatório (mínimo 3 caracteres)'),
  cpf: z.string().regex(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  rg: z.string().optional(),
  birth_date: z.string().min(1, 'Data de nascimento obrigatória'),
  admission_date: z.string().min(1, 'Data de admissão obrigatória'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  position: z.string().optional(),
  department: z.string().optional(),
  salary: z.string().optional(),
  status: z.enum(['active', 'inactive', 'on_leave']),
});

const terminationSchema = z.object({
  termination_date: z.string().min(1, 'Data de desligamento obrigatória'),
  termination_type: z.enum(['resignation', 'dismissal', 'retirement', 'mutual_agreement', 'end_of_contract', 'other']),
  termination_reason: z.string().min(3, 'Motivo obrigatório (mínimo 3 caracteres)'),
  termination_notes: z.string().optional(),
});

const dependentSchema = z.object({
  id: z.string().optional(),
  employee_id: z.string().min(1, 'Selecione um funcionário'),
  full_name: z.string().min(3, 'Nome completo obrigatório'),
  cpf: z.string().regex(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF inválido'),
  birth_date: z.string().min(1, 'Data de nascimento obrigatória'),
  relationship: z.enum(['spouse', 'child', 'parent', 'other']),
  has_health_insurance: z.boolean().optional(),
  has_life_insurance: z.boolean().optional(),
});

type AttachmentFormData = z.infer<typeof attachmentSchema>;
type EmployeeFormData = z.infer<typeof employeeSchema>;
type TerminationFormData = z.infer<typeof terminationSchema>;
type DependentFormData = z.infer<typeof dependentSchema>;

interface Employee {
  id: string;
  full_name: string;
  cpf: string;
  rg?: string;
  birth_date: string;
  admission_date: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  position?: string;
  department?: string;
  salary?: number;
  status: string;
  termination_date?: string;
  termination_type?: string;
  termination_reason?: string;
  termination_notes?: string;
}

interface Dependent {
  id: string;
  employee_id: string;
  full_name: string;
  cpf: string;
  birth_date: string;
  relationship: string;
  has_health_insurance?: boolean;
  has_life_insurance?: boolean;
  employees?: {
    full_name: string;
  };
}

interface Attachment {
  id: string;
  employee_id: string;
  attachment_type: string;
  file_name: string;
  file_size: number;
  file_url: string | null;
  reference_month: string;
  notes: string | null;
  created_at: string;
  employees?: {
    full_name: string;
    cpf: string;
  };
}

type TabType = 'payroll' | 'fgts' | 'employee' | 'dependent';

export default function IndividualUpdate() {
  const [activeTab, setActiveTab] = useState<TabType>('payroll');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employeeSearchTerm, setEmployeeSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filterEmployeeId, setFilterEmployeeId] = useState<string>('');
  const [editingEmployeeId, setEditingEmployeeId] = useState<string>('');
  const [editingDependentId, setEditingDependentId] = useState<string>('');
  const [terminatingEmployeeId, setTerminatingEmployeeId] = useState<string>('');
  const [showTerminationModal, setShowTerminationModal] = useState(false);

  const attachmentForm = useForm<AttachmentFormData>({
    resolver: zodResolver(attachmentSchema),
    defaultValues: { attachment_type: 'payroll' }
  });

  const employeeForm = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: { status: 'active' }
  });

  const terminationForm = useForm<TerminationFormData>({
    resolver: zodResolver(terminationSchema),
    defaultValues: { termination_type: 'resignation' }
  });

  const dependentForm = useForm<DependentFormData>({
    resolver: zodResolver(dependentSchema),
    defaultValues: {
      relationship: 'child',
      has_health_insurance: false,
      has_life_insurance: false,
    }
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    attachmentForm.reset((formValues) => ({
      ...formValues,
      attachment_type: activeTab === 'fgts' ? 'fgts' : 'payroll',
    }));
  }, [activeTab, attachmentForm]);

  const loadData = async () => {
    setLoading(true);

    const [employeesRes, dependentsRes, attachmentsRes] = await Promise.all([
      supabase.from('employees').select('*').order('full_name'),
      supabase.from('dependents').select(`*, employees (full_name)`).order('full_name'),
      supabase.from('employee_attachments').select(`*, employees (full_name, cpf)`).order('created_at', { ascending: false }).limit(100)
    ]);

    if (!employeesRes.error) setEmployees(employeesRes.data || []);
    if (!dependentsRes.error) setDependents(dependentsRes.data || []);
    if (!attachmentsRes.error) setAttachments(attachmentsRes.data || []);

    setLoading(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleEmployeeSelect = (employeeId: string) => {
    if (!employeeId) {
      employeeForm.reset({ status: 'active' });
      setEditingEmployeeId('');
      return;
    }

    const employee = employees.find(e => e.id === employeeId);
    if (employee) {
      setEditingEmployeeId(employee.id);
      employeeForm.reset({
        ...employee,
        salary: employee.salary?.toString() || '',
      });
    }
  };

  const onAttachmentSubmit = async (data: AttachmentFormData) => {
    if (!selectedFile) {
      toast.error('Selecione um arquivo para upload');
      return;
    }

    setUploading(true);

    try {
      const { error } = await supabase.from('employee_attachments').insert([{
        employee_id: data.employee_id,
        attachment_type: data.attachment_type,
        file_name: selectedFile.name,
        file_size: selectedFile.size,
        file_url: null,
        reference_month: data.reference_month,
        notes: data.notes || null,
      }]);

      if (error) throw error;

      toast.success(`${data.attachment_type === 'payroll' ? 'Folha de pagamento' : 'FGTS Digital'} enviado com sucesso!`);
      await loadData();
      attachmentForm.reset();
      setSelectedFile(null);
      setFilterEmployeeId(data.employee_id);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar anexo');
    } finally {
      setUploading(false);
    }
  };

  const onEmployeeSubmit = async (data: EmployeeFormData) => {
    setSaving(true);

    try {
      const employeeData = {
        ...data,
        cpf: data.cpf.replace(/\D/g, ''),
        salary: data.salary ? parseFloat(data.salary.replace(',', '.')) : null,
      };

      if (editingEmployeeId) {
        const { error } = await supabase
          .from('employees')
          .update(employeeData)
          .eq('id', editingEmployeeId);

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
      employeeForm.reset({ status: 'active' });
      setEditingEmployeeId('');
      setEmployeeSearchTerm('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar funcionário');
    } finally {
      setSaving(false);
    }
  };

  const onTerminationSubmit = async (data: TerminationFormData) => {
    if (!terminatingEmployeeId) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from('employees')
        .update({
          status: 'inactive',
          termination_date: data.termination_date,
          termination_type: data.termination_type,
          termination_reason: data.termination_reason,
          termination_notes: data.termination_notes || null,
        })
        .eq('id', terminatingEmployeeId);

      if (error) throw error;

      toast.success('Desligamento registrado com sucesso!');
      await loadData();
      setShowTerminationModal(false);
      setTerminatingEmployeeId('');
      terminationForm.reset();
      employeeForm.reset({ status: 'active' });
      setEditingEmployeeId('');
      setEmployeeSearchTerm('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao registrar desligamento');
    } finally {
      setSaving(false);
    }
  };

  const handleTerminateEmployee = (employeeId: string) => {
    setTerminatingEmployeeId(employeeId);
    setShowTerminationModal(true);
  };

  const onDependentSubmit = async (data: DependentFormData) => {
    setSaving(true);

    try {
      const dependentData = {
        ...data,
        cpf: data.cpf.replace(/\D/g, ''),
      };

      if (editingDependentId) {
        const { error } = await supabase
          .from('dependents')
          .update(dependentData)
          .eq('id', editingDependentId);

        if (error) throw error;
        toast.success('Dependente atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('dependents')
          .insert([dependentData]);

        if (error) throw error;
        toast.success('Dependente cadastrado com sucesso!');
      }

      await loadData();
      dependentForm.reset();
      setEditingDependentId('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar dependente');
    } finally {
      setSaving(false);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployeeId(employee.id);
    setEmployeeSearchTerm(employee.full_name);
    employeeForm.reset({
      ...employee,
      salary: employee.salary?.toString() || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditDependent = (dependent: Dependent) => {
    setEditingDependentId(dependent.id);
    dependentForm.reset(dependent);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteAttachment = async (id: string) => {
    if (!confirm('Deseja realmente excluir este anexo?')) return;

    try {
      const { error } = await supabase.from('employee_attachments').delete().eq('id', id);
      if (error) throw error;
      toast.success('Anexo excluído com sucesso');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir anexo');
    }
  };

  const handleDeleteDependent = async (id: string) => {
    if (!confirm('Deseja realmente excluir este dependente?')) return;

    try {
      const { error } = await supabase.from('dependents').delete().eq('id', id);
      if (error) throw error;
      toast.success('Dependente excluído com sucesso');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir dependente');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.cpf.includes(searchTerm)
  );

  const filteredEmployeesForSearch = employees.filter(emp =>
    emp.full_name.toLowerCase().includes(employeeSearchTerm.toLowerCase()) ||
    emp.cpf.includes(employeeSearchTerm)
  );

  const filteredAttachments = attachments.filter(att => {
    if (filterEmployeeId && att.employee_id !== filterEmployeeId) return false;
    if (activeTab === 'payroll' && att.attachment_type !== 'payroll') return false;
    if (activeTab === 'fgts' && att.attachment_type !== 'fgts') return false;
    return true;
  });

  const employeeColumns: ColumnDef<Employee>[] = [
    {
      accessorKey: 'full_name',
      header: 'Nome',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-neutral-900">{row.original.full_name}</p>
          <p className="text-xs text-neutral-500 font-mono">{row.original.cpf}</p>
        </div>
      ),
    },
    {
      accessorKey: 'position',
      header: 'Cargo',
      cell: ({ row }) => <span className="text-sm">{row.original.position || '-'}</span>,
    },
    {
      accessorKey: 'admission_date',
      header: 'Admissão',
      cell: ({ row }) => <span className="text-sm">{new Date(row.original.admission_date).toLocaleDateString('pt-BR')}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusMap = {
          active: { label: 'Ativo', variant: 'success' as const },
          inactive: { label: 'Inativo', variant: 'default' as const },
          on_leave: { label: 'Afastado', variant: 'info' as const },
        };
        const status = statusMap[row.original.status as keyof typeof statusMap];
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEditEmployee(row.original)}>
            Editar
          </Button>
          {row.original.status === 'active' && (
            <Button variant="outline" size="sm" onClick={() => handleTerminateEmployee(row.original.id)}>
              <UserX className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const dependentColumns: ColumnDef<Dependent>[] = [
    {
      accessorKey: 'full_name',
      header: 'Nome',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-neutral-900">{row.original.full_name}</p>
          <p className="text-xs text-neutral-500 font-mono">{row.original.cpf}</p>
        </div>
      ),
    },
    {
      accessorKey: 'employees.full_name',
      header: 'Funcionário',
      cell: ({ row }) => <span className="text-sm">{row.original.employees?.full_name}</span>,
    },
    {
      accessorKey: 'relationship',
      header: 'Parentesco',
      cell: ({ row }) => {
        const map: Record<string, string> = {
          spouse: 'Cônjuge', child: 'Filho(a)', parent: 'Pai/Mãe', other: 'Outro'
        };
        return <Badge variant="info">{map[row.original.relationship]}</Badge>;
      },
    },
    {
      accessorKey: 'birth_date',
      header: 'Nascimento',
      cell: ({ row }) => <span className="text-sm">{new Date(row.original.birth_date).toLocaleDateString('pt-BR')}</span>,
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleEditDependent(row.original)}>Editar</Button>
          <Button variant="outline" size="sm" onClick={() => handleDeleteDependent(row.original.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
  ];

  const attachmentColumns: ColumnDef<Attachment>[] = [
    {
      accessorKey: 'employees.full_name',
      header: 'Funcionário',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-neutral-900">{row.original.employees?.full_name}</p>
          <p className="text-xs text-neutral-500 font-mono">{row.original.employees?.cpf}</p>
        </div>
      ),
    },
    {
      accessorKey: 'reference_month',
      header: 'Competência',
      cell: ({ row }) => {
        const date = new Date(row.original.reference_month);
        return <span className="text-sm font-mono">{String(date.getMonth() + 1).padStart(2, '0')}/{date.getFullYear()}</span>;
      },
    },
    {
      accessorKey: 'file_name',
      header: 'Arquivo',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <File className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-sm font-medium">{row.original.file_name}</p>
            <p className="text-xs text-neutral-500">{(row.original.file_size / 1024).toFixed(2)} KB</p>
          </div>
        </div>
      ),
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: ({ row }) => (
        <Button variant="outline" size="sm" onClick={() => handleDeleteAttachment(row.original.id)}>
          <Trash2 className="h-3 w-3" />
        </Button>
      ),
    },
  ];

  const selectedEmployee = employees.find(e => e.id === attachmentForm.watch('employee_id'));
  const terminatingEmployee = employees.find(e => e.id === terminatingEmployeeId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Atualização Individual</h1>
        <p className="text-neutral-600 mt-1">
          Envio de anexos e atualização cadastral de funcionários e dependentes
        </p>
      </div>

      <div className="border-b border-neutral-200">
        <nav className="flex gap-1">
          <button onClick={() => setActiveTab('payroll')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'payroll' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-neutral-600 hover:text-neutral-900'}`}>
            <DollarSign className="h-4 w-4 inline mr-2" />
            Folha
          </button>
          <button onClick={() => setActiveTab('fgts')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'fgts' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-neutral-600 hover:text-neutral-900'}`}>
            <FileText className="h-4 w-4 inline mr-2" />
            FGTS
          </button>
          <button onClick={() => setActiveTab('employee')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'employee' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-neutral-600 hover:text-neutral-900'}`}>
            <User className="h-4 w-4 inline mr-2" />
            Funcionários
          </button>
          <button onClick={() => setActiveTab('dependent')} className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${activeTab === 'dependent' ? 'border-brand-primary text-brand-primary' : 'border-transparent text-neutral-600 hover:text-neutral-900'}`}>
            <UserPlus className="h-4 w-4 inline mr-2" />
            Dependentes
          </button>
        </nav>
      </div>

      {(activeTab === 'payroll' || activeTab === 'fgts') && (
        <form onSubmit={attachmentForm.handleSubmit(onAttachmentSubmit)} className="space-y-6">
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Selecionar Funcionário</h3>
                  <p className="text-sm text-neutral-600">Busque e selecione o funcionário</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input type="text" placeholder="Buscar por nome ou CPF..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                </div>

                <Select label="Funcionário *" {...attachmentForm.register('employee_id')} error={attachmentForm.formState.errors.employee_id?.message} options={[
                  { value: '', label: 'Selecione um funcionário...' },
                  ...filteredEmployees.map(emp => ({ value: emp.id, label: `${emp.full_name} - ${emp.cpf}` }))
                ]} />

                {selectedEmployee && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-green-900">{selectedEmployee.full_name}</p>
                        <p className="text-sm text-green-700">CPF: {selectedEmployee.cpf} • Admissão: {new Date(selectedEmployee.admission_date).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Upload className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">Upload de {activeTab === 'payroll' ? 'Folha' : 'FGTS'}</h3>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Mês de Referência *" type="month" {...attachmentForm.register('reference_month')} error={attachmentForm.formState.errors.reference_month?.message} />
                  <Input label="Observações" type="text" placeholder="Opcional" {...attachmentForm.register('notes')} />
                </div>

                <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-brand-primary transition-colors">
                  <input type="file" id="file-upload" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" onChange={handleFileChange} disabled={uploading} />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <File className="h-8 w-8 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{selectedFile.name}</p>
                          <p className="text-xs text-neutral-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                        <p className="text-sm font-medium text-neutral-700">Clique para selecionar arquivo</p>
                        <p className="text-xs text-neutral-500 mt-1">PDF, DOC, XLS, CSV ou TXT</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={() => { attachmentForm.reset(); setSelectedFile(null); }}>Limpar</Button>
            <Button type="submit" loading={uploading}>
              <Upload className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </div>

          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Anexos</h3>
                  <p className="text-sm text-neutral-600">{filteredAttachments.length} anexo(s)</p>
                </div>
                <Select value={filterEmployeeId} onChange={(e) => setFilterEmployeeId(e.target.value)} options={[
                  { value: '', label: 'Todos' },
                  ...employees.map(emp => ({ value: emp.id, label: emp.full_name }))
                ]} />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div></div> : <DataGrid data={filteredAttachments} columns={attachmentColumns} />}
            </CardContent>
          </Card>
        </form>
      )}

      {activeTab === 'employee' && (
        <>
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Search className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900">Buscar Funcionário</h3>
                  <p className="text-sm text-neutral-600">Busque para editar ou cadastre novo</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <Input type="text" placeholder="Buscar por nome ou CPF..." value={employeeSearchTerm} onChange={(e) => setEmployeeSearchTerm(e.target.value)} className="pl-10" />
                </div>

                <Select
                  label="Selecione o Funcionário"
                  value={editingEmployeeId}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  options={[
                    { value: '', label: 'Novo funcionário...' },
                    ...filteredEmployeesForSearch.map(emp => ({
                      value: emp.id,
                      label: `${emp.full_name} - ${emp.cpf} ${emp.status === 'inactive' ? '(Inativo)' : ''}`
                    }))
                  ]}
                />

                {editingEmployeeId && (
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium text-blue-900">Editando: {employees.find(e => e.id === editingEmployeeId)?.full_name}</p>
                          <p className="text-sm text-blue-700">Altere os campos abaixo</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingEmployeeId('');
                          setEmployeeSearchTerm('');
                          employeeForm.reset({ status: 'active' });
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <form onSubmit={employeeForm.handleSubmit(onEmployeeSubmit)} className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <h3 className="text-lg font-semibold">{editingEmployeeId ? 'Editar' : 'Cadastrar'} Funcionário</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input label="Nome Completo *" {...employeeForm.register('full_name')} error={employeeForm.formState.errors.full_name?.message} />

                  <div className="grid grid-cols-3 gap-4">
                    <Input label="CPF *" placeholder="000.000.000-00" {...employeeForm.register('cpf')} error={employeeForm.formState.errors.cpf?.message} />
                    <Input label="RG" {...employeeForm.register('rg')} />
                    <Input label="Data de Nascimento *" type="date" {...employeeForm.register('birth_date')} error={employeeForm.formState.errors.birth_date?.message} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Email" type="email" {...employeeForm.register('email')} error={employeeForm.formState.errors.email?.message} />
                    <Input label="Telefone" placeholder="(00) 00000-0000" {...employeeForm.register('phone')} />
                  </div>

                  <Input label="Endereço" {...employeeForm.register('address')} />

                  <div className="grid grid-cols-3 gap-4">
                    <Input label="Cidade" {...employeeForm.register('city')} />
                    <Input label="Estado" placeholder="UF" {...employeeForm.register('state')} />
                    <Input label="CEP" placeholder="00000-000" {...employeeForm.register('zip_code')} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <Input label="Cargo" {...employeeForm.register('position')} />
                    <Input label="Departamento" {...employeeForm.register('department')} />
                    <Input label="Salário" placeholder="0,00" {...employeeForm.register('salary')} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Data de Admissão *" type="date" {...employeeForm.register('admission_date')} error={employeeForm.formState.errors.admission_date?.message} />
                    <Select label="Status *" {...employeeForm.register('status')} error={employeeForm.formState.errors.status?.message} options={[
                      { value: 'active', label: 'Ativo' },
                      { value: 'inactive', label: 'Inativo' },
                      { value: 'on_leave', label: 'Afastado' }
                    ]} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => { employeeForm.reset({ status: 'active' }); setEditingEmployeeId(''); setEmployeeSearchTerm(''); }}>Cancelar</Button>
              <Button type="submit" loading={saving}>
                {editingEmployeeId ? 'Atualizar' : 'Cadastrar'} Funcionário
              </Button>
            </div>
          </form>

          <Card variant="elevated">
            <CardHeader>
              <h3 className="text-lg font-semibold">Lista de Funcionários</h3>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div></div> : <DataGrid data={employees} columns={employeeColumns} />}
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'dependent' && (
        <>
          <form onSubmit={dependentForm.handleSubmit(onDependentSubmit)} className="space-y-6">
            <Card variant="elevated">
              <CardHeader>
                <h3 className="text-lg font-semibold">{editingDependentId ? 'Editar' : 'Novo'} Dependente</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select label="Funcionário *" {...dependentForm.register('employee_id')} error={dependentForm.formState.errors.employee_id?.message} options={[
                    { value: '', label: 'Selecione...' },
                    ...employees.map(emp => ({ value: emp.id, label: emp.full_name }))
                  ]} />

                  <Input label="Nome Completo *" {...dependentForm.register('full_name')} error={dependentForm.formState.errors.full_name?.message} />

                  <div className="grid grid-cols-3 gap-4">
                    <Input label="CPF *" placeholder="000.000.000-00" {...dependentForm.register('cpf')} error={dependentForm.formState.errors.cpf?.message} />
                    <Input label="Data de Nascimento *" type="date" {...dependentForm.register('birth_date')} error={dependentForm.formState.errors.birth_date?.message} />
                    <Select label="Parentesco *" {...dependentForm.register('relationship')} error={dependentForm.formState.errors.relationship?.message} options={[
                      { value: 'spouse', label: 'Cônjuge' },
                      { value: 'child', label: 'Filho(a)' },
                      { value: 'parent', label: 'Pai/Mãe' },
                      { value: 'other', label: 'Outro' }
                    ]} />
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" {...dependentForm.register('has_health_insurance')} className="rounded" />
                      <span className="text-sm">Plano de Saúde</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" {...dependentForm.register('has_life_insurance')} className="rounded" />
                      <span className="text-sm">Seguro de Vida</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => { dependentForm.reset(); setEditingDependentId(''); }}>Cancelar</Button>
              <Button type="submit" loading={saving}>Salvar Dependente</Button>
            </div>
          </form>

          <Card variant="elevated">
            <CardHeader>
              <h3 className="text-lg font-semibold">Lista de Dependentes</h3>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div></div> : <DataGrid data={dependents} columns={dependentColumns} />}
            </CardContent>
          </Card>
        </>
      )}

      <Modal
        isOpen={showTerminationModal}
        onClose={() => {
          setShowTerminationModal(false);
          setTerminatingEmployeeId('');
          terminationForm.reset();
        }}
        title="Registrar Desligamento"
      >
        <form onSubmit={terminationForm.handleSubmit(onTerminationSubmit)} className="space-y-4">
          {terminatingEmployee && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4">
              <div className="flex items-center gap-3">
                <UserX className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">{terminatingEmployee.full_name}</p>
                  <p className="text-sm text-red-700">CPF: {terminatingEmployee.cpf}</p>
                </div>
              </div>
            </div>
          )}

          <Input
            label="Data de Desligamento *"
            type="date"
            {...terminationForm.register('termination_date')}
            error={terminationForm.formState.errors.termination_date?.message}
          />

          <Select
            label="Tipo de Desligamento *"
            {...terminationForm.register('termination_type')}
            error={terminationForm.formState.errors.termination_type?.message}
            options={[
              { value: 'resignation', label: 'Pedido de Demissão' },
              { value: 'dismissal', label: 'Demissão sem Justa Causa' },
              { value: 'retirement', label: 'Aposentadoria' },
              { value: 'mutual_agreement', label: 'Acordo Mútuo' },
              { value: 'end_of_contract', label: 'Fim de Contrato' },
              { value: 'other', label: 'Outro' }
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Motivo do Desligamento *
            </label>
            <textarea
              {...terminationForm.register('termination_reason')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              rows={3}
              placeholder="Descreva o motivo do desligamento"
            />
            {terminationForm.formState.errors.termination_reason && (
              <p className="text-sm text-red-600 mt-1">
                {terminationForm.formState.errors.termination_reason.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Observações Adicionais
            </label>
            <textarea
              {...terminationForm.register('termination_notes')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              rows={2}
              placeholder="Informações adicionais (opcional)"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
            <p className="text-xs text-yellow-800">
              Ao confirmar, o funcionário será marcado como INATIVO e as informações de desligamento serão registradas no sistema.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setShowTerminationModal(false);
                setTerminatingEmployeeId('');
                terminationForm.reset();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              Confirmar Desligamento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
