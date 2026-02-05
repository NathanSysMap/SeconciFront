import { useState, useEffect } from 'react';
import { Gift, Calendar, CheckCircle, Award } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../core/auth/AuthContext';
import { toast } from 'sonner';

interface Campaign {
  id: string;
  name: string;
  description: string;
  valid_from: string;
  valid_until: string;
  benefit_type: string;
  benefit_value: number;
  eligibility_rules: any;
  status: string;
}

interface Eligibility {
  campaign_id: string;
  eligible: boolean;
  awarded: boolean;
  benefit_amount: number;
  criteria_met: any;
  decision_log: any;
}

export default function IncentiveCampaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [eligibility, setEligibility] = useState<Record<string, Eligibility>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    setLoading(true);

    const { data: campaignsData } = await supabase
      .from('incentive_campaigns')
      .select('*')
      .eq('status', 'active')
      .order('valid_from', { ascending: false });

    if (campaignsData) {
      setCampaigns(campaignsData);

      if (user?.company_id) {
        const { data: eligibilityData } = await supabase
          .from('campaign_eligibility')
          .select('*')
          .eq('company_id', user.company_id)
          .in('campaign_id', campaignsData.map(c => c.id));

        if (eligibilityData) {
          const eligMap: Record<string, Eligibility> = {};
          eligibilityData.forEach(e => {
            eligMap[e.campaign_id] = e;
          });
          setEligibility(eligMap);
        }
      }
    }

    setLoading(false);
  };

  const getBenefitLabel = (type: string, value: number) => {
    switch (type) {
      case 'discount_percentage':
        return `${value}% de desconto`;
      case 'discount_fixed':
        return `R$ ${value.toFixed(2)} de desconto`;
      case 'base_reduction':
        return `${value}% de redução na base`;
      case 'informational':
        return 'Benefício informativo';
      default:
        return 'Benefício';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Campanhas de Incentivo</h1>
        <p className="text-neutral-600 mt-1">
          Confira as campanhas ativas e seus benefícios
        </p>
      </div>

      {campaigns.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Gift className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
            <p className="text-neutral-600">Nenhuma campanha ativa no momento</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {campaigns.map((campaign) => {
            const elig = eligibility[campaign.id];
            const isEligible = elig?.eligible;
            const isAwarded = elig?.awarded;

            return (
              <Card key={campaign.id} variant="elevated" className="relative overflow-hidden">
                {isAwarded && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="success">
                      <Award className="h-3 w-3 mr-1" />
                      Contemplado
                    </Badge>
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <Gift className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-neutral-900">{campaign.name}</h3>
                      <p className="text-sm text-neutral-600 mt-1">{campaign.description}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Válida de {new Date(campaign.valid_from).toLocaleDateString('pt-BR')} até{' '}
                        {new Date(campaign.valid_until).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="font-semibold text-green-900 text-lg">
                        {getBenefitLabel(campaign.benefit_type, campaign.benefit_value)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-neutral-700 mb-2">Requisitos:</p>
                      <ul className="space-y-1">
                        {campaign.eligibility_rules?.requirements?.map((req: string, idx: number) => (
                          <li key={idx} className="text-sm text-neutral-600 flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {isEligible && !isAwarded && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">
                          Você é elegível para esta campanha!
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          O benefício será aplicado automaticamente após validação.
                        </p>
                      </div>
                    )}

                    {isAwarded && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-900">
                          Benefício concedido: R$ {elig.benefit_amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Este benefício já foi aplicado ao seu faturamento.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
