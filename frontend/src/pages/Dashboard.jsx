import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [coursesRes, enrollmentsRes] = await Promise.all([
          apiClient.get('/courses'),
          apiClient.get('/enrollments'),
        ]);
        setCourses(coursesRes.data);
        setEnrollments(enrollmentsRes.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-900">Hola, {user?.name}</h2>
      <p className="text-slate-500 text-sm mb-6">
        Panel general de EduGestión — resumen rápido de la actividad académica.
      </p>

      {loading ? (
        <p className="text-slate-500 text-sm">Cargando…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Cursos activos" value={courses.length} />
          <StatCard label="Matrículas registradas" value={enrollments.length} />
          <StatCard label="Rol actual" value={user?.role} />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-5">
        <h3 className="font-semibold text-slate-800 mb-3">Cursos disponibles</h3>
        <ul className="divide-y divide-slate-100">
          {courses.map((course) => (
            <li key={course.id} className="py-2 flex justify-between text-sm">
              <span className="font-medium text-slate-700">
                {course.code} · {course.name}
              </span>
              <span className="text-slate-500">{course.teacher_name || 'Sin docente asignado'}</span>
            </li>
          ))}
          {courses.length === 0 && <p className="text-sm text-slate-400 py-2">Aún no hay cursos registrados.</p>}
        </ul>
      </div>
    </div>
  );
}
