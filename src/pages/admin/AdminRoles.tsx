import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { RoleFormModal, RoleFormData } from '../../components/rbac/RoleFormModal';
import { PermissionMatrix } from '../../components/rbac/PermissionMatrix';
import { Modal } from '../../components/ui/Modal';
import type { Role } from '../../core/rbac/types';
import { listRoles, createRole, updateRole, deleteRole } from '../../core/rbac/mockStore';
import { toast } from 'sonner';

export default function AdminRoles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = () => {
    const data = listRoles('BACKOFFICE', null);
    setRoles(data);
  };

  const handleCreate = () => {
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: RoleFormData) => {
    if (editingRole) {
      updateRole(editingRole.id, {
        name: data.name,
        description: data.description,
      });
      toast.success('Perfil atualizado com sucesso!');
    } else {
      createRole({
        name: data.name,
        description: data.description,
        scope: 'BACKOFFICE',
        tenantId: null,
        permissions: [],
      });
      toast.success('Perfil criado com sucesso!');
    }
    setIsFormOpen(false);
    loadRoles();
  };

  const handleDelete = (role: Role) => {
    if (confirm(`Tem certeza que deseja excluir o perfil "${role.name}"?`)) {
      const result = deleteRole(role.id);
      if (result.success) {
        toast.success('Perfil excluído com sucesso!');
        loadRoles();
      } else {
        toast.error(result.error || 'Erro ao excluir perfil');
      }
    }
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionsOpen(true);
  };

  const handlePermissionsChange = (permissions: string[]) => {
    if (selectedRole) {
      updateRole(selectedRole.id, { permissions });
      const updated = { ...selectedRole, permissions };
      setSelectedRole(updated);
      toast.success('Permissões atualizadas!');
      loadRoles();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Perfis</h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Backoffice
            </span>
            <span>Gerencie os perfis de acesso do sistema</span>
          </p>
        </div>
        <Button onClick={handleCreate} icon={<Plus className="w-5 h-5" />} className="shadow-sm">
          Novo Perfil
        </Button>
      </div>

      {roles.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="Nenhum perfil cadastrado"
          description="Crie perfis para organizar permissões de usuários"
        />
      ) : (
        <div className="grid gap-4">
          {roles.map((role) => (
            <Card key={role.id} className="bg-white rounded-2xl border border-neutral-200 hover:shadow-lg transition-shadow duration-200 p-6">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{role.name}</h3>
                      {role.description && (
                        <p className="text-gray-600 mt-1 line-clamp-2">{role.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                          {role.permissions.length} {role.permissions.length === 1 ? 'permissão' : 'permissões'}
                        </span>
                        <span className="text-xs text-gray-500">Escopo: Backoffice</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManagePermissions(role)}
                    className="whitespace-nowrap"
                  >
                    <Shield className="w-4 h-4 mr-1" />
                    Permissões
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(role)}
                    title="Editar perfil"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(role)}
                    title="Excluir perfil"
                    className="hover:border-red-300 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <RoleFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        role={editingRole}
        scope="BACKOFFICE"
        tenantId={null}
      />

      {selectedRole && (
        <Modal isOpen={isPermissionsOpen} onClose={() => setIsPermissionsOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Gerenciar Permissões
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Perfil: <span className="font-semibold">{selectedRole.name}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
              <PermissionMatrix
                scope="BACKOFFICE"
                selectedPermissions={selectedRole.permissions}
                onChange={handlePermissionsChange}
              />
            </div>

            <div className="p-6 border-t bg-white flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsPermissionsOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
