import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { jsPDF } from 'jspdf';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ViewForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [practice, setPractice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const res = await fetch(`http://localhost:5000/api/practices/${id}`, { headers: { Authorization: 'Bearer ' + token } });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error || j.message || 'Error loading practice');
      }
      const data = await res.json();
      setPractice(data.practice);
    } catch (err) { setError(err.message || String(err)); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (token) load(); }, [token, id]);

  const changeStatus = async (newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/practices/${id}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }, body: JSON.stringify({ status: newStatus }) });
      if (!res.ok) { const j = await res.json().catch(()=>({})); throw new Error(j.error || j.message || 'Error updating status'); }
      await load();
      alert('Estado actualizado');
      navigate('/DashboardSecretaria');
    } catch (err) { alert(err.message || String(err)); }
  };

  const downloadJSON = () => {
    if (!practice) return;
    const data = JSON.stringify(practice, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `practice-${practice._id}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const downloadImage = (dataUrl, filename) => {
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };


  const generatePDF = () => {
    if (!practice) return alert('No hay práctica cargada');
    const doc = new jsPDF();
    let y = 15;
    doc.setFontSize(16);
    doc.text('Formulario de Práctica', 14, y);
    y += 8;
    doc.setFontSize(11);

    const addLine = (label, value) => {
      if (!value && value !== 0) return;
      const line = `${label}: ${value}`;
      const split = doc.splitTextToSize(line, 180);
      doc.text(split, 14, y);
      y += split.length * 6;
      if (y > 270) { doc.addPage(); y = 15; }
    };

    addLine('Alumno', `${practice.student?.firstName || ''} ${practice.student?.lastNamePaternal || ''} ${practice.student?.lastNameMaternal || ''}`);
    addLine('Rut', practice.student?.rut);
    addLine('Correo Alumno', practice.student?.email);
    addLine('Carrera', practice.career);
    addLine('Jornada', practice.jornada);
    addLine('Tipo de práctica', practice.tipoPractica);
    addLine('Empresa', `${practice.empresaNombre || ''} - ${practice.empresaRut || ''}`);
    addLine('Giro', practice.empresaGiro);
    addLine('Contacto empresa', `${practice.empresaTelefono || ''} ${practice.empresaEmail || ''} ${practice.empresaWeb || ''}`);
    addLine('Dirección', `${practice.empresaDireccion || ''}, ${practice.empresaComuna || ''}, ${practice.empresaCiudad || ''}`);
    addLine('Carta a', `${practice.cartaNombre || ''} (${practice.cartaEmail || ''})`);
    addLine('Cargo', practice.cartaCargo);
    addLine('Supervisor', practice.supervisorNombre);
    addLine('Contacto supervisor', `${practice.supervisorEmail || ''} ${practice.supervisorTelefono || ''}`);
    addLine('Observación', practice.observacion);

    // Add images if present
    if (practice.firmaAlumno) {
      if (y > 240) { doc.addPage(); y = 15; }
      doc.text('Firma Alumno:', 14, y);
      y += 6;
      try {
        doc.addImage(practice.firmaAlumno, 'PNG', 14, y, 60, 40);
      } catch (e) {
        console.warn('Failed to add firmaAlumno to PDF', e);
      }
      y += 46;
    }
    if (practice.firmaEmpresa) {
      if (y > 240) { doc.addPage(); y = 15; }
      doc.text('Firma Empresa:', 14, y);
      y += 6;
      try {
        doc.addImage(practice.firmaEmpresa, 'PNG', 14, y, 60, 40);
      } catch (e) {
        console.warn('Failed to add firmaEmpresa to PDF', e);
      }
      y += 46;
    }

    doc.save(`practice-${practice.student?.rut}.pdf`);
  };

  if (loading) return <div className="container mt-4">Loading...</div>;
  if (error) return <div className="container mt-4"><div className="alert alert-danger">{error}</div></div>;
  if (!practice) return <div className="container mt-4">No practice found</div>;

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate('/DashboardSecretaria')}>Volver</button>
      <h3 className='mb-3'>Formulario de práctica</h3>
      <div className="card p-3 mb-3">
        <h5>Datos estudiante</h5>
        <p>Nombre : {practice.student?.firstName} {practice.student?.lastNamePaternal} {practice.student?.lastNameMaternal} ({practice.student?.email})</p>
        <p>Rut : {practice.student?.rut}</p>
        <p>Carrera : {practice.career}</p>
        <p>Jornada : {practice.jornada}</p>
        <p>Tipo de práctica : {practice.tipoPractica}</p>
        
        <h5>Datos de Empresa</h5>
        <p>Nombre y Rut : {practice.empresaNombre} - {practice.empresaRut}</p>
        <p>Giro : {practice.empresaGiro}</p>
        <p>Contacto : {practice.empresaTelefono} - {practice.empresaEmail} - {practice.empresaWeb}</p>
        <p>Dirección : {practice.empresaDireccion}, {practice.empresaComuna}, {practice.empresaCiudad}, {practice.empresaRegion}</p>
        <h5>A quien dirigir la carta</h5>
        <p>Nombre : {practice.cartaNombre} ({practice.cartaEmail})</p>
        <p>Cargo : {practice.cartaCargo}</p>
        <h5>Supervisor</h5>
        <p>Nombre : {practice.supervisorNombre}</p> 
        <p>Contacto : {practice.supervisorEmail} - {practice.supervisorTelefono}</p>
        <h5>Observación</h5>
        <p>{practice.observacion}</p>

        <div className="row">
          <div className="col-md-6">
            <h6>Firma Alumno</h6>
            {practice.firmaAlumno ? <img src={practice.firmaAlumno} alt="Firma Alumno" style={{ maxWidth: '50%' }} /> : <div>No hay firma</div>}
          </div>
          <div className="col-md-6">
            <h6>Firma Empresa</h6>
            {practice.firmaEmpresa ? <img src={practice.firmaEmpresa} alt="Firma Empresa" style={{ maxWidth: '50%' }} /> : <div>No hay firma</div>}
          </div>
        </div>

        <div className="mt-3">
          <strong>Estado:</strong> {practice.status}
        </div>

        <div className="mt-3 d-flex flex-wrap align-items-center gap-2">
          <button className="btn btn-outline-secondary" onClick={generatePDF}>Descargar PDF</button>
          <div className="ms-auto">
            <button className="btn btn-success me-2" onClick={() => changeStatus('aprobado')}>Aprobar</button>
            <button className="btn btn-danger" onClick={() => changeStatus('rechazado')}>Rechazar</button>
          </div>
        </div>
      </div>
    </div>
  );
}
