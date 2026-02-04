import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CheckCircle, XCircle } from 'lucide-react';

export default function BillingReview() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Conferência do Faturamento</h1>
        <p className="text-neutral-600 mt-1">
          Visão 360° da competência por empresa
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-600 mb-2">Total de Empresas</p>
              <p className="text-3xl font-bold text-neutral-900">3</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-600 mb-2">Valor Total</p>
              <p className="text-3xl font-bold text-brand-primary">R$ 0,00</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-sm font-medium text-neutral-600 mb-2">Status</p>
              <Badge variant="warning" className="text-base">Em Revisão</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-lg font-semibold">Empresas do Lote</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-neutral-900">Construtora ABC Ltda</p>
                  <p className="text-sm text-neutral-500">145 funcionários</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-neutral-900">R$ 0,00</p>
                <Badge variant="success">Aprovado</Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-neutral-900">Engenharia XYZ S/A</p>
                  <p className="text-sm text-neutral-500">0 funcionários</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-neutral-900">R$ 0,00</p>
                <Badge variant="danger">Pendente</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Exportar</Button>
        <Button>Aprovar Lote</Button>
      </div>
    </div>
  );
}
