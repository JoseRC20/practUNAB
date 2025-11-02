// ...existing code...
import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function Hitos() {
    const [hito1File, setHito1File] = useState(null);
    const [hito2File, setHito2File] = useState(null);
    // store full hito info by milestoneNumber: { status, reviewerComments, files, submittedAt, reviewedAt, _id }
    const [hitosMap, setHitosMap] = useState({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

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

    return (
        <div className="container mt-5">
            <h2>Subir Archivos para Hitos</h2>

            {loading && <div className="alert alert-info">Cargando...</div>}
            {message && <div className="alert alert-secondary">{message}</div>}

            <form>
                <div className="mb-3">
                    <label htmlFor="hito1" className="form-label">
                        Hito 1 — Estado: {hitosMap[1]?.status || 'no_iniciado'}
                    </label>
                    {hitosMap[1] && hitosMap[1].reviewerComments && (
                        <div className="alert alert-info mt-2">Observación profesor: {hitosMap[1].reviewerComments}</div>
                    )}
                    <input
                        type="file"
                        className="form-control"
                        id="hito1"
                        accept=".doc,.docx,.pdf"
                        onChange={(e) => handleFileChange(e, setHito1File)}
                        disabled={isDisabledFor(1)}
                    />
                    <button
                        type="button"
                        className="btn btn-primary mt-2"
                        onClick={() => uploadSingleMilestone(1)}
                        disabled={loading || isDisabledFor(1)}
                    >
                        Enviar Hito 1
                    </button>
                </div>

                <div className="mb-3">
                    <label htmlFor="hito2" className="form-label">
                        Hito 2 — Estado: {hitosMap[2]?.status || 'no_iniciado'}
                    </label>
                    {hitosMap[2] && hitosMap[2].reviewerComments && (
                        <div className="alert alert-info mt-2">Observación profesor: {hitosMap[2].reviewerComments}</div>
                    )}
                    <input
                        type="file"
                        className="form-control"
                        id="hito2"
                        accept=".doc,.docx,.pdf"
                        onChange={(e) => handleFileChange(e, setHito2File)}
                        disabled={isDisabledFor(2)}
                    />
                    <button
                        type="button"
                        className="btn btn-primary mt-2"
                        onClick={() => uploadSingleMilestone(2)}
                        disabled={loading || isDisabledFor(2)}
                    >
                        Enviar Hito 2
                    </button>
                </div>
            </form>
        </div>
    );
}
// ...existing code...