import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardSecretaria() {
    const { token } = useAuth();
    const [items, setItems] = useState([]);
    const [allPractices, setAllPractices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const loadPending = async () => {
        setLoading(true);
        setError(null);
            try {
            // fetch pending items for the table
            const pendingRes = await fetch('http://localhost:5000/api/secretary/pending', {
                headers: { Authorization: 'Bearer ' + token }
            });
            if (!pendingRes.ok) {
                const j = await pendingRes.json().catch(() => ({}));
                throw new Error(j.error || j.message || 'Error cargando pendientes');
            }
            const pendingData = await pendingRes.json();
            setItems(pendingData.items || []);

            // fetch all practices to compute overall stats (approved/rejected/total)
            const allRes = await fetch('http://localhost:5000/api/practices', {
                headers: { Authorization: 'Bearer ' + token }
            });
            if (!allRes.ok) {
                // if this fails, still show pending items but stats will fallback
                console.warn('Failed to fetch all practices for stats');
            } else {
                const allData = await allRes.json();
                // allData is expected to be an array of practices
                setAllPractices(Array.isArray(allData) ? allData : (allData.items || allData));
            }
        } catch (err) {
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleView = (practiceId) => {
        navigate(`/secretary/view/${practiceId}`);
    }

    // derive simple stats from the loaded allPractices (if available), otherwise fall back to items
    const source = allPractices.length ? allPractices : items;
    const stats = {
        total: source.length,
        pending: source.filter(i => String(i.status || '').toLowerCase().includes('pendient')).length,
        approved: source.filter(i => ['aprobado', 'aprobada'].includes(String(i.status || '').toLowerCase())).length,
        reject: source.filter(i => ['rechazado', 'rechazada'].includes(String(i.status || '').toLowerCase())).length
    };

    const changeStatus = async (practiceId, status) => {
        try {
            const res = await fetch(`http://localhost:5000/api/practices/${practiceId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
                body: JSON.stringify({ status })
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || j.message || 'Error updating status');
            }
            // refresh list
            await loadPending();
        } catch (err) {
            alert(err.message || String(err));
        }
    }

    useEffect(() => { if (token) loadPending(); }, [token]);

    return (
        <div className="container mt-4">
            <h2 className='text-center mt-3'>Panel Secretaría</h2>
            <span className="d-block w-50 bg-danger my-2 mx-auto mb-2" style={{height:'5px'}}></span>
            <p className='mt-2 mb-4'>Gestión de aprobación o rechazo de prácticas profesionales</p>

            <div className="row g-3 mb-4 ms-1 me-1">
                <div className="col-6 col-md-3">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body">
                            <small className="text-muted">Solicitudes totales</small>
                            <h3 className="mt-2 mb-0">{stats.total}</h3>
                        </div>
                    </div>
                </div>
                
                <div className="col-6 col-md-3">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body">
                            <small className="text-muted">Pendientes</small>
                            <h3 className="mt-2 mb-0">{stats.pending}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-6 col-md-3">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body">
                            <small className="text-muted">Aprobadas</small>
                            <h3 className="mt-2 mb-0">{stats.approved}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-6 col-md-3">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body">
                            <small className="text-muted">Rechazadas</small>
                                <h3 className="mt-2 mb-0">{stats.reject}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {loading && <div>Loading...</div>}
            {error && <div className="alert alert-danger">{error}</div>}
            {!loading && !error && (
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 && (
                            <tr><td colSpan={4}>No hay formularios pendientes</td></tr>
                        )}
                        {items.map(it => (
                            <tr key={it.practiceId}>
                                <td>{it.student.firstName} {it.student.lastNamePaternal}</td>
                                <td>{it.student.email}</td>
                                <td>{it.status}</td>
                                <td>
                                    {/* Actions: view details or approve/reject */}
                                    <button className="btn btn-sm btn-primary" onClick={() => handleView(it.practiceId)}>Ver</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}