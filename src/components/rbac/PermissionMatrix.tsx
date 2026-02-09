import { useState, useMemo } from 'react';
import { Search, Check } from 'lucide-react';
import { Input } from '../ui/Input';
import type { Scope } from '../../core/rbac/types';
import { getPermissionsByScope } from '../../core/rbac/permissionCatalog';

interface PermissionMatrixProps {
  scope: Scope;
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
}

export function PermissionMatrix({ scope, selectedPermissions, onChange }: PermissionMatrixProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  const allPermissions = useMemo(() => getPermissionsByScope(scope), [scope]);

  const groupedPermissions = useMemo(() => {
    const groups: Record<string, typeof allPermissions> = {};
    allPermissions.forEach((perm) => {
      if (!groups[perm.module]) {
        groups[perm.module] = [];
      }
      groups[perm.module].push(perm);
    });
    return groups;
  }, [allPermissions]);

  const modules = Object.keys(groupedPermissions).sort();

  const filteredPermissions = useMemo(() => {
    let perms = allPermissions;

    if (selectedModule !== 'all') {
      perms = perms.filter((p) => p.module === selectedModule);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      perms = perms.filter(
        (p) =>
          p.description.toLowerCase().includes(term) ||
          p.action.toLowerCase().includes(term) ||
          p.key.toLowerCase().includes(term)
      );
    }

    return perms;
  }, [allPermissions, selectedModule, searchTerm]);

  const togglePermission = (permKey: string) => {
    if (selectedPermissions.includes(permKey)) {
      onChange(selectedPermissions.filter((p) => p !== permKey));
    } else {
      onChange([...selectedPermissions, permKey]);
    }
  };

  const toggleModule = (module: string) => {
    const modulePerms = groupedPermissions[module].map((p) => p.key);
    const allSelected = modulePerms.every((p) => selectedPermissions.includes(p));

    if (allSelected) {
      onChange(selectedPermissions.filter((p) => !modulePerms.includes(p)));
    } else {
      const newPerms = [...selectedPermissions];
      modulePerms.forEach((p) => {
        if (!newPerms.includes(p)) {
          newPerms.push(p);
        }
      });
      onChange(newPerms);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar permissão por nome, ação ou chave..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <select
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm min-w-[180px]"
        >
          <option value="all">Todos os Módulos</option>
          {modules.map((module) => (
            <option key={module} value={module}>
              {module}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <Check className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {selectedPermissions.length} de {allPermissions.length} permissões selecionadas
              </p>
              <p className="text-xs text-gray-600 mt-0.5">
                {Math.round((selectedPermissions.length / allPermissions.length) * 100)}% do total
              </p>
            </div>
          </div>
        </div>
      </div>

      {selectedModule === 'all' ? (
        <div className="space-y-4">
          {modules.map((module) => {
            const modulePerms = groupedPermissions[module];
            const selectedCount = modulePerms.filter((p) =>
              selectedPermissions.includes(p.key)
            ).length;
            const allSelected = selectedCount === modulePerms.length;

            return (
              <div key={module} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div
                  className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4 flex items-center justify-between cursor-pointer hover:from-gray-100 hover:to-gray-200 transition-colors"
                  onClick={() => toggleModule(module)}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-6 h-6 border-2 rounded-lg flex items-center justify-center transition-all ${
                        allSelected
                          ? 'bg-blue-500 border-blue-500 shadow-sm'
                          : selectedCount > 0
                          ? 'bg-blue-200 border-blue-500'
                          : 'border-gray-300 bg-white'
                      }`}
                    >
                      {allSelected && <Check className="w-4 h-4 text-white" />}
                      {selectedCount > 0 && !allSelected && (
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded" />
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-900 text-lg">{module}</span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Clique para {allSelected ? 'desmarcar' : 'selecionar'} todas
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold ${
                      selectedCount === modulePerms.length ? 'text-blue-600' : 'text-gray-600'
                    }`}>
                      {selectedCount} / {modulePerms.length}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-2 bg-white">
                  {modulePerms.map((perm) => (
                    <label
                      key={perm.key}
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-200"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm.key)}
                        onChange={() => togglePermission(perm.key)}
                        className="mt-1.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900">{perm.action}</div>
                        <div className="text-sm text-gray-600 mt-1">{perm.description}</div>
                        <div className="text-xs text-gray-400 mt-2 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
                          {perm.key}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2 border border-gray-200 rounded-xl p-5 bg-white shadow-sm">
          {filteredPermissions.map((perm) => (
            <label
              key={perm.key}
              className="flex items-start gap-4 p-3 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors border border-transparent hover:border-blue-200"
            >
              <input
                type="checkbox"
                checked={selectedPermissions.includes(perm.key)}
                onChange={() => togglePermission(perm.key)}
                className="mt-1.5 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900">{perm.action}</div>
                <div className="text-sm text-gray-600 mt-1">{perm.description}</div>
                <div className="text-xs text-gray-400 mt-2 font-mono bg-gray-50 px-2 py-1 rounded inline-block">
                  {perm.key}
                </div>
              </div>
            </label>
          ))}

          {filteredPermissions.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">Nenhuma permissão encontrada</p>
              <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros de busca</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
