import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Users,
  Key,
  Plus,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  Settings,
  UserCheck,
  Crown,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';

const AdminPermissions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRolesAndPermissions();
  }, []);

  const loadRolesAndPermissions = async () => {
    try {
      setLoading(true);
      // TODO: Implementar llamadas a la API

      // Datos de ejemplo para roles
      const mockRoles = [
        {
          id: 1,
          name: 'Super Administrador',
          description: 'Control total del sistema',
          users_count: 2,
          permissions: ['all'],
          color: 'red',
          icon: '👑',
          created_at: new Date('2024-01-01')
        },
        {
          id: 2,
          name: 'Administrador',
          description: 'Gestión general del sistema educativo',
          users_count: 5,
          permissions: [
            'manage_users', 'manage_courses', 'manage_content',
            'view_reports', 'manage_settings'
          ],
          color: 'purple',
          icon: '⚙️',
          created_at: new Date('2024-01-01')
        },
        {
          id: 3,
          name: 'Docente',
          description: 'Gestión de cursos y estudiantes',
          users_count: 15,
          permissions: [
            'create_courses', 'edit_own_courses', 'manage_students',
            'grade_assignments', 'view_course_reports'
          ],
          color: 'blue',
          icon: '🎓',
          created_at: new Date('2024-01-01')
        },
        {
          id: 4,
          name: 'Estudiante',
          description: 'Acceso básico a cursos y evaluaciones',
          users_count: 245,
          permissions: [
            'view_courses', 'take_quizzes', 'submit_assignments',
            'view_grades', 'access_library'
          ],
          color: 'green',
          icon: '📚',
          created_at: new Date('2024-01-01')
        },
        {
          id: 5,
          name: 'Bibliotecario',
          description: 'Gestión del contenido de la biblioteca',
          users_count: 3,
          permissions: [
            'manage_library', 'upload_documents', 'organize_content',
            'view_library_reports'
          ],
          color: 'orange',
          icon: '📖',
          created_at: new Date('2024-02-15')
        }
      ];

      // Datos de ejemplo para permisos
      const mockPermissions = [
        {
          id: 1,
          name: 'manage_users',
          display_name: 'Gestionar Usuarios',
          description: 'Crear, editar y eliminar usuarios',
          category: 'users',
          roles_count: 2
        },
        {
          id: 2,
          name: 'manage_courses',
          display_name: 'Gestionar Cursos',
          description: 'Crear y administrar todos los cursos',
          category: 'courses',
          roles_count: 3
        },
        {
          id: 3,
          name: 'create_courses',
          display_name: 'Crear Cursos',
          description: 'Crear nuevos cursos',
          category: 'courses',
          roles_count: 4
        },
        {
          id: 4,
          name: 'manage_content',
          display_name: 'Gestionar Contenido',
          description: 'Administrar contenido educativo',
          category: 'content',
          roles_count: 3
        },
        {
          id: 5,
          name: 'view_reports',
          display_name: 'Ver Reportes',
          description: 'Acceder a reportes y estadísticas',
          category: 'reports',
          roles_count: 4
        },
        {
          id: 6,
          name: 'manage_settings',
          display_name: 'Gestionar Configuración',
          description: 'Modificar configuración del sistema',
          category: 'system',
          roles_count: 2
        }
      ];

      setRoles(mockRoles);
      setPermissions(mockPermissions);
    } catch (error) {
      console.error('Error loading roles and permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (roleName) => {
    switch (roleName.toLowerCase()) {
      case 'super administrador':
        return <Crown className="w-5 h-5" />;
      case 'administrador':
        return <Settings className="w-5 h-5" />;
      case 'docente':
        return <GraduationCap className="w-5 h-5" />;
      case 'estudiante':
        return <BookOpen className="w-5 h-5" />;
      case 'bibliotecario':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const getRoleColor = (color) => {
    const colors = {
      red: 'bg-red-100 text-red-800 border-red-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      green: 'bg-green-100 text-green-800 border-green-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[color] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getPermissionCategoryColor = (category) => {
    const colors = {
      users: 'bg-blue-100 text-blue-800',
      courses: 'bg-green-100 text-green-800',
      content: 'bg-purple-100 text-purple-800',
      reports: 'bg-orange-100 text-orange-800',
      system: 'bg-red-100 text-red-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleCreateRole = () => {
    setSelectedRole(null);
    setShowRoleModal(true);
  };

  const handleEditRole = (role) => {
    setSelectedRole(role);
    setShowRoleModal(true);
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este rol? Los usuarios con este rol perderán sus permisos.')) {
      return;
    }

    // TODO: Implementar eliminación
    alert('Rol eliminado exitosamente');
    loadRolesAndPermissions();
  };

  const handleCreatePermission = () => {
    setShowPermissionModal(true);
  };

  const handleRoleSubmit = async (roleData) => {
    // TODO: Implementar creación/edición de rol
    alert(selectedRole ? 'Rol actualizado exitosamente' : 'Rol creado exitosamente');
    setShowRoleModal(false);
    loadRolesAndPermissions();
  };

  const handlePermissionSubmit = async (permissionData) => {
    // TODO: Implementar creación de permiso
    alert('Permiso creado exitosamente');
    setShowPermissionModal(false);
    loadRolesAndPermissions();
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando permisos y roles...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Sistema de Permisos y Roles</h1>
            <p className="text-purple-100">Gestiona roles, permisos y control de acceso</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => navigate('/admin')}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ← Panel Admin
            </button>
            <button
              onClick={handleCreateRole}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              ➕ Nuevo Rol
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="primary" className="text-center">
          <div className="text-2xl font-bold text-primary-600 mb-2">
            {roles.length}
          </div>
          <p className="text-gray-600 text-sm">Roles Activos</p>
        </Card>

        <Card variant="success" className="text-center">
          <div className="text-2xl font-bold text-green-600 mb-2">
            {permissions.length}
          </div>
          <p className="text-gray-600 text-sm">Permisos Definidos</p>
        </Card>

        <Card variant="warning" className="text-center">
          <div className="text-2xl font-bold text-yellow-600 mb-2">
            {roles.reduce((sum, role) => sum + role.users_count, 0)}
          </div>
          <p className="text-gray-600 text-sm">Usuarios Asignados</p>
        </Card>

        <Card variant="info" className="text-center">
          <div className="text-2xl font-bold text-blue-600 mb-2">
            {permissions.filter(p => p.roles_count > 3).length}
          </div>
          <p className="text-gray-600 text-sm">Permisos Populares</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Roles Section */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Roles del Sistema</h2>
            <button
              onClick={handleCreateRole}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Nuevo Rol
            </button>
          </div>

          <div className="space-y-4">
            {roles.map((role) => (
              <div key={role.id} className={`border rounded-lg p-4 ${getRoleColor(role.color)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">{role.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{role.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>{role.users_count} usuarios</span>
                        <span>{role.permissions.length} permisos</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditRole(role)}
                      className="text-gray-600 hover:text-gray-800 p-1"
                      title="Editar rol"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRole(role.id)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Eliminar rol"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Permissions Preview */}
                <div className="mt-3">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission, index) => (
                      <span
                        key={index}
                        className="bg-white/50 text-gray-700 px-2 py-1 rounded text-xs"
                      >
                        {permission.replace('_', ' ')}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="bg-white/50 text-gray-700 px-2 py-1 rounded text-xs">
                        +{role.permissions.length - 3} más
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Permissions Section */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Permisos del Sistema</h2>
            <button
              onClick={handleCreatePermission}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
            >
              <Plus className="w-4 h-4 inline mr-1" />
              Nuevo Permiso
            </button>
          </div>

          <div className="space-y-3">
            {permissions.map((permission) => (
              <div key={permission.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Key className="w-4 h-4 text-gray-400" />
                      <h4 className="font-medium text-gray-900">{permission.display_name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPermissionCategoryColor(permission.category)}`}>
                        {permission.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{permission.description}</p>
                    <div className="text-xs text-gray-500">
                      Usado en {permission.roles_count} rol{permission.roles_count !== 1 ? 'es' : ''}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Ver detalles"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Editar permiso"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Permission Matrix */}
      <Card>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Matriz de Permisos</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border">
                  Permiso / Rol
                </th>
                {roles.map((role) => (
                  <th key={role.id} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border">
                    {role.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissions.map((permission) => (
                <tr key={permission.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border text-sm font-medium text-gray-900">
                    {permission.display_name}
                  </td>
                  {roles.map((role) => (
                    <td key={role.id} className="px-4 py-3 border text-center">
                      {role.permissions.includes(permission.name) || role.permissions.includes('all') ? (
                        <Check className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card variant="gradient" className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestión Avanzada</h3>
          <p className="text-gray-600 mb-6">
            Herramientas avanzadas para la gestión de permisos
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleCreateRole}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              🎭 Crear Rol Personalizado
            </button>
            <button
              onClick={handleCreatePermission}
              className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              🔑 Definir Nuevo Permiso
            </button>
            <button
              onClick={() => navigate('/admin/permissions/audit')}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg hover:shadow-xl"
            >
              📊 Auditoría de Acceso
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminPermissions;