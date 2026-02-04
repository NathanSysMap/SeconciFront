import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './lib/auth-context';
import { AppShell } from './components/layout/AppShell';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PortalHome from './pages/portal/PortalHome';
import ContratosHome from './pages/contratos/ContratosHome';
import FaturamentoHome from './pages/faturamento/FaturamentoHome';
import Companies from './pages/contratos/Companies';
import Employees from './pages/contratos/Employees';
import Dependents from './pages/contratos/Dependents';
import BillingRules from './pages/contratos/BillingRules';
import ContractValidities from './pages/contratos/ContractValidities';
import WorkLocationBillingRules from './pages/contratos/WorkLocationBillingRules';
import BatchUpdate from './pages/portal/BatchUpdate';
import IndividualUpdate from './pages/portal/IndividualUpdate';
import PayrollEvents from './pages/portal/PayrollEvents';
import Boletos from './pages/portal/Boletos';
import NFSe from './pages/portal/NFSe';
import PortalReports from './pages/portal/Reports';
import Alerts from './pages/portal/Alerts';
import MovementReports from './pages/portal/MovementReports';
import IncentiveCampaigns from './pages/portal/IncentiveCampaigns';
import AutomaticBilling from './pages/portal/AutomaticBilling';
import CategoryMinimums from './pages/faturamento/CategoryMinimums';
import Penalties from './pages/faturamento/Penalties';
import CalculationParameters from './pages/faturamento/CalculationParameters';
import ComplementaryImports from './pages/faturamento/ComplementaryImports';
import BillingBatches from './pages/faturamento/BillingBatches';
import BillingReview from './pages/faturamento/BillingReview';
import EconomicGroups from './pages/faturamento/EconomicGroups';
import CompanyRuleUpdate from './pages/faturamento/CompanyRuleUpdate';
import PenaltyApplication from './pages/faturamento/PenaltyApplication';
import PayrollAdjustments from './pages/faturamento/PayrollAdjustments';
import SamplingGroups from './pages/faturamento/SamplingGroups';
import ManualBillingParams from './pages/faturamento/ManualBillingParams';
import ExportParameters from './pages/faturamento/ExportParameters';
import BillingAlerts from './pages/faturamento/BillingAlerts';
import ReportsDashboard from './pages/relatorios/Dashboard';
import Integrations from './pages/relatorios/Integrations';
import About from './pages/relatorios/About';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <AppShell>{children}</AppShell>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            <Route path="/portal" element={<ProtectedRoute><PortalHome /></ProtectedRoute>} />
            <Route path="/portal/atualizacao-lote" element={<ProtectedRoute><BatchUpdate /></ProtectedRoute>} />
            <Route path="/portal/atualizacao-individual" element={<ProtectedRoute><IndividualUpdate /></ProtectedRoute>} />
            <Route path="/portal/eventos-folha" element={<ProtectedRoute><PayrollEvents /></ProtectedRoute>} />
            <Route path="/portal/calculo-automatico" element={<ProtectedRoute><AutomaticBilling /></ProtectedRoute>} />
            <Route path="/portal/boletos" element={<ProtectedRoute><Boletos /></ProtectedRoute>} />
            <Route path="/portal/nfse" element={<ProtectedRoute><NFSe /></ProtectedRoute>} />
            <Route path="/portal/relatorios-movimentacao" element={<ProtectedRoute><MovementReports /></ProtectedRoute>} />
            <Route path="/portal/campanhas" element={<ProtectedRoute><IncentiveCampaigns /></ProtectedRoute>} />
            <Route path="/portal/relatorios" element={<ProtectedRoute><PortalReports /></ProtectedRoute>} />
            <Route path="/portal/alertas" element={<ProtectedRoute><Alerts /></ProtectedRoute>} />

            <Route path="/contratos" element={<ProtectedRoute><ContratosHome /></ProtectedRoute>} />
            <Route path="/contratos/empresas" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
            <Route path="/contratos/funcionarios" element={<ProtectedRoute><Employees /></ProtectedRoute>} />
            <Route path="/contratos/dependentes" element={<ProtectedRoute><Dependents /></ProtectedRoute>} />
            <Route path="/contratos/regras" element={<ProtectedRoute><BillingRules /></ProtectedRoute>} />
            <Route path="/contratos/vigencias" element={<ProtectedRoute><ContractValidities /></ProtectedRoute>} />
            <Route path="/contratos/locais-regras" element={<ProtectedRoute><WorkLocationBillingRules /></ProtectedRoute>} />

            <Route path="/faturamento" element={<ProtectedRoute><FaturamentoHome /></ProtectedRoute>} />
            <Route path="/faturamento/atualizacao-regras" element={<ProtectedRoute><CompanyRuleUpdate /></ProtectedRoute>} />
            <Route path="/faturamento/aplicacao-penalidades" element={<ProtectedRoute><PenaltyApplication /></ProtectedRoute>} />
            <Route path="/faturamento/ajustes-folha" element={<ProtectedRoute><PayrollAdjustments /></ProtectedRoute>} />
            <Route path="/faturamento/amostragem" element={<ProtectedRoute><SamplingGroups /></ProtectedRoute>} />
            <Route path="/faturamento/transferencia-modo" element={<ProtectedRoute><SamplingGroups /></ProtectedRoute>} />
            <Route path="/faturamento/parametros-manuais" element={<ProtectedRoute><ManualBillingParams /></ProtectedRoute>} />
            <Route path="/faturamento/lotes" element={<ProtectedRoute><BillingBatches /></ProtectedRoute>} />
            <Route path="/faturamento/parametros-exportacao" element={<ProtectedRoute><ExportParameters /></ProtectedRoute>} />
            <Route path="/faturamento/conferencia" element={<ProtectedRoute><BillingReview /></ProtectedRoute>} />
            <Route path="/faturamento/grupos" element={<ProtectedRoute><EconomicGroups /></ProtectedRoute>} />
            <Route path="/faturamento/alertas" element={<ProtectedRoute><BillingAlerts /></ProtectedRoute>} />
            <Route path="/faturamento/pisos" element={<ProtectedRoute><CategoryMinimums /></ProtectedRoute>} />
            <Route path="/faturamento/penalidades" element={<ProtectedRoute><Penalties /></ProtectedRoute>} />
            <Route path="/faturamento/parametros" element={<ProtectedRoute><CalculationParameters /></ProtectedRoute>} />
            <Route path="/faturamento/importacoes" element={<ProtectedRoute><ComplementaryImports /></ProtectedRoute>} />

            <Route path="/relatorios/dashboard" element={<ProtectedRoute><ReportsDashboard /></ProtectedRoute>} />
            <Route path="/relatorios/integracoes" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
            <Route path="/relatorios/sobre" element={<ProtectedRoute><About /></ProtectedRoute>} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
