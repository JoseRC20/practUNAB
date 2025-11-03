// ...existing code...
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';

export default function Hitos() {
    const [hito1File, setHito1File] = useState(null);
    const [hito2File, setHito2File] = useState(null);
    // store full hito info by milestoneNumber: { status, reviewerComments, files, submittedAt, reviewedAt, _id }
    const [hitosMap, setHitosMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const getToken = () => localStorage.getItem('authToken');

    const normalizeStatus = (raw) => {
        if (!raw) return 'no_iniciado';
        const s = String(raw).toLowerCase().replace(/[_\s]+/g, '');
        // treat only 'no_iniciado' (and variants) as no_iniciado; everything else -> enviado
        if (s === 'noiniciado' || s === 'no_iniciado') return 'no_iniciado';
        return 'enviado';
    };

    const fetchProfileAndHitos = async () => {
        setLoading(true);
        setMessage('');
        try {
            const token = getToken();
            if (!token) {
                setMessage('Debe iniciar sesión para ver/subir hitos.');
                setLoading(false);
                return;
            }

            let idToUse = null;
            const storedRaw = localStorage.getItem('userData');
            if (storedRaw) {
                try {
                    const parsed = JSON.parse(storedRaw);
                    const profileObj = parsed.profile || parsed;
                    const studentProfileId = profileObj._id || profileObj.id || null;
                    const userIdFromUser = profileObj.user && (profileObj.user._id || profileObj.user.id) || null;
                    idToUse = userIdFromUser || studentProfileId || null;
                } catch (e) {
                    console.warn('userData parse error', e);
                    idToUse = null;
                }
            }

            if (!idToUse) {
                const profRes = await fetch('http://localhost:5000/api/students/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!profRes.ok) {
                    if (profRes.status === 401) setMessage('Sesión expirada. Por favor inicie sesión.');
                    else setMessage('No se pudo obtener perfil de usuario.');
                    setLoading(false);
                    return;
                }

                const body = await profRes.json();
                const profile = body.profile || body;
                try { localStorage.setItem('userData', JSON.stringify(profile)); } catch (e) { /* ignore */ }

                const studentProfileId = profile._id || profile.id || null;
                const userIdFromUser = profile.user && (profile.user._id || profile.user.id) || null;
                idToUse = userIdFromUser || studentProfileId || null;
            }

            if (!idToUse) {
                console.error('fetchProfileAndHitos: id de usuario no disponible');
                setMessage('ID de usuario no disponible. Intente volver a iniciar sesión.');
                setLoading(false);
                return;
            }

            const res = await fetch(`http://localhost:5000/api/hitos/student/${encodeURIComponent(String(idToUse))}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                setMessage('No se pudieron obtener los hitos.');
                setLoading(false);
                return;
            }
            const data = await res.json();
            const map = {};
            (Array.isArray(data) ? data : []).forEach(h => {
                if (h.milestoneNumber !== undefined && h.milestoneNumber !== null) {
                    map[h.milestoneNumber] = {
                        status: h.status || 'no_iniciado',
                        reviewerComments: h.reviewerComments || '',
                        files: h.files || [],
                        submittedAt: h.submittedAt || null,
                        reviewedAt: h.reviewedAt || null,
                        _id: h._id,
                    };
                }
            });
            setHitosMap(map);
        } catch (err) {
            console.error(err);
            setMessage('Error al contactar el servidor.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileAndHitos();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFileChange = (e, setFile) => {
        setFile(e.target.files[0] || null);
    };

    const uploadFileForMilestone = async (file, milestoneNumber) => {
        if (!file) return null;
        const token = getToken();
        if (!token) throw new Error('No auth token');

        const form = new FormData();
        form.append('file', file);
        form.append('milestoneNumber', String(milestoneNumber));
        form.append('title', `Hito ${milestoneNumber}`);

        const res = await fetch('http://localhost:5000/api/hitos', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` }, // DO NOT set Content-Type for multipart
            body: form
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ message: 'Upload failed' }));
            throw new Error(err.message || `Upload failed (${res.status})`);
        }
        return res.json();
    };

    const uploadSingleMilestone = async (milestoneNumber) => {
        setMessage('');
        setLoading(true);
        try {
            const file = milestoneNumber === 1 ? hito1File : hito2File;
            if (!file) {
                setMessage(`Seleccione un archivo para el Hito ${milestoneNumber}.`);
                setLoading(false);
                return;
            }
            await uploadFileForMilestone(file, milestoneNumber);
            setMessage(`Hito ${milestoneNumber} subido correctamente.`);
            await fetchProfileAndHitos();
            if (milestoneNumber === 1) {
                setHito1File(null);
                const el = document.getElementById('hito1'); if (el) el.value = '';
            } else {
                setHito2File(null);
                const el = document.getElementById('hito2'); if (el) el.value = '';
            }
        } catch (err) {
            console.error(err);
            setMessage(err.message || `Error al subir Hito ${milestoneNumber}.`);
        } finally {
            setLoading(false);
        }
    };

    const downloadHitoFile = async (hitoId, idx, fileName) => {
        const token = getToken();
        if (!token) return alert('Debe iniciar sesión para descargar el archivo.');
        try {
            const res = await fetch(`http://localhost:5000/api/hitos/${hitoId}/file/${idx}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                const txt = await res.text().catch(() => '');
                throw new Error(txt || 'Error descargando archivo');
            }
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName || `hito-${hitoId}-${idx}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('downloadHitoFile error', err);
            alert(err.message || 'Error descargando archivo');
        }
    };

    const handleSubmit = async (e) => {
        // opcional: subir ambos a la vez si hay archivos seleccionados
        e.preventDefault();
        setMessage('');
        setLoading(true);
        try {
            const uploads = [];
            if (hito1File) uploads.push(uploadFileForMilestone(hito1File, 1));
            if (hito2File) uploads.push(uploadFileForMilestone(hito2File, 2));

            if (uploads.length === 0) {
                setMessage('Seleccione al menos un archivo.');
                setLoading(false);
                return;
            }

            await Promise.all(uploads);
            setMessage('Archivos subidos correctamente.');
            await fetchProfileAndHitos();
            setHito1File(null);
            setHito2File(null);
            const e1 = document.getElementById('hito1'); if (e1) e1.value = '';
            const e2 = document.getElementById('hito2'); if (e2) e2.value = '';
        } catch (err) {
            console.error(err);
            setMessage(err.message || 'Error al subir archivos.');
        } finally {
            setLoading(false);
        }
    };

    const isDisabledFor = (milestoneNumber) => {
        const info = hitosMap[milestoneNumber];
        const s = info && info.status ? info.status : 'no_iniciado';
        // disable if already enviado or aprobado. If rechazado, allow resubmit.
        return s === 'enviado' || s === 'aprobado';
    };

    useEffect(() => {
        console.log('Hitos map:', hitosMap, 'loading:', loading, 'message:', message);
    }, [hitosMap, loading, message]);

    const badgeFor = (status) => {
        const s = String(status || '').toLowerCase();
        if (s.includes('aprob')) return 'bg-success';
        if (s.includes('rechaz')) return 'bg-danger';
        if (s.includes('pend')) return 'bg-warning text-dark';
        if (s === 'no_iniciado' || s.includes('noiniciado')) return 'bg-secondary';
        return 'bg-info';
    };

    return (
        <div className="container my-4" style={{maxWidth: '900px'}}>
            <button className="btn btn-secondary mb-3" onClick={() => navigate('/HomeAlumno')}>Volver</button>
            <h2 className="mb-4">Subir archivos para hitos</h2>
            <p>En esta sección usted podrá subir los Hitos I y II en documento PDF o Word</p>

            {loading && <div className="alert alert-info">Cargando...</div>}
            {message && <div className="alert alert-secondary">{message}</div>}

            {[1,2].map(n => {
                const info = hitosMap[n] || {};
                const status = info.status || 'no_iniciado';
                const files = info.files || [];
                const disabled = isDisabledFor(n);
                return (
                    <div className="card mb-3" key={n}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <h5 className="mb-0">Hito {n}</h5>
                                <span className={`badge ${badgeFor(status)}`}>{status}</span>
                            </div>

                            {info.reviewerComments && (
                                <div className="alert alert-info">Observación profesor: {info.reviewerComments}</div>
                            )}

                            <input
                                type="file"
                                className="form-control mb-3"
                                id={`hito${n}`}
                                accept=".doc,.docx,.pdf"
                                onChange={(e) => handleFileChange(e, n === 1 ? setHito1File : setHito2File)}
                                disabled={disabled}
                            />

                            {files.length > 0 && (
                                <div className="text-muted small mb-2">Archivo enviado: {files[files.length-1].originalName || files[files.length-1].originalname || files[files.length-1].name || 'Archivo'}</div>
                            )}

                            <div className="d-flex gap-2">
                                <button className="btn btn-primary" onClick={() => uploadSingleMilestone(n)} disabled={loading || disabled}>
                                    📤 {files.length > 0 ? 'Reenviar' : `Enviar Hito ${n}`}
                                </button>
                                {files.length > 0 && info._id && (
                                    <button className="btn btn-secondary" onClick={() => downloadHitoFile(info._id, files.length-1, files[files.length-1].originalName || 'hito.pdf')}>
                                        Descargar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}

        </div>
    );
}
// ...existing code...