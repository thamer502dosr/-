import { useState, type FormEvent } from 'react';
import { Lock, LogIn, UserPlus } from 'lucide-react';
import type { AcademicTrack, UserProfile } from '../types/lms';

interface AuthViewProps {
  tracks: AcademicTrack[];
  initialMode?: 'login' | 'register';
  onAuthenticated: (token: string, user: UserProfile) => void;
}

export function AuthView({
  tracks,
  initialMode = 'login',
  onAuthenticated,
}: AuthViewProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [trackId, setTrackId] = useState(tracks[0]?.id || 'ai-engineering');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const careerTracks = tracks.filter((t) => t.kind === 'career');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'register' && fullName.trim().length < 3) {
      setError('يرجى إدخال الاسم الكامل.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }

    try {
      setLoading(true);
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body =
        mode === 'login'
          ? { email: email.trim(), password }
          : {
              fullName: fullName.trim(),
              email: email.trim(),
              phone: phone.trim(),
              password,
              trackId,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'تعذر إتمام العملية.');
        return;
      }

      onAuthenticated(data.token, data.user);
    } catch {
      setError('تعذر الاتصال بالخادم، يرجى المحاولة مجدداً.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (presetEmail: string, presetPassword: string) => {
    setMode('login');
    setEmail(presetEmail);
    setPassword(presetPassword);
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#060B16] py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left / Context Panel */}
        <div className="lg:col-span-5 bg-[#0B1324] border border-slate-800/80 rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
              <Lock className="w-4 h-4" />
              <span>بوابة الحسابات الموحدة</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100 leading-snug">
              منصة الطالب والإدارة — معهد آفاق الخليج
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              سجّل دخولك لمتابعة تقدمك المنفصل عبر مسارات الشبكات والأمن السيبراني والذكاء
              الاصطناعي، أو أنشئ حساب متدرب جديد للانضمام للدفعة القادمة.
            </p>
          </div>

          <div className="pt-5 border-t border-slate-800/80 space-y-3">
            <div className="text-xs font-medium text-slate-400">حسابات تجريبية جاهزة للاختبار الفوري:</div>
            <button
              type="button"
              onClick={() => handleQuickFill('faisal@afaq-student.sa', 'Student@2026')}
              className="w-full text-right p-3 rounded-xl bg-[#070E1B] border border-slate-800 hover:border-sky-500/60 transition-colors cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-100">تعبئة بيانات حساب الطالب</div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">faisal@afaq-student.sa</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@afaq-institute.sa', 'Admin@2026')}
              className="w-full text-right p-3 rounded-xl bg-[#070E1B] border border-slate-800 hover:border-sky-500/60 transition-colors cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-100">تعبئة بيانات حساب الإدارة (CMS)</div>
              <div className="text-[11px] font-mono text-slate-400 mt-1">admin@afaq-institute.sa</div>
            </button>
          </div>
        </div>

        {/* Right / Auth Form */}
        <div className="lg:col-span-7 bg-[#0B1324] border border-slate-800/80 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-1 p-1 bg-[#070E1B] border border-slate-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'login' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError(null);
              }}
              className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer ${
                mode === 'register' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>حساب طالب جديد</span>
            </button>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs sm:text-sm text-rose-200"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="auth-name" className="block text-xs font-medium text-slate-300 mb-1.5">
                    الاسم الكامل
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="مثال: سارة محمد الدوسري"
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="auth-phone" className="block text-xs font-medium text-slate-300 mb-1.5">
                      رقم الجوال
                    </label>
                    <input
                      id="auth-phone"
                      type="tel"
                      required
                      dir="ltr"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+966 5X XXX XXXX"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 text-right focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="auth-track" className="block text-xs font-medium text-slate-300 mb-1.5">
                      المسار المبدئي
                    </label>
                    <select
                      id="auth-track"
                      value={trackId}
                      onChange={(e) => setTrackId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      {careerTracks.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-medium text-slate-300 mb-1.5">
                البريد الإلكتروني
              </label>
              <input
                id="auth-email"
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@afaq-institute.sa"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 text-right focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-medium text-slate-300 mb-1.5">
                كلمة المرور
              </label>
              <input
                id="auth-password"
                type="password"
                required
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 text-right focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors cursor-pointer mt-2"
            >
              {loading
                ? 'جاري المعالجة...'
                : mode === 'login'
                ? 'دخول إلى المنصة'
                : 'إنشاء الحساب وتفعيل المسار'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
