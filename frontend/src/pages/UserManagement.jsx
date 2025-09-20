import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  UserCheck, 
  UserX, 
  Shield, 
  Mail, 
  Calendar,
  MoreVertical,
  Plus,
  Download,
  RefreshCw
} from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';

const UserManagement = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [modalType, setModalType] = useState('view'); // 'view', 'edit', 'role'

  // Estados para el modal de edición
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: '',
    is_active: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsers();
      setUsers(response.results || response);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por rol
    if (roleFilter !== 'all') {
      if (roleFilter === 'admin') {
        filtered = filtered.filter(user => user.is_superuser === true);
      } else if (roleFilter === 'instructor') {
        filtered = filtered.filter(user => user.is_instructor === true);
      } else if (roleFilter === 'student') {
        filtered = filtered.filter(user => user.is_student === true);
      }
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(user => user.is_active === isActive);
    }

    setFilteredUsers(filtered);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalType('view');
    setShowUserModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    
    // Mapear los campos booleanos del backend a un campo 'role' para el frontend
    let userRole = 'student'; // default
    if (user.is_superuser) {
      userRole = 'admin';
    } else if (user.is_instructor) {
      userRole = 'instructor';
    } else if (user.is_student) {
      userRole = 'student';
    }
    
    setEditForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      role: userRole,
      is_active: user.is_active !== undefined ? user.is_active : true
    });
    setModalType('edit');
    setShowEditModal(true);
  };

  const handleRoleChange = (user) => {
    setSelectedUser(user);
    
    // Mapear los campos booleanos del backend a un campo 'role' para el frontend
    let userRole = 'student'; // default
    if (user.is_superuser) {
      userRole = 'admin';
    } else if (user.is_instructor) {
      userRole = 'instructor';
    } else if (user.is_student) {
      userRole = 'student';
    }
    
    setEditForm({
      ...editForm,
      role: userRole
    });
    setModalType('role');
    setShowEditModal(true);
  };

  const handleToggleStatus = async (user) => {
    try {
      await userService.updateUser(user.id, { is_active: !user.is_active });
      loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleSaveUser = async () => {
    try {
      let updateData = {};

      if (modalType === 'edit') {
        // Para edición completa, enviar todos los campos
        updateData = {
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          email: editForm.email,
          is_active: editForm.is_active
        };

        // Si se cambió el rol, incluir los campos booleanos correspondientes
        if (editForm.role !== selectedUser.role_name) {
          if (editForm.role === 'student') {
            updateData.is_student = true;
            updateData.is_instructor = false;
            updateData.is_superuser = false;
          } else if (editForm.role === 'instructor') {
            updateData.is_student = false;
            updateData.is_instructor = true;
            updateData.is_superuser = false;
          } else if (editForm.role === 'admin') {
            updateData.is_student = false;
            updateData.is_instructor = false;
            updateData.is_superuser = true;
          }
        }
      } else if (modalType === 'role') {
        // Para cambio de rol específico, usar el endpoint dedicado
        await userService.updateUserRole(selectedUser.id, editForm.role);
        setShowEditModal(false);
        loadUsers();
        return;
      }

      console.log('Enviando datos de actualización:', updateData);
      const response = await userService.updateUser(selectedUser.id, updateData);
      console.log('Respuesta del servidor:', response);

      setShowEditModal(false);
      loadUsers();
      
      // Mostrar mensaje de éxito
      alert('Usuario actualizado exitosamente');
    } catch (error) {
      console.error('Error saving user:', error);
      alert(`Error al guardar los cambios: ${error.message || 'Error desconocido'}`);
    }
  };

  const getRoleColor = (user) => {
    if (user.is_superuser) return 'bg-red-100 text-red-800';
    if (user.is_instructor) return 'bg-blue-100 text-blue-800';
    if (user.is_student) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (user) => {
    if (user.is_superuser) return <Shield className="w-4 h-4" />;
    if (user.is_instructor) return <UserCheck className="w-4 h-4" />;
    if (user.is_student) return <Users className="w-4 h-4" />;
    return <Users className="w-4 h-4" />;
  };

  const getRoleDisplay = (user) => {
    if (user.is_superuser) return 'Administrador';
    if (user.is_instructor) return 'Instructor';
    if (user.is_student) return 'Estudiante';
    return user.role_display || 'Sin Rol';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!userService.hasPermission(user, 'manage_users')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h2>
          <p className="text-gray-600">No tienes permisos para acceder a la gestión de usuarios.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                Gestión de Usuarios
              </h1>
              <p className="text-gray-600 mt-2">
                Administra usuarios, roles y permisos del sistema
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={loadUsers}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Actualizar
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Búsqueda */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filtro por rol */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="instructor">Instructor</option>
              <option value="student">Estudiante</option>
            </select>

            {/* Filtro por estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
            </select>

            {/* Contador de resultados */}
            <div className="flex items-center text-sm text-gray-600">
              <Filter className="w-4 h-4 mr-2" />
              {filteredUsers.length} de {users.length} usuarios
            </div>
          </div>
        </Card>

        {/* Lista de usuarios */}
        <Card className="overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha de registro
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-medium">
                                {(user.first_name?.[0] || user.username?.[0] || 'U').toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}`
                                : user.username
                              }
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <Mail className="w-3 h-3 mr-1" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user)}`}>
                          {getRoleIcon(user)}
                          {getRoleDisplay(user)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(user.date_joined)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(user)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Editar usuario"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRoleChange(user)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded"
                            title="Cambiar rol"
                          >
                            <Shield className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            className={`p-1 rounded ${
                              user.is_active 
                                ? 'text-red-600 hover:text-red-900' 
                                : 'text-green-600 hover:text-green-900'
                            }`}
                            title={user.is_active ? 'Deshabilitar' : 'Habilitar'}
                          >
                            {user.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {filteredUsers.length === 0 && (
                <div className="p-8 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron usuarios</h3>
                  <p className="text-gray-500">
                    {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                      ? 'Intenta ajustar los filtros de búsqueda'
                      : 'No hay usuarios registrados en el sistema'
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Modal de detalles de usuario */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Detalles del Usuario</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-xl">
                      {(selectedUser.first_name?.[0] || selectedUser.username?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold">
                      {selectedUser.first_name && selectedUser.last_name 
                        ? `${selectedUser.first_name} ${selectedUser.last_name}`
                        : selectedUser.username
                      }
                    </h4>
                    <p className="text-gray-600">{selectedUser.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usuario</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedUser.username}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Rol</label>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(selectedUser)} mt-1`}>
                      {getRoleIcon(selectedUser)}
                      {getRoleDisplay(selectedUser)}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full mt-1 ${
                      selectedUser.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedUser.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha de registro</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.date_joined)}</p>
                  </div>
                  {selectedUser.last_login && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Último acceso</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(selectedUser.last_login)}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    handleEditUser(selectedUser);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Editar Usuario
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edición */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">
                  {modalType === 'edit' ? 'Editar Usuario' : 'Cambiar Rol'}
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                {modalType === 'edit' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={editForm.first_name}
                        onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido
                      </label>
                      <input
                        type="text"
                        value={editForm.last_name}
                        onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rol
                      </label>
                      <select
                        value={editForm.role}
                        onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="student">Estudiante</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_active"
                        checked={editForm.is_active}
                        onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                        Usuario activo
                      </label>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nuevo Rol para {selectedUser.first_name || selectedUser.username}
                    </label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="student">Estudiante</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Administrador</option>
                    </select>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveUser}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;