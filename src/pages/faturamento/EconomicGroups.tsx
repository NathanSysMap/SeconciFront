import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Plus, Building2 } from 'lucide-react';

export default function EconomicGroups() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Grupos Econômicos</h1>
          <p className="text-neutral-600 mt-1">
            Consolidação e visão agregada de grupos empresariais
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Grupo
        </Button>
      </div>

      <Card variant="elevated">
        <CardHeader>
          <h3 className="text-lg font-semibold">Grupos Cadastrados</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-neutral-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-brand-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Grupo ABC Holdings</h4>
                    <p className="text-sm text-neutral-500">Código: GRP001</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Gerenciar</Button>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-neutral-100">
                <div>
                  <p className="text-sm text-neutral-600">Empresas</p>
                  <p className="text-lg font-semibold text-neutral-900">0</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Funcionários</p>
                  <p className="text-lg font-semibold text-neutral-900">0</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Faturamento</p>
                  <p className="text-lg font-semibold text-neutral-900">R$ 0,00</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
