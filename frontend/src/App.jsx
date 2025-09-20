import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import useWebSocket from './hooks/useWebSocket';
import Layout from './components/Layout';
import AulaVirtualLayout from './components/AulaVirtualLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomeModern from './pages/HomeModern';
import About from './pages/About';
import Contacto from './pages/Contacto';
import Blog from './pages/Blog';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardAulaVirtual from './pages/DashboardAulaVirtual';
import PerfilEstudiante from './pages/PerfilEstudiante';
import CursosAulaVirtual from './pages/CursosAulaVirtual';
import CalendarioAulaVirtual from './pages/CalendarioAulaVirtual';
import BibliotecaAulaVirtual from './pages/BibliotecaAulaVirtual';
import QuizzesAulaVirtual from './pages/QuizzesAulaVirtual';
import QuizCreate from './pages/QuizCreate';
import QuizManage from './pages/QuizManage';
import QuizEdit from './pages/QuizEdit';
import QuizTemplates from './pages/QuizTemplates';
import QuizImportExport from './pages/QuizImportExport';
import CalificacionesAulaVirtual from './pages/CalificacionesAulaVirtual';
import Foro from './pages/Foro';
import ForoTema from './pages/ForoTema';
import MensajesAulaVirtual from './pages/MensajesAulaVirtual';
import NotificacionesAulaVirtual from './pages/NotificacionesAulaVirtual';
import TareasAulaVirtual from './pages/TareasAulaVirtual';
import Tareas from './pages/Tareas';
import TareaDetalle from './pages/TareaDetalle';
import TareaForm from './pages/TareaForm';
import AsignacionDetalle from './pages/AsignacionDetalle';
import Biblioteca from './components/aula-virtual/biblioteca/Biblioteca';
import CategoriasGestion from './components/aula-virtual/biblioteca/CategoriasGestion';
import EstadisticasBiblioteca from './components/aula-virtual/biblioteca/EstadisticasBiblioteca';
import ConfiguracionAulaVirtual from './pages/ConfiguracionAulaVirtual';
import ArchivisticaBasica from './pages/ArchivisticaBasica';
import GestionDigital from './pages/GestionDigital';
import ArchivosHistoricos from './pages/ArchivosHistoricos';
import VideoConferencePage from './pages/VideoConferencePage';
import ColaboracionPage from './pages/ColaboracionPage';
import PreservacionDocumentos from './pages/PreservacionDocumentos';
import ProgramaArchivisticaBasica from './pages/ProgramaArchivisticaBasica';
import ProgramaGestionDigital from './pages/ProgramaGestionDigital';
import ProgramaArchivosHistoricos from './pages/ProgramaArchivosHistoricos';
import ProgramaPreservacionDocumentos from './pages/ProgramaPreservacionDocumentos';
import DashboardProfesor from './pages/DashboardProfesor';
import UserManagement from './pages/UserManagement';
import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/AdminCourses';
import AdminPermissions from './pages/AdminPermissions';
import AdminSystemSettings from './pages/AdminSystemSettings';
import AdminReports from './pages/AdminReports';

function App() {
  const notifications = useWebSocket();

  useEffect(() => {
    if (notifications.length > 0) {
      // Handle new notifications, e.g., display a toast or update a notification count
      console.log('New notification received:', notifications[0]);
      // You might want to add more sophisticated handling here, like a global state update
    }
  }, [notifications]);

  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/" element={<Layout><HomeModern /></Layout>} />
      <Route path="/nosotros" element={<Layout><About /></Layout>} />
      <Route path="/contacto" element={<Layout><Contacto /></Layout>} />
      <Route path="/blog" element={<Layout><Blog /></Layout>} />
      <Route path="/login" element={<Layout><Login /></Layout>} />
      <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />

      {/* Rutas de cursos públicos */}
      <Route path="/courses/all" element={<Layout><CursosAulaVirtual /></Layout>} />
      <Route path="/archivistica-basica" element={<Layout><ArchivisticaBasica /></Layout>} />
      <Route path="/gestion-digital" element={<Layout><GestionDigital /></Layout>} />
      <Route path="/archivos-historicos" element={<Layout><ArchivosHistoricos /></Layout>} />
      <Route path="/preservacion-documentos" element={<Layout><PreservacionDocumentos /></Layout>} />

      {/* Rutas de programas detallados */}
      <Route path="/programa/archivistica-basica" element={<Layout><ProgramaArchivisticaBasica /></Layout>} />
      <Route path="/programa/gestion-digital" element={<Layout><ProgramaGestionDigital /></Layout>} />
      <Route path="/programa/archivos-historicos" element={<Layout><ProgramaArchivosHistoricos /></Layout>} />
      <Route path="/programa/preservacion-documentos" element={<Layout><ProgramaPreservacionDocumentos /></Layout>} />

      {/* Rutas del aula virtual (protegidas) */}
      <Route path="/aula-virtual" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <DashboardAulaVirtual />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/perfil" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <PerfilEstudiante />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/cursos" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <CursosAulaVirtual />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/calendario" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <CalendarioAulaVirtual />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/foro" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <Foro />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/foro/tema/:topicId" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <ForoTema />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/mensajes" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <MensajesAulaVirtual />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/notificaciones" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <NotificacionesAulaVirtual />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/tareas" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <TareasAulaVirtual />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/tareas/lista" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <Tareas />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/tareas/crear" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <TareaForm />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/tareas/editar/:id" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <TareaForm />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/tareas/:id" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <TareaDetalle />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/asignaciones/:id" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <AsignacionDetalle />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/biblioteca" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <BibliotecaAulaVirtual />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/biblioteca/archivos" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <Biblioteca />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/biblioteca/categorias" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <CategoriasGestion />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/biblioteca/estadisticas" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <EstadisticasBiblioteca />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/quizzes" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <QuizzesAulaVirtual />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/quizzes/create" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <QuizCreate />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/quizzes/manage/:id" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <QuizManage />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/quizzes/edit/:id" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <QuizEdit />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/quizzes/templates" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <QuizTemplates />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/quizzes/import-export" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <QuizImportExport />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/calificaciones" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <CalificacionesAulaVirtual />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/configuracion-sistema" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <ConfiguracionAulaVirtual />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/videoconferencia" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <VideoConferencePage />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/colaboracion" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <ColaboracionPage />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/dashboard-profesor" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <DashboardProfesor />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/aula-virtual/user-management" element={
        <ProtectedRoute requiredRole="superuser">
          <AulaVirtualLayout>
            <UserManagement />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="superuser">
          <AulaVirtualLayout>
            <AdminDashboard />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/courses" element={
        <ProtectedRoute requiredRole="superuser">
          <AulaVirtualLayout>
            <AdminCourses />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/permissions" element={
        <ProtectedRoute requiredRole="superuser">
          <AulaVirtualLayout>
            <AdminPermissions />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/settings" element={
        <ProtectedRoute requiredRole="superuser">
          <AulaVirtualLayout>
            <AdminSystemSettings />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedRoute requiredRole="superuser">
          <AulaVirtualLayout>
            <AdminReports />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
