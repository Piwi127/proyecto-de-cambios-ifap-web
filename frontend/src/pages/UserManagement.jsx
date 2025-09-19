import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user, authToken } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:8000/api/users/', {
                    headers: {
                        Authorization: `Bearer ${authToken}`
                    }
                });
                setUsers(response.data);
            } catch (err) {
                setError(err.response?.data?.detail || 'Error fetching users');
            } finally {
                setLoading(false);
            }
        };

        if (authToken) {
            fetchUsers();
        }
    }, [authToken]);

    const handleRoleChange = async (userId, newIsStaff, newIsSuperuser) => {
        try {
            await axios.patch(`http://localhost:8000/api/users/${userId}/update_role/`, {
                is_staff: newIsStaff,
                is_superuser: newIsSuperuser
            }, {
                headers: {
                    Authorization: `Bearer ${authToken}`
                }
            });
            setUsers(users.map(u => u.id === userId ? { ...u, is_staff: newIsStaff, is_superuser: newIsSuperuser } : u));
            alert('Rol de usuario actualizado con éxito.');
        } catch (err) {
            setError(err.response?.data?.detail || 'Error al actualizar el rol del usuario');
            alert('Error al actualizar el rol del usuario: ' + (err.response?.data?.detail || err.message));
        }
    };

    if (loading) return <div className="text-center py-10">Cargando usuarios...</div>;
    if (error) return <div className="text-center py-10 text-red-500">Error: {error}</div>;

    if (!user || !user.is_superuser) {
        return <div className="text-center py-10 text-red-500">Acceso denegado. Solo superusuarios pueden gestionar roles.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Gestión de Usuarios y Roles</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
                    <thead className="bg-gray-800 text-white">
                        <tr>
                            <th className="py-3 px-4 text-left">ID</th>
                            <th className="py-3 px-4 text-left">Username</th>
                            <th className="py-3 px-4 text-left">Email</th>
                            <th className="py-3 px-4 text-left">Staff</th>
                            <th className="py-3 px-4 text-left">Superuser</th>
                            <th className="py-3 px-4 text-left">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-700">
                        {users.map((u) => (
                            <tr key={u.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-4">{u.id}</td>
                                <td className="py-3 px-4">{u.username}</td>
                                <td className="py-3 px-4">{u.email}</td>
                                <td className="py-3 px-4">
                                    <input
                                        type="checkbox"
                                        checked={u.is_staff}
                                        onChange={(e) => handleRoleChange(u.id, e.target.checked, u.is_superuser)}
                                        className="form-checkbox h-5 w-5 text-blue-600"
                                    />
                                </td>
                                <td className="py-3 px-4">
                                    <input
                                        type="checkbox"
                                        checked={u.is_superuser}
                                        onChange={(e) => handleRoleChange(u.id, u.is_staff, e.target.checked)}
                                        className="form-checkbox h-5 w-5 text-blue-600"
                                    />
                                </td>
                                <td className="py-3 px-4">
                                    {/* Add more actions if needed */}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagement;