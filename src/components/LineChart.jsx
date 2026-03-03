import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Calendar, CheckCircle2, Clock, UserCheck, UserX,
  TrendingUp, TrendingDown, BarChart3, Activity, Users,
  AlertCircle, MapPin, RefreshCw, Sparkles
} from 'lucide-react';
import api from '../lib/api';

// ── Typography: Fraunces (editorial serif) + Plus Jakarta Sans (refined sans) + JetBrains Mono
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

  .hr-root {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  }
  .hr-root * {
    font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
  }
  .font-display {
    font-family: 'Fraunces', Georgia, serif !important;
  }
  .font-data {
    font-family: 'JetBrains Mono', ui-monospace, monospace !important;
    font-variant-numeric: tabular-nums;
  }

  /* ── Subtle dot-grid watermark that adapts to light/dark ── */
  .hr-grid-bg {
    background-image: radial-gradient(circle, hsl(var(--border)) 1px, transparent 1px);
    background-size: 24px 24px;
  }

  /* ── Stat card hover glow ring ── */
  .stat-card-ring {
    position: relative;
  }
  .stat-card-ring::after {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 14px;
    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
  }
  .stat-card-ring:hover::after {
    opacity: 1;
  }

  /* ── Progress bar fill animation ── */
  @keyframes fillBar {
    from { width: 0%; }
    to   { width: var(--bar-w); }
  }
  .bar-fill {
    animation: fillBar 0.9s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
  }

  /* ── Fade-up for cards on mount ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .anim-fade-up {
    animation: fadeUp 0.45s ease both;
  }
  .anim-delay-1 { animation-delay: 0.05s; }
  .anim-delay-2 { animation-delay: 0.10s; }
  .anim-delay-3 { animation-delay: 0.15s; }
  .anim-delay-4 { animation-delay: 0.20s; }

  /* Spinner */
  @keyframes spin { to { transform: rotate(360deg); } }
  .spin { animation: spin 0.9s linear infinite; }
`;

// ── Helpers ────────────────────────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const processEmployeeData = (employees, selectedYear, selectedLocation) => {
  const map = {};
  MONTHS.forEach(m => { map[m] = { month: m, done: 0, claimed: 0, pending: 0, not_claimed: 0 }; });
  const filtered = selectedLocation === 'all' ? employees
    : employees.filter(e => e.employee_id?.includes(selectedLocation));
  filtered.forEach(emp => {
    const bump = (date, field) => {
      if (!date) return;
      const d = new Date(date);
      if (selectedYear !== 'all' && d.getFullYear() !== parseInt(selectedYear)) return;
      const i = d.getMonth();
      if (i >= 0 && i <= 11) map[MONTHS[i]][field]++;
    };
    if (emp.status === 'done')                   bump(emp.created_at, 'done');
    if (emp.status === 'pending')                bump(emp.created_at, 'pending');
    if (emp.current_status === 'claimed')        bump(emp.claimed_at, 'claimed');
    if (emp.current_status === 'not_claimed')    bump(emp.ID_created || emp.created_at, 'not_claimed');
  });
  return Object.values(map);
};

const generateYearOptions = () => {
  const y = new Date().getFullYear();
  return Array.from({ length: 5 }, (_, i) => y - i);
};

const calcChange = (curr, prev) => {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return ((curr - prev) / prev * 100).toFixed(1);
};

// ── Semantic HR colour system ──────────────────────────────────────────────────
// Uses hand-picked values that render beautifully in both light & dark contexts
const C = {
  done:        { hex: '#059669', muted: 'rgba(5,150,105,0.12)',  ring: 'rgba(5,150,105,0.30)'  },
  pending:     { hex: '#B45309', muted: 'rgba(180,83,9,0.12)',   ring: 'rgba(180,83,9,0.30)'   },
  claimed:     { hex: '#1D4ED8', muted: 'rgba(29,78,216,0.12)',  ring: 'rgba(29,78,216,0.30)'  },
  not_claimed: { hex: '#B91C1C', muted: 'rgba(185,28,28,0.12)', ring: 'rgba(185,28,28,0.30)'  },
};

const SERIES = [
  { key: 'done',        name: 'Done',        ...C.done        },
  { key: 'pending',     name: 'Pending',     ...C.pending     },
  { key: 'claimed',     name: 'Claimed',     ...C.claimed     },
  { key: 'not_claimed', name: 'Not Claimed', ...C.not_claimed },
];

// ── Recharts tooltip ───────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border shadow-2xl py-3 px-4 min-w-[170px]"
         style={{ background: 'hsl(var(--popover))', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <p className="font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground mb-2.5"
         style={{ fontFamily: 'Fraunces, serif', letterSpacing: '0.14em' }}>
        {label}
      </p>
      {payload.map(p => (
        <div key={p.dataKey} className="flex items-center justify-between gap-5 py-[3px]">
          <div className="flex items-center gap-2">
            <span className="w-[6px] h-[6px] rounded-full flex-shrink-0" style={{ background: p.color }} />
            <span className="text-xs text-muted-foreground">{p.name}</span>
          </div>
          <span className="text-sm font-medium"
                style={{ color: p.color, fontFamily: 'JetBrains Mono, monospace' }}>
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── Custom recharts legend ─────────────────────────────────────────────────────
const CustomLegend = ({ payload }) => (
  <div className="flex flex-wrap justify-center gap-4 mt-4">
    {payload?.map((p, i) => (
      <div key={i} className="flex items-center gap-2">
        <span className="w-5 h-[2.5px] rounded-full inline-block" style={{ background: p.color }} />
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '0.08em' }}>
          {p.value}
        </span>
      </div>
    ))}
  </div>
);

// ── Axis tick ──────────────────────────────────────────────────────────────────
const tickStyle = {
  fill: 'hsl(var(--muted-foreground))',
  fontSize: 11,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

// ── Inline progress bar ────────────────────────────────────────────────────────
function MiniProgressBar({ value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="h-[3px] w-full rounded-full mt-3 overflow-hidden"
         style={{ background: `${color}22` }}>
      <div
        className="h-full rounded-full bar-fill"
        style={{ '--bar-w': `${pct}%`, background: color, width: `${pct}%` }}
      />
    </div>
  );
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ title, value, subtitle, icon: Icon, color, muted, ring, change, extra, total, animClass }) {
  const pct  = parseFloat(change);
  const up   = pct > 0;
  const show = change !== 0 && !isNaN(pct) && pct !== 0;

  return (
    <Card className={`relative overflow-hidden border border-border bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 cursor-default ${animClass}`}
          style={{ borderRadius: 14 }}>
      {/* Top accent stripe */}
      <div className="absolute top-0 inset-x-0 h-[3px] rounded-t-[14px]" style={{ background: color }} />

      {/* Ambient corner glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full pointer-events-none opacity-0 group-hover:opacity-100"
           style={{ background: muted, filter: 'blur(20px)' }} />

      <CardContent className="pt-5 pb-4 px-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                 style={{ background: muted }}>
              <Icon size={16} style={{ color }} />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-muted-foreground"
               style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {title}
            </p>
          </div>

          {show && (
            <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                 style={{
                   background: up ? 'rgba(5,150,105,0.12)' : 'rgba(185,28,28,0.12)',
                   color: up ? '#059669' : '#B91C1C',
                   fontFamily: 'JetBrains Mono, monospace',
                 }}>
              {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
              {Math.abs(pct)}%
            </div>
          )}
        </div>

        <div className="font-display text-4xl font-semibold tracking-tight text-foreground"
             style={{ fontFamily: 'Fraunces, serif', fontVariantNumeric: 'tabular-nums' }}>
          {value.toLocaleString()}
        </div>

        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>

        <MiniProgressBar value={value} max={total} color={color} />

        {extra && <div className="mt-2.5">{extra}</div>}
      </CardContent>
    </Card>
  );
}

// ── Chart wrapper ──────────────────────────────────────────────────────────────
function ChartCard({ icon: Icon, title, description, children, accentColor = '#059669' }) {
  return (
    <Card className="border border-border bg-card shadow-sm overflow-hidden" style={{ borderRadius: 14 }}>
      <CardHeader className="border-b border-border/60 bg-muted/30 py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
               style={{ background: `${accentColor}18` }}>
            <Icon size={15} style={{ color: accentColor }} />
          </div>
          <div>
            <CardTitle className="font-display text-sm font-semibold text-foreground"
                       style={{ fontFamily: 'Fraunces, serif' }}>
              {title}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5 sm:p-6">{children}</CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function EmployeeStatusAnalytics() {
  const [data,             setData]             = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState(null);
  const [selectedYear,     setSelectedYear]     = useState(new Date().getFullYear().toString());
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [employees,        setEmployees]        = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/api/employees');
        setEmployees(res.data);
        setData(processEmployeeData(res.data, selectedYear, selectedLocation));
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || 'Unexpected error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (employees.length > 0)
      setData(processEmployeeData(employees, selectedYear, selectedLocation));
  }, [selectedYear, selectedLocation, employees]);

  const total = {
    done:        data.reduce((s, d) => s + d.done, 0),
    claimed:     data.reduce((s, d) => s + d.claimed, 0),
    pending:     data.reduce((s, d) => s + d.pending, 0),
    not_claimed: data.reduce((s, d) => s + d.not_claimed, 0),
  };
  const grandTotal = total.done + total.pending + total.claimed + total.not_claimed;
  const cm   = new Date().getMonth();
  const last = data[cm]     || {};
  const prev = data[cm - 1] || {};
  const pieData = SERIES.map(s => ({ name: s.name, value: total[s.key], color: s.hex }));
  const descSuffix = `${selectedYear === 'all' ? 'All time' : selectedYear}${selectedLocation !== 'all' ? ` · ${selectedLocation}` : ''}`;

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="hr-root flex items-center justify-center min-h-[600px] bg-background">
      <style>{fontStyle}</style>
      <div className="flex flex-col items-center gap-5">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-border" />
          <div className="absolute inset-0 rounded-full border-2 border-t-emerald-600 border-transparent spin" />
        </div>
        <div className="text-center">
          <p className="font-display text-base font-semibold text-foreground"
             style={{ fontFamily: 'Fraunces, serif' }}>Loading Analytics</p>
          <p className="text-xs text-muted-foreground mt-1">Fetching employee data…</p>
        </div>
      </div>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────────────────────
  if (error) return (
    <div className="hr-root flex items-center justify-center min-h-[600px] p-6 bg-background">
      <style>{fontStyle}</style>
      <Card className="w-full max-w-md border-border bg-card" style={{ borderRadius: 14 }}>
        <CardHeader className="border-b border-border/60 bg-destructive/5 rounded-t-[14px] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-xl">
              <AlertCircle className="text-destructive" size={18} />
            </div>
            <div>
              <CardTitle className="font-display text-sm font-semibold text-foreground"
                         style={{ fontFamily: 'Fraunces, serif' }}>
                Unable to Load Data
              </CardTitle>
              <CardDescription className="text-xs">Something went wrong fetching analytics</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-5 space-y-3">
          <div className="p-3 bg-destructive/5 rounded-xl border border-destructive/20">
            <p className="text-[10px] font-bold uppercase tracking-wider text-destructive mb-1">Error</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
          <div className="p-3 bg-muted/40 rounded-xl border border-border">
            <p className="text-xs font-semibold text-foreground mb-2">Troubleshooting</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Ensure backend server is running</li>
              <li>Check your network connection</li>
              <li>Verify API endpoint configuration</li>
            </ul>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-destructive hover:bg-destructive/90 text-destructive-foreground text-sm font-semibold rounded-xl transition-colors"
          >
            <RefreshCw size={13} />
            Retry Connection
          </button>
        </CardContent>
      </Card>
    </div>
  );

  // ── Main ─────────────────────────────────────────────────────────────────────
  return (
    <div className="hr-root hr-grid-bg w-full min-h-screen bg-background">
      <style>{fontStyle}</style>

      <div className="w-full space-y-6 p-5 sm:p-7 max-w-screen-2xl mx-auto">

        {/* ── Page header ────────────────────────────────────────────────────── */}
        <div className="anim-fade-up flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 pb-1">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-6 h-6 rounded-lg bg-emerald-600/15 flex items-center justify-center">
                <Sparkles size={12} className="text-emerald-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600">
                HR Analytics
              </span>
            </div>
            <h1 className="font-display text-2xl sm:text-[1.75rem] font-semibold text-foreground leading-snug"
                style={{ fontFamily: 'Fraunces, serif' }}>
              Employee Status Dashboard
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor ID status, claims, and workforce trends at a glance
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2.5 flex-shrink-0">
            {/* Location filter */}
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm hover:border-emerald-600/40 transition-colors">
              <MapPin size={13} className="text-emerald-600 flex-shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Location</span>
              <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                <SelectTrigger className="h-6 border-0 bg-transparent shadow-none text-xs font-semibold text-foreground focus:ring-0 px-0 w-[130px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border rounded-xl">
                  {[['all','All Locations'],['ALIMDC','ALIMDC'],['ALITAG','ALITAG'],
                    ['ALIPAL','ALIPAL'],['TEMPO-ALICEBU','TEMPO-ALICEBU'],['TEMPO-ALIDAVAO','TEMPO-ALIDAVAO']
                  ].map(([v, l]) => (
                    <SelectItem key={v} value={v}
                      className="text-xs font-medium text-popover-foreground focus:bg-accent rounded-lg">
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year filter */}
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2 shadow-sm hover:border-emerald-600/40 transition-colors">
              <Calendar size={13} className="text-emerald-600 flex-shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Year</span>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="h-6 border-0 bg-transparent shadow-none text-xs font-semibold text-foreground focus:ring-0 px-0 w-[80px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border rounded-xl">
                  <SelectItem value="all" className="text-xs font-semibold text-popover-foreground focus:bg-accent rounded-lg">All Time</SelectItem>
                  {generateYearOptions().map(y => (
                    <SelectItem key={y} value={y.toString()}
                      className="text-xs font-medium text-popover-foreground focus:bg-accent rounded-lg">
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator className="opacity-60" />

        {/* ── KPI cards ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Done" value={total.done} subtitle="Completed IDs" total={grandTotal}
            icon={CheckCircle2} color={C.done.hex} muted={C.done.muted} ring={C.done.ring}
            change={calcChange(last.done ?? 0, prev.done ?? 0)}
            animClass="anim-fade-up anim-delay-1"
          />
          <StatCard
            title="Pending" value={total.pending} subtitle="Awaiting completion" total={grandTotal}
            icon={Clock} color={C.pending.hex} muted={C.pending.muted} ring={C.pending.ring}
            change={calcChange(last.pending ?? 0, prev.pending ?? 0)}
            animClass="anim-fade-up anim-delay-2"
          />
          <StatCard
            title="Claimed" value={total.claimed} subtitle="Successfully claimed" total={grandTotal}
            icon={UserCheck} color={C.claimed.hex} muted={C.claimed.muted} ring={C.claimed.ring}
            change={calcChange(last.claimed ?? 0, prev.claimed ?? 0)}
            animClass="anim-fade-up anim-delay-3"
          />
          <StatCard
            title="Not Claimed" value={total.not_claimed} subtitle="Awaiting collection" total={grandTotal}
            icon={UserX} color={C.not_claimed.hex} muted={C.not_claimed.muted} ring={C.not_claimed.ring}
            change={calcChange(last.not_claimed ?? 0, prev.not_claimed ?? 0)}
            animClass="anim-fade-up anim-delay-4"
            extra={
              <Badge
                variant="outline"
                className="text-[9px] h-4 px-1.5 border-red-500/30 text-red-600 bg-red-500/5"
                style={{ fontFamily: 'JetBrains Mono, monospace' }}
              >
                {((total.not_claimed / (total.claimed + total.not_claimed || 1)) * 100).toFixed(0)}% rate
              </Badge>
            }
          />
        </div>

        {/* ── Summary pill row ─────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50 mr-1">
            Total records
          </span>
          {SERIES.map(s => (
            <div
              key={s.key}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold"
              style={{
                borderColor: `${s.hex}35`,
                background:  `${s.hex}0e`,
                color:        s.hex,
                fontFamily:  'JetBrains Mono, monospace',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: s.hex }} />
              {s.name}: {total[s.key].toLocaleString()}
            </div>
          ))}
          <div className="ml-auto text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
            Grand total:{' '}
            <span className="text-foreground" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              {grandTotal.toLocaleString()}
            </span>
          </div>
        </div>

        {/* ── Chart tabs ───────────────────────────────────────────────────────── */}
        <Tabs defaultValue="area" className="w-full">
          <TabsList className="h-9 bg-muted/50 border border-border rounded-xl p-1 gap-0.5 w-auto inline-flex mb-5">
            {[
              { value: 'area', icon: Activity,  label: 'Trends'      },
              { value: 'bar',  icon: BarChart3,  label: 'Compare'    },
              { value: 'pie',  icon: Users,      label: 'Distribution'},
            ].map(({ value, icon: Icon, label }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3.5 h-7 rounded-lg data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all"
              >
                <Icon size={12} />
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* ── Area trend chart ──────────────────────────────────────────────── */}
          <TabsContent value="area">
            <ChartCard
              icon={Activity} accentColor={C.done.hex}
              title="Status Trends Over Time"
              description={`Monthly employee status progression · ${descSuffix}`}
            >
              <ResponsiveContainer width="100%" height={380}>
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -8, bottom: 0 }}>
                  <defs>
                    {SERIES.map(s => (
                      <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor={s.hex} stopOpacity={0.20} />
                        <stop offset="100%" stopColor={s.hex} stopOpacity={0.01} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.6} />
                  <XAxis dataKey="month" tick={tickStyle} stroke="transparent" tickLine={false} />
                  <YAxis tick={tickStyle} stroke="transparent" tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '3 3' }} />
                  <Legend content={<CustomLegend />} />
                  {SERIES.map(s => (
                    <Area
                      key={s.key} type="monotone" dataKey={s.key} name={s.name}
                      stroke={s.hex} strokeWidth={2}
                      fill={`url(#grad-${s.key})`}
                      dot={false}
                      activeDot={{ r: 5, strokeWidth: 2, stroke: 'hsl(var(--background))', fill: s.hex }}
                    />
                  ))}
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </TabsContent>

          {/* ── Bar comparison chart ──────────────────────────────────────────── */}
          <TabsContent value="bar">
            <ChartCard
              icon={BarChart3} accentColor={C.claimed.hex}
              title="Monthly Comparison"
              description={`Side-by-side status view · ${descSuffix}`}
            >
              <ResponsiveContainer width="100%" height={380}>
                <BarChart data={data} margin={{ top: 10, right: 10, left: -8, bottom: 0 }} barGap={2} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.6} vertical={false} />
                  <XAxis dataKey="month" tick={tickStyle} stroke="transparent" tickLine={false} />
                  <YAxis tick={tickStyle} stroke="transparent" tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.4, radius: 6 }} />
                  <Legend content={<CustomLegend />} />
                  {SERIES.map(s => (
                    <Bar key={s.key} dataKey={s.key} name={s.name} fill={s.hex} radius={[5, 5, 0, 0]} maxBarSize={20} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </TabsContent>

          {/* ── Donut + breakdown ─────────────────────────────────────────────── */}
          <TabsContent value="pie">
            <ChartCard
              icon={Users} accentColor={C.pending.hex}
              title="Overall Distribution"
              description={`Status breakdown across all records · ${descSuffix}`}
            >
              <div className="flex flex-col lg:flex-row items-center gap-8">
                <div className="w-full lg:flex-1">
                  <ResponsiveContainer width="100%" height={340}>
                    <PieChart>
                      <Pie
                        data={pieData} cx="50%" cy="50%"
                        innerRadius={82} outerRadius={136}
                        paddingAngle={3} dataKey="value"
                        label={({ percent }) => percent > 0.05 ? `${(percent * 100).toFixed(0)}%` : ''}
                        labelLine={false}
                        strokeWidth={0}
                      >
                        {pieData.map((e, i) => (
                          <Cell key={i} fill={e.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                      {/* Centre label */}
                      <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle"
                            style={{ fontFamily: 'Fraunces, serif', fontSize: 30, fontWeight: 600,
                                     fill: 'hsl(var(--foreground))' }}>
                        {grandTotal.toLocaleString()}
                      </text>
                      <text x="50%" y="56%" textAnchor="middle" dominantBaseline="middle"
                            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif', fontSize: 11,
                                     fill: 'hsl(var(--muted-foreground))', letterSpacing: '0.08em',
                                     textTransform: 'uppercase' }}>
                        Total Records
                      </text>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Breakdown legend cards */}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5 w-full lg:w-52 flex-shrink-0">
                  {pieData.map(item => {
                    const pct = ((item.value / (grandTotal || 1)) * 100).toFixed(1);
                    return (
                      <div
                        key={item.name}
                        className="relative overflow-hidden flex items-center gap-3 px-3.5 py-3 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors cursor-default"
                        style={{ borderRadius: 12 }}
                      >
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-[12px]"
                             style={{ background: item.color }} />
                        <div className="pl-0.5 flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground truncate">
                            {item.name}
                          </p>
                          <div className="flex items-baseline gap-2 mt-0.5">
                            <span className="text-xl font-semibold tabular-nums"
                                  style={{ color: item.color, fontFamily: 'Fraunces, serif' }}>
                              {item.value.toLocaleString()}
                            </span>
                            <span className="text-[10px] font-bold text-muted-foreground"
                                  style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                              {pct}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </ChartCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}