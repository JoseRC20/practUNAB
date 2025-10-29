import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Buttons() {
    const navigate = useNavigate();

    return (
        <div className="d-flex justify-content-center align-items-center mb-4" style={{ height: '50px', gap: '20px' }}> {/* Centra los botones */}
            <button className="btn text-white" style={{backgroundColor: "#802929ff"}} onClick={() => navigate("/perfil/alumno")}>
                Perfil
            </button>
            <button className="btn text-white" style={{backgroundColor: "#802929ff"}} onClick={() => navigate("/form-alumno")}>
                Formulario de inicio de práctica
            </button>
            <button className="btn text-white" style={{backgroundColor: "#802929ff"}} onClick={() => navigate("/hitos")}>
                Hitos
            </button>
        </div>
    );
}