import { Scope } from './types';

export interface RoutePermission {
  scope: Scope;
  permissions: string[];
}

export const ROUTE_PERMISSIONS: Record<string, RoutePermission> = {
  '/portal': {
    scope: 'PORTAL',
    permissions: ['PORTAL.PORTAL.VIEW'],
  },
  '/portal/atualizacao-lote': {
    scope: 'PORTAL',
    permissions: ['PORTAL.CADASTRO_LOTE.UPLOAD'],
  },
  '/portal/atualizacao-individual': {
    scope: 'PORTAL',
    permissions: ['PORTAL.CADASTRO_INDIVIDUAL.UPDATE'],
  },
  '/portal/eventos-folha': {
    scope: 'PORTAL',
    permissions: ['PORTAL.PORTAL.VIEW'],
  },
  '/portal/calculo-automatico': {
    scope: 'PORTAL',
    permissions: ['PORTAL.PORTAL.VIEW'],
  },
  '/portal/boletos': {
    scope: 'PORTAL',
    permissions: ['PORTAL.BOLETOS.VIEW'],
  },
  '/portal/nfse': {
    scope: 'PORTAL',
    permissions: ['PORTAL.NFSE.VIEW'],
  },
  '/portal/relatorios-movimentacao': {
    scope: 'PORTAL',
    permissions: ['PORTAL.RELATORIOS.VIEW'],
  },
  '/portal/campanhas': {
    scope: 'PORTAL',
    permissions: ['PORTAL.PORTAL.VIEW'],
  },
  '/portal/relatorios': {
    scope: 'PORTAL',
    permissions: ['PORTAL.RELATORIOS.VIEW'],
  },
  '/portal/alertas': {
    scope: 'PORTAL',
    permissions: ['PORTAL.PORTAL.VIEW'],
  },
  '/contratos': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.CONTRATOS.VIEW'],
  },
  '/contratos/empresas': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.CONTRATOS.VIEW'],
  },
  '/contratos/funcionarios': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.CONTRATOS.VIEW'],
  },
  '/contratos/dependentes': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.CONTRATOS.VIEW'],
  },
  '/contratos/regras': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.CONTRATOS.VIEW'],
  },
  '/contratos/vigencias': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.CONTRATOS.VIEW'],
  },
  '/contratos/locais-regras': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.CONTRATOS.VIEW'],
  },
  '/faturamento': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.FATURAMENTO.VIEW'],
  },
  '/faturamento/atualizacao-regras': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.FATURAMENTO.PARAMETERS_UPDATE'],
  },
  '/faturamento/aplicacao-penalidades': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.FATURAMENTO.EXCEPTIONS_MANAGE'],
  },
  '/faturamento/ajustes-folha': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.FATURAMENTO.EXCEPTIONS_MANAGE'],
  },
  '/faturamento/amostragem': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.FATURAMENTO.PARAMETERS_UPDATE'],
  },
  '/faturamento/transferencia-modo': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.FATURAMENTO.PARAMETERS_UPDATE'],
  },
  '/faturamento/parametros-manuais': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.FATURAMENTO.PARAMETERS_UPDATE'],
  },
  '/faturamento/lotes': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.FATURAMENTO.VIEW'],
  },
  '/faturamento/parametros-exportacao': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.FATURAMENTO.EXPORT'],
  },
  '/faturamento/conferencia': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.FATURAMENTO.CONFERENCE_VIEW'],
  },
  '/faturamento/grupos': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.FATURAMENTO.VIEW'],
  },
  '/faturamento/alertas': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.FATURAMENTO.VIEW'],
  },
  '/faturamento/pisos': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.FATURAMENTO.PARAMETERS_UPDATE'],
  },
  '/faturamento/penalidades': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.FATURAMENTO.PARAMETERS_UPDATE'],
  },
  '/faturamento/parametros': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.FATURAMENTO.PARAMETERS_UPDATE'],
  },
  '/faturamento/importacoes': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.FATURAMENTO.VIEW'],
  },
  '/relatorios/dashboard': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.RELATORIOS.VIEW'],
  },
  '/relatorios/integracoes': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.INTEGRACOES.VIEW'],
  },
  '/relatorios/sobre': {
    scope: 'BACKOFFICE',
    permissions: ['BACKOFFICE.RELATORIOS.VIEW'],
  },
};

export function getRoutePermission(path: string): RoutePermission | null {
  return ROUTE_PERMISSIONS[path] || null;
}

export function getRoutesByScope(scope: Scope): string[] {
  return Object.entries(ROUTE_PERMISSIONS)
    .filter(([_, config]) => config.scope === scope)
    .map(([path]) => path);
}
