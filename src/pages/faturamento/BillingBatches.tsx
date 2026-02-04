import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataGrid } from '../../components/ui/DataGrid';
import { supabase } from '../../lib/supabase';
import { ColumnDef } from '@tanstack/react-table';

interface BillingBatch {
  id: string;
  batch_name: string;
  reference_month: string;
  status: string;
  total_companies: number;
  total_amount: number;
}

export default function BillingBatches() {
  const [batches, setBatches] = useState<BillingBatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    const { data } = await supabase
      .from('billing_batches')
      .select('*')
      .order('reference_month', { ascending: false });
    setBatches(data || []);
    setLoading(false);
  };

  const columns: ColumnDef<BillingBatch>[] = [
    { accessorKey: 'batch_name', header: 'Nome do Lote' },
    {
      accessorKey: 'reference_month',
      header: 'Competência',
      cell: ({ row }) => new Date(row.original.reference_month).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
    },
    { accessorKey: 'total_companies', header: 'Empresas' },
    {
      accessorKey: 'total_amount',
      header: 'Valor Total',
      cell: ({ row }) => `R$ ${row.original.total_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusMap: Record<string, any> = {
          draft: 'default',
          approved: 'success',
          processing: 'warning',
        };
        return <Badge variant={statusMap[row.original.status]}>{row.original.status}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Lotes de Faturamento</h1>
          <p className="text-neutral-600 mt-1">
            Agrupamento e geração de lotes para boletos
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Lote
        </Button>
      </div>

      <Card variant="elevated">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          ) : (
            <DataGrid data={batches} columns={columns} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
