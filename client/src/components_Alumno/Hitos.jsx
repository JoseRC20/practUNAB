import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE = import.meta.env?.VITE_API_BASE ?? "http://localhost:5000/api";
const PROFILE_CACHE_KEY = "studentProfileCache";

const safeSetProfileCache = (obj) => {
  try {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(obj));
  } catch {}
};
const safeGetProfileCache = () => {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

export default function Hitos() {
  const { token, user, logout } = useAuth(); // user puede ser null si tu contexto aún no lo maneja
  const navigate = useNavigate();

  const [hito1File, setHito1File] = useState(null);
  const [hito2File, setHito2File] = useState(null);
  const [hitosMap, setHitosMap] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getToken = () => token || localStorage.getItem("authToken") || null;

  const buildMap = (arr) => {
    const map = {};
    (Array.isArray(arr) ? arr : []).forEach((h) => {
      const n = h?.milestoneNumber;
      if (n !== undefined && n !== null) {
        map[n] = {
          status: h?.status || "no_iniciado",
          reviewerComments: h?.reviewerComments || "",
          files: Array.isArray(h?.files) ? h.files : [],
          submittedAt: h?.submittedAt || null,
          reviewedAt: h?.reviewedAt || null,
          _id: h?._id,
        };
      }
    });
    return map;
  };

  const fetchProfile = async (tk) => {
    // 1) intenta user del contexto
    if (user && (user._id || user.id)) {
      return { profile: { user, _id: user._id || user.id } };
    }

    // 2) intenta caché válida
    const cached = safeGetProfileCache();
    if (
      cached &&
      (cached._id ||
        cached.id ||
        (cached.user && (cached.user._id || cached.user.id)))
    ) {
      return { profile: cached };
    }

    // 3) pide al backend
    const res = await fetch(`${API_BASE}/students/me`, {
      headers: { Authorization: `Bearer ${tk}` },
    });
    if (res.status === 401) throw new Error("AUTH_401");
    if (!res.ok) throw new Error("PROFILE_FETCH_FAIL");
    const body = await res.json();
    const profile = body?.profile || body || null;
    if (profile) safeSetProfileCache(profile);
    return { profile };
  };

  const fetchHitos = async (tk, studentId) => {
    const res = await fetch(
      `${API_BASE}/hitos/student/${encodeURIComponent(String(studentId))}`,
      {
        headers: { Authorization: `Bearer ${tk}` },
      }
    );
    if (res.status === 401) throw new Error("AUTH_401");
    if (!res.ok) throw new Error("HITOS_FETCH_FAIL");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  };

  const fetchProfileAndHitos = async () => {
    setLoading(true);
    setMessage("");
    try {
      const tk = getToken();
      if (!tk) {
        setMessage("Debe iniciar sesión para ver/subir hitos.");
        return;
      }

      // Perfil / ID
      const { profile } = await fetchProfile(tk);
      const studentProfileId =
        profile?._id ||
        profile?.id ||
        profile?.user?._id ||
        profile?.user?.id ||
        null;

      if (!studentProfileId) {
        setMessage("ID de usuario no disponible. Vuelva a iniciar sesión.");
        return;
      }

      // Hitos
      const arr = await fetchHitos(tk, studentProfileId);
      setHitosMap(buildMap(arr));
    } catch (err) {
      console.error(err);
      if (err.message === "AUTH_401") {
        setMessage("Sesión expirada. Inicia sesión nuevamente.");
        try {
          logout?.();
        } catch {}
        navigate("/login", { replace: true });
      } else if (err.message === "PROFILE_FETCH_FAIL") {
        setMessage("No se pudo obtener perfil de usuario.");
      } else if (err.message === "HITOS_FETCH_FAIL") {
        setMessage("No se pudieron obtener los hitos.");
      } else {
        setMessage("Error al contactar el servidor.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndHitos(); /* eslint-disable-next-line */
  }, []);

  const handleFileChange = (e, setFile) => setFile(e.target.files?.[0] || null);

  const uploadFileForMilestone = async (file, milestoneNumber) => {
    if (!file) return null;
    const tk = getToken();
    if (!tk) throw new Error("AUTH_401");

    const form = new FormData();
    form.append("file", file);
    form.append("milestoneNumber", String(milestoneNumber));
    form.append("title", `Hito ${milestoneNumber}`);

    const res = await fetch(`${API_BASE}/hitos`, {
      method: "POST",
      headers: { Authorization: `Bearer ${tk}` }, // no pongas Content-Type aquí
      body: form,
    });
    if (res.status === 401) throw new Error("AUTH_401");
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: "Upload failed" }));
      throw new Error(err.message || `Upload failed (${res.status})`);
    }
    return res.json();
  };

  const uploadSingleMilestone = async (milestoneNumber) => {
    setMessage("");
    setLoading(true);
    try {
      const file = milestoneNumber === 1 ? hito1File : hito2File;
      if (!file) {
        setMessage(`Seleccione un archivo para el Hito ${milestoneNumber}.`);
        return;
      }
      await uploadFileForMilestone(file, milestoneNumber);
      setMessage(`Hito ${milestoneNumber} subido correctamente.`);
      await fetchProfileAndHitos();
      if (milestoneNumber === 1) {
        setHito1File(null);
        const el = document.getElementById("hito1");
        if (el) el.value = "";
      } else {
        setHito2File(null);
        const el = document.getElementById("hito2");
        if (el) el.value = "";
      }
    } catch (err) {
      console.error(err);
      if (err.message === "AUTH_401") {
        setMessage("Sesión expirada. Inicia sesión nuevamente.");
        try {
          logout?.();
        } catch {}
        navigate("/login", { replace: true });
      } else {
        setMessage(err.message || `Error al subir Hito ${milestoneNumber}.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadHitoFile = async (hitoId, idx, fileName) => {
    const tk = getToken();
    if (!tk) return alert("Debe iniciar sesión para descargar el archivo.");
    try {
      const res = await fetch(`${API_BASE}/hitos/${hitoId}/file/${idx}`, {
        headers: { Authorization: `Bearer ${tk}` },
      });
      if (res.status === 401) throw new Error("AUTH_401");
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || "Error descargando archivo");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || `hito-${hitoId}-${idx}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("downloadHitoFile error", err);
      if (err.message === "AUTH_401") {
        alert("Sesión expirada. Inicia sesión nuevamente.");
        try {
          logout?.();
        } catch {}
        navigate("/login", { replace: true });
      } else {
        alert(err.message || "Error descargando archivo");
      }
    }
  };

  const isDisabledFor = (milestoneNumber) => {
    const info = hitosMap[milestoneNumber];
    const s = info?.status || "no_iniciado";
    return s === "enviado" || s.includes("aprob");
  };

  const badgeFor = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("aprob")) return "bg-success";
    if (s.includes("rechaz")) return "bg-danger";
    if (s.includes("pend")) return "bg-warning text-dark";
    if (s === "no_iniciado" || s.includes("noiniciado")) return "bg-secondary";
    return "bg-info";
  };

  return (
    <div className="container my-4" style={{ maxWidth: "900px" }}>
      <h2 className="mb-4">Subir archivos para hitos</h2>
      <p>
        En esta sección usted podrá subir los Hitos I y II en documento PDF o
        Word
      </p>

      {loading && <div className="alert alert-info">Cargando...</div>}
      {message && <div className="alert alert-secondary">{message}</div>}

      {[1, 2].map((n) => {
        const info = hitosMap[n] || {};
        const status = info.status || "no_iniciado";
        const files = info.files || [];
        const disabled = isDisabledFor(n);
        return (
          <div className="card mb-3" key={n}>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h5 className="mb-0">Hito {n}</h5>
                <span className={`badge ${badgeFor(status)}`}>{status}</span>
              </div>

              {info.reviewerComments && (
                <div className="alert alert-info">
                  Observación profesor: {info.reviewerComments}
                </div>
              )}

              <input
                type="file"
                className="form-control mb-3"
                id={`hito${n}`}
                accept=".doc,.docx,.pdf"
                onChange={(e) =>
                  setTimeout(
                    () =>
                      (n === 1 ? setHito1File : setHito2File)(
                        e.target.files?.[0] || null
                      ),
                    0
                  )
                }
                disabled={disabled}
              />

              {files.length > 0 && (
                <div className="text-muted small mb-2">
                  Archivo enviado:{" "}
                  {files[files.length - 1]?.originalName ||
                    files[files.length - 1]?.originalname ||
                    files[files.length - 1]?.name ||
                    "Archivo"}
                </div>
              )}

              <div className="d-flex gap-2">
                <button
                  className="btn btn-primary"
                  onClick={() => uploadSingleMilestone(n)}
                  disabled={loading || disabled}
                >
                  📤 {files.length > 0 ? "Reenviar" : `Enviar Hito ${n}`}
                </button>
                {files.length > 0 && info._id && (
                  <button
                    className="btn btn-secondary"
                    onClick={() =>
                      downloadHitoFile(
                        info._id,
                        files.length - 1,
                        files[files.length - 1]?.originalName || "hito.pdf"
                      )
                    }
                  >
                    Descargar
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}

      <div className="card-footer">
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex justify-content-start">
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/HomeAlumno")}
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
