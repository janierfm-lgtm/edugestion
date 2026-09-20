import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return (
      <div className="p-8 text-center text-slate-600" role="alert">
        No tienes permisos para ver esta sección.
      </div>
    );
  }

  return children;
}
