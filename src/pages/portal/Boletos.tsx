import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { DataGrid } from '../../components/ui/DataGrid';
import { Download, Printer } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ColumnDef } from '@tanstack/react-table';

interface Invoice {
  id: string;
  invoice_number: string;
  reference_month: string;
  due_date: string;
  amount: number;
  status: string;
}

export default function Boletos() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    const { data } = await supabase
      .from('invoices')
      .select('*')
      .order('reference_month', { ascending: false });
    setInvoices(data || []);
    setLoading(false);
  };

  const columns: ColumnDef<Invoice>[] = [
    { accessorKey: 'invoice_number', header: 'Número' },
    {
      accessorKey: 'reference_month',
      header: 'Competência',
      cell: ({ row }) => new Date(row.original.reference_month).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
    },
    {
      accessorKey: 'due_date',
      header: 'Vencimento',
      cell: ({ row }) => new Date(row.original.due_date).toLocaleDateString('pt-BR'),
    },
    {
      accessorKey: 'amount',
      header: 'Valor',
      cell: ({ row }) => `R$ ${row.original.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const statusMap: Record<string, { variant: any; label: string }> = {
          pending: { variant: 'warning', label: 'Pendente' },
          paid: { variant: 'success', label: 'Pago' },
          overdue: { variant: 'danger', label: 'Vencido' },
        };
        const status = statusMap[row.original.status] || statusMap.pending;
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: () => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Printer className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Boletos</h1>
        <p className="text-neutral-600 mt-1">
          Consulta e impressão de boletos
        </p>
      </div>

      <Card variant="elevated">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
            </div>
          ) : (
            <DataGrid data={invoices} columns={columns} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
