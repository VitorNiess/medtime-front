import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Contextos
import { AuthProvider } from './contexts/AuthContext';

// Pages
import HomePage from './pages/HomePage/HomePage';
import SignUpPage from './pages/SignUpPage/SignUpPage';
import LoginPage from './pages/LoginPage/LoginPage';
import NotFoundPage from './pages/NotFoundPage/NotFoundPage';

// Componentes
import Navbar from './components/Navbar/Navbar';
import Footer from './components/Footer/Footer';

// Guards
import RequireAuth from './routes/RequireAuth';
import RedirectIfAuth from './routes/RedirectIfAuth';

function App() {
  return (
    <AuthProvider>

      <div className="App">
        <Navbar />

        <Routes>
          <Route path="/" element={<HomePage />} />

          <Route path="/*" element={<NotFoundPage />} />

          <Route element={<RedirectIfAuth />}>
            <Route path="/cadastro" element={<SignUpPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Route>
          
        </Routes>

        <Footer />
      </div>

    </AuthProvider>
  );
}

export default App;