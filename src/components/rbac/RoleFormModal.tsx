import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import type { Role, Scope } from '../../core/rbac/types';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormData) => void;
  role?: Role | null;
  scope: Scope;
  tenantId: string | null;
}

export interface RoleFormData {
  name: string;
  description: string;
}

export function RoleFormModal({ isOpen, onClose, onSubmit, role, scope, tenantId }: RoleFormModalProps) {
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
  });

  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name,
        description: role.description || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
      });
    }
  }, [role, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {role ? 'Editar Perfil' : 'Novo Perfil'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input
            label="Nome do Perfil"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Ex: Operacional, Consulta..."
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Descreva as responsabilidades deste perfil..."
            />
          </div>

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
              {role ? 'Salvar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
