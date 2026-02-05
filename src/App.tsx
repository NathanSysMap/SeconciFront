import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from './core/auth/AuthContext';
import { ProtectedRoute, ScopeRoute } from './components/guards/RouteGuards';
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
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

            <Route
              path="/portal"
              element={
                <ProtectedRoute>
                  <ScopeRoute scope="PORTAL">
                    <PortalHome />
                  </ScopeRoute>
                </ProtectedRoute>
              }
            />
            <Route path="/portal/atualizacao-lote" element={<ProtectedRoute><ScopeRoute scope="PORTAL"><BatchUpdate /></ScopeRoute></ProtectedRoute>} />
            <Route path="/portal/atualizacao-individual" element={<ProtectedRoute><ScopeRoute scope="PORTAL"><IndividualUpdate /></ScopeRoute></ProtectedRoute>} />
            <Route path="/portal/eventos-folha" element={<ProtectedRoute><ScopeRoute scope="PORTAL"><PayrollEvents /></ScopeRoute></ProtectedRoute>} />
            <Route path="/portal/calculo-automatico" element={<ProtectedRoute><ScopeRoute scope="PORTAL"><AutomaticBilling /></ScopeRoute></ProtectedRoute>} />
            <Route path="/portal/boletos" element={<ProtectedRoute><ScopeRoute scope="PORTAL"><Boletos /></ScopeRoute></ProtectedRoute>} />
            <Route path="/portal/nfse" element={<ProtectedRoute><ScopeRoute scope="PORTAL"><NFSe /></ScopeRoute></ProtectedRoute>} />
            <Route path="/portal/relatorios-movimentacao" element={<ProtectedRoute><ScopeRoute scope="PORTAL"><MovementReports /></ScopeRoute></ProtectedRoute>} />
            <Route path="/portal/campanhas" element={<ProtectedRoute><ScopeRoute scope="PORTAL"><IncentiveCampaigns /></ScopeRoute></ProtectedRoute>} />
            <Route path="/portal/relatorios" element={<ProtectedRoute><ScopeRoute scope="PORTAL"><PortalReports /></ScopeRoute></ProtectedRoute>} />
            <Route path="/portal/alertas" element={<ProtectedRoute><ScopeRoute scope="PORTAL"><Alerts /></ScopeRoute></ProtectedRoute>} />

            <Route path="/contratos" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><ContratosHome /></ScopeRoute></ProtectedRoute>} />
            <Route path="/contratos/empresas" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><Companies /></ScopeRoute></ProtectedRoute>} />
            <Route path="/contratos/funcionarios" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><Employees /></ScopeRoute></ProtectedRoute>} />
            <Route path="/contratos/dependentes" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><Dependents /></ScopeRoute></ProtectedRoute>} />
            <Route path="/contratos/regras" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><BillingRules /></ScopeRoute></ProtectedRoute>} />
            <Route path="/contratos/vigencias" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><ContractValidities /></ScopeRoute></ProtectedRoute>} />
            <Route path="/contratos/locais-regras" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><WorkLocationBillingRules /></ScopeRoute></ProtectedRoute>} />

            <Route path="/faturamento" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><FaturamentoHome /></ScopeRoute></ProtectedRoute>} />
            <Route path="/faturamento/atualizacao-regras" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><CompanyRuleUpdate /></ScopeRoute></ProtectedRoute>} />
            <Route path="/faturamento/aplicacao-penalidades" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><PenaltyApplication /></ScopeRoute></ProtectedRoute>} />
            <Route path="/faturamento/ajustes-folha" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><PayrollAdjustments /></ScopeRoute></ProtectedRoute>} />
            <Route path="/faturamento/amostragem" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><SamplingGroups /></ScopeRoute></ProtectedRoute>} />
            <Route path="/faturamento/transferencia-modo" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><SamplingGroups /></ScopeRoute></ProtectedRoute>} />
            <Route path="/faturamento/parametros-manuais" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><ManualBillingParams /></ScopeRoute></ProtectedRoute>} />
            <Route path="/faturamento/lotes" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><BillingBatches /></ScopeRoute></ProtectedRoute>} />
            <Route path="/faturamento/parametros-exportacao" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><ExportParameters /></ScopeRoute></ProtectedRoute>} />
            <Route path="/faturamento/conferencia" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><BillingReview /></ScopeRoute></ProtectedRoute>} />
            <Route path="/faturamento/grupos" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><EconomicGroups /></ScopeRoute></ProtectedRoute>} />
            <Route path="/faturamento/alertas" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><BillingAlerts /></ScopeRoute></ProtectedRoute>} />
            <Route path="/faturamento/pisos" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><CategoryMinimums /></ScopeRoute></ProtectedRoute>} />
            <Route path="/faturamento/penalidades" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><Penalties /></ScopeRoute></ProtectedRoute>} />
            <Route path="/faturamento/parametros" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><CalculationParameters /></ScopeRoute></ProtectedRoute>} />
            <Route path="/faturamento/importacoes" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><ComplementaryImports /></ScopeRoute></ProtectedRoute>} />

            <Route path="/relatorios/dashboard" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><ReportsDashboard /></ScopeRoute></ProtectedRoute>} />
            <Route path="/relatorios/integracoes" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><Integrations /></ScopeRoute></ProtectedRoute>} />
            <Route path="/relatorios/sobre" element={<ProtectedRoute><ScopeRoute scope="BACKOFFICE"><About /></ScopeRoute></ProtectedRoute>} />
          </Routes>
          <Toaster position="top-right" />
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
