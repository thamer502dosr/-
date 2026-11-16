import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import type { UserProfile } from '../types/lms';

export type ActiveView = 'home' | 'pricing' | 'classroom' | 'dashboard' | 'admin' | 'auth';

interface NavbarProps {
  instituteName: string;
  activeView: ActiveView;
  user: UserProfile | null;
  onNavigateView: (view: ActiveView, sectionId?: string) => void;
  onLogout: () => void;
}

export function Navbar({
  instituteName,
  activeView,
  user,
  onNavigateView,
  onLogout,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (view: ActiveView, sectionId?: string) => {
    setMobileOpen(false);
    onNavigateView(view, sectionId);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-[#060B16]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single clean wordmark */}
        <button
          type="button"
          onClick={() => handleLinkClick('home', 'top')}
          className="text-lg font-bold tracking-tight text-slate-100 whitespace-nowrap shrink-0 hover:text-sky-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-md px-1 cursor-pointer"
        >
          {instituteName}
        </button>

        {/* Zone 2: 5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => handleLinkClick('home', 'tracks')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              activeView === 'home'
                ? 'border-sky-500 text-slate-100'
                : 'border-transparent hover:text-slate-100 hover:border-slate-700'
            }`}
          >
            المسارات
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('pricing')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              activeView === 'pricing'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent hover:text-slate-100 hover:border-slate-700'
            }`}
          >
            الأسعار
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('classroom')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              activeView === 'classroom'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent hover:text-slate-100 hover:border-slate-700'
            }`}
          >
            منصة التعلم
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('dashboard')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              activeView === 'dashboard'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent hover:text-slate-100 hover:border-slate-700'
            }`}
          >
            لوحة الطالب
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('admin')}
            className={`whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
              activeView === 'admin'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent hover:text-slate-100 hover:border-slate-700'
            }`}
          >
            الإدارة
          </button>
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <button
              type="button"
              onClick={onLogout}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              تسجيل الخروج
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleLinkClick('auth')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              دخول / تسجيل
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-800 text-slate-200 hover:bg-slate-900 cursor-pointer"
            aria-label={mobileOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#080F1E] px-4 py-4 space-y-2">
          <button
            type="button"
            onClick={() => handleLinkClick('home', 'tracks')}
            className="block w-full text-right px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
          >
            المسارات
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('pricing')}
            className="block w-full text-right px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
          >
            الأسعار والباقات
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('classroom')}
            className="block w-full text-right px-3 py-2.5 text-sm text-sky-400 hover:bg-slate-900 rounded-lg"
          >
            منصة التعلم
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('dashboard')}
            className="block w-full text-right px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
          >
            لوحة الطالب
          </button>
          <button
            type="button"
            onClick={() => handleLinkClick('admin')}
            className="block w-full text-right px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-900 rounded-lg"
          >
            لوحة الإدارة
          </button>
          {user ? (
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onLogout();
              }}
              className="block w-full text-center mt-2 px-4 py-2.5 text-sm font-semibold text-slate-200 bg-slate-800 rounded-lg"
            >
              تسجيل الخروج ({user.fullName})
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleLinkClick('auth')}
              className="block w-full text-center mt-2 px-4 py-2.5 text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg"
            >
              دخول / إنشاء حساب
            </button>
          )}
        </div>
      )}
    </header>
  );
}
