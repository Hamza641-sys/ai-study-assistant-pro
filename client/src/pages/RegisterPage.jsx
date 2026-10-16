import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, UserPlus, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';

const PASSWORD_RULES = [
  { label: 'At least 6 characters',  test: (p) => p.length >= 6 },
  { label: 'Contains a number',       test: (p) => /\d/.test(p) },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate      = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = form;

    if (!name.trim() || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (!/\d/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await register(name.trim(), email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
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
        <h1 className="text-2xl font-bold text-white">Create your account</h1>
        <p className="text-gray-400 text-sm mt-1">Start studying smarter with AI — it's free</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1.5">
            Full name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            placeholder="Jane Smith"
            value={form.name}
            onChange={handleChange}
            className="input-field"
          />
        </div>

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
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPw ? 'text' : 'password'}
              autoComplete="new-password"
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

          {/* Password strength indicators */}
          {form.password.length > 0 && (
            <div className="mt-2 space-y-1">
              {PASSWORD_RULES.map(({ label, test }) => {
                const passed = test(form.password);
                return (
                  <div key={label} className={`flex items-center gap-1.5 text-xs ${passed ? 'text-green-400' : 'text-gray-500'}`}>
                    <Check size={11} className={passed ? 'opacity-100' : 'opacity-30'} />
                    {label}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-3"
        >
          {loading ? <Spinner size="sm" /> : <UserPlus size={18} />}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      {/* Terms note */}
      <p className="text-center text-xs text-gray-500 mt-4">
        By creating an account you agree to our terms of service and privacy policy.
      </p>

      <p className="text-center text-sm text-gray-400 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
