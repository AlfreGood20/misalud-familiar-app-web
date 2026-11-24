import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MedicamentosPage from './pages/MedicamentosPage';
import IntegrantesPage from './pages/IntegrantesPage';
import CuidadoresPage from './pages/CuidadoresPage';
import ConsultasPage from './pages/ConsultasPage';
import StockPage from './pages/StockPage';
import MedicosPage from './pages/MedicosPage';
import EstudiosPage from './pages/EstudiosPage';
import VacunacionPage from './pages/VacunacionPage';
import CartillaVacunacionPage from './pages/CartillaVacunacionPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/registrarme" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/medicamentos" element={<MedicamentosPage />} />
        <Route path="/integrantes" element={<IntegrantesPage />} />
        <Route path="/cuidadores" element={<CuidadoresPage />} />
        <Route path="/consultas" element={<ConsultasPage />} />
        <Route path="/stock" element={<StockPage />} />
        <Route path="/medicos" element={<MedicosPage />} />
        <Route path="/estudios" element={<EstudiosPage />} />
        <Route path="/vacunacion" element={<VacunacionPage />} />
        <Route path="/vacunacion/cartilla" element={<CartillaVacunacionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
