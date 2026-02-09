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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Perfis (Backoffice)</h1>
          <p className="text-gray-600 mt-1">Gerencie os perfis de acesso do backoffice</p>
        </div>
        <Button onClick={handleCreate} icon={<Plus className="w-4 h-4" />}>
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
            <Card key={role.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                  {role.description && (
                    <p className="text-gray-600 mt-1">{role.description}</p>
                  )}
                  <div className="flex gap-4 mt-3 text-sm text-gray-500">
                    <span>{role.permissions.length} permissões</span>
                    <span>•</span>
                    <span>Backoffice</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManagePermissions(role)}
                  >
                    <Shield className="w-4 h-4" />
                    Permissões
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(role)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(role)}
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
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">
                Permissões: {selectedRole.name}
              </h2>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <PermissionMatrix
                scope="BACKOFFICE"
                selectedPermissions={selectedRole.permissions}
                onChange={handlePermissionsChange}
              />
            </div>

            <div className="p-6 border-t flex justify-end">
              <Button onClick={() => setIsPermissionsOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
