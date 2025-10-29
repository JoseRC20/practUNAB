import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

export default function Registro() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        apellidoP: '',
        apellidoM: '',
        rut: '',
        phone: '',
        email: '',
        password: '',
        role: ''
    });

    useEffect(() => {
        const savedRole = localStorage.getItem('userRole');
        if (savedRole) {
            setFormData((prevData) => ({ ...prevData, role: savedRole}));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                alert(data.message);
                navigate(`/login/student`); // Redirige al login después del registro exitoso
            } else {
                const error = await response.json();
                alert(error.error);
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Error al registrar el usuario");
        }
    };

    return (
        <div className="container mt-5">
            <h1>Registro</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nombres</label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="apellidoP" className="form-label">Apellido Paterno</label>
                    <input
                        type="text"
                        className="form-control"
                        id="apellidoP"
                        name="apellidoP"
                        value={formData.apellidoP}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="apellidoM" className="form-label">Apellido Materno</label>
                    <input
                        type="text"
                        className="form-control"
                        id="apellidoM"
                        name="apellidoM"
                        value={formData.apellidoM}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="rut" className="form-label">Rut</label>
                    <input
                        type="text"
                        className="form-control"
                        id="rut"
                        name="rut"
                        value={formData.rut}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="phone" className="form-label">Fóno (móvil)</label>
                    <input
                        type="text"
                        className="form-control"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">Correo Institucional</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
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
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>

                <button type="submit" className="btn btn-primary" style={{backgroundColor: '#c00000ff'}}>Registrarse</button>
            </form>
        </div>
    );
}