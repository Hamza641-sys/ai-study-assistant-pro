import { Outlet, Link } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Top bar */}
      <nav className="px-6 py-4 border-b border-gray-800">
        <Link to="/" className="flex items-center gap-2 w-fit">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <GraduationCap size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white">AI Study Assistant</span>
        </Link>
      </nav>

      {/* Auth form area */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
