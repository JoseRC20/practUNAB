import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function RoleSelector() {
    const navigate = useNavigate();

    const handleRole = (roleId) => {
        navigate(`/login/${roleId}`);
        localStorage.setItem('userRole', roleId);
    };
    

    return (
        <div className="container mt-5 mb-5">
            <div className="d-flex flex-column align-items-center">
                <button className="btn btn-danger my-3" onClick={() => handleRole('student')}>Alumno</button>
                <button className="btn btn-danger my-3" onClick={() => handleRole('professor')}>Profesor</button>
                <button className="btn btn-danger my-3" onClick={() => handleRole('secretary')}>Secretaria</button>
            </div>
        </div>
    );
}