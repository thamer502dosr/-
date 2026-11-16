import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Award,
  BookOpen,
  CalendarClock,
  ImagePlus,
  LayoutGrid,
  Pencil,
  Phone,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';
import type {
  AcademicTrack,
  AccreditationCert,
  CoursePoster,
  InstituteContact,
  LectureSchedule,
  OrderRecord,
  PricingPlan,
  UserProfile,
} from '../types/lms';
import { ResilientImage } from './ResilientImage';

interface AdminDashboardProps {
  user: UserProfile | null;
  tracks: AcademicTrack[];
  coursePosters: CoursePoster[];
  schedules: LectureSchedule[];
  accreditations: AccreditationCert[];
  pricingPlans: PricingPlan[];
  contact: InstituteContact;
  onRefreshBootstrap: () => Promise<void>;
  onRequireAdminLogin: () => void;
}

type AdminTab = 'posters' | 'tracks' | 'schedules' | 'students' | 'contact' | 'accreditations';

export function AdminDashboard({
  user,
  tracks,
  coursePosters,
  schedules,
  accreditations,
  pricingPlans,
  contact,
  onRefreshBootstrap,
  onRequireAdminLogin,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('posters');
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Course Poster form state
  const [editingPosterId, setEditingPosterId] = useState<string | null>(null);
  const [posterTitle, setPosterTitle] = useState('');
  const [posterVendorName, setPosterVendorName] = useState('Cisco Systems');
  const [posterVendorCode, setPosterVendorCode] = useState('CISCO');
  const [posterVendorLogoUrl, setPosterVendorLogoUrl] = useState('');
  const [posterTrackId, setPosterTrackId] = useState(tracks[0]?.id || 'network-infra');
  const [posterCategory, setPosterCategory] = useState('مسار الشبكات والبنية التحتية');
  const [posterDuration, setPosterDuration] = useState('60 ساعة · 8 أسابيع');
  const [posterTimes, setPosterTimes] = useState('الأحد والثلاثاء · 07:00 م - 09:30 م');
  const [posterExamCode, setPosterExamCode] = useState('');
  const [posterCertType, setPosterCertType] = useState('شهادة دولية معتمدة + شهادة المعهد');
  const [posterPrice, setPosterPrice] = useState('1450');
  const [posterSummary, setPosterSummary] = useState('');

  // Track form state
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [trackSubtitle, setTrackSubtitle] = useState('');
  const [trackKind, setTrackKind] = useState<'career' | 'skill'>('career');
  const [trackPrice, setTrackPrice] = useState('1450');
  const [trackHours, setTrackHours] = useState('40');
  const [trackIconLabel, setTrackIconLabel] = useState('TECH');
  const [trackSummary, setTrackSummary] = useState('');
  const [trackTools, setTrackTools] = useState('Python, FastAPI');
  const [trackCerts, setTrackCerts] = useState('شهادة إتمام معتمدة');
  const [trackImage, setTrackImage] = useState('/src/assets/images/track_ai_engineering_1794777830795.jpg');

  // Schedule form state
  const [schedTrackId, setSchedTrackId] = useState(tracks[0]?.id || 'ai-engineering');
  const [schedTitle, setSchedTitle] = useState('');
  const [schedDays, setSchedDays] = useState('الأحد والثلاثاء');
  const [schedTime, setSchedTime] = useState('07:00 م - 09:00 م');
  const [schedInstructor, setSchedInstructor] = useState('');
  const [schedMode, setSchedMode] = useState<'حضوري' | 'عن بُعد' | 'مدمج'>('مدمج');

  // Contact form state
  const [contactForm, setContactForm] = useState<InstituteContact>(contact);

  // Accreditation form state
  const [accTitle, setAccTitle] = useState('');
  const [accIssuer, setAccIssuer] = useState('');
  const [accLicense, setAccLicense] = useState('');
  const [accYear, setAccYear] = useState('2026');
  const [accImage, setAccImage] = useState('/src/assets/images/hero_institute_campus_1794777831597.jpg');

  useEffect(() => {
    setContactForm(contact);
  }, [contact]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    const token = localStorage.getItem('afaq_auth_token');
    fetch('/api/admin/overview', {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.students) setStudents(data.students);
        if (data?.orders) setOrders(data.orders);
      })
      .catch(() => {});
  }, [user]);

  const notify = (msg: string) => {
    setErrorMessage(null);
    setStatusMessage(msg);
    window.setTimeout(() => setStatusMessage(null), 3200);
  };

  const authHeaders = () => {
    const token = localStorage.getItem('afaq_auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const handleImageFileUpload = async (
    e: ChangeEvent<HTMLInputElement>,
    onUploaded: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify({ fileName: file.name, dataUrl: reader.result }),
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error || 'تعذر رفع الصورة');
          return;
        }
        onUploaded(data.url);
        notify('تم رفع الشعار / الصورة عالية الجودة بنجاح.');
      } catch {
        setErrorMessage('تعذر رفع الصورة على الخادم.');
      }
    };
    reader.readAsDataURL(file);
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#060B16] flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-[#091224] border border-slate-800/80 rounded-2xl p-8 text-center space-y-5">
          <h1 className="text-2xl font-bold text-slate-100">لوحة إدارة المحتوى والنظام (CMS)</h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            هذه اللوحة مخصصة لإدارة المعهد لإضافة بوسترات الدورات، تعديل الأسعار والأوقات، وإدارة
            بيانات الطلاب وأرقام التواصل وروابط السوشيال ميديا.
          </p>
          <button
            type="button"
            onClick={onRequireAdminLogin}
            className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold transition-colors cursor-pointer"
          >
            تسجيل الدخول بحساب الإدارة
          </button>
        </div>
      </div>
    );
  }

  const handlePosterSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = await fetch('/api/admin/posters', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        id: editingPosterId || undefined,
        title: posterTitle,
        vendorName: posterVendorName,
        vendorCode: posterVendorCode,
        vendorLogoUrl: posterVendorLogoUrl,
        trackId: posterTrackId,
        trackCategory: posterCategory,
        studyDuration: posterDuration,
        lectureTimes: posterTimes,
        examCode: posterExamCode,
        certificateType: posterCertType,
        priceSar: Number(posterPrice),
        summary: posterSummary,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorMessage(data.error || 'تعذر حفظ بوستر الدورة');
      return;
    }
    setEditingPosterId(null);
    setPosterTitle('');
    setPosterExamCode('');
    setPosterSummary('');
    setPosterVendorLogoUrl('');
    await onRefreshBootstrap();
    notify('تم حفظ بوستر الدورة وعرضه مباشرة في الموقع.');
  };

  const handleEditPoster = (p: CoursePoster) => {
    setEditingPosterId(p.id);
    setPosterTitle(p.title);
    setPosterVendorName(p.vendorName);
    setPosterVendorCode(p.vendorCode);
    setPosterVendorLogoUrl(p.vendorLogoUrl);
    setPosterTrackId(p.trackId);
    setPosterCategory(p.trackCategory);
    setPosterDuration(p.studyDuration);
    setPosterTimes(p.lectureTimes);
    setPosterExamCode(p.examCode);
    setPosterCertType(p.certificateType);
    setPosterPrice(String(p.priceSar));
    setPosterSummary(p.summary);
  };

  const handleDeletePoster = async (id: string) => {
    const res = await fetch(`/api/admin/posters/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      await onRefreshBootstrap();
      notify('تم حذف بوستر الدورة.');
    }
  };

  const handleTrackSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = await fetch('/api/admin/tracks', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        id: editingTrackId || undefined,
        title: trackTitle,
        englishSubtitle: trackSubtitle,
        kind: trackKind,
        priceSar: Number(trackPrice),
        totalHours: Number(trackHours),
        iconLabel: trackIconLabel,
        summary: trackSummary,
        tools: trackTools.split(',').map((s) => s.trim()).filter(Boolean),
        certifications: trackCerts.split(',').map((s) => s.trim()).filter(Boolean),
        image: trackImage,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorMessage(data.error || 'تعذر حفظ المسار');
      return;
    }
    setEditingTrackId(null);
    setTrackTitle('');
    setTrackSubtitle('');
    setTrackSummary('');
    await onRefreshBootstrap();
    notify('تم حفظ المسار التدريبي في قاعدة البيانات.');
  };

  const handleEditTrack = (track: AcademicTrack) => {
    setEditingTrackId(track.id);
    setTrackTitle(track.title);
    setTrackSubtitle(track.englishSubtitle);
    setTrackKind(track.kind);
    setTrackPrice(String(track.priceSar));
    setTrackHours(String(track.totalHours));
    setTrackIconLabel(track.iconLabel || 'TECH');
    setTrackSummary(track.summary);
    setTrackTools(track.tools.join(', '));
    setTrackCerts((track.certifications || []).join(', '));
    setTrackImage(track.image);
  };

  const handleDeleteTrack = async (trackId: string) => {
    const res = await fetch(`/api/admin/tracks/${trackId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      await onRefreshBootstrap();
      notify('تم حذف المسار من النظام.');
    }
  };

  const handleAddSchedule = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    const res = await fetch('/api/admin/schedules', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        trackId: schedTrackId,
        title: schedTitle,
        dayOfWeek: schedDays,
        timeRange: schedTime,
        instructor: schedInstructor,
        mode: schedMode,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorMessage(data.error || 'تعذر إضافة موعد المحاضرة');
      return;
    }
    setSchedTitle('');
    setSchedInstructor('');
    await onRefreshBootstrap();
    notify('تمت إضافة موعد المحاضرة إلى الجدول المباشر.');
  };

  const handleDeleteSchedule = async (id: string) => {
    const res = await fetch(`/api/admin/schedules/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      await onRefreshBootstrap();
      notify('تم حذف موعد المحاضرة.');
    }
  };

  const handleUpdateStudentTrack = async (studentId: string, activeTrackId: string) => {
    const res = await fetch(`/api/admin/students/${studentId}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify({ activeTrackId }),
    });
    const data = await res.json();
    if (res.ok && data.students) {
      setStudents(data.students);
      notify('تم تحديث المسار النشط للمتدرب.');
    }
  };

  const handleSaveContact = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/contact', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(contactForm),
    });
    if (res.ok) {
      await onRefreshBootstrap();
      notify('تم تحديث أرقام التواصل وروابط السوشيال ميديا وصور المعهد.');
    }
  };

  const handleUpdatePlanPrice = async (planId: string, priceSar: number) => {
    const res = await fetch(`/api/admin/pricing/${planId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ priceSar }),
    });
    if (res.ok) {
      await onRefreshBootstrap();
      notify('تم تحديث سعر الباقة.');
    }
  };

  const handleAddAccreditation = async (e: FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/admin/accreditations', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({
        title: accTitle,
        issuer: accIssuer,
        licenseNumber: accLicense,
        issueYear: accYear,
        imageUrl: accImage,
      }),
    });
    if (res.ok) {
      setAccTitle('');
      setAccIssuer('');
      setAccLicense('');
      await onRefreshBootstrap();
      notify('تمت إضافة شهادة الاعتماد إلى الموقع.');
    }
  };

  const handleDeleteAccreditation = async (id: string) => {
    const res = await fetch(`/api/admin/accreditations/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.ok) {
      await onRefreshBootstrap();
      notify('تم حذف شهادة الاعتماد.');
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#060B16] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top Admin Header */}
        <div className="bg-[#091224] border border-slate-800/80 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-amber-300 font-medium mb-1">
              لوحة تحكم الإدارة ونظام إدارة المحتوى (Dynamic CMS)
            </div>
            <h1 className="text-2xl font-bold text-slate-100">إدارة المعهد وبوسترات الدورات</h1>
          </div>
          <div className="text-xs font-mono tabular-nums text-slate-400">
            {coursePosters.length} بوستر دورة · {tracks.length} مسارات · {students.length} حسابات
          </div>
        </div>

        {statusMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs sm:text-sm text-emerald-200">
            {statusMessage}
          </div>
        )}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-xs sm:text-sm text-rose-200">
            {errorMessage}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-3 bg-[#091224] border border-slate-800/80 rounded-2xl p-3 space-y-1">
            {[
              { id: 'posters' as AdminTab, label: 'بوسترات الدورات والاختبارات', icon: LayoutGrid },
              { id: 'tracks' as AdminTab, label: 'إدارة المسارات الأكاديمية', icon: BookOpen },
              { id: 'schedules' as AdminTab, label: 'أوقات المحاضرات', icon: CalendarClock },
              { id: 'students' as AdminTab, label: 'الطلاب والمدفوعات', icon: Users },
              { id: 'contact' as AdminTab, label: 'التواصل والسوشيال والأسعار', icon: Phone },
              { id: 'accreditations' as AdminTab, label: 'شهادات الاعتماد', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    active
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:bg-[#0F1B33] hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </aside>

          {/* Main Admin Panel */}
          <div className="lg:col-span-9 space-y-6">
            {activeTab === 'posters' && (
              <div className="space-y-6">
                <form
                  onSubmit={handlePosterSubmit}
                  className="bg-[#091224] border border-slate-800/80 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-100">
                      {editingPosterId ? 'تعديل بوستر الدورة' : 'إضافة بوستر دورة احترافي جديد'}
                    </h2>
                    {editingPosterId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPosterId(null);
                          setPosterTitle('');
                          setPosterExamCode('');
                        }}
                        className="text-xs text-slate-400 hover:text-white cursor-pointer"
                      >
                        إلغاء التعديل
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">اسم الدورة</label>
                      <input
                        type="text"
                        required
                        value={posterTitle}
                        onChange={(e) => setPosterTitle(e.target.value)}
                        placeholder="مثال: شهادة مهندس الشبكات CCNA"
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">كود الاختبار الدولي</label>
                      <input
                        type="text"
                        required
                        dir="ltr"
                        value={posterExamCode}
                        onChange={(e) => setPosterExamCode(e.target.value)}
                        placeholder="200-301 CCNA"
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 font-mono text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">الشركة المانحة / الجهة</label>
                      <input
                        type="text"
                        required
                        value={posterVendorName}
                        onChange={(e) => setPosterVendorName(e.target.value)}
                        placeholder="Cisco Systems / Symantec / Huawei"
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">تصنيف الشعار الجاهز أو رفع شعار مخصص</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={posterVendorCode}
                          onChange={(e) => setPosterVendorCode(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                        >
                          <option value="CISCO">شعار Cisco</option>
                          <option value="SYMANTEC">شعار Symantec</option>
                          <option value="HUAWEI">شعار Huawei</option>
                          <option value="BIGDATA">شعار Big Data / Oracle</option>
                          <option value="PYTHON">شعار Python / AI</option>
                          <option value="COMPTIA">شعار CompTIA / Juniper</option>
                        </select>
                        <label className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-100 cursor-pointer shrink-0">
                          <ImagePlus className="w-4 h-4" />
                          <span>رفع شعار</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageFileUpload(e, (url) => setPosterVendorLogoUrl(url))
                            }
                          />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">مدة الدراسة</label>
                      <input
                        type="text"
                        required
                        value={posterDuration}
                        onChange={(e) => setPosterDuration(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">أوقات المحاضرات</label>
                      <input
                        type="text"
                        required
                        value={posterTimes}
                        onChange={(e) => setPosterTimes(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">نوع الشهادة</label>
                      <input
                        type="text"
                        required
                        value={posterCertType}
                        onChange={(e) => setPosterCertType(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">السعر (ر.س)</label>
                        <input
                          type="number"
                          value={posterPrice}
                          onChange={(e) => setPosterPrice(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm font-mono text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">المسار المرتبط</label>
                        <select
                          value={posterTrackId}
                          onChange={(e) => setPosterTrackId(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-xs text-slate-100"
                        >
                          {tracks
                            .filter((t) => t.kind === 'career')
                            .map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.title}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">وصف موجز للدورة</label>
                    <input
                      type="text"
                      value={posterSummary}
                      onChange={(e) => setPosterSummary(e.target.value)}
                      placeholder="ملخص مختصر يظهر داخل البوستر"
                      className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{editingPosterId ? 'حفظ تعديلات البوستر' : 'نشر بوستر الدورة'}</span>
                  </button>
                </form>

                {/* Existing Posters List */}
                <div className="bg-[#091224] border border-slate-800/80 rounded-2xl divide-y divide-slate-800/70">
                  {coursePosters.map((p) => (
                    <div
                      key={p.id}
                      className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-sm font-bold text-slate-100">{p.title}</div>
                        <div className="text-xs text-slate-400 font-mono mt-1">
                          {p.vendorName} · {p.examCode} · {p.studyDuration} · {p.priceSar} ر.س
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditPoster(p)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200 hover:bg-slate-800 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePoster(p.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/40 text-xs text-rose-300 hover:bg-rose-500/15 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'tracks' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleTrackSubmit}
                  className="bg-[#091224] border border-slate-800/80 rounded-2xl p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-100">
                      {editingTrackId ? 'تعديل المسار الأكاديمي' : 'إضافة مسار تدريبي جديد'}
                    </h2>
                    {editingTrackId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTrackId(null);
                          setTrackTitle('');
                          setTrackSummary('');
                        }}
                        className="text-xs text-slate-400 hover:text-white cursor-pointer"
                      >
                        إلغاء التعديل
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">اسم المسار</label>
                      <input
                        type="text"
                        required
                        value={trackTitle}
                        onChange={(e) => setTrackTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">العنوان الإنجليزي المختصر</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={trackSubtitle}
                        onChange={(e) => setTrackSubtitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">التصنيف</label>
                      <select
                        value={trackKind}
                        onChange={(e) => setTrackKind(e.target.value as 'career' | 'skill')}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      >
                        <option value="career">مسار مهني متكامل (Career Track)</option>
                        <option value="skill">دورة مهارية مركزة (Skill Track)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">السعر (ر.س)</label>
                        <input
                          type="number"
                          value={trackPrice}
                          onChange={(e) => setTrackPrice(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">الساعات</label>
                        <input
                          type="number"
                          value={trackHours}
                          onChange={(e) => setTrackHours(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">الرمز</label>
                        <input
                          type="text"
                          dir="ltr"
                          value={trackIconLabel}
                          onChange={(e) => setTrackIconLabel(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">الوصف الأكاديمي</label>
                    <textarea
                      rows={2}
                      required
                      value={trackSummary}
                      onChange={(e) => setTrackSummary(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">الأدوات والتقنيات (مفصولة بفاصلة)</label>
                      <input
                        type="text"
                        value={trackTools}
                        onChange={(e) => setTrackTools(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">صورة الغلاف (رفع أو رابط)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          dir="ltr"
                          value={trackImage}
                          onChange={(e) => setTrackImage(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                        <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-100 cursor-pointer shrink-0">
                          <ImagePlus className="w-4 h-4" />
                          <span>رفع صورة</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageFileUpload(e, (url) => setTrackImage(url))}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{editingTrackId ? 'حفظ التعديلات' : 'إضافة المسار للموقع'}</span>
                  </button>
                </form>

                <div className="bg-[#091224] border border-slate-800/80 rounded-2xl overflow-hidden divide-y divide-slate-800/70">
                  {tracks.map((t) => (
                    <div
                      key={t.id}
                      className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-4">
                        <ResilientImage
                          src={t.image}
                          alt={t.title}
                          className="w-16 h-12 rounded-lg object-cover border border-slate-800 shrink-0"
                        />
                        <div>
                          <div className="text-sm font-semibold text-slate-100">{t.title}</div>
                          <div className="text-xs text-slate-400 font-mono tabular-nums mt-0.5">
                            {t.kind === 'career' ? 'مسار مهني' : 'دورة مهارية'} · {t.totalHours} ساعة ·{' '}
                            {t.priceSar} ر.س
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditTrack(t)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-200 hover:bg-slate-800 cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          <span>تعديل</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTrack(t.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-500/40 text-xs text-rose-300 hover:bg-rose-500/15 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>حذف</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'schedules' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleAddSchedule}
                  className="bg-[#091224] border border-slate-800/80 rounded-2xl p-6 space-y-4"
                >
                  <h2 className="text-lg font-bold text-slate-100">إضافة أو تعديل موعد محاضرة</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">المسار المرتبط</label>
                      <select
                        value={schedTrackId}
                        onChange={(e) => setSchedTrackId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      >
                        {tracks.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">عنوان المحاضرة / الورشة</label>
                      <input
                        type="text"
                        required
                        value={schedTitle}
                        onChange={(e) => setSchedTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">الأيام</label>
                      <input
                        type="text"
                        required
                        value={schedDays}
                        onChange={(e) => setSchedDays(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">التوقيت</label>
                      <input
                        type="text"
                        required
                        value={schedTime}
                        onChange={(e) => setSchedTime(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">المدرب</label>
                      <input
                        type="text"
                        value={schedInstructor}
                        onChange={(e) => setSchedInstructor(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">نمط الحضور</label>
                      <select
                        value={schedMode}
                        onChange={(e) => setSchedMode(e.target.value as 'حضوري' | 'عن بُعد' | 'مدمج')}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      >
                        <option value="مدمج">مدمج</option>
                        <option value="حضوري">حضوري</option>
                        <option value="عن بُعد">عن بُعد</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    حفظ الموعد في الجدول
                  </button>
                </form>

                <div className="bg-[#091224] border border-slate-800/80 rounded-2xl divide-y divide-slate-800/70">
                  {schedules.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-100">{s.title}</div>
                        <div className="text-xs text-slate-400 mt-1">
                          {s.trackTitle} · {s.dayOfWeek} · {s.timeRange} · {s.instructor} · {s.mode}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteSchedule(s.id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-xs text-rose-300 hover:bg-rose-500/15 self-start sm:self-auto cursor-pointer"
                      >
                        حذف الموعد
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'students' && (
              <div className="space-y-6">
                <div className="bg-[#091224] border border-slate-800/80 rounded-2xl p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-lg font-bold text-slate-100">سجل المتدربين ({students.length})</h2>
                    <input
                      type="search"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder="ابحث بالاسم أو البريد..."
                      className="px-3.5 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-xs text-slate-100 w-full sm:w-64"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-xs sm:text-sm">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-3 px-3 font-medium">المتدرب</th>
                          <th className="py-3 px-3 font-medium">الجوال</th>
                          <th className="py-3 px-3 font-medium">الدروس المنجزة</th>
                          <th className="py-3 px-3 font-medium">المسار النشط</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/70">
                        {filteredStudents.map((st) => (
                          <tr key={st.id}>
                            <td className="py-3 px-3">
                              <div className="font-semibold text-slate-100">{st.fullName}</div>
                              <div className="text-xs font-mono text-slate-400">{st.email}</div>
                            </td>
                            <td className="py-3 px-3 font-mono text-xs text-slate-300">{st.phone}</td>
                            <td className="py-3 px-3 font-mono tabular-nums text-slate-200">
                              {st.completedLessonIds.length} درس
                            </td>
                            <td className="py-3 px-3">
                              <select
                                value={st.activeTrackId}
                                onChange={(e) => handleUpdateStudentTrack(st.id, e.target.value)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#070E1B] border border-slate-800 text-xs text-slate-100"
                              >
                                {tracks
                                  .filter((t) => t.kind === 'career')
                                  .map((t) => (
                                    <option key={t.id} value={t.id}>
                                      {t.title}
                                    </option>
                                  ))}
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-[#091224] border border-slate-800/80 rounded-2xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-100">سجل المدفوعات والاشتراكات ({orders.length})</h3>
                  <div className="divide-y divide-slate-800/70 text-xs sm:text-sm">
                    {orders.map((ord) => (
                      <div key={ord.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <span className="font-mono text-amber-300 ml-2">{ord.id}</span>
                          <span className="font-semibold text-slate-100">{ord.userName}</span>
                          <span className="text-slate-400 mx-2">·</span>
                          <span className="text-slate-300">{ord.itemTitle}</span>
                        </div>
                        <div className="font-mono tabular-nums text-emerald-400">
                          {ord.amountSar.toLocaleString('en-US')} ر.س ({ord.paymentMethod})
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleSaveContact}
                  className="bg-[#091224] border border-slate-800/80 rounded-2xl p-6 space-y-4"
                >
                  <h2 className="text-lg font-bold text-slate-100">
                    أرقام التواصل، روابط السوشيال ميديا في الفوتر، وصور المعهد
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">اسم المعهد</label>
                      <input
                        type="text"
                        value={contactForm.instituteName}
                        onChange={(e) => setContactForm({ ...contactForm, instituteName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">رقم الهاتف الرسمي</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">واتساب الاستشارات</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={contactForm.whatsapp}
                        onChange={(e) => setContactForm({ ...contactForm, whatsapp: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">البريد الإلكتروني الرسمي</label>
                      <input
                        type="email"
                        dir="ltr"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 text-right"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">العنوان</label>
                      <input
                        type="text"
                        value={contactForm.address}
                        onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">ساعات العمل</label>
                      <input
                        type="text"
                        value={contactForm.workingHours}
                        onChange={(e) => setContactForm({ ...contactForm, workingHours: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Social Media Links in Footer */}
                  <div className="pt-4 border-t border-slate-800/80 space-y-3">
                    <div className="text-xs font-semibold text-amber-300">
                      روابط التواصل الاجتماعي المعروضة في الفوتر
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">منصة X (تويتر)</label>
                        <input
                          type="url"
                          dir="ltr"
                          value={contactForm.xHandle}
                          onChange={(e) => setContactForm({ ...contactForm, xHandle: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">LinkedIn</label>
                        <input
                          type="url"
                          dir="ltr"
                          value={contactForm.linkedinUrl}
                          onChange={(e) => setContactForm({ ...contactForm, linkedinUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">YouTube</label>
                        <input
                          type="url"
                          dir="ltr"
                          value={contactForm.youtubeUrl}
                          onChange={(e) => setContactForm({ ...contactForm, youtubeUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-300 mb-1">Telegram / Instagram</label>
                        <input
                          type="url"
                          dir="ltr"
                          value={contactForm.telegramUrl}
                          onChange={(e) => setContactForm({ ...contactForm, telegramUrl: e.target.value })}
                          className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Hero & Awareness images */}
                  <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">الصورة الرئيسية للمعهد (Hero Image)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          dir="ltr"
                          value={contactForm.heroImageUrl}
                          onChange={(e) => setContactForm({ ...contactForm, heroImageUrl: e.target.value })}
                          className="flex-1 px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                        <label className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-100 cursor-pointer shrink-0">
                          رفع
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageFileUpload(e, (url) =>
                                setContactForm((prev) => ({ ...prev, heroImageUrl: url }))
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">صورة قسم التوعية الأمنية</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          dir="ltr"
                          value={contactForm.awarenessImageUrl}
                          onChange={(e) =>
                            setContactForm({ ...contactForm, awarenessImageUrl: e.target.value })
                          }
                          className="flex-1 px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                        <label className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-100 cursor-pointer shrink-0">
                          رفع
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleImageFileUpload(e, (url) =>
                                setContactForm((prev) => ({ ...prev, awarenessImageUrl: url }))
                              )
                            }
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    حفظ بيانات التواصل والسوشيال ميديا
                  </button>
                </form>

                {/* Quick Pricing Editor */}
                <div className="bg-[#091224] border border-slate-800/80 rounded-2xl p-6 space-y-4">
                  <h3 className="text-base font-bold text-slate-100">تعديل أسعار باقات الاشتراك</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {pricingPlans.map((plan) => (
                      <div key={plan.id} className="p-4 rounded-xl bg-[#070E1B] border border-slate-800 space-y-3">
                        <div className="text-sm font-semibold text-slate-100">{plan.name}</div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={plan.priceSar}
                            id={`price-${plan.id}`}
                            className="w-full px-3 py-1.5 rounded-lg bg-[#0B1324] border border-slate-700 text-sm font-mono text-slate-100"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.getElementById(
                                `price-${plan.id}`
                              ) as HTMLInputElement | null;
                              if (input) handleUpdatePlanPrice(plan.id, Number(input.value));
                            }}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold text-slate-100 cursor-pointer shrink-0"
                          >
                            تحديث
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'accreditations' && (
              <div className="space-y-6">
                <form
                  onSubmit={handleAddAccreditation}
                  className="bg-[#091224] border border-slate-800/80 rounded-2xl p-6 space-y-4"
                >
                  <h2 className="text-lg font-bold text-slate-100">رفع شهادة اعتماد أو ترخيص جديد</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">اسم الاعتماد / الشهادة</label>
                      <input
                        type="text"
                        required
                        value={accTitle}
                        onChange={(e) => setAccTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">الجهة المانحة</label>
                      <input
                        type="text"
                        required
                        value={accIssuer}
                        onChange={(e) => setAccIssuer(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">رقم الترخيص / الاعتماد</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={accLicense}
                        onChange={(e) => setAccLicense(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 text-right font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">صورة الشهادة عالية الجودة</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          dir="ltr"
                          value={accImage}
                          onChange={(e) => setAccImage(e.target.value)}
                          className="flex-1 px-3 py-2 rounded-lg bg-[#070E1B] border border-slate-800 text-xs text-slate-100 font-mono"
                        />
                        <label className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-100 cursor-pointer shrink-0">
                          رفع شهادة
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageFileUpload(e, (url) => setAccImage(url))}
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold cursor-pointer"
                  >
                    إضافة شهادة الاعتماد
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {accreditations.map((acc) => (
                    <div
                      key={acc.id}
                      className="bg-[#091224] border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-[16/10] bg-[#070E1B] border-b border-slate-800/70">
                          <ResilientImage
                            src={acc.imageUrl}
                            alt={acc.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 space-y-1">
                          <div className="text-sm font-bold text-slate-100">{acc.title}</div>
                          <div className="text-xs text-slate-400">{acc.issuer}</div>
                          <div className="text-xs font-mono text-amber-300">
                            {acc.licenseNumber} · {acc.issueYear}
                          </div>
                        </div>
                      </div>
                      <div className="px-4 py-3 border-t border-slate-800/70">
                        <button
                          type="button"
                          onClick={() => handleDeleteAccreditation(acc.id)}
                          className="text-xs text-rose-300 hover:text-rose-200 cursor-pointer"
                        >
                          حذف الاعتماد
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
