import React, { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Users2,
  Building2,
  Contact2,
  Briefcase,
  TicketCheck,
  LogOut,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Menu,
  X,
  Bell,
  User,
  Key,
  FolderKanban,
  Layers,
  Calendar,
  Box,
  Clock,
  ShieldCheck,
  BarChart3,
  FileText,
  BookOpen,
  PanelLeftClose,
  UserCog,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

interface NavSubItem {
  label: string;
  to: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  id: string;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavSubItem[];
}

const navSections: NavSection[] = [
  {
    id: 'pipeline',
    title: 'Relationship & Pipeline',
    icon: FolderKanban,
    items: [
      { label: 'Leads Pipeline', to: '/leads', icon: Users2 },
      { label: 'Corporate Accounts', to: '/accounts', icon: Building2 },
      { label: 'Contacts Directory', to: '/contacts', icon: Contact2 },
      { label: 'Lead Categories', to: '/categories', icon: Layers },
    ],
  },
  {
    id: 'deals',
    title: 'Deals & Agreements',
    icon: Briefcase,
    items: [
      { label: 'Deals & Opportunities', to: '/opportunities', icon: Briefcase },
      { label: 'Pipeline Stages', to: '/pipeline-stages', icon: Layers },
      { label: 'Incubation Cohorts', to: '/cohorts', icon: Calendar },
      { label: 'Facility Allocation', to: '/facilities', icon: Box },
    ],
  },
  {
    id: 'support',
    title: 'Support & Operations',
    icon: TicketCheck,
    items: [
      { label: 'Support Tickets', to: '/tickets', icon: TicketCheck },
      { label: 'Escalation Policies', to: '/escalations', icon: Clock },
      { label: 'SLA Monitoring', to: '/sla', icon: ShieldCheck },
    ],
  },
  {
    id: 'reports',
    title: 'Reports & Statements',
    icon: BarChart3,
    items: [
      { label: 'Executive Summary', to: '/reports', icon: FileText },
      { label: 'Audit Trail', to: '/audit-trail', icon: BookOpen },
    ],
  },
  {
    id: 'admin',
    title: 'System Administration',
    icon: ShieldCheck,
    items: [
      { label: 'User Management', to: '/users', icon: UserCog },
      { label: 'Role Management', to: '/roles', icon: Key },
    ],
  },
];

export const AppShell: React.FC<AppShellProps> = ({
  children,
  title = 'Overview',
  subtitle = 'Ethiopian IT Park Relationship Management',
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('crm_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    pipeline: true,
    deals: true,
    support: true,
    reports: false,
    admin: true,
  });

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

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
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
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="h-screen flex flex-col md:flex-row antialiased text-slate-900 bg-slate-50 overflow-hidden">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-xs">
            ITP
          </div>
          <div>
            <span className="font-semibold text-sm tracking-tight text-slate-900 block leading-tight">
              Ethiopian IT Park
            </span>
            <span className="text-[10px] text-slate-500 font-mono">CRM Core</span>
          </div>
        </div>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1.5 text-slate-600 hover:text-slate-900 rounded-md border border-slate-200 hover:bg-slate-50"
          aria-label="Toggle navigation"
        >
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50 h-full bg-slate-900 text-slate-300 flex flex-col shrink-0 overflow-x-hidden
          transition-all duration-300 ease-in-out border-r border-slate-800
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'w-64 md:w-16' : 'w-64'}
        `}
      >
        {/* Brand Header */}
        <div
          className={`p-4 border-b border-slate-800/80 flex items-center shrink-0 ${
            isCollapsed ? 'md:justify-center md:px-2 md:py-3.5' : 'justify-between'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center text-white font-bold text-sm tracking-wider shadow-inner ring-1 ring-white/10 shrink-0">
              ITP
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="font-semibold text-sm tracking-tight text-white leading-tight truncate">
                  Ethiopian IT Park
                </h1>
                <p className="text-[11px] text-emerald-400 font-medium">Enterprise CRM</p>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Navigation Body */}
        <div
          className={`flex-1 overflow-y-auto overflow-x-hidden ${isCollapsed ? 'px-2 py-3' : 'px-3 py-3'
            } space-y-1`}
        >
          {/* Top Standalone Dashboard Link */}
          {!isCollapsed ? (
            <NavLink
              to="/dashboard"
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                ${isActive
                  ? 'bg-emerald-800/80 text-white font-semibold shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
                }
              `}
            >
              <LayoutGrid className="w-4 h-4 text-slate-400 group-hover:text-white" />
              <span>Dashboard</span>
            </NavLink>
          ) : (
            <NavLink
              to="/dashboard"
              title="Dashboard"
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `
                group relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all
                ${isActive
                  ? 'bg-emerald-800 text-white shadow-xs font-semibold ring-1 ring-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }
              `}
            >
              <LayoutGrid className="w-4.5 h-4.5" />
            </NavLink>
          )}

          {/* Grouped Accordions */}
          {navSections.map((section) => {
            const SectionIcon = section.icon;
            const isOpen = openSections[section.id];

            if (isCollapsed) {
              return (
                <React.Fragment key={section.id}>
                  {/* Subtle divider between groups */}
                  <div className="w-8 h-px bg-slate-800 mx-auto my-2.5" />
                  <div className="space-y-1.5">
                    {section.items.map((subItem) => {
                      const SubIcon = subItem.icon;
                      return (
                        <NavLink
                          key={subItem.to}
                          to={subItem.to}
                          title={subItem.label}
                          onClick={() => setIsSidebarOpen(false)}
                          className={({ isActive }) => `
                            group relative flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all
                            ${isActive
                              ? 'bg-emerald-800 text-white shadow-xs font-semibold ring-1 ring-emerald-500/30'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }
                          `}
                        >
                          <SubIcon className="w-4 h-4" />
                          <span
                            className={`w-1.5 h-1.5 rounded-full bg-emerald-400 absolute right-1 top-1/2 -translate-y-1/2 transition-opacity ${window.location.pathname === subItem.to
                                ? 'opacity-100'
                                : 'opacity-0'
                              }`}
                          />
                        </NavLink>
                      );
                    })}
                  </div>
                </React.Fragment>
              );
            }

            return (
              <div key={section.id} className="pt-2">
                {/* Accordion Header Toggle */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <SectionIcon className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="truncate">{section.title}</span>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>

                {/* Sub-items with vertical hierarchy tree line */}
                {isOpen && (
                  <div className="ml-4 pl-3 border-l border-slate-800 space-y-0.5 mt-1">
                    {section.items.map((subItem) => {
                      const SubIcon = subItem.icon;
                      return (
                        <NavLink
                          key={subItem.to}
                          to={subItem.to}
                          onClick={() => setIsSidebarOpen(false)}
                          className={({ isActive }) => `
                            flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors
                            ${isActive
                              ? 'bg-emerald-800/80 text-white font-semibold shadow-xs'
                              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                            }
                          `}
                        >
                          <SubIcon className="w-4 h-4 shrink-0 text-slate-400" />
                          <span className="truncate">{subItem.label}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Expand / Collapse Bar */}
        <div
          className={`p-3 border-t border-slate-800 bg-slate-950/40 shrink-0 ${
            isCollapsed ? 'flex justify-center' : ''
          }`}
        >
          <button
            type="button"
            onClick={toggleSidebarCollapse}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-8 h-8 rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
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
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-y-auto overflow-x-hidden">
        {/* Top Utility Header */}
        <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-6 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight leading-none">
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5 tracking-tight hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Search Cue */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 text-xs border border-slate-200">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search records...</span>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-white border border-slate-300 rounded-sm font-mono text-slate-600 shadow-2xs">
                ⌘K
              </kbd>
            </div>

            {/* Notification Bell */}
            <button
              type="button"
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
            </button>

            {/* User Profile Dropdown Trigger */}
            <div className="relative pl-1 border-l border-slate-200" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-100 transition-colors text-left cursor-pointer"
                aria-expanded={isUserMenuOpen}
              >
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-600" />
                </div>

                <div className="hidden sm:block leading-tight">
                  <p className="text-xs font-semibold text-slate-900 tracking-tight">
                    {user?.full_name || user?.first_name || 'System Administrator'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {user?.role?.role_name || 'Administrator'}
                  </p>
                </div>

                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Popover Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-slate-200/90 shadow-lg py-1.5 z-50 text-xs">
                  <div className="px-3.5 py-2.5 border-b border-slate-100">
                    <p className="font-semibold text-slate-900 text-xs truncate">
                      {user?.full_name || user?.first_name || 'System Administrator'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">
                      {user?.email || 'e9710092@gmail.com'}
                    </p>
                  </div>

                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        alert('Password changes are managed by your administrator or profile settings.');
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer text-left"
                    >
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      <span>Change password</span>
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left font-medium"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign out</span>
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
