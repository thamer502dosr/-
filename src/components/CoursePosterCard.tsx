import { ArrowLeft, Award, CalendarClock, Clock, FileCheck2 } from 'lucide-react';
import type { CoursePoster } from '../types/lms';
import { ResilientImage } from './ResilientImage';

interface CoursePosterCardProps {
  poster: CoursePoster;
  onExploreTrack: (trackId: string) => void;
  onPurchaseCourse: (poster: CoursePoster) => void;
}

function VendorEmblem({ vendorCode, vendorName }: { vendorCode: string; vendorName: string }) {
  const code = vendorCode.toUpperCase();

  if (code === 'CISCO') {
    return (
      <svg viewBox="0 0 88 40" className="w-20 h-9 text-amber-300" aria-label={vendorName}>
        <g fill="currentColor">
          <rect x="8" y="14" width="4" height="10" rx="2" />
          <rect x="17" y="8" width="4" height="20" rx="2" />
          <rect x="26" y="4" width="4" height="28" rx="2" />
          <rect x="35" y="10" width="4" height="16" rx="2" />
          <rect x="44" y="4" width="4" height="28" rx="2" />
          <rect x="53" y="8" width="4" height="20" rx="2" />
          <rect x="62" y="14" width="4" height="10" rx="2" />
        </g>
      </svg>
    );
  }

  if (code === 'SYMANTEC') {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 text-amber-300" aria-label={vendorName}>
        <circle cx="24" cy="24" r="18" fill="none" stroke="currentColor" strokeWidth="3" />
        <path
          d="M16 25l6 6 12-14"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (code === 'HUAWEI') {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 text-amber-300" aria-label={vendorName}>
        <g fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M24 28L12 14" />
          <path d="M24 28L18 10" />
          <path d="M24 28V8" />
          <path d="M24 28L30 10" />
          <path d="M24 28L36 14" />
          <path d="M12 32h24" />
        </g>
      </svg>
    );
  }

  if (code === 'BIGDATA') {
    return (
      <svg viewBox="0 0 48 48" className="w-10 h-10 text-amber-300" aria-label={vendorName}>
        <ellipse cx="24" cy="12" rx="14" ry="5" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <path d="M10 12v12c0 2.8 6.3 5 14 5s14-2.2 14-5V12" fill="none" stroke="currentColor" strokeWidth="2.4" />
        <path d="M10 24v10c0 2.8 6.3 5 14 5s14-2.2 14-5V24" fill="none" stroke="currentColor" strokeWidth="2.4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 48 48" className="w-10 h-10 text-amber-300" aria-label={vendorName}>
      <polygon
        points="24,4 42,14 42,34 24,44 6,34 6,14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
      />
      <circle cx="24" cy="24" r="6" fill="none" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  );
}

export function CoursePosterCard({
  poster,
  onExploreTrack,
  onPurchaseCourse,
}: CoursePosterCardProps) {
  return (
    <article className="bg-[#091224] border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden flex flex-col justify-between transition-colors">
      {/* Poster Header: Prominent Vendor Logo & Exam Code */}
      <div>
        <div className="bg-gradient-to-br from-[#0E1B36] via-[#0B152A] to-[#070E1C] px-6 py-5 border-b border-slate-800/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-[#060B16] border border-amber-500/30 flex items-center justify-center p-2 shrink-0 overflow-hidden">
              {poster.vendorLogoUrl ? (
                <ResilientImage
                  src={poster.vendorLogoUrl}
                  alt={`شعار ${poster.vendorName}`}
                  fallbackTitle={poster.vendorName}
                  className="w-full h-full object-contain"
                />
              ) : (
                <VendorEmblem vendorCode={poster.vendorCode} vendorName={poster.vendorName} />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-mono text-amber-300 truncate">{poster.vendorName}</div>
              <div className="text-xs text-slate-400 truncate mt-0.5">{poster.trackCategory}</div>
            </div>
          </div>

          <div className="text-left shrink-0">
            <div className="text-[11px] text-slate-400">كود الاختبار</div>
            <div className="text-xs sm:text-sm font-mono font-semibold text-slate-100 tabular-nums mt-0.5">
              {poster.examCode}
            </div>
          </div>
        </div>

        {/* Poster Body */}
        <div className="p-6 space-y-4">
          <h3 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug">
            {poster.title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-2">
            {poster.summary}
          </p>

          {/* Structured Poster Specification Grid */}
          <dl className="pt-4 border-t border-slate-800/80 space-y-3 text-xs">
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>مدة الدراسة</span>
              </dt>
              <dd className="font-medium text-slate-100 tabular-nums text-left">
                {poster.studyDuration}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-slate-400">
                <CalendarClock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>أوقات المحاضرات</span>
              </dt>
              <dd className="font-medium text-slate-100 text-left">{poster.lectureTimes}</dd>
            </div>

            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-slate-400">
                <FileCheck2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>نوع الشهادة</span>
              </dt>
              <dd className="font-medium text-slate-200 text-left">{poster.certificateType}</dd>
            </div>

            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-slate-400">
                <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>رسوم البرنامج</span>
              </dt>
              <dd className="font-mono font-bold text-amber-300 tabular-nums text-left">
                {poster.priceSar.toLocaleString('en-US')} ر.س
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Poster Footer Actions */}
      <div className="px-6 py-4 bg-[#070E1C] border-t border-slate-800/80 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => onExploreTrack(poster.trackId)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-amber-300 hover:text-amber-200 transition-colors cursor-pointer"
        >
          <span>استعراض المنهج</span>
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => onPurchaseCourse(poster)}
          className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          التسجيل بالدورة
        </button>
      </div>
    </article>
  );
}
