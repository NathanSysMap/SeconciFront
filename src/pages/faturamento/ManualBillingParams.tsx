import { useState, useEffect } from 'react';
import { Settings, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataGrid } from '../../components/ui/DataGrid';
import { supabase } from '../../lib/supabase';
import { ColumnDef } from '@tanstack/react-table';

export default function ManualBillingParams() {
  const [params, setParams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('manual_billing_parameters').select('*, companies(corporate_name)').order('created_at', { ascending: false });
    setParams(data || []);
    setLoading(false);
  };

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'parameter_name', header: 'Parâmetro', cell: ({ row }) => <span className="font-medium">{row.original.parameter_name}</span> },
    { accessorKey: 'companies.corporate_name', header: 'Empresa', cell: ({ row }) => row.original.companies?.corporate_name || 'Global' },
    { accessorKey: 'parameter_type', header: 'Tipo', cell: ({ row }) => <Badge variant="default">{row.original.parameter_type}</Badge> },
    { accessorKey: 'effective_from', header: 'Vigência', cell: ({ row }) => new Date(row.original.effective_from).toLocaleDateString('pt-BR') },
    { accessorKey: 'active', header: 'Status', cell: ({ row }) => <Badge variant={row.original.active ? 'success' : 'default'}>{row.original.active ? 'Ativo' : 'Inativo'}</Badge> },
  ];

  const filteredParams = params.filter(p => p.parameter_name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-neutral-900">Parâmetros de Faturamento Manual</h1><p className="text-neutral-600 mt-1">Configuração de parâmetros para faturamento manual</p></div>
      <Card variant="elevated">
        <CardHeader><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" /><Input type="text" placeholder="Buscar parâmetro..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></CardHeader>
        <CardContent className="p-0">{loading ? <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div></div> : <DataGrid data={filteredParams} columns={columns} />}</CardContent>
      </Card>
    </div>
  );
}
