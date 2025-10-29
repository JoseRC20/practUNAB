import React, { useState } from 'react';
import RoleSelector from '../utils/RoleSelector';
import HomeAlumno from '../components_Alumno/HomeAlumno';
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
            </div>
        </div>
    );
}