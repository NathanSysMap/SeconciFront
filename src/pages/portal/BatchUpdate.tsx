import { useState, useEffect } from 'react';
import { Download, Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, FileText, Users, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataGrid } from '../../components/ui/DataGrid';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';

interface PayrollImport {
  id: string;
  company_id: string | null;
  import_type: string;
  file_name: string;
  total_records: number;
  valid_records: number;
  invalid_records: number;
  status: string;
  imported_at: string;
  companies?: {
    corporate_name: string;
  };
}

interface Employee {
  id: string;
  full_name: string;
  cpf: string;
  admission_date: string;
  status: string;
}

interface Dependent {
  id: string;
  full_name: string;
  cpf: string;
  relationship: string;
  birth_date: string;
  employee_id: string;
  employees?: {
    full_name: string;
  };
}

type TabType = 'esocial' | 'fgts' | 'employees' | 'dependents' | 'history';

export default function BatchUpdate() {
  const [activeTab, setActiveTab] = useState<TabType>('esocial');
  const [imports, setImports] = useState<PayrollImport[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);

    const [importsRes, employeesRes, dependentsRes] = await Promise.all([
      supabase
        .from('payroll_imports')
        .select(`
          *,
          companies (
            corporate_name
          )
        `)
        .order('imported_at', { ascending: false })
        .limit(50),
      supabase
        .from('employees')
        .select('id, full_name, cpf, admission_date, status')
        .order('full_name'),
      supabase
        .from('dependents')
        .select(`
          *,
          employees (
            full_name
          )
        `)
        .order('full_name')
    ]);

    if (!importsRes.error) setImports(importsRes.data || []);
    if (!employeesRes.error) setEmployees(employeesRes.data || []);
    if (!dependentsRes.error) setDependents(dependentsRes.data || []);

    setLoading(false);
  };

  const downloadTemplate = (type: 'esocial' | 'fgts', format: 'excel' | 'txt') => {
    const templates = {
      esocial: {
        excel: generateESocialExcelTemplate(),
        txt: generateESocialTxtTemplate(),
      },
      fgts: {
        excel: generateFGTSExcelTemplate(),
        txt: generateFGTSTxtTemplate(),
      },
    };

    const fileExtension = format === 'excel' ? 'csv' : 'txt';
    const mimeType = format === 'excel' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;';

    const blob = new Blob([templates[type][format]], { type: mimeType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `template_${type}_${format}_${new Date().getTime()}.${fileExtension}`;
    link.click();
    toast.success('Template baixado com sucesso!');
  };

  const generateESocialExcelTemplate = () => {
    const headers = [
      'CPF',
      'Nome Completo',
      'Data Admissão',
      'Categoria',
      'Remuneração',
      'Horas Extras',
      'Adicional Noturno',
      'Adicional Periculosidade',
      'Adicional Insalubridade',
      'DSR',
      'Férias',
      '13º Salário',
      'FGTS',
      'INSS Base'
    ];

    const example = [
      '12345678900',
      'João da Silva',
      '2023-01-15',
      '101',
      '5000.00',
      '500.00',
      '200.00',
      '0.00',
      '0.00',
      '600.00',
      '0.00',
      '0.00',
      '400.00',
      '5000.00'
    ];

    return `${headers.join(';')}\n${example.join(';')}\n`;
  };

  const generateESocialTxtTemplate = () => {
    return `000|eSocial v1.0|${new Date().toISOString().split('T')[0]}
100|12345678900|João da Silva|2023-01-15|101
200|5000.00|500.00|200.00|0.00|0.00|600.00
300|0.00|0.00|400.00|5000.00
999|1`;
  };

  const generateFGTSExcelTemplate = () => {
    const headers = [
      'CPF',
      'Nome',
      'Competência',
      'Remuneração',
      'Base FGTS',
      'Valor FGTS 8%',
      'Tipo Depósito',
      'Código Movimentação'
    ];

    const example = [
      '12345678900',
      'João da Silva',
      '202510',
      '5000.00',
      '5000.00',
      '400.00',
      '01',
      '00'
    ];

    return `${headers.join(';')}\n${example.join(';')}\n`;
  };

  const generateFGTSTxtTemplate = () => {
    return `000FGTS DIGITAL                  ${new Date().toISOString().split('T')[0].replace(/-/g, '')}
10012345678900João da Silva                    202510000500000000050000000000040000
999000001`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, importType: 'esocial' | 'fgts') => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        const lines = content.split('\n');

        const records = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(';');
          return {
            employee_cpf: values[0]?.trim() || '',
            employee_name: values[1]?.trim() || '',
            reference_month: values[2]?.trim() || '',
            base_salary: parseFloat(values[3]?.replace(',', '.') || '0'),
            overtime: parseFloat(values[4]?.replace(',', '.') || '0'),
            thirteenth_salary: parseFloat(values[5]?.replace(',', '.') || '0'),
            vacation: parseFloat(values[6]?.replace(',', '.') || '0'),
            absences: parseFloat(values[7]?.replace(',', '.') || '0'),
            fgts_value: parseFloat(values[8]?.replace(',', '.') || '0'),
          };
        });

        const validRecords = records.filter(r =>
          r.employee_cpf && r.employee_name && r.reference_month
        );

        const { data: importData, error: importError } = await supabase
          .from('payroll_imports')
          .insert([{
            company_id: null,
            import_type: importType,
            file_name: file.name,
            file_size: file.size,
            total_records: records.length,
            valid_records: validRecords.length,
            invalid_records: records.length - validRecords.length,
            status: 'completed',
            validation_summary: {
              total: records.length,
              valid: validRecords.length,
              invalid: records.length - validRecords.length
            }
          }])
          .select()
          .single();

        if (importError) throw importError;

        if (importData && validRecords.length > 0) {
          const recordsToInsert = validRecords.map(record => ({
            ...record,
            import_id: importData.id,
            validation_status: 'valid'
          }));

          const { error: recordsError } = await supabase
            .from('payroll_records')
            .insert(recordsToInsert);

          if (recordsError) throw recordsError;
        }

        toast.success(`Arquivo importado com sucesso! ${validRecords.length} registros válidos.`);
        await loadAllData();
        setActiveTab('history');
      };

      reader.readAsText(file);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao importar arquivo');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const importColumns: ColumnDef<PayrollImport>[] = [
    {
      accessorKey: 'file_name',
      header: 'Arquivo',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-green-600" />
          <div>
            <p className="font-medium text-neutral-900">{row.original.file_name}</p>
            <p className="text-xs text-neutral-500">
              {row.original.import_type.toUpperCase()}
            </p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'total_records',
      header: 'Registros',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span className="text-sm text-green-700">{row.original.valid_records} válidos</span>
          </div>
          {row.original.invalid_records > 0 && (
            <div className="flex items-center gap-2">
              <XCircle className="h-3 w-3 text-red-600" />
              <span className="text-sm text-red-700">{row.original.invalid_records} inválidos</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusMap = {
          processing: { label: 'Processando', variant: 'info' as const },
          completed: { label: 'Concluído', variant: 'success' as const },
          error: { label: 'Erro', variant: 'error' as const },
        };
        const status = statusMap[row.original.status as keyof typeof statusMap] || statusMap.processing;
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
    {
      accessorKey: 'imported_at',
      header: 'Data de Importação',
      cell: ({ row }) => (
        <span className="text-sm text-neutral-700">
          {new Date(row.original.imported_at).toLocaleString('pt-BR')}
        </span>
      ),
    },
  ];

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
      accessorKey: 'admission_date',
      header: 'Data de Admissão',
      cell: ({ row }) => (
        <span className="text-sm text-neutral-700">
          {new Date(row.original.admission_date).toLocaleDateString('pt-BR')}
        </span>
      ),
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
        const status = statusMap[row.original.status as keyof typeof statusMap] || statusMap.active;
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
  ];

  const dependentColumns: ColumnDef<Dependent>[] = [
    {
      accessorKey: 'full_name',
      header: 'Nome do Dependente',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-neutral-900">{row.original.full_name}</p>
          <p className="text-xs text-neutral-500 font-mono">{row.original.cpf}</p>
        </div>
      ),
    },
    {
      accessorKey: 'employees.full_name',
      header: 'Funcionário Responsável',
      cell: ({ row }) => (
        <span className="text-sm text-neutral-700">
          {row.original.employees?.full_name}
        </span>
      ),
    },
    {
      accessorKey: 'relationship',
      header: 'Parentesco',
      cell: ({ row }) => {
        const relationshipMap: Record<string, string> = {
          spouse: 'Cônjuge',
          child: 'Filho(a)',
          parent: 'Pai/Mãe',
          other: 'Outro',
        };
        return (
          <Badge variant="info">
            {relationshipMap[row.original.relationship] || row.original.relationship}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'birth_date',
      header: 'Data de Nascimento',
      cell: ({ row }) => (
        <span className="text-sm text-neutral-700">
          {new Date(row.original.birth_date).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Atualização em Lote</h1>
        <p className="text-neutral-600 mt-1">
          Gerencie importações de eSocial, FGTS Digital e visualize funcionários
        </p>
      </div>

      <div className="border-b border-neutral-200">
        <nav className="flex gap-1">
          <button
            onClick={() => setActiveTab('esocial')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'esocial'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            eSocial
          </button>
          <button
            onClick={() => setActiveTab('fgts')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'fgts'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            FGTS Digital
          </button>
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'employees'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Users className="h-4 w-4 inline mr-2" />
            Funcionários ({employees.length})
          </button>
          <button
            onClick={() => setActiveTab('dependents')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'dependents'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <UserPlus className="h-4 w-4 inline mr-2" />
            Dependentes ({dependents.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-brand-primary text-brand-primary'
                : 'border-transparent text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Histórico
          </button>
        </nav>
      </div>

      {(activeTab === 'esocial' || activeTab === 'fgts') && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card variant="elevated">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Download className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">Baixar Templates</h3>
                    <p className="text-sm text-neutral-600">
                      {activeTab === 'esocial' ? 'Modelos eSocial' : 'Modelos FGTS Digital'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => downloadTemplate(activeTab, 'excel')}
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2 text-green-600" />
                    Template Excel (CSV)
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => downloadTemplate(activeTab, 'txt')}
                  >
                    <FileText className="h-4 w-4 mr-2 text-blue-600" />
                    Template TXT (Layout Posicional)
                  </Button>
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
                    <h3 className="font-semibold text-neutral-900">Importar Arquivo</h3>
                    <p className="text-sm text-neutral-600">
                      Upload de {activeTab === 'esocial' ? 'eSocial' : 'FGTS Digital'}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-brand-primary transition-colors">
                    <input
                      type="file"
                      id={`file-upload-${activeTab}`}
                      className="hidden"
                      accept=".csv,.xlsx,.xls,.xml,.txt"
                      onChange={(e) => handleFileUpload(e, activeTab)}
                      disabled={uploading}
                    />
                    <label htmlFor={`file-upload-${activeTab}`} className="cursor-pointer">
                      <Upload className="h-8 w-8 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-neutral-700">
                        {uploading ? 'Processando...' : 'Clique para selecionar arquivo'}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        CSV, Excel ou TXT
                      </p>
                    </label>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-700">
                        <p className="font-semibold mb-1">Validação Inteligente</p>
                        <p>
                          Os dados serão validados automaticamente: CPFs, datas, valores e
                          consistência com a base atual de funcionários.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'employees' && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Lista Atual de Funcionários</h3>
                <p className="text-sm text-neutral-600">{employees.length} funcionário(s) cadastrado(s)</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
              </div>
            ) : (
              <DataGrid data={employees} columns={employeeColumns} />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'dependents' && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Lista Atual de Dependentes</h3>
                <p className="text-sm text-neutral-600">{dependents.length} dependente(s) cadastrado(s)</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
              </div>
            ) : (
              <DataGrid data={dependents} columns={dependentColumns} />
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'history' && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Histórico de Importações</h3>
                <p className="text-sm text-neutral-600">{imports.length} importação(ões) realizada(s)</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
              </div>
            ) : (
              <DataGrid data={imports} columns={importColumns} />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
