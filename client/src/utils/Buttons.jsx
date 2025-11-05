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
                const items = Array.isArray(data) ? data : data.items || [];
                const practice = (Array.isArray(items) ? items[0] : items) || null;
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

    const isFormularioDisabled = status === 'aprobado' || status === 'pendiente';
    const isHitosDisabled = status !== 'aprobado' || status === 'pendiente';

    return (
        <div className="container mb-4">
            <div className="row justify-content-center mb-4">
                <div className="col-12 col-lg-8">
                    <div className='card mb-3 mx-auto shadow-sm rounded h-100'>
                        <div className='card-body d-flex flex-column'>
                            <div className="d-flex align-items-center mb-2">
                                <h3 className="mb-0">Tu Perfil</h3>
                            </div>
                            <span className="d-block w-50 bg-danger my-2 mb-2" style={{height:'5px'}}></span>
                            <p>Aquí tienes la opción de poder revisar tu perfil de usuario practUNAB; verás tus datos personales y la información de tu práctica.</p>
                            <div className="mt-auto">
                                <button className="btn text-white w-100 fw-bold fs-5" style={{backgroundColor: "#ca0505ff"}} onClick={() => navigate("/perfil/alumno")}>
                                    Ver perfil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row justify-content-center g-4">
                <div className="col-12 col-md-6 d-flex">
                    <div className='card w-100 shadow-sm rounded h-100'>
                        <div className='card-body d-flex flex-column'>
                            <h4 className="mb-2">Iniciar Práctica</h4>
                            <span className="d-block w-50 bg-danger my-2 mb-2" style={{height:'5px'}}></span>
                            <p>Completa y envía el formulario de inicio de práctica. Esta acción inicia el flujo y permitirá que la secretaría revise tu solicitud.</p>
                            <div className="mt-auto">
                                <button className="btn text-white w-100 fw-bold fs-5" style={{backgroundColor: "#ca0505ff"}} onClick={() => navigate("/form-alumno")} disabled={isFormularioDisabled || loading}>
                                    Formulario de inicio de práctica
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6 d-flex">
                    <div className='card w-100 shadow-sm rounded h-100'>
                        <div className='card-body d-flex flex-column'>
                            <h4 className="mb-2">Hitos</h4>
                            <span className="d-block w-50 bg-danger my-2 mb-2" style={{height:'5px'}}></span>
                            <p>Sube y gestiona los hitos asociados a tu práctica. Sólo disponible cuando tu práctica esté aprobada.</p>
                            <div className="mt-auto">
                                <button className="btn text-white w-100 fw-bold fs-5" style={{backgroundColor: "#ca0505ff"}} onClick={() => navigate("/hitos")} disabled={isHitosDisabled || loading}>
                                    Hitos
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}