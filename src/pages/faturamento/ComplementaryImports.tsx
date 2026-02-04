import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Upload, FileText } from 'lucide-react';

export default function ComplementaryImports() {
  const importTypes = [
    { name: 'Carteirinhas', description: 'Importação de dados de carteirinhas emitidas' },
    { name: 'Dependentes', description: 'Atualização de cadastro de dependentes' },
    { name: 'Afastados', description: 'Lista de funcionários afastados' },
    { name: 'Estagiários', description: 'Cadastro de estagiários' },
    { name: 'Pró-Labore', description: 'Valores de pró-labore de sócios' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Importações Complementares</h1>
        <p className="text-neutral-600 mt-1">
          Importação de dados adicionais para o faturamento
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {importTypes.map((type) => (
          <Card key={type.name} variant="elevated">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-brand-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900">{type.name}</h3>
                  <p className="text-sm text-neutral-500">{type.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                Importar Arquivo
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
