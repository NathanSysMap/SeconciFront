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
import { Calendar, DollarSign, Trash2, Edit, Plus, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';

const payrollEventSchema = z.object({
  id: z.string().optional(),
  company_id: z.string().min(1, 'Selecione uma empresa'),
  employee_id: z.string().min(1, 'Selecione um funcionário'),
  event_type: z.enum(['vacation', 'absence', 'sick_leave', 'maternity_leave', 'paternity_leave', 'unpaid_leave', 'other']),
  event_description: z.string().min(3, 'Descrição obrigatória (mínimo 3 caracteres)'),
  start_date: z.string().min(1, 'Data inicial obrigatória'),
  end_date: z.string().min(1, 'Data final obrigatória'),
  days_count: z.string().min(1, 'Quantidade de dias obrigatória'),
  daily_value: z.string().min(1, 'Valor diário obrigatório'),
  reference_month: z.string().min(1, 'Mês de referência obrigatório'),
  notes: z.string().optional(),
  status: z.enum(['pending', 'approved', 'billed']),
});

type PayrollEventFormData = z.infer<typeof payrollEventSchema>;

interface Company {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  full_name: string;
  cpf: string;
  company_id: string;
}

interface PayrollEvent {
  id: string;
  company_id: string;
  employee_id: string;
  event_type: string;
  event_description: string;
  start_date: string;
  end_date: string;
  days_count: number;
  daily_value: number;
  total_value: number;
  reference_month: string;
  notes: string | null;
  status: string;
  created_at: string;
  companies?: { name: string };
  employees?: { full_name: string; cpf: string };
}

export default function PayrollEvents() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [events, setEvents] = useState<PayrollEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string>('');
  const [filterCompanyId, setFilterCompanyId] = useState<string>('');
  const [filterMonth, setFilterMonth] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const eventForm = useForm<PayrollEventFormData>({
    resolver: zodResolver(payrollEventSchema),
    defaultValues: {
      event_type: 'vacation',
      status: 'pending',
      days_count: '1',
      daily_value: '0',
    }
  });

  const selectedCompanyId = eventForm.watch('company_id');
  const startDate = eventForm.watch('start_date');
  const endDate = eventForm.watch('end_date');
  const daysCount = eventForm.watch('days_count');
  const dailyValue = eventForm.watch('daily_value');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      eventForm.setValue('days_count', diffDays.toString());
    }
  }, [startDate, endDate, eventForm]);

  useEffect(() => {
    if (startDate) {
      const date = new Date(startDate);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      eventForm.setValue('reference_month', `${year}-${month}`);
    }
  }, [startDate, eventForm]);

  const loadData = async () => {
    setLoading(true);

    const [companiesRes, employeesRes, eventsRes] = await Promise.all([
      supabase.from('companies').select('id, name').order('name'),
      supabase.from('employees').select('id, full_name, cpf, company_id').eq('status', 'active').order('full_name'),
      supabase
        .from('payroll_events')
        .select(`
          *,
          companies (name),
          employees (full_name, cpf)
        `)
        .order('created_at', { ascending: false })
    ]);

    if (!companiesRes.error) setCompanies(companiesRes.data || []);
    if (!employeesRes.error) setEmployees(employeesRes.data || []);
    if (!eventsRes.error) setEvents(eventsRes.data || []);

    setLoading(false);
  };

  const onSubmit = async (data: PayrollEventFormData) => {
    setSaving(true);

    try {
      const daysCountNum = parseInt(data.days_count);
      const dailyValueNum = parseFloat(data.daily_value.replace(',', '.'));
      const totalValue = daysCountNum * dailyValueNum;

      const eventData = {
        company_id: data.company_id,
        employee_id: data.employee_id,
        event_type: data.event_type,
        event_description: data.event_description,
        start_date: data.start_date,
        end_date: data.end_date,
        days_count: daysCountNum,
        daily_value: dailyValueNum,
        total_value: totalValue,
        reference_month: data.reference_month,
        notes: data.notes || null,
        status: data.status,
      };

      if (editingEventId) {
        const { error } = await supabase
          .from('payroll_events')
          .update(eventData)
          .eq('id', editingEventId);

        if (error) throw error;
        toast.success('Evento atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('payroll_events')
          .insert([eventData]);

        if (error) throw error;
        toast.success('Evento cadastrado com sucesso!');
      }

      await loadData();
      setShowModal(false);
      setEditingEventId('');
      eventForm.reset({
        event_type: 'vacation',
        status: 'pending',
        days_count: '1',
        daily_value: '0',
      });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar evento');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (event: PayrollEvent) => {
    setEditingEventId(event.id);
    eventForm.reset({
      company_id: event.company_id,
      employee_id: event.employee_id,
      event_type: event.event_type as any,
      event_description: event.event_description,
      start_date: event.start_date,
      end_date: event.end_date,
      days_count: event.days_count.toString(),
      daily_value: event.daily_value.toString(),
      reference_month: event.reference_month,
      notes: event.notes || '',
      status: event.status as any,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este evento?')) return;

    try {
      const { error } = await supabase.from('payroll_events').delete().eq('id', id);
      if (error) throw error;
      toast.success('Evento excluído com sucesso');
      await loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir evento');
    }
  };

  const filteredEmployees = employees.filter(emp => {
    if (selectedCompanyId && emp.company_id !== selectedCompanyId) return false;
    if (searchTerm && !emp.full_name.toLowerCase().includes(searchTerm.toLowerCase()) && !emp.cpf.includes(searchTerm)) return false;
    return true;
  });

  const filteredEvents = events.filter(event => {
    if (filterCompanyId && event.company_id !== filterCompanyId) return false;
    if (filterMonth && event.reference_month !== filterMonth) return false;
    return true;
  });

  const totalValue = filteredEvents.reduce((sum, event) => sum + event.total_value, 0);

  const columns: ColumnDef<PayrollEvent>[] = [
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
      accessorKey: 'event_type',
      header: 'Tipo de Evento',
      cell: ({ row }) => {
        const typeMap: Record<string, { label: string; variant: any }> = {
          vacation: { label: 'Férias', variant: 'success' },
          absence: { label: 'Falta', variant: 'default' },
          sick_leave: { label: 'Afastamento', variant: 'info' },
          maternity_leave: { label: 'Licença Maternidade', variant: 'info' },
          paternity_leave: { label: 'Licença Paternidade', variant: 'info' },
          unpaid_leave: { label: 'Licença não Remunerada', variant: 'default' },
          other: { label: 'Outro', variant: 'default' },
        };
        const type = typeMap[row.original.event_type];
        return <Badge variant={type.variant}>{type.label}</Badge>;
      },
    },
    {
      accessorKey: 'start_date',
      header: 'Período',
      cell: ({ row }) => (
        <div className="text-sm">
          <p>{new Date(row.original.start_date).toLocaleDateString('pt-BR')}</p>
          <p className="text-neutral-500">até {new Date(row.original.end_date).toLocaleDateString('pt-BR')}</p>
        </div>
      ),
    },
    {
      accessorKey: 'days_count',
      header: 'Dias',
      cell: ({ row }) => <span className="text-sm font-medium">{row.original.days_count}</span>,
    },
    {
      accessorKey: 'daily_value',
      header: 'Valor Diário',
      cell: ({ row }) => (
        <span className="text-sm font-mono">
          R$ {row.original.daily_value.toFixed(2).replace('.', ',')}
        </span>
      ),
    },
    {
      accessorKey: 'total_value',
      header: 'Valor Total',
      cell: ({ row }) => (
        <span className="text-sm font-mono font-medium text-green-700">
          R$ {row.original.total_value.toFixed(2).replace('.', ',')}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusMap = {
          pending: { label: 'Pendente', variant: 'info' as const },
          approved: { label: 'Aprovado', variant: 'success' as const },
          billed: { label: 'Faturado', variant: 'default' as const },
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
          {row.original.status !== 'billed' && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleEdit(row.original)}>
                <Edit className="h-3 w-3" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDelete(row.original.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const totalValueCalculated = daysCount && dailyValue
    ? (parseInt(daysCount) * parseFloat(dailyValue.replace(',', '.'))).toFixed(2)
    : '0.00';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Eventos de Folha</h1>
        <p className="text-neutral-600 mt-1">
          Mantenha eventos que impactam o faturamento (férias, faltas, afastamentos)
        </p>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex gap-3">
          <Select
            value={filterCompanyId}
            onChange={(e) => setFilterCompanyId(e.target.value)}
            options={[
              { value: '', label: 'Todas as empresas' },
              ...companies.map(comp => ({ value: comp.id, label: comp.name }))
            ]}
          />
          <Input
            type="month"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            placeholder="Filtrar por mês"
          />
        </div>
        <Button onClick={() => {
          setEditingEventId('');
          eventForm.reset({
            event_type: 'vacation',
            status: 'pending',
            days_count: '1',
            daily_value: '0',
          });
          setShowModal(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total de Eventos</p>
                <p className="text-2xl font-bold text-neutral-900">{filteredEvents.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Valor Total</p>
                <p className="text-2xl font-bold text-green-700">
                  R$ {totalValue.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Pendentes</p>
                <p className="text-2xl font-bold text-blue-700">
                  {filteredEvents.filter(e => e.status === 'pending').length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-lg font-semibold">Lista de Eventos</h3>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          ) : (
            <DataGrid data={filteredEvents} columns={columns} />
          )}
        </CardContent>
      </Card>

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEventId('');
          eventForm.reset();
        }}
        title={editingEventId ? 'Editar Evento de Folha' : 'Novo Evento de Folha'}
      >
        <form onSubmit={eventForm.handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <p className="text-xs text-blue-800">
              Registre eventos de folha que impactam o faturamento. O valor total será calculado automaticamente.
            </p>
          </div>

          <Select
            label="Empresa *"
            {...eventForm.register('company_id')}
            error={eventForm.formState.errors.company_id?.message}
            options={[
              { value: '', label: 'Selecione a empresa...' },
              ...companies.map(comp => ({ value: comp.id, label: comp.name }))
            ]}
          />

          {selectedCompanyId && (
            <>
              <div className="relative">
                <Search className="absolute left-3 top-10 h-4 w-4 text-neutral-400" />
                <Input
                  label="Buscar Funcionário"
                  type="text"
                  placeholder="Nome ou CPF..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select
                label="Funcionário *"
                {...eventForm.register('employee_id')}
                error={eventForm.formState.errors.employee_id?.message}
                options={[
                  { value: '', label: 'Selecione o funcionário...' },
                  ...filteredEmployees.map(emp => ({
                    value: emp.id,
                    label: `${emp.full_name} - ${emp.cpf}`
                  }))
                ]}
              />
            </>
          )}

          <Select
            label="Tipo de Evento *"
            {...eventForm.register('event_type')}
            error={eventForm.formState.errors.event_type?.message}
            options={[
              { value: 'vacation', label: 'Férias' },
              { value: 'absence', label: 'Falta' },
              { value: 'sick_leave', label: 'Afastamento por Doença' },
              { value: 'maternity_leave', label: 'Licença Maternidade' },
              { value: 'paternity_leave', label: 'Licença Paternidade' },
              { value: 'unpaid_leave', label: 'Licença não Remunerada' },
              { value: 'other', label: 'Outro' }
            ]}
          />

          <Input
            label="Descrição do Evento *"
            {...eventForm.register('event_description')}
            error={eventForm.formState.errors.event_description?.message}
            placeholder="Ex: Férias período verão"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data Inicial *"
              type="date"
              {...eventForm.register('start_date')}
              error={eventForm.formState.errors.start_date?.message}
            />
            <Input
              label="Data Final *"
              type="date"
              {...eventForm.register('end_date')}
              error={eventForm.formState.errors.end_date?.message}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Dias *"
              type="number"
              {...eventForm.register('days_count')}
              error={eventForm.formState.errors.days_count?.message}
              readOnly
            />
            <Input
              label="Valor Diário (R$) *"
              type="text"
              placeholder="0,00"
              {...eventForm.register('daily_value')}
              error={eventForm.formState.errors.daily_value?.message}
            />
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Valor Total
              </label>
              <div className="px-3 py-2 border border-neutral-300 bg-neutral-50 rounded-lg">
                <span className="text-sm font-mono font-medium text-green-700">
                  R$ {totalValueCalculated.replace('.', ',')}
                </span>
              </div>
            </div>
          </div>

          <Input
            label="Mês de Referência *"
            type="month"
            {...eventForm.register('reference_month')}
            error={eventForm.formState.errors.reference_month?.message}
          />

          <Select
            label="Status *"
            {...eventForm.register('status')}
            error={eventForm.formState.errors.status?.message}
            options={[
              { value: 'pending', label: 'Pendente' },
              { value: 'approved', label: 'Aprovado' },
              { value: 'billed', label: 'Faturado' }
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Observações
            </label>
            <textarea
              {...eventForm.register('notes')}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-primary focus:border-transparent"
              rows={3}
              placeholder="Informações adicionais (opcional)"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingEventId('');
                eventForm.reset();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {editingEventId ? 'Atualizar' : 'Cadastrar'} Evento
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
