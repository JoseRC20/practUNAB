import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from 'react-router-dom';
import LogoU from '../assets/Logo_Uandresbello.png';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, token, logout } = useAuth();   // ✅ usa user/token/logout del contexto
  const navigate = useNavigate();
  const isLoggedIn = !!token;

  // Decide where the brand link should go: anonymous users -> '/', logged-in -> role dashboard
  const brandTo = isLoggedIn
    ? (user?.role === 'student' ? '/HomeAlumno'
       : user?.role === 'admin' ? '/GestionUser'
       : user?.role === 'secretary' ? '/DashboardSecretaria'
       : user?.role === 'professor' ? '/professor/dashboard'
       : '/')
    : '/';

  const handleLogout = async () => {
    // (opcional) avisar al backend
    try {
      if (token) {
        await fetch(`${import.meta.env.VITE_API_BASE ?? 'http://localhost:5000/api'}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } finally {
      logout();                                  // ✅ limpia {user, token} y LS_KEY
      localStorage.removeItem('studentProfileCache'); // si usas esta caché
      navigate('/login', { replace: true });  // ✅ no vuelve con “Atrás”
    }
  };

  return (
    <div className="d-flex">
      <nav className="navbar navbar-expand-lg w-100" style={{ backgroundColor: '#be0000ff' }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <img
              src={LogoU}
              alt="Logo U"
              style={{ width: '89px', marginRight: 10, marginLeft: 20, marginBottom: 9 }}
            />

            <Link className="navbar-brand text-white text-decoration-none" to={brandTo}>
              <h1 className="mb-0">practUNAB</h1>
            </Link>
          </div>

          <div className="ms-auto d-flex align-items-center gap-3">
            {isLoggedIn && (
              <>
                {/* opcional: muestra usuario/rol */}
                <span className="text-white small">
                  {user?.name ? `${user.name} — ` : ''}{user?.role ?? 'sesión activa'}
                </span>
                <button className="btn btn-outline-light" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
}
