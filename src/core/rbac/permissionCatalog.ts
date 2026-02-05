import { Permission, Scope } from './types';

export const PERMISSIONS: Permission[] = [
  {
    key: 'BACKOFFICE.ADMIN.MANAGE_USERS',
    scope: 'BACKOFFICE',
    module: 'ADMIN',
    action: 'MANAGE_USERS',
    description: 'Gerenciar usuários do sistema',
  },
  {
    key: 'BACKOFFICE.CLIENTES.VIEW',
    scope: 'BACKOFFICE',
    module: 'CLIENTES',
    action: 'VIEW',
    description: 'Visualizar clientes',
  },
  {
    key: 'BACKOFFICE.CLIENTES.CREATE',
    scope: 'BACKOFFICE',
    module: 'CLIENTES',
    action: 'CREATE',
    description: 'Criar novos clientes',
  },
  {
    key: 'BACKOFFICE.CLIENTES.UPDATE',
    scope: 'BACKOFFICE',
    module: 'CLIENTES',
    action: 'UPDATE',
    description: 'Atualizar dados de clientes',
  },
  {
    key: 'BACKOFFICE.CLIENTES.DELETE',
    scope: 'BACKOFFICE',
    module: 'CLIENTES',
    action: 'DELETE',
    description: 'Excluir clientes',
  },
  {
    key: 'BACKOFFICE.CONTRATOS.VIEW',
    scope: 'BACKOFFICE',
    module: 'CONTRATOS',
    action: 'VIEW',
    description: 'Visualizar contratos',
  },
  {
    key: 'BACKOFFICE.CONTRATOS.CREATE',
    scope: 'BACKOFFICE',
    module: 'CONTRATOS',
    action: 'CREATE',
    description: 'Criar novos contratos',
  },
  {
    key: 'BACKOFFICE.CONTRATOS.UPDATE',
    scope: 'BACKOFFICE',
    module: 'CONTRATOS',
    action: 'UPDATE',
    description: 'Atualizar contratos',
  },
  {
    key: 'BACKOFFICE.CONTRATOS.DELETE',
    scope: 'BACKOFFICE',
    module: 'CONTRATOS',
    action: 'DELETE',
    description: 'Excluir contratos',
  },
  {
    key: 'BACKOFFICE.FATURAMENTO.VIEW',
    scope: 'BACKOFFICE',
    module: 'FATURAMENTO',
    action: 'VIEW',
    description: 'Visualizar faturamento',
  },
  {
    key: 'BACKOFFICE.FATURAMENTO.RUN',
    scope: 'BACKOFFICE',
    module: 'FATURAMENTO',
    action: 'RUN',
    description: 'Executar faturamento',
  },
  {
    key: 'BACKOFFICE.FATURAMENTO.PARAMETERS_UPDATE',
    scope: 'BACKOFFICE',
    module: 'FATURAMENTO',
    action: 'PARAMETERS_UPDATE',
    description: 'Atualizar parâmetros de faturamento',
  },
  {
    key: 'BACKOFFICE.FATURAMENTO.EXCEPTIONS_MANAGE',
    scope: 'BACKOFFICE',
    module: 'FATURAMENTO',
    action: 'EXCEPTIONS_MANAGE',
    description: 'Gerenciar exceções de faturamento',
  },
  {
    key: 'BACKOFFICE.FATURAMENTO.CONFERENCE_VIEW',
    scope: 'BACKOFFICE',
    module: 'FATURAMENTO',
    action: 'CONFERENCE_VIEW',
    description: 'Visualizar conferência de faturamento',
  },
  {
    key: 'BACKOFFICE.FATURAMENTO.CONFERENCE_APPROVE',
    scope: 'BACKOFFICE',
    module: 'FATURAMENTO',
    action: 'CONFERENCE_APPROVE',
    description: 'Aprovar conferência de faturamento',
  },
  {
    key: 'BACKOFFICE.FATURAMENTO.EXPORT',
    scope: 'BACKOFFICE',
    module: 'FATURAMENTO',
    action: 'EXPORT',
    description: 'Exportar dados de faturamento',
  },
  {
    key: 'BACKOFFICE.INTEGRACOES.VIEW',
    scope: 'BACKOFFICE',
    module: 'INTEGRACOES',
    action: 'VIEW',
    description: 'Visualizar integrações',
  },
  {
    key: 'BACKOFFICE.INTEGRACOES.MANAGE',
    scope: 'BACKOFFICE',
    module: 'INTEGRACOES',
    action: 'MANAGE',
    description: 'Gerenciar integrações',
  },
  {
    key: 'BACKOFFICE.MONITORAMENTO.MONITOR',
    scope: 'BACKOFFICE',
    module: 'MONITORAMENTO',
    action: 'MONITOR',
    description: 'Monitorar sistema',
  },
  {
    key: 'BACKOFFICE.FEATURES.AUTO_BOLETO.TOGGLE',
    scope: 'BACKOFFICE',
    module: 'FEATURES',
    action: 'AUTO_BOLETO_TOGGLE',
    description: 'Ativar/desativar boleto automático',
  },
  {
    key: 'BACKOFFICE.RELATORIOS.VIEW',
    scope: 'BACKOFFICE',
    module: 'RELATORIOS',
    action: 'VIEW',
    description: 'Visualizar relatórios',
  },
  {
    key: 'PORTAL.ADMIN.MANAGE_USERS',
    scope: 'PORTAL',
    module: 'ADMIN',
    action: 'MANAGE_USERS',
    description: 'Gerenciar usuários do portal',
  },
  {
    key: 'PORTAL.CADASTRO_LOTE.UPLOAD',
    scope: 'PORTAL',
    module: 'CADASTRO_LOTE',
    action: 'UPLOAD',
    description: 'Fazer upload de cadastro em lote',
  },
  {
    key: 'PORTAL.CADASTRO_LOTE.VALIDATE',
    scope: 'PORTAL',
    module: 'CADASTRO_LOTE',
    action: 'VALIDATE',
    description: 'Validar cadastro em lote',
  },
  {
    key: 'PORTAL.CADASTRO_INDIVIDUAL.UPDATE',
    scope: 'PORTAL',
    module: 'CADASTRO_INDIVIDUAL',
    action: 'UPDATE',
    description: 'Atualizar cadastro individual',
  },
  {
    key: 'PORTAL.BOLETOS.VIEW',
    scope: 'PORTAL',
    module: 'BOLETOS',
    action: 'VIEW',
    description: 'Visualizar boletos',
  },
  {
    key: 'PORTAL.BOLETOS.EMITIR',
    scope: 'PORTAL',
    module: 'BOLETOS',
    action: 'EMITIR',
    description: 'Emitir boletos',
  },
  {
    key: 'PORTAL.BOLETOS.PRORROGAR',
    scope: 'PORTAL',
    module: 'BOLETOS',
    action: 'PRORROGAR',
    description: 'Prorrogar boletos',
  },
  {
    key: 'PORTAL.NFSE.VIEW',
    scope: 'PORTAL',
    module: 'NFSE',
    action: 'VIEW',
    description: 'Visualizar NFSe',
  },
  {
    key: 'PORTAL.NFSE.IMPRIMIR',
    scope: 'PORTAL',
    module: 'NFSE',
    action: 'IMPRIMIR',
    description: 'Imprimir NFSe',
  },
  {
    key: 'PORTAL.RELATORIOS.VIEW',
    scope: 'PORTAL',
    module: 'RELATORIOS',
    action: 'VIEW',
    description: 'Visualizar relatórios',
  },
  {
    key: 'PORTAL.RELATORIOS.EXPORT',
    scope: 'PORTAL',
    module: 'RELATORIOS',
    action: 'EXPORT',
    description: 'Exportar relatórios',
  },
  {
    key: 'PORTAL.SUPORTE.CHAMADOS.CREATE',
    scope: 'PORTAL',
    module: 'SUPORTE',
    action: 'CHAMADOS_CREATE',
    description: 'Criar chamados de suporte',
  },
  {
    key: 'PORTAL.SUPORTE.CHAMADOS.VIEW',
    scope: 'PORTAL',
    module: 'SUPORTE',
    action: 'CHAMADOS_VIEW',
    description: 'Visualizar chamados de suporte',
  },
  {
    key: 'PORTAL.PORTAL.VIEW',
    scope: 'PORTAL',
    module: 'PORTAL',
    action: 'VIEW',
    description: 'Acessar portal do cliente',
  },
];

export function isBackofficePermission(permission: string): boolean {
  return permission.startsWith('BACKOFFICE.');
}

export function isPortalPermission(permission: string): boolean {
  return permission.startsWith('PORTAL.');
}

export function getPermissionsByScope(scope: Scope): Permission[] {
  return PERMISSIONS.filter((p) => p.scope === scope);
}

export function getAllBackofficePermissions(): string[] {
  return PERMISSIONS.filter((p) => p.scope === 'BACKOFFICE').map((p) => p.key);
}

export function getAllPortalPermissions(): string[] {
  return PERMISSIONS.filter((p) => p.scope === 'PORTAL').map((p) => p.key);
}
