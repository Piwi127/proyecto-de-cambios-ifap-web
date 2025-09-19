import React from 'react';
import { Routes, Route } from 'react-router-dom';
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
import ForoAulaVirtual from './pages/ForoAulaVirtual';
import MensajesAulaVirtual from './pages/MensajesAulaVirtual';
import NotificacionesAulaVirtual from './pages/NotificacionesAulaVirtual';
import TareasAulaVirtual from './pages/TareasAulaVirtual';
import ConfiguracionAulaVirtual from './pages/ConfiguracionAulaVirtual';
import ArchivisticaBasica from './pages/ArchivisticaBasica';
import GestionDigital from './pages/GestionDigital';
import ArchivosHistoricos from './pages/ArchivosHistoricos';
import PreservacionDocumentos from './pages/PreservacionDocumentos';

function App() {
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
            <ForoAulaVirtual />
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
      <Route path="/aula-virtual/configuracion" element={
        <ProtectedRoute>
          <AulaVirtualLayout>
            <ConfiguracionAulaVirtual />
          </AulaVirtualLayout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

export default App;
