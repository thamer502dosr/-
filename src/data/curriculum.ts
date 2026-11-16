import type { AcademicTrack, LessonItem } from '../types/lms';

export interface AwarenessBriefing {
  id: string;
  title: string;
  englishTag: string;
  summary: string;
  caseStudy: string;
  durationLabel: string;
  trackId: string;
  lessonId: string;
  highlights: string[];
}

export interface SpecializationOption {
  id: string;
  title: string;
  englishTitle: string;
  description: string;
  dailyTasks: string[];
  recommendedTrackId: string;
  recommendedTrackTitle: string;
}

export const AWARENESS_BRIEFINGS: AwarenessBriefing[] = [
  {
    id: 'brief-zero-click',
    title: 'أسلحة التجسس الصفرية (Zero-Click)',
    englishTag: 'Pegasus & Zero-Interaction Exploits',
    summary:
      'شرح تفصيلي لبرمجيات التجسس المتقدمة مثل Pegasus وكيف تخترق الأجهزة الذكية عبر معالجات الوسائط دون أي تفاعل من المستخدم.',
    caseStudy: 'تحليل آلية الاختراق عبر رسائل صامتة ومؤشرات الرصد الأمني.',
    durationLabel: '25 دقيقة · محاضرة مفتوحة',
    trackId: 'red-teaming',
    lessonId: 'aware-zero-click',
    highlights: [
      'آلية تجاوز الحماية دون نقر على روابط',
      'فحص سجلات النظام لاكتشاف الشذوذ',
      'بروتوكولات الحماية للأجهزة القيادية',
    ],
  },
  {
    id: 'brief-deepfake',
    title: 'التزييف العميق (Deepfakes)',
    englishTag: 'AI Social Engineering Defense',
    summary:
      'كشف أساليب الهندسة الاجتماعية المعززة بالذكاء الاصطناعي وانتحال الصوت والصورة لخداع المؤسسات المالية والإدارية.',
    caseStudy: 'سيناريوهات انتحال الصوت التنفيذي وطرق التحقق خارج النطاق.',
    durationLabel: '24 دقيقة · دراسة تطبيقية',
    trackId: 'red-teaming',
    lessonId: 'aware-deepfakes',
    highlights: [
      'انتحال الصوت والصورة في الاجتماعات الفورية',
      'بناء سياسة التحقق ثنائي القنوات',
      'تدريب الموظفين على إشارات الاشتباه',
    ],
  },
  {
    id: 'brief-supply-chain',
    title: 'هجمات سلسلة التوريد (Supply Chain Attacks)',
    englishTag: 'SolarWinds Incident Analysis',
    summary:
      'دراسة حالة اختراق برمجيات SolarWinds وتأثيرها العالمي، مع خارطة طريق لتأمين بيئات البناء والتحديثات البرمجية.',
    caseStudy: 'تتبع التحديث المخترق من بيئة البناء حتى الشبكات الحكومية والشركات.',
    durationLabel: '27 دقيقة · دراسة حالة',
    trackId: 'red-teaming',
    lessonId: 'aware-supply-chain',
    highlights: [
      'حماية خطوط CI/CD وتوقيع الحزم',
      'إنشاء قوائم مكونات البرمجيات SBOM',
      'رصد الاتصالات الخارجة من خوادم الإدارة',
    ],
  },
];

export const SPECIALIZATION_OPTIONS: SpecializationOption[] = [
  {
    id: 'soc',
    title: 'محلل مركز العمليات الأمنية (SOC Analyst)',
    englishTitle: 'Security Operations & Monitoring',
    description:
      'يناسبك هذا التخصص إذا كنت تفضل مراقبة الأنظمة على مدار الساعة، تحليل السجلات والتنبيهات الأمنية، واحتواء الحوادث قبل انتشارها.',
    dailyTasks: ['تحليل حزم Wireshark وسجلات SIEM', 'رصد التهديدات المبكرة والاستجابة للحوادث', 'متابعة مؤشرات الاختراق IoCs'],
    recommendedTrackId: 'network-infra',
    recommendedTrackTitle: 'مسار هندسة الشبكات والبنية التحتية المتكامل',
  },
  {
    id: 'pentester',
    title: 'مختبر اختراق (Penetration Tester / Red Teamer)',
    englishTitle: 'Offensive Security Specialist',
    description:
      'يناسبك هذا التخصص إذا كنت تستمتع بالتفكير الهجومي، تفكيك تطبيقات الويب والموبايل، واكتشاف الثغرات قبل أن يستغلها المهاجمون.',
    dailyTasks: ['فحص تطبيقات الويب (SQLi / XSS)', 'محاكاة هجمات Active Directory', 'برمجة أدوات فحص بـ Python و Go'],
    recommendedTrackId: 'red-teaming',
    recommendedTrackTitle: 'مسار الأمن السيبراني واختبار الاختراق (Red Teaming)',
  },
  {
    id: 'forensics',
    title: 'أخصائي التحليل الجنائي الرقمي (Digital Forensics)',
    englishTitle: 'Incident Forensics & Evidence Analysis',
    description:
      'يناسبك هذا التخصص إذا كنت تميل للتحقيق الدقيق، تتبع آثار الاختراقات بعد وقوعها، وتحليل الذاكرة والملفات التنفيذية.',
    dailyTasks: ['تحليل الذاكرة والأقراص المصابة', 'الهندسة العكسية للبرمجيات الخبيثة', 'إعداد تقارير الأدلة الرقمية'],
    recommendedTrackId: 'red-teaming',
    recommendedTrackTitle: 'مسار الأمن السيبراني واختبار الاختراق (Red Teaming)',
  },
  {
    id: 'cloud-sec',
    title: 'مهندس الشبكات وأمن البنية التحتية (Network & Cloud Infra)',
    englishTitle: 'CompTIA / Cisco / Huawei / Juniper',
    description:
      'يناسبك هذا التخصص إذا كنت تفضل بناء شبكات كبرى على أجهزة Cisco و Huawei و Juniper، وإدارة خوادم Linux والجدران النارية.',
    dailyTasks: ['تكوين موجهات Cisco (CCNA/CCNP/CCIE)', 'بناء الشبكات على Huawei VRP و Juniper Junos', 'تأمين خوادم Ubuntu و Windows Server'],
    recommendedTrackId: 'network-infra',
    recommendedTrackTitle: 'مسار هندسة الشبكات والبنية التحتية المتكامل',
  },
  {
    id: 'ai-engineer',
    title: 'مهندس ذكاء اصطناعي وتعلم آلي (AI & ML Engineer)',
    englishTitle: 'Applied AI & LLM Systems',
    description:
      'يناسبك هذا التخصص إذا كنت شغوفاً ببناء النماذج التنبؤية بـ PyTorch، تشغيل النماذج اللغوية محلياً، ونشر خدمات ذكية عبر FastAPI.',
    dailyTasks: ['بناء مسارات البيانات بـ Pandas و NumPy', 'تدريب شبكات PyTorch وتقييمها', 'تطوير واجهات FastAPI والربط مع LLMs'],
    recommendedTrackId: 'ai-engineering',
    recommendedTrackTitle: 'مسار مهندس الذكاء الاصطناعي المتكامل',
  },
];

export function getSkillTrackLinkedLocation(skillTrackId: string): { trackId: string; lessonId: string } {
  switch (skillTrackId) {
    case 'skill-pytorch':
      return { trackId: 'ai-engineering', lessonId: 'ai-l3-1' };
    case 'skill-web-pentest':
      return { trackId: 'red-teaming', lessonId: 'cyber-l1-2' };
    case 'skill-n8n-agents':
      return { trackId: 'ai-engineering', lessonId: 'ai-l4-1' };
    case 'skill-ccna-labs':
      return { trackId: 'network-infra', lessonId: 'net-l1-1' };
    default:
      return { trackId: 'ai-engineering', lessonId: 'ai-l1-1' };
  }
}

export function getAllTrackLessons(track?: AcademicTrack | null): LessonItem[] {
  if (!track || !Array.isArray(track.levels)) return [];
  return track.levels.flatMap((lvl) => lvl.lessons ?? []);
}
