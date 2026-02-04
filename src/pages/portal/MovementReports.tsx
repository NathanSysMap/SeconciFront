import { useState, useEffect } from 'react';
import { TrendingUp, Download, Calendar, Building, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { DataGrid } from '../../components/ui/DataGrid';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { ColumnDef } from '@tanstack/react-table';

interface MovementReport {
  id: string;
  reference_month: string;
  movement_percentage: number;
  total_events: number;
  companies_with_updates: number;
  companies_missing: number;
  admissions_count: number;
  terminations_count: number;
  updates_count: number;
  comparison_data: any;
}

export default function MovementReports() {
  const [reports, setReports] = useState<MovementReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [currentReport, setCurrentReport] = useState<MovementReport | null>(null);
  const [missingCompanies, setMissingCompanies] = useState<any[]>([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('movement_reports')
      .select('*')
      .order('reference_month', { ascending: false })
      .limit(12);

    if (error) {
      toast.error('Erro ao carregar relatórios');
    } else {
      setReports(data || []);
      if (data && data.length > 0) {
        setCurrentReport(data[0]);
        if (data[0].missing_companies) {
          setMissingCompanies(data[0].missing_companies as any[]);
        }
      }
    }
    setLoading(false);
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase.rpc('generate_movement_report', {
        p_reference_month: selectedMonth + '-01',
        p_user_id: user.user?.id
      });

      if (error) throw error;

      toast.success('Relatório gerado com sucesso!');
      await loadReports();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const missingColumns: ColumnDef<any>[] = [
    {
      accessorKey: 'corporate_name',
      header: 'Empresa',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-neutral-900">{row.original.corporate_name}</p>
          <p className="text-xs text-neutral-500">{row.original.cnpj}</p>
        </div>
      ),
    },
    {
      accessorKey: 'contact',
      header: 'Contato',
      cell: ({ row }) => (
        <div className="text-sm">
          <p>{row.original.contact_name}</p>
          <p className="text-neutral-500">{row.original.contact_email}</p>
          <p className="text-neutral-500">{row.original.contact_phone}</p>
        </div>
      ),
    },
    {
      accessorKey: 'last_update',
      header: 'Última Atualização',
      cell: ({ row }) => row.original.last_update ? new Date(row.original.last_update).toLocaleDateString('pt-BR') : 'Nunca',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Relatórios de Movimentação</h1>
        <p className="text-neutral-600 mt-1">
          Acompanhamento mensal da movimentação cadastral e empresas faltantes
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Movimentação Mensal</p>
                <p className="text-3xl font-bold text-brand-primary mt-2">
                  {currentReport?.movement_percentage.toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-brand-primary opacity-20" />
            </div>
            {currentReport?.comparison_data?.previous_month && (
              <p className="text-xs text-neutral-500 mt-2">
                Mês anterior: {currentReport.comparison_data.previous_month.toFixed(1)}%
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Total de Eventos</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">
                  {currentReport?.total_events || 0}
                </p>
              </div>
              <Calendar className="h-10 w-10 text-blue-500 opacity-20" />
            </div>
            <div className="flex gap-2 mt-2 text-xs">
              <Badge variant="success">Admissões: {currentReport?.admissions_count || 0}</Badge>
              <Badge variant="error">Deslig.: {currentReport?.terminations_count || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Com Atualização</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {currentReport?.companies_with_updates || 0}
                </p>
              </div>
              <Building className="h-10 w-10 text-green-600 opacity-20" />
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Empresas que enviaram dados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600">Faltantes</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {currentReport?.companies_missing || 0}
                </p>
              </div>
              <AlertCircle className="h-10 w-10 text-red-600 opacity-20" />
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Sem atualização no período
            </p>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Gerar Novo Relatório</h3>
            <div className="flex items-center gap-4">
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-48"
              />
              <Button onClick={generateReport} loading={loading}>
                Gerar Relatório
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {missingCompanies.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Empresas Faltantes</h3>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <DataGrid data={missingCompanies} columns={missingColumns} />
          </CardContent>
        </Card>
      )}

      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-lg font-semibold">Histórico de Relatórios</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 cursor-pointer"
                onClick={() => {
                  setCurrentReport(report);
                  if (report.missing_companies) {
                    setMissingCompanies(report.missing_companies as any[]);
                  }
                }}
              >
                <div className="flex items-center gap-4">
                  <Calendar className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="font-medium text-neutral-900">
                      {new Date(report.reference_month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {report.total_events} eventos • {report.companies_with_updates} empresas com atualização
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-brand-primary">
                    {report.movement_percentage.toFixed(1)}%
                  </p>
                  <p className="text-sm text-neutral-500">movimentação</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
