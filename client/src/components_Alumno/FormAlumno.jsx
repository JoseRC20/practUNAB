import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuth } from '../context/AuthContext';

export default function FormAlumno() {
    const [status,setStatus] = useState("");
    const { token } = useAuth();
    const [formData, setFormData] = useState({
        jornada: '',
        tipoPractica: '',
        career: '',
        fecha_inicio: '',
        fecha_termino: '',
        empresaNombre: '',
        empresaRut: '',
        empresaGiro: '',
        empresaDireccion: '',
        empresaComuna: '',
        empresaCiudad: '',
        empresaRegion: '',
        empresaTelefono: '',
        empresaWeb: '',
        empresaEmail: '',
        cartaNombre: '',
        cartaCargo: '',
        cartaEmail: '',
        supervisorNombre: '',
        supervisorCargo: '',
        supervisorTelefono: '',
        supervisorEmail: '',
        observacion: '',
        firmaAlumno: null, // Campo para la firma del alumno
        firmaEmpresa: null // Campo para la firma de la empresa
    });

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
            const response = await fetch(`http://localhost:5000/api/practices`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` // Use token from Context API
                },
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                const data = await response.json();
                alert("Formulario enviado con éxito");
            } else {
                const error = await response.json();
                alert(`Error: ${error.message || "No se pudo enviar el formulario"}`);
            }
        } catch (err) {
            console.error("Error:", err);
            alert("Error al enviar formulario");
        }
    };

    const regionesDeChile = [
        "Región de Arica y Parinacota",
        "Región de Tarapacá",
        "Región de Antofagasta",
        "Región de Atacama",
        "Región de Coquimbo",
        "Región de Valparaíso",
        "Región Metropolitana de Santiago",
        "Región del Libertador General Bernardo O'Higgins",
        "Región del Maule",
        "Región de Ñuble",
        "Región del Biobío",
        "Región de La Araucanía",
        "Región de Los Ríos",
        "Región de Los Lagos",
        "Región de Aysén del General Carlos Ibáñez del Campo",
        "Región de Magallanes y de la Antártica Chilena"
    ];

    return (
        <div className="container mt-5">
            <h2>Formulario de Alumno</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="fecha_inicio" className="form-label">Fecha Inicio Práctica</label>
                    <input
                        type="date"
                        className="form-control"
                        id="fecha_inicio"
                        name="fecha_inicio"
                        value={formData.fecha_inicio}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="fecha_termino" className="form-label">Fecha Termino Práctica</label>
                    <input
                        type="date"
                        className="form-control"
                        id="fecha_termino"
                        name="fecha_termino"
                        value={formData.fecha_termino}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="career" className="form-label">Selecciona tu carrera</label>
                    <select
                        id="career"
                        className="form-select"
                        name="career" // Added name attribute to bind with formData
                        value={formData.career} // Corrected to use formData.career
                        onChange={handleChange} // Updated to use handleChange for consistency
                        required
                        disabled={status === "aprobado"}
                    >
                        <option value="">-- Selecciona una carrera --</option>
                        <option value="Ing. Civil Industrial">Ing. Civil Industrial</option>
                        <option value="Ing. Civil Informática">Ing. Civil Informática</option>
                        <option value="Ing. Industrial">Ing. Industrial</option>
                        <option value="Ing. Computación e Informática">Ing. Computación e Informática</option>
                        <option value="Ing. Logística y Transporte">Ing. Logística y Transporte</option>
                        <option value="Ing. Gestión Informática">Ing. Gestión Informática</option>
                        <option value="Ing. Seguridad y Prevención de Riesgos">Ing. Seguridad y Prevención de Riesgos</option>
                        <option value="Ing. Telecomunicaciones">Ing. Telecomunicaciones</option>
                        <option value="Ing. Automatización y Robótica">Ing. Automatización y Robótica</option>
                    </select>
                </div>
                <div className='mb-3'>
                    <h3>Jornada</h3>
                    <input type="radio" name="jornada" value="Diurna" disabled={status === "aprobado"}/> Diurna
                    <input type="radio" name="jornada" value="Vespertina" className= "ms-4" disabled={status === "aprobado"}/> Vespertina
                </div>
                <div className='mb-3'>
                    <h3>Tipo de práctica</h3>
                    <input type="radio" name="tipoPractica" value="Práctica I" disabled={status === "aprobado"}/> Práctica I
                    <input type="radio" name="tipoPractica" value="Práctica II" className= "ms-4" disabled={status === "aprobado"}/> Práctica II
                </div>
                <h1>Datos Empresa</h1>
                <div className="mb-3">
                    <label htmlFor="empresaNombre" className="form-label" >Nombre</label>
                    <input
                        type="text"
                        className="form-control"
                        id="empresaNombre"
                        name="empresaNombre"
                        value={formData.empresaNombre || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                    <label htmlFor="empresaRut" className="form-label">R.U.T. Empresa</label>
                    <input
                        type="text"
                        className="form-control"
                        id="empresaRut"
                        name="empresaRut"
                        value={formData.empresaRut || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                    <label htmlFor="empresaGiro" className="form-label">Giro</label>
                    <input
                        type="text"
                        className="form-control"
                        id="empresaGiro"
                        name="empresaGiro"
                        value={formData.empresaGiro || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                    <label htmlFor="empresaDireccion" className="form-label">Dirección Empresa</label>
                    <input
                        type="text"
                        className="form-control"
                        id="empresaDireccion"
                        name="empresaDireccion"
                        value={formData.empresaDireccion || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                    <label htmlFor="empresaComuna" className="form-label">Comuna</label>
                    <input
                        type="text"
                        className="form-control"
                        id="empresaComuna"
                        name="empresaComuna"
                        value={formData.empresaComuna || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                    <label htmlFor="empresaCiudad" className="form-label">Ciudad</label>
                    <input
                        type="text"
                        className="form-control"
                        id="empresaCiudad"
                        name="empresaCiudad"
                        value={formData.empresaCiudad || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                    <label htmlFor="empresaRegion" className="form-label">Región</label>
                    <select
                        id="empresaRegion"
                        className="form-select"
                        name="empresaRegion"
                        value={formData.empresaRegion || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    >
                        <option value="" disabled={status === "aprobado"}>-- Selecciona una región --</option>
                        {regionesDeChile.map((region, index) => (
                            <option key={index} value={region} >{region}</option>
                        ))}
                    </select>
                    <label htmlFor="empresaTelefono" className="form-label">Teléfono</label>
                    <input
                        type="text"
                        className="form-control"
                        id="empresaTelefono"
                        name="empresaTelefono"
                        value={formData.empresaTelefono || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                    <label htmlFor="empresaWeb" className="form-label">Pág. Web</label>
                    <input
                        type="text"
                        className="form-control"
                        id="empresaWeb"
                        name="empresaWeb"
                        value={formData.empresaWeb || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                    <label htmlFor="empresaEmail" className="form-label">e-mail</label>
                    <input
                        type="email"
                        className="form-control"
                        id="empresaEmail"
                        name="empresaEmail"
                        value={formData.empresaEmail || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                </div>

                <div className="mb-3">
                    <h3>Persona a quien va dirigida la carta</h3>
                    <label htmlFor="cartaNombre" className="form-label">Nombre</label>
                    <input
                        type="text"
                        className="form-control"
                        id="cartaNombre"
                        name="cartaNombre"
                        value={formData.cartaNombre || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                    <label htmlFor="cartaCargo" className="form-label">Cargo que ocupa</label>
                    <input
                        type="text"
                        className="form-control"
                        id="cartaCargo"
                        name="cartaCargo"
                        value={formData.cartaCargo || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                    <label htmlFor="cartaEmail" className="form-label">e-mail</label>
                    <input
                        type="email"
                        className="form-control"
                        id="cartaEmail"
                        name="cartaEmail"
                        value={formData.cartaEmail || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                </div>

                <div className="mb-3">
                    <h3>Persona a cargo o supervisor</h3>
                    <label htmlFor="supervisorNombre" className="form-label">Nombre</label>
                    <input
                        type="text"
                        className="form-control"
                        id="supervisorNombre"
                        name="supervisorNombre"
                        value={formData.supervisorNombre || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                    <label htmlFor="supervisorCargo" className="form-label">Cargo que ocupa</label>
                    <input
                        type="text"
                        className="form-control"
                        id="supervisorCargo"
                        name="supervisorCargo"
                        value={formData.supervisorCargo || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                    <label htmlFor="supervisorTelefono" className="form-label">Teléfono</label>
                    <input
                        type="text"
                        className="form-control"
                        id="supervisorTelefono"
                        name="supervisorTelefono"
                        value={formData.supervisorTelefono || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                    <label htmlFor="supervisorEmail" className="form-label">e-mail</label>
                    <input
                        type="email"
                        className="form-control"
                        id="supervisorEmail"
                        name="supervisorEmail"
                        value={formData.supervisorEmail || ''}
                        onChange={handleChange}
                        required
                        disabled={status === "aprobado"}
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="observacion" className="form-label">Observación</label>
                    <textarea
                        id="observacion"
                        className="form-control"
                        name="observacion"
                        rows="5"
                        value={formData.observacion || ''}
                        onChange={handleChange}
                        placeholder="Describe las tareas que realizarás en la empresa"
                        required
                        disabled={status === "aprobado"}
                    ></textarea>
                </div>

                <div className="mb-3">
                    <label htmlFor="firma_alumno" className="form-label">Adjuntar firma Alumno</label>
                    <input
                        type="file"
                        className="form-control"
                        id="firma_alumno"
                        name="firma_alumno"
                        accept=".png, .pdf" /* Permite solo archivos PNG o PDF */
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                console.log("Archivo seleccionado:", file.name);
                            }
                        }}
                        value={formData.firmaAlumno}
                        disabled={status === "aprobado"}
                    />
                    <label htmlFor="firma_alumno" className="form-label mt-3">Adjuntar timbre y firma de la Empresa</label>
                    <input
                        type="file"
                        className="form-control"
                        id="firma_alumno"
                        name="firma_alumno"
                        accept=".png, .pdf" /* Permite solo archivos PNG o PDF */
                        onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) {
                                console.log("Archivo seleccionado:", file.name);
                            }
                        }}
                        value={formData.firmaEmpresa}
                        disabled={status === "aprobado"}
                    />
                </div>

                <button type="submit" 
                    className="btn text-white mt-5" 
                    style={{backgroundColor: "#f71212ff", 
                    padding: "10px 50px", 
                    fontSize: "20px"}}
                    disabled={status === "aprobado"}
                >
                    Enviar
                </button>
            </form>
        </div>
    );
}