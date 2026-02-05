import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { UserFormModal, UserFormData } from '../../components/rbac/UserFormModal';
import type { ManagedUser, Role } from '../../core/rbac/types';
import {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
  listRoles,
  getRoleById,
} from '../../core/rbac/mockStore';
import { toast } from 'sonner';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const userData = listUsers('BACKOFFICE', null);
    const roleData = listRoles('BACKOFFICE', null);
    setUsers(userData);
    setRoles(roleData);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: ManagedUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: UserFormData) => {
    if (editingUser) {
      updateUser(editingUser.id, {
        name: data.name,
        roleId: data.roleId,
      });
      toast.success('Usuário atualizado com sucesso!');
    } else {
      createUser({
        name: data.name,
        email: data.email,
        scope: 'BACKOFFICE',
        tenantId: null,
        roleId: data.roleId,
        overrides: {},
      });
      toast.success('Usuário criado com sucesso!');
    }
    setIsFormOpen(false);
    loadData();
  };

  const handleDelete = (user: ManagedUser) => {
    if (confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) {
      const result = deleteUser(user.id);
      if (result.success) {
        toast.success('Usuário excluído com sucesso!');
        loadData();
      } else {
        toast.error(result.error || 'Erro ao excluir usuário');
      }
    }
  };

  const handleManageOverrides = (user: ManagedUser) => {
    navigate(`/admin/users/overrides?userId=${user.id}`);
  };

  const getUserRoleName = (roleId: string | null) => {
    if (!roleId) return 'Sem perfil';
    const role = getRoleById(roleId);
    return role?.name || 'Perfil não encontrado';
  };

  const getOverrideCount = (user: ManagedUser) => {
    return Object.keys(user.overrides).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Usuários (Backoffice)</h1>
          <p className="text-gray-600 mt-1">Gerencie os usuários do backoffice</p>
        </div>
        <Button onClick={handleCreate} icon={<Plus className="w-4 h-4" />}>
          Novo Usuário
        </Button>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={<Users className="w-12 h-12" />}
          title="Nenhum usuário cadastrado"
          description="Crie usuários para gerenciar o acesso ao sistema"
        />
      ) : (
        <div className="grid gap-4">
          {users.map((user) => {
            const overrideCount = getOverrideCount(user);

            return (
              <Card key={user.id}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                    <p className="text-gray-600 mt-1">{user.email}</p>
                    <div className="flex gap-2 mt-3">
                      <Badge variant="secondary">{getUserRoleName(user.roleId)}</Badge>
                      {overrideCount > 0 && (
                        <Badge variant="warning">{overrideCount} exceções</Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageOverrides(user)}
                      title="Gerenciar exceções de permissões"
                    >
                      <Settings className="w-4 h-4" />
                      Exceções
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(user)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <UserFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        user={editingUser}
        scope="BACKOFFICE"
        tenantId={null}
        availableRoles={roles}
      />
    </div>
  );
}
