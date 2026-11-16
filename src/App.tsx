import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Award, CalendarClock, Mail, MapPin, Phone, ShieldAlert } from 'lucide-react';
import {
  AWARENESS_BRIEFINGS,
  getAllTrackLessons,
  getSkillTrackLinkedLocation,
} from './data/curriculum';
import type {
  AcademicTrack,
  AccreditationCert,
  BootstrapPayload,
  CoursePoster,
  InstituteContact,
  LectureSchedule,
  PricingPlan,
  UserProfile,
} from './types/lms';
import { Navbar, type ActiveView } from './components/Navbar';
import { ResilientImage } from './components/ResilientImage';
import { CoursePosterCard } from './components/CoursePosterCard';
import { AiTimelineSection } from './components/AiTimelineSection';
import { SpecializationQuiz } from './components/SpecializationQuiz';
import { RegistrationForm } from './components/RegistrationForm';
import { ClassroomView } from './components/ClassroomView';
import { StudentDashboard } from './components/StudentDashboard';
import { PricingView, type CheckoutTarget } from './components/PricingView';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthView } from './components/AuthView';

const TOKEN_STORAGE_KEY = 'afaq_auth_token';

export default function App() {
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [trackFilter, setTrackFilter] = useState<'career' | 'skill'>('career');
  const [posterFilter, setPosterFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [tracks, setTracks] = useState<AcademicTrack[]>([]);
  const [coursePosters, setCoursePosters] = useState<CoursePoster[]>([]);
  const [schedules, setSchedules] = useState<LectureSchedule[]>([]);
  const [accreditations, setAccreditations] = useState<AccreditationCert[]>([]);
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [contact, setContact] = useState<InstituteContact>({
    instituteName: 'معهد آفاق الخليج',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    workingHours: '',
    xHandle: '',
    linkedinUrl: '',
    youtubeUrl: '',
    instagramHandle: '',
    telegramUrl: '',
    heroImageUrl: '/src/assets/images/hero_institute_campus_1794777831597.jpg',
    awarenessImageUrl: '/src/assets/images/awareness_deepfake_security_1794777832779.jpg',
  });
  const [user, setUser] = useState<UserProfile | null>(null);

  const [activeTrackId, setActiveTrackId] = useState<string>('ai-engineering');
  const [activeLessonId, setActiveLessonId] = useState<string>('ai-l1-1');
  const [guestCompletedLessons, setGuestCompletedLessons] = useState<string[]>([]);
  const [guestSpecialization, setGuestSpecialization] = useState<string | null>(null);
  const [pendingCheckoutTarget, setPendingCheckoutTarget] = useState<CheckoutTarget | null>(null);

  const fetchBootstrap = useCallback(async () => {
    try {
      setLoadError(null);
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      const res = await fetch('/api/bootstrap', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Bootstrap error');
      const data = (await res.json()) as BootstrapPayload;
      setTracks(data.tracks || []);
      setCoursePosters(data.coursePosters || []);
      setSchedules(data.schedules || []);
      setAccreditations(data.accreditations || []);
      setPricingPlans(data.pricingPlans || []);
      if (data.contact) setContact(data.contact);
      setUser(data.user || null);
      if (data.user) {
        setActiveTrackId(data.user.activeTrackId || data.tracks[0]?.id || 'ai-engineering');
        setActiveLessonId(data.user.lastActiveLessonId || 'ai-l1-1');
      }
    } catch {
      setLoadError('تعذر تحميل بيانات المنصة من الخادم.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBootstrap();
  }, [fetchBootstrap]);

  const handleNavigateView = (view: ActiveView, sectionId?: string) => {
    setActiveView(view);
    if (view === 'home' && sectionId) {
      window.requestAnimationFrame(() => {
        if (sectionId === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
        }
      });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLaunchLesson = (trackId: string, lessonId?: string) => {
    const track = tracks.find((t) => t.id === trackId) || tracks[0];
    const targetLessonId = lessonId || getAllTrackLessons(track)[0]?.id || 'ai-l1-1';
    setActiveTrackId(track?.id || trackId);
    setActiveLessonId(targetLessonId);
    setActiveView('classroom');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTrackCard = (track: AcademicTrack) => {
    if (track.kind === 'skill' && track.levels.length === 0) {
      const linked = getSkillTrackLinkedLocation(track.id);
      handleLaunchLesson(linked.trackId, linked.lessonId);
      return;
    }
    handleLaunchLesson(track.id);
  };

  const handlePurchasePoster = (poster: CoursePoster) => {
    setPendingCheckoutTarget({
      itemType: 'course',
      itemId: poster.id,
      title: poster.title,
      priceSar: poster.priceSar,
      subtitle: `${poster.vendorName} · ${poster.examCode}`,
    });
    setActiveView('pricing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLessonComplete = async (lessonId: string, completed: boolean) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!user) {
      setGuestCompletedLessons((prev) => {
        const set = new Set(prev);
        if (completed) set.add(lessonId);
        else set.delete(lessonId);
        return Array.from(set);
      });
    } else {
      setUser((prev) => {
        if (!prev) return prev;
        const set = new Set(prev.completedLessonIds);
        if (completed) set.add(lessonId);
        else set.delete(lessonId);
        return { ...prev, completedLessonIds: Array.from(set), lastActiveLessonId: lessonId };
      });
    }

    try {
      const res = await fetch('/api/student/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ lessonId, completed, trackId: activeTrackId }),
      });
      if (res.ok && user) {
        const data = await res.json();
        if (data?.user) setUser(data.user);
      }
    } catch {
      // Optimistic update kept
    }
  };

  const handleSaveSpecialization = async (specId: string) => {
    setGuestSpecialization(specId);
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    try {
      const res = await fetch('/api/student/specialization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ specialization: specId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.user) setUser(data.user);
      }
    } catch {
      // Keep local
    }
  };

  const handleAuthenticated = async (token: string, loggedUser: UserProfile) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    setUser(loggedUser);
    setActiveTrackId(loggedUser.activeTrackId || 'ai-engineering');
    setActiveLessonId(loggedUser.lastActiveLessonId || 'ai-l1-1');
    await fetchBootstrap();
    setActiveView(loggedUser.role === 'admin' ? 'admin' : 'dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = async () => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setUser(null);
    setActiveView('home');
  };

  const completedLessonIds = user ? user.completedLessonIds : guestCompletedLessons;
  const displayedTracks = tracks.filter((t) => t.kind === trackFilter);
  const careerTracks = tracks.filter((t) => t.kind === 'career');
  const totalHoursSum = careerTracks.reduce((acc, t) => acc + t.totalHours, 0);

  const visiblePosters =
    posterFilter === 'all'
      ? coursePosters
      : coursePosters.filter((p) => p.trackId === posterFilter);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060B16] text-slate-300 flex items-center justify-center text-sm">
        جاري تحميل منصة معهد آفاق الخليج...
      </div>
    );
  }

  if (loadError && tracks.length === 0) {
    return (
      <div className="min-h-screen bg-[#060B16] text-slate-200 flex flex-col items-center justify-center gap-4 p-6 text-center">
        <p className="text-base">{loadError}</p>
        <button
          type="button"
          onClick={fetchBootstrap}
          className="px-5 py-2.5 rounded-lg bg-amber-500 text-slate-950 text-sm font-bold cursor-pointer"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060B16] text-slate-100 flex flex-col">
      <Navbar
        instituteName={contact.instituteName}
        activeView={activeView}
        user={user}
        onNavigateView={handleNavigateView}
        onLogout={handleLogout}
      />

      {activeView === 'auth' && (
        <main className="flex-1">
          <AuthView tracks={tracks} onAuthenticated={handleAuthenticated} />
        </main>
      )}

      {activeView === 'pricing' && (
        <main className="flex-1">
          <PricingView
            pricingPlans={pricingPlans}
            tracks={tracks}
            coursePosters={coursePosters}
            user={user}
            initialCheckoutTarget={pendingCheckoutTarget}
            onClearInitialTarget={() => setPendingCheckoutTarget(null)}
            onOrderCompleted={async ({ token, user: updatedUser }) => {
              if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
              setUser(updatedUser);
              await fetchBootstrap();
            }}
            onOpenClassroom={(tid) => handleLaunchLesson(tid)}
          />
        </main>
      )}

      {activeView === 'classroom' && (
        <main className="flex-1">
          <ClassroomView
            tracks={tracks}
            activeTrackId={activeTrackId}
            activeLessonId={activeLessonId}
            completedLessonIds={completedLessonIds}
            onSelectTrack={(tid, lid) => handleLaunchLesson(tid, lid)}
            onSelectLesson={(lid) => {
              setActiveLessonId(lid);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onToggleComplete={handleToggleLessonComplete}
            onOpenDashboard={() => handleNavigateView('dashboard')}
          />
        </main>
      )}

      {activeView === 'dashboard' && (
        <main className="flex-1">
          <StudentDashboard
            tracks={tracks}
            schedules={schedules}
            studentName={user?.fullName || 'متدرب زائر'}
            cohort={user?.cohort || 'معاينة المنصة'}
            activeTrackId={user?.activeTrackId || activeTrackId}
            enrolledTrackIds={user?.enrolledTrackIds || careerTracks.map((t) => t.id)}
            completedLessonIds={completedLessonIds}
            recommendedSpecialization={user?.recommendedSpecialization ?? guestSpecialization}
            onResumeLesson={(tid, lid) => handleLaunchLesson(tid, lid)}
            onOpenPricing={() => handleNavigateView('pricing')}
          />
        </main>
      )}

      {activeView === 'admin' && (
        <main className="flex-1">
          <AdminDashboard
            user={user}
            tracks={tracks}
            coursePosters={coursePosters}
            schedules={schedules}
            accreditations={accreditations}
            pricingPlans={pricingPlans}
            contact={contact}
            onRefreshBootstrap={fetchBootstrap}
            onRequireAdminLogin={() => handleNavigateView('auth')}
          />
        </main>
      )}

      {activeView === 'home' && (
        <main className="flex-1">
          {/* Hero Section: Deep Navy + Gold & Silver Authority */}
          <section className="pt-12 pb-16 lg:pt-16 lg:pb-20 bg-gradient-to-b from-[#091224] to-[#060B16]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
                <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
                  <div className="text-xs sm:text-sm font-medium text-amber-300">
                    {contact.instituteName} · التأهيل الأكاديمي والاحترافي في التقنية والأمن السيبراني
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-100 leading-[1.2] tracking-tight">
                    منظومة تدريبية متكاملة لبناء مهندسي المستقبل والاعتمادات الدولية
                  </h1>

                  <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                    برامجنا المعتمدة تغطي لغات البرمجة (C و Java و Python) والذكاء الاصطناعي،
                    الأمن السيبراني والتحقيق الرقمي ومنتجات Symantec، الشبكات (CompTIA و Cisco و
                    Huawei و Juniper)، وقواعد البيانات والبيانات الضخمة Big Data.
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <button
                      type="button"
                      onClick={() => handleNavigateView('home', 'posters')}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-sm font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <span>تصفح بوسترات الدورات</span>
                      <ArrowLeft className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleNavigateView('pricing')}
                      className="inline-flex items-center justify-center px-5 py-3.5 rounded-xl border border-slate-600 hover:border-amber-400/60 text-slate-200 hover:text-white text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      الأسعار وباقات الاشتراك
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-6">
                  <div className="h-full min-h-[280px] sm:min-h-[360px] rounded-2xl overflow-hidden border border-amber-500/20 bg-[#091224]">
                    <ResilientImage
                      src={contact.heroImageUrl}
                      alt={`قاعة التدريب الرئيسية في ${contact.instituteName}`}
                      fallbackTitle={contact.instituteName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* 4-Column Dynamic Proof Strip */}
              <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 border-t border-slate-800/80 pt-8">
                <div className="p-4 rounded-xl bg-[#091224] border border-slate-800/80">
                  <div className="text-2xl font-bold font-mono tabular-nums text-amber-300">
                    {careerTracks.length} مسارات
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 mt-1">
                    البرمجة، الأمن السيبراني، الشبكات، والبيانات الضخمة
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#091224] border border-slate-800/80">
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
                    {coursePosters.length} شهادات
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 mt-1">
                    تأهيل لاختبارات Cisco و Symantec و Huawei و Oracle
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#091224] border border-slate-800/80">
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
                    {totalHoursSum} ساعة
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 mt-1">
                    تطبيق عملي ومختبرات محاكاة مباشرة
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-[#091224] border border-slate-800/80">
                  <div className="text-2xl font-bold font-mono tabular-nums text-slate-100">
                    {accreditations.length} اعتمادات
                  </div>
                  <div className="text-xs sm:text-sm text-slate-300 mt-1">
                    تراخيص أكاديمية ومهنية موثقة
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Dedicated Course Posters Section */}
          <section id="posters" className="py-20 border-t border-slate-800/70 bg-[#070D1B]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
                <div className="max-w-2xl">
                  <div className="text-xs text-amber-300 font-medium mb-2">
                    الدليل الرسمي للشهادات والبرامج المعتمدة
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">
                    بوسترات الدورات والاختبارات الدولية
                  </h2>
                  <p className="text-slate-400 text-base leading-relaxed">
                    بطاقات تعريفية مفصلة لكل دورة تعرض شعار الجهة المانحة، مدة الدراسة، أوقات
                    المحاضرات، كود الاختبار الدولي، ونوع الشهادة الممنوحة.
                  </p>
                </div>

                {/* Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#091224] border border-slate-800 rounded-xl self-start lg:self-auto">
                  {[
                    { id: 'all', label: 'جميع الدورات' },
                    { id: 'network-infra', label: 'الشبكات وسيسكو وهواوي' },
                    { id: 'red-teaming', label: 'الأمن السيبراني و Symantec' },
                    { id: 'ai-engineering', label: 'البرمجة والذكاء الاصطناعي' },
                    { id: 'bigdata-db', label: 'البيانات الضخمة والقواعد' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setPosterFilter(tab.id)}
                      className={`px-3 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        posterFilter === tab.id
                          ? 'bg-amber-500 text-slate-950'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {visiblePosters.map((poster) => (
                  <CoursePosterCard
                    key={poster.id}
                    poster={poster}
                    onExploreTrack={(tid) => handleLaunchLesson(tid)}
                    onPurchaseCourse={handlePurchasePoster}
                  />
                ))}
              </div>
            </div>
          </section>

          {/* All 4 Academic Tracks Explorer */}
          <section id="tracks" className="py-20 border-t border-slate-800/70 bg-[#060B16]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="max-w-2xl">
                  <div className="text-xs text-amber-300 font-medium mb-2">
                    الهيكلة الأكاديمية للمعهد
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">
                    المسارات التعليمية الشاملة والدورات المهارية
                  </h2>
                  <p className="text-slate-400 text-base leading-relaxed">
                    تغطية كاملة للغات البرمجة (C/Java/Python) والذكاء الاصطناعي، الأمن السيبراني
                    والتحقيق الرقمي و Symantec، الشبكات (CompTIA/Cisco/Huawei/Juniper)، وقواعد
                    البيانات والبيانات الضخمة.
                  </p>
                </div>

                <div
                  role="tablist"
                  aria-label="تصنيف البرامج التدريبية"
                  className="inline-flex items-center gap-1 p-1 bg-[#091224] border border-slate-800 rounded-xl shrink-0 self-start md:self-auto"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={trackFilter === 'career'}
                    onClick={() => setTrackFilter('career')}
                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      trackFilter === 'career'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    المسارات المهنية الأربعة
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={trackFilter === 'skill'}
                    onClick={() => setTrackFilter('skill')}
                    className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      trackFilter === 'skill'
                        ? 'bg-amber-500 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    الدورات المهارية
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {displayedTracks.map((track) => (
                  <article
                    key={track.id}
                    className="bg-[#091224] border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-amber-500/40 transition-colors"
                  >
                    <div>
                      <div className="aspect-[16/9] bg-[#070E1B] overflow-hidden border-b border-slate-800/70">
                        <ResilientImage
                          src={track.image}
                          alt={track.title}
                          fallbackTitle={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="p-6 space-y-4">
                        <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                          <span className="font-mono text-amber-300">{track.englishSubtitle}</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums">{track.totalHours} ساعة</span>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono tabular-nums text-slate-100">
                            {track.priceSar.toLocaleString('en-US')} ر.س
                          </span>
                        </div>

                        <h3 className="text-xl font-bold text-slate-100 leading-snug">
                          {track.title}
                        </h3>

                        <p className="text-sm text-slate-300 leading-relaxed">{track.summary}</p>

                        {track.certifications && track.certifications.length > 0 && (
                          <div className="pt-3 border-t border-slate-800/70 text-xs text-slate-300 leading-relaxed">
                            <span className="text-amber-300 font-semibold block mb-1">
                              الشهادات والمسارات المغطاة:
                            </span>
                            {track.certifications.join(' · ')}
                          </div>
                        )}

                        <div className="pt-3 border-t border-slate-800/70 space-y-2 text-xs">
                          <div className="text-slate-400">
                            <span className="text-slate-200 font-medium">المتطلبات: </span>
                            {track.prerequisites}
                          </div>
                          <div className="text-slate-400 font-mono leading-relaxed">
                            <span className="font-sans text-slate-200 font-medium">الأدوات: </span>
                            {track.tools.join(' · ')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-[#070E1C] border-t border-slate-800/70 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectTrackCard(track)}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
                      >
                        <span>دخول المنهج والدروس</span>
                        <ArrowLeft className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleNavigateView('pricing')}
                        className="text-xs font-medium text-slate-300 hover:text-white cursor-pointer"
                      >
                        الأسعار والاشتراك
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* AI Track 6-Level Timeline */}
          <AiTimelineSection
            tracks={tracks}
            completedLessonIds={completedLessonIds}
            onStartLevelLesson={(tid, lid) => handleLaunchLesson(tid, lid)}
          />

          {/* Live Lecture Schedule Section */}
          <section className="py-16 border-t border-slate-800/70 bg-[#070D1B]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <div className="flex items-center gap-2 text-xs text-amber-300 font-medium mb-2">
                    <CalendarClock className="w-4 h-4" />
                    <span>مواعيد الدفعة الحالية</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-100">جدول المحاضرات والمختبرات المباشرة</h2>
                </div>
                <button
                  type="button"
                  onClick={() => handleNavigateView('admin')}
                  className="text-xs font-medium text-amber-300 hover:text-amber-200 cursor-pointer"
                >
                  تعديل المواعيد من لوحة الإدارة
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {schedules.map((sch) => (
                  <div
                    key={sch.id}
                    className="bg-[#091224] border border-slate-800/80 rounded-2xl p-6 space-y-3"
                  >
                    <div className="text-xs font-mono text-amber-300">
                      {sch.dayOfWeek} · {sch.timeRange}
                    </div>
                    <h3 className="text-base font-bold text-slate-100">{sch.title}</h3>
                    <div className="text-xs text-slate-400">{sch.trackTitle}</div>
                    <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs text-slate-300">
                      <span>{sch.instructor}</span>
                      <span>{sch.mode}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Security Awareness Campaigns */}
          <section id="awareness" className="py-20 border-t border-slate-800/70 bg-[#060B16]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch mb-12">
                <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
                  <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
                    <ShieldAlert className="w-4 h-4" />
                    <span>حملات التوعية والتثقيف الأمني</span>
                    <span aria-hidden="true">·</span>
                    <span>محاضرات تفاعلية مفتوحة</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
                    محاضرات توعوية ودراسات حالة حقيقية لرفع الجاهزية الأمنية
                  </h2>
                  <p className="text-slate-300 text-base leading-relaxed">
                    محتوى تدريبي مجاني يبرز العمق التقني للمعهد عبر تشريح أحدث الهجمات العالمية:
                    أسلحة التجسس الصفرية، التزييف العميق، واختراقات سلاسل التوريد البرمجية.
                  </p>
                </div>

                <div className="lg:col-span-6">
                  <div className="h-full min-h-[240px] rounded-2xl overflow-hidden border border-slate-800/80 bg-[#091224]">
                    <ResilientImage
                      src={contact.awarenessImageUrl}
                      alt={`درع الحماية الرقمية ومكافحة التزييف العميق في ${contact.instituteName}`}
                      fallbackTitle="التوعية والأمن الرقمي"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {AWARENESS_BRIEFINGS.map((brief) => (
                  <article
                    key={brief.id}
                    className="bg-[#091224] border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-6"
                  >
                    <div className="space-y-3">
                      <div className="text-xs font-mono text-amber-300">
                        {brief.englishTag} · {brief.durationLabel}
                      </div>
                      <h3 className="text-lg font-bold text-slate-100">{brief.title}</h3>
                      <p className="text-sm text-slate-300 leading-relaxed">{brief.summary}</p>
                      <ul className="pt-3 border-t border-slate-800/70 space-y-2">
                        {brief.highlights.map((pt) => (
                          <li key={pt} className="text-xs text-slate-400 flex items-start gap-2">
                            <span className="text-amber-300 font-mono">—</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleLaunchLesson(brief.trackId, brief.lessonId)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#070E1B] border border-slate-700 hover:border-amber-400 text-xs font-semibold text-slate-100 transition-colors cursor-pointer"
                    >
                      <span>مشاهدة المحاضرة التفاعلية</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* Interactive Specialization Selector */}
          <SpecializationQuiz
            savedSpecialization={user?.recommendedSpecialization ?? guestSpecialization}
            onSaveSpecialization={handleSaveSpecialization}
            onStartTrack={(tid) => handleLaunchLesson(tid)}
          />

          {/* Dynamic Accreditations Showcase */}
          <section className="py-16 border-t border-slate-800/70 bg-[#070D1B]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <div className="flex items-center gap-2 text-xs text-amber-300 font-medium mb-2">
                  <Award className="w-4 h-4" />
                  <span>التراخيص والشراكات الأكاديمية</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-100">شهادات الاعتماد المؤسسي</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {accreditations.map((acc) => (
                  <div
                    key={acc.id}
                    className="bg-[#091224] border border-slate-800/80 rounded-2xl overflow-hidden"
                  >
                    <div className="aspect-[16/9] bg-[#070E1B] border-b border-slate-800/70">
                      <ResilientImage
                        src={acc.imageUrl}
                        alt={acc.title}
                        fallbackTitle={acc.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-5 space-y-2">
                      <h3 className="text-base font-bold text-slate-100">{acc.title}</h3>
                      <div className="text-xs text-slate-300">{acc.issuer}</div>
                      <div className="text-xs font-mono text-amber-300">
                        {acc.licenseNumber} · {acc.issueYear}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Registration & Dynamic Contact Channels */}
          <section id="register" className="py-20 border-t border-slate-800/70 bg-[#060B16]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5 space-y-6">
                <div className="text-xs text-amber-300 font-medium">التسجيل وقنوات التواصل المباشر</div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-100">
                  انضم إلى الدفعة القادمة أو تواصل مع الإرشاد الأكاديمي
                </h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  أنشئ حسابك التدريبي الآن أو تواصل مباشرة عبر أرقام وقنوات المعهد المحدثة من لوحة
                  التحكم.
                </p>

                <div className="pt-4 border-t border-slate-800/70 space-y-3 text-sm text-slate-300">
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-amber-300 shrink-0" />
                    <span dir="ltr" className="font-mono">{contact.phone}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>واتساب: </span>
                    <span dir="ltr" className="font-mono">{contact.whatsapp}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-amber-300 shrink-0" />
                    <span dir="ltr" className="font-mono">{contact.email}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-amber-300 shrink-0 mt-1" />
                    <span>{contact.address}</span>
                  </div>
                  <div className="text-xs text-slate-400 pt-1">{contact.workingHours}</div>
                </div>
              </div>

              <div className="lg:col-span-7">
                <RegistrationForm
                  tracks={tracks}
                  defaultTrackId={activeTrackId}
                  onSuccess={async ({ token, fullName, trackId }) => {
                    localStorage.setItem(TOKEN_STORAGE_KEY, token);
                    setActiveTrackId(trackId);
                    await fetchBootstrap();
                    setUser((prev) =>
                      prev ? { ...prev, fullName, activeTrackId: trackId } : prev
                    );
                  }}
                />
              </div>
            </div>
          </section>
        </main>
      )}

      {/* Quiet Dynamic Institutional Footer with Editable Social Media Links */}
      <footer className="border-t border-slate-800/80 bg-[#050912] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="text-base font-bold text-slate-100">{contact.instituteName}</div>
              <div className="text-xs text-slate-400 mt-1">
                {contact.address} · {contact.phone} · {contact.email}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-5 text-xs text-slate-300">
              {contact.xHandle && (
                <a
                  href={contact.xHandle}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-300 transition-colors"
                >
                  منصة X
                </a>
              )}
              {contact.linkedinUrl && (
                <a
                  href={contact.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-300 transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {contact.youtubeUrl && (
                <a
                  href={contact.youtubeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-300 transition-colors"
                >
                  YouTube
                </a>
              )}
              {contact.telegramUrl && (
                <a
                  href={contact.telegramUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-amber-300 transition-colors"
                >
                  Telegram
                </a>
              )}
            </div>
          </div>

          <div className="pt-5 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
            <div className="flex flex-wrap items-center gap-6">
              <button
                type="button"
                onClick={() => handleNavigateView('home', 'posters')}
                className="hover:text-slate-200 cursor-pointer"
              >
                بوسترات الدورات
              </button>
              <button
                type="button"
                onClick={() => handleNavigateView('home', 'tracks')}
                className="hover:text-slate-200 cursor-pointer"
              >
                المسارات
              </button>
              <button
                type="button"
                onClick={() => handleNavigateView('pricing')}
                className="hover:text-slate-200 cursor-pointer"
              >
                الأسعار
              </button>
              <button
                type="button"
                onClick={() => handleNavigateView('classroom')}
                className="hover:text-slate-200 cursor-pointer"
              >
                منصة التعلم
              </button>
              <button
                type="button"
                onClick={() => handleNavigateView('admin')}
                className="hover:text-slate-200 cursor-pointer"
              >
                لوحة الإدارة
              </button>
            </div>
            <span className="text-slate-500">© 2026 {contact.instituteName}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
