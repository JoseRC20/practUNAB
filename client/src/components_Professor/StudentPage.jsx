import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ViewStateStudent from './ViewStateStudent';

export default function StudentPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!token || !id) return;
      setLoading(true);
      try {
        // fetch the professor profile (me) which contains populated listStudents
        const res = await fetch('http://localhost:5000/api/professors/me', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('No profile');
        const j = await res.json();
        const prof = j.profile;
        if (prof && Array.isArray(prof.listStudents)) {
          const found = prof.listStudents.find(s => String(s._id) === String(id));
          if (found) {
            setStudent(found);
            return;
          }
        }

        // fallback: try to fetch professor students by id of professor if route is used by admin
        // or try to request students endpoint (if available) and find the student
        const alt = await fetch(`http://localhost:5000/api/professors/${prof?._id || ''}/students`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null);
        if (alt && alt.ok) {
          const ad = await alt.json();
          const found2 = (ad.students || []).find(s => String(s._id) === String(id));
          if (found2) {
            setStudent(found2);
            return;
          }
        }

        setError('Student not found or not accessible');
      } catch (err) {
        console.error(err);
        setError(err.message || 'Error loading student');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, id]);

  if (loading) return <div>Loading student...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!student) return <div>No student found</div>;

  return (
    <div className="container mt-3">
      <button className="btn btn-secondary mb-3" onClick={() => window.history.back()}>Volver</button>
      <ViewStateStudent student={student} />
    </div>
  );
}
