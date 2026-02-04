import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Save } from 'lucide-react';

export default function CalculationParameters() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Parâmetros de Cálculo</h1>
        <p className="text-neutral-600 mt-1">
          Configuração de percentuais, mínimos e regras de cálculo
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold">Percentuais Básicos</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input label="Percentual Base" type="number" placeholder="2.5" helperText="Percentual aplicado sobre o salário base" />
              <Input label="Percentual Dependentes" type="number" placeholder="1.0" helperText="Percentual adicional por dependente" />
              <Input label="Percentual 13º Salário" type="number" placeholder="1.0" helperText="Percentual sobre o 13º salário" />
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold">Limites e Exceções</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input label="Valor Mínimo Geral" type="number" placeholder="150.00" helperText="Valor mínimo de cobrança" />
              <Input label="Máximo de Dependentes" type="number" placeholder="4" helperText="Número máximo de dependentes considerados" />
              <Input label="Amostragem (1/n)" type="number" placeholder="12" helperText="Fração para cálculo de amostragem" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save className="h-4 w-4 mr-2" />
          Salvar Parâmetros
        </Button>
      </div>
    </div>
  );
}
