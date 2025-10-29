import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function PerfilAlumno() {
  const [user, setUser] = useState(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [isEditingSupervisor, setIsEditingSupervisor] = useState(false);
  const [practiceStatus, setPracticeStatus] = useState(false);
  const [endDate, setEndDate] = useState(false);
  const [isApprovedBySecretary, setIsApprovedBySecretary] = useState(false);

  useEffect(() => {
    // Fetch user data from localStorage
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setEndDate(parsedUser.endDate || "");
    }
  }, []);

  const handleUserEdit = () => {
    setIsEditingUser(true);
  };

  const handleSupervisorEdit = () => {
    setIsEditingSupervisor(true);
  };

  const handleSave = () => {
    if (user) {
      localStorage.setItem("userData", JSON.stringify(user));
      alert("Datos guardados exitosamente");
    }
    setIsEditingUser(false);
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
          {isEditingUser ? (
            <>
              <label>Nombre:</label>
              <input
                type="text"
                className="form-control mb-2"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
              />
              <label>Correo:</label>
              <input
                type="email"
                className="form-control mb-2"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
              />
            </>
          ) : (
            <>
              <h4 className="card-title">{user.name}</h4>
              <p className="card-text">
                <strong>Correo:</strong> {user.email}
              </p>
            </>
          )}

          {isEditingSupervisor ? (
            <>
              <label>Nombre del Supervisor:</label>
              <input
                type="text"
                className="form-control mb-2"
                value={user.supervisorName || ""}
                onChange={(e) => setUser({ ...user, supervisorName: e.target.value })}
              />
              <label>Correo del Supervisor:</label>
              <input
                type="email"
                className="form-control mb-2"
                value={user.supervisorEmail || ""}
                onChange={(e) => setUser({ ...user, supervisorEmail: e.target.value })}
              />
            </>
          ) : (
            <>
              <p className="card-text">
                <strong>Supervisor:</strong> {user.supervisorName || "No asignado"}
              </p>
              <p className="card-text">
                <strong>Correo del Supervisor:</strong> {user.supervisorEmail || "No asignado"}
              </p>
            </>
          )}

          <p className="card-text">
            <strong>Estado de la Práctica:</strong> {practiceStatus}
          </p>
          <label>Fecha de Finalización:</label>
          <input
            type="date"
            className="form-control mb-2"
            value={endDate}
            onChange={handleEndDateChange}
            disabled={!isApprovedBySecretary}
          />
          <div className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="approvalCheck"
              checked={isApprovedBySecretary}
              onChange={(e) => setIsApprovedBySecretary(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="approvalCheck">
              Aprobado por Secretaría
            </label>
          </div>
        </div>
        <div className="card-footer text-end">
          {isEditingUser || isEditingSupervisor ? (
            <button className="btn btn-success me-2" onClick={handleSave}>
              Guardar Cambios
            </button>
          ) : (
            <>
              <button className="btn btn-primary me-2" onClick={handleUserEdit}>
                Editar Usuario
              </button>
              <button className="btn btn-primary me-2" onClick={handleSupervisorEdit}>
                Editar Supervisor
              </button>
            </>
          )}
          <button className="btn btn-secondary">Cerrar Sesión</button>
        </div>
      </div>
    </div>
  );
}