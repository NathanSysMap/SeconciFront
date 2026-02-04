import { useState, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataGrid } from '../../components/ui/DataGrid';
import { supabase } from '../../lib/supabase';
import { ColumnDef } from '@tanstack/react-table';

export default function BillingAlerts() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('billing_alerts').select('*, companies(corporate_name, cnpj)').order('created_at', { ascending: false });
    setAlerts(data || []);
    setLoading(false);
  };

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'companies.corporate_name', header: 'Empresa', cell: ({ row }) => <div><p className="font-medium">{row.original.companies?.corporate_name}</p><p className="text-xs text-neutral-500">{row.original.companies?.cnpj}</p></div> },
    { accessorKey: 'alert_type', header: 'Tipo', cell: ({ row }) => <Badge variant="warning">{row.original.alert_type.replace(/_/g, ' ')}</Badge> },
    { accessorKey: 'severity', header: 'Severidade', cell: ({ row }) => <Badge variant={row.original.severity === 'critical' ? 'error' : row.original.severity === 'high' ? 'warning' : 'default'}>{row.original.severity}</Badge> },
    { accessorKey: 'deviation_percentage', header: 'Desvio', cell: ({ row }) => row.original.deviation_percentage ? `${Number(row.original.deviation_percentage).toFixed(1)}%` : '-' },
    { accessorKey: 'status', header: 'Status', cell: ({ row }) => <Badge variant={row.original.status === 'resolved' ? 'success' : row.original.status === 'open' ? 'error' : 'default'}>{row.original.status}</Badge> },
    { accessorKey: 'sent_to_company', header: 'Enviado', cell: ({ row }) => <Badge variant={row.original.sent_to_company ? 'success' : 'default'}>{row.original.sent_to_company ? 'Sim' : 'Não'}</Badge> },
  ];

  const filteredAlerts = alerts.filter(a => a.companies?.corporate_name.toLowerCase().includes(searchTerm.toLowerCase()) || a.companies?.cnpj.includes(searchTerm));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-neutral-900">Alertas de Desvios</h1><p className="text-neutral-600 mt-1">Monitoramento de desvios de funcionários e valores</p></div>
      <Card variant="elevated">
        <CardHeader><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" /><Input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></CardHeader>
        <CardContent className="p-0">{loading ? <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div></div> : <DataGrid data={filteredAlerts} columns={columns} />}</CardContent>
      </Card>
    </div>
  );
}
