import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { UserOverridesMatrix } from '../../components/rbac/UserOverridesMatrix';
import type { ManagedUser, Role } from '../../core/rbac/types';
import {
  listUsers,
  getRoleById,
  setUserOverride,
  removeUserOverride,
} from '../../core/rbac/mockStore';
import { toast } from 'sonner';

export default function AdminUserOverrides() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const userId = searchParams.get('userId');
    if (userId) {
      const user = users.find((u) => u.id === userId);
      if (user) {
        setSelectedUser(user);
        if (user.roleId) {
          const role = getRoleById(user.roleId);
          setSelectedRole(role);
        } else {
          setSelectedRole(null);
        }
      }
    }
  }, [searchParams, users]);

  const loadUsers = () => {
    const data = listUsers('BACKOFFICE', null);
    setUsers(data);
  };

  const handleUserChange = (userId: string) => {
    setSearchParams({ userId });
    loadUsers();
  };

  const handleOverrideChange = (permissionKey: string, allowed: boolean) => {
    if (!selectedUser) return;

    setUserOverride(selectedUser.id, permissionKey, allowed);
    toast.success(`Exceção ${allowed ? 'concedida' : 'negada'} com sucesso!`);
    loadUsers();
  };

  const handleOverrideRemove = (permissionKey: string) => {
    if (!selectedUser) return;

    removeUserOverride(selectedUser.id, permissionKey);
    toast.success('Exceção removida. Permissão voltou a herdar do perfil.');
    loadUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/users')}
          icon={<ArrowLeft className="w-4 h-4" />}
          className="self-start"
        >
          Voltar para Usuários
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exceções de Permissões</h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Backoffice
            </span>
            <span>Configure permissões individuais que sobrescrevem o perfil do usuário</span>
          </p>
        </div>
      </div>

      <Card className="shadow-lg p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Selecione o usuário
            </label>
            <select
              value={selectedUser?.id || ''}
              onChange={(e) => handleUserChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
            >
              <option value="">Selecione um usuário...</option>
              {users.map((user) => {
                const role = user.roleId ? getRoleById(user.roleId) : null;
                return (
                  <option key={user.id} value={user.id}>
                    {user.name} - {user.email} {role && `(${role.name})`}
                  </option>
                );
              })}
            </select>
          </div>

          {selectedUser ? (
            <div className="pt-6 border-t">
              <UserOverridesMatrix
                scope="BACKOFFICE"
                user={selectedUser}
                role={selectedRole}
                onOverrideChange={handleOverrideChange}
                onOverrideRemove={handleOverrideRemove}
              />
            </div>
          ) : (
            <div className="py-8">
              <EmptyState
                icon={Users}
                title="Selecione um usuário"
                description="Escolha um usuário acima para gerenciar suas exceções de permissões"
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
