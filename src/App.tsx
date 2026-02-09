import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './core/auth/AuthContext';
import { RouteAccessGuard } from './components/routing/RouteAccessGuard';
import Login from './pages/Login';
import Forbidden from './pages/Forbidden';
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
import AdminRoles from './pages/admin/AdminRoles';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserOverrides from './pages/admin/AdminUserOverrides';
import PortalAdminRoles from './pages/portal/admin/PortalAdminRoles';
import PortalAdminUsers from './pages/portal/admin/PortalAdminUsers';
import PortalAdminUserOverrides from './pages/portal/admin/PortalAdminUserOverrides';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forbidden" element={<Forbidden />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<RouteAccessGuard><Dashboard /></RouteAccessGuard>} />

            <Route path="/portal" element={<RouteAccessGuard><PortalHome /></RouteAccessGuard>} />
            <Route path="/portal/atualizacao-lote" element={<RouteAccessGuard><BatchUpdate /></RouteAccessGuard>} />
            <Route path="/portal/atualizacao-individual" element={<RouteAccessGuard><IndividualUpdate /></RouteAccessGuard>} />
            <Route path="/portal/eventos-folha" element={<RouteAccessGuard><PayrollEvents /></RouteAccessGuard>} />
            <Route path="/portal/calculo-automatico" element={<RouteAccessGuard><AutomaticBilling /></RouteAccessGuard>} />
            <Route path="/portal/boletos" element={<RouteAccessGuard><Boletos /></RouteAccessGuard>} />
            <Route path="/portal/nfse" element={<RouteAccessGuard><NFSe /></RouteAccessGuard>} />
            <Route path="/portal/relatorios-movimentacao" element={<RouteAccessGuard><MovementReports /></RouteAccessGuard>} />
            <Route path="/portal/campanhas" element={<RouteAccessGuard><IncentiveCampaigns /></RouteAccessGuard>} />
            <Route path="/portal/relatorios" element={<RouteAccessGuard><PortalReports /></RouteAccessGuard>} />
            <Route path="/portal/alertas" element={<RouteAccessGuard><Alerts /></RouteAccessGuard>} />
            <Route path="/portal/admin/roles" element={<RouteAccessGuard><PortalAdminRoles /></RouteAccessGuard>} />
            <Route path="/portal/admin/users" element={<RouteAccessGuard><PortalAdminUsers /></RouteAccessGuard>} />
            <Route path="/portal/admin/users/overrides" element={<RouteAccessGuard><PortalAdminUserOverrides /></RouteAccessGuard>} />

            <Route path="/contratos" element={<RouteAccessGuard><ContratosHome /></RouteAccessGuard>} />
            <Route path="/contratos/empresas" element={<RouteAccessGuard><Companies /></RouteAccessGuard>} />
            <Route path="/contratos/funcionarios" element={<RouteAccessGuard><Employees /></RouteAccessGuard>} />
            <Route path="/contratos/dependentes" element={<RouteAccessGuard><Dependents /></RouteAccessGuard>} />
            <Route path="/contratos/regras" element={<RouteAccessGuard><BillingRules /></RouteAccessGuard>} />
            <Route path="/contratos/vigencias" element={<RouteAccessGuard><ContractValidities /></RouteAccessGuard>} />
            <Route path="/contratos/locais-regras" element={<RouteAccessGuard><WorkLocationBillingRules /></RouteAccessGuard>} />

            <Route path="/faturamento" element={<RouteAccessGuard><FaturamentoHome /></RouteAccessGuard>} />
            <Route path="/faturamento/atualizacao-regras" element={<RouteAccessGuard><CompanyRuleUpdate /></RouteAccessGuard>} />
            <Route path="/faturamento/aplicacao-penalidades" element={<RouteAccessGuard><PenaltyApplication /></RouteAccessGuard>} />
            <Route path="/faturamento/ajustes-folha" element={<RouteAccessGuard><PayrollAdjustments /></RouteAccessGuard>} />
            <Route path="/faturamento/amostragem" element={<RouteAccessGuard><SamplingGroups /></RouteAccessGuard>} />
            <Route path="/faturamento/transferencia-modo" element={<RouteAccessGuard><SamplingGroups /></RouteAccessGuard>} />
            <Route path="/faturamento/parametros-manuais" element={<RouteAccessGuard><ManualBillingParams /></RouteAccessGuard>} />
            <Route path="/faturamento/lotes" element={<RouteAccessGuard><BillingBatches /></RouteAccessGuard>} />
            <Route path="/faturamento/parametros-exportacao" element={<RouteAccessGuard><ExportParameters /></RouteAccessGuard>} />
            <Route path="/faturamento/conferencia" element={<RouteAccessGuard><BillingReview /></RouteAccessGuard>} />
            <Route path="/faturamento/grupos" element={<RouteAccessGuard><EconomicGroups /></RouteAccessGuard>} />
            <Route path="/faturamento/alertas" element={<RouteAccessGuard><BillingAlerts /></RouteAccessGuard>} />
            <Route path="/faturamento/pisos" element={<RouteAccessGuard><CategoryMinimums /></RouteAccessGuard>} />
            <Route path="/faturamento/penalidades" element={<RouteAccessGuard><Penalties /></RouteAccessGuard>} />
            <Route path="/faturamento/parametros" element={<RouteAccessGuard><CalculationParameters /></RouteAccessGuard>} />
            <Route path="/faturamento/importacoes" element={<RouteAccessGuard><ComplementaryImports /></RouteAccessGuard>} />

            <Route path="/relatorios/dashboard" element={<RouteAccessGuard><ReportsDashboard /></RouteAccessGuard>} />
            <Route path="/relatorios/integracoes" element={<RouteAccessGuard><Integrations /></RouteAccessGuard>} />
            <Route path="/relatorios/sobre" element={<RouteAccessGuard><About /></RouteAccessGuard>} />

            <Route path="/admin/roles" element={<RouteAccessGuard><AdminRoles /></RouteAccessGuard>} />
            <Route path="/admin/users" element={<RouteAccessGuard><AdminUsers /></RouteAccessGuard>} />
            <Route path="/admin/users/overrides" element={<RouteAccessGuard><AdminUserOverrides /></RouteAccessGuard>} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
