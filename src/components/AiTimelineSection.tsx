import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Layers } from 'lucide-react';
import type { AcademicTrack } from '../types/lms';

interface AiTimelineSectionProps {
  tracks: AcademicTrack[];
  completedLessonIds: string[];
  onStartLevelLesson: (trackId: string, lessonId: string) => void;
}

export function AiTimelineSection({
  tracks,
  completedLessonIds,
  onStartLevelLesson,
}: AiTimelineSectionProps) {
  const aiTrack = tracks.find((t) => t.id === 'ai-engineering') || tracks[0];
  const [selectedLevelIdx, setSelectedLevelIdx] = useState(0);

  if (!aiTrack || !aiTrack.levels || aiTrack.levels.length === 0) {
    return null;
  }

  const safeIdx = Math.min(selectedLevelIdx, aiTrack.levels.length - 1);
  const currentLevel = aiTrack.levels[safeIdx];

  return (
    <section id="ai-timeline" className="py-20 border-t border-slate-800/70 bg-[#060B16]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-medium mb-2">
            <Layers className="w-4 h-4" />
            <span>الخطة الأكاديمية لمسار الذكاء الاصطناعي</span>
            <span aria-hidden="true">·</span>
            <span>{aiTrack.levels.length} مستويات متدرجة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">
            مسار مهندس الذكاء الاصطناعي من التأسيس إلى النشر الإنتاجي
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            تصميم منهجي متدرج يجمع بين برمجة بايثون ومسارات البيانات، تعلم الآلة، بناء الشبكات العصبية بـ
            PyTorch، النماذج اللغوية المحلية والسحابية، والنشر عبر FastAPI و Ubuntu.
          </p>
        </div>

        {/* 6-Level Timeline Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {aiTrack.levels.map((level, idx) => {
            const isSelected = idx === safeIdx;
            const completedCount = level.lessons.filter((l) =>
              completedLessonIds.includes(l.id)
            ).length;
            const allDone = completedCount === level.lessons.length && level.lessons.length > 0;

            return (
              <button
                key={level.id}
                type="button"
                onClick={() => setSelectedLevelIdx(idx)}
                className={`text-right p-4 rounded-xl border transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F1B33] border-sky-500 text-slate-100'
                    : 'bg-[#0B1324] border-slate-800/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-sky-400">0{level.levelNumber}</span>
                  {allDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-xs sm:text-sm font-bold leading-snug line-clamp-2">
                  {level.title.replace(/^المستوى\s+[^:]+:\s*/, '')}
                </div>
                <div className="text-[11px] font-mono tabular-nums text-slate-400 mt-2">
                  {level.hours} ساعة
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Level Detail Panel */}
        <div className="bg-[#0B1324] border border-slate-800/80 rounded-2xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span className="font-semibold text-sky-400">المستوى {currentLevel.levelNumber}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{currentLevel.hours} ساعة تدريبية</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{currentLevel.subtitle}</span>
            </div>

            <h3 className="text-2xl font-bold text-slate-100">{currentLevel.title}</h3>

            <div className="pt-2 space-y-3">
              <div className="text-xs font-medium text-slate-400">الدروس والمختبرات التطبيقية:</div>
              <div className="divide-y divide-slate-800/70 border border-slate-800/80 rounded-xl bg-[#070E1B]">
                {currentLevel.lessons.map((lesson) => {
                  const isDone = completedLessonIds.includes(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2
                            className={`w-4 h-4 shrink-0 ${
                              isDone ? 'text-emerald-400' : 'text-slate-600'
                            }`}
                          />
                          <span className="text-sm font-semibold text-slate-100">{lesson.title}</span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed pr-6">
                          {lesson.summary}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => onStartLevelLesson(aiTrack.id, lesson.id)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-sky-600 text-xs font-medium text-slate-100 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>فتح الدرس</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6 bg-[#070E1B] border border-slate-800/80 rounded-xl p-6">
            <div>
              <div className="text-xs text-slate-400 mb-2">التقنيات والأدوات المعتمدة</div>
              <div className="text-sm font-mono text-slate-200 leading-relaxed">
                {currentLevel.tools.join(' · ')}
              </div>
            </div>

            <div className="pt-5 border-t border-slate-800/70">
              <div className="text-xs text-slate-400 mb-2">المخرج العملي للمستوى</div>
              <p className="text-sm text-slate-200 leading-relaxed">{currentLevel.deliverable}</p>
            </div>

            {currentLevel.lessons[0] && (
              <div className="pt-5 border-t border-slate-800/70">
                <button
                  type="button"
                  onClick={() => onStartLevelLesson(aiTrack.id, currentLevel.lessons[0].id)}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-sky-600 hover:bg-sky-500 text-sm font-semibold text-white transition-colors cursor-pointer"
                >
                  <span>بدء دراسة المستوى {currentLevel.levelNumber}</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
