import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Banner } from '../components/ui/Banner';
import { Building2, Users, FileText, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../core/auth/AuthContext';

export default function Dashboard() {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    companies: 0,
    employees: 0,
    pendingInvoices: 0,
    activeAlerts: 0,
  });

  useEffect(() => {
    if (session) {
      if (session.scope === 'PORTAL') {
        navigate('/portal', { replace: true });
      } else if (session.scope === 'BACKOFFICE') {
        navigate('/contratos', { replace: true });
      }
    }
  }, [session, navigate]);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [companiesRes, employeesRes, invoicesRes, alertsRes] = await Promise.all([
      supabase.from('companies').select('id', { count: 'exact', head: true }),
      supabase.from('employees').select('id', { count: 'exact', head: true }),
      supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('alerts').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    ]);

    setStats({
      companies: companiesRes.count || 0,
      employees: employeesRes.count || 0,
      pendingInvoices: invoicesRes.count || 0,
      activeAlerts: alertsRes.count || 0,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">
          Bem-vindo, {session?.name || user?.full_name}
        </h1>
        <p className="text-neutral-600 mt-2">
          Sistema de Faturamento Assistencial - Competência Out/2025
        </p>
      </div>

      <Banner variant="info" title="Janela de Atualização Aberta (Dias 1-10)">
        <p>
          Período de atualização de dados ativo. Empresas podem enviar folhas de pagamento e
          atualizações até o dia 10/10/2025.
        </p>
      </Banner>

      {stats.activeAlerts > 0 && (
        <Banner variant="warning" title={`${stats.activeAlerts} Alertas Ativos`}>
          <p>
            Existem desvios detectados que requerem atenção. Acesse a seção de Alertas para revisar.
          </p>
        </Banner>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Empresas Ativas</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.companies}</p>
              </div>
              <div className="w-12 h-12 bg-brand-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <Building2 className="h-6 w-6 text-brand-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Funcionários</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.employees}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Boletos Pendentes</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.pendingInvoices}</p>
              </div>
              <div className="w-12 h-12 bg-brand-accent bg-opacity-10 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-brand-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Alertas Ativos</p>
                <p className="text-3xl font-bold text-neutral-900 mt-2">{stats.activeAlerts}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold text-neutral-900">Atividades Recentes</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3 pb-4 border-b border-neutral-100">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">
                    Atualização em lote processada
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Construtora ABC Ltda - 145 funcionários atualizados
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">Há 2 horas</p>
                </div>
                <Badge variant="success">Concluído</Badge>
              </div>

              <div className="flex items-start gap-3 pb-4 border-b border-neutral-100">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">
                    Boleto gerado
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Engenharia XYZ S/A - Competência Out/2025
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">Há 4 horas</p>
                </div>
                <Badge variant="info">Novo</Badge>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-neutral-900">
                    Alerta de desvio detectado
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Incorporadora Delta - Redução de 15% na base
                  </p>
                  <p className="text-xs text-neutral-400 mt-1">Há 6 horas</p>
                </div>
                <Badge variant="warning">Atenção</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold text-neutral-900">Próximas Ações</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <p className="font-medium text-yellow-900">Encerramento da Janela 1-10</p>
                </div>
                <p className="text-sm text-yellow-800">
                  Período de atualização encerra em 3 dias. Empresas devem enviar pendências.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <p className="font-medium text-blue-900">Fechamento de Lote</p>
                </div>
                <p className="text-sm text-blue-800">
                  Dia 15/10 - Conferência e envio de lotes para geração de boletos.
                </p>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-5 w-5 text-red-600" />
                  <p className="font-medium text-red-900">Vencimento de Boletos</p>
                </div>
                <p className="text-sm text-red-800">
                  Dia 30/10 - Vencimento dos boletos da competência Out/2025.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
