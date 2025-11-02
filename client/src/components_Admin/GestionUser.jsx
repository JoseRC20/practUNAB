import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
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
    const [err, setErr] = useState(null);
    const change = e => setForm(f => ({...f, [e.target.name]: e.target.value}));

    const submit = async e => {
        e.preventDefault();
        setErr(null);
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
        setForm(f => ({...f, rut:'', firstName:'', lastNamePaternal:'', lastNameMaternal:'', email:'', phone:'', password:'', professorEmail:''}));
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

    const handleDelete = async () => {
        if (!selectedUserId) return setErr('Seleccione un usuario para eliminar');
        if (!window.confirm('¿Confirma eliminar el usuario seleccionado?')) return;
        try {
            const res = await fetch(`http://localhost:5000/api/admin/users/${selectedUserId}`, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
            const json = await res.json();
            if (!res.ok) return setErr(json.error || 'Error eliminando usuario');
            // refresh list
            await loadUsers();
            setErr(null);
        } catch (err) { setErr('Error eliminando usuario'); console.error(err); }
    }

    return (
        <form onSubmit={submit}>
            <select name="role" value={form.role} onChange={change}>
                <option value="student">Student</option>
                <option value="professor">Professor</option>
                <option value="secretary">Secretary</option>
            </select>

            <input name="rut" placeholder="RUT (12.345.678-5)" value={form.rut} onChange={change}/>
            <input name="firstName" placeholder="Nombres" value={form.firstName} onChange={change}/>
            <input name="lastNamePaternal" placeholder="Apellido Paterno" value={form.lastNamePaternal} onChange={change}/>
            <input name="lastNameMaternal" placeholder="Apellido Materno" value={form.lastNameMaternal} onChange={change}/>
            <input name="email" placeholder="correo institucional" value={form.email} onChange={change}/>
            <input name="phone" placeholder="Teléfono" value={form.phone} onChange={change}/>
            <input name="password" placeholder="Contraseña" type="password" value={form.password} onChange={change}/>

            {form.role==='student' && (
                <input name="professorEmail" placeholder="Correo profesor" value={form.professorEmail} onChange={change}/>
            )}

            {err && <div className="error">{err}</div>}
            <button type="submit">Crear usuario</button>
            
            <div style={{marginTop:20}}>
                <h4>Usuarios existentes</h4>
                <div>
                    <select value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} style={{minWidth:300}}>
                        <option value="">-- Seleccione un usuario --</option>
                        {users.map(u => (
                            <option key={u._id || u.id} value={u._id || u.id}>
                                {u.firstName || u.name} {u.lastNamePaternal || ''} — {u.email}
                            </option>
                        ))}
                    </select>
                    <button type="button" onClick={handleDelete} style={{marginLeft:10}}>Eliminar seleccionado</button>
                </div>

                <div style={{marginTop:10}}>
                    <strong>Vista rápida:</strong>
                    <ul>
                        {users.slice(0,10).map(u => (
                            <li key={u._id || u.id}>{u.firstName || u.name} {u.lastNamePaternal || ''} — {u.email} ({u.role})</li>
                        ))}
                    </ul>
                </div>
            </div>

        </form>
    );
}