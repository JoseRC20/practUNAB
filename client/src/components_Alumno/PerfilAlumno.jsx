import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PerfilAlumno({ profile }) {
  const [user, setUser] = useState(null);
  // identity editing disabled in this view
  const [isEditingSupervisor, setIsEditingSupervisor] = useState(false);
  const [originalUser, setOriginalUser] = useState(null);
  const [practiceStatus, setPracticeStatus] = useState(false);
  const [endDate, setEndDate] = useState(false);
  const [isApprovedBySecretary, setIsApprovedBySecretary] = useState(false);

  useEffect(() => {
    // If a profile prop is provided (from API), use it; otherwise fallback to localStorage
    if (profile) {
      // Map profile fields into local user shape expected by this component
      const mapped = {
        name: profile.Names || (profile.user && profile.user.firstName) || '',
        lastNamePaternal: profile.lastNamePaternal || (profile.user && profile.user.lastNamePaternal) || '',
        email: profile.institutionalEmail || (profile.user && profile.user.email) || '',
        supervisorName: profile.practices && profile.practices.length ? profile.practices[profile.practices.length - 1].supervisorNombre : '',
        supervisorEmail: profile.practices && profile.practices.length ? profile.practices[profile.practices.length - 1].supervisorEmail : '',
        startDate: profile.practices && profile.practices.length ? profile.practices[profile.practices.length - 1].fechaInicioPractica : '',
        endDate: profile.practices && profile.practices.length ? profile.practices[profile.practices.length - 1].fechaTerminoPractica : '',
        practiceStatus: profile.practices && profile.practices.length ? profile.practices[profile.practices.length - 1].status : profile.status || '',
      };
  setUser(mapped);
      setEndDate(mapped.endDate || "");
      setPracticeStatus(mapped.practiceStatus || false);
      setIsApprovedBySecretary((mapped.practiceStatus || '') === 'aprobado');
    } else {
      // Fetch user data from localStorage as a fallback
      const storedUser = localStorage.getItem("userData");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setEndDate(parsedUser.endDate || "");
      }
    }
  }, []);

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
    <div className="container mt-5">
      <div className="card">
        <div className="card-header bg-danger text-white">
          <h2>Perfil de Usuario</h2>
        </div>
        <div className="card-body">
            <h4 className="card-title">{`${user.name} ${user.apellidoP || ''}`.trim()}</h4>
            <p className="card-text mt-4">
              <strong>Correo Institucional:</strong> {user.email}
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
          <button className="btn btn-secondary">Cerrar Sesión</button>
        </div>
      </div>
    </div>
  );
}