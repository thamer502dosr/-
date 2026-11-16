import { useState, type FormEvent } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import type { AcademicTrack } from '../types/lms';

interface RegistrationFormProps {
  tracks: AcademicTrack[];
  defaultTrackId?: string;
  onSuccess?: (payload: {
    token: string;
    fullName: string;
    trackId: string;
  }) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export function RegistrationForm({
  tracks,
  defaultTrackId = 'ai-engineering',
  onSuccess,
  onClose,
  isModal = false,
}: RegistrationFormProps) {
  const careerTracks = tracks.filter((t) => t.kind === 'career');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [trackId, setTrackId] = useState(defaultTrackId);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (fullName.trim().length < 3) {
      setErrorMessage('يرجى إدخال الاسم الكامل (ثلاثة أحرف على الأقل).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('يرجى إدخال بريد إلكتروني صحيح.');
      return;
    }
    if (phone.replace(/[\s\-()]/g, '').length < 8) {
      setErrorMessage('يرجى إدخال رقم جوال صالح للتواصل.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('يرجى إدخال كلمة مرور لا تقل عن 6 أحرف لتفعيل حسابك.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password,
          trackId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMessage(data.error || 'تعذر إنشاء الحساب، يرجى المحاولة مجدداً.');
        return;
      }

      setSubmittedName(data.user.fullName);
      onSuccess?.({
        token: data.token,
        fullName: data.user.fullName,
        trackId: data.user.activeTrackId,
      });
    } catch {
      setErrorMessage('تعذر الاتصال بالخادم، يرجى التأكد من استمرار الخدمة.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedName) {
    return (
      <div className="bg-[#0B1324] border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5" />
            <span>تم إنشاء حسابك وتفعيل المسار بنجاح</span>
          </div>
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-lg border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100 cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <h3 className="text-xl font-bold text-slate-100">أهلاً بك في معهد آفاق الخليج، {submittedName}</h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          تم تسجيل حسابك في قاعدة البيانات وتفعيل وصولك المباشر لمنصة التعلم ولوحة الطالب.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0B1324] border border-slate-800/80 rounded-2xl p-6 sm:p-8 space-y-5"
      noValidate
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-100">إنشاء حساب طالب جديد</h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            سجّل حسابك لحجز مقعدك والوصول المباشر لمنصة التعلم ولوحة الإنجاز.
          </p>
        </div>
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-lg border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100 shrink-0 cursor-pointer"
            aria-label="إغلاق نافذة التسجيل"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs sm:text-sm text-rose-200"
        >
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="reg-name" className="block text-xs font-medium text-slate-300 mb-1.5">
            الاسم الكامل
          </label>
          <input
            id="reg-name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="مثال: خالد عبدالله السبيعي"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-xs font-medium text-slate-300 mb-1.5">
            البريد الإلكتروني
          </label>
          <input
            id="reg-email"
            type="email"
            required
            dir="ltr"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@domain.com"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-right"
          />
        </div>

        <div>
          <label htmlFor="reg-phone" className="block text-xs font-medium text-slate-300 mb-1.5">
            رقم الجوال
          </label>
          <input
            id="reg-phone"
            type="tel"
            required
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+966 5X XXX XXXX"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-right"
          />
        </div>

        <div>
          <label htmlFor="reg-pass" className="block text-xs font-medium text-slate-300 mb-1.5">
            كلمة المرور
          </label>
          <input
            id="reg-pass"
            type="password"
            required
            dir="ltr"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="6 أحرف على الأقل"
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 text-right"
          />
        </div>
      </div>

      <div>
        <label htmlFor="reg-track" className="block text-xs font-medium text-slate-300 mb-1.5">
          المسار الأكاديمي المطلوب
        </label>
        <select
          id="reg-track"
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
        >
          {careerTracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.title}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full py-3 px-6 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white text-sm font-semibold transition-colors cursor-pointer"
      >
        {submitting ? 'جاري إنشاء الحساب...' : 'تسجيل الحساب والالتحاق بالمعهد'}
      </button>
    </form>
  );
}
