import { useState } from 'react';
import { User, Lock, Save, Shield, BookOpen, Brain, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { authAPI } from '../services/api.js';
import Spinner from '../components/common/Spinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { formatDate } from '../utils/formatters.js';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', bio: user?.bio || '' });
  const [pwForm,      setPwForm]      = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw,      setSavingPw]      = useState(false);
  const [profileErr,    setProfileErr]    = useState('');
  const [pwErr,         setPwErr]         = useState('');
  const [showPw,        setShowPw]        = useState(false);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || profileForm.name.trim().length < 2) {
      setProfileErr('Name must be at least 2 characters.'); return;
    }
    try {
      setSavingProfile(true);
      setProfileErr('');
      const { data } = await authAPI.updateProfile({ name: profileForm.name.trim(), bio: profileForm.bio });
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      setProfileErr(err.response?.data?.message || 'Update failed.');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwErr('');
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      setPwErr('Please fill in all password fields.'); return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwErr('New password must be at least 6 characters.'); return;
    }
    if (!/\d/.test(pwForm.newPassword)) {
      setPwErr('New password must contain at least one number.'); return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwErr('Passwords do not match.'); return;
    }
    try {
      setSavingPw(true);
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      setPwErr(err.response?.data?.message || 'Password change failed.');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">

      {/* Avatar + info */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-primary-700 flex items-center justify-center text-white font-bold text-2xl shrink-0">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-bold text-white">{user?.name}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className="badge bg-primary-500/15 text-primary-300 capitalize">{user?.role}</span>
            <span className="text-xs text-gray-500">Member since {formatDate(user?.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: FileText, label: 'Documents', color: 'text-blue-400',    bg: 'bg-blue-500/10' },
          { icon: BookOpen, label: 'Summaries', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { icon: Brain,    label: 'Quizzes',   color: 'text-pink-400',    bg: 'bg-pink-500/10' },
        ].map(({ icon: Icon, label, color, bg }) => (
          <div key={label} className="card text-center py-4">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-sm text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Profile form */}
      <div className="card">
        <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
          <User size={16} className="text-primary-400" /> Edit Profile
        </h2>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
              className="input-field"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Bio <span className="text-gray-500">(optional)</span></label>
            <textarea
              rows={3}
              value={profileForm.bio}
              onChange={(e) => setProfileForm((p) => ({ ...p, bio: e.target.value }))}
              placeholder="A short bio about yourself..."
              className="input-field resize-none"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{profileForm.bio.length}/200</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input type="email" value={user?.email} disabled className="input-field opacity-50 cursor-not-allowed" />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
          </div>
          {profileErr && <ErrorMessage message={profileErr} />}
          <button type="submit" disabled={savingProfile} className="btn-primary flex items-center gap-2">
            {savingProfile ? <Spinner size="sm" /> : <Save size={16} />}
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="card">
        <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Lock size={16} className="text-amber-400" /> Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {[
            { name: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
            { name: 'newPassword',     label: 'New Password',     placeholder: '••••••••' },
            { name: 'confirmPassword', label: 'Confirm New Password', placeholder: '••••••••' },
          ].map(({ name, label, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm[name]}
                onChange={(e) => setPwForm((p) => ({ ...p, [name]: e.target.value }))}
                placeholder={placeholder}
                className="input-field"
                autoComplete={name === 'currentPassword' ? 'current-password' : 'new-password'}
              />
            </div>
          ))}
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)}
              className="accent-primary-500" />
            <span className="text-sm text-gray-400">Show passwords</span>
          </label>
          {pwErr && <ErrorMessage message={pwErr} />}
          <button type="submit" disabled={savingPw} className="btn-primary flex items-center gap-2">
            {savingPw ? <Spinner size="sm" /> : <Lock size={16} />}
            {savingPw ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      {/* Security info */}
      <div className="card border-gray-800">
        <h2 className="font-semibold text-white flex items-center gap-2 mb-3">
          <Shield size={16} className="text-green-400" /> Account Security
        </h2>
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 shrink-0" /> Password hashed with bcrypt (10 rounds)</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 shrink-0" /> JWT authentication with 7-day expiry</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 shrink-0" /> All data is scoped to your account only</div>
          <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-400 shrink-0" /> API rate limiting enabled</div>
        </div>
      </div>
    </div>
  );
}
