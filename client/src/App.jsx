import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

// Layouts
import AppLayout from './layouts/AppLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';

// Pages
import LandingPage     from './pages/LandingPage.jsx';
import LoginPage       from './pages/LoginPage.jsx';
import RegisterPage    from './pages/RegisterPage.jsx';
import DashboardPage   from './pages/DashboardPage.jsx';
import TutorPage       from './pages/TutorPage.jsx';
import DocumentsPage   from './pages/DocumentsPage.jsx';
import SummaryPage     from './pages/SummaryPage.jsx';
import QuizPage        from './pages/QuizPage.jsx';
import ProfilePage     from './pages/ProfilePage.jsx';

// Route guards
const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <Routes>
      {/* Public landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Auth pages */}
      <Route element={<AuthLayout />}>
        <Route path="/login"    element={<PublicOnlyRoute><LoginPage /></PublicOnlyRoute>} />
        <Route path="/register" element={<PublicOnlyRoute><RegisterPage /></PublicOnlyRoute>} />
      </Route>

      {/* Protected app pages */}
      <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tutor"     element={<TutorPage />} />
        <Route path="/documents" element={<DocumentsPage />} />
        <Route path="/summary"   element={<SummaryPage />} />
        <Route path="/quiz"      element={<QuizPage />} />
        <Route path="/profile"   element={<ProfilePage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
