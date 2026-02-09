import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Shield } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { EmptyState } from '../../../components/ui/EmptyState';
import { RoleFormModal, RoleFormData } from '../../../components/rbac/RoleFormModal';
import { PermissionMatrix } from '../../../components/rbac/PermissionMatrix';
import { Modal } from '../../../components/ui/Modal';
import { useAuth } from '../../../core/auth/AuthContext';
import type { Role } from '../../../core/rbac/types';
import { rolesService } from '../../../services';
import { toast } from 'sonner';

export default function PortalAdminRoles() {
  const { session } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const tenantId = session?.tenantId || null;

  useEffect(() => {
    loadRoles();
  }, [tenantId]);

  const loadRoles = async () => {
    if (!tenantId) return;
    const data = await rolesService.list('PORTAL', tenantId);
    setRoles(data as Role[]);
  };

  const handleCreate = () => {
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: RoleFormData) => {
    if (!tenantId) return;

    try {
      if (editingRole) {
        await rolesService.update(editingRole.id, {
          name: data.name,
          description: data.description,
        });
        toast.success('Perfil atualizado com sucesso!');
      } else {
        await rolesService.create({
          name: data.name,
          description: data.description,
          scope: 'PORTAL',
          tenantId: tenantId,
          permissions: [],
        });
        toast.success('Perfil criado com sucesso!');
      }
      setIsFormOpen(false);
      loadRoles();
    } catch (error) {
      toast.error('Erro ao salvar perfil');
    }
  };

  const handleDelete = async (role: Role) => {
    if (confirm(`Tem certeza que deseja excluir o perfil "${role.name}"?`)) {
      try {
        await rolesService.delete(role.id);
        toast.success('Perfil excluído com sucesso!');
        loadRoles();
      } catch (error: any) {
        toast.error(error.message || 'Erro ao excluir perfil');
      }
    }
  };

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role);
    setIsPermissionsOpen(true);
  };

  const handlePermissionsChange = async (permissions: string[]) => {
    if (selectedRole) {
      try {
        await rolesService.update(selectedRole.id, { permissions });
        const updated = { ...selectedRole, permissions };
        setSelectedRole(updated);
        toast.success('Permissões atualizadas!');
        loadRoles();
      } catch (error) {
        toast.error('Erro ao atualizar permissões');
      }
    }
  };

  if (!tenantId) {
    return (
      <EmptyState
        icon={Shield}
        title="Tenant não identificado"
        description="Não foi possível identificar o tenant da sessão"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Perfis</h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Portal
            </span>
            <span>Gerencie os perfis de acesso do portal</span>
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
            <Card key={role.id} className="hover:shadow-lg transition-shadow duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{role.name}</h3>
                      {role.description && (
                        <p className="text-gray-600 mt-1 line-clamp-2">{role.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          {role.permissions.length} {role.permissions.length === 1 ? 'permissão' : 'permissões'}
                        </span>
                        <span className="text-xs text-gray-500">Escopo: Portal</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
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
        scope="PORTAL"
        tenantId={tenantId}
      />

      {selectedRole && (
        <Modal isOpen={isPermissionsOpen} onClose={() => setIsPermissionsOpen(false)}>
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b bg-gradient-to-r from-green-50 to-green-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
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
                scope="PORTAL"
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
