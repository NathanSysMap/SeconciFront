import { useState, useEffect } from 'react';
import { Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataGrid } from '../../components/ui/DataGrid';
import { EmptyState } from '../../components/ui/EmptyState';
import { supabase } from '../../lib/supabase';
import { ColumnDef } from '@tanstack/react-table';

export default function PayrollAdjustments() {
  const [adjustments, setAdjustments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const { data } = await supabase.from('payroll_adjustments').select('*, companies(corporate_name, cnpj)').order('created_at', { ascending: false });
    setAdjustments(data || []);
    setLoading(false);
  };

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'companies.corporate_name', header: 'Empresa', cell: ({ row }) => <div><p className="font-medium">{row.original.companies?.corporate_name}</p><p className="text-xs text-neutral-500">{row.original.companies?.cnpj}</p></div> },
    { accessorKey: 'reference_month', header: 'Mês', cell: ({ row }) => new Date(row.original.reference_month).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }) },
    { accessorKey: 'calculated_amount', header: 'Calculado', cell: ({ row }) => `R$ ${Number(row.original.calculated_amount).toFixed(2)}` },
    { accessorKey: 'informed_amount', header: 'Informado', cell: ({ row }) => `R$ ${Number(row.original.informed_amount).toFixed(2)}` },
    { accessorKey: 'adjustment_amount', header: 'Ajuste', cell: ({ row }) => <span className={row.original.adjustment_amount > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>R$ {Number(row.original.adjustment_amount).toFixed(2)}</span> },
    { accessorKey: 'approved', header: 'Status', cell: ({ row }) => <Badge variant={row.original.approved ? 'success' : 'warning'}>{row.original.approved ? 'Aprovado' : 'Pendente'}</Badge> },
  ];

  const filteredAdjustments = adjustments.filter(a => a.companies?.corporate_name.toLowerCase().includes(searchTerm.toLowerCase()) || a.companies?.cnpj.includes(searchTerm));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-neutral-900">Ajustes por Folha Informada</h1><p className="text-neutral-600 mt-1">Empresas que informaram folha acima do calculado</p></div>
      </div>
      <Card variant="elevated">
        <CardHeader><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" /><Input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" /></div></CardHeader>
        <CardContent className="p-0">{loading ? <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div></div> : filteredAdjustments.length === 0 ? <EmptyState icon={Plus} title="Nenhum ajuste encontrado" description="Ajustes aparecem quando empresas informam valores diferentes" /> : <DataGrid data={filteredAdjustments} columns={columns} />}</CardContent>
      </Card>
    </div>
  );
}
