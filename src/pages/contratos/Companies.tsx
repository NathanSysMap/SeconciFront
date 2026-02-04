import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Search, Filter, Edit } from 'lucide-react';
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

const companySchema = z.object({
  cnpj: z.string().min(14, 'CNPJ inválido'),
  corporate_name: z.string().min(3, 'Razão social obrigatória'),
  trade_name: z.string().optional(),
  status: z.string(),
  convention: z.string().optional(),
  auto_billing_enabled: z.boolean(),
  contact_email: z.string().email('Email inválido').optional().or(z.literal('')),
  contact_phone: z.string().optional(),
});

type CompanyFormData = z.infer<typeof companySchema>;

interface Company extends CompanyFormData {
  id: string;
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      status: 'active',
      auto_billing_enabled: false,
    }
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      reset(selectedCompany);
    } else {
      reset({
        cnpj: '',
        corporate_name: '',
        trade_name: '',
        status: 'active',
        convention: '',
        auto_billing_enabled: false,
        contact_email: '',
        contact_phone: '',
      });
    }
  }, [selectedCompany, reset]);

  const loadCompanies = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('companies')
      .select('*')
      .order('corporate_name');

    if (error) {
      toast.error('Erro ao carregar empresas');
      console.error(error);
    } else {
      setCompanies(data || []);
    }
    setLoading(false);
  };

  const onSubmit = async (data: CompanyFormData) => {
    setSaving(true);
    try {
      if (selectedCompany) {
        const { error } = await supabase
          .from('companies')
          .update(data)
          .eq('id', selectedCompany.id);

        if (error) throw error;
        toast.success('Empresa atualizada com sucesso!');
      } else {
        const { error } = await supabase
          .from('companies')
          .insert([data]);

        if (error) throw error;
        toast.success('Empresa cadastrada com sucesso!');
      }

      await loadCompanies();
      setIsModalOpen(false);
      setSelectedCompany(null);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar empresa');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.corporate_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.cnpj.includes(searchTerm) ||
      company.trade_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns: ColumnDef<Company>[] = [
    {
      accessorKey: 'cnpj',
      header: 'CNPJ',
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.cnpj}</span>
      ),
    },
    {
      accessorKey: 'corporate_name',
      header: 'Razão Social',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-neutral-900">{row.original.corporate_name}</p>
          {row.original.trade_name && (
            <p className="text-xs text-neutral-500">{row.original.trade_name}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'convention',
      header: 'Convenção',
      cell: ({ row }) => (
        <Badge variant="info">{row.original.convention || 'N/A'}</Badge>
      ),
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
      accessorKey: 'auto_billing_enabled',
      header: 'Faturamento Auto',
      cell: ({ row }) => (
        <Badge variant={row.original.auto_billing_enabled ? 'success' : 'default'}>
          {row.original.auto_billing_enabled ? 'Sim' : 'Não'}
        </Badge>
      ),
    },
    {
      accessorKey: 'contact_email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-sm text-neutral-600">
          {row.original.contact_email || '-'}
        </span>
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
              setSelectedCompany(row.original);
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
          <h1 className="text-2xl font-bold text-neutral-900">Empresas</h1>
          <p className="text-neutral-600 mt-1">
            Gerenciamento de empresas conveniadas
          </p>
        </div>
        <Button onClick={() => { setSelectedCompany(null); setIsModalOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <Input
                type="text"
                placeholder="Buscar por CNPJ, razão social ou nome fantasia..."
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
          ) : filteredCompanies.length === 0 ? (
            <EmptyState
              icon={Plus}
              title="Nenhuma empresa encontrada"
              description="Comece adicionando uma nova empresa ao sistema"
              action={{
                label: 'Nova Empresa',
                onClick: () => { setSelectedCompany(null); setIsModalOpen(true); }
              }}
            />
          ) : (
            <DataGrid
              data={filteredCompanies}
              columns={columns}
              onRowClick={(company) => {
                setSelectedCompany(company);
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
          setSelectedCompany(null);
        }}
        title={selectedCompany ? 'Editar Empresa' : 'Nova Empresa'}
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <ModalContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="CNPJ *"
                  placeholder="00.000.000/0000-00"
                  {...register('cnpj')}
                  error={errors.cnpj?.message}
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

              <Input
                label="Razão Social *"
                placeholder="Empresa Ltda"
                {...register('corporate_name')}
                error={errors.corporate_name?.message}
              />

              <Input
                label="Nome Fantasia"
                placeholder="Empresa"
                {...register('trade_name')}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="contato@empresa.com.br"
                  {...register('contact_email')}
                  error={errors.contact_email?.message}
                />
                <Input
                  label="Telefone"
                  placeholder="(11) 0000-0000"
                  {...register('contact_phone')}
                />
              </div>

              <Input
                label="Convenção"
                placeholder="SINDUSCON"
                {...register('convention')}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-billing"
                  className="rounded"
                  {...register('auto_billing_enabled')}
                />
                <label htmlFor="auto-billing" className="text-sm text-neutral-700">
                  Habilitar Faturamento Automático
                </label>
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setSelectedCompany(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" loading={saving}>
              {selectedCompany ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
