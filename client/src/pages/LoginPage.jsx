import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [form,    setForm]    = useState({ email: '', password: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await login(form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <GraduationCap size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Welcome back</h1>
        <p className="text-gray-400 text-sm mt-1">Sign in to your study dashboard</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1.5">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="input-field pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {loading ? <Spinner size="sm" /> : <LogIn size={18} />}
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      {/* Demo credentials hint */}
      <div className="mt-4 bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-3 text-xs text-gray-400 text-center">
        Demo: create a free account to explore all features
      </div>

      <p className="text-center text-sm text-gray-400 mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
          Create one free
        </Link>
      </p>
    </div>
  );
}
