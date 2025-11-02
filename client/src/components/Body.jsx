import React, { useState } from 'react';
import RoleSelector from '../utils/RoleSelector';
import HomeAlumno from '../components_Alumno/HomeAlumno';
import GestionUser from '../components_Admin/GestionUser';
import DashboardSecretaria from '../components_Secretaria/DashboardSecretaria';
import ListStudents from '../components_Professor/ListStudents';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Body() {
    const [messages, setMessages] = useState([]);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null);

    return (
        <div className="d-flex">
            <div className="flex-grow-1">
                <RoleSelector />
                {isLoggedIn && role === 'student' && <HomeAlumno />}
                {isLoggedIn && role === 'admin' && <GestionUser />}
                {isLoggedIn && role === 'secretary' && <DashboardSecretaria/>}
                {isLoggedIn && role === 'professor' && <ListStudents/>}
            </div>
        </div>
    );
}