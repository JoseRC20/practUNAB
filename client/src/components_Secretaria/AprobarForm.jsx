import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function AprobarForm() {
    const [alumnos, setAlumnos] = useState([]); // Lista de alumnos
    const [selectedAlumno, setSelectedAlumno] = useState(null); // Alumno seleccionado
    const [formulario, setFormulario] = useState(null); // Datos del formulario

    useEffect(() => {
        // Simulación: Cargar lista de alumnos desde una API o localStorage
        const alumnosData = [
            { id: 1, nombre: 'Juan Pérez', rut: '12345678-9' },
            { id: 2, nombre: 'María López', rut: '98765432-1' },
        ];
        setAlumnos(alumnosData);
    }, []);

    const handleAlumnoChange = (e) => {
        const alumnoId = e.target.value;
        const alumno = alumnos.find((a) => a.id === parseInt(alumnoId));
        setSelectedAlumno(alumno);

        // Simulación: Cargar datos del formulario del alumno seleccionado
        const formularioData = {
            carrera: 'Ing. Civil Informática',
            jornada: 'Diurna',
            tipoPractica: 'Práctica I',
            fechaInicio: '2025-10-01',
            fechaTermino: '2025-12-15',
            observaciones: 'Desarrollar un sistema de gestión.',
        };
        setFormulario(formularioData);
    };

    const handleAprobar = () => {
        alert(`Formulario de ${selectedAlumno.nombre} aprobado.`);
        // Aquí puedes agregar lógica para actualizar el estado en la base de datos
    };

    const handleRechazar = () => {
        alert(`Formulario de ${selectedAlumno.nombre} rechazado.`);
        // Aquí puedes agregar lógica para actualizar el estado en la base de datos
    };

    return (
        <div className="container mt-5">
            <h2>Aprobar Formulario de Alumno</h2>
            <div className="mb-3">
                <label htmlFor="alumnoSelect" className="form-label">Seleccionar Alumno</label>
                <select
                    id="alumnoSelect"
                    className="form-select"
                    onChange={handleAlumnoChange}
                >
                    <option value="">-- Seleccionar --</option>
                    {alumnos.map((alumno) => (
                        <option key={alumno.id} value={alumno.id}>
                            {alumno.nombre} - {alumno.rut}
                        </option>
                    ))}
                </select>
            </div>

            {selectedAlumno && formulario && (
                <div className="card mt-4">
                    <div className="card-header bg-primary text-white">
                        <h4>Datos del Alumno</h4>
                    </div>
                    <div className="card-body">
                        <p><strong>Nombre:</strong> {selectedAlumno.nombre}</p>
                        <p><strong>RUT:</strong> {selectedAlumno.rut}</p>
                        <hr />
                        <h5>Formulario</h5>
                        <p><strong>Carrera:</strong> {formulario.carrera}</p>
                        <p><strong>Jornada:</strong> {formulario.jornada}</p>
                        <p><strong>Tipo de Práctica:</strong> {formulario.tipoPractica}</p>
                        <p><strong>Fecha de Inicio:</strong> {formulario.fechaInicio}</p>
                        <p><strong>Fecha de Término:</strong> {formulario.fechaTermino}</p>
                        <p><strong>Observaciones:</strong> {formulario.observaciones}</p>
                    </div>
                    <div className="card-footer text-end">
                        <button className="btn btn-success me-2" onClick={handleAprobar}>
                            Aprobar
                        </button>
                        <button className="btn btn-danger" onClick={handleRechazar}>
                            Rechazar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}