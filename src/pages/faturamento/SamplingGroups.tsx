import { useState, useEffect } from 'react';
import { ArrowLeftRight, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataGrid } from '../../components/ui/DataGrid';
import { supabase } from '../../lib/supabase';
import { ColumnDef } from '@tanstack/react-table';

export default function BillingModeTransfer() {
  const [transfers, setTransfers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('billing_mode_transfers').select('*, companies(corporate_name, cnpj)').order('transfer_date', { ascending: false });
    setTransfers(data || []);
    setLoading(false);
  };

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'companies.corporate_name', header: 'Empresa', cell: ({ row }) => <div><p className="font-medium">{row.original.companies?.corporate_name}</p><p className="text-xs text-neutral-500">{row.original.companies?.cnpj}</p></div> },
    { accessorKey: 'from_mode', header: 'De', cell: ({ row }) => <Badge variant="default">{row.original.from_mode === 'automatic' ? 'Automático' : 'Manual'}</Badge> },
    { accessorKey: 'to_mode', header: 'Para', cell: ({ row }) => <Badge variant="info">{row.original.to_mode === 'automatic' ? 'Automático' : 'Manual'}</Badge> },
    { accessorKey: 'effective_from', header: 'Vigência', cell: ({ row }) => new Date(row.original.effective_from).toLocaleDateString('pt-BR') },
    { accessorKey: 'approved', header: 'Status', cell: ({ row }) => <Badge variant={row.original.approved ? 'success' : 'warning'}>{row.original.approved ? 'Aprovado' : 'Pendente'}</Badge> },
  ];

  const filteredTransfers = transfers.filter(t => t.companies?.corporate_name.toLowerCase().includes(searchTerm.toLowerCase()) || t.companies?.cnpj.includes(searchTerm));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-neutral-900">Transferência de Modo de Faturamento</h1><p className="text-neutral-600 mt-1">Transferir empresas entre faturamento manual e automático</p></div>
      <Card variant="elevated">
        <CardHeader><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" /><Input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></CardHeader>
        <CardContent className="p-0">{loading ? <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div></div> : <DataGrid data={filteredTransfers} columns={columns} />}</CardContent>
      </Card>
    </div>
  );
}
