import { Menu } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/tutor':     'AI Tutor',
  '/documents': 'Document Manager',
  '/summary':   'Notes Summarizer',
  '/quiz':      'Quiz Generator',
  '/profile':   'Profile & Settings',
};

export default function Header({ onMenuClick }) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const title = PAGE_TITLES[pathname] || 'AI Study Assistant';

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-400 hover:text-white p-1"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-400 hidden sm:block">
          Welcome, <span className="text-primary-400 font-medium">{user?.name?.split(' ')[0]}</span>
        </span>
        <div className="w-8 h-8 rounded-full bg-primary-700 flex items-center justify-center text-white font-bold text-sm">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
