import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { role } = useParams(); // Get the role from the URL
    const navigate = useNavigate(); // Hook para redirigir
    const { token, saveToken } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    console.log("Login component - role from URL:", role);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        console.log(formData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                alert("Login exitoso");
                saveToken(data.token); // Actualiza el token en el Context API
                localStorage.setItem("authToken", data.token); // Guarda el token en localStorage
                navigate("/HomeAlumno"); // Redirige al HomeAlumno
            } else {
                const error = await response.json();
                alert(error.message);
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Error al iniciar sesión");
        }
    };

    useEffect(() => {
            console.log("Token retrieved from Context:", token)
    }, []);

    return (
        <div className="container mt-5">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Correo Electrónico</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email" // Added name attribute to bind with formData
                        value={formData.email} // Corrected to use formData.email
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Contraseña</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password" // Added name attribute to bind with formData
                        value={formData.password} // Corrected to use formData.password
                        onChange={handleChange}
                        required
                    />
                </div>
                {role === 'student' && (
                    <div className="mb-3">
                        <Link to="/registro">Si no tienes cuenta, registrate</Link>
                    </div>
                )}
                <button type="submit" className="btn btn-primary">
                    Iniciar sesión
                </button>
            </form>
        </div>
    );
}