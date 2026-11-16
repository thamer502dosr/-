import { useEffect, useState, type FormEvent } from 'react';
import { CheckCircle2, CreditCard, ShieldCheck, X } from 'lucide-react';
import type {
  AcademicTrack,
  CoursePoster,
  OrderRecord,
  PricingPlan,
  UserProfile,
} from '../types/lms';

export interface CheckoutTarget {
  itemType: 'plan' | 'track' | 'course';
  itemId: string;
  title: string;
  priceSar: number;
  subtitle: string;
}

interface PricingViewProps {
  pricingPlans: PricingPlan[];
  tracks: AcademicTrack[];
  coursePosters: CoursePoster[];
  user: UserProfile | null;
  initialCheckoutTarget?: CheckoutTarget | null;
  onClearInitialTarget?: () => void;
  onOrderCompleted: (payload: { token: string | null; user: UserProfile; order: OrderRecord }) => void;
  onOpenClassroom: (trackId: string) => void;
}

export function PricingView({
  pricingPlans,
  tracks,
  coursePosters,
  user,
  initialCheckoutTarget = null,
  onClearInitialTarget,
  onOrderCompleted,
  onOpenClassroom,
}: PricingViewProps) {
  const [checkoutTarget, setCheckoutTarget] = useState<CheckoutTarget | null>(initialCheckoutTarget);
  const [paymentMethod, setPaymentMethod] = useState('مدى (Mada)');
  const [buyerName, setBuyerName] = useState(user?.fullName || '');
  const [buyerEmail, setBuyerEmail] = useState(user?.email || '');
  const [buyerPhone, setBuyerPhone] = useState(user?.phone || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (initialCheckoutTarget) {
      setCheckoutTarget(initialCheckoutTarget);
      setBuyerName(user?.fullName || '');
      setBuyerEmail(user?.email || '');
      setBuyerPhone(user?.phone || '');
      setCompletedOrder(null);
      setError(null);
    }
  }, [initialCheckoutTarget, user]);

  const openCheckout = (target: CheckoutTarget) => {
    setCheckoutTarget(target);
    setBuyerName(user?.fullName || '');
    setBuyerEmail(user?.email || '');
    setBuyerPhone(user?.phone || '');
    setError(null);
    setCompletedOrder(null);
  };

  const closeCheckout = () => {
    setCheckoutTarget(null);
    onClearInitialTarget?.();
  };

  const handleCheckoutSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!checkoutTarget) return;
    setError(null);

    try {
      setSubmitting(true);
      const token = localStorage.getItem('afaq_auth_token');
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          itemType: checkoutTarget.itemType,
          itemId: checkoutTarget.itemId,
          paymentMethod,
          buyerName: buyerName.trim(),
          buyerEmail: buyerEmail.trim(),
          buyerPhone: buyerPhone.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'تعذر إتمام الدفع');
        return;
      }

      setCompletedOrder(data.order);
      onOrderCompleted({
        token: data.token || null,
        user: data.user,
        order: data.order,
      });
    } catch {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadInvoice = (order: OrderRecord) => {
    const receipt = [
      'معهد آفاق الخليج — إيصال اشتراك إلكتروني',
      `رقم الفاتورة: ${order.id}`,
      `التاريخ: ${new Date(order.createdAt).toLocaleDateString('ar-SA')}`,
      `المشترك: ${order.userName} (${order.userEmail})`,
      `البرنامج / الباقة: ${order.itemTitle}`,
      `وسيلة الدفع: ${order.paymentMethod}`,
      `المبلغ الإجمالي: ${order.amountSar} ريال سعودي`,
      `الحالة: ${order.status}`,
    ].join('\n');

    const blob = new Blob([receipt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${order.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#060B16] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <div className="max-w-3xl space-y-3">
          <div className="text-xs text-amber-300 font-medium">
            الأسعار وباقات الاشتراك · تفعيل فوري للمنصة
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-100">
            خطط الاشتراك وشراء الدورات والمسارات
          </h1>
          <p className="text-slate-400 text-base leading-relaxed">
            اشترك في الباقة الشاملة لجميع المسارات الأربعة أو سجّل مباشرة في الدورة التخصصية التي
            تناسب أهدافك المهنية.
          </p>
        </div>

        {/* Subscription Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {pricingPlans.map((plan) => {
            const isActivePlan = user?.purchasedPlanId === plan.id;
            return (
              <div
                key={plan.id}
                className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between border ${
                  plan.highlighted
                    ? 'bg-[#0C1730] border-amber-500/70'
                    : 'bg-[#091224] border-slate-800/80'
                }`}
              >
                <div className="space-y-5">
                  <div>
                    <div className="text-xs font-medium text-amber-300 mb-1">{plan.audienceLabel}</div>
                    <h2 className="text-xl font-bold text-slate-100">{plan.name}</h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                      {plan.summary}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold font-mono tabular-nums text-slate-100">
                        {plan.priceSar.toLocaleString('en-US')}
                      </span>
                      <span className="text-sm text-slate-400">ريال سعودي</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">{plan.billingCycle}</div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
                    <div className="text-xs font-semibold text-slate-200">{plan.trackScope}</div>
                    <ul className="space-y-2.5">
                      {plan.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8">
                  {isActivePlan ? (
                    <button
                      type="button"
                      onClick={() => onOpenClassroom(user?.activeTrackId || 'ai-engineering')}
                      className="w-full py-3 rounded-xl bg-emerald-600/20 border border-emerald-500/60 text-emerald-300 text-sm font-semibold cursor-pointer"
                    >
                      باقتك النشطة حالياً — دخول المنصة
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        openCheckout({
                          itemType: 'plan',
                          itemId: plan.id,
                          title: plan.name,
                          priceSar: plan.priceSar,
                          subtitle: plan.billingCycle,
                        })
                      }
                      className={`w-full py-3 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                        plan.highlighted
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                      }`}
                    >
                      الاشتراك في الباقة
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Individual Course Posters Table */}
        <div className="bg-[#091224] border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800/80">
            <h2 className="text-xl font-bold text-slate-100">شراء الدورات التخصصية والاختبارات الدولية</h2>
            <p className="text-xs text-slate-400 mt-1">
              سجل في أي دورة مهنية منفردة مع تحديد كود الاختبار وأوقات المحاضرات المعتمدة
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-xs text-slate-400 bg-[#070E1C]">
                  <th className="py-3.5 px-5 font-medium">الدورة والجهة المانحة</th>
                  <th className="py-3.5 px-5 font-medium">كود الاختبار</th>
                  <th className="py-3.5 px-5 font-medium">المدة والمواعيد</th>
                  <th className="py-3.5 px-5 font-medium">السعر</th>
                  <th className="py-3.5 px-5 font-medium">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {coursePosters.map((poster) => (
                  <tr key={poster.id} className="hover:bg-[#0D182F] transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-100">{poster.title}</div>
                      <div className="text-xs text-amber-300 mt-0.5">{poster.vendorName}</div>
                    </td>
                    <td className="py-4 px-5 font-mono text-xs text-slate-200">{poster.examCode}</td>
                    <td className="py-4 px-5 text-xs text-slate-300">
                      <div>{poster.studyDuration}</div>
                      <div className="text-slate-400 mt-0.5">{poster.lectureTimes}</div>
                    </td>
                    <td className="py-4 px-5 font-mono tabular-nums font-bold text-amber-300">
                      {poster.priceSar.toLocaleString('en-US')} ر.س
                    </td>
                    <td className="py-4 px-5">
                      <button
                        type="button"
                        onClick={() =>
                          openCheckout({
                            itemType: 'course',
                            itemId: poster.id,
                            title: poster.title,
                            priceSar: poster.priceSar,
                            subtitle: `${poster.vendorName} · ${poster.examCode}`,
                          })
                        }
                        className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer"
                      >
                        التسجيل والشراء
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Individual Career Tracks Table */}
        <div className="bg-[#091224] border border-slate-800/80 rounded-2xl overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-800/80">
            <h2 className="text-xl font-bold text-slate-100">المسارات الأكاديمية الشاملة</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 text-xs text-slate-400 bg-[#070E1C]">
                  <th className="py-3.5 px-5 font-medium">المسار التدريبي</th>
                  <th className="py-3.5 px-5 font-medium">الساعات</th>
                  <th className="py-3.5 px-5 font-medium">السعر</th>
                  <th className="py-3.5 px-5 font-medium">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {tracks.map((track) => {
                  const isEnrolled = user?.enrolledTrackIds.includes(track.id);
                  return (
                    <tr key={track.id} className="hover:bg-[#0D182F] transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-100">{track.title}</div>
                        <div className="text-xs font-mono text-slate-400 mt-0.5">
                          {track.englishSubtitle}
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono tabular-nums text-slate-300 text-xs">
                        {track.totalHours} ساعة
                      </td>
                      <td className="py-4 px-5 font-mono tabular-nums font-semibold text-slate-100">
                        {track.priceSar.toLocaleString('en-US')} ر.س
                      </td>
                      <td className="py-4 px-5">
                        {isEnrolled ? (
                          <button
                            type="button"
                            onClick={() => onOpenClassroom(track.id)}
                            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 cursor-pointer whitespace-nowrap"
                          >
                            مفعّل — فتح الدروس
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              openCheckout({
                                itemType: 'track',
                                itemId: track.id,
                                title: track.title,
                                priceSar: track.priceSar,
                                subtitle: `${track.totalHours} ساعة تدريبية`,
                              })
                            }
                            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-white text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer"
                          >
                            شراء وتفعيل
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      {checkoutTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="بوابة الدفع وإتمام الاشتراك"
        >
          <div className="w-full max-w-lg bg-[#091224] border border-slate-800 rounded-2xl p-6 sm:p-8 my-8">
            {completedOrder ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                    <ShieldCheck className="w-5 h-5" />
                    <span>تم الدفع وتفعيل الوصول بنجاح</span>
                  </div>
                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="w-9 h-9 rounded-lg border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100 cursor-pointer"
                    aria-label="إغلاق"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-[#070E1B] border border-slate-800 space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">رقم الطلب:</span>
                    <span className="font-mono text-amber-300">{completedOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">الباقة / الدورة:</span>
                    <span className="font-semibold text-slate-100">{completedOrder.itemTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">المبلغ المدفوع:</span>
                    <span className="font-mono tabular-nums text-slate-100">
                      {completedOrder.amountSar.toLocaleString('en-US')} ر.س
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">وسيلة الدفع:</span>
                    <span className="text-slate-200">{completedOrder.paymentMethod}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => handleDownloadInvoice(completedOrder)}
                    className="px-4 py-2.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-200 hover:bg-slate-900 cursor-pointer"
                  >
                    تحميل الفاتورة
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const targetId =
                        checkoutTarget.itemType === 'track'
                          ? checkoutTarget.itemId
                          : 'ai-engineering';
                      closeCheckout();
                      onOpenClassroom(targetId);
                    }}
                    className="flex-1 py-2.5 px-5 rounded-lg bg-amber-500 hover:bg-amber-400 text-xs font-bold text-slate-950 cursor-pointer"
                  >
                    الانتقال لمنصة التعلم الآن
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCheckoutSubmit} className="space-y-5">
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-amber-300 font-medium mb-1">
                      <CreditCard className="w-4 h-4" />
                      <span>إتمام الدفع الآمن</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-100">{checkoutTarget.title}</h3>
                    <div className="text-xs text-slate-400 mt-1">
                      {checkoutTarget.subtitle} ·{' '}
                      <span className="font-mono tabular-nums text-amber-300 font-semibold">
                        {checkoutTarget.priceSar.toLocaleString('en-US')} ريال سعودي
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={closeCheckout}
                    className="w-9 h-9 rounded-lg border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100 shrink-0 cursor-pointer"
                    aria-label="إغلاق"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-xs text-rose-200">
                    {error}
                  </div>
                )}

                {!user && (
                  <div className="space-y-3">
                    <div className="text-xs text-slate-400">
                      سيتم إنشاء حساب متدرب تلقائياً لك عند إتمام الدفع:
                    </div>
                    <input
                      type="text"
                      required
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="الاسم الكامل"
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="email"
                        required
                        dir="ltr"
                        value={buyerEmail}
                        onChange={(e) => setBuyerEmail(e.target.value)}
                        placeholder="البريد الإلكتروني"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 text-right"
                      />
                      <input
                        type="tel"
                        required
                        dir="ltr"
                        value={buyerPhone}
                        onChange={(e) => setBuyerPhone(e.target.value)}
                        placeholder="+966 5X XXX XXXX"
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#070E1B] border border-slate-800 text-sm text-slate-100 text-right"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-2">
                    اختر وسيلة الدفع
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {['مدى (Mada)', 'Visa / Mastercard', 'Apple Pay', 'تحويل بنكي مؤسسي'].map(
                      (method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-2.5 px-3 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                            paymentMethod === method
                              ? 'bg-amber-500/15 border-amber-500 text-amber-300'
                              : 'bg-[#070E1B] border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          {method}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-slate-950 text-sm font-bold transition-colors cursor-pointer"
                >
                  {submitting
                    ? 'جاري تأكيد الدفع...'
                    : `تأكيد ودفع ${checkoutTarget.priceSar.toLocaleString('en-US')} ر.س`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
