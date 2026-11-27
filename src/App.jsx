import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AuthProvider from './auth/AuthProvider';
import { RequireAuth, RequireRole } from './auth/RequireAuth';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MedicamentosPage from './pages/MedicamentosPage';
import IntegrantesPage from './pages/IntegrantesPage';
import CuidadoresPage from './pages/CuidadoresPage';
import ConsultasPage from './pages/ConsultasPage';
import StockPage from './pages/StockPage';
import MedicosPage from './pages/MedicosPage';
import RecetasPage from './pages/RecetasPage';
import EstudiosPage from './pages/EstudiosPage';
import VacunacionPage from './pages/VacunacionPage';
import CartillaVacunacionPage from './pages/CartillaVacunacionPage';
import AlertasPage from './pages/AlertasPage';
import SettingsPage from './pages/SettingsPage';
import ProfileSecurityPage from './pages/ProfileSecurityPage';

const PAGE_METADATA = {
  '/': {
    title: 'Login',
    description: 'Inicia sesión en MiSalud Familiar para administrar la salud de tu familia.',
  },
  '/registrarme': {
    title: 'Registro',
    description: 'Crea una cuenta en MiSalud Familiar.',
  },
  '/dashboard': {
    title: 'Inicio',
    description: 'Resumen de la información médica de tu familia.',
  },
  '/medicamentos': {
    title: 'Medicamentos',
    description: 'Administra los medicamentos de tu familia.',
  },
  '/integrantes': {
    title: 'Integrantes',
    description: 'Consulta y administra los integrantes de tu familia.',
  },
  '/configuracion/cuidadores': {
    title: 'Cuidadores',
    description: 'Administra los cuidadores de tu familia.',
  },
  '/configuracion/perfil': {
    title: 'Perfil y seguridad',
    description: 'Consulta y administra tus datos personales y opciones de seguridad.',
  },
  '/configuracion': {
    title: 'Configuración',
    description: 'Administra las opciones de configuración de tu cuenta y familia.',
  },
  '/consultas': {
    title: 'Consultas',
    description: 'Organiza las consultas médicas de tu familia.',
  },
  '/stock': {
    title: 'Stock',
    description: 'Consulta el inventario de medicamentos.',
  },
  '/alertas': {
    title: 'Alertas',
    description: 'Consulta las notificaciones de tu familia.',
  },
  '/medicos': {
    title: 'Médicos',
    description: 'Consulta y administra la información de médicos.',
  },
  '/recetas': {
    title: 'Recetas',
    description: 'Consulta las recetas médicas de tu familia.',
  },
  '/estudios': {
    title: 'Estudios',
    description: 'Consulta los estudios médicos de tu familia.',
  },
  '/vacunacion': {
    title: 'Vacunación',
    description: 'Administra la vacunación de los integrantes de tu familia.',
  },
  '/vacunacion/cartilla': {
    title: 'Cartilla de vacunación',
    description: 'Consulta y administra la cartilla de vacunación.',
  },
};

function PageMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = PAGE_METADATA[pathname] ?? {
      title: 'MiSalud Familiar',
      description: 'Organiza la salud de tu familia con MiSalud Familiar.',
    };

    document.title = `${metadata.title} | MiSalud Familiar`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', metadata.description);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <PageMetadata />
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/registrarme" element={<RegisterPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/medicamentos" element={<MedicamentosPage />} />
            <Route path="/integrantes" element={<IntegrantesPage />} />
            <Route path="/configuracion" element={<SettingsPage />} />
            <Route path="/configuracion/perfil" element={<ProfileSecurityPage />} />
            <Route path="/consultas" element={<ConsultasPage />} />
            <Route path="/stock" element={<StockPage />} />
            <Route path="/alertas" element={<AlertasPage />} />
            <Route path="/medicos" element={<MedicosPage />} />
            <Route path="/recetas" element={<RecetasPage />} />
            <Route path="/estudios" element={<EstudiosPage />} />
            <Route path="/vacunacion" element={<VacunacionPage />} />
            <Route path="/vacunacion/cartilla" element={<CartillaVacunacionPage />} />
            <Route element={<RequireRole roles={['ADMIN']} />}>
              <Route path="/cuidadores" element={<Navigate to="/configuracion/cuidadores" replace />} />
              <Route path="/configuracion/cuidadores" element={<CuidadoresPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
