import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import validateRUT from '../utils/rut';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';



export default function AdminCreateUserForm({ onCreated }) {
    const { token } = useAuth();

    const [form, setForm] = useState({
        role: 'student',
        rut: '',
        firstName: '',
        lastNamePaternal: '',
        lastNameMaternal: '',
        email: '',
        phone: '',
        password: '',
        professorEmail: ''
    });
    const [users, setUsers] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState('');
    const [search, setSearch] = useState('');
    const [err, setErr] = useState(null);
    const change = e => setForm(f => ({...f, [e.target.name]: e.target.value}));

    const submit = async e => {
        e.preventDefault();
        setErr(null);
        // validate RUT before sending
        const vat = validateRUT(form.rut);
        if (!vat || !vat.valid) {
            setErr('RUT inválido');
            return;
        }
        // enforce institutional email domain
        const domain = '@uandresbello.edu';
        const emailNormalized = (form.email || '').toLowerCase().trim();
        if (!emailNormalized.endsWith(domain)) {
            setErr('El correo debe terminar con @uandresbello.edu');
            return;
        }
        // if creating a student, validate professor email when provided
        if (form.role === 'student' && form.professorEmail) {
            const profEmail = String(form.professorEmail).toLowerCase().trim();
            if (!profEmail.endsWith(domain)) {
                setErr('El correo del profesor debe terminar con @uandresbello.edu');
                return;
            }
        }
        try {
            const res = await fetch('http://localhost:5000/api/admin/users', {
                method:'POST',
                headers:{ 'Content-Type':'application/json', 'Authorization': 'Bearer '+ token },
                body: JSON.stringify(form)
            });
            const json = await res.json();
            if (!res.ok) return setErr(json.error || 'error');
            onCreated?.(json);
            // refresh list
            loadUsers();
            // clear form
            setForm({ role: 'student', rut: '', firstName: '', lastNamePaternal: '', lastNameMaternal: '', email: '', phone: '', password: '', professorEmail: '' });
        } catch (err) {
            console.error(err);
            setErr('Error creando usuario');
        }
    };

    const loadUsers = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/admin/users', { headers: { Authorization: 'Bearer ' + token } });
            if (!res.ok) return console.error('Failed to load users');
            const data = await res.json();
            // expect data.users or array
            const list = data.users || data || [];
            setUsers(list);
            if (list.length && !selectedUserId) setSelectedUserId(list[0]._id || list[0].id || '');
        } catch (err) { console.error(err); }
    }

    useEffect(() => { if (token) loadUsers(); }, [token]);

    // compute small dashboard stats from loaded users
    const stats = {
        total: users.length,
        students: users.filter(u => u.role === 'student').length,
        professors: users.filter(u => u.role === 'professor').length,
        secretaries: users.filter(u => u.role === 'secretary').length,
    };

    const handleDelete = async (userId) => {
        const id = userId || selectedUserId;
        if (!id) return setErr('Seleccione un usuario para eliminar');
        if (!window.confirm('¿Confirma eliminar el usuario seleccionado?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
            const json = await res.json();
            if (!res.ok) return setErr(json.error || 'Error eliminando usuario');
            // refresh list
            await loadUsers();
            setErr(null);
        } catch (err) { setErr('Error eliminando usuario'); console.error(err); }
    }

    return (
        <form onSubmit={submit}>
            <h1 className='mt-4 ms-3 text-center'>Panel de administración</h1>
            <span className="d-block w-50 bg-danger my-2 mx-auto mb-2" style={{height:'5px'}}></span>
            <p className='ms-3 mb-5'>Dentro de esta vista tiene la opción de crear usuarios y de poder eliminar usuarios sin importar su rol</p>

            <div className="row g-3 mb-4 ms-1 me-1">
                <div className="col-6 col-md-3">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body">
                            <small className="text-muted">Usuarios totales</small>
                            <h3 className="mt-2 mb-0">{stats.total}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-6 col-md-3">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body">
                            <small className="text-muted">Estudiantes</small>
                            <h3 className="mt-2 mb-0">{stats.students}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-6 col-md-3">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body">
                            <small className="text-muted">Profesores</small>
                            <h3 className="mt-2 mb-0">{stats.professors}</h3>
                        </div>
                    </div>
                </div>

                <div className="col-6 col-md-3">
                    <div className="card h-100 shadow-sm">
                        <div className="card-body">
                            <small className="text-muted">Secretaría</small>
                            <h3 className="mt-2 mb-0">{stats.secretaries}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card p-3 mb-5 ms-5 me-5">
                <h5 className="mb-3">Crear Usuario</h5>
                <div className="mb-2">
                    <label className="form-label">Rol</label>
                    <select className="form-select form-select-sm w-auto" style={{ maxWidth: '220px' }} name="role" value={form.role} onChange={change}>
                        <option value="student">Student</option>
                        <option value="professor">Professor</option>
                        <option value="secretary">Secretary</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>

                <div className="row g-2">
                    <div className="col-6">
                        <label className="form-label">RUT</label>
                        <input className="form-control" name="rut" placeholder="12.345.678-5" value={form.rut} onChange={change}/>
                    </div>
                    <div className="col-6">
                        <label className="form-label">Teléfono</label>
                        <input className="form-control" name="phone" placeholder="+569..." value={form.phone} onChange={change}/>
                    </div>
                </div>

                <div className="row g-2 mt-2">
                    <div className="col-6">
                        <label className="form-label">Nombres</label>
                        <input className="form-control" name="firstName" placeholder="Nombres" value={form.firstName} onChange={change}/>
                    </div>
                    <div className="col-6">
                        <label className="form-label">Apellido Paterno</label>
                        <input className="form-control" name="lastNamePaternal" placeholder="Apellido Paterno" value={form.lastNamePaternal} onChange={change}/>
                    </div>
                </div>

                <div className="row g-2 mt-2">
                    <div className="col-6">
                        <label className="form-label">Apellido Materno</label>
                        <input className="form-control" name="lastNameMaternal" placeholder="Apellido Materno" value={form.lastNameMaternal} onChange={change}/>
                    </div>
                    <div className="col-6">
                        <label className="form-label">Correo</label>
                        <input className="form-control" name="email" placeholder="Correo institucional" value={form.email} onChange={change}/>
                    </div>
                </div>

                <div className="row g-2 mt-2">
                    <div className="col-6">
                        <label className="form-label">Contraseña</label>
                        <input className="form-control" name="password" placeholder="Contraseña (rut sin puntos ni guíon)" type="password" value={form.password} onChange={change}/>
                    </div>
                    <div className="col-6">
                        {form.role==='student' && (
                            <>
                                <label className="form-label">Correo del profesor</label>
                                <input className="form-control" name="professorEmail" placeholder="Correo institucional" value={form.professorEmail} onChange={change}/>
                            </>
                        )}
                    </div>
                </div>

                {err && <div className="alert alert-danger mt-3">{err}</div>}
                <div className="d-flex gap-2 mt-3">
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setForm({ role: 'student', rut: '', firstName: '', lastNamePaternal: '', lastNameMaternal: '', email: '', phone: '', password: '', professorEmail: '' })}>Limpiar</button>
                    <button type="submit" className="btn btn-primary">Crear usuario</button>
                </div>
            </div>

            <div className='ms-5 me-5 mb-5'> 
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <h2 className="mb-0">Usuarios</h2>
                    <div style={{maxWidth: 360, width: '100%'}}>
                        <input className="form-control" placeholder="Buscar por RUT o email" value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                <div className="card">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead>
                                <tr>
                                    <th>Rol</th>
                                    <th>RUT</th>
                                    <th>Nombre</th>
                                    <th>Correo institucional</th>
                                    <th style={{width: '140px'}}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.filter(u => {
                                    if (!search) return true;
                                    const s = search.toLowerCase();
                                    return (u.rut && String(u.rut).toLowerCase().includes(s)) || (u.email && u.email.toLowerCase().includes(s)) || ((u.firstName||'').toLowerCase().includes(s)) || ((u.lastNamePaternal||'').toLowerCase().includes(s));
                                }).map(u => (
                                    <tr key={u._id || u.id}>
                                        <td>{u.role}</td>
                                        <td>{u.rut || '—'}</td>
                                        <td>{(u.firstName || '') + (u.lastNamePaternal ? ' ' + u.lastNamePaternal : '')}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            <div className="d-flex gap-2">
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id || u.id)}><span style={{marginRight:6}}>🗑️</span>Eliminar</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </form>
    );
}