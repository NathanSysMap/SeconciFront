import { useState, useEffect } from 'react';
import { Download, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataGrid } from '../../components/ui/DataGrid';
import { supabase } from '../../lib/supabase';
import { ColumnDef } from '@tanstack/react-table';

export default function ExportParameters() {
  const [exports, setExports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('export_parameters').select('*').order('created_at', { ascending: false });
    setExports(data || []);
    setLoading(false);
  };

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'export_name', header: 'Nome', cell: ({ row }) => <span className="font-medium">{row.original.export_name}</span> },
    { accessorKey: 'export_type', header: 'Tipo', cell: ({ row }) => <Badge variant="info">{row.original.export_type}</Badge> },
    { accessorKey: 'file_format', header: 'Formato', cell: ({ row }) => <Badge variant="default">{row.original.file_format.toUpperCase()}</Badge> },
    { accessorKey: 'active', header: 'Status', cell: ({ row }) => <Badge variant={row.original.active ? 'success' : 'default'}>{row.original.active ? 'Ativo' : 'Inativo'}</Badge> },
  ];

  const filteredExports = exports.filter(e => e.export_name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-neutral-900">Parâmetros de Exportação</h1><p className="text-neutral-600 mt-1">Configuração de formatos e regras de exportação</p></div>
      <Card variant="elevated">
        <CardHeader><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" /><Input type="text" placeholder="Buscar exportação..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></CardHeader>
        <CardContent className="p-0">{loading ? <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div></div> : <DataGrid data={filteredExports} columns={columns} />}</CardContent>
      </Card>
    </div>
  );
}
