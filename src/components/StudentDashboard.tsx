import { ArrowLeft, Award, BookOpenCheck, CalendarClock, CheckCircle2, Clock } from 'lucide-react';
import { getAllTrackLessons } from '../data/curriculum';
import type { AcademicTrack, LectureSchedule } from '../types/lms';

interface StudentDashboardProps {
  tracks: AcademicTrack[];
  schedules: LectureSchedule[];
  studentName: string;
  cohort: string;
  activeTrackId: string;
  enrolledTrackIds: string[];
  completedLessonIds: string[];
  recommendedSpecialization: string | null;
  onResumeLesson: (trackId: string, lessonId: string) => void;
  onOpenPricing: () => void;
}

export function StudentDashboard({
  tracks,
  schedules,
  studentName,
  cohort,
  activeTrackId,
  enrolledTrackIds,
  completedLessonIds,
  recommendedSpecialization,
  onResumeLesson,
  onOpenPricing,
}: StudentDashboardProps) {
  const careerTracks = tracks.filter((t) => t.kind === 'career' && t.levels.length > 0);
  const allCareerLessons = careerTracks.flatMap((t) => getAllTrackLessons(t));
  const totalCompletedCount = allCareerLessons.filter((l) =>
    completedLessonIds.includes(l.id)
  ).length;
  const completedMinutes = allCareerLessons
    .filter((l) => completedLessonIds.includes(l.id))
    .reduce((acc, item) => acc + item.durationMinutes, 0);

  const activeTrack = careerTracks.find((t) => t.id === activeTrackId) || careerTracks[0];
  const activeTrackLessons = getAllTrackLessons(activeTrack);
  const nextPendingLesson =
    activeTrackLessons.find((l) => !completedLessonIds.includes(l.id)) || activeTrackLessons[0];

  const handleDownloadTranscript = () => {
    const completedTitles = allCareerLessons
      .filter((l) => completedLessonIds.includes(l.id))
      .map((l, i) => `${i + 1}. ${l.title} (${l.durationLabel})`);

    const report = [
      'معهد آفاق الخليج — سجل الإنجاز الأكاديمي',
      `اسم المتدرب: ${studentName}`,
      `الدفعة: ${cohort}`,
      `المسار النشط: ${activeTrack?.title || ''}`,
      `عدد الدروس المكتملة: ${totalCompletedCount} من ${allCareerLessons.length}`,
      '',
      'الدروس المنجزة:',
      ...(completedTitles.length > 0 ? completedTitles : ['لا توجد دروس مكتملة بعد']),
    ].join('\n');

    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'afaq_student_transcript.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#060B16] py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Student Summary Header */}
        <div className="bg-[#0B1324] border border-slate-800/80 rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs text-sky-400 font-medium">
              لوحة تحكم المتدرب · {cohort}
              {recommendedSpecialization ? ` · التخصص المستهدف: ${recommendedSpecialization}` : ''}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">مرحباً، {studentName}</h1>
            <p className="text-sm text-slate-400">
              يمكنك متابعة تقدمك بشكل منفصل عبر مسارات هندسة الشبكات (CompTIA Network+، Cisco، Huawei،
              Juniper)، الأمن السيبراني، والذكاء الاصطناعي.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleDownloadTranscript}
              className="px-4 py-2.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
            >
              تنزيل سجل الإنجاز
            </button>
            {activeTrack && nextPendingLesson && (
              <button
                type="button"
                onClick={() => onResumeLesson(activeTrack.id, nextPendingLesson.id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                <span>متابعة التعلم</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 3 Clean KPI Summary Cells */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-[#0B1324] border border-slate-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
              <span>إجمالي الدروس المنجزة</span>
              <BookOpenCheck className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-bold font-mono tabular-nums text-slate-100">
              {totalCompletedCount}{' '}
              <span className="text-base font-normal text-slate-400">/ {allCareerLessons.length}</span>
            </div>
          </div>

          <div className="bg-[#0B1324] border border-slate-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
              <span>زمن التدريب التفاعلي المنجز</span>
              <Clock className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-bold font-mono tabular-nums text-slate-100">
              {completedMinutes} <span className="text-base font-normal text-slate-400">دقيقة</span>
            </div>
          </div>

          <div className="bg-[#0B1324] border border-slate-800/80 rounded-2xl p-6">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-3">
              <span>المسارات المفعّلة في حسابك</span>
              <Award className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-3xl font-bold font-mono tabular-nums text-slate-100">
              {enrolledTrackIds.length}{' '}
              <span className="text-base font-normal text-slate-400">من {careerTracks.length}</span>
            </div>
          </div>
        </div>

        {/* Separate Per-Track Progress (Networking + Cyber + AI) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-100">
              تقدمك المنفصل في كل مسار (الشبكات، الأمن السيبراني، والذكاء الاصطناعي)
            </h2>
            <button
              type="button"
              onClick={onOpenPricing}
              className="text-xs font-medium text-sky-400 hover:text-sky-300 cursor-pointer"
            >
              ترقية الباقة أو إضافة مسار
            </button>
          </div>

          <div className="space-y-6">
            {careerTracks.map((track) => {
              const lessons = getAllTrackLessons(track);
              const done = lessons.filter((l) => completedLessonIds.includes(l.id)).length;
              const pct = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;
              const firstLesson =
                lessons.find((l) => !completedLessonIds.includes(l.id)) || lessons[0];
              const isEnrolled = enrolledTrackIds.includes(track.id);

              return (
                <div
                  key={track.id}
                  className="bg-[#0B1324] border border-slate-800/80 rounded-2xl p-6 space-y-6"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-800/70">
                    <div>
                      <div className="text-xs font-mono text-slate-400 mb-1">
                        {track.englishSubtitle} · {track.totalHours} ساعة ·{' '}
                        <span className={isEnrolled ? 'text-emerald-400' : 'text-amber-400'}>
                          {isEnrolled ? 'مفعّل' : 'متاح للاشتراك'}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-100">{track.title}</h3>
                      {track.certifications && track.certifications.length > 0 && (
                        <div className="text-xs text-slate-400 mt-1.5">
                          الشهادات المغطاة: {track.certifications.join(' · ')}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-40 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 transition-all duration-200"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono tabular-nums text-slate-200 shrink-0">
                        {pct}%
                      </span>
                      {firstLesson && (
                        <button
                          type="button"
                          onClick={() => onResumeLesson(track.id, firstLesson.id)}
                          className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          فتح المسار
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Level Milestones */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {track.levels.map((lvl) => {
                      const lvlDone = lvl.lessons.filter((l) =>
                        completedLessonIds.includes(l.id)
                      ).length;
                      const isLvlComplete =
                        lvlDone === lvl.lessons.length && lvl.lessons.length > 0;

                      return (
                        <button
                          key={lvl.id}
                          type="button"
                          onClick={() =>
                            lvl.lessons[0] && onResumeLesson(track.id, lvl.lessons[0].id)
                          }
                          className="text-right p-4 rounded-xl bg-[#070E1B] border border-slate-800/80 hover:border-sky-500/60 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between text-xs mb-2">
                            <span className="font-mono text-sky-400">المستوى {lvl.levelNumber}</span>
                            <span
                              className={`flex items-center gap-1 font-mono tabular-nums ${
                                isLvlComplete ? 'text-emerald-400' : 'text-slate-400'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              {lvlDone}/{lvl.lessons.length}
                            </span>
                          </div>
                          <div className="text-sm font-semibold text-slate-100 leading-snug mb-1">
                            {lvl.title.replace(/^المستوى\s+[^:]+:\s*/, '')}
                          </div>
                          <div className="text-xs text-slate-400 truncate">{lvl.subtitle}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Lecture Schedule Table from Dynamic CMS */}
        <div className="bg-[#0B1324] border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800/80 flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-sky-400" />
            <h2 className="text-base font-bold text-slate-100">جدول المحاضرات المباشرة المعتمد</h2>
          </div>
          <div className="divide-y divide-slate-800/70">
            {schedules.map((sch) => (
              <div
                key={sch.id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm"
              >
                <div>
                  <div className="font-semibold text-slate-100">{sch.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{sch.trackTitle}</div>
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  {sch.dayOfWeek} · {sch.timeRange} · {sch.instructor} · {sch.mode}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
