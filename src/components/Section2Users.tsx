import React from 'react';
import { Users, ShieldAlert, UserCheck, Plus, Trash2 } from 'lucide-react';
import { Section2Users as Section2Type, UserRole } from '../types';

interface Section2Props {
  data: Section2Type;
  onChange: (updated: Section2Type) => void;
}

export const Section2Users: React.FC<Section2Props> = ({ data, onChange }) => {
  const handleTotalUsersChange = (totalUsers: string) => {
    onChange({ ...data, totalUsers });
  };

  const handleSecurityChange = (securityRestrictions: string) => {
    onChange({ ...data, securityRestrictions });
  };

  const handleRoleNameChange = (id: string, roleName: string) => {
    const updatedRoles = data.rolesList.map((r) =>
      r.id === id ? { ...r, roleName } : r
    );
    onChange({ ...data, rolesList: updatedRoles });
  };

  const handleRoleFunctionsChange = (id: string, functions: string) => {
    const updatedRoles = data.rolesList.map((r) =>
      r.id === id ? { ...r, functions } : r
    );
    onChange({ ...data, rolesList: updatedRoles });
  };

  const handleAddRole = () => {
    const newId = Date.now().toString();
    const newRole: UserRole = {
      id: newId,
      roleName: `Rol ${data.rolesList.length + 1}`,
      functions: '',
    };
    onChange({ ...data, rolesList: [...data.rolesList, newRole] });
  };

  const handleRemoveRole = (id: string) => {
    if (data.rolesList.length <= 1) return;
    const updatedRoles = data.rolesList.filter((r) => r.id !== id);
    onChange({ ...data, rolesList: updatedRoles });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-6">
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2.5 text-blue-600 font-bold text-xs tracking-wider uppercase mb-1">
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
            2
          </span>
          Sección 2
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Estructura de Usuarios, Roles y Permisos
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Para saber quiénes entrarán al sistema y qué podrán ver o hacer cada uno.
        </p>
      </div>

      <div className="space-y-6">
        {/* Question 2.1 */}
        <div className="space-y-2">
          <label htmlFor="sec2TotalUsers" className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Users className="w-4 h-4 text-blue-600" />
            ¿Cuántos empleados o personas en total utilizarán el sistema?
          </label>
          <p className="text-xs text-slate-500">
            Aproximado de usuarios concurrentes o cuentas necesarias.
          </p>
          <input
            id="sec2TotalUsers"
            type="text"
            value={data.totalUsers}
            onChange={(e) => handleTotalUsersChange(e.target.value)}
            placeholder="Ejemplo: 8 usuarios en total (3 en sucursal A, 5 en sucursal B)"
            className="w-full text-sm p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700 placeholder-slate-400"
          />
        </div>

        {/* Question 2.2 & 2.3 Roles Builder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Roles, puestos y sus funciones en el sistema
              </label>
              <p className="text-xs text-slate-500 mt-0.5">
                Define cada puesto (Ej: Director/Dueño, Gerente, Vendedor, Técnico, Contador, Cajero) y describe lo que hará.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddRole}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Rol
            </button>
          </div>

          <div className="space-y-4">
            {data.rolesList.map((role, idx) => (
              <div
                key={role.id}
                className="p-4 bg-slate-50/70 rounded-xl border border-slate-200 space-y-3 relative transition-all hover:border-slate-300"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 shadow-2xs">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={role.roleName}
                      onChange={(e) => handleRoleNameChange(role.id, e.target.value)}
                      placeholder={`Ej: ${
                        idx === 0
                          ? 'Director / Dueño'
                          : idx === 1
                          ? 'Gerente / Administrador'
                          : idx === 2
                          ? 'Vendedor / Operador'
                          : 'Cajero'
                      }`}
                      className="font-bold text-sm text-slate-900 bg-white border border-slate-200 rounded-lg px-3 py-1.5 w-full max-w-xs focus:border-blue-500 outline-none shadow-2xs"
                    />
                  </div>

                  {data.rolesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRole(role.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar este rol"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div>
                  <label htmlFor={`roleFunctions_${role.id}`} className="block text-xs font-semibold text-slate-600 mb-1">
                    Funciones dentro del sistema para este rol:
                  </label>
                  <textarea
                    id={`roleFunctions_${role.id}`}
                    rows={2}
                    value={role.functions}
                    onChange={(e) => handleRoleFunctionsChange(role.id, e.target.value)}
                    placeholder="Escribe qué acciones podrá realizar (Ej. Crear cotizaciones, cobrar ventas, registrar compras, ver ganancias)..."
                    className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700 leading-relaxed"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Question 2.4 */}
        <div className="space-y-2">
          <label htmlFor="sec2Restrictions" className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            ¿Existen restricciones de seguridad o permisos por rol?
          </label>
          <p className="text-xs text-slate-500">
            Ejemplo: &quot;Los vendedores no deben ver el costo de compra de los productos ni los totales de ingresos globales; solo el dueño puede borrar o cancelar registros.&quot;
          </p>
          <textarea
            id="sec2Restrictions"
            rows={3}
            value={data.securityRestrictions}
            onChange={(e) => handleSecurityChange(e.target.value)}
            placeholder="Especifica qué información o botones deben estar bloqueados u ocultos para ciertos perfiles..."
            className="w-full text-sm p-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors shadow-2xs text-slate-700 placeholder-slate-400 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
