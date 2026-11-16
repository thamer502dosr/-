import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Compass } from 'lucide-react';
import { SPECIALIZATION_OPTIONS, type SpecializationOption } from '../data/curriculum';

interface SpecializationQuizProps {
  savedSpecialization: string | null;
  onSaveSpecialization: (specId: string) => Promise<void>;
  onStartTrack: (trackId: string) => void;
}

interface DiagnosticStep {
  id: string;
  question: string;
  choices: {
    label: string;
    targetSpec: string;
  }[];
}

const DIAGNOSTIC_STEPS: DiagnosticStep[] = [
  {
    id: 'focus',
    question: 'ما نوع العمل التقني الذي يثير اهتمامك أكثر في يومك؟',
    choices: [
      { label: 'بناء نماذج ذكية، تحليل البيانات، وتطوير أنظمة التنبؤ', targetSpec: 'ai-engineer' },
      { label: 'اكتشاف الثغرات واختبار اختراق الأنظمة والمواقع', targetSpec: 'pentester' },
      { label: 'مراقبة الشبكات ورصد التنبيهات الأمنية لحظياً', targetSpec: 'soc' },
      { label: 'تصميم الشبكات وإدارة الخوادم وأمن السحابة', targetSpec: 'cloud-sec' },
      { label: 'التحقيق في الحوادث الرقمية وتتبع الأدلة الجنائية', targetSpec: 'forensics' },
    ],
  },
  {
    id: 'tools',
    question: 'أي بيئة أدوات تفضل التعامل معها بشكل مستمر؟',
    choices: [
      { label: 'Python و PyTorch و FastAPI والنماذج اللغوية', targetSpec: 'ai-engineer' },
      { label: 'Kali Linux و Metasploit و Burp Suite', targetSpec: 'pentester' },
      { label: 'Wireshark وسجلات SIEM ومراقبة الحزم', targetSpec: 'soc' },
      { label: 'Cisco IOS و MikroTik وخوادم Ubuntu', targetSpec: 'cloud-sec' },
      { label: 'أدوات فحص الذاكرة والتحليل الجنائي والهندسة العكسية', targetSpec: 'forensics' },
    ],
  },
];

export function SpecializationQuiz({
  savedSpecialization,
  onSaveSpecialization,
  onStartTrack,
}: SpecializationQuizProps) {
  const [selectedInterest, setSelectedInterest] = useState<string>(savedSpecialization || 'ai-engineer');
  const [stepIndex, setStepIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [showResult, setShowResult] = useState<boolean>(Boolean(savedSpecialization));

  const activeSpec: SpecializationOption =
    SPECIALIZATION_OPTIONS.find((item) => item.id === selectedInterest) || SPECIALIZATION_OPTIONS[4];

  const handleAnswerChoice = async (targetSpec: string) => {
    const updated = {
      ...scores,
      [targetSpec]: (scores[targetSpec] || 0) + 1,
    };
    setScores(updated);

    if (stepIndex < DIAGNOSTIC_STEPS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      const winner = Object.entries(updated).sort((a, b) => b[1] - a[1])[0]?.[0] || targetSpec;
      setSelectedInterest(winner);
      setShowResult(true);
      await onSaveSpecialization(winner);
    }
  };

  const handleDirectSelect = async (specId: string) => {
    setSelectedInterest(specId);
    setShowResult(true);
    await onSaveSpecialization(specId);
  };

  const resetQuiz = () => {
    setStepIndex(0);
    setScores({});
    setShowResult(false);
  };

  return (
    <section id="specialization" className="py-20 border-t border-slate-800/70 bg-[#080F1E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mb-10">
          <div className="flex items-center gap-2 text-xs text-sky-400 font-medium mb-2">
            <Compass className="w-4 h-4" />
            <span>دليل اختيار التخصص</span>
            <span aria-hidden="true">·</span>
            <span>توجيه المبتدئين وسوق العمل</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3">
            كيف تختار تخصصك التقني الأنسب؟
          </h2>
          <p className="text-slate-400 text-base leading-relaxed">
            أداة توجيه تفاعلية تساعد المبتدئين على المقارنة بين الأدوار الوظيفية الأكثر طلباً: محلل SOC، مختبر
            الاختراق، التحليل الجنائي، أمن السحابة، ومهندس الذكاء الاصطناعي.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Direct role selector tabs */}
          <div className="lg:col-span-5 space-y-2">
            <div className="text-xs font-medium text-slate-400 mb-3">
              تصفح التخصصات مباشرة أو أجب عن الاختبار السريع:
            </div>
            {SPECIALIZATION_OPTIONS.map((spec) => {
              const isSelected = activeSpec.id === spec.id && showResult;
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => handleDirectSelect(spec.id)}
                  className={`w-full text-right p-4 rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#0F1B33] border-sky-500/70 text-slate-100'
                      : 'bg-[#0B1324] border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-semibold text-sm">{spec.title}</span>
                    <span className="text-xs font-mono text-slate-400 shrink-0">{spec.englishTitle.split(' ')[0]}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Interactive quiz or matched result */}
          <div className="lg:col-span-7 bg-[#0C1528] border border-slate-800/80 rounded-2xl p-6 sm:p-8">
            {!showResult ? (
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-6 pb-4 border-b border-slate-800/70">
                  <span>تحديد الميول التقنية</span>
                  <span className="tabular-nums font-mono">
                    الخطوة {stepIndex + 1} من {DIAGNOSTIC_STEPS.length}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-100 mb-6">
                  {DIAGNOSTIC_STEPS[stepIndex].question}
                </h3>
                <div className="space-y-3">
                  {DIAGNOSTIC_STEPS[stepIndex].choices.map((choice) => (
                    <button
                      key={choice.label}
                      type="button"
                      onClick={() => handleAnswerChoice(choice.targetSpec)}
                      className="w-full text-right px-4 py-3.5 rounded-xl bg-[#070E1B] border border-slate-800 hover:border-sky-500/60 hover:bg-[#0D1A30] text-sm text-slate-200 transition-colors cursor-pointer flex items-center justify-between gap-4"
                    >
                      <span>{choice.label}</span>
                      <ArrowLeft className="w-4 h-4 text-slate-500 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-800/70">
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>التخصص المقترح لك</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono text-slate-400">{activeSpec.englishTitle}</span>
                  </div>
                  <button
                    type="button"
                    onClick={resetQuiz}
                    className="text-xs text-sky-400 hover:text-sky-300 underline underline-offset-4 cursor-pointer"
                  >
                    إعادة التقييم
                  </button>
                </div>

                <h3 className="text-2xl font-bold text-slate-100 mb-3">{activeSpec.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">{activeSpec.description}</p>

                <div className="mb-6">
                  <div className="text-xs font-medium text-slate-400 mb-3">المهام العملية الأساسية في هذا الدور:</div>
                  <ul className="space-y-2.5">
                    {activeSpec.dailyTasks.map((task) => (
                      <li key={task} className="flex items-start gap-2.5 text-sm text-slate-200">
                        <span className="text-sky-400 font-mono mt-0.5">—</span>
                        <span>{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-5 border-t border-slate-800/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-slate-400 mb-1">المسار الأكاديمي الموصى به في المعهد</div>
                    <div className="text-sm font-semibold text-slate-100">{activeSpec.recommendedTrackTitle}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onStartTrack(activeSpec.recommendedTrackId)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>ابدأ المسار المقترح</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
