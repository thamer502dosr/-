import express from 'express';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const STORE_PATH = path.join(DATA_DIR, 'institute-store.json');

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

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'student' | 'admin';
  passwordHash: string;
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

interface InstituteDatabase {
  tracks: AcademicTrack[];
  coursePosters: CoursePoster[];
  schedules: LectureSchedule[];
  accreditations: AccreditationCert[];
  pricingPlans: PricingPlan[];
  contact: InstituteContact;
  users: UserAccount[];
  sessions: Record<string, string>;
  orders: OrderRecord[];
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;
  const derived = crypto.scryptSync(password, salt, 64);
  const keyBuf = Buffer.from(key, 'hex');
  if (derived.length !== keyBuf.length) return false;
  return crypto.timingSafeEqual(derived, keyBuf);
}

function createInitialDatabase(): InstituteDatabase {
  const tracks: AcademicTrack[] = [
    {
      id: 'ai-engineering',
      kind: 'career',
      title: 'مسار لغات البرمجة والذكاء الاصطناعي',
      englishSubtitle: 'C / Java / Python · PyTorch · LLMs & FastAPI',
      summary:
        'مسار متكامل يجمع بين إتقان لغات البرمجة الأساسية (C و Java و Python) والتأسيس المتدرج في الذكاء الاصطناعي عبر 6 مستويات: معالجة البيانات بـ Pandas و NumPy، تعلم الآلة بـ Scikit-Learn، الشبكات العصبية بـ PyTorch، النماذج اللغوية المحلية والسحابية، والنشر عبر FastAPI.',
      image: '/src/assets/images/track_ai_engineering_1794777830795.jpg',
      iconLabel: 'DEV & AI',
      priceSar: 3400,
      totalHours: 240,
      modulesCountLabel: '6 مستويات متدرجة',
      levelLabel: 'من التأسيس البرمجي إلى النشر الإنتاجي',
      prerequisites: 'إلمام أساسي بالحاسوب والمنطق',
      tools: ['C / C++', 'Java', 'Python', 'Pandas & NumPy', 'Scikit-Learn', 'PyTorch', 'Ollama & Claude API', 'FastAPI'],
      certifications: ['شهادة البرمجة المؤسسية C / Java / Python', 'شهادة مهندس ذكاء اصطناعي PyTorch & LLMs'],
      capstoneTitle: 'نظام تحليل وتوقع البيانات المالية بـ PyTorch وواجهة FastAPI حديثة',
      levels: [
        {
          id: 'ai-level-1',
          levelNumber: 1,
          title: 'المستوى الأول: التأسيس البرمجي (C / Java / Python) ومعالجة البيانات',
          subtitle: 'C · Java · Python · Pandas · NumPy · Data Pipelines',
          hours: 44,
          tools: ['C', 'Java', 'Python 3.12', 'Pandas', 'NumPy'],
          deliverable: 'إتقان الخوارزميات بلغات C و Java و Python وبناء مسار تنقية بيانات ETL',
          lessons: [
            {
              id: 'ai-l1-1',
              title: 'البرمجة الهيكلية والكائنية بلغات C و Java و Python',
              durationMinutes: 32,
              durationLabel: '32:00',
              summary: 'بناء أساس صلب في الذاكرة والمؤشرات بلغة C، البرمجة الكائنية في Java، وكتابة كود Python المعياري للذكاء الاصطناعي.',
              keyTakeaways: [
                'مقارنة إدارة الذاكرة والأداء بين C و Java و Python',
                'بناء تراكيب البيانات والدوال النظيفة للأنظمة الخلفية',
                'تطبيق التحقق الصارم من الأنواع ومعالجة الأخطاء',
              ],
              codeLanguage: 'python',
              codeTitle: 'pipeline_types.py',
              codeSnippet: `from dataclasses import dataclass\nfrom typing import List\n\n@dataclass\nclass TrainingSample:\n    record_id: str\n    features: List[float]\n    label: int\n\ndef normalize_vector(values: List[float]) -> List[float]:\n    mean = sum(values) / len(values)\n    variance = sum((x - mean) ** 2 for x in values) / len(values)\n    std = variance ** 0.5 or 1.0\n    return [round((x - mean) / std, 4) for x in values]`,
              attachments: [
                {
                  name: 'ملف تمارين لغات البرمجة C / Java / Python',
                  fileName: 'level1_lang_foundations.py',
                  sizeLabel: '4.2 KB',
                  content: `def clean_currency(value: str) -> float:\n    return float(value.replace(",", "").replace("SAR", "").strip())\n`,
                },
              ],
              quiz: {
                id: 'q-ai-1-1',
                question: 'ما الهدف الرئيسي من توحيد القيم العددية (Standardization) قبل تدريب النماذج؟',
                options: [
                  'جعل جميع الميزات على مقياس متوازن لتسريع تقارب الخوارزمية',
                  'حذف القيم النصية من قاعدة البيانات تلقائياً',
                  'تشفير بيانات المتدربين',
                ],
                correctIndex: 0,
                explanation: 'توحيد القيم يضع الخصائص على متوسط صفري وانحراف معياري واحد مما يحسن استقرار التدريب.',
              },
            },
            {
              id: 'ai-l1-2',
              title: 'تحليل ومعالجة البيانات بـ Pandas و NumPy ومسارات ETL',
              durationMinutes: 35,
              durationLabel: '35:00',
              summary: 'استخدام مصفوفات NumPy وجداول Pandas لتنظيف البيانات الضخمة ومعالجة القيم المفقودة وبناء Data Pipelines.',
              keyTakeaways: [
                'تنفيذ العمليات الشعاعية في NumPy',
                'كشف القيم الشاذة والمفقودة ومعالجتها إحصائياً',
                'سحب البيانات من قواعد البيانات وهيكلتها للتدريب',
              ],
              codeLanguage: 'python',
              codeTitle: 'data_cleaning.py',
              codeSnippet: `import numpy as np\nimport pandas as pd\n\ndf = pd.DataFrame({"sector": ["AI", "Cyber", "Network"], "revenue": [42000.0, np.nan, 31500.0]})\ndf["revenue"] = df["revenue"].fillna(df["revenue"].median())\nprint(df)`,
              attachments: [
                {
                  name: 'دفتر تنظيف البيانات المالية',
                  fileName: 'pandas_pipeline.py',
                  sizeLabel: '3.8 KB',
                  content: `import pandas as pd\ndef build_features(df):\n    return df.dropna().copy()\n`,
                },
              ],
              quiz: {
                id: 'q-ai-1-2',
                question: 'لماذا نفضل العمليات الشعاعية في NumPy على حلقات for التقليدية؟',
                options: [
                  'لأنها تنفذ بلغة C على كتل ذاكرة متصلة مما يرفع السرعة عشرات المرات',
                  'لأنها تحفظ البيانات في PostgreSQL مباشرة',
                  'لأنها لا تحتاج استيراد مكتبات',
                ],
                correctIndex: 0,
                explanation: 'مكتبة NumPy تنفذ الحسابات على مصفوفات متجانسة في الذاكرة عبر لغة C.',
              },
            },
          ],
        },
        {
          id: 'ai-level-2',
          levelNumber: 2,
          title: 'المستوى الثاني: تعلم الآلة (Machine Learning)',
          subtitle: 'Scikit-Learn · Regression · Classification · Evaluation',
          hours: 40,
          tools: ['Scikit-Learn', 'XGBoost', 'Joblib'],
          deliverable: 'نموذج تصنيف وتوقع مدروس ومقيم بمقاييس F1-Score و RMSE',
          lessons: [
            {
              id: 'ai-l2-1',
              title: 'خوارزميات التوقع والتصنيف والتجميع بـ Scikit-Learn',
              durationMinutes: 40,
              durationLabel: '40:00',
              summary: 'فهم عملي لخوارزميات الانحدار والتصنيف والتجميع عبر Scikit-Learn واختبار دقة النماذج.',
              keyTakeaways: [
                'بناء أنابيب Scikit-Learn Pipeline لمنع تسرب البيانات',
                'مقارنة Random Forest و Logistic Regression و K-Means',
                'ضبط المعاملات الفائقة باستخدام Cross-Validation',
              ],
              codeLanguage: 'python',
              codeTitle: 'ml_classifier.py',
              codeSnippet: `from sklearn.pipeline import Pipeline\nfrom sklearn.preprocessing import StandardScaler\nfrom sklearn.ensemble import RandomForestClassifier\n\npipeline = Pipeline([("scaler", StandardScaler()), ("clf", RandomForestClassifier(n_estimators=200))])`,
              attachments: [
                {
                  name: 'كود تدريب وتقييم نماذج التصنيف',
                  fileName: 'sklearn_classification.py',
                  sizeLabel: '3.4 KB',
                  content: `from sklearn.linear_model import LogisticRegression\nprint("Ready")\n`,
                },
              ],
              quiz: {
                id: 'q-ai-2-1',
                question: 'لماذا نستخدم Pipeline في Scikit-Learn؟',
                options: [
                  'لمنع تسرب معلومات مجموعة الاختبار إلى مرحلة التدريب',
                  'لزيادة حجم الملف',
                  'لتحويل Python إلى Java',
                ],
                correctIndex: 0,
                explanation: 'Pipeline يضمن احتساب الإحصاءات على بيانات التدريب فقط.',
              },
            },
          ],
        },
        {
          id: 'ai-level-3',
          levelNumber: 3,
          title: 'المستوى الثالث: التعلم العميق وبناء النماذج بـ PyTorch',
          subtitle: 'Neural Networks · PyTorch · NLP · Computer Vision',
          hours: 48,
          tools: ['PyTorch', 'TorchVision', 'Transformers'],
          deliverable: 'تدريب شبكة عصبية عميقة باستخدام حلقة تدريب كاملة في PyTorch',
          lessons: [
            {
              id: 'ai-l3-1',
              title: 'تصميم الشبكات العصبية وحلقة التدريب في PyTorch',
              durationMinutes: 45,
              durationLabel: '45:00',
              summary: 'بناء معمارية الشبكة العصبية عبر nn.Module وتطبيقات NLP والرؤية الحاسوبية.',
              keyTakeaways: [
                'كتابة فئات PyTorch Module وتحديد الطبقات',
                'بناء حلقة التدريب Forward / Loss / Backward',
                'مراقبة خسارة التحقق وحفظ أفضل أوزان',
              ],
              codeLanguage: 'python',
              codeTitle: 'pytorch_network.py',
              codeSnippet: `import torch\nimport torch.nn as nn\n\nclass FinancialForecastNet(nn.Module):\n    def __init__(self, input_dim: int):\n        super().__init__()\n        self.net = nn.Sequential(nn.Linear(input_dim, 64), nn.ReLU(), nn.Linear(64, 1))\n    def forward(self, x):\n        return self.net(x)`,
              attachments: [
                {
                  name: 'نموذج PyTorch كامل مع حلقة التدريب',
                  fileName: 'train_pytorch.py',
                  sizeLabel: '5.1 KB',
                  content: `import torch\nprint(torch.__version__)\n`,
                },
              ],
              quiz: {
                id: 'q-ai-3-1',
                question: 'ما وظيفة استدعاء optimizer.zero_grad()؟',
                options: [
                  'تصفير التدرجات المتراكمة من الخطوة السابقة',
                  'حذف أوزان الشبكة',
                  'نقل النموذج إلى CPU',
                ],
                correctIndex: 0,
                explanation: 'PyTorch يراكم التدرجات افتراضياً لذا يجب تصفيرها كل دفعة.',
              },
            },
          ],
        },
        {
          id: 'ai-level-4',
          levelNumber: 4,
          title: 'المستوى الرابع: الذكاء الاصطناعي التوليدي والنماذج اللغوية (LLMs)',
          subtitle: 'Ollama · LM Studio · Claude & OpenAI APIs · Prompt Engineering',
          hours: 36,
          tools: ['Ollama', 'LM Studio', 'Claude API', 'OpenAI API', 'n8n'],
          deliverable: 'منظومة وكلاء وأتمتة ذكية تجمع بين النماذج المحلية والسحابية',
          lessons: [
            {
              id: 'ai-l4-1',
              title: 'تشغيل النماذج محلياً بـ Ollama وهندسة الأوامر والربط السحابي',
              durationMinutes: 36,
              durationLabel: '36:00',
              summary: 'تشغيل النماذج محلياً عبر Ollama و LM Studio والربط مع واجهات Claude API و OpenAI وأتمتة n8n.',
              keyTakeaways: [
                'تشغيل النماذج المكممة محلياً لخصوصية البيانات',
                'هندسة الأوامر وإلزام المخرجات بصيغة JSON',
                'ربط بوتات تيليجرام وسير عمل n8n',
              ],
              codeLanguage: 'python',
              codeTitle: 'local_llm_client.py',
              codeSnippet: `payload = {"model": "qwen2.5:7b", "prompt": "لخص التقرير المالي بصيغة JSON", "format": "json"}`,
              attachments: [
                {
                  name: 'قالب ربط Ollama و Claude API',
                  fileName: 'llm_bridge.py',
                  sizeLabel: '3.6 KB',
                  content: `PROVIDER = "ollama"\n`,
                },
              ],
              quiz: {
                id: 'q-ai-4-1',
                question: 'متى يفضل تشغيل النموذج محلياً عبر Ollama أو LM Studio؟',
                options: [
                  'عند التعامل مع بيانات مؤسسية حساسة تتطلب الخصوصية داخل الشبكة المحلية',
                  'عند عدم وجود حاسوب',
                  'لزيادة التكلفة السحابية',
                ],
                correctIndex: 0,
                explanation: 'التشغيل المحلي يبقي البيانات داخل بيئة المؤسسة.',
              },
            },
          ],
        },
        {
          id: 'ai-level-5',
          levelNumber: 5,
          title: 'المستوى الخامس: النشر وتطوير الواجهات الخلفية',
          subtitle: 'FastAPI · Ubuntu Server · Production Deployment',
          hours: 34,
          tools: ['FastAPI', 'Uvicorn', 'Nginx', 'Ubuntu Linux'],
          deliverable: 'تحويل النموذج إلى API إنتاجي مستقر على خادم Ubuntu',
          lessons: [
            {
              id: 'ai-l5-1',
              title: 'بناء واجهات FastAPI وإعداد خوادم Ubuntu للإنتاج',
              durationMinutes: 38,
              durationLabel: '38:00',
              summary: 'تغليف نماذج PyTorch داخل واجهات FastAPI وإعداد خدمات Systemd و Nginx على خوادم Ubuntu.',
              keyTakeaways: [
                'التحقق الصارم من المدخلات عبر Pydantic',
                'تحميل النموذج عند إقلاع الخدمة لتقليل زمن الاستجابة',
                'تهيئة Reverse Proxy وخدمة Systemd',
              ],
              codeLanguage: 'python',
              codeTitle: 'fastapi_inference.py',
              codeSnippet: `from fastapi import FastAPI\napp = FastAPI()\n@app.get("/health")\ndef health():\n    return {"status": "ok"}`,
              attachments: [
                {
                  name: 'ملف خدمة Systemd لخادم Ubuntu',
                  fileName: 'afaq-ai.service',
                  sizeLabel: '1.2 KB',
                  content: `[Service]\nExecStart=/opt/afaq-ai/.venv/bin/uvicorn main:app\n`,
                },
              ],
              quiz: {
                id: 'q-ai-5-1',
                question: 'أين يجب تحميل أوزان نموذج PyTorch داخل تطبيق FastAPI؟',
                options: [
                  'مرة واحدة عند إقلاع التطبيق وليس داخل كل طلب HTTP',
                  'داخل كل استدعاء endpoint من الصفر',
                  'في ملف CSS',
                ],
                correctIndex: 0,
                explanation: 'التحميل المسبق يحفظ الذاكرة ويضمن استجابة فورية.',
              },
            },
          ],
        },
        {
          id: 'ai-level-6',
          levelNumber: 6,
          title: 'المستوى السادس: مشاريع التخرج التطبيقية (Capstone)',
          subtitle: 'PyTorch Financial Forecast · FastAPI · Modern UI',
          hours: 38,
          tools: ['PyTorch', 'FastAPI', 'React', 'PostgreSQL', 'n8n'],
          deliverable: 'نظام متكامل لتحليل وتوقع البيانات المالية مربوط بواجهة حديثة',
          lessons: [
            {
              id: 'ai-l6-1',
              title: 'مشروع التخرج: نظام التوقع المالي الذكي المتكامل',
              durationMinutes: 50,
              durationLabel: '50:00',
              summary: 'الربط الكامل بين مسار البيانات، نموذج التوقع المبني بـ PyTorch، واجهة FastAPI، ولوحة العرض التفاعلية.',
              keyTakeaways: [
                'فصل طبقة البيانات والنموذج والواجهة',
                'اختبار التكامل الشامل',
                'توثيق المشروع للعرض أمام لجان التوظيف',
              ],
              codeLanguage: 'python',
              codeTitle: 'capstone_orchestrator.py',
              codeSnippet: `def run_financial_forecast(series: list[float]) -> dict:\n    return {"latest": series[-1], "trend": "صاعد"}`,
              attachments: [
                {
                  name: 'خطة تسليم مشروع التخرج الكاملة',
                  fileName: 'capstone_checklist.md',
                  sizeLabel: '2.4 KB',
                  content: `# قائمة التحقق\n1. البيانات\n2. PyTorch\n3. FastAPI\n`,
                },
              ],
              quiz: {
                id: 'q-ai-6-1',
                question: 'ما المعيار الأهم لنجاح مشروع التخرج في سوق العمل؟',
                options: [
                  'قدرة النظام على العمل كخدمة حقيقية متكاملة من البيانات وحتى واجهة المستخدم',
                  'بقاء الكود غير منشور',
                  'استخدام بيانات عشوائية',
                ],
                correctIndex: 0,
                explanation: 'المشروع المتكامل يثبت الجاهزية الهندسية الإنتاجية.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'red-teaming',
      kind: 'career',
      title: 'مسار الأمن السيبراني والتحقيق الرقمي ومنتجات Symantec',
      englishSubtitle: 'Red Teaming · Digital Forensics · Symantec Security',
      summary:
        'مسار شامل يغطي اختبار الاختراق الهجومي (Kali Linux, Metasploit, Web SQLi/XSS, Active Directory)، التحقيق الجنائي الرقمي واستخلاص الأدلة، وإدارة حلول الحماية المؤسسية من Symantec (Endpoint Protection & DLP).',
      image: '/src/assets/images/track_cyber_redteam_1794777831941.jpg',
      iconLabel: 'CYBER & SYMANTEC',
      priceSar: 3200,
      totalHours: 215,
      modulesCountLabel: '4 وحدات هجومية ودفاعية',
      levelLabel: 'دبلومة متقدمة · هجومي وجنائي',
      prerequisites: 'معرفة بأساسيات الشبكات وأنظمة التشغيل Linux',
      tools: ['Kali Linux', 'Metasploit', 'Nmap', 'Symantec SEP & DLP', 'Volatility Forensics', 'Python / Go'],
      certifications: ['مختبر اختراق هجومي Red Team', 'أخصائي التحقيق الجنائي الرقمي', 'إدارة منتجات Symantec المؤسسية'],
      capstoneTitle: 'محاكاة هجوم واستجابة جنائية وتطبيق سياسات Symantec DLP على بيئة مؤسسية',
      levels: [
        {
          id: 'cyber-level-1',
          levelNumber: 1,
          title: 'اختبار الاختراق الهجومي (Kali, Web App, Active Directory)',
          subtitle: 'Kali Linux · Nmap · Metasploit · SQLi/XSS · Kerberoasting',
          hours: 80,
          tools: ['Kali Linux', 'Nmap', 'Metasploit', 'Burp Suite'],
          deliverable: 'تقرير فحص ثغرات شامل واختراق معملي لبيئة Active Directory',
          lessons: [
            {
              id: 'cyber-l1-1',
              title: 'الاستطلاع النشط باستخدام Nmap وإدارة Metasploit',
              durationMinutes: 38,
              durationLabel: '38:00',
              summary: 'إتقان استكشاف المنافذ والخدمات النشطة في أنظمة Kali Linux والتحقق المنهجي من الثغرات المعروفة.',
              keyTakeaways: [
                'قراءة حالات المنافذ وبصمات الخدمات عبر Nmap',
                'هيكلة بيئة العمل في Metasploit',
                'الالتزام بقواعد الاشتباك الأخلاقي',
              ],
              codeLanguage: 'bash',
              codeTitle: 'nmap_recon.sh',
              codeSnippet: `#!/bin/bash\nTARGET="10.10.20.0/24"\nnmap -sV -sC -T4 -p 22,80,443,445,3389 $TARGET -oA lab_audit`,
              attachments: [
                {
                  name: 'مرجع أوامر Nmap للمختبرات',
                  fileName: 'nmap_cheatsheet.txt',
                  sizeLabel: '1.9 KB',
                  content: `nmap -sV -sC <target>\n`,
                },
              ],
              quiz: {
                id: 'q-cyber-1-1',
                question: 'ماذا يقدم الخيار -sV عند تنفيذ فحص Nmap؟',
                options: [
                  'تحديد اسم وإصدار الخدمة العاملة على كل منفذ مفتوح',
                  'تشفير حركة المرور',
                  'إيقاف جدار الحماية',
                ],
                correctIndex: 0,
                explanation: 'الخيار -sV يستجوب المنافذ المفتوحة لتحديد إصدار البرنامج الدقيق.',
              },
            },
            {
              id: 'cyber-l1-2',
              title: 'ثغرات الويب (SQLi & XSS) وهجمات Active Directory',
              durationMinutes: 42,
              durationLabel: '42:00',
              summary: 'تحليل حقن قواعد البيانات وهجمات Kerberoasting و Pass-the-Hash وكيفية تحصينها.',
              keyTakeaways: [
                'استخدام الاستعلامات المعلمة Prepared Statements',
                'تحليل مسارات Active Directory وحسابات gMSA',
                'تطوير أدوات الفحص بلغة Python و Go',
              ],
              codeLanguage: 'python',
              codeTitle: 'safe_query_audit.py',
              codeSnippet: `def find_user_safe(cursor, email: str):\n    cursor.execute("SELECT id, role FROM users WHERE email = ?", (email,))\n    return cursor.fetchone()`,
              attachments: [
                {
                  name: 'دليل فحص ثغرات الويب و Active Directory',
                  fileName: 'web_ad_notes.md',
                  sizeLabel: '2.7 KB',
                  content: `# قائمة فحص الويب و AD\n- SQLi / XSS\n- gMSA Hardening\n`,
                },
              ],
              quiz: {
                id: 'q-cyber-1-2',
                question: 'ما الحل الجذري لمنع ثغرات SQL Injection في الكود المصدري؟',
                options: [
                  'استخدام الاستعلامات المعلمة (Parameterized Statements)',
                  'تلوين الحقول في CSS',
                  'تغيير منفذ الويب',
                ],
                correctIndex: 0,
                explanation: 'الاستعلامات المعلمة تفصل بنية SQL عن مدخلات المستخدم.',
              },
            },
          ],
        },
        {
          id: 'cyber-level-2',
          levelNumber: 2,
          title: 'التحقيق الجنائي الرقمي ومنتجات الحماية Symantec',
          subtitle: 'Digital Forensics · Volatility · Symantec Endpoint & DLP',
          hours: 85,
          tools: ['Symantec SEP', 'Symantec DLP', 'Volatility', 'Autopsy'],
          deliverable: 'بناء سياسة منع تسرب البيانات Symantec DLP وتقرير تحليل جنائي للذاكرة',
          lessons: [
            {
              id: 'cyber-l2-1',
              title: 'إدارة منتجات Symantec (Endpoint Protection & DLP) والتحقيق الجنائي',
              durationMinutes: 46,
              durationLabel: '46:00',
              summary: 'نشر وإدارة سياسات Symantec لحماية نقاط النهاية ومنع تسرب البيانات الحساسة، مع تحليل الأدلة الرقمية في الذاكرة عبر Volatility.',
              keyTakeaways: [
                'إعداد خادم Symantec Endpoint Protection Manager وسياسات العزل',
                'صياغة قواعد Symantec DLP لحماية السجلات المالية والبيانات الحساسة',
                'تحليل صور الذاكرة العشوائية RAM وكشف العمليات الخفية جنائياً',
              ],
              codeLanguage: 'bash',
              codeTitle: 'forensics_volatility.sh',
              codeSnippet: `# تحليل صورة الذاكرة العشوائية لاستخلاص العمليات والاتصالات المشبوهة\npython3 vol.py -f memory_dump.raw windows.pslist\npython3 vol.py -f memory_dump.raw windows.netscan`,
              attachments: [
                {
                  name: 'دليل التحقيق الجنائي وإعداد Symantec SEP/DLP',
                  fileName: 'symantec_forensics_playbook.md',
                  sizeLabel: '3.2 KB',
                  content: `# منتجات Symantec والتحقيق الرقمي\n1. سياسات SEP\n2. قواعد DLP\n3. تحليل الذاكرة\n`,
                },
              ],
              quiz: {
                id: 'q-cyber-2-1',
                question: 'ما الوظيفة الأساسية لأنظمة Symantec DLP داخل المؤسسات؟',
                options: [
                  'رصد ومنع تسرب البيانات الحساسة عبر البريد والويب ووحدات التخزين',
                  'توجيه حزم OSPF بين الموجهات',
                  'تدريب الشبكات العصبية في PyTorch',
                ],
                correctIndex: 0,
                explanation: 'حلول DLP (Data Loss Prevention) تراقب وتمنع انتقال البيانات المصنفة خارج السياسة المعتمدة.',
              },
            },
          ],
        },
        {
          id: 'cyber-awareness',
          levelNumber: 3,
          title: 'حملات التوعية والتثقيف الأمني (المحاضرات المفتوحة)',
          subtitle: 'Zero-Click / Pegasus · Deepfakes · SolarWinds Supply Chain',
          hours: 25,
          tools: ['Threat Intelligence', 'Incident Analysis', 'Media Forensics'],
          deliverable: 'بروتوكول استجابة مؤسسي ضد الهندسة الاجتماعية وهجمات سلسلة التوريد',
          lessons: [
            {
              id: 'aware-zero-click',
              title: 'أسلحة التجسس الصفرية (Zero-Click) ودراسة حالة Pegasus',
              durationMinutes: 25,
              durationLabel: '25:00',
              summary: 'تحليل تقني لكيفية اختراق الأجهزة عبر ثغرات المعالجة التلقائية للوسائط دون أي نقرة.',
              keyTakeaways: [
                'فهم مسطح الهجوم في معالجات الصور والرسائل',
                'آلية Sandbox Escape',
                'تفعيل نمط الحماية القصوى Lockdown Mode',
              ],
              codeLanguage: 'text',
              codeTitle: 'zero_click_indicators.txt',
              codeSnippet: `1. مراجعة سجلات الانهيار لخدمات الوسائط.\n2. رصد الاتصالات الصادرة غير المألوفة.\n3. تفعيل Lockdown Mode وتحديث النظام فوراً.`,
              attachments: [
                {
                  name: 'ملخص التوعية ضد هجمات Zero-Click',
                  fileName: 'zero_click_briefing.md',
                  sizeLabel: '2.0 KB',
                  content: `# أسلحة التجسس الصفرية\nأهمية تحديث أنظمة التشغيل.\n`,
                },
              ],
              quiz: {
                id: 'q-aware-1',
                question: 'ما الذي يميز هجمات Zero-Click عن التصيد التقليدي؟',
                options: [
                  'لا تتطلب من المستخدم الضغط على رابط أو فتح مرفق لتنفيذ الاختراق',
                  'تعمل فقط عبر المكالمات اليدوية',
                  'تتطلب موافقة مدير الشبكة',
                ],
                correctIndex: 0,
                explanation: 'تستغل ثغرات معالجة الحزم الواردة تلقائياً.',
              },
            },
            {
              id: 'aware-deepfakes',
              title: 'التزييف العميق (Deepfakes) والهندسة الاجتماعية بالذكاء الاصطناعي',
              durationMinutes: 24,
              durationLabel: '24:00',
              summary: 'كيف تُستخدم تقنيات استنساخ الصوت والفيديو في انتحال هوية القيادات لخداع المؤسسات.',
              keyTakeaways: [
                'تشريح حملات انتحال الصوت والفيديو المباشر',
                'تطبيق التحقق خارج النطاق Out-of-Band',
                'تدريب الفرق المالية على إشارات الاشتباه',
              ],
              codeLanguage: 'text',
              codeTitle: 'deepfake_defense_protocol.txt',
              codeSnippet: `- حظر الموافقات المالية بناءً على مكالمة منفردة.\n- اعتماد كلمة تحقق مسبقة للطلبات الطارئة.`,
              attachments: [
                {
                  name: 'دليل التحقق المؤسسي ضد Deepfakes',
                  fileName: 'deepfake_protocol.md',
                  sizeLabel: '1.8 KB',
                  content: `# مكافحة التزييف العميق\nالتحقق ثنائي القنوات.\n`,
                },
              ],
              quiz: {
                id: 'q-aware-2',
                question: 'ما الإجراء التنظيمي الأضمن لإحباط احتيال بصوت مدير مستنسخ؟',
                options: [
                  'إلزامية التحقق عبر قناة ثانية مستقلة وموافقات متعددة الأطراف',
                  'الاعتماد على وضوح الصوت فقط',
                  'تنفيذ التحويل فوراً',
                ],
                correctIndex: 0,
                explanation: 'التحقق خارج النطاق يكسر سيناريو الانتحال الفوري.',
              },
            },
            {
              id: 'aware-supply-chain',
              title: 'هجمات سلسلة التوريد (Supply Chain): دراسة حالة SolarWinds',
              durationMinutes: 27,
              durationLabel: '27:00',
              summary: 'دراسة تفصيلية لاختراق حزم التحديث الموثوقة في حادثة SolarWinds ومعايير تأمين التبعيات.',
              keyTakeaways: [
                'تحول التحديث الموقع رقمياً إلى باب خلفي',
                'إنشاء قوائم مكونات البرمجيات SBOM',
                'تأمين خوادم البناء CI/CD',
              ],
              codeLanguage: 'bash',
              codeTitle: 'sbom_verify.sh',
              codeSnippet: `sha256sum -c release_checksums.sha256 --strict`,
              attachments: [
                {
                  name: 'دراسة حالة SolarWinds ومبادئ SBOM',
                  fileName: 'solarwinds_case_study.md',
                  sizeLabel: '2.3 KB',
                  content: `# هجمات سلسلة التوريد\nفحص بيئات CI/CD وقوائم SBOM.\n`,
                },
              ],
              quiz: {
                id: 'q-aware-3',
                question: 'لماذا تُعد هجمات سلسلة التوريد بالغة الخطورة؟',
                options: [
                  'لأنها تتسلل عبر تحديثات رسمية موقعة رقمياً يثق بها العملاء تلقائياً',
                  'لأنها تصيب الأجهزة غير المتصلة بالشبكة',
                  'لأنها تؤثر على الألوان فقط',
                ],
                correctIndex: 0,
                explanation: 'استغلال قناة التحديث الرسمية يتجاوز الدفاعات المحيطية.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'network-infra',
      kind: 'career',
      title: 'مسار هندسة الشبكات والبنية التحتية (Cisco & Huawei)',
      englishSubtitle: 'CompTIA Network+ · Cisco (CCNA/CCNP/CCIE) · Huawei & Juniper',
      summary:
        'تأهيل هندسي متكامل يبدأ من تأسيس الشبكات عبر CompTIA Network+، مروراً بمسار Cisco الكامل (CCNA R&S, CCNP, CCIE)، وصولاً إلى مسارات البنية التحتية للشبكات الكبرى على أنظمة Huawei و Juniper مع إدارة الخوادم والمحاكاة.',
      image: '/src/assets/images/track_network_infra_1794777831897.jpg',
      iconLabel: 'CISCO & HUAWEI',
      priceSar: 2950,
      totalHours: 220,
      modulesCountLabel: '4 مسارات شهادات دولية',
      levelLabel: 'من التأسيس إلى CCIE والبنية التحتية',
      prerequisites: 'لا يشترط خبرة مسبقة — يبدأ من CompTIA Network+',
      tools: ['CompTIA Network+', 'Cisco CCNA/CCNP/CCIE', 'Huawei HCIA/HCIP', 'Juniper JNCIA/JNCIS', 'GNS3 & Wireshark'],
      certifications: ['CompTIA Network+', 'Cisco: CCNA R&S, CCNP, CCIE', 'Huawei (HCIA/HCIP)', 'Juniper (JNCIA/JNCIS)'],
      capstoneTitle: 'تصميم وتأمين بنية شبكة مؤسسية هجينة (Cisco + Huawei + Juniper) متعددة الفروع',
      levels: [
        {
          id: 'net-level-1',
          levelNumber: 1,
          title: 'تأسيس الشبكات: CompTIA Network+',
          subtitle: 'OSI Model · TCP/IP · Subnetting · Physical & Wireless',
          hours: 45,
          tools: ['CompTIA Network+', 'Wireshark', 'Packet Tracer'],
          deliverable: 'مخطط عنونة IPv4/IPv6 متكامل وتشخيص أعطال الشبكات الأساسية',
          lessons: [
            {
              id: 'net-l1-0',
              title: 'بنية CompTIA Network+ وعنونة الشبكات الفرعية (Subnetting)',
              durationMinutes: 35,
              durationLabel: '35:00',
              summary: 'إتقان طبقات نموذج OSI وبروتوكولات TCP/IP وتقسيم الشبكات الفرعية وفق منهج CompTIA Network+ المعتمد.',
              keyTakeaways: [
                'حساب أقنعة الشبكات الفرعية VLSM و CIDR بدقة',
                'فهم بروتوكولات ARP و DHCP و DNS و ICMP',
                'تحليل حركة الشبكة الأولية باستخدام Wireshark',
              ],
              codeLanguage: 'text',
              codeTitle: 'comptia_subnetting_plan.txt',
              codeSnippet: `172.16.0.0/22 -> قسم الإدارة 172.16.0.0/24 | المختبر 172.16.1.0/24 | الخوادم 172.16.2.0/26`,
              attachments: [
                {
                  name: 'ملخص شهادة CompTIA Network+ العملي',
                  fileName: 'comptia_network_plus_guide.md',
                  sizeLabel: '2.4 KB',
                  content: `# CompTIA Network+\n- طبقات OSI السبع\n- تقسيم VLSM\n`,
                },
              ],
              quiz: {
                id: 'q-net-1-0',
                question: 'كم عدد عناوين الأجهزة القابلة للتعيين في شبكة فرعية بقناع /26؟',
                options: ['62 عنواناً', '126 عنواناً', '30 عنواناً'],
                correctIndex: 0,
                explanation: 'قناع /26 يترك 6 بتات للمضيفين (2^6 - 2 = 62 عنواناً صالحاً).',
              },
            },
          ],
        },
        {
          id: 'net-level-2',
          levelNumber: 2,
          title: 'مسار Cisco الكامل: (CCNA R&S, CCNP, CCIE)',
          subtitle: 'Cisco IOS · OSPF · EIGRP · BGP · MPLS',
          hours: 85,
          tools: ['CCNA R&S', 'CCNP Enterprise', 'CCIE Lab', 'GNS3'],
          deliverable: 'نشر شبكة نواة مؤسسية بتوجيه OSPF و BGP وتوافر عالٍ HSRP/VRRP',
          lessons: [
            {
              id: 'net-l1-1',
              title: 'التوجيه والتبديل المتقدم من CCNA R&S إلى CCNP و CCIE',
              durationMinutes: 44,
              durationLabel: '44:00',
              summary: 'بناء شبكات VLANs وتوجيه OSPF متعدد المناطق وبروتوكول BGP وفق مسار Cisco (CCNA R&S, CCNP, CCIE).',
              keyTakeaways: [
                'إتقان STP/RSTP و EtherChannel و Inter-VLAN Routing',
                'بناء مناطق OSPF المتعددة وسياسات BGP في CCNP',
                'تصميم معماريات MPLS والتعافي السريع على مستوى CCIE',
              ],
              codeLanguage: 'text',
              codeTitle: 'cisco_ccnp_ospf_bgp.cfg',
              codeSnippet: `router ospf 1\n network 192.168.10.0 0.0.0.255 area 0\nrouter bgp 65100\n neighbor 10.0.0.2 remote-as 65200`,
              attachments: [
                {
                  name: 'مختبر Cisco CCNA/CCNP/CCIE العملي',
                  fileName: 'cisco_enterprise_lab.cfg',
                  sizeLabel: '2.1 KB',
                  content: `hostname Afaq-CCIE-Core\nrouter ospf 1\n`,
                },
              ],
              quiz: {
                id: 'q-net-1-1',
                question: 'ما البروتوكول المسؤول عن تبادل المسارات بين الأنظمة المستقلة؟',
                options: ['بروتوكول BGP', 'بروتوكول ARP', 'بروتوكول DHCP'],
                correctIndex: 0,
                explanation: 'بروتوكول BGP هو بروتوكول التوجيه القياسي بين الأنظمة المستقلة.',
              },
            },
          ],
        },
        {
          id: 'net-level-3',
          levelNumber: 3,
          title: 'مسارات البنية التحتية: Huawei و Juniper',
          subtitle: 'Huawei VRP (HCIA/HCIP) · Juniper Junos OS',
          hours: 50,
          tools: ['Huawei VRP', 'Juniper Junos OS', 'GNS3'],
          deliverable: 'تكوين موجهات Huawei VRP و Juniper Junos في بيئة متعددة الموردين',
          lessons: [
            {
              id: 'net-l3-1',
              title: 'إدارة البنية التحتية على أنظمة Huawei VRP و Juniper Junos OS',
              durationMinutes: 40,
              durationLabel: '40:00',
              summary: 'تطبيق الأوامر الهندسية على أجهزة Huawei (HCIA/HCIP) وموجهات Juniper (JNCIA/JNCIS).',
              keyTakeaways: [
                'إعداد الواجهات والتوجيه في نظام Huawei VRP',
                'تطبيق commit check و rollback في Juniper Junos OS',
                'دمج أجهزة Cisco و Huawei و Juniper',
              ],
              codeLanguage: 'text',
              codeTitle: 'huawei_juniper_core.cfg',
              codeSnippet: `system-view\nsysname Afaq-Huawei-Core\nset protocols ospf area 0.0.0.0 interface ge-0/0/0.0\ncommit confirmed 5`,
              attachments: [
                {
                  name: 'دليل أوامر Huawei VRP و Juniper Junos',
                  fileName: 'huawei_juniper_reference.txt',
                  sizeLabel: '2.5 KB',
                  content: `# Huawei: display ip routing-table\n# Juniper: show route\n`,
                },
              ],
              quiz: {
                id: 'q-net-3-1',
                question: 'ما ميزة أمر commit confirmed في نظام Juniper Junos OS؟',
                options: [
                  'يتراجع عن التعديلات تلقائياً إذا لم يؤكد المهندس بقاء الاتصال',
                  'يمسح نظام التشغيل',
                  'يحول الأوامر إلى Windows',
                ],
                correctIndex: 0,
                explanation: 'أمر commit confirmed يحمي من انقطاع الوصول عن بُعد.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'bigdata-db',
      kind: 'career',
      title: 'مسار تحليل قواعد البيانات والبيانات الضخمة (Big Data)',
      englishSubtitle: 'Oracle · PostgreSQL · Apache Spark & Hadoop · Data Warehousing',
      summary:
        'تأهيل متخصص في تصميم وإدارة قواعد البيانات العلائقية (Oracle & PostgreSQL)، وهندسة البيانات الضخمة عبر منظومة Apache Hadoop و Apache Spark وبناء مستودعات البيانات ولوحات التحليل التنبؤية.',
      image: '/src/assets/images/track_ai_engineering_1794777830795.jpg',
      iconLabel: 'BIG DATA & DB',
      priceSar: 2800,
      totalHours: 165,
      modulesCountLabel: '3 مستويات تحليل وهندسة',
      levelLabel: 'متخصص في البيانات الضخمة والقواعد',
      prerequisites: 'إلمام بأساسيات الجداول والمنطق البرمجي',
      tools: ['SQL / PL-SQL', 'Oracle Database', 'PostgreSQL', 'Apache Spark', 'Apache Hadoop', 'Power BI'],
      certifications: ['إدارة وتحليل قواعد البيانات Oracle / SQL', 'مهندس البيانات الضخمة Apache Spark & Hadoop'],
      capstoneTitle: 'بناء مستودع بيانات ضخم (Data Lakehouse) وتحليل ملايين السجلات بـ PySpark',
      levels: [
        {
          id: 'bd-level-1',
          levelNumber: 1,
          title: 'تصميم وتحليل قواعد البيانات (SQL, Oracle & PostgreSQL)',
          subtitle: 'Relational Modeling · Indexing · Query Optimization',
          hours: 65,
          tools: ['PostgreSQL', 'Oracle DB', 'SQL'],
          deliverable: 'تصميم قاعدة بيانات مؤسسية محسنة الفهارس والاستعلامات',
          lessons: [
            {
              id: 'bd-l1-1',
              title: 'تحسين استعلامات SQL وبناء الفهارس المتقدمة',
              durationMinutes: 36,
              durationLabel: '36:00',
              summary: 'تصميم الجداول المعيارية، استخدام Window Functions، وقراءة خطط التنفيذ EXPLAIN ANALYZE في Oracle و PostgreSQL.',
              keyTakeaways: [
                'كتابة استعلامات تحليلية عبر Window Functions و CTEs',
                'اختيار الفهارس المناسبة لتسريع الاستعلامات الكبيرة',
                'تصميم التجزئة (Table Partitioning) للبيانات التاريخية',
              ],
              codeLanguage: 'sql',
              codeTitle: 'analytics_window_queries.sql',
              codeSnippet: `WITH monthly_totals AS (\n  SELECT department_id, DATE_TRUNC('month', created_at) AS month, SUM(amount) AS total_sales\n  FROM financial_ledger\n  GROUP BY 1, 2\n)\nSELECT department_id, month, total_sales,\n  RANK() OVER (PARTITION BY month ORDER BY total_sales DESC) AS rank_in_month\nFROM monthly_totals;`,
              attachments: [
                {
                  name: 'مرجع استعلامات SQL التحليلية',
                  fileName: 'sql_window_functions.sql',
                  sizeLabel: '2.2 KB',
                  content: `SELECT department_id, COUNT(*) FROM financial_ledger GROUP BY department_id;\n`,
                },
              ],
              quiz: {
                id: 'q-bd-1-1',
                question: 'ما الفائدة الرئيسية من دوال النوافذ (Window Functions) في SQL التحليلية؟',
                options: [
                  'حساب المجاميع والترتيب عبر صفوف مرتبطة دون دمج الصفوف الأصلية كما تفعل GROUP BY',
                  'حذف الفهارس من الجدول',
                  'تغيير كلمة مرور مدير قاعدة البيانات',
                ],
                correctIndex: 0,
                explanation: 'دوال النوافذ تحافظ على تفاصيل كل صف مع حساب التراكم والترتيب اللحظي.',
              },
            },
          ],
        },
        {
          id: 'bd-level-2',
          levelNumber: 2,
          title: 'هندسة البيانات الضخمة (Apache Hadoop & Apache Spark)',
          subtitle: 'HDFS · PySpark · Data Lakes · Distributed Processing',
          hours: 100,
          tools: ['Apache Spark', 'PySpark', 'Hadoop HDFS', 'Parquet'],
          deliverable: 'معالجة وتجميع ملايين السجلات الموزعة بصيغة Parquet عبر PySpark',
          lessons: [
            {
              id: 'bd-l2-1',
              title: 'المعالجة الموزعة للبيانات الضخمة باستخدام PySpark',
              durationMinutes: 42,
              durationLabel: '42:00',
              summary: 'توزيع المعالجة على عناقيد Apache Spark، قراءة ملفات Parquet الضخمة، وبناء خطوط التحويل الموزعة.',
              keyTakeaways: [
                'فهم معمارية Spark Driver و Executors ومفهوم Lazy Evaluation',
                'القراءة والكتابة بكفاءة عالية بصيغة Apache Parquet',
                'ربط مخرجات البيانات الضخمة بلوحات التحليل والذكاء الاصطناعي',
              ],
              codeLanguage: 'python',
              codeTitle: 'pyspark_bigdata_job.py',
              codeSnippet: `from pyspark.sql import SparkSession\nfrom pyspark.sql.functions import col, sum as spark_sum\n\nspark = SparkSession.builder.appName("AfaqBigDataJob").getOrCreate()\ndf = spark.read.parquet("hdfs:///data/transactions.parquet")\nsummary = df.filter(col("status") == "COMPLETED").groupBy("region").agg(spark_sum("amount").alias("revenue"))\nsummary.show()`,
              attachments: [
                {
                  name: 'كود معالجة البيانات الضخمة بـ PySpark',
                  fileName: 'spark_etl_job.py',
                  sizeLabel: '3.0 KB',
                  content: `# PySpark Distributed Job Template\nprint("Spark ETL Ready")\n`,
                },
              ],
              quiz: {
                id: 'q-bd-2-1',
                question: 'لماذا تُفضل صيغة Apache Parquet في تخزين البيانات الضخمة؟',
                options: [
                  'لأنها صيغة تخزين عمودية (Columnar) تضغط البيانات وتسرّع استعلامات التحليل بشكل هائل',
                  'لأنها ملفات نصية غير مضغوطة',
                  'لأنها تعمل على متصفح الويب فقط',
                ],
                correctIndex: 0,
                explanation: 'التخزين العمودي يتيح قراءة الأعمدة المطلوبة فقط مع ضغط عالٍ يقلل الإدخال والإخراج.',
              },
            },
          ],
        },
      ],
    },
    {
      id: 'skill-pytorch',
      kind: 'skill',
      title: 'تطوير الشبكات العصبية بـ PyTorch',
      englishSubtitle: 'PyTorch Deep Learning Skill Track',
      summary: 'تركيز عملي مكثف على تصميم وتدريب وتصدير الشبكات العصبية باستخدام PyTorch.',
      image: '/src/assets/images/track_ai_engineering_1794777830795.jpg',
      iconLabel: 'PYTORCH',
      priceSar: 690,
      totalHours: 24,
      modulesCountLabel: '6 مختبرات مركزة',
      levelLabel: 'مهارة تخصصية · متوسط',
      prerequisites: 'أساسيات Python و NumPy',
      tools: ['PyTorch', 'Autograd', 'TorchScript'],
      certifications: ['شهادة إتمام مهارية في PyTorch'],
      capstoneTitle: 'تدريب نموذج تنبؤي مالي وحفظ أوزانه للإنتاج',
      levels: [],
    },
    {
      id: 'skill-symantec',
      kind: 'skill',
      title: 'حماية المؤسسات بمنتجات Symantec والتحقيق الرقمي',
      englishSubtitle: 'Symantec Endpoint & DLP Skill Track',
      summary: 'إتقان إدارة Symantec SEP & DLP وبناء سياسات منع تسرب البيانات والتحقيق الجنائي.',
      image: '/src/assets/images/track_cyber_redteam_1794777831941.jpg',
      iconLabel: 'SYMANTEC',
      priceSar: 750,
      totalHours: 26,
      modulesCountLabel: '5 مختبرات مؤسسية',
      levelLabel: 'مهارة تخصصية · دفاعي',
      prerequisites: 'أساسيات الشبكات وأنظمة Windows/Linux',
      tools: ['Symantec SEP', 'Symantec DLP', 'Volatility'],
      certifications: ['شهادة أخصائي حلول Symantec'],
      capstoneTitle: 'بناء سياسة حماية شاملة ضد تسرب البيانات',
      levels: [],
    },
  ];

  const coursePosters: CoursePoster[] = [
    {
      id: 'poster-ccna',
      trackId: 'network-infra',
      trackCategory: 'مسار الشبكات والبنية التحتية',
      vendorName: 'Cisco Systems',
      vendorCode: 'CISCO',
      vendorLogoUrl: '',
      title: 'شهادة مهندس الشبكات المعتمد CCNA R&S',
      studyDuration: '60 ساعة · 8 أسابيع',
      lectureTimes: 'الأحد والثلاثاء · 07:00 م - 09:30 م',
      examCode: '200-301 CCNA',
      certificateType: 'شهادة دولية معتمدة + شهادة المعهد',
      priceSar: 1450,
      summary: 'تأسيس وتطبيق بروتوكولات التوجيه والتبديل و VLANs و OSPF وتأمين الشبكات على أجهزة Cisco.',
    },
    {
      id: 'poster-symantec',
      trackId: 'red-teaming',
      trackCategory: 'الأمن السيبراني ومنتجات Symantec',
      vendorName: 'Symantec Enterprise',
      vendorCode: 'SYMANTEC',
      vendorLogoUrl: '',
      title: 'إدارة أمن المؤسسات ومنع تسرب البيانات Symantec DLP & SEP',
      studyDuration: '45 ساعة · 6 أسابيع',
      lectureTimes: 'الإثنين والأربعاء · 06:30 م - 09:00 م',
      examCode: 'SYM-250-550',
      certificateType: 'شهادة تخصصية دولية + تطبيق عملي',
      priceSar: 1650,
      summary: 'بناء سياسات الحماية المركزية لنقاط النهاية ومكافحة تسرب البيانات والتحقيق الجنائي في الحوادث.',
    },
    {
      id: 'poster-huawei',
      trackId: 'network-infra',
      trackCategory: 'مسار البنية التحتية للشبكات',
      vendorName: 'Huawei ICT Academy',
      vendorCode: 'HUAWEI',
      vendorLogoUrl: '',
      title: 'هندسة البنية التحتية للشبكات Huawei HCIA & HCIP',
      studyDuration: '50 ساعة · 6 أسابيع',
      lectureTimes: 'الثلاثاء والخميس · 05:00 م - 07:30 م',
      examCode: 'H12-811 / H12-821',
      certificateType: 'شهادة اعتماد دولية من Huawei',
      priceSar: 1550,
      summary: 'إدارة موجهات ومبدلات Huawei VRP وبناء الشبكات الأساسية للمؤسسات ومزودي الخدمة.',
    },
    {
      id: 'poster-python-ai',
      trackId: 'ai-engineering',
      trackCategory: 'مسار البرمجة والذكاء الاصطناعي',
      vendorName: 'Python & PyTorch Lab',
      vendorCode: 'PYTHON',
      vendorLogoUrl: '',
      title: 'البرمجة بـ Python وبناء نماذج PyTorch والنماذج اللغوية',
      studyDuration: '80 ساعة · 10 أسابيع',
      lectureTimes: 'الأحد والأربعاء · 07:30 م - 10:00 م',
      examCode: 'PCAP-31-03 / AI-PRO',
      certificateType: 'دبلوم تطبيقي + مشروع تخرج مالي',
      priceSar: 1850,
      summary: 'من تأسيس بايثون وتحليل البيانات بـ Pandas إلى تدريب الشبكات العصبية ونشرها عبر FastAPI.',
    },
    {
      id: 'poster-bigdata',
      trackId: 'bigdata-db',
      trackCategory: 'قواعد البيانات والبيانات الضخمة',
      vendorName: 'Oracle & Apache Spark',
      vendorCode: 'BIGDATA',
      vendorLogoUrl: '',
      title: 'تحليل قواعد البيانات Oracle/SQL وهندسة البيانات الضخمة Spark',
      studyDuration: '65 ساعة · 8 أسابيع',
      lectureTimes: 'الإثنين والخميس · 07:00 م - 09:30 م',
      examCode: '1Z0-071 / SPARK-DE',
      certificateType: 'شهادة هندسة البيانات الضخمة',
      priceSar: 1600,
      summary: 'إدارة قواعد بيانات Oracle و PostgreSQL ومعالجة ملايين السجلات عبر Hadoop و Apache Spark.',
    },
    {
      id: 'poster-comptia',
      trackId: 'network-infra',
      trackCategory: 'تأسيس الشبكات والأمن',
      vendorName: 'CompTIA & Juniper',
      vendorCode: 'COMPTIA',
      vendorLogoUrl: '',
      title: 'تأسيس الشبكات الدولي CompTIA Network+ و Juniper JNCIA',
      studyDuration: '48 ساعة · 6 أسابيع',
      lectureTimes: 'السبت والثلاثاء · 04:00 م - 06:30 م',
      examCode: 'N10-009 / JN0-105',
      certificateType: 'شهادة دولية تأسيسية معتمدة',
      priceSar: 1250,
      summary: 'مدخل احترافي شامل لبروتوكولات الشبكات وعنونة IP وتكوين أنظمة Juniper Junos OS.',
    },
  ];

  const schedules: LectureSchedule[] = [
    {
      id: 'sch-1',
      trackId: 'ai-engineering',
      trackTitle: 'مسار لغات البرمجة والذكاء الاصطناعي',
      title: 'محاضرة PyTorch وبناء الشبكات العصبية',
      dayOfWeek: 'الأحد والثلاثاء',
      timeRange: '07:00 م - 09:30 م',
      instructor: 'م. طارق السديري',
      mode: 'مدمج',
    },
    {
      id: 'sch-2',
      trackId: 'red-teaming',
      trackTitle: 'مسار الأمن السيبراني ومنتجات Symantec',
      title: 'مختبر التحقيق الجنائي ومنع التسرب Symantec DLP',
      dayOfWeek: 'الإثنين والأربعاء',
      timeRange: '06:30 م - 09:00 م',
      instructor: 'م. نواف القحطاني',
      mode: 'حضوري',
    },
    {
      id: 'sch-3',
      trackId: 'network-infra',
      trackTitle: 'مسار هندسة الشبكات (Cisco & Huawei)',
      title: 'ورشة Cisco CCNP و Huawei HCIP و Juniper',
      dayOfWeek: 'الثلاثاء والخميس',
      timeRange: '05:00 م - 07:30 م',
      instructor: 'م. عبدالله الشهري',
      mode: 'عن بُعد',
    },
  ];

  const accreditations: AccreditationCert[] = [
    {
      id: 'acc-1',
      title: 'اعتماد التدريب التقني والمهني للبرامج التخصصية',
      issuer: 'هيئة الاعتماد التقني الخليجي',
      licenseNumber: 'AK-TVTC-2026-8841',
      issueYear: '2026',
      imageUrl: '/src/assets/images/hero_institute_campus_1794777831597.jpg',
    },
    {
      id: 'acc-2',
      title: 'شراكة أكاديمية للشبكات (CompTIA / Cisco / Huawei / Juniper)',
      issuer: 'التحالف الأكاديمي للشبكات والبنية التحتية',
      licenseNumber: 'AK-NET-PARTNER-409',
      issueYear: '2026',
      imageUrl: '/src/assets/images/track_network_infra_1794777831897.jpg',
    },
    {
      id: 'acc-3',
      title: 'اعتماد مختبرات الأمن السيبراني ومنتجات Symantec والذكاء الاصطناعي',
      issuer: 'مجلس معايير الأمن السيبراني التطبيقي',
      licenseNumber: 'AK-CYBER-AI-912',
      issueYear: '2026',
      imageUrl: '/src/assets/images/awareness_deepfake_security_1794777832779.jpg',
    },
  ];

  const pricingPlans: PricingPlan[] = [
    {
      id: 'plan-starter',
      name: 'الباقة الأساسية (مسار واحد)',
      audienceLabel: 'للمتعلم الفردي وبداية المسار',
      priceSar: 1450,
      billingCycle: 'دفعة واحدة · وصول 6 أشهر',
      summary: 'وصول كامل لمسار مهني واحد من اختيارك مع المختبرات التطبيقية وملفات الأكواد.',
      highlighted: false,
      trackScope: 'مسار مهني واحد (البرمجة والذكاء الاصطناعي، الأمن السيبراني، الشبكات، أو Big Data)',
      features: [
        'دخول كامل لجميع مستويات ودروس المسار المختار',
        'تنزيل كافة الأكواد وملفات التكوين والمشاريع',
        'حضور المحاضرات المباشرة الأسبوعية عبر المنصة',
        'شهادة إتمام مسار موثقة برقم مرجعي',
      ],
    },
    {
      id: 'plan-pro',
      name: 'الباقة الاحترافية الشاملة',
      audienceLabel: 'لبناء ملف مهني متكامل وسوق العمل',
      priceSar: 3290,
      billingCycle: 'اشتراك سنوي كامل',
      summary: 'وصول مفتوح لجميع المسارات الأربعة (الذكاء الاصطناعي، الأمن السيبراني و Symantec، الشبكات، والبيانات الضخمة).',
      highlighted: true,
      trackScope: 'جميع المسارات المهنية الأربعة + جميع بوسترات الدورات',
      features: [
        'تفعيل جميع المسارات (Python/C/Java/AI، Cyber/Symantec، Cisco/Huawei/Juniper، Big Data)',
        'مراجعة مشروع التخرج فردياً مع المهندسين المدربين',
        'الوصول الكامل لمختبرات المحاكاة وبيئات الاختبار',
        'شهادات إتمام متعددة + خطاب توصية لمشروع التخرج',
      ],
    },
    {
      id: 'plan-enterprise',
      name: 'باقة الفرق والمؤسسات',
      audienceLabel: 'لتأهيل فرق التقنية والأمن السيبراني',
      priceSar: 8900,
      billingCycle: 'حتى 5 مقاعد سنوياً',
      summary: 'تدريب مؤسسي مخصص لرفع كفاءة مهندسي الشبكات والأمن والبيانات الضخمة داخل الشركات.',
      highlighted: false,
      trackScope: '5 حسابات متدربين + لوحة تقارير إنجاز للمدير',
      features: [
        '5 مقاعد كاملة بالصلاحيات الاحترافية لجميع المسارات',
        'تقارير تقدم شهرية مفصلة لإدارة الموارد البشرية',
        'جلسات مراجعة مخصصة على بنية الشبكة والأمان للمنشأة',
        'أولوية في جدولة الاختبارات العملية والاعتمادات',
      ],
    },
  ];

  const users: UserAccount[] = [
    {
      id: 'usr-admin-1',
      fullName: 'إدارة معهد آفاق الخليج',
      email: 'admin@afaq-institute.sa',
      phone: '+966 50 000 1000',
      role: 'admin',
      passwordHash: hashPassword('Admin@2026'),
      cohort: 'الهيئة الأكاديمية والإدارة',
      activeTrackId: 'ai-engineering',
      enrolledTrackIds: ['ai-engineering', 'red-teaming', 'network-infra', 'bigdata-db'],
      purchasedPlanId: 'plan-pro',
      completedLessonIds: ['ai-l1-1', 'ai-l1-2', 'net-l1-0', 'cyber-l1-1', 'bd-l1-1'],
      recommendedSpecialization: 'ai-engineer',
      lastActiveLessonId: 'ai-l1-1',
      createdAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'usr-student-1',
      fullName: 'فيصل العتيبي',
      email: 'faisal@afaq-student.sa',
      phone: '+966 55 412 8890',
      role: 'student',
      passwordHash: hashPassword('Student@2026'),
      cohort: 'دفعة خريف 2026',
      activeTrackId: 'ai-engineering',
      enrolledTrackIds: ['ai-engineering', 'red-teaming', 'network-infra', 'bigdata-db'],
      purchasedPlanId: 'plan-pro',
      completedLessonIds: ['ai-l1-1', 'ai-l1-2', 'ai-l2-1', 'net-l1-0', 'cyber-l1-1', 'bd-l1-1'],
      recommendedSpecialization: 'ai-engineer',
      lastActiveLessonId: 'ai-l3-1',
      createdAt: '2026-10-12T10:30:00.000Z',
    },
  ];

  return {
    tracks,
    coursePosters,
    schedules,
    accreditations,
    pricingPlans,
    contact: {
      instituteName: 'معهد آفاق الخليج',
      phone: '+966 11 490 2200',
      whatsapp: '+966 55 900 4410',
      email: 'admissions@afaq-institute.sa',
      address: 'الرياض — حي العليا، طريق الملك فهد، برج التقنية الدور 4',
      workingHours: 'الأحد إلى الخميس · 09:00 صباحاً - 09:00 مساءً',
      xHandle: 'https://x.com/AfaqGulfTech',
      linkedinUrl: 'https://linkedin.com/school/afaq-gulf-institute',
      youtubeUrl: 'https://youtube.com/@AfaqGulfInstitute',
      instagramHandle: 'https://instagram.com/afaqgulftech',
      telegramUrl: 'https://t.me/AfaqGulfAcademy',
      heroImageUrl: '/src/assets/images/hero_institute_campus_1794777831597.jpg',
      awarenessImageUrl: '/src/assets/images/awareness_deepfake_security_1794777832779.jpg',
    },
    users,
    sessions: {},
    orders: [
      {
        id: 'ORD-202601',
        userId: 'usr-student-1',
        userName: 'فيصل العتيبي',
        userEmail: 'faisal@afaq-student.sa',
        itemType: 'plan',
        itemId: 'plan-pro',
        itemTitle: 'الباقة الاحترافية الشاملة',
        amountSar: 3290,
        paymentMethod: 'مدى (Mada)',
        status: 'مكتمل',
        createdAt: '2026-10-12T10:35:00.000Z',
      },
    ],
  };
}

function sanitizeUser(user: UserAccount) {
  const { passwordHash: _ignored, ...safe } = user;
  return safe;
}

async function readDb(): Promise<InstituteDatabase> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    const raw = await fs.readFile(STORE_PATH, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<InstituteDatabase>;
    if (
      !parsed.tracks ||
      !parsed.coursePosters ||
      !parsed.users ||
      !parsed.pricingPlans ||
      !parsed.contact ||
      !parsed.contact.youtubeUrl
    ) {
      const fresh = createInitialDatabase();
      await writeDb(fresh);
      return fresh;
    }
    return {
      tracks: parsed.tracks,
      coursePosters: parsed.coursePosters,
      schedules: parsed.schedules ?? [],
      accreditations: parsed.accreditations ?? [],
      pricingPlans: parsed.pricingPlans,
      contact: parsed.contact,
      users: parsed.users,
      sessions: parsed.sessions ?? {},
      orders: parsed.orders ?? [],
    };
  } catch {
    const fresh = createInitialDatabase();
    await writeDb(fresh);
    return fresh;
  }
}

async function writeDb(db: InstituteDatabase): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  await fs.writeFile(STORE_PATH, JSON.stringify(db, null, 2), 'utf-8');
}

function extractToken(req: express.Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.slice(7).trim();
}

async function resolveSessionUser(
  req: express.Request,
  db: InstituteDatabase
): Promise<UserAccount | null> {
  const token = extractToken(req);
  if (!token) return null;
  const userId = db.sessions[token];
  if (!userId) return null;
  return db.users.find((u) => u.id === userId) ?? null;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '12mb' }));
  app.use('/uploads', express.static(UPLOADS_DIR));

  app.get('/api/bootstrap', async (req, res) => {
    try {
      const db = await readDb();
      const user = await resolveSessionUser(req, db);
      res.json({
        tracks: db.tracks,
        coursePosters: db.coursePosters,
        schedules: db.schedules,
        accreditations: db.accreditations,
        pricingPlans: db.pricingPlans,
        contact: db.contact,
        user: user ? sanitizeUser(user) : null,
      });
    } catch {
      res.status(500).json({ error: 'تعذر تحميل بيانات المنصة' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const { fullName, email, phone, password, trackId } = req.body as {
        fullName?: string;
        email?: string;
        phone?: string;
        password?: string;
        trackId?: string;
      };

      if (!fullName || fullName.trim().length < 3) {
        res.status(400).json({ error: 'يرجى إدخال الاسم الكامل (3 أحرف على الأقل)' });
        return;
      }
      const cleanEmail = (email ?? '').trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        res.status(400).json({ error: 'يرجى إدخال بريد إلكتروني صالح' });
        return;
      }
      if (!password || password.length < 6) {
        res.status(400).json({ error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف' });
        return;
      }
      const cleanPhone = (phone ?? '').trim();
      if (cleanPhone.replace(/[\s\-()]/g, '').length < 8) {
        res.status(400).json({ error: 'يرجى إدخال رقم جوال صالح' });
        return;
      }

      const db = await readDb();
      if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
        res.status(409).json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً، يرجى تسجيل الدخول' });
        return;
      }

      const selectedTrack = db.tracks.find((t) => t.id === trackId) || db.tracks[0];
      const firstLessonId = selectedTrack?.levels[0]?.lessons[0]?.id || 'ai-l1-1';
      const newUser: UserAccount = {
        id: `usr-${Date.now()}`,
        fullName: fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        role: 'student',
        passwordHash: hashPassword(password),
        cohort: 'دفعة خريف 2026',
        activeTrackId: selectedTrack?.id || 'ai-engineering',
        enrolledTrackIds: [selectedTrack?.id || 'ai-engineering'],
        purchasedPlanId: null,
        completedLessonIds: [],
        recommendedSpecialization: null,
        lastActiveLessonId: firstLessonId,
        createdAt: new Date().toISOString(),
      };

      const token = crypto.randomBytes(24).toString('hex');
      db.users.push(newUser);
      db.sessions[token] = newUser.id;
      await writeDb(db);

      res.status(201).json({
        token,
        user: sanitizeUser(newUser),
      });
    } catch {
      res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الحساب' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body as { email?: string; password?: string };
      const cleanEmail = (email ?? '').trim().toLowerCase();
      if (!cleanEmail || !password) {
        res.status(400).json({ error: 'يرجى إدخال البريد الإلكتروني وكلمة المرور' });
        return;
      }

      const db = await readDb();
      const user = db.users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        res.status(401).json({ error: 'بيانات الدخول غير صحيحة' });
        return;
      }

      const token = crypto.randomBytes(24).toString('hex');
      db.sessions[token] = user.id;
      await writeDb(db);

      res.json({
        token,
        user: sanitizeUser(user),
      });
    } catch {
      res.status(500).json({ error: 'تعذر إتمام تسجيل الدخول' });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    try {
      const token = extractToken(req);
      if (token) {
        const db = await readDb();
        delete db.sessions[token];
        await writeDb(db);
      }
      res.json({ ok: true });
    } catch {
      res.status(500).json({ error: 'تعذر تسجيل الخروج' });
    }
  });

  app.post('/api/student/progress', async (req, res) => {
    try {
      const { lessonId, completed, trackId } = req.body as {
        lessonId?: string;
        completed?: boolean;
        trackId?: string;
      };
      if (!lessonId) {
        res.status(400).json({ error: 'معرف الدرس غير صالح' });
        return;
      }
      const db = await readDb();
      const user = (await resolveSessionUser(req, db)) || db.users.find((u) => u.role === 'student');
      if (!user) {
        res.status(404).json({ error: 'لم يتم العثور على حساب المتدرب' });
        return;
      }
      const set = new Set(user.completedLessonIds);
      if (completed === false) set.delete(lessonId);
      else set.add(lessonId);
      user.completedLessonIds = Array.from(set);
      user.lastActiveLessonId = lessonId;
      if (trackId) {
        user.activeTrackId = trackId;
        if (!user.enrolledTrackIds.includes(trackId)) {
          user.enrolledTrackIds.push(trackId);
        }
      }
      await writeDb(db);
      res.json({ user: sanitizeUser(user) });
    } catch {
      res.status(500).json({ error: 'تعذر حفظ التقدم' });
    }
  });

  app.post('/api/student/specialization', async (req, res) => {
    try {
      const { specialization } = req.body as { specialization?: string };
      if (!specialization) {
        res.status(400).json({ error: 'التخصص غير صالح' });
        return;
      }
      const db = await readDb();
      const user = await resolveSessionUser(req, db);
      if (user) {
        user.recommendedSpecialization = specialization;
        await writeDb(db);
        res.json({ user: sanitizeUser(user) });
        return;
      }
      res.json({ user: null });
    } catch {
      res.status(500).json({ error: 'تعذر حفظ التخصص' });
    }
  });

  app.post('/api/checkout', async (req, res) => {
    try {
      const {
        itemType,
        itemId,
        paymentMethod,
        buyerName,
        buyerEmail,
        buyerPhone,
      } = req.body as {
        itemType?: 'plan' | 'track' | 'course';
        itemId?: string;
        paymentMethod?: string;
        buyerName?: string;
        buyerEmail?: string;
        buyerPhone?: string;
      };

      if (!itemType || !itemId || !paymentMethod) {
        res.status(400).json({ error: 'بيانات الطلب غير مكتملة' });
        return;
      }

      const db = await readDb();
      let user = await resolveSessionUser(req, db);

      let itemTitle = '';
      let amountSar = 0;
      let targetTrackId = 'ai-engineering';

      if (itemType === 'plan') {
        const plan = db.pricingPlans.find((p) => p.id === itemId);
        if (!plan) {
          res.status(404).json({ error: 'الباقة غير موجودة' });
          return;
        }
        itemTitle = plan.name;
        amountSar = plan.priceSar;
      } else if (itemType === 'course') {
        const poster = db.coursePosters.find((p) => p.id === itemId);
        if (!poster) {
          res.status(404).json({ error: 'الدورة غير موجودة' });
          return;
        }
        itemTitle = poster.title;
        amountSar = poster.priceSar;
        targetTrackId = poster.trackId;
      } else {
        const track = db.tracks.find((t) => t.id === itemId);
        if (!track) {
          res.status(404).json({ error: 'المسار غير موجود' });
          return;
        }
        itemTitle = track.title;
        amountSar = track.priceSar;
        targetTrackId = track.id;
      }

      let issuedToken: string | null = null;
      if (!user) {
        const cleanEmail = (buyerEmail ?? '').trim().toLowerCase();
        if (!buyerName || buyerName.trim().length < 3 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
          res.status(400).json({ error: 'يرجى تسجيل الدخول أو إدخال الاسم والبريد الصحيحين لإتمام الدفع' });
          return;
        }
        user = db.users.find((u) => u.email.toLowerCase() === cleanEmail) ?? null;
        if (!user) {
          user = {
            id: `usr-${Date.now()}`,
            fullName: buyerName.trim(),
            email: cleanEmail,
            phone: (buyerPhone ?? '+966 50 000 0000').trim(),
            role: 'student',
            passwordHash: hashPassword('Afaq@2026'),
            cohort: 'دفعة خريف 2026',
            activeTrackId: targetTrackId,
            enrolledTrackIds:
              itemType === 'plan' && itemId !== 'plan-starter'
                ? db.tracks.filter((t) => t.kind === 'career').map((t) => t.id)
                : [targetTrackId],
            purchasedPlanId: itemType === 'plan' ? itemId : null,
            completedLessonIds: [],
            recommendedSpecialization: null,
            lastActiveLessonId: 'ai-l1-1',
            createdAt: new Date().toISOString(),
          };
          db.users.push(user);
        }
        issuedToken = crypto.randomBytes(24).toString('hex');
        db.sessions[issuedToken] = user.id;
      }

      if (itemType === 'plan') {
        user.purchasedPlanId = itemId;
        if (itemId === 'plan-pro' || itemId === 'plan-enterprise') {
          user.enrolledTrackIds = Array.from(
            new Set([
              ...user.enrolledTrackIds,
              ...db.tracks.filter((t) => t.kind === 'career').map((t) => t.id),
            ])
          );
        }
      } else {
        if (!user.enrolledTrackIds.includes(targetTrackId)) {
          user.enrolledTrackIds.push(targetTrackId);
        }
        user.activeTrackId = targetTrackId;
      }

      const order: OrderRecord = {
        id: `ORD-${Date.now().toString().slice(-6)}`,
        userId: user.id,
        userName: user.fullName,
        userEmail: user.email,
        itemType,
        itemId,
        itemTitle,
        amountSar,
        paymentMethod,
        status: 'مكتمل',
        createdAt: new Date().toISOString(),
      };

      db.orders.unshift(order);
      await writeDb(db);

      res.status(201).json({
        order,
        token: issuedToken,
        user: sanitizeUser(user),
      });
    } catch {
      res.status(500).json({ error: 'تعذر إتمام عملية الدفع' });
    }
  });

  app.post('/api/upload', async (req, res) => {
    try {
      const db = await readDb();
      const actor = await resolveSessionUser(req, db);
      if (!actor || actor.role !== 'admin') {
        res.status(403).json({ error: 'صلاحيات الإدارة مطلوبة لرفع الملفات' });
        return;
      }

      const { fileName, dataUrl } = req.body as { fileName?: string; dataUrl?: string };
      if (!dataUrl || !dataUrl.startsWith('data:image/')) {
        res.status(400).json({ error: 'يرجى اختيار ملف صورة صالح (PNG / JPG / WebP / SVG)' });
        return;
      }

      const match = /^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/.exec(dataUrl);
      if (!match) {
        res.status(400).json({ error: 'صيغة الصورة غير مدعومة' });
        return;
      }

      const rawType = match[1].toLowerCase();
      const ext = rawType === 'jpeg' ? 'jpg' : rawType.includes('svg') ? 'svg' : rawType.replace(/[^a-z0-9]/g, '');
      const base = (fileName ?? 'asset')
        .replace(/\.[^.]+$/, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .slice(0, 32);
      const savedName = `${Date.now()}_${base || 'image'}.${ext}`;
      const buffer = Buffer.from(match[2], 'base64');
      await fs.mkdir(UPLOADS_DIR, { recursive: true });
      await fs.writeFile(path.join(UPLOADS_DIR, savedName), buffer);

      res.json({ url: `/uploads/${savedName}` });
    } catch {
      res.status(500).json({ error: 'تعذر رفع الصورة على الخادم' });
    }
  });

  // --- ADMIN CMS ROUTES ---
  async function requireAdmin(req: express.Request, res: express.Response): Promise<InstituteDatabase | null> {
    const db = await readDb();
    const actor = await resolveSessionUser(req, db);
    if (!actor || actor.role !== 'admin') {
      res.status(403).json({ error: 'هذا الإجراء متاح لحساب الإدارة فقط' });
      return null;
    }
    return db;
  }

  app.get('/api/admin/overview', async (req, res) => {
    const db = await requireAdmin(req, res);
    if (!db) return;
    res.json({
      students: db.users.map(sanitizeUser),
      orders: db.orders,
    });
  });

  app.post('/api/admin/tracks', async (req, res) => {
    const db = await requireAdmin(req, res);
    if (!db) return;

    const payload = req.body as Partial<AcademicTrack>;
    if (!payload.title || !payload.summary) {
      res.status(400).json({ error: 'عنوان الدورة والوصف مطلوبان' });
      return;
    }

    const existingIdx = payload.id ? db.tracks.findIndex((t) => t.id === payload.id) : -1;
    if (existingIdx >= 0) {
      db.tracks[existingIdx] = {
        ...db.tracks[existingIdx],
        ...payload,
        tools: Array.isArray(payload.tools) ? payload.tools : db.tracks[existingIdx].tools,
        certifications: Array.isArray(payload.certifications)
          ? payload.certifications
          : db.tracks[existingIdx].certifications,
      };
    } else {
      const newId = `track-${Date.now()}`;
      const newTrack: AcademicTrack = {
        id: newId,
        kind: payload.kind === 'skill' ? 'skill' : 'career',
        title: payload.title.trim(),
        englishSubtitle: (payload.englishSubtitle || 'Custom Technical Track').trim(),
        summary: payload.summary.trim(),
        image: payload.image || '/src/assets/images/track_ai_engineering_1794777830795.jpg',
        iconLabel: (payload.iconLabel || 'TECH').trim(),
        priceSar: Number(payload.priceSar) || 1200,
        totalHours: Number(payload.totalHours) || 30,
        modulesCountLabel: payload.modulesCountLabel || '1 وحدة تأسيسية',
        levelLabel: payload.levelLabel || 'تطبيقي مباشر',
        prerequisites: payload.prerequisites || 'لا يشترط خبرة مسبقة',
        tools: Array.isArray(payload.tools) && payload.tools.length > 0 ? payload.tools : ['Python', 'Linux'],
        certifications:
          Array.isArray(payload.certifications) && payload.certifications.length > 0
            ? payload.certifications
            : ['شهادة إتمام من معهد آفاق الخليج'],
        capstoneTitle: payload.capstoneTitle || 'مشروع تطبيقي عملي',
        levels: [
          {
            id: `${newId}-lvl-1`,
            levelNumber: 1,
            title: 'الوحدة الأولى: التأسيس والتطبيق العملي',
            subtitle: 'Core Concepts & Practical Lab',
            hours: Number(payload.totalHours) || 30,
            tools: Array.isArray(payload.tools) && payload.tools.length > 0 ? payload.tools : ['Python'],
            deliverable: 'تطبيق عملي شامل لمفاهيم الدورة',
            lessons: [
              {
                id: `${newId}-l-1`,
                title: `مقدمة وتطبيقات ${payload.title.trim()}`,
                durationMinutes: 30,
                durationLabel: '30:00',
                summary: payload.summary.trim(),
                keyTakeaways: [
                  'فهم الإطار النظري والعملي للبرنامج',
                  'تهيئة بيئة العمل والأدوات المطلوبة',
                  'تنفيذ التمرين التطبيقي الأول',
                ],
                codeLanguage: 'bash',
                codeTitle: 'lab_setup.sh',
                codeSnippet: `#!/bin/bash\necho "Afaq Al-Khaleej Lab Initialized"`,
                attachments: [
                  {
                    name: 'دليل البدء العملي',
                    fileName: 'starter_guide.txt',
                    sizeLabel: '1.2 KB',
                    content: `${payload.title.trim()}\n${payload.summary.trim()}\n`,
                  },
                ],
                quiz: {
                  id: `q-${newId}-1`,
                  question: 'ما الهدف الرئيسي من التأسيس العملي في هذه الوحدة؟',
                  options: [
                    'تطبيق المفاهيم في بيئة عمل واقعية خطوة بخطوة',
                    'حفظ المصطلحات دون تطبيق',
                    'تجاهل اختبار الأنظمة',
                  ],
                  correctIndex: 0,
                  explanation: 'التطبيق العملي يرسخ المهارة الهندسية.',
                },
              },
            ],
          },
        ],
      };
      db.tracks.push(newTrack);
    }

    await writeDb(db);
    res.json({ tracks: db.tracks });
  });

  app.delete('/api/admin/tracks/:id', async (req, res) => {
    const db = await requireAdmin(req, res);
    if (!db) return;
    db.tracks = db.tracks.filter((t) => t.id !== req.params.id);
    db.schedules = db.schedules.filter((s) => s.trackId !== req.params.id);
    await writeDb(db);
    res.json({ tracks: db.tracks, schedules: db.schedules });
  });

  // Course Posters CRUD
  app.post('/api/admin/posters', async (req, res) => {
    const db = await requireAdmin(req, res);
    if (!db) return;
    const body = req.body as Partial<CoursePoster>;
    if (!body.title || !body.vendorName || !body.examCode) {
      res.status(400).json({ error: 'اسم الدورة والشركة المانحة وكود الاختبار مطلوبون' });
      return;
    }

    const idx = body.id ? db.coursePosters.findIndex((p) => p.id === body.id) : -1;
    if (idx >= 0) {
      db.coursePosters[idx] = {
        ...db.coursePosters[idx],
        ...body,
        priceSar: Number(body.priceSar) || db.coursePosters[idx].priceSar,
      } as CoursePoster;
    } else {
      db.coursePosters.unshift({
        id: `poster-${Date.now()}`,
        trackId: body.trackId || 'ai-engineering',
        trackCategory: body.trackCategory || 'برنامج تخصصي معتمد',
        vendorName: body.vendorName.trim(),
        vendorCode: (body.vendorCode || 'TECH').trim(),
        vendorLogoUrl: body.vendorLogoUrl || '',
        title: body.title.trim(),
        studyDuration: body.studyDuration || '40 ساعة · 6 أسابيع',
        lectureTimes: body.lectureTimes || 'الأحد والثلاثاء · 07:00 م',
        examCode: body.examCode.trim(),
        certificateType: body.certificateType || 'شهادة دولية معتمدة + شهادة المعهد',
        priceSar: Number(body.priceSar) || 1400,
        summary: body.summary || 'برنامج تدريبي مكثف بتطبيق عملي وتجهيز للاختبار الدولي.',
      });
    }
    await writeDb(db);
    res.json({ coursePosters: db.coursePosters });
  });

  app.delete('/api/admin/posters/:id', async (req, res) => {
    const db = await requireAdmin(req, res);
    if (!db) return;
    db.coursePosters = db.coursePosters.filter((p) => p.id !== req.params.id);
    await writeDb(db);
    res.json({ coursePosters: db.coursePosters });
  });

  app.post('/api/admin/schedules', async (req, res) => {
    const db = await requireAdmin(req, res);
    if (!db) return;
    const body = req.body as Partial<LectureSchedule>;
    if (!body.title || !body.dayOfWeek || !body.timeRange || !body.trackId) {
      res.status(400).json({ error: 'بيانات موعد المحاضرة غير مكتملة' });
      return;
    }
    const track = db.tracks.find((t) => t.id === body.trackId);
    const trackTitle = track?.title || body.trackTitle || 'برنامج تدريبي';

    const idx = body.id ? db.schedules.findIndex((s) => s.id === body.id) : -1;
    if (idx >= 0) {
      db.schedules[idx] = {
        ...db.schedules[idx],
        ...body,
        trackTitle,
      } as LectureSchedule;
    } else {
      db.schedules.push({
        id: `sch-${Date.now()}`,
        trackId: body.trackId,
        trackTitle,
        title: body.title.trim(),
        dayOfWeek: body.dayOfWeek.trim(),
        timeRange: body.timeRange.trim(),
        instructor: (body.instructor || 'هيئة التدريب').trim(),
        mode: body.mode || 'مدمج',
      });
    }
    await writeDb(db);
    res.json({ schedules: db.schedules });
  });

  app.delete('/api/admin/schedules/:id', async (req, res) => {
    const db = await requireAdmin(req, res);
    if (!db) return;
    db.schedules = db.schedules.filter((s) => s.id !== req.params.id);
    await writeDb(db);
    res.json({ schedules: db.schedules });
  });

  app.put('/api/admin/contact', async (req, res) => {
    const db = await requireAdmin(req, res);
    if (!db) return;
    db.contact = { ...db.contact, ...(req.body as Partial<InstituteContact>) };
    await writeDb(db);
    res.json({ contact: db.contact });
  });

  app.post('/api/admin/accreditations', async (req, res) => {
    const db = await requireAdmin(req, res);
    if (!db) return;
    const body = req.body as Partial<AccreditationCert>;
    if (!body.title || !body.issuer) {
      res.status(400).json({ error: 'اسم الشهادة والجهة المانحة مطلوبان' });
      return;
    }
    db.accreditations.push({
      id: `acc-${Date.now()}`,
      title: body.title.trim(),
      issuer: body.issuer.trim(),
      licenseNumber: (body.licenseNumber || 'AK-CERT-2026').trim(),
      issueYear: (body.issueYear || '2026').trim(),
      imageUrl: body.imageUrl || '/src/assets/images/hero_institute_campus_1794777831597.jpg',
    });
    await writeDb(db);
    res.json({ accreditations: db.accreditations });
  });

  app.delete('/api/admin/accreditations/:id', async (req, res) => {
    const db = await requireAdmin(req, res);
    if (!db) return;
    db.accreditations = db.accreditations.filter((a) => a.id !== req.params.id);
    await writeDb(db);
    res.json({ accreditations: db.accreditations });
  });

  app.put('/api/admin/pricing/:id', async (req, res) => {
    const db = await requireAdmin(req, res);
    if (!db) return;
    const idx = db.pricingPlans.findIndex((p) => p.id === req.params.id);
    if (idx < 0) {
      res.status(404).json({ error: 'الباقة غير موجودة' });
      return;
    }
    db.pricingPlans[idx] = { ...db.pricingPlans[idx], ...(req.body as Partial<PricingPlan>) };
    await writeDb(db);
    res.json({ pricingPlans: db.pricingPlans });
  });

  app.patch('/api/admin/students/:id', async (req, res) => {
    const db = await requireAdmin(req, res);
    if (!db) return;
    const student = db.users.find((u) => u.id === req.params.id);
    if (!student) {
      res.status(404).json({ error: 'المتدرب غير موجود' });
      return;
    }
    const { cohort, activeTrackId, purchasedPlanId, enrolledTrackIds } = req.body as Partial<UserAccount>;
    if (cohort) student.cohort = cohort;
    if (activeTrackId) student.activeTrackId = activeTrackId;
    if (purchasedPlanId !== undefined) student.purchasedPlanId = purchasedPlanId;
    if (Array.isArray(enrolledTrackIds)) student.enrolledTrackIds = enrolledTrackIds;
    await writeDb(db);
    res.json({ students: db.users.map(sanitizeUser) });
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Afaq Al-Khaleej Full-Stack LMS running on http://localhost:${PORT}`);
  });
}

startServer();
