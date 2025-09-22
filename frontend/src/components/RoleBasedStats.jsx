import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { userService } from '../services/userService.js';
import { courseService } from '../services/courseService.js';
import Card from './Card';

const RoleBasedStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = useCallback(async () => {
    try {
      const [roleSummary, coursesData] = await Promise.all([
        userService.getRoleSummary(),
        courseService.getAllCourses()
      ]);
      const courses = coursesData.results || coursesData || [];
      setStats({
        totalUsers: roleSummary.total_users || 0,
        totalInstructors: roleSummary.instructors || 0,
        totalStudents: roleSummary.students || 0,
        totalCourses: courses.length,
        activeCourses: courses.filter(c => c.is_active).length
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      setStats({});
    }
  }, []);

  const fetchInstructorStats = useCallback(async () => {
    try {
      const coursesData = await courseService.getAllCourses();
      const courses = coursesData.results || coursesData || [];
      const myCourses = courses.filter(course =>
        course.instructor === user.id ||
        course.instructor_name === user.username
      );
      setStats({
        totalCourses: myCourses.length,
        activeCourses: myCourses.filter(c => c.is_active).length,
        totalStudents: myCourses.reduce((sum, course) => sum + (course.enrolled_count || 0), 0),
        pendingAssignments: 0 // Esto se puede implementar cuando tengamos el endpoint
      });
    } catch (error) {
      console.error('Error fetching instructor stats:', error);
      setStats({});
    }
  }, [user]);

  const fetchStudentStats = useCallback(async () => {
    try {
      const coursesData = await courseService.getAllCourses();
      const courses = coursesData.results || coursesData || [];
      const enrolledCourses = courses.filter(course =>
        course.is_enrolled || course.students?.includes(user.id)
      );
      setStats({
        enrolledCourses: enrolledCourses.length,
        activeCourses: enrolledCourses.filter(c => c.is_active).length,
        completedAssignments: 0, // Implementar cuando tengamos el endpoint
        pendingAssignments: 0 // Implementar cuando tengamos el endpoint
      });
    } catch (error) {
      console.error('Error fetching student stats:', error);
      setStats({});
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const role = userService.getUserRole(user);
        
        switch (role) {
          case 'admin':
            await fetchAdminStats();
            break;
          case 'instructor':
            await fetchInstructorStats();
            break;
          case 'student':
            await fetchStudentStats();
            break;
          default:
            setStats({});
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user, fetchAdminStats, fetchInstructorStats, fetchStudentStats]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-20 bg-gray-200 rounded"></div>
          </Card>
        ))}
      </div>
    );
  }

  const role = userService.getUserRole(user);

  const renderAdminStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-500 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-500 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Docentes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalInstructors}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-500 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Estudiantes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-orange-500 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeCourses}</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderInstructorStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-500 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Mis Cursos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-500 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeCourses}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-500 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-orange-500 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Tareas Pendientes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderStudentStats = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-500 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Cursos Inscritos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.enrolledCourses}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-500 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeCourses}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-500 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Tareas Completadas</p>
            <p className="text-2xl font-bold text-gray-900">{stats.completedAssignments}</p>
          </div>
        </div>
      </Card>

      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-orange-500 text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Tareas Pendientes</p>
            <p className="text-2xl font-bold text-gray-900">{stats.pendingAssignments}</p>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderStats = () => {
    const role = userService.getUserRole(user);
    switch (role) {
      case 'admin':
        return renderAdminStats();
      case 'instructor':
        return renderInstructorStats();
      case 'student':
        return renderStudentStats();
      default:
        return (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-gray-600 mb-4">No se pudo determinar el rol del usuario</p>
            <p className="text-sm text-gray-500">
              Usuario: {user?.username || 'No identificado'}<br/>
              Rol detectado: {role}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800 mb-8">Estadísticas Basadas en Rol</h2>
      {renderStats()}
    </div>
  );
};

export default RoleBasedStats;