import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Hitos() {
    const [hito1File, setHito1File] = useState(null);
    const [hito2File, setHito2File] = useState(null);
    const [status, setStatus] = useState(''); // Estado del formulario

    useEffect(() => {
        // Aquí deberías obtener el status real desde la API o contexto
        // Ejemplo simulado:
        // setStatus('aprobado');
        // setStatus('pendiente');
        // setStatus('rechazado');
        // setStatus('no iniciado');
        // Reemplaza la línea siguiente por la consulta real:
        setStatus('aprobado');
    }, []);

    const handleFileChange = (e, setFile) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Hito 1 File:', hito1File);
        console.log('Hito 2 File:', hito2File);
        // Aquí puedes agregar la lógica para enviar los archivos a un servidor
    };

    const isDisabled = status !== 'aprobado';

    return (
        <div className="container mt-5">
            <h2>Subir Archivos para Hitos</h2>
            {isDisabled && (
                <div className="alert alert-warning">
                    No puedes subir archivos de hitos hasta que el formulario esté aprobado.
                </div>
            )}
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="hito1" className="form-label">Hito 1</label>
                    <input
                        type="file"
                        className="form-control"
                        id="hito1"
                        accept=".doc,.docx"
                        onChange={(e) => handleFileChange(e, setHito1File)}
                        required
                        disabled={isDisabled}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="hito2" className="form-label">Hito 2</label>
                    <input
                        type="file"
                        className="form-control"
                        id="hito2"
                        accept=".doc,.docx"
                        onChange={(e) => handleFileChange(e, setHito2File)}
                        required
                        disabled={isDisabled}
                    />
                </div>
                <button type="submit" className="btn btn-primary" disabled={isDisabled}>Enviar</button>
            </form>
        </div>
    );
}
