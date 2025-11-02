import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function DashboardSecretaria() {
    const { token } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const loadPending = async () => {
        setLoading(true);
        setError(null);
            try {
            const res = await fetch('http://localhost:5000/api/secretary/pending', {
                headers: { Authorization: 'Bearer ' + token }
            });
            if (!res.ok) {
                const j = await res.json().catch(() => ({}));
                throw new Error(j.error || j.message || 'Error cargando pendientes');
            }
            const data = await res.json();
            setItems(data.items || []);
        } catch (err) {
            setError(err.message || String(err));
        } finally {
            setLoading(false);
        }
    };

    const handleView = (practiceId) => {
        navigate(`/secretary/view/${practiceId}`);
    }

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
            <h2>Panel Secretaría</h2>
            <p>Lista de estudiantes con formularios pendientes de aprobación</p>
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