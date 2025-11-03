import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';

export default function PerfilAlumno({ profile }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  // identity editing disabled in this view
  const [isEditingSupervisor, setIsEditingSupervisor] = useState(false);
  const [originalUser, setOriginalUser] = useState(null);
  const [practiceStatus, setPracticeStatus] = useState(false);
  const [endDate, setEndDate] = useState(false);
  const [isApprovedBySecretary, setIsApprovedBySecretary] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
  // Re-run when `profile` changes (e.g. after async login/fetch)

  const mapProfileToUser = (profile) => ({
    name: profile.Names || (profile.user && profile.user.firstName) || '',
    lastNamePaternal: profile.lastNamePaternal || (profile.user && profile.user.lastNamePaternal) || '',
    lastNameMaternal: profile.lastNameMaternal || (profile.user && profile.user.lastNameMaternal) || '',
    email: profile.institutionalEmail || (profile.user && profile.user.email) || '',
    rut: profile.rut || (profile.user && profile.user.rut) || '',
    phone: profile.phone || (profile.user && profile.user.phone) || '',
    supervisorName:
      profile.practices && profile.practices.length
        ? profile.practices[profile.practices.length - 1].supervisorNombre
        : '',
    supervisorEmail:
      profile.practices && profile.practices.length
        ? profile.practices[profile.practices.length - 1].supervisorEmail
        : '',
    startDate:
      profile.practices && profile.practices.length
        ? profile.practices[profile.practices.length - 1].fechaInicioPractica
        : '',
    endDate:
      profile.practices && profile.practices.length
        ? profile.practices[profile.practices.length - 1].fechaTerminoPractica
        : '',
    practiceStatus:
      profile.practices && profile.practices.length
        ? profile.practices[profile.practices.length - 1].status
        : profile.status || 'no iniciado',
  });

  if (profile) {
    const mapped = {
      name: profile.Names || (profile.user && profile.user.firstName) || '',
      lastNamePaternal: profile.lastNamePaternal || (profile.user && profile.user.lastNamePaternal) || '',
      lastNameMaternal: profile.lastNameMaternal || (profile.user && profile.user.lastNameMaternal) || '',
      rut: profile.rut || (profile.user && profile.user.rut) || '',
      email: profile.institutionalEmail || (profile.user && profile.user.email) || '',
      phone: profile.phone || (profile.user && profile.user.phone) || '',
      supervisorName:
        profile.practices && profile.practices.length
          ? profile.practices[profile.practices.length - 1].supervisorNombre
          : '',
      supervisorEmail:
        profile.practices && profile.practices.length
          ? profile.practices[profile.practices.length - 1].supervisorEmail
          : '',
      startDate:
        profile.practices && profile.practices.length
          ? profile.practices[profile.practices.length - 1].fechaInicioPractica
          : '',
      endDate:
        profile.practices && profile.practices.length
          ? profile.practices[profile.practices.length - 1].fechaTerminoPractica
          : '',
      practiceStatus:
        profile.practices && profile.practices.length
          ? profile.practices[profile.practices.length - 1].status
          : profile.status || 'no iniciado',
    };
    setUser(mapped);
    setEndDate(mapped.endDate || "");
    setPracticeStatus(mapped.practiceStatus || 'no iniciado');
    setIsApprovedBySecretary((mapped.practiceStatus || '') === 'aprobado');
  } else {
    // If no profile prop, try to fetch the student's profile using the token
    const fetchProfile = async () => {
      // try localStorage first
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setEndDate(parsedUser.endDate || "");
          setPracticeStatus(parsedUser.practiceStatus || parsedUser.status || 'no iniciado');
          setIsApprovedBySecretary((parsedUser.practiceStatus || parsedUser.status || '') === 'aprobado');
          return;
        } catch (e) {
          console.error("Failed to parse userData from localStorage", e);
        }
      }

      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/api/students/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
          console.error('Failed to fetch student profile', await res.text());
          return;
        }
        const data = await res.json();
        const p = data.profile || data;
        const mapped = mapProfileToUser(p);
        setUser(mapped);
        setEndDate(mapped.endDate || "");
        setPracticeStatus(mapped.practiceStatus || 'no iniciado');
        setIsApprovedBySecretary((mapped.practiceStatus || '') === 'aprobado');
      } catch (err) {
        console.error('Error fetching profile in PerfilAlumno:', err);
      }
    };
    fetchProfile();
  }
}, [profile, token]);

  // identity editing disabled (no-op)

  const handleSupervisorEdit = () => {
    // allow editing supervisor data only if practice has started
    if (practiceStatus === 'no iniciado' || practiceStatus === '') {
      alert('No puede editar datos de práctica hasta que la práctica comience.');
      return;
    }
    setOriginalUser(user ? { ...user } : null);
    setIsEditingSupervisor(true);
  };

  const handleSave = () => {
    if (user) {
      localStorage.setItem("userData", JSON.stringify(user));
      alert("Datos guardados exitosamente");
    }
    setIsEditingSupervisor(false);
  };

  const handleCancel = () => {
    // restore snapshot on cancel
    if (originalUser) {
      setUser(originalUser);
    }
    setIsEditingSupervisor(false);
  };

  const handleLogout = async () => {
      const token = localStorage.getItem("authToken");
      // optional: notify backend (silently ignore errors)
      if (token) {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {});
        } catch (e) { /* ignore */ }
      }
      // remove client-side auth data
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      // if you use an auth context with saveToken, call it here (uncomment):
      // const { saveToken } = useAuth(); saveToken(null);
      navigate("/login/student");
  };

  const handleEndDateChange = (e) => {
    if (isApprovedBySecretary) {
      setEndDate(e.target.value);
    } else {
      alert("La fecha de finalización solo puede ser editada si es aprobada por la secretaría.");
    }
  };

  if (!user) {
    return (
      <div className="container mt-5">
        <div className="alert alert-warning" role="alert">
          No se encontraron datos de usuario. Por favor, regístrese primero.
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <button className="btn btn-secondary mb-3" onClick={() => navigate('/HomeAlumno')}>Volver</button>
      <h2 className="text-center">Perfil Estudiante</h2>
      <span className="d-block w-50 bg-danger my-2 mx-auto mb-2" style={{height:'5px'}}></span>
      <p>Aquí encontrará sus datos personales</p>
      <div className="card">
        <div className="card-header bg-danger text-white">
          <h2>Perfil de Usuario</h2>
        </div>
        <div className="card-body">
            <h4 className="card-title">{`${user.name} ${user.lastNamePaternal || ''} ${user.lastNameMaternal || ''}`.trim()}</h4>
            <p className="card-text mt-4">
              <strong>Correo Institucional:</strong> {user.email}
            </p>
            <p className="card-text mt-4">
              <strong>RUT:</strong> {user.rut}
            </p>
            <p className="card-text mt-4">
              <strong>Celular:</strong> {user.phone}
            </p>

          {/* Show practice status */}
          <p className="card-text">
            <strong>Estado de la Práctica:</strong> {practiceStatus || 'no iniciado'}
          </p>

          {/* If the practice is approved, show supervisor and dates */}
          {practiceStatus === 'aprobado' ? (
            <>
              <hr />
              {!isEditingSupervisor ? (
                <>
                  <p className="card-text">
                    <strong>Supervisor:</strong> {user.supervisorName || 'No asignado'}
                  </p>
                  <p className="card-text">
                    <strong>Correo del Supervisor:</strong> {user.supervisorEmail || 'No asignado'}
                  </p>
                  <p className="card-text">
                    <strong>Fecha de inicio:</strong> {user.startDate ? new Date(user.startDate).toLocaleDateString() : '—'}
                  </p>
                  <p className="card-text">
                    <strong>Fecha de término:</strong> {user.endDate ? new Date(user.endDate).toLocaleDateString() : '—'}
                  </p>
                </>
              ) : (
                // Editing supervisor data: allow editing supervisorName, supervisorEmail and endDate only
                <>
                  <label>Nombre del Supervisor:</label>
                  <input
                    type="text"
                    className="form-control mb-2"
                    value={user.supervisorName || ''}
                    onChange={(e) => setUser({ ...user, supervisorName: e.target.value })}
                  />
                  <label>Correo del Supervisor:</label>
                  <input
                    type="email"
                    className="form-control mb-2"
                    value={user.supervisorEmail || ''}
                    onChange={(e) => setUser({ ...user, supervisorEmail: e.target.value })}
                  />
                  <label>Fecha de término:</label>
                  <input
                    type="date"
                    className="form-control mb-2"
                    value={user.endDate || ''}
                    onChange={(e) => setUser({ ...user, endDate: e.target.value })}
                  />
                </>
              )}
            </>
          ) : null}
        </div>
        <div className="card-footer text-end">
          {isEditingSupervisor ? (
            <>
              <button className="btn btn-success me-2" onClick={handleSave}>
                Guardar Cambios
              </button>
              <button className="btn btn-secondary me-2" onClick={handleCancel}>
                Cancelar
              </button>
            </>
          ) : (
            <>
              {practiceStatus !== 'no iniciado' && (
                <button className="btn btn-primary me-2" onClick={handleSupervisorEdit}>
                  Editar datos de práctica
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}