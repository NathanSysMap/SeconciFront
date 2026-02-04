# Seconci-SP - Sistema de Faturamento Assistencial

Sistema corporativo completo para gestão de faturamento assistencial do Seconci-SP, atendendo aos requisitos da RFP para três domínios funcionais: Gestão de Contratos, Portal do Cliente e Faturamento.

## Estrutura do Sistema

### Módulos Implementados

#### 1. Gestão de Contratos (`/contratos`)
- **Empresas**: Cadastro completo com CNPJ, convenção, grupo econômico, contato. Modal funcional com validação Zod e integração Supabase.
- **Funcionários**: Gestão completa vinculada a empresas com CPF, matrícula, categoria, salário, datas de admissão/demissão. Modal funcional com seleção de empresa.
- **Dependentes**: Cadastro de dependentes vinculados a funcionários com CPF, grau de parentesco, data de nascimento. Modal funcional com seleção de funcionário e empresa.
- **Regras de Faturamento**: Configuração versionada por convenção/local com vigências
- **Vigências**: Timeline de contratos e impacto de regras

**Fluxo de Cadastros Interconectados:**
1. Cadastrar Empresa → 2. Cadastrar Funcionário (vinculado à Empresa) → 3. Cadastrar Dependente (vinculado ao Funcionário)

#### 2. Portal do Cliente (`/portal`)
- **Atualização em Lote**: Wizard para upload de eSocial, FGTS Digital, Excel e TXT com validações
- **Atualização Individual**: Formulário para cadastro manual de funcionários
- **Boletos**: Listagem, impressão e prorrogação de boletos
- **NFSe**: Consulta e download de notas fiscais eletrônicas
- **Relatórios**: Extratos, memória de cálculo, acompanhamento da base
- **Alertas**: Desvios detectados automaticamente (base, valores, movimentação)

#### 3. Faturamento (`/faturamento`)
- **Pisos por Categoria**: CRUD de valores mínimos por categoria profissional
- **Penalidades**: Gestão de penalidades (atraso, dados incompletos, redução de base)
- **Parâmetros de Cálculo**: Configuração de percentuais, 13º, dependentes, amostragem 1/12
- **Importações Complementares**: Carteirinhas, dependentes, afastados, estagiários, pró-labore
- **Lotes de Faturamento**: Agrupamento de empresas para geração de boletos
- **Conferência**: Visão 360° do faturamento por competência e empresa
- **Grupos Econômicos**: Consolidação de grupos empresariais

#### 4. Relatórios e Monitoramento (`/relatorios`)
- **Dashboard**: Indicadores-chave, evolução mensal, distribuição por convenção
- **Integrações**: Status de TOTVS Datasul, HIS e Sistema Financeiro

## Stack Tecnológica

- **Frontend**: React 18 + TypeScript + Vite
- **Roteamento**: React Router v6
- **UI**: Tailwind CSS com tema customizado Seconci-SP
- **Componentes**: Biblioteca própria de componentes acessíveis (WCAG 2.1 AA)
- **Tabelas**: TanStack Table com ordenação e paginação
- **Formulários**: React Hook Form + Zod para validação
- **Estado**: TanStack Query para cache e sincronização
- **Database**: Supabase (PostgreSQL) com RLS
- **Notificações**: Sonner para toasts
- **Ícones**: Lucide React

## Identidade Visual

O sistema utiliza as cores oficiais do Seconci-SP:

- **Primary**: #007C92 (azul principal)
- **Accent**: #F47920 (laranja)
- **Neutrals**: Escala de cinzas para backgrounds e textos

## Executando o Projeto

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

O sistema estará disponível em `http://localhost:5173`

### Build de Produção

```bash
npm run build
npm run preview
```

### Lint e Type Check

```bash
npm run lint
npm run typecheck
```

## Autenticação Demo

O sistema possui auto-login configurado para facilitar validação. Ao carregar, você será automaticamente autenticado como:

- **Email**: admin@seconci.org.br
- **Senha**: Seconci@2025
- **Perfil**: Admin Master (acesso completo)

### Perfis Disponíveis

- **Admin Seconci**: Acesso completo a todos os módulos
- **Operacional**: Acesso a contratos, portal e faturamento
- **Empresa/Cliente**: Acesso apenas ao Portal do Cliente

## Base de Dados

### Estrutura Principal

O banco de dados Supabase contém 17 tabelas principais:

- `users` - Usuários do sistema
- `companies` - Empresas conveniadas
- `employees` - Funcionários
- `dependents` - Dependentes
- `billing_rules` - Regras de faturamento
- `contract_validities` - Vigências de contratos
- `calculation_parameters` - Parâmetros de cálculo
- `category_minimums` - Pisos por categoria
- `penalties` - Penalidades
- `batch_updates` - Atualizações em lote
- `billing_batches` - Lotes de faturamento
- `invoices` - Boletos
- `nfse` - Notas fiscais eletrônicas
- `complementary_imports` - Importações complementares
- `economic_groups` - Grupos econômicos
- `alerts` - Alertas e desvios
- `audit_logs` - Auditoria

### Dados de Demonstração

O sistema inclui dados de exemplo:

- 3 empresas (ABC, XYZ, Delta)
- 10 funcionários distribuídos entre as empresas
- 2 dependentes
- 4 boletos (3 pendentes, 1 pago)
- 3 alertas (2 ativos, 1 resolvido)
- 2 lotes de faturamento em rascunho
- Regras de faturamento SINDUSCON e SECOVI
- Pisos por categoria profissional
- Penalidades configuradas

## Funcionalidades Destacadas

### Validação Inteligente (Item 5 RFP)
Sistema de validação automatizada para arquivos enviados, com verificação de consistência e geração de diff.

### Alertas em Tempo Real (Item 29 RFP)
Detecção automática de desvios no momento da atualização:
- Redução significativa da base de funcionários
- Valores fora da faixa esperada
- Dados inconsistentes ou incompletos

### Cálculo Assistencial Completo (Itens 13-22 RFP)
- Aplicação de pisos por categoria
- Penalidades automáticas
- Regras por local de trabalho
- Parâmetros configuráveis (13º, dependentes, amostragem 1/12)
- Transferência automático ↔ manual

### Janelas de Faturamento (Itens 28-32 RFP)
- Banner indicando janela ativa (dias 1-10 e 30)
- Controle de emissão automática de boletos por empresa
- Relatórios de movimentação e campanhas de incentivo

### Conferência 360° (Item 26 RFP)
Visão consolidada por competência com:
- Status de cada empresa
- Valor calculado vs. valor faturado
- Alertas e pendências
- Histórico de ajustes

## Acessibilidade

Todos os componentes seguem padrões WCAG 2.1 AA:

- Navegação por teclado completa
- Indicadores de foco visíveis
- Contraste adequado de cores
- Labels ARIA em elementos interativos
- Suporte a leitores de tela

## Segurança

### Row Level Security (RLS)
Todas as tabelas possuem RLS ativado com políticas restritivas:

- Usuários acessam apenas seus próprios dados
- Validação de permissões por role
- Auditoria de todas as ações

### RBAC
Sistema de controle de acesso baseado em roles:

- Rotas protegidas por permissão
- Ações ocultas conforme perfil
- Logs de auditoria detalhados

## Próximos Passos

Para conectar com APIs reais:

1. Substitua as chamadas `supabase` por endpoints da API
2. Implemente os fluxos de autenticação OAuth2/JWT
3. Configure variáveis de ambiente para URLs de produção
4. Implemente webhooks para integrações TOTVS Datasul e HIS
5. Configure filas de processamento para batch updates
6. Implemente geração real de boletos e NFSe

## Suporte

Para dúvidas ou suporte, contate a equipe de desenvolvimento do Seconci-SP.

---

**Desenvolvido para**: Seconci-SP
**Versão**: 1.0.0
**Data**: Outubro 2025
