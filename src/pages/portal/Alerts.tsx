import { useState, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { DataGrid } from '../../components/ui/DataGrid';
import { AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ColumnDef } from '@tanstack/react-table';

interface Alert {
  id: string;
  alert_type: string;
  severity: string;
  title: string;
  description: string | null;
  status: string;
  created_at: string;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    const { data } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false });
    setAlerts(data || []);
    setLoading(false);
  };

  const columns: ColumnDef<Alert>[] = [
    {
      accessorKey: 'severity',
      header: 'Severidade',
      cell: ({ row }) => {
        const severityMap: Record<string, any> = {
          info: 'info',
          warning: 'warning',
          error: 'danger',
        };
        return <Badge variant={severityMap[row.original.severity]}>{row.original.severity}</Badge>;
      },
    },
    { accessorKey: 'title', header: 'Título' },
    { accessorKey: 'description', header: 'Descrição' },
    {
      accessorKey: 'created_at',
      header: 'Data',
      cell: ({ row }) => new Date(row.original.created_at).toLocaleDateString('pt-BR'),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'warning' : 'success'}>
          {row.original.status === 'active' ? 'Ativo' : 'Resolvido'}
        </Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Alertas e Desvios</h1>
        <p className="text-neutral-600 mt-1">
          Desvios detectados automaticamente durante atualizações
        </p>
      </div>

      <Card variant="elevated">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          ) : (
            <DataGrid data={alerts} columns={columns} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
