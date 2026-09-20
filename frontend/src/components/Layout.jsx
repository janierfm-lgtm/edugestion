import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/', label: 'Panel', roles: null },
  { to: '/courses', label: 'Cursos', roles: null },
  { to: '/enrollments', label: 'Matrículas', roles: ['admin', 'docente'] },
  { to: '/grades', label: 'Notas', roles: null },
  { to: '/attendance', label: 'Asistencia', roles: null },
  { to: '/users', label: 'Usuarios', roles: ['admin'] },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="font-semibold text-lg leading-tight">EduGestión</p>
            <p className="text-xs text-slate-300">Sistema de gestión académica</p>
          </div>
          <nav aria-label="Navegación principal" className="hidden md:flex gap-1">
            {navItems
              .filter((item) => !item.roles || (user && item.roles.includes(user.role)))
              .map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium ${
                      isActive ? 'bg-blue-600 text-white' : 'text-slate-200 hover:bg-slate-800'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ))}
          </nav>
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-slate-300 hidden sm:inline">
                {user.name} · <span className="uppercase text-xs">{user.role}</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md"
            >
              Salir
            </button>
          </div>
        </div>
        <nav aria-label="Navegación móvil" className="md:hidden flex overflow-x-auto gap-1 px-4 pb-2">
          {navItems
            .filter((item) => !item.roles || (user && item.roles.includes(user.role)))
            .map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap ${
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-200'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
        </nav>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">{children}</main>
      <footer className="text-center text-xs text-slate-400 py-4">
        EduGestión · Proyecto integrado del curso Herramientas y Servicios para Desarrolladores en la Web
      </footer>
    </div>
  );
}
