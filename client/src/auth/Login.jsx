import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env?.VITE_API_BASE ?? 'http://localhost:5000/api';

export default function Login() {
  const { role } = useParams();              // p.ej., /login/:role
  const navigate = useNavigate();
  const { token, login } = useAuth();        // 👈 una sola vez
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Solo informativo
    console.log('Login component - role from URL:', role);
    console.log('Token (context):', token);
  }, []); // eslint-disable-line

  const handleChange = (e) => {
    const { name, value } = e.target;
    // evita mutación: crea nueva copia
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resolveDest = (userRole) => {
    switch (userRole) {
      case 'student':   return '/HomeAlumno';
      case 'admin':     return '/GestionUser';
      case 'secretary': return '/DashboardSecretaria';
      case 'professor': return '/professor/dashboard';
      default:          return '/';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // si tu backend necesita role, puedes enviar: { ...formData, role }
        body: JSON.stringify({ email: formData.email.trim(), password: formData.password })
      });

      if (!resp.ok) {
        const err = await resp.json().catch(() => ({}));
        throw new Error(err.error || err.message || 'Error al iniciar sesión');
      }

      const data = await resp.json();

      // Compatibilidad: {tokens:{access}, user} o {token, user}
      const accessToken = data?.tokens?.access || data?.token;
      const userObj     = data?.user ?? null;

        if (!accessToken) throw new Error('No se recibió token de acceso.');
        const roleFromUrl = role || 'student';   // /login/:role
        if (!userObj) {
        userObj = { role: roleFromUrl, email: formData.email.trim() };
        } else if (!userObj.role) {
        userObj = { ...userObj, role: roleFromUrl };
        }

        // Guarda sesión completa en el contexto
        login({ user: userObj, token: accessToken });

        // Redirige según rol (inmediato)
        const dest = userObj.role === 'student' ? '/HomeAlumno'
                : userObj.role === 'admin' ? '/GestionUser'
                : userObj.role === 'secretary' ? '/DashboardSecretaria'
                : userObj.role === 'professor' ? '/professor/dashboard'
                : '/';
        navigate(dest, { replace: true });
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 480 }}>
      <h1 className="mb-3">Login</h1>
      <form onSubmit={handleSubmit} className="card p-4">
        <div className="mb-3">
          <label htmlFor="email" className="form-label">Correo Electrónico</label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            placeholder="correoinstitucional@uandresbello.edu"
            value={formData.email}
            onChange={handleChange}
            autoComplete="username"
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Contraseña</label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            placeholder="Su rut (sin puntos ni guión)"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Ingresando…' : 'Iniciar sesión'}
        </button>
      </form>
    </div>
  );
}
