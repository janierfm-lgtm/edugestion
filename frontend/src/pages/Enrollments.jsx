import { useEffect, useState } from 'react';
import apiClient from '../api/client';

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [form, setForm] = useState({ student_id: '', course_id: '' });
  const [error, setError] = useState('');

  async function load() {
    const { data } = await apiClient.get('/enrollments');
    setEnrollments(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/enrollments', {
        student_id: Number(form.student_id),
        course_id: Number(form.course_id),
      });
      setForm({ student_id: '', course_id: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo registrar la matrícula');
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Matrículas</h2>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-2">Estudiante</th>
                <th className="px-4 py-2">Curso</th>
                <th className="px-4 py-2">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.map((en) => (
                <tr key={en.id}>
                  <td className="px-4 py-2">{en.student_name}</td>
                  <td className="px-4 py-2">{en.course_name}</td>
                  <td className="px-4 py-2 text-slate-500">
                    {new Date(en.enrolled_at).toLocaleDateString('es-PE')}
                  </td>
                </tr>
              ))}
              {enrollments.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                    No hay matrículas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Nueva matrícula</h3>
        <form onSubmit={handleCreate} className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 space-y-3">
          <div>
            <label htmlFor="student_id" className="block text-xs font-medium text-slate-600 mb-1">
              ID del estudiante
            </label>
            <input
              id="student_id"
              type="number"
              required
              value={form.student_id}
              onChange={(e) => setForm({ ...form, student_id: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="course_id" className="block text-xs font-medium text-slate-600 mb-1">
              ID del curso
            </label>
            <input
              id="course_id"
              type="number"
              required
              value={form.course_id}
              onChange={(e) => setForm({ ...form, course_id: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md py-2">
            Matricular
          </button>
          <p className="text-xs text-slate-400">
            Consejo: revisa los IDs en el panel o pídele al administrador la lista de usuarios.
          </p>
        </form>
      </div>
    </div>
  );
}
