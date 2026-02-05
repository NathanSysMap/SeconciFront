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
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/admin/users')}
          icon={<ArrowLeft className="w-4 h-4" />}
        >
          Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Exceções de Permissões (Backoffice)
          </h1>
          <p className="text-gray-600 mt-1">
            Configure exceções individuais de permissões para usuários
          </p>
        </div>
      </div>

      <Card>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecione o usuário
            </label>
            <select
              value={selectedUser?.id || ''}
              onChange={(e) => handleUserChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <UserOverridesMatrix
              scope="BACKOFFICE"
              user={selectedUser}
              role={selectedRole}
              onOverrideChange={handleOverrideChange}
              onOverrideRemove={handleOverrideRemove}
            />
          ) : (
            <EmptyState
              icon={<Users className="w-12 h-12" />}
              title="Selecione um usuário"
              description="Escolha um usuário acima para gerenciar suas exceções de permissões"
            />
          )}
        </div>
      </Card>
    </div>
  );
}
