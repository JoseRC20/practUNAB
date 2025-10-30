import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Buttons() {
    const navigate = useNavigate();
    const { token } = useAuth();
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const fetchStatus = async () => {
            if (!token) { if (mounted) setLoading(false); return; }
            try {
                const res = await fetch('http://localhost:5000/api/practices/mine', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) { console.error('fetch /mine failed', res.status); if (mounted) setLoading(false); return; }
                const data = await res.json();
                // controller returns { items: [...] }
                const items = Array.isArray(data) ? data : data.items || [];
                const practice = (Array.isArray(items) ? items[0] : items) || null;
                // Default to 'no iniciado' when there's no practice
                const resolvedStatus = practice?.status || 'no iniciado';
                if (mounted) setStatus(resolvedStatus);
            } catch (err) {
                console.error('Error fetching practice status:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchStatus();
        return () => { mounted = false; };
    }, [token]);

    // Rules:
    // - If status === 'aprobado' -> Hitos enabled, Form disabled
    // - If status === 'no iniciado' or 'rechazado' -> Hitos disabled, Form enabled
    // - If status === 'pendiente' -> both Form and Hitos disabled
    const isFormularioDisabled = status === 'aprobado' || status === 'pendiente';
    const isHitosDisabled = status !== 'aprobado' || status === 'pendiente';

    return (
        <div className="d-flex justify-content-center align-items-center mb-4" style={{ height: '50px', gap: '20px' }}>
            <button className="btn text-white" style={{backgroundColor: "#802929ff"}} onClick={() => navigate("/form-alumno")} disabled={isFormularioDisabled || loading}>
                Formulario de inicio de práctica
            </button>
            <button className="btn text-white" style={{backgroundColor: "#802929ff"}} onClick={() => navigate("/hitos")} disabled={isHitosDisabled || loading}>
                Hitos
            </button>
        </div>
    );
}