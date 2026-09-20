import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Courses() {
  const { user } = useAuth();
  const canManage = user && ['admin', 'docente'].includes(user.role);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ code: '', name: '', description: '' });
  const [error, setError] = useState('');

  async function loadCourses() {
    const { data } = await apiClient.get('/courses');
    setCourses(data);
  }

  useEffect(() => {
    loadCourses();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await apiClient.post('/courses', form);
      setForm({ code: '', name: '', description: '' });
      loadCourses();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo crear el curso');
    }
  }

  async function handleDelete(id) {
    await apiClient.delete(`/courses/${id}`);
    loadCourses();
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Cursos</h2>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-2">Código</th>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Docente</th>
                {user?.role === 'admin' && <th className="px-4 py-2" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((course) => (
                <tr key={course.id}>
                  <td className="px-4 py-2 font-medium">{course.code}</td>
                  <td className="px-4 py-2">{course.name}</td>
                  <td className="px-4 py-2 text-slate-500">{course.teacher_name || '—'}</td>
                  {user?.role === 'admin' && (
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(course.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Eliminar
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    No hay cursos registrados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {canManage && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Nuevo curso</h3>
          <form onSubmit={handleCreate} className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 space-y-3">
            <div>
              <label htmlFor="code" className="block text-xs font-medium text-slate-600 mb-1">Código</label>
              <input
                id="code"
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="name" className="block text-xs font-medium text-slate-600 mb-1">Nombre</label>
              <input
                id="name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md py-2">
              Crear curso
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
