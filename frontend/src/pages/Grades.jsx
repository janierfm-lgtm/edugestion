import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Grades() {
  const { user } = useAuth();
  const canManage = user && ['admin', 'docente'].includes(user.role);
  const [grades, setGrades] = useState([]);
  const [form, setForm] = useState({ enrollment_id: '', evaluation_name: '', score: '' });
  const [error, setError] = useState('');

  async function load() {
    const { data } = await apiClient.get('/grades');
    setGrades(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/grades', {
        enrollment_id: Number(form.enrollment_id),
        evaluation_name: form.evaluation_name,
        score: Number(form.score),
      });
      setForm({ enrollment_id: '', evaluation_name: '', score: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo registrar la nota');
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Notas</h2>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-2">Estudiante</th>
                <th className="px-4 py-2">Curso</th>
                <th className="px-4 py-2">Evaluación</th>
                <th className="px-4 py-2 text-right">Nota</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {grades.map((g) => (
                <tr key={g.id}>
                  <td className="px-4 py-2">{g.student_name}</td>
                  <td className="px-4 py-2">{g.course_name}</td>
                  <td className="px-4 py-2">{g.evaluation_name}</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    <span className={Number(g.score) >= 11 ? 'text-emerald-600' : 'text-red-600'}>
                      {Number(g.score).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
              {grades.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    Aún no hay notas registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {canManage && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Registrar nota</h3>
          <form onSubmit={handleCreate} className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 space-y-3">
            <div>
              <label htmlFor="enrollment_id" className="block text-xs font-medium text-slate-600 mb-1">
                ID de matrícula
              </label>
              <input
                id="enrollment_id"
                type="number"
                required
                value={form.enrollment_id}
                onChange={(e) => setForm({ ...form, enrollment_id: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="evaluation_name" className="block text-xs font-medium text-slate-600 mb-1">
                Evaluación
              </label>
              <input
                id="evaluation_name"
                required
                value={form.evaluation_name}
                onChange={(e) => setForm({ ...form, evaluation_name: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="score" className="block text-xs font-medium text-slate-600 mb-1">
                Nota (0 a 20)
              </label>
              <input
                id="score"
                type="number"
                min="0"
                max="20"
                step="0.1"
                required
                value={form.score}
                onChange={(e) => setForm({ ...form, score: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md py-2">
              Guardar nota
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
