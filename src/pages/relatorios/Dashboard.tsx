import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function ReportsDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard de Relatórios</h1>
        <p className="text-neutral-600 mt-1">
          Visão geral e indicadores do sistema
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Faturamento Mensal</p>
                <p className="text-2xl font-bold text-neutral-900 mt-2">R$ 0,00</p>
                <div className="flex items-center gap-1 mt-2 text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">0%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Taxa de Atualização</p>
                <p className="text-2xl font-bold text-neutral-900 mt-2">33%</p>
                <div className="flex items-center gap-1 mt-2 text-red-600">
                  <TrendingDown className="h-4 w-4" />
                  <span className="text-sm font-medium">67% pendente</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-brand-accent bg-opacity-10 rounded-lg flex items-center justify-center">
                <Activity className="h-6 w-6 text-brand-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Empresas Ativas</p>
                <p className="text-2xl font-bold text-neutral-900 mt-2">3</p>
                <p className="text-sm text-neutral-500 mt-2">100% da base</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold">Evolução Mensal</h3>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-neutral-500">
              Gráfico de evolução do faturamento
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold">Distribuição por Convenção</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-700">SINDUSCON</span>
                  <span className="text-sm font-semibold text-neutral-900">67%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div className="bg-brand-primary h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-700">SECOVI</span>
                  <span className="text-sm font-semibold text-neutral-900">33%</span>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2">
                  <div className="bg-brand-accent h-2 rounded-full" style={{ width: '33%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
