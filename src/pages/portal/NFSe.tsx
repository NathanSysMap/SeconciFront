import { Card, CardContent } from '../../components/ui/Card';
import { DataGrid } from '../../components/ui/DataGrid';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Download } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';

interface NFSe {
  id: string;
  nfse_number: string;
  issue_date: string;
  amount: number;
}

export default function NFSe() {
  const data: NFSe[] = [];

  const columns: ColumnDef<NFSe>[] = [
    { accessorKey: 'nfse_number', header: 'Número NFSe' },
    {
      accessorKey: 'issue_date',
      header: 'Data Emissão',
      cell: ({ row }) => new Date(row.original.issue_date).toLocaleDateString('pt-BR'),
    },
    {
      accessorKey: 'amount',
      header: 'Valor',
      cell: ({ row }) => `R$ ${row.original.amount.toFixed(2)}`,
    },
    {
      id: 'actions',
      header: 'Ações',
      cell: () => (
        <Button variant="ghost" size="sm">
          <Download className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Notas Fiscais de Serviço</h1>
        <p className="text-neutral-600 mt-1">Consulta e download de NFSe</p>
      </div>

      <Card variant="elevated">
        <CardContent className="p-0">
          <DataGrid data={data} columns={columns} />
        </CardContent>
      </Card>
    </div>
  );
}
