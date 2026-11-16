import { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Code2,
  Download,
  FileCode2,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  Terminal,
} from 'lucide-react';
import { getAllTrackLessons } from '../data/curriculum';
import type { AcademicTrack, LessonAttachment, LessonItem } from '../types/lms';

interface ClassroomViewProps {
  tracks: AcademicTrack[];
  activeTrackId: string;
  activeLessonId: string;
  completedLessonIds: string[];
  onSelectTrack: (trackId: string, lessonId?: string) => void;
  onSelectLesson: (lessonId: string) => void;
  onToggleComplete: (lessonId: string, completed: boolean) => Promise<void>;
  onOpenDashboard: () => void;
}

type ResourceTab = 'files' | 'notes' | 'quiz';

export function ClassroomView({
  tracks,
  activeTrackId,
  activeLessonId,
  completedLessonIds,
  onSelectTrack,
  onSelectLesson,
  onToggleComplete,
  onOpenDashboard,
}: ClassroomViewProps) {
  const careerTracks = tracks.filter((t) => t.levels && t.levels.length > 0);
  const currentTrack: AcademicTrack | undefined =
    careerTracks.find((t) => t.id === activeTrackId) || careerTracks[0];
  const allLessons = getAllTrackLessons(currentTrack);
  const currentLesson: LessonItem | undefined =
    allLessons.find((l) => l.id === activeLessonId) || allLessons[0];

  const [expandedLevels, setExpandedLevels] = useState<Record<string, boolean>>({});
  const [resourceTab, setResourceTab] = useState<ResourceTab>('files');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(18);
  const [stageMode, setStageMode] = useState<'lecture' | 'code'>('lecture');
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!currentLesson || !currentTrack) return;
    setIsPlaying(false);
    setPlaybackProgress(14);
    setSelectedQuizOption(null);
    const parentLevel = currentTrack.levels.find((lvl) =>
      lvl.lessons.some((l) => l.id === currentLesson.id)
    );
    if (parentLevel) {
      setExpandedLevels((prev) => ({ ...prev, [parentLevel.id]: true }));
    }
  }, [currentLesson?.id, currentTrack?.id]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => {
      setPlaybackProgress((prev) => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return prev + 2;
      });
    }, 350);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  if (!currentTrack || !currentLesson) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 text-sm">
        لا توجد دروس متاحة حالياً في هذا المسار.
      </div>
    );
  }

  const completedInTrack = allLessons.filter((l) => completedLessonIds.includes(l.id)).length;
  const trackPercent =
    allLessons.length > 0 ? Math.round((completedInTrack / allLessons.length) * 100) : 0;
  const isLessonCompleted = completedLessonIds.includes(currentLesson.id);

  const currentLessonIndex = allLessons.findIndex((l) => l.id === currentLesson.id);
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < allLessons.length - 1
      ? allLessons[currentLessonIndex + 1]
      : null;

  const toggleLevelAccordion = (levelId: string) => {
    setExpandedLevels((prev) => ({ ...prev, [levelId]: !prev[levelId] }));
  };

  const handleDownloadAttachment = (attachment: LessonAttachment) => {
    const blob = new Blob([attachment.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentLesson.codeSnippet);
      setCopiedCode(true);
      window.setTimeout(() => setCopiedCode(false), 1800);
    } catch {
      setCopiedCode(false);
    }
  };

  const formatElapsed = (percent: number, totalMinutes: number) => {
    const totalSeconds = totalMinutes * 60;
    const currentSeconds = Math.round((percent / 100) * totalSeconds);
    const mins = Math.floor(currentSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (currentSeconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#060B16]">
      {/* Classroom top context bar */}
      <div className="border-b border-slate-800/80 bg-[#091122]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="track-switcher" className="sr-only">
              اختر المسار التدريبي
            </label>
            <select
              id="track-switcher"
              value={currentTrack.id}
              onChange={(e) => onSelectTrack(e.target.value)}
              className="bg-[#0D172B] border border-slate-700/80 text-slate-100 text-sm font-medium rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {careerTracks.map((track) => (
                <option key={track.id} value={track.id}>
                  {track.title}
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400 hidden sm:inline">
              {currentTrack.modulesCountLabel} · {currentTrack.totalHours} ساعة
            </span>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-3 min-w-[180px]">
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 transition-all duration-200"
                  style={{ width: `${trackPercent}%` }}
                />
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-300 shrink-0">
                {trackPercent}% مكتمل
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenDashboard}
              className="text-xs font-medium text-sky-400 hover:text-sky-300 whitespace-nowrap shrink-0 cursor-pointer"
            >
              لوحة الإنجاز
            </button>
          </div>
        </div>
      </div>

      {/* Main RTL 2-zone LMS workspace: Center stage + Side curriculum list */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Curriculum Sidebar */}
        <aside className="lg:col-span-4 bg-[#0B1324] border border-slate-800/80 rounded-2xl overflow-hidden order-2 lg:order-1">
          <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-100">محتوى المنهج والدروس</h2>
            <span className="text-xs font-mono tabular-nums text-slate-400">
              {completedInTrack}/{allLessons.length}
            </span>
          </div>

          <div className="divide-y divide-slate-800/70 max-h-[680px] overflow-y-auto">
            {currentTrack.levels.map((level) => {
              const isExpanded = expandedLevels[level.id] ?? level.levelNumber === 1;
              const completedInLevel = level.lessons.filter((l) =>
                completedLessonIds.includes(l.id)
              ).length;

              return (
                <div key={level.id}>
                  <button
                    type="button"
                    onClick={() => toggleLevelAccordion(level.id)}
                    className="w-full px-5 py-4 text-right flex items-start justify-between gap-3 hover:bg-[#0F1930] transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <div className="text-xs text-sky-400 font-medium">
                        المستوى {level.levelNumber} · {level.hours} ساعة
                      </div>
                      <div className="text-sm font-semibold text-slate-100 leading-snug">
                        {level.title.replace(/^المستوى\s+[^:]+:\s*/, '')}
                      </div>
                      <div className="text-xs text-slate-400 tabular-nums">
                        {completedInLevel} من {level.lessons.length} دروس مكتملة
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="bg-[#080F1D] border-t border-slate-800/60 divide-y divide-slate-800/40">
                      {level.lessons.map((lesson) => {
                        const isActive = lesson.id === currentLesson.id;
                        const isDone = completedLessonIds.includes(lesson.id);

                        return (
                          <button
                            key={lesson.id}
                            type="button"
                            onClick={() => onSelectLesson(lesson.id)}
                            className={`w-full px-5 py-3.5 text-right flex items-start justify-between gap-3 transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-sky-500/10 text-slate-100'
                                : 'text-slate-300 hover:bg-slate-900/60 hover:text-slate-100'
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <CheckCircle2
                                className={`w-4 h-4 mt-0.5 shrink-0 ${
                                  isDone ? 'text-emerald-400' : 'text-slate-600'
                                }`}
                              />
                              <div>
                                <div className="text-sm font-medium leading-snug">{lesson.title}</div>
                                <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                                  <span className="font-mono tabular-nums">{lesson.durationLabel}</span>
                                  {isDone && (
                                    <>
                                      <span aria-hidden="true">·</span>
                                      <span className="text-emerald-400">مكتمل</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center Video/Lab Player */}
        <div className="lg:col-span-8 space-y-6 order-1 lg:order-2">
          <div className="bg-[#0B1324] border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-[#091020]">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="font-semibold text-slate-100">{currentLesson.title}</span>
              </div>
              <div className="flex items-center gap-1 p-1 bg-[#060B16] border border-slate-800 rounded-lg">
                <button
                  type="button"
                  onClick={() => setStageMode('lecture')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    stageMode === 'lecture'
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>العرض التفاعلي</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStageMode('code')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                    stageMode === 'code'
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-400 hover:text-slate-100'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>مختبر الكود والتكوين</span>
                </button>
              </div>
            </div>

            <div className="relative aspect-video bg-[#040812] flex flex-col justify-between p-6 sm:p-8">
              {stageMode === 'lecture' ? (
                <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full space-y-5">
                  <div className="text-xs font-mono text-sky-400">
                    {currentTrack.englishSubtitle} · {currentLesson.durationLabel}
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-100 leading-snug">
                    {currentLesson.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                    {currentLesson.summary}
                  </p>
                  <div className="pt-4 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {currentLesson.keyTakeaways.map((point, idx) => (
                      <div
                        key={point}
                        className="p-3 rounded-lg bg-[#091224] border border-slate-800/80 text-xs text-slate-300 leading-relaxed"
                      >
                        <span className="font-mono text-sky-400 block mb-1">0{idx + 1}.</span>
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between bg-[#070E1D] border border-slate-800 rounded-xl overflow-hidden">
                  <div className="px-4 py-2.5 border-b border-slate-800 flex items-center justify-between bg-[#0B1428]">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                      <Code2 className="w-4 h-4 text-sky-400" />
                      <span>{currentLesson.codeTitle}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="text-xs text-sky-400 hover:text-sky-300 cursor-pointer"
                    >
                      {copiedCode ? 'تم النسخ' : 'نسخ الكود'}
                    </button>
                  </div>
                  <pre
                    dir="ltr"
                    className="p-4 sm:p-5 text-xs sm:text-sm font-mono text-sky-100 overflow-x-auto leading-relaxed flex-1"
                  >
                    <code>{currentLesson.codeSnippet}</code>
                  </pre>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={playbackProgress}
                  onChange={(e) => setPlaybackProgress(Number(e.target.value))}
                  aria-label="شريط تقدم الدرس"
                  className="w-full accent-sky-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlaying((prev) => !prev)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'إيقاف مؤقت' : 'تشغيل الدرس'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setPlaybackProgress(0);
                      }}
                      className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-800 text-slate-300 hover:bg-slate-900 cursor-pointer"
                      aria-label="إعادة الدرس من البداية"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono tabular-nums text-slate-400">
                      {formatElapsed(playbackProgress, currentLesson.durationMinutes)} /{' '}
                      {currentLesson.durationLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onToggleComplete(currentLesson.id, !isLessonCompleted)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                        isLessonCompleted
                          ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 hover:bg-emerald-500/25'
                          : 'bg-[#091224] border-slate-700 text-slate-200 hover:border-sky-500'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isLessonCompleted ? 'مكتمل (إلغاء)' : 'تحديد الدرس كمكتمل'}</span>
                    </button>

                    {nextLesson && (
                      <button
                        type="button"
                        onClick={() => onSelectLesson(nextLesson.id)}
                        className="px-3.5 py-2 rounded-lg border border-slate-700 text-xs font-medium text-slate-200 hover:bg-slate-900 transition-colors cursor-pointer"
                      >
                        الدرس التالي
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0B1324] border border-slate-800/80 rounded-2xl overflow-hidden">
            <div className="border-b border-slate-800/80 px-5 pt-3 flex items-center gap-6 overflow-x-auto">
              <button
                type="button"
                onClick={() => setResourceTab('files')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 ${
                  resourceTab === 'files'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileCode2 className="w-4 h-4" />
                <span>ملفات الأكواد والمرفقات</span>
              </button>

              <button
                type="button"
                onClick={() => setResourceTab('notes')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 ${
                  resourceTab === 'notes'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>ملخص الدرس والمفاهيم</span>
              </button>

              <button
                type="button"
                onClick={() => setResourceTab('quiz')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-2 ${
                  resourceTab === 'quiz'
                    ? 'border-sky-500 text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>اختبار التحقق السريع</span>
              </button>
            </div>

            <div className="p-6">
              {resourceTab === 'files' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-400 mb-4">
                    حمّل ملفات الأكواد والتدريب المرفقة لتطبيق خطوات الدرس على بيئتك المحلية:
                  </p>
                  {currentLesson.attachments.map((file) => (
                    <div
                      key={file.fileName}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#070E1B] border border-slate-800/80"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-100">{file.name}</div>
                        <div className="text-xs font-mono text-slate-400 mt-1">
                          {file.fileName} · {file.sizeLabel}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDownloadAttachment(file)}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تحميل الملف</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {resourceTab === 'notes' && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-slate-100">الأهداف والمخرجات التعليمية للدرس</h4>
                  <p className="text-sm text-slate-300 leading-relaxed">{currentLesson.summary}</p>
                  <ul className="space-y-2.5 pt-2">
                    {currentLesson.keyTakeaways.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-slate-200">
                        <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {resourceTab === 'quiz' && (
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-slate-100">{currentLesson.quiz.question}</h4>
                  <div className="space-y-2.5">
                    {currentLesson.quiz.options.map((opt, idx) => {
                      const isChosen = selectedQuizOption === idx;
                      const isCorrect = idx === currentLesson.quiz.correctIndex;
                      let stateStyle =
                        'bg-[#070E1B] border-slate-800 text-slate-200 hover:border-slate-600';

                      if (selectedQuizOption !== null) {
                        if (isCorrect) {
                          stateStyle = 'bg-emerald-500/15 border-emerald-500/60 text-emerald-200';
                        } else if (isChosen) {
                          stateStyle = 'bg-rose-500/15 border-rose-500/60 text-rose-200';
                        }
                      }

                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setSelectedQuizOption(idx)}
                          className={`w-full text-right px-4 py-3 rounded-xl border text-sm transition-colors cursor-pointer ${stateStyle}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                  {selectedQuizOption !== null && (
                    <div className="p-4 rounded-xl bg-[#070E1B] border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      <span className="font-semibold text-slate-100 block mb-1">
                        {selectedQuizOption === currentLesson.quiz.correctIndex
                          ? 'إجابة صحيحة'
                          : 'مراجعة المفهوم'}
                      </span>
                      {currentLesson.quiz.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
