import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function PerfilSecretaria() {
    const [formData, setFormData] = useState({
        nombre: '',
        apellidoPaterno: '',
        apellidoMaterno: '',
        rut: '',
        correoInstitucional: ''
    });
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        // Fetch secretaria data from localStorage
        const storedData = localStorage.getItem('secretariaData');
        if (storedData) {
            setFormData(JSON.parse(storedData));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleSave = () => {
        localStorage.setItem('secretariaData', JSON.stringify(formData));
        alert('Datos guardados exitosamente');
        setIsEditing(false);
    };

    return (
        <div className="container mt-5">
            <div className="card">
                <div className="card-header bg-primary text-white">
                    <h2>Perfil de Secretaria</h2>
                </div>
                <div className="card-body">
                    {isEditing ? (
                        <>
                            <label>Nombre:</label>
                            <input
                                type="text"
                                className="form-control mb-2"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleChange}
                            />
                            <label>Apellido Paterno:</label>
                            <input
                                type="text"
                                className="form-control mb-2"
                                name="apellidoPaterno"
                                value={formData.apellidoPaterno}
                                onChange={handleChange}
                            />
                            <label>Apellido Materno:</label>
                            <input
                                type="text"
                                className="form-control mb-2"
                                name="apellidoMaterno"
                                value={formData.apellidoMaterno}
                                onChange={handleChange}
                            />
                            <label>RUT:</label>
                            <input
                                type="text"
                                className="form-control mb-2"
                                name="rut"
                                value={formData.rut}
                                onChange={handleChange}
                            />
                            <label>Correo Institucional:</label>
                            <input
                                type="email"
                                className="form-control mb-2"
                                name="correoInstitucional"
                                value={formData.correoInstitucional}
                                onChange={handleChange}
                            />
                        </>
                    ) : (
                        <>
                            <p><strong>Nombre:</strong> {formData.nombre}</p>
                            <p><strong>Apellido Paterno:</strong> {formData.apellidoPaterno}</p>
                            <p><strong>Apellido Materno:</strong> {formData.apellidoMaterno}</p>
                            <p><strong>RUT:</strong> {formData.rut}</p>
                            <p><strong>Correo Institucional:</strong> {formData.correoInstitucional}</p>
                        </>
                    )}
                </div>
                <div className="card-footer text-end">
                    {isEditing ? (
                        <button className="btn btn-success" onClick={handleSave}>Guardar Cambios</button>
                    ) : (
                        <button className="btn btn-primary" onClick={handleEdit}>Editar Perfil</button>
                    )}
                </div>
            </div>
        </div>
    );
}