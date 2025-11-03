import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function RoleSelector() {
    const navigate = useNavigate();

    return (
        <div className="container mt-5 mb-5">
            <h1 className='text-center'>¡Bienvenido/a a la Plataforma de Prácticas practUNAB!</h1>
            <span className="d-block w-50 bg-danger my-2 mx-auto mb-2" style={{height:'5px'}}></span>

            <p className="lead">PractUNAB centraliza y simplifica la gestión de las prácticas profesionales (Práctica I y II). Los estudiantes pueden completar su perfil, subir hitos y formularios; los profesores pueden revisar, comentar y calificar; y la secretaría valida y aprueba los trámites. Todo el flujo queda registrado y disponible en un solo lugar.</p>

            <div className="d-flex justify-content-center mt-4">
                <button className="btn btn-danger btn-lg" onClick={() => navigate('/login')}>Iniciar sesión</button>
            </div>
            {/*<div className="d-flex flex-column align-items-center">
                <button className="btn btn-danger my-3" onClick={() => handleRole('student')}>Alumno</button>
                <button className="btn btn-danger my-3" onClick={() => handleRole('professor')}>Profesor</button>
                <button className="btn btn-danger my-3" onClick={() => handleRole('secretary')}>Secretaria</button>
                <button className="btn btn-danger my-3" onClick={() => handleRole('admin')}>Admin</button>
            </div>*/}
        </div>
    );
}