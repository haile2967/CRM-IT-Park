import React, { useState, useRef, useEffect, useMemo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutGrid,
  Users2,
  Building2,
  Contact2,
  LogOut,
  ChevronRight,
  ChevronDown,
  Search,
  Menu,
  X,
  Bell,
  User,
  Key,
  Layers,
  Clock,
  PanelLeftClose,
  UserCog,
  Sun,
  Moon,
  Monitor,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import { ItParkBrandLockup, ItParkGlobeEmblem } from '../common/ItParkLogo';

type ThemeMode = 'system' | 'light' | 'dark';
type LanguageCode = 'en' | 'am';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

interface NavItemDef {
  key: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

const navDefinitions: NavItemDef[] = [
  { key: 'dashboard', to: '/dashboard', icon: LayoutGrid },
  { key: 'leads', to: '/leads', icon: Users2 },
  { key: 'accounts', to: '/accounts', icon: Building2 },
  { key: 'contacts', to: '/contacts', icon: Contact2 },
  { key: 'stages', to: '/pipeline-stages', icon: Layers },
  { key: 'escalations', to: '/escalations', icon: Clock },
  { key: 'users', to: '/users', icon: UserCog, permission: 'users.view' },
  { key: 'roles', to: '/roles', icon: Key, permission: 'roles.view' },
];

const translations = {
  en: {
    dashboard: 'Dashboard',
    leads: 'Leads Pipeline',
    accounts: 'Corporate Accounts',
    contacts: 'Contacts Directory',
    stages: 'Pipeline Stages',
    escalations: 'Escalation Policies',
    users: 'User Management',
    roles: 'Role Management',
    searchPlaceholder: 'Search records...',
    changePassword: 'Change password',
    signOut: 'Sign out',
    signingOut: 'Signing out...',
    themeMode: 'Theme Mode',
    system: 'System',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',
    notifications: 'Notifications',
    admin: 'Administrator',
    systemAdmin: 'System Administrator',
    crmCore: 'CRM Core',
    enterpriseCrm: 'Enterprise CRM',
  },
  am: {
    dashboard: 'ዳሽቦርድ',
    leads: 'የመሪዎች መስመር',
    accounts: 'የድርጅቶች ሂሳቦች',
    contacts: 'የተወካዮች ማውጫ',
    stages: 'የሂደት ደረጃዎች',
    escalations: 'የማስጠንቀቂያ ፖሊሲዎች',
    users: 'የተጠቃሚዎች አስተዳደር',
    roles: 'የሚና አስተዳደር',
    searchPlaceholder: 'መዝገቦችን ይፈልጉ...',
    changePassword: 'የይለፍ ቃል ቀይር',
    signOut: 'ውጣ',
    signingOut: 'በመውጣት ላይ...',
    themeMode: 'የገጽታ ሁነታ',
    system: 'ስርዓት',
    light: 'ብርሃን',
    dark: 'ጨለማ',
    language: 'ቋንቋ',
    notifications: 'ማሳወቂያዎች',
    admin: 'አስተዳዳሪ',
    systemAdmin: 'የስርዓት አስተዳዳሪ',
    crmCore: 'ሲአርኤም ኮር',
    enterpriseCrm: 'ኢንተርፕራይዝ ሲአርኤም',
  },
};

export const AppShell: React.FC<AppShellProps> = ({
  children,
  title = 'Overview',
  subtitle = 'Ethiopian IT Park Relationship Management',
}) => {
  const { user, logout } = useAuth();
  const { can } = usePermission();
  const navigate = useNavigate();
  const location = useLocation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('crm_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  // Theme state synced with Keycloak's itpark_crm_theme key
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('itpark_crm_theme');
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'system';
  });

  // Language state synced with Keycloak's itpark_crm_lang key
  const [lang, setLang] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem('itpark_crm_lang');
      if (saved === 'am' || saved === 'en') {
        return saved;
      }
    } catch {
      // fallback
    }
    return 'en';
  });

  const t = translations[lang];

  // Apply theme to document element
  useEffect(() => {
    const applyThemeToDOM = (selectedTheme: ThemeMode) => {
      let effectiveTheme = selectedTheme;
      if (selectedTheme === 'system') {
        effectiveTheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }

      document.documentElement.setAttribute('data-theme', effectiveTheme);
      document.body.setAttribute('data-theme', effectiveTheme);

      if (effectiveTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyThemeToDOM(theme);

    try {
      localStorage.setItem('itpark_crm_theme', theme);
    } catch {
      // ignore
    }

    if (theme === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyThemeToDOM('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  // Handle language change
  const handleLanguageChange = (newLang: LanguageCode) => {
    setLang(newLang);
    try {
      localStorage.setItem('itpark_crm_lang', newLang);
      window.dispatchEvent(new CustomEvent('itpark_lang_change', { detail: newLang }));
    } catch {
      // ignore
    }
  };

  // Filter navigation items by active user capabilities
  const visibleItems = useMemo(() => {
    return navDefinitions.filter((item) => {
      if (!item.permission) return true;
      return can(item.permission);
    });
  }, [can]);

  const userMenuRef = useRef<HTMLDivElement>(null);

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('crm_sidebar_collapsed', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    setIsUserMenuOpen(false);
    try {
      await logout();
    } catch {
      window.location.replace('/login');
    }
  };

  return (
    <div className="h-screen flex flex-col md:flex-row antialiased text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors duration-200">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <img
            src="/itpark-logo-light.png"
            alt="Ethiopian IT Park"
            className="h-8 w-auto max-w-[170px] object-contain dark:hidden"
          />
          <img
            src="/itpark-logo-dark.png"
            alt="Ethiopian IT Park"
            className="h-8 w-auto max-w-[170px] object-contain hidden dark:block"
          />
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
          aria-label="Toggle navigation"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 h-full bg-[#0a121e] text-slate-300 flex flex-col shrink-0 overflow-x-hidden
          transition-all duration-300 ease-in-out border-r border-slate-800/90 shadow-xl
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'w-64 md:w-16' : 'w-64'}
        `}
      >
        {/* Brand Header */}
        <div
          className={`p-4 border-b border-slate-800/80 flex items-center shrink-0 ${isCollapsed ? 'md:justify-center md:px-2 md:py-3.5' : 'justify-between'
            }`}
        >
          <ItParkBrandLockup collapsed={isCollapsed} isDark={true} />
        </div>

        {/* Scrollable Navigation Body */}
        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-2 py-3 space-y-1.5' : 'px-3 py-3 space-y-1'
            }`}
        >
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const labelText = t[item.key as keyof typeof t] || item.key;

            if (isCollapsed) {
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={labelText}
                  onClick={() => setIsSidebarOpen(false)}
                  className={({ isActive }) => `
                    group relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-150
                    ${isActive
                      ? 'bg-cyan-500/15 text-cyan-300 font-semibold shadow-xs ring-1 ring-cyan-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
                    }
                  `}
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span
                    className={`w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)] absolute right-1 top-1/2 -translate-y-1/2 transition-opacity ${location.pathname === item.to ? 'opacity-100' : 'opacity-0'
                      }`}
                  />
                </NavLink>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => `
                  group flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150
                  ${isActive
                    ? 'bg-cyan-500/15 text-cyan-200 font-semibold shadow-xs ring-1 ring-cyan-500/25 border-l-2 border-cyan-400'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }
                `}
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                        }`}
                    />
                    <span className="truncate">{labelText}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Expand / Collapse Bar */}
        <div
          className={`p-3 border-t border-slate-800/80 bg-slate-950/60 shrink-0 ${isCollapsed ? 'flex justify-center' : 'flex justify-between items-center'
            }`}
        >
          {!isCollapsed && (
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>v2.0 • Online</span>
            </div>
          )}
          <button
            type="button"
            onClick={toggleSidebarCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-8 h-8 rounded-lg border border-slate-700/80 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto overflow-x-hidden bg-slate-50 dark:bg-[#070b14] transition-colors duration-200">
        {/* Top Utility Header */}
        <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-[#0a121e]/95 backdrop-blur-xs border-b border-slate-200 dark:border-slate-800/90 px-6 flex items-center justify-between gap-4 shrink-0 transition-colors duration-200">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight leading-none">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 tracking-tight hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Search Cue */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 text-xs border border-slate-200 dark:border-slate-700">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>{t.searchPlaceholder}</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-sm font-mono text-slate-600 dark:text-slate-300 shadow-2xs">
                ⌘K
              </kbd>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title={t.notifications}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-500 ring-2 ring-white dark:ring-slate-900 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
            </button>

            {/* User Profile Dropdown Trigger */}
            <div className="relative pl-1 border-l border-slate-200 dark:border-slate-800" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left cursor-pointer"
                aria-expanded={isUserMenuOpen}
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>

                <div className="hidden sm:block leading-tight">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
                    {user?.full_name || user?.first_name || t.systemAdmin}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {user?.role?.role_name || t.admin}
                  </p>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Popover Dropdown (Includes Theme Mode & Language Switchers) */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white dark:bg-[#111723] border border-slate-200/90 dark:border-slate-800 shadow-2xl py-2 z-50 text-xs animate-in fade-in slide-in-from-top-1 duration-150">
                  {/* Account Info */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800/80">
                    <p className="font-semibold text-slate-900 dark:text-white text-xs truncate">
                      {user?.full_name || user?.first_name || t.systemAdmin}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                      {user?.email || 'e9710092@gmail.com'}
                    </p>
                  </div>

                  {/* Theme Mode Selector Section */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-cyan-500" />
                        {t.themeMode}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setTheme('system')}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                          theme === 'system'
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Follow System Theme"
                      >
                        <Monitor className="w-3 h-3" />
                        <span>{t.system}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                          theme === 'light'
                            ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-2xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Light Theme"
                      >
                        <Sun className="w-3 h-3" />
                        <span>{t.light}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md font-medium text-[11px] transition-all cursor-pointer ${
                          theme === 'dark'
                            ? 'bg-white dark:bg-slate-700 text-cyan-400 shadow-2xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                        title="Dark Theme"
                      >
                        <Moon className="w-3 h-3" />
                        <span>{t.dark}</span>
                      </button>
                    </div>
                  </div>

                  {/* Language Selector Section */}
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Globe className="w-3 h-3 text-cyan-500" />
                        {t.language}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-lg">
                      <button
                        type="button"
                        onClick={() => handleLanguageChange('en')}
                        className={`py-1.5 px-2 rounded-md font-medium text-[11px] text-center transition-all cursor-pointer ${
                          lang === 'en'
                            ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-2xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        English
                      </button>

                      <button
                        type="button"
                        onClick={() => handleLanguageChange('am')}
                        className={`py-1.5 px-2 rounded-md font-medium text-[11px] text-center transition-all cursor-pointer ${
                          lang === 'am'
                            ? 'bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-400 shadow-2xs font-semibold'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        አማርኛ
                      </button>
                    </div>
                  </div>

                  {/* Password & Security */}
                  <div className="px-1.5 py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        navigate('/change-password');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-left"
                    >
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.changePassword}</span>
                    </button>
                  </div>

                  {/* Reference-Styled Outlined Sign Out Pill Button */}
                  <div className="p-2 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      type="button"
                      disabled={isLoggingOut}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLogout();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-700/80 hover:bg-rose-500/10 hover:border-rose-500/40 text-slate-700 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer font-medium disabled:opacity-50"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>{isLoggingOut ? t.signingOut : t.signOut}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
