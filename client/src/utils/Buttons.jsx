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
                const practice = Array.isArray(data) ? data[0] : data;
                if (mounted) setStatus(practice?.status || '');
            } catch (err) {
                console.error('Error fetching practice status:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchStatus();
        return () => { mounted = false; };
    }, [token]);

    const isFormularioDisabled = status === 'aprobado';
    const isHitosDisabled = status !== 'aprobado';

    return (
        <div className="d-flex justify-content-center align-items-center mb-4" style={{ height: '50px', gap: '20px' }}>
            <button className="btn text-white" style={{backgroundColor: "#802929ff"}} onClick={() => navigate("/perfil/alumno")}>
                Perfil
            </button>
            <button className="btn text-white" style={{backgroundColor: "#802929ff"}} onClick={() => navigate("/form-alumno")} disabled={isFormularioDisabled || loading}>
                Formulario de inicio de práctica
            </button>
            <button className="btn text-white" style={{backgroundColor: "#802929ff"}} onClick={() => navigate("/hitos")} disabled={isHitosDisabled || loading}>
                Hitos
            </button>
        </div>
    );
}