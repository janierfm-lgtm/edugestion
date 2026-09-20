import { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

const emptyForm = { name: '', email: '', password: '', role: 'docente' };

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function loadUsers() {
    const { data } = await apiClient.get('/users');
    setUsers(data);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function startEdit(u) {
    setEditingId(u.id);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setError('');
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editingId) {
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await apiClient.put(`/users/${editingId}`, payload);
      } else {
        await apiClient.post('/users', form);
      }
      cancelEdit();
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo guardar el usuario');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    setError('');
    try {
      await apiClient.delete(`/users/${id}`);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.error || 'No se pudo eliminar el usuario');
    }
  }

  const roleLabel = { admin: 'Administrador', docente: 'Docente', estudiante: 'Estudiante' };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Usuarios</h2>
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 text-left">
              <tr>
                <th className="px-4 py-2">Nombre</th>
                <th className="px-4 py-2">Correo</th>
                <th className="px-4 py-2">Rol</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-2 font-medium">{u.name}</td>
                  <td className="px-4 py-2 text-slate-500">{u.email}</td>
                  <td className="px-4 py-2">
                    <span className="uppercase text-xs bg-slate-100 rounded px-2 py-1">
                      {roleLabel[u.role] || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right space-x-3 whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => startEdit(u)}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Editar
                    </button>
                    {currentUser?.id !== u.id && (
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id)}
                        className="text-red-600 hover:underline text-xs"
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                    No hay usuarios registrados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          {editingId ? 'Editar usuario' : 'Nuevo usuario'}
        </h3>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200 p-5 space-y-3">
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
            <label htmlFor="email" className="block text-xs font-medium text-slate-600 mb-1">Correo</label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-xs font-medium text-slate-600 mb-1">
              Contraseña {editingId && <span className="text-slate-400">(dejar en blanco para no cambiarla)</span>}
            </label>
            <input
              id="password"
              type="password"
              required={!editingId}
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-xs font-medium text-slate-600 mb-1">Rol</label>
            <select
              id="role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="admin">Administrador</option>
              <option value="docente">Docente</option>
              <option value="estudiante">Estudiante</option>
            </select>
          </div>
          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium rounded-md py-2"
            >
              {editingId ? 'Guardar cambios' : 'Crear usuario'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-3 py-2 text-sm font-medium rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
