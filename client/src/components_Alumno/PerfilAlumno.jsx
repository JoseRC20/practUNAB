import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env?.VITE_API_BASE ?? "http://localhost:5000/api";
const PROFILE_CACHE_KEY = "studentProfileCache";

// helpers de caché segura
const safeSetProfileCache = (obj) => {
  try { localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(obj)); } catch {}
};
const safeGetProfileCache = () => {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch { return null; }
};

// mapea el perfil del backend al shape que muestra tu UI
const mapProfileToView = (p) => {
  const lastPractice = Array.isArray(p?.practices) && p.practices.length
    ? p.practices[p.practices.length - 1]
    : null;

  return {
    name: p?.Names || p?.user?.firstName || "",
    lastNamePaternal: p?.lastNamePaternal || p?.user?.lastNamePaternal || "",
    lastNameMaternal: p?.lastNameMaternal || p?.user?.lastNameMaternal || "",
    email: p?.institutionalEmail || p?.user?.email || "",
    rut: p?.rut || p?.user?.rut || "",
    phone: p?.phone || p?.user?.phone || "",
    supervisorName: lastPractice?.supervisorNombre || "",
    supervisorEmail: lastPractice?.supervisorEmail || "",
    startDate: lastPractice?.fechaInicioPractica || "",
    endDate: lastPractice?.fechaTerminoPractica || "",
    role: p?.user?.role || p?.role || "", // para chequear rol
  };
};

export default function PerfilAlumno({ initialProfile }) {
  const navigate = useNavigate();
  const { token, user: authUser, logout } = useAuth(); // si tu contexto aún no expone user/logout, quítalos
  const [profile, setProfile] = useState(null);         // objeto crudo del backend
  const [view, setView] = useState(null);               // objeto mapeado para la UI
  const [practiceStatus, setPracticeStatus] = useState("no iniciado");
  const [isEditingSupervisor, setIsEditingSupervisor] = useState(false);
  const [snapshot, setSnapshot] = useState(null);       // para cancelar edición
  const [loading, setLoading] = useState(false);

  const computeStatus = (p) => {
    const last = Array.isArray(p?.practices) && p.practices.length
      ? p.practices[p.practices.length - 1]
      : null;
    return last?.status || p?.status || "no iniciado";
  };

  const fetchProfile = async () => {
    // 1) perfil desde prop
    if (initialProfile) {
      const p = initialProfile;
      const v = mapProfileToView(p);
      setProfile(p);
      setView(v);
      setPracticeStatus(computeStatus(p));
      return;
    }

    // 2) si no hay token, no podemos pedir /me
    if (!token) return;

    // 3) intenta caché válida
    const cached = safeGetProfileCache();
    if (cached) {
      const v = mapProfileToView(cached);
      setProfile(cached);
      setView(v);
      setPracticeStatus(computeStatus(cached));
      // no retornamos; igual intentamos refrescar desde API en background
    }

    // 4) API
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/students/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        // sesión expirada
        try { logout?.(); } catch {}
        navigate("/login", { replace: true });
        return;
      }
      if (!res.ok) {
        console.error("Failed to fetch profile", await res.text());
        return;
      }
      const data = await res.json();
      const p = data?.profile || data || null;
      if (!p) return;

      const v = mapProfileToView(p);
      setProfile(p);
      setView(v);
      setPracticeStatus(computeStatus(p));
      safeSetProfileCache(p);

      // chequeo de rol a nivel de datos reales
      const role = v.role || authUser?.role || "";
      if (role && role !== "student") {
        alert("Acceso denegado. Solo los alumnos pueden acceder a esta página.");
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Error fetching profile in PerfilAlumno:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, initialProfile]);

  // Iniciar edición de datos de práctica (supervisor / fechas) solo si la práctica inició
  const handleSupervisorEdit = () => {
    if (!view) return;
    if (practiceStatus === "no iniciado" || practiceStatus === "") {
      alert("No puede editar datos de práctica hasta que la práctica comience.");
      return;
    }
    setSnapshot({ ...view });
    setIsEditingSupervisor(true);
  };

  // Guardar cambios (opcional: intenta API primero, luego actualiza caché/UI)
  const handleSave = async () => {
    if (!view) return;
    try {
      // Si tu backend expone un endpoint para actualizar datos de práctica, úsalo:
      // ejemplo (AJUSTA ruta y payload a tu API real):
      const payload = {
        supervisorNombre: view.supervisorName,
        supervisorEmail: view.supervisorEmail,
        fechaTerminoPractica: view.endDate,
      };
      if (token) {
        await fetch(`${API_BASE}/students/me/practice`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }).catch(() => {}); // si falla, igual seguimos con caché
      }

      // Refresca perfil desde API si quieres certeza; si no, actualiza caché local:
      const nextProfile = {
        ...(profile || {}),
        practices: Array.isArray(profile?.practices) && profile.practices.length
          ? [
              ...profile.practices.slice(0, -1),
              {
                ...profile.practices[profile.practices.length - 1],
                supervisorNombre: view.supervisorName,
                supervisorEmail: view.supervisorEmail,
                fechaTerminoPractica: view.endDate,
              },
            ]
          : profile?.practices,
      };
      setProfile(nextProfile);
      safeSetProfileCache(nextProfile);
      alert("Datos guardados exitosamente");
    } catch (e) {
      console.error(e);
      alert("No se pudo guardar. Intente más tarde.");
    } finally {
      setIsEditingSupervisor(false);
    }
  };

  const handleCancel = () => {
    if (snapshot) setView(snapshot);
    setIsEditingSupervisor(false);
  };

  // UI helpers
  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
  const isApprovedBySecretary = (practiceStatus || "").toLowerCase().includes("aprob");

  if (!view) {
    return (
      <div className="container mt-5">
        {loading ? (
          <div className="alert alert-info">Cargando perfil…</div>
        ) : (
          <div className="alert alert-warning" role="alert">
            No se encontraron datos de usuario.
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">
      <button className="btn btn-secondary mb-3" onClick={() => navigate("/HomeAlumno")}>
        Volver
      </button>
      <h2 className="text-center">Perfil Estudiante</h2>
      <span className="d-block w-50 bg-danger my-2 mx-auto mb-2" style={{ height: "5px" }}></span>
      <p>Aquí encontrará sus datos personales</p>

      <div className="card">
        <div className="card-header bg-danger text-white">
          <h2>Perfil de Usuario</h2>
        </div>
        <div className="card-body">
          <h4 className="card-title">
            {`${view.name} ${view.lastNamePaternal || ""} ${view.lastNameMaternal || ""}`.trim()}
          </h4>

          <p className="card-text mt-4">
            <strong>Correo Institucional:</strong> {view.email || "—"}
          </p>
          <p className="card-text mt-4">
            <strong>RUT:</strong> {view.rut || "—"}
          </p>
          <p className="card-text mt-4">
            <strong>Celular:</strong> {view.phone || "—"}
          </p>

          <p className="card-text">
            <strong>Estado de la Práctica:</strong> {practiceStatus || "no iniciado"}
          </p>

          {practiceStatus === "aprobado" ? (
            <>
              <hr />
              {!isEditingSupervisor ? (
                <>
                  <p className="card-text">
                    <strong>Supervisor:</strong> {view.supervisorName || "No asignado"}
                  </p>
                  <p className="card-text">
                    <strong>Correo del Supervisor:</strong> {view.supervisorEmail || "No asignado"}
                  </p>
                  <p className="card-text">
                    <strong>Fecha de inicio:</strong> {fmtDate(view.startDate)}
                  </p>
                  <p className="card-text">
                    <strong>Fecha de término:</strong> {fmtDate(view.endDate)}
                  </p>
                </>
              ) : (
                <>
                  <label className="form-label">Nombre del Supervisor:</label>
                  <input
                    type="text"
                    className="form-control mb-2"
                    value={view.supervisorName || ""}
                    onChange={(e) => setView({ ...view, supervisorName: e.target.value })}
                  />
                  <label className="form-label">Correo del Supervisor:</label>
                  <input
                    type="email"
                    className="form-control mb-2"
                    value={view.supervisorEmail || ""}
                    onChange={(e) => setView({ ...view, supervisorEmail: e.target.value })}
                  />
                  <label className="form-label">Fecha de término:</label>
                  <input
                    type="date"
                    className="form-control mb-2"
                    value={view.endDate ? view.endDate.slice(0, 10) : ""}
                    onChange={(e) => setView({ ...view, endDate: e.target.value })}
                    disabled={!isApprovedBySecretary}
                  />
                  {!isApprovedBySecretary && (
                    <div className="small text-muted">
                      La fecha de finalización solo puede ser editada si es aprobada por Secretaría.
                    </div>
                  )}
                </>
              )}
            </>
          ) : null}
        </div>

        <div className="card-footer text-end">
          {practiceStatus !== "no iniciado" && !isEditingSupervisor && (
            <button className="btn btn-primary me-2" onClick={handleSupervisorEdit}>
              Editar datos de práctica
            </button>
          )}

          {isEditingSupervisor && (
            <>
              <button className="btn btn-success me-2" onClick={handleSave}>
                Guardar Cambios
              </button>
              <button className="btn btn-secondary me-2" onClick={handleCancel}>
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
