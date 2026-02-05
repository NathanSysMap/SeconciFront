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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Nome completo"
          />

          <Input
            label="E-mail"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="usuario@exemplo.com"
            disabled={!!user}
          />

          <Select
            label="Perfil"
            value={formData.roleId || ''}
            onChange={(e) => setFormData({ ...formData, roleId: e.target.value || null })}
          >
            <option value="">Sem perfil</option>
            {availableRoles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>

          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Escopo:</strong> {scope === 'BACKOFFICE' ? 'Backoffice' : 'Portal'}
            </p>
            {tenantId && (
              <p className="text-sm text-gray-600">
                <strong>Tenant:</strong> {tenantId}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary">
              {user ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
