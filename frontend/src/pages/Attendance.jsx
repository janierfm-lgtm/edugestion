import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

const statusStyles = {
  presente: 'bg-emerald-100 text-emerald-700',
  tardanza: 'bg-amber-100 text-amber-700',
  falta: 'bg-red-100 text-red-700',
};

export default function Attendance() {
  const { user } = useAuth();
  const canManage = user && ['admin', 'docente'].includes(user.role);
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({ enrollment_id: '', attendance_date: '', status: 'presente' });
  const [error, setError] = useState('');

  async function load() {
    const { data } = await apiClient.get('/attendance');
    setRecords(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/attendance', {
        enrollment_id: Number(form.enrollment_id),
        attendance_date: form.attendance_date,
        status: form.status,
      });
      setForm({ enrollment_id: '', attendance_date: '', status: 'presente' });
      load();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo registrar la asistencia');
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Asistencia</h2>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-2">Estudiante</th>
                <th className="px-4 py-2">Curso</th>
                <th className="px-4 py-2">Fecha</th>
                <th className="px-4 py-2">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {records.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2">{r.student_name}</td>
                  <td className="px-4 py-2">{r.course_name}</td>
                  <td className="px-4 py-2 text-slate-500">
                    {new Date(r.attendance_date).toLocaleDateString('es-PE')}
                  </td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyles[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    No hay registros de asistencia todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {canManage && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Registrar asistencia</h3>
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
              <label htmlFor="attendance_date" className="block text-xs font-medium text-slate-600 mb-1">
                Fecha
              </label>
              <input
                id="attendance_date"
                type="date"
                required
                value={form.attendance_date}
                onChange={(e) => setForm({ ...form, attendance_date: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-xs font-medium text-slate-600 mb-1">
                Estado
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="presente">Presente</option>
                <option value="tardanza">Tardanza</option>
                <option value="falta">Falta</option>
              </select>
            </div>
            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md py-2">
              Guardar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
