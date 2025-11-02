import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewStateStudent from './ViewStateStudent';
import { useNavigate } from 'react-router-dom';

export default function ListStudents({ professorId }) {
    const { token } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!token) return;
            try {
                // If no professorId provided, fetch the authenticated professor's profile
                if (!professorId) {
                    const meRes = await fetch('http://localhost:5000/api/professors/me', 
                    { headers: 
                        { Authorization: `Bearer ${token}` } });
                    if (!meRes.ok) {
                        setError('Failed to fetch professor profile');
                        setLoading(false);
                        return;
                    }
                    const meData = await meRes.json();
                    const prof = meData.profile;
                    if (prof && prof.listStudents) {
                        setStudents(prof.listStudents || []);
                        setLoading(false);
                        return;
                    }
                    // fallback: if profile doesn't include listStudents, try students endpoint using prof._id
                    if (prof && prof._id) {
                        // continue to fetch by id below
                        // eslint-disable-next-line no-var
                        var resolvedId = prof._id;
                    }
                }

                const idToUse = professorId || resolvedId;
                if (!idToUse) {
                    setError('No professor id available');
                    setLoading(false);
                    return;
                }

                const res = await fetch(`http://localhost:5000/api/professors/${idToUse}/students`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) {
                    setError('Failed to fetch students');
                    setLoading(false);
                    return;
                }
                const data = await res.json();
                setStudents(data.students || []);
            } catch (err) {
                setError('Error fetching students');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [token, professorId]);
    const [selected, setSelected] = useState(null);
    const navigate = useNavigate();

    const handleView = (s) => {
        // Navigate to the professor student detail page
        if (s && s._id) {
            navigate(`/professor/student/${s._id}`);
        }
    };

    if (loading) return <div>Loading students...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div>
            <h3>Students List</h3>
            {students.length === 0 ? (
                <p>No students assigned.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Nombre alumno</th>
                                <th>Correo alumno</th>
                                <th>RUT</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student) => (
                                <tr key={student._id}>
                                    <td>{student.Names || student.firstName} {student.lastNamePaternal}</td>
                                    <td>{student.institutionalEmail}</td>
                                    <td>{student.rut}</td>
                                    <td>
                                        <button className="btn btn-sm btn-primary me-2" onClick={() => handleView(student)}>Ver</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal for viewing student details */}
            <div className="modal fade" id="studentViewModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Student details</h5>
                            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">
                            {selected ? (
                                <ViewStateStudent student={selected} />
                            ) : (
                                <div>No student selected</div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}