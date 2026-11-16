export interface LessonAttachment {
  name: string;
  fileName: string;
  sizeLabel: string;
  content: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonItem {
  id: string;
  title: string;
  durationMinutes: number;
  durationLabel: string;
  summary: string;
  keyTakeaways: string[];
  codeLanguage: string;
  codeTitle: string;
  codeSnippet: string;
  attachments: LessonAttachment[];
  quiz: QuizQuestion;
}

export interface TrackLevel {
  id: string;
  levelNumber: number;
  title: string;
  subtitle: string;
  hours: number;
  tools: string[];
  deliverable: string;
  lessons: LessonItem[];
}

export interface AcademicTrack {
  id: string;
  kind: 'career' | 'skill';
  title: string;
  englishSubtitle: string;
  summary: string;
  image: string;
  iconLabel: string;
  priceSar: number;
  totalHours: number;
  modulesCountLabel: string;
  levelLabel: string;
  prerequisites: string;
  tools: string[];
  certifications: string[];
  capstoneTitle: string;
  levels: TrackLevel[];
}

export interface CoursePoster {
  id: string;
  trackId: string;
  trackCategory: string;
  vendorName: string;
  vendorCode: string;
  vendorLogoUrl: string;
  title: string;
  studyDuration: string;
  lectureTimes: string;
  examCode: string;
  certificateType: string;
  priceSar: number;
  summary: string;
}

export interface LectureSchedule {
  id: string;
  trackId: string;
  trackTitle: string;
  title: string;
  dayOfWeek: string;
  timeRange: string;
  instructor: string;
  mode: 'حضوري' | 'عن بُعد' | 'مدمج';
}

export interface AccreditationCert {
  id: string;
  title: string;
  issuer: string;
  licenseNumber: string;
  issueYear: string;
  imageUrl: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  audienceLabel: string;
  priceSar: number;
  billingCycle: string;
  summary: string;
  highlighted: boolean;
  trackScope: string;
  features: string[];
}

export interface InstituteContact {
  instituteName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  workingHours: string;
  xHandle: string;
  linkedinUrl: string;
  youtubeUrl: string;
  instagramHandle: string;
  telegramUrl: string;
  heroImageUrl: string;
  awarenessImageUrl: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'student' | 'admin';
  cohort: string;
  activeTrackId: string;
  enrolledTrackIds: string[];
  purchasedPlanId: string | null;
  completedLessonIds: string[];
  recommendedSpecialization: string | null;
  lastActiveLessonId: string;
  createdAt: string;
}

export interface OrderRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  itemType: 'plan' | 'track' | 'course';
  itemId: string;
  itemTitle: string;
  amountSar: number;
  paymentMethod: string;
  status: 'مكتمل' | 'قيد المراجعة';
  createdAt: string;
}

export interface BootstrapPayload {
  tracks: AcademicTrack[];
  coursePosters: CoursePoster[];
  schedules: LectureSchedule[];
  accreditations: AccreditationCert[];
  pricingPlans: PricingPlan[];
  contact: InstituteContact;
  user: UserProfile | null;
}
