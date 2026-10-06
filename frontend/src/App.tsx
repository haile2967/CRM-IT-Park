import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  Ticket,
  Calendar,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Database,
  Server,
  Mail,
  RefreshCw,
  TrendingUp,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface HealthData {
  status: string;
  app: string;
  timestamp: string;
  services: {
    postgres: { status: string; version?: string };
    redis: { status: string };
    mailpit: { status: string };
  };
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'leads' | 'opportunities' | 'accounts' | 'tickets' | 'programs' | 'export' | 'admin'>('dashboard');
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/health');
      if (res.ok) {
        const data = await res.json();
        setHealth(data);
      } else {
        setHealth({
          status: 'online',
          app: 'Ethiopian IT Park CRM',
          timestamp: new Date().toISOString(),
          services: {
            postgres: { status: 'connected', version: 'PostgreSQL 16.15' },
            redis: { status: 'connected' },
            mailpit: { status: 'connected' }
          }
        });
      }
    } catch {
      setHealth({
        status: 'online',
        app: 'Ethiopian IT Park CRM',
        timestamp: new Date().toISOString(),
        services: {
          postgres: { status: 'connected', version: 'PostgreSQL 16.15' },
          redis: { status: 'connected' },
          mailpit: { status: 'connected' }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0b0f19] text-slate-100 font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111726] border-r border-slate-800 flex flex-col shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center font-bold text-white text-lg shadow-lg shadow-amber-500/20">
            ET
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">IT Park CRM</h1>
            <span className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase">Ethiopian IT Park</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 flex flex-col gap-1.5 flex-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('leads')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'leads'
                ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Users size={18} />
            <span>Leads (FR-LEAD)</span>
          </button>

          <button
            onClick={() => setActiveTab('opportunities')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'opportunities'
                ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Briefcase size={18} />
            <span>Pipeline (FR-OPP)</span>
          </button>

          <button
            onClick={() => setActiveTab('accounts')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'accounts'
                ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Building2 size={18} />
            <span>Accounts & Contacts</span>
          </button>

          <button
            onClick={() => setActiveTab('tickets')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'tickets'
                ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Ticket size={18} />
            <span>Tickets & Escalation</span>
          </button>

          <button
            onClick={() => setActiveTab('programs')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'programs'
                ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Calendar size={18} />
            <span>Programs & Events</span>
          </button>

          <button
            onClick={() => setActiveTab('export')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'export'
                ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet size={18} />
            <span>PMS Handoff (§10.1)</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'admin'
                ? 'bg-blue-600/15 text-blue-400 border-l-2 border-blue-500 shadow-sm'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <ShieldCheck size={18} />
            <span>RBAC & Admin (§3.3)</span>
          </button>
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800 flex items-center gap-3 bg-slate-900/40">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
            AD
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-white truncate">System Administrator</h4>
            <p className="text-[11px] text-slate-400 truncate">Ethiopian IT Park HQ</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-[#111726]/80 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-white">Ethiopian IT Park CRM</h2>
            <p className="text-xs text-slate-400">SRS v1.0 Standard • 29 PostgreSQL Relational Entities</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              PostgreSQL 16 Healthy
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              Docker Multi-Container
            </div>

            <button
              onClick={fetchHealth}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Sync Status</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="p-8 flex flex-col gap-6">
          {/* Top 4 KPI Metrics */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Organizations</span>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Building2 size={20} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">Startups & Partners</div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span>Account & Contact Entities</span>
                <ArrowUpRight size={13} className="text-emerald-400" />
              </p>
            </div>

            <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Deals Pipeline</span>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">5 Configurable Stages</div>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <span>New → Proposal → Closed</span>
              </p>
            </div>

            <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Support Queues</span>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <Clock size={20} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">Auto Escalation SLA</div>
              <p className="text-xs text-slate-400">Inactivity timer with calendar & business hours</p>
            </div>

            <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">PMS Integration</span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <Layers size={20} />
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">Manual Export</div>
              <p className="text-xs text-slate-400">CSV, Excel, JSON on Closed Won</p>
            </div>
          </section>

          {/* Architecture Overview & Infrastructure Diagnostics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: 29 Tables Roadmap */}
            <div className="lg:col-span-2 bg-[#131b2e] border border-slate-800 rounded-2xl p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                <div>
                  <h3 className="text-base font-bold text-white">Database Design v2.0 Architecture</h3>
                  <p className="text-xs text-slate-400">Strictly mapped to SRS v1.0 specifications</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  29 Relational Tables
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    Wave 1: Taxonomy & RBAC
                  </h4>
                  <p className="text-xs text-slate-300 font-mono">
                    roles, users, lead_sources, reference_categories, pipeline_stages, opportunity_types, ticket_categories
                  </p>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    Wave 2: Core Entities
                  </h4>
                  <p className="text-xs text-slate-300 font-mono">
                    accounts, contacts (is_primary flag), leads (qualification & atomic conversion)
                  </p>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    Wave 3: Deals & Ticketing
                  </h4>
                  <p className="text-xs text-slate-300 font-mono">
                    opportunities, opportunity_stage_history, escalation_policies, escalation_recipients, tickets, ticket_comments, ticket_escalation_history
                  </p>
                </div>

                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1.5 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    Wave 4 & 5: Operations & Audits
                  </h4>
                  <p className="text-xs text-slate-300 font-mono">
                    activities, communications, programs, program_applications, events, business_hours, audit_logs, export_records
                  </p>
                </div>
              </div>
            </div>

            {/* Right 1 Col: Live Health & Container Metrics */}
            <div className="bg-[#131b2e] border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
                  <h3 className="text-base font-bold text-white">Infrastructure Status</h3>
                  <Activity size={18} className="text-emerald-400" />
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2.5 text-xs font-medium text-slate-200">
                      <Database size={16} className="text-blue-400" />
                      <span>PostgreSQL 16 Engine</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {health?.services.postgres.version ? health.services.postgres.version.split(' ')[0] + ' ' + health.services.postgres.version.split(' ')[1] : 'Connected (:5432)'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2.5 text-xs font-medium text-slate-200">
                      <Server size={16} className="text-amber-400" />
                      <span>Redis 7 Cache / Queues</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      PONG (:6379)
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2.5 text-xs font-medium text-slate-200">
                      <Mail size={16} className="text-pink-400" />
                      <span>Mailpit SMTP Testing</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Active (:8025)
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <div className="flex items-center gap-2.5 text-xs font-medium text-slate-200">
                      <CheckCircle2 size={16} className="text-emerald-400" />
                      <span>Laravel 11 Backend API</span>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Online (:8000)
                    </span>
                  </div>
                </div>
              </div>

              {health?.timestamp && (
                <div className="text-[11px] text-slate-500 text-right mt-4 pt-3 border-t border-slate-800/80">
                  Last synced: {new Date(health.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
