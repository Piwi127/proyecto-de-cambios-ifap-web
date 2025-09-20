import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const UserRoleDisplay = ({ showFullInfo = false, className = "" }) => {
  const { user } = useAuth();

  if (!user) return null;

  const getRoleInfo = () => {
    if (user.is_superuser) {
      return {
        name: 'Administrador',
        icon: '👑',
        color: 'bg-red-100 text-red-800 border-red-200',
        description: 'Acceso completo al sistema'
      };
    } else if (user.is_instructor) {
      return {
        name: 'Docente',
        icon: '👨‍🏫',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        description: 'Gestión de cursos y estudiantes'
      };
    } else if (user.is_student) {
      return {
        name: 'Estudiante',
        icon: '🎓',
        color: 'bg-green-100 text-green-800 border-green-200',
        description: 'Acceso a contenidos educativos'
      };
    } else {
      return {
        name: 'Usuario',
        icon: '👤',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        description: 'Usuario básico'
      };
    }
  };

  const roleInfo = getRoleInfo();

  if (showFullInfo) {
    return (
      <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${roleInfo.color} ${className}`}>
        <span className="text-lg mr-2">{roleInfo.icon}</span>
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{roleInfo.name}</span>
          <span className="text-xs opacity-75">{roleInfo.description}</span>
        </div>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${roleInfo.color} ${className}`}>
      <span className="mr-1">{roleInfo.icon}</span>
      {roleInfo.name}
    </span>
  );
};

export default UserRoleDisplay;