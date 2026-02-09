import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { ManagedUser, Role, Scope } from '../../core/rbac/types';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  user?: ManagedUser | null;
  scope: Scope;
  tenantId: string | null;
  availableRoles: Role[];
}

export interface UserFormData {
  name: string;
  email: string;
  roleId: string | null;
}

export function UserFormModal({
  isOpen,
  onClose,
  onSubmit,
  user,
  scope,
  tenantId,
  availableRoles
}: UserFormModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    roleId: null,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        roleId: user.roleId,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        roleId: null,
      });
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <h2 className="text-2xl font-bold text-gray-900">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <Input
              label="Nome Completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Nome completo do usuário"
            />
            <p className="mt-1 text-xs text-gray-500">
              Informe o nome completo para identificação
            </p>
          </div>

          <div>
            <Input
              label="E-mail"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              placeholder="usuario@exemplo.com"
              disabled={!!user}
            />
            {user ? (
              <p className="mt-1 text-xs text-amber-600">
                O e-mail não pode ser alterado após a criação
              </p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Este e-mail será usado para login no sistema
              </p>
            )}
          </div>

          <div>
            <Select
              label="Perfil de Acesso"
              value={formData.roleId || ''}
              onChange={(e) => setFormData({ ...formData, roleId: e.target.value || null })}
            >
              <option value="">Sem perfil (nenhuma permissão)</option>
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
            <p className="mt-1 text-xs text-gray-500">
              O perfil define as permissões básicas do usuário
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">Informações do Usuário</span>
            </div>
            <div className="space-y-1 ml-4">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Escopo:</span>{' '}
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  scope === 'BACKOFFICE'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {scope === 'BACKOFFICE' ? 'Backoffice' : 'Portal'}
                </span>
              </p>
              {tenantId && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Tenant:</span> {tenantId}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" className="shadow-sm">
              {user ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
