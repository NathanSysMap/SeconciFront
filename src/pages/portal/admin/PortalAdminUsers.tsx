import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { UserFormModal, UserFormData } from '../../../components/rbac/UserFormModal';
import { useAuth } from '../../../core/auth/AuthContext';
import type { ManagedUser, Role } from '../../../core/rbac/types';
import { usersService, rolesService } from '../../../services';
import { toast } from 'sonner';

export default function PortalAdminUsers() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);

  const tenantId = session?.tenantId || null;

  useEffect(() => {
    loadData();
  }, [tenantId]);

  const loadData = async () => {
    if (!tenantId) return;
    const userData = await usersService.list('PORTAL', tenantId);
    const roleData = await rolesService.list('PORTAL', tenantId);
    setUsers(userData as ManagedUser[]);
    setRoles(roleData as Role[]);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleEdit = (user: ManagedUser) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: UserFormData) => {
    if (!tenantId) return;

    try {
      if (editingUser) {
        await usersService.update(editingUser.id, {
          name: data.name,
          roleId: data.roleId,
        });
        toast.success('Usuário atualizado com sucesso!');
      } else {
        await usersService.create({
          name: data.name,
          email: data.email,
          scope: 'PORTAL',
          tenantId: tenantId,
          roleId: data.roleId,
        });
        toast.success('Usuário criado com sucesso!');
      }
      setIsFormOpen(false);
      loadData();
    } catch (error) {
      toast.error('Erro ao salvar usuário');
    }
  };

  const handleDelete = async (user: ManagedUser) => {
    if (confirm(`Tem certeza que deseja excluir o usuário "${user.name}"?`)) {
      try {
        await usersService.delete(user.id);
        toast.success('Usuário excluído com sucesso!');
        loadData();
      } catch (error: any) {
        toast.error(error.message || 'Erro ao excluir usuário');
      }
    }
  };

  const handleManageOverrides = (user: ManagedUser) => {
    navigate(`/portal/admin/users/overrides?userId=${user.id}`);
  };

  const getUserRoleName = (roleId: string | null) => {
    if (!roleId) return 'Sem perfil';
    const role = roles.find((r) => r.id === roleId);
    return role?.name || 'Perfil não encontrado';
  };

  const getOverrideCount = (user: ManagedUser) => {
    return Object.keys(user.permissionOverrides || user.overrides || {}).length;
  };

  if (!tenantId) {
    return (
      <EmptyState
        icon={Users}
        title="Tenant não identificado"
        description="Não foi possível identificar o tenant da sessão"
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Portal
            </span>
            <span>Gerencie os usuários e seus acessos</span>
          </p>
        </div>
        <Button onClick={handleCreate} icon={<Plus className="w-5 h-5" />} className="shadow-sm">
          Novo Usuário
        </Button>
      </div>

      {users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum usuário cadastrado"
          description="Crie usuários para gerenciar o acesso ao sistema"
        />
      ) : (
        <div className="grid gap-4">
          {users.map((user) => {
            const overrideCount = getOverrideCount(user);

            return (
              <Card key={user.id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="p-6 flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{user.name}</h3>
                      <p className="text-gray-600 text-sm truncate">{user.email}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="secondary">{getUserRoleName(user.roleId)}</Badge>
                        {overrideCount > 0 && (
                          <Badge variant="warning">
                            {overrideCount} {overrideCount === 1 ? 'exceção' : 'exceções'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleManageOverrides(user)}
                      title="Gerenciar exceções de permissões"
                      className="whitespace-nowrap"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Exceções
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(user)}
                      title="Editar usuário"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(user)}
                      title="Excluir usuário"
                      className="hover:border-red-300 hover:text-red-600"
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
        scope="PORTAL"
        tenantId={tenantId}
        availableRoles={roles}
      />
    </div>
  );
}
