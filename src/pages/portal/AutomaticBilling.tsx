import { useState, useEffect } from 'react';
import { Calculator, FileText, CheckCircle, AlertTriangle, Download, Lock, Unlock } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Modal, ModalContent, ModalFooter } from '../../components/ui/Modal';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../lib/auth-context';
import { toast } from 'sonner';

interface CalculationPreview {
  base_amount: number;
  dependents_amount: number;
  absent_amount: number;
  penalties_amount: number;
  adjustments_amount: number;
  campaign_benefit_amount: number;
  discounts_amount: number;
  total_amount: number;
  components_breakdown: any;
  validation_results: any;
  passed_validation: boolean;
  blocking_issues: any[];
}

export default function AutomaticBilling() {
  const { user } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [preview, setPreview] = useState<CalculationPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [globalEnabled, setGlobalEnabled] = useState(false);
  const [companyEnabled, setCompanyEnabled] = useState(true);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    loadConfig();
    loadRequests();
  }, []);

  const loadConfig = async () => {
    const { data: globalConfig } = await supabase
      .from('automatic_billing_config')
      .select('*')
      .is('company_id', null)
      .single();

    if (globalConfig) {
      setGlobalEnabled(globalConfig.global_enabled);
    }

    if (user?.company_id) {
      const { data: companyConfig } = await supabase
        .from('automatic_billing_config')
        .select('*')
        .eq('company_id', user.company_id)
        .single();

      if (companyConfig) {
        setCompanyEnabled(companyConfig.company_enabled);
      }
    }
  };

  const loadRequests = async () => {
    if (!user?.company_id) return;

    const { data } = await supabase
      .from('billing_requests')
      .select('*')
      .eq('company_id', user.company_id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setRequests(data);
  };

  const calculatePreview = async () => {
    if (!user?.company_id) return;

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('calculate_billing_preview', {
        p_company_id: user.company_id,
        p_reference_month: selectedMonth + '-01'
      });

      if (error) throw error;

      setPreview(data);
      setShowPreviewModal(true);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao calcular prévia');
    } finally {
      setLoading(false);
    }
  };

  const confirmAndIssue = async () => {
    if (!preview || !user?.company_id) return;

    if (!globalEnabled) {
      toast.error('Emissão automática está desabilitada pelo Seconci-SP');
      return;
    }

    if (!companyEnabled) {
      toast.error('Emissão automática está desabilitada para sua empresa');
      return;
    }

    if (!preview.passed_validation) {
      toast.error('Existem pendências que impedem a emissão');
      return;
    }

    setLoading(true);
    try {
      const { data: calcData, error: calcError } = await supabase
        .from('billing_calculations')
        .insert({
          company_id: user.company_id,
          reference_month: selectedMonth + '-01',
          calculation_type: 'final',
          ...preview,
          confirmed_by: user.id,
          confirmed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (calcError) throw calcError;

      const { data: requestData, error: requestError } = await supabase
        .from('billing_requests')
        .insert({
          company_id: user.company_id,
          reference_month: selectedMonth + '-01',
          calculation_id: calcData.id,
          request_type: 'issuance',
          amount: preview.total_amount,
          requested_by: user.id
        })
        .select()
        .single();

      if (requestError) throw requestError;

      toast.success('Solicitação de emissão enviada com sucesso!');
      setShowPreviewModal(false);
      setPreview(null);
      await loadRequests();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao confirmar emissão');
    } finally {
      setLoading(false);
    }
  };

  const canIssue = globalEnabled && companyEnabled;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Cálculo e Emissão Automática</h1>
        <p className="text-neutral-600 mt-1">
          Calcule seu faturamento e emita boletos automaticamente
        </p>
      </div>

      <Card variant="elevated">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              {canIssue ? (
                <Unlock className="h-8 w-8 text-green-600" />
              ) : (
                <Lock className="h-8 w-8 text-red-600" />
              )}
              <div>
                <p className="font-semibold text-neutral-900">
                  Emissão Automática: {canIssue ? 'HABILITADA' : 'DESABILITADA'}
                </p>
                <p className="text-sm text-neutral-600">
                  {!globalEnabled && 'Função desabilitada pelo Seconci-SP'}
                  {globalEnabled && !companyEnabled && 'Função desabilitada para sua empresa'}
                  {canIssue && 'Você pode emitir boletos automaticamente'}
                </p>
              </div>
            </div>
            <Badge variant={canIssue ? 'success' : 'error'}>
              {canIssue ? 'ATIVO' : 'INATIVO'}
            </Badge>
          </div>

          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Selecione a Competência
              </label>
              <Input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              />
            </div>
            <Button onClick={calculatePreview} loading={loading} size="lg">
              <Calculator className="h-4 w-4 mr-2" />
              Calcular Prévia
            </Button>
          </div>
        </CardContent>
      </Card>

      {requests.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <h3 className="text-lg font-semibold">Histórico de Solicitações</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-neutral-400" />
                    <div>
                      <p className="font-medium text-neutral-900">
                        {new Date(request.reference_month).toLocaleDateString('pt-BR', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-neutral-500">
                        Solicitado em {new Date(request.requested_at).toLocaleDateString('pt-BR')}
                      </p>
                      {request.protocol && (
                        <p className="text-xs text-neutral-400">Protocolo: {request.protocol}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-neutral-900">
                      R$ {Number(request.amount).toFixed(2)}
                    </p>
                    <Badge
                      variant={
                        request.request_status === 'issued'
                          ? 'success'
                          : request.request_status === 'error'
                          ? 'error'
                          : 'warning'
                      }
                    >
                      {request.request_status === 'issued' && 'Emitido'}
                      {request.request_status === 'pending' && 'Pendente'}
                      {request.request_status === 'processing' && 'Processando'}
                      {request.request_status === 'error' && 'Erro'}
                      {request.request_status === 'cancelled' && 'Cancelado'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title="Prévia do Faturamento"
        size="xl"
      >
        {preview && (
          <>
            <ModalContent>
              <div className="space-y-6">
                {!preview.passed_validation && preview.blocking_issues?.length > 0 && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div>
                        <p className="font-semibold text-red-900">Pendências Bloqueantes</p>
                        <ul className="mt-2 space-y-1">
                          {preview.blocking_issues.map((issue, idx) => (
                            <li key={idx} className="text-sm text-red-700">• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">Base</p>
                    <p className="text-xl font-bold text-neutral-900">
                      R$ {preview.base_amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">Dependentes</p>
                    <p className="text-xl font-bold text-neutral-900">
                      R$ {preview.dependents_amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">Afastados</p>
                    <p className="text-xl font-bold text-neutral-900">
                      R$ {preview.absent_amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="p-4 bg-neutral-50 rounded-lg">
                    <p className="text-sm text-neutral-600">Penalidades</p>
                    <p className="text-xl font-bold text-red-600">
                      R$ {preview.penalties_amount.toFixed(2)}
                    </p>
                  </div>
                  {preview.campaign_benefit_amount > 0 && (
                    <div className="p-4 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">Benefício de Campanha</p>
                      <p className="text-xl font-bold text-green-700">
                        - R$ {preview.campaign_benefit_amount.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="p-6 bg-brand-primary bg-opacity-10 border-2 border-brand-primary rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-lg font-semibold text-brand-primary">Total a Pagar</p>
                    <p className="text-3xl font-bold text-brand-primary">
                      R$ {preview.total_amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </ModalContent>
            <ModalFooter>
              <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
                Cancelar
              </Button>
              {canIssue && preview.passed_validation ? (
                <Button onClick={confirmAndIssue} loading={loading}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar e Emitir Boleto
                </Button>
              ) : (
                <Button disabled>
                  Emissão Bloqueada
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
}
