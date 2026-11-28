import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users2,
  Building2,
  Briefcase,
  TicketCheck,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  Calendar,
  AlertCircle,
  FileText,
  PhoneCall,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePermission } from '../../hooks/usePermission';
import Can from '../../components/auth/Can';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { apiClient } from '../../services/api';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { can } = usePermission();
  const navigate = useNavigate();

  const [leadMetrics, setLeadMetrics] = useState<{
    total: number;
    new: number;
    contacted: number;
    qualified: number;
    converted: number;
    conversion_rate_pct: number;
  } | null>(null);

  useEffect(() => {
    if (!can('leads.view')) return;
    apiClient
      .get('/leads/metrics')
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setLeadMetrics(res.data.data);
        }
      })
      .catch(() => {
        // Fall back gracefully if server is busy or offline
      });
  }, [can]);

  const displayName =
    user?.first_name && user.first_name.toLowerCase() !== 'system'
      ? `${user.first_name} ${user.last_name || ''}`.trim()
      : (user?.full_name || 'System Administrator');

  const metrics = [
    {
      label: 'Active Leads Pipeline',
      value: leadMetrics?.total ? String(leadMetrics.total) : '142',
      change: '+12.4%',
      period: 'vs last month',
      icon: Users2,
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-100 dark:border-cyan-800/40',
    },
    {
      label: 'Corporate Accounts',
      value: '68',
      change: '+4 new',
      period: 'this quarter',
      icon: Building2,
      iconColor: 'text-sky-600 dark:text-sky-400',
      iconBg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-100 dark:border-sky-800/40',
    },
    {
      label: 'Open Deals & Grants',
      value: 'ETB 24.8M',
      change: '18 Deals',
      period: 'in negotiation',
      icon: Briefcase,
      iconColor: 'text-amber-600 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-100 dark:border-amber-800/40',
    },
    {
      label: 'SLA Response Rate',
      value: '99.2%',
      change: 'Target 99%',
      period: '0 active breaches',
      icon: TicketCheck,
      iconColor: 'text-purple-600 dark:text-purple-400',
      iconBg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-100 dark:border-purple-800/40',
    },
  ];

  const pipelineStages = [
    {
      name: 'New Inbound Lead',
      count: leadMetrics?.new ?? 42,
      pct: 100,
      barGradient: 'bg-gradient-to-r from-cyan-500 to-teal-400',
    },
    {
      name: 'Contacted & Discovery',
      count: leadMetrics?.contacted ?? 36,
      pct: 85,
      barGradient: 'bg-gradient-to-r from-teal-500 to-cyan-400',
    },
    {
      name: 'Proposal / Due Diligence',
      count: leadMetrics?.qualified ?? 24,
      pct: 57,
      barGradient: 'bg-gradient-to-r from-sky-500 to-blue-500',
    },
    {
      name: 'Incubation Agreement',
      count: 18,
      pct: 42,
      barGradient: 'bg-gradient-to-r from-blue-500 to-indigo-500',
    },
    {
      name: 'Active Park Tenant',
      count: leadMetrics?.converted ?? 12,
      pct: 28,
      barGradient: 'bg-gradient-to-r from-slate-600 to-slate-500 dark:from-slate-600 dark:to-slate-400',
    },
  ];

  const recentActivities = [
    {
      id: 1,
      title: 'New Lead Inbound',
      organization: 'Ethio-Fintech Global',
      description: 'Applied for incubation space (Tier 1)',
      time: '15m ago',
      icon: FileText,
      iconColor: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-100 dark:border-cyan-800/40',
    },
    {
      id: 2,
      title: 'Proposal Submitted',
      organization: 'East Africa Cloud Technologies',
      description: '750 sqm data center lease proposal sent',
      time: '2h ago',
      icon: Briefcase,
      iconColor: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border-sky-100 dark:border-sky-800/40',
    },
    {
      id: 3,
      title: 'Discovery Call Completed',
      organization: 'Safaricom Enterprise Solutions',
      description: 'BDO meeting completed with technical lead',
      time: '4h ago',
      icon: PhoneCall,
      iconColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-100 dark:border-indigo-800/40',
    },
    {
      id: 4,
      title: 'Tenancy Agreement Signed',
      organization: 'AfroTech Innovation Hub',
      description: 'Signed facility onboarding agreement',
      time: 'Yesterday',
      icon: UserCheck,
      iconColor: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-100 dark:border-teal-800/40',
    },
  ];

  const priorityTasks = [
    {
      id: 1,
      title: 'Qualify 3 new inbound startup applications',
      due: 'Today',
      priority: 'High',
      priorityVariant: 'rose' as const,
      icon: AlertCircle,
    },
    {
      id: 2,
      title: 'Send tenant onboarding packet to Safaricom team',
      due: 'Tomorrow',
      priority: 'Normal',
      priorityVariant: 'slate' as const,
      icon: Clock,
    },
    {
      id: 3,
      title: 'Review quarterly SLA response compliance report',
      due: 'In 2 days',
      priority: 'Normal',
      priorityVariant: 'slate' as const,
      icon: Calendar,
    },
  ];

  return (
    <AppShell
      title="Executive Overview"
      subtitle="Ethiopian IT Park Central Management Console"
    >
      <div className="space-y-6">
        {/* Welcome Banner (Floating Card Aesthetic) */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                Welcome back, {displayName}
              </h1>
              <Badge variant="cyan" size="sm" dot>
                {user?.role?.role_name || 'Administrator'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Operational overview across tenant relationships, pipeline progression, and SLA performance.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Can permission="leads.view">
              <Button
                variant="outline"
                size="sm"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => navigate('/leads')}
              >
                View Pipeline
              </Button>
            </Can>
            <Can permission="leads.create">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                onClick={() => navigate('/leads')}
              >
                New Inbound Lead
              </Button>
            </Can>
          </div>
        </div>

        {/* 4 Primary KPI Metric Cards (Floating Metric Boxes) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="p-5 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] hover:border-slate-300 dark:hover:border-slate-700/80 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {metric.label}
                  </span>
                  <div className={`p-2 rounded-xl border ${metric.iconBg} ${metric.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3">
                  <div className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight font-mono">
                    {metric.value}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-xs">
                    <span className="inline-flex items-center font-medium text-cyan-600 dark:text-cyan-400 font-mono">
                      <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                      {metric.change}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="text-slate-500 dark:text-slate-400">{metric.period}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Grid: Pipeline Funnel & CRM Business Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pipeline Funnel Stage Distribution (2 cols) */}
          <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] space-y-6 flex flex-col justify-between transition-colors">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                    Startup & Enterprise Onboarding Funnel
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Progression across official Ethiopian IT Park onboarding stages
                  </p>
                </div>
                <Badge variant="cyan" size="sm">
                  Current Cycle
                </Badge>
              </div>

              <div className="space-y-4 pt-1">
                {pipelineStages.map((stage) => (
                  <div key={stage.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {stage.name}
                      </span>
                      <span className="font-mono text-slate-500 dark:text-slate-400">
                        {stage.count} entities
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800/90 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${stage.barGradient} transition-all duration-500 shadow-xs`}
                        style={{ width: `${stage.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Funnel Health Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 dark:bg-[#0b1120] border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono block">
                  Conversion Rate
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5 block">
                  {leadMetrics?.conversion_rate_pct ? `${leadMetrics.conversion_rate_pct}%` : '28.6%'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 dark:bg-[#0b1120] border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono block">
                  Avg. Qualification
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white font-mono mt-0.5 block">
                  4.2 Days
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-850/60 dark:bg-[#0b1120] border border-slate-100 dark:border-slate-800/80">
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-mono block">
                  SLA Compliance
                </span>
                <span className="text-sm font-bold text-cyan-600 dark:text-cyan-400 font-mono mt-0.5 block">
                  100% Target
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: CRM Business Widgets */}
          <div className="space-y-6">
            {/* Widget 1: Recent Relationship Activity */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] space-y-4 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                    Recent Activity
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Live tenant & deal updates</p>
                </div>
                <CheckCircle2 className="w-4 h-4 text-cyan-500" />
              </div>

              <div className="space-y-3">
                {recentActivities.map((act) => {
                  const Icon = act.icon;
                  return (
                    <div
                      key={act.id}
                      className="flex items-start gap-3 text-xs p-1.5 -mx-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <div className={`p-2 rounded-xl border shrink-0 ${act.iconColor}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {act.organization}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono shrink-0 ml-2">
                            {act.time}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {act.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Widget 2: Priority Tasks & Follow-ups */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#0f172a]/95 border border-slate-200/90 dark:border-slate-800/80 shadow-xs dark:shadow-[0_4px_25px_rgba(0,0,0,0.4)] space-y-4 transition-colors">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white tracking-tight">
                    Priority Action Items
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Pending tasks requiring review
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold border border-slate-200 dark:border-slate-700/60">
                  {priorityTasks.length} Pending
                </span>
              </div>

              <div className="space-y-2.5">
                {priorityTasks.map((task) => {
                  const Icon = task.icon;
                  return (
                    <div
                      key={task.id}
                      className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700/80 bg-slate-50/60 dark:bg-[#0b1120]/70 transition-colors flex items-start justify-between gap-2.5 text-xs"
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <Icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 dark:text-slate-200 leading-snug">
                            {task.title}
                          </p>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5 block">
                            Due {task.due}
                          </span>
                        </div>
                      </div>
                      <Badge variant={task.priorityVariant} size="sm">
                        {task.priority}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default DashboardPage;
