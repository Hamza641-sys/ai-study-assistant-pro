import { Link } from 'react-router-dom';
import {
  FileText, BookOpen, Brain, MessageSquare,
  TrendingUp, Clock, ArrowRight, RefreshCw,
} from 'lucide-react';
import { useDashboard } from '../hooks/useDashboard.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorMessage from '../components/common/ErrorMessage.jsx';
import { formatRelativeTime, getScoreColor } from '../utils/formatters.js';

const StatCard = ({ icon: Icon, label, value, color, to }) => (
  <Link to={to} className="card hover:border-gray-700 transition-all group">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} />
      </div>
      <ArrowRight size={16} className="text-gray-600 group-hover:text-primary-400 transition-colors" />
    </div>
    <p className="text-2xl font-bold text-white">{value ?? '—'}</p>
    <p className="text-sm text-gray-400 mt-0.5">{label}</p>
  </Link>
);

const ActivityIcon = ({ type }) => {
  const map = {
    document: { icon: FileText,     cls: 'bg-blue-500/15 text-blue-400' },
    summary:  { icon: BookOpen,     cls: 'bg-emerald-500/15 text-emerald-400' },
    quiz:     { icon: Brain,        cls: 'bg-pink-500/15 text-pink-400' },
    chat:     { icon: MessageSquare,cls: 'bg-violet-500/15 text-violet-400' },
  };
  const { icon: Icon, cls } = map[type] || map.document;
  return (
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cls}`}>
      <Icon size={14} />
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { stats, loading, error, fetchStats } = useDashboard();

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <Spinner size="lg" />
    </div>
  );

  if (error) return (
    <div className="py-8">
      <ErrorMessage message={error} onRetry={fetchStats} />
    </div>
  );

  const s = stats?.stats || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 👋
          </h2>
          <p className="text-gray-400 text-sm mt-1">Here's your learning overview.</p>
        </div>
        <button onClick={fetchStats} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={15} /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText}     label="Documents"       value={s.totalDocuments}   color="bg-blue-500/15 text-blue-400"    to="/documents" />
        <StatCard icon={BookOpen}     label="Summaries"       value={s.totalSummaries}   color="bg-emerald-500/15 text-emerald-400" to="/summary" />
        <StatCard icon={Brain}        label="Quizzes Taken"   value={s.totalQuizzes}     color="bg-pink-500/15 text-pink-400"    to="/quiz" />
        <StatCard icon={TrendingUp}   label="Avg Quiz Score"  value={s.avgQuizScore != null ? `${s.avgQuizScore}%` : '—'} color="bg-amber-500/15 text-amber-400" to="/quiz" />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recent Activity */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <Clock size={16} className="text-primary-400" /> Recent Activity
            </h3>
          </div>
          {stats?.recentActivity?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((item, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                  <ActivityIcon type={item.type} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{item.subtitle}</p>
                  </div>
                  <span className="text-xs text-gray-500 shrink-0">{formatRelativeTime(item.date)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm py-6 text-center">
              No activity yet. Start by uploading a document or chatting with the AI Tutor!
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <div className="card">
            <h3 className="font-semibold text-white mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { to: '/tutor',     icon: MessageSquare, label: 'Ask AI Tutor',      color: 'text-violet-400' },
                { to: '/documents', icon: FileText,      label: 'Upload Document',   color: 'text-blue-400' },
                { to: '/summary',   icon: BookOpen,      label: 'Generate Summary',  color: 'text-emerald-400' },
                { to: '/quiz',      icon: Brain,         label: 'Generate Quiz',     color: 'text-pink-400' },
              ].map(({ to, icon: Icon, label, color }) => (
                <Link key={to} to={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800 transition-colors group">
                  <Icon size={16} className={color} />
                  <span className="text-sm text-gray-300 group-hover:text-white">{label}</span>
                  <ArrowRight size={14} className="ml-auto text-gray-600 group-hover:text-primary-400" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recent Quiz Scores */}
          {stats?.recentQuizzes?.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                <Brain size={15} className="text-pink-400" /> Recent Quizzes
              </h3>
              <div className="space-y-2">
                {stats.recentQuizzes.slice(0, 4).map((q) => (
                  <div key={q._id} className="flex items-center justify-between">
                    <p className="text-xs text-gray-400 truncate max-w-[140px]">{q.title}</p>
                    <span className={`text-sm font-semibold ${getScoreColor(q.scorePercentage)}`}>
                      {q.scorePercentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Conversations */}
      {stats?.recentConversations?.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white flex items-center gap-2">
              <MessageSquare size={16} className="text-violet-400" /> Recent Conversations
            </h3>
            <Link to="/tutor" className="text-xs text-primary-400 hover:text-primary-300">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.recentConversations.map((c) => (
              <Link key={c._id} to="/tutor"
                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors">
                <MessageSquare size={14} className="text-violet-400 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-gray-200 truncate">{c.title}</p>
                  <p className="text-xs text-gray-500">{c.messageCount} messages · {formatRelativeTime(c.updatedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
