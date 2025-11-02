import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../context/AuthContext';

// Expects `student` prop to be a StudentProfile document (populated with `user` containing at least _id)
export default function ViewStateStudent({ student }) {
  const { token } = useAuth();
  const [practice, setPractice] = useState(null);
  const [hitos, setHitos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState({}); // { hitoId: 'comment text' }

  const userId = student?.user?._id || student?.user || null;

  useEffect(() => {
    const load = async () => {
      if (!token || !userId) return;
      setLoading(true);
      setError(null);
      try {
        // 1) fetch hitos for this user
        const hRes = await fetch(`http://localhost:5000/api/hitos/student/${encodeURIComponent(userId)}`, { headers: { Authorization: 'Bearer ' + token } });
        if (!hRes.ok) throw new Error('No se pudieron cargar los hitos');
        const hitosData = await hRes.json();
        setHitos(hitosData || []);

        // 2) fetch all practices (professor allowed) and find one for this student by comparing practice.student._id or practice.student
        const pRes = await fetch('http://localhost:5000/api/practices', { headers: { Authorization: 'Bearer ' + token } });
        if (pRes.ok) {
          const all = await pRes.json();
          // server returns an array of practices (as objects)
          const found = (Array.isArray(all) ? all : (all.items || [])).find(p => {
            // p.student might be id or object
            if (!p) return false;
            const pid = p.student && (p.student._id || p.student.id) || p.student;
            return String(pid) === String(userId);
          });
          setPractice(found || null);
        } else {
          // not fatal: just set practice null
          setPractice(null);
        }

        // initialize comments from existing reviewerComments on hitos
        const init = {};
        (hitosData || []).forEach(h => { if (h.reviewerComments) init[h._id] = h.reviewerComments; });
        setComments(init);
      } catch (err) {
        console.error(err);
        setError(err.message || String(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, userId]);

  const downloadFile = (hitoId, idx, originalName) => {
    // Use fetch with Authorization header so the server receives the token and can authorize
    return (async () => {
      if (!token) return alert('No auth token');
      try {
        const res = await fetch(`http://localhost:5000/api/hitos/${hitoId}/file/${idx}`, {
          headers: { Authorization: 'Bearer ' + token }
        });
        if (!res.ok) {
          const j = await res.json().catch(() => null);
          throw new Error(j?.message || `Server responded ${res.status}`);
        }
        const blob = await res.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = originalName || 'file';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
      } catch (err) {
        console.error('Download error', err);
        alert(err.message || 'Download failed');
      }
    })();
  };

  const saveComment = async (hitoId) => {
    if (!token) return alert('No auth token');
    try {
      const body = { reviewerComments: comments[hitoId] || '' };
      const res = await fetch(`http://localhost:5000/api/hitos/${hitoId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify(body) });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.message || 'Error saving comment');
      }
      const updated = await res.json();
      // update local hitos
      setHitos(hitos.map(h => h._id === updated._id ? updated : h));
      alert('Comentario guardado');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al guardar comentario');
    }
  };

  const changeHitoStatus = async (hitoId, newStatus) => {
    if (!token) return alert('No auth token');
    try {
      const res = await fetch(`http://localhost:5000/api/hitos/${hitoId}/status`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ status: newStatus, reviewerComments: comments[hitoId] || '' }) });
      if (!res.ok) {
        const j = await res.json().catch(()=>({}));
        throw new Error(j.message || 'Error updating status');
      }
      const updated = await res.json();
      setHitos(hitos.map(h => h._id === updated._id ? updated : h));
      alert('Estado actualizado');
    } catch (err) {
      console.error(err);
      alert(err.message || 'Error al actualizar estado');
    }
  };

  if (!student) return <div>No student</div>;
  if (loading) return <div>Loading...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div>
      <h4>Estado formulario del alumno</h4>
      <p><strong>Alumno:</strong> {student.Names || student.firstName} {student.lastNamePaternal}</p>
      <p><strong>Email:</strong> {student.institutionalEmail}</p>
      <p><strong>Estado práctica:</strong> {practice ? practice.status : 'no iniciado'}</p>

      <h5>Hitos</h5>
      {hitos.length === 0 && <p>No hay hitos registrados.</p>}
      <div className="list-group">
        {hitos.map(h => (
          <div className="list-group-item" key={h._id}>
            <div className="d-flex justify-content-between">
              <div>
                <strong>{h.title || `Hito ${h.milestoneNumber}`}</strong>
                <div>Estado: {h.status}</div>
                <div>Enviado: {h.submittedAt ? new Date(h.submittedAt).toLocaleString() : '—'}</div>
              </div>
              <div>
                {h.files && h.files.map((f, idx) => (
                  <button key={idx} className="btn btn-sm btn-outline-primary me-2" onClick={() => downloadFile(h._id, idx, f.originalName)}>Descargar {f.originalName}</button>
                ))}
              </div>
            </div>

            <div className="mt-2">
              <label>Comentario del revisor</label>
              <textarea className="form-control" rows={3} value={comments[h._id] || ''} onChange={(e) => setComments({ ...comments, [h._id]: e.target.value })} />
              <div className="mt-2">
                <button className="btn btn-sm btn-primary me-2" onClick={() => saveComment(h._id)}>Guardar comentario</button>
                <button className="btn btn-sm btn-success me-2" onClick={() => changeHitoStatus(h._id, 'aprobado')}>aprobado</button>
                <button className="btn btn-sm btn-danger" onClick={() => changeHitoStatus(h._id, 'rechazado')}>Rechazar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
