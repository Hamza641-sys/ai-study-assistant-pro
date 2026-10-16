import { Link } from 'react-router-dom';
import {
  GraduationCap, MessageSquare, FileText, BookOpen,
  Brain, Shield, Zap, ChevronRight, Star, Upload, ArrowRight,
} from 'lucide-react';

const FEATURES = [
  {
    icon: MessageSquare,
    title: 'AI Tutor',
    desc: 'Ask any question and get clear, step-by-step explanations with real examples.',
    color: 'bg-violet-500/10 text-violet-400',
  },
  {
    icon: Upload,
    title: 'PDF Upload & RAG',
    desc: 'Upload your study materials and ask questions grounded in your actual documents.',
    color: 'bg-blue-500/10 text-blue-400',
  },
  {
    icon: BookOpen,
    title: 'Smart Summarizer',
    desc: 'Generate summaries, key points, definitions and revision notes from any document.',
    color: 'bg-emerald-500/10 text-emerald-400',
  },
  {
    icon: Brain,
    title: 'Quiz Generator',
    desc: 'Create MCQ quizzes from any topic or document. Score instantly with explanations.',
    color: 'bg-pink-500/10 text-pink-400',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    desc: 'Your documents stay private. JWT auth and strict ownership controls on every resource.',
    color: 'bg-amber-500/10 text-amber-400',
  },
  {
    icon: Zap,
    title: 'Progress Tracking',
    desc: 'Dashboard with quiz scores, summaries created and recent study activity.',
    color: 'bg-cyan-500/10 text-cyan-400',
  },
];

const STEPS = [
  { n: '01', title: 'Create Account',     desc: 'Register in seconds — no credit card required.' },
  { n: '02', title: 'Upload Your PDFs',   desc: 'Upload lecture notes, textbooks or any study material.' },
  { n: '03', title: 'Study with AI',      desc: 'Ask questions, get summaries and generate quizzes.' },
  { n: '04', title: 'Track Progress',     desc: 'See quiz scores and learning history on your dashboard.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="border-b border-gray-800/60 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="font-bold text-lg">AI Study Assistant <span className="text-primary-400">Pro</span></span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"
            className="text-sm text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-800">
            Sign in
          </Link>
          <Link to="/register" className="btn-primary text-sm">
            Get started free
          </Link>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-950/60 border border-primary-800 text-primary-300 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
          <Star size={12} />
          Full-Stack GenAI Capstone Project
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          Your AI study companion<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-violet-400">
            for every exam
          </span>
        </h1>

        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10">
          Upload PDFs, ask questions, generate quizzes and summarize notes —
          all powered by GPT and RAG. Study smarter, not harder.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
            Start learning free <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-3">
            Sign in to dashboard
          </Link>
        </div>

        {/* Hero visual / mock chat */}
        <div className="mt-16 max-w-2xl mx-auto bg-gray-900 border border-gray-700 rounded-2xl p-6 text-left shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="ml-2 text-xs text-gray-500">ai-study-assistant / tutor</span>
          </div>
          <div className="space-y-3">
            <div className="flex justify-end">
              <div className="bg-primary-600 text-white text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-xs">
                Explain Newton's Third Law with a real-life example.
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center shrink-0">
                <GraduationCap size={14} className="text-white" />
              </div>
              <div className="bg-gray-800 text-gray-200 text-sm px-4 py-2.5 rounded-2xl rounded-tl-sm max-w-sm">
                <strong>Newton's Third Law:</strong> For every action there is an equal and opposite reaction.
                <br /><br />
                <em>Example:</em> When you jump off a boat, you push backward — the boat pushes you forward. That's why the boat drifts away! 🚤
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 border-t border-gray-800 pt-4">
            <div className="flex-1 bg-gray-800 rounded-xl px-4 py-2 text-sm text-gray-500">Ask anything — Physics, Math, Biology...</div>
            <button className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center">
              <ChevronRight size={16} className="text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────────── */}
      <section className="bg-gray-900/50 border-y border-gray-800 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-3">Everything you need to study smarter</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Six AI-powered modules in one platform.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card hover:border-gray-700 transition-colors">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon size={20} />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">How it works</h2>
          <p className="text-gray-400">Up and running in four simple steps.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary-600/20 border border-primary-700 flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-400 font-bold text-sm">{n}</span>
              </div>
              <h3 className="font-semibold text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-r from-primary-900/60 to-violet-900/40 border border-primary-800 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to study smarter?</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Join thousands of students using AI to learn faster and score better.
          </p>
          <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3">
            Create free account <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-800 px-6 py-6 text-center text-sm text-gray-500">
        <p>AI Study Assistant Pro — Full-Stack GenAI Capstone Project · Built with React, Node.js, MongoDB & OpenAI</p>
      </footer>
    </div>
  );
}
