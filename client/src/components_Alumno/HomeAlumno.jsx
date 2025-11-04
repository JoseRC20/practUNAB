import React, { useEffect, useState } from "react";
import { useAuth } from '../context/AuthContext';
import "bootstrap/dist/css/bootstrap.min.css";
import { useNavigate } from 'react-router-dom';
import Buttons from "../utils/Buttons";

export default function HomeAlumno() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState(""); // Nombre del alumno
    const [notifications, setNotifications] = useState([]); // Notificaciones
    const { token, user } = useAuth();
    const [profile, setProfile] = useState(null);


    useEffect(() => {
        console.log("Token retrieved from Context:", token)
        // Prefer role from AuthContext.user, fallback to localStorage for backwards compatibility
        const role = user?.role || localStorage.getItem('userRole'); // Recupera el rol del usuario
        if (role !== 'student') { // Verifica si el rol no es de Alumno
            alert('Acceso denegado. Solo los alumnos pueden acceder a esta página.');
            navigate('/'); // Redirige al inicio
            return;
        }

        // Fetch student profile when token is available
        const fetchProfile = async () => {
            if (!token) return;
            try {
                const res = await fetch('http://localhost:5000/api/students/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) {
                    console.error('Failed to fetch profile', await res.text());
                    return;
                }
                const data = await res.json();
                setProfile(data.profile);
                // set visible user name from profile.user or Names
                const name = data.profile?.user?.firstName || data.profile?.Names || '';
                const last = data.profile?.user?.lastNamePaternal || data.profile?.lastNamePaternal || '';
                setUserName(`${name} ${last}`.trim());
            } catch (err) {
                console.error('Error fetching profile', err);
            }
        };
        fetchProfile();

    }, [token, navigate]);

    return (
        <div > {/* Contenedor principal */}
            <h1 className="text-3xl font-bold text-center mt-4">Bienvenido/a, {userName || 'Alumno'}</h1>
            <span className="d-block w-50 bg-danger my-2 mx-auto mb-2" style={{height:'5px'}}></span>
            <p class="text-center text-gray-600 mt-2">
                Aquí puedes iniciar tu práctica, subir hitos y revisar tu información.
            </p>
            <div> {/* Contenido principal */}
                <Buttons />
            </div> {/* Cierra el contenedor principal correctamente */}
            
        </div>
    );
}