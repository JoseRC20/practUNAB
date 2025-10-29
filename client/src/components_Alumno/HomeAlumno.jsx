import React, { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from 'react-router-dom';
import Buttons from "../utils/Buttons";



export default function HomeAlumno() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState(""); // Nombre del alumno
    const [notifications, setNotifications] = useState([]); // Notificaciones
    const { token } = useAuth();


    useEffect(() => {
        console.log("Token retrieved from Context:", token)
        const role = localStorage.getItem('userRole'); // Recupera el rol del usuario
        if (role !== 'student') { // Verifica si el rol no es de Alumno
            alert('Acceso denegado. Solo los alumnos pueden acceder a esta página.');
            navigate('/'); // Redirige al inicio
        }

    }, []);

    return (
        <div className="d-flex vh-100"> {/* Contenedor principal */}
            <div className="flex-grow-1 p-3"> {/* Contenido principal */}
                <Buttons />
                <h1>Bienvenido, {userName}</h1>

                <div className="mt-4">
                    <h2>Notificaciones</h2>
                    <ul>
                        {notifications.map((note, index) => (
                            <li key={index}>{note}</li>
                        ))}
                    </ul>
                </div>
            </div> {/* Cierra el contenedor principal correctamente */}
            
        </div>
    );
}