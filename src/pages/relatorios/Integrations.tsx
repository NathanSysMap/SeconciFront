import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function Integrations() {
  const integrations = [
    {
      name: 'TOTVS Datasul',
      status: 'connected',
      lastSync: '2025-10-10 08:30',
      records: 145,
    },
    {
      name: 'HIS (Sistema de Saúde)',
      status: 'connected',
      lastSync: '2025-10-10 08:15',
      records: 89,
    },
    {
      name: 'Sistema Financeiro',
      status: 'warning',
      lastSync: '2025-10-09 15:45',
      records: 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Status de Integrações</h1>
        <p className="text-neutral-600 mt-1">
          Monitoramento de integrações e sincronizações
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.name} variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {integration.status === 'connected' && (
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                  )}
                  {integration.status === 'warning' && (
                    <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    </div>
                  )}
                  {integration.status === 'error' && (
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircle className="h-5 w-5 text-red-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-neutral-900">{integration.name}</h3>
                    <p className="text-sm text-neutral-500">
                      Última sincronização: {integration.lastSync}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={integration.status === 'connected' ? 'success' : 'warning'}>
                    {integration.status === 'connected' ? 'Conectado' : 'Atenção'}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-neutral-600">Registros Sincronizados</p>
                  <p className="text-lg font-semibold text-neutral-900">{integration.records}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Fila de Eventos</p>
                  <p className="text-lg font-semibold text-neutral-900">0</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Erros</p>
                  <p className="text-lg font-semibold text-neutral-900">0</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Tempo Médio</p>
                  <p className="text-lg font-semibold text-neutral-900">1.2s</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-lg font-semibold">Histórico de Sincronizações</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Sincronização TOTVS Datasul</p>
                  <p className="text-xs text-neutral-500">2025-10-10 08:30</p>
                </div>
              </div>
              <Badge variant="success">145 registros</Badge>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-neutral-900">Sincronização HIS</p>
                  <p className="text-xs text-neutral-500">2025-10-10 08:15</p>
                </div>
              </div>
              <Badge variant="success">89 registros</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
