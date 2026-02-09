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
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
          <h2 className="text-2xl font-bold text-gray-900">
            {role ? 'Editar Perfil' : 'Novo Perfil'}
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
              label="Nome do Perfil"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Ex: Operacional, Consulta..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Escolha um nome claro e descritivo para o perfil
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Descreva as responsabilidades e objetivos deste perfil..."
            />
            <p className="mt-1 text-xs text-gray-500">
              Explique quais usuários devem receber este perfil
            </p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">Informações do Perfil</span>
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
              {role ? 'Salvar Alterações' : 'Criar Perfil'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
