import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Contextos
import { AuthProvider } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage/HomePage';
import SignUpPage from './pages/SignUpPage/SignUpPage';
import LoginPage from './pages/LoginPage/LoginPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';
import HelpPage from './pages/HelpPage/HelpPage';

import Home from './pages/Home/Home';
import PatientHome from './pages/PatientHome/PatientHome';
import ClinicsSearchPage from './pages/ClinicsSearchPage/ClinicsSearchPage';
import DoctorsSearchPage from './pages/DoctorsSearchPage/DoctorsSearchPage';

import HomeClinics from './pages/HomeClinics/HomeClinics';

import AdminUsersPage from './pages/AdminUsersPage/AdminUsersPage';

// Componentes
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// Guards
import RequireAuth from './routes/RequireAuth';
import RedirectIfAuth from './routes/RedirectIfAuth';

// Estilos
import u from './styles/base/utilities.module.css'

function App() {
  return (
    <AuthProvider>

      <div className="App">
        <Navbar />

        <main className={u.mainGrow}>
          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/*" element={<NotFoundPage />} />

            <Route path="/clinics" element={<HomeClinics />} />

            <Route path="/ajuda" element={<HelpPage />} />

            <Route element={<RedirectIfAuth />}>
              <Route path="/cadastro" element={<SignUpPage />} />
              <Route path="/login" element={<LoginPage />} />

              <Route path="/clinics/cadastro" element={<SignUpPage />} />
              <Route path="/clinics/login" element={<LoginPage />} />
            </Route>

            <Route element={<RequireAuth />}>
              <Route path="/home" element={<Home />} />
              <Route path="/agenda" element={<PatientHome />} />
              <Route path="/unidades" element={<ClinicsSearchPage />} />
              <Route path="/medicos" element={<DoctorsSearchPage />} />

              <Route path="/adm/users" element={<AdminUsersPage />} />

            </Route>
            
          </Routes>
        </main>

        <Footer />
      </div>

    </AuthProvider>
  );
}

export default App;