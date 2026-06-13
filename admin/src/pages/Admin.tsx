// Admin panel - the internal Markety operations UI. Password-protected;
// no URL token scheme, just a single ADMIN_PASSWORD checked server-side.
//
// All data fetching and mutations go through api/admin.ts via fetch() calls
// with the x-admin-password header. No React Query here - state is managed
// with useState + manual refetch patterns.
//
// Tab structure (all defined as local functions in this file):
//   OverviewTab     - earnings + lead stats, monthly bar chart
//   ClientsTab      - client list, add/edit/delete clients, manual lead entry,
//                     invoice sending, onboarding checklist, lead notes
//   LeadsTab        - flat view of all leads across all clients, sortable/filterable
//   ContentTab      - LinkedIn posts and DMs in pending/approved/rejected states;
//                     generate new content, approve/reject, mark as posted
//   OutreachTab     - Nimble-powered research + personalized message generation;
//                     Nordic Solfilm contact reader with reply capability
//   EmailsTab       - IMAP inbox reader (api/emails.ts); compose + reply
//   StatsTab        - aggregate platform stats (leads/year, earnings, chart)
//
// IMPORTANT: this file is ~3300 lines. When editing, grep for the specific
// tab function name before navigating. All tab components are co-located
// here as named inner functions, not separate files.
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  ChevronDown, ChevronUp, CheckCircle2, Clock, Mail, Phone,
  Lock, Eye, EyeOff, LogOut, DollarSign, TrendingUp, Users, BarChart2,
  Copy, Check, Search, X, ExternalLink, Zap, UserPlus, List,
  ArrowUp, ArrowDown, Pencil, Save, Trash2, AlertTriangle, RotateCcw, Inbox, RefreshCw, PenLine, Plus,
} from "lucide-react";

type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  created_at: string;
  lead_status: "new" | "contacted" | "converted" | "lost";
  lead_notes: string | null;
};

type ClientRow = {
  id: string;
  token: string;
  name: string;
  company: string;
  email: string;
  phone: string | null;
  price_per_lead: number;
  currency: string;
  created_at: string;
  last_invoiced_at: string | null;
  language: string;
  lead_cap: number | null;
  cap_paused: boolean;
  deal_value: number | null;
  onboarding_steps: { ads: boolean; landing_page: boolean; lead_form: boolean; test_lead: boolean; first_lead: boolean };
  leads: Lead[];
  leads_this_month: number;
  amount_due: number;
};

type AdminStats = {
  earningsThisYear: number;
  earningsThisMonth: number;
  leadsThisYear: number;
  leadsThisMonth: number;
  totalClients: number;
  monthlyBreakdown: { month: string; leads: number; earnings: number }[];
};

type FlatLead = Lead & { clientName: string; clientId: string; currency: string };

type ContentItem = {
  id: string;
  type: "linkedin_post" | "linkedin_dm" | "email" | "x_post";
  content: string;
  recipient: string | null;
  status: "pending" | "approved" | "rejected" | "posted";
  scheduled_for: string | null;
  posted_at: string | null;
  created_at: string;
};

const ADMIN_KEY = "markety_admin_pw";

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function money(n: number, currency = "DKK") {
  return new Intl.NumberFormat("da-DK", { style: "currency", currency, maximumFractionDigits: 2 }).format(n);
}

function isInvoicedThisMonth(last: string | null): boolean {
  if (!last) return false;
  const d = new Date(last);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy}
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors px-2 py-1 rounded-md hover:bg-gray-100 shrink-0">
      {copied
        ? <><Check className="w-3 h-3 text-green-500" /><span className="text-green-600">Copied!</span></>
        : <><Copy className="w-3 h-3" />{label ?? "Copy"}</>}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-100 rounded-xl p-5 flex flex-col gap-3">
      <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
        <Icon className="w-4 h-4" style={{ color: "hsl(252 89% 58%)" }} />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function Admin() {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [authedPw, setAuthedPw] = useState<string | null>(() => sessionStorage.getItem(ADMIN_KEY));

  const [tab, setTab] = useState<"overview" | "clients" | "all-leads" | "outreach" | "emails" | "content" | "contacts" | "invoice-queue">("overview");
  const [globalSearch, setGlobalSearch] = useState("");
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hasNewContacts, setHasNewContacts] = useState(false);

  const fetchData = useCallback(async (pw: string, silent = false) => {
    if (!silent) setDataLoading(true);
    const [clientsRes, statsRes] = await Promise.all([
      fetch("/api/admin?action=clients", { headers: { "x-admin-password": pw } }),
      fetch("/api/admin?action=stats", { headers: { "x-admin-password": pw } }),
    ]);
    if (clientsRes.status === 401) { sessionStorage.removeItem(ADMIN_KEY); setAuthedPw(null); if (!silent) setDataLoading(false); return; }
    const [clientsData, statsData] = await Promise.all([clientsRes.json(), statsRes.json()]);
    setClients(clientsData.clients ?? []);
    setStats(statsData);
    if (!silent) setDataLoading(false);
  }, []);

  useEffect(() => {
    if (authedPw) fetchData(authedPw);
  }, [authedPw, fetchData]);

  useEffect(() => {
    if (!authedPw) return;
    const id = setInterval(() => fetchData(authedPw, true), 30000);
    return () => clearInterval(id);
  }, [authedPw, fetchData]);

  useEffect(() => {
    if (!authedPw) return;
    const lastSeen = parseInt(localStorage.getItem("markety_contacts_seen_at") || "0");
    fetch("/api/admin?action=list-contacts", { headers: { "x-admin-password": authedPw } })
      .then(r => r.json())
      .then(d => {
        const hasNew = (d.contacts ?? []).some(
          (c: { created_at: string }) => new Date(c.created_at).getTime() > lastSeen
        );
        setHasNewContacts(hasNew);
      })
      .catch(() => {});
  }, [authedPw]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const r = await fetch("/api/admin", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", password }),
    });
    setLoginLoading(false);
    if (!r.ok) {
      const errBody = await r.json().catch(() => ({}));
      setLoginError(errBody.error ?? "Wrong password.");
      return;
    }
    sessionStorage.setItem(ADMIN_KEY, password);
    setAuthedPw(password);
  };

  const handleInvoice = async (client: ClientRow, invoiced: boolean) => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": authedPw! },
      body: JSON.stringify({ action: "invoice", clientId: client.id, invoiced }),
    });
    setClients(prev => prev.map(c => c.id === client.id
      ? { ...c, last_invoiced_at: invoiced ? new Date().toISOString() : null } : c));
  };

  const logout = () => { sessionStorage.removeItem(ADMIN_KEY); setAuthedPw(null); };

  const todayStr = new Date().toDateString();
  const leadsToday = clients.reduce((acc, c) =>
    acc + c.leads.filter(l => new Date(l.created_at).toDateString() === todayStr).length, 0);
  const earningsToday = clients.reduce((acc, c) => {
    const n = c.leads.filter(l => new Date(l.created_at).toDateString() === todayStr).length;
    return acc + n * c.price_per_lead;
  }, 0);

  if (!authedPw) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 rounded-2xl w-full max-w-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
          <img src="/Markety.png" alt="Markety" className="h-6 w-auto" />
          <span className="text-sm text-gray-300">|</span>
          <span className="text-sm font-semibold text-gray-700">Admin</span>
        </div>
        <div className="px-8 py-8">
          <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-5">
            <Lock className="w-5 h-5" style={{ color: "hsl(252 89% 58%)" }} />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">Admin dashboard</h1>
          <p className="text-sm text-gray-400 mb-6">Enter your admin password to continue.</p>
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)} placeholder="Admin password"
                className="w-full h-11 px-4 pr-11 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300" />
              <button type="button" onClick={() => setShowPw(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {loginError && <p className="text-xs text-red-500">{loginError}</p>}
            <button type="submit" disabled={loginLoading}
              className="h-11 rounded-lg text-sm font-semibold text-white disabled:opacity-60"
              style={{ background: "hsl(252 89% 58%)" }}>
              {loginLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );

  const invoiced = clients.filter(c => isInvoicedThisMonth(c.last_invoiced_at));
  const pending = clients.filter(c => !isInvoicedThisMonth(c.last_invoiced_at));

  const TABS = [
    { id: "overview" as const, label: "Overview", icon: BarChart2, blink: false },
    { id: "clients" as const, label: "Clients", icon: Users, blink: false },
    { id: "contacts" as const, label: "Contacts", icon: Inbox, blink: hasNewContacts },
    { id: "all-leads" as const, label: "Leads", icon: List, blink: false },
    { id: "content" as const, label: "Content", icon: Zap, blink: false },
    { id: "invoice-queue" as const, label: "Billing", icon: DollarSign, blink: false },
    { id: "outreach" as const, label: "Outreach", icon: PenLine, blink: false },
  ];

  const handleTabClick = (id: typeof tab) => {
    if (id === "contacts") {
      localStorage.setItem("markety_contacts_seen_at", Date.now().toString());
      setHasNewContacts(false);
    }
    setTab(id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/Markety.png" alt="Markety" className="h-7 w-auto" />
            <span className="text-sm text-gray-300">|</span>
            <span className="text-sm font-semibold text-gray-700">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
              <input value={globalSearch} onChange={e => setGlobalSearch(e.target.value)}
                placeholder="Search clients, leads…"
                className="h-8 pl-8 pr-7 rounded-lg border border-gray-200 text-xs w-48 focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-gray-300 text-gray-800" />
              {globalSearch && <button onClick={() => setGlobalSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X className="w-3 h-3" /></button>}
            </div>
            <button onClick={() => fetchData(authedPw!)} disabled={dataLoading}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40">
              <RefreshCw className={`w-3.5 h-3.5 ${dataLoading ? "animate-spin" : ""}`} /> Refresh
            </button>
            <button onClick={logout} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </div>
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-1 sm:gap-5 border-t border-gray-100 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => handleTabClick(t.id)}
              className={`flex items-center gap-1.5 py-3 px-1 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === t.id ? "text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
              }`}
              style={tab === t.id ? { borderColor: "hsl(252 89% 58%)", color: "#111827" } : {}}>
              <t.icon className="w-3.5 h-3.5 hidden sm:block" />
              <span className={t.blink && tab !== t.id ? "tab-notification" : ""}>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {globalSearch.trim().length > 1 ? (
          <GlobalSearchResults query={globalSearch} clients={clients} onClose={() => setGlobalSearch("")} />
        ) : dataLoading ? (
          <div className="flex justify-center py-20">
            <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: "hsl(252 89% 58%) transparent transparent transparent" }} />
          </div>
        ) : tab === "overview" ? (
          <OverviewTab stats={stats} leadsToday={leadsToday} earningsToday={earningsToday} clients={clients} onNavigate={(t) => setTab(t as typeof tab)} />
        ) : tab === "clients" ? (
          <ClientsTab clients={clients} pending={pending} invoiced={invoiced} expanded={expanded}
            setExpanded={setExpanded} handleInvoice={handleInvoice} authedPw={authedPw!} setClients={setClients} />
        ) : tab === "all-leads" ? (
          <AllLeadsTab clients={clients} authedPw={authedPw!} setClients={setClients} />
        ) : tab === "invoice-queue" ? (
          <BillingTab authedPw={authedPw!} onInvoiceSent={() => fetchData(authedPw!)} />
        ) : tab === "outreach" ? (
          <OutreachTab authedPw={authedPw!} />
        ) : tab === "emails" ? (
          <EmailsTab authedPw={authedPw!} />
        ) : tab === "content" ? (
          <ContentTab authedPw={authedPw!} />
        ) : (
          <ContactsTab authedPw={authedPw!} />
        )}
      </div>
    </div>
  );
}

function OverviewTab({ stats, leadsToday, earningsToday, clients, onNavigate }: {
  stats: AdminStats | null; leadsToday: number; earningsToday: number; clients: ClientRow[]; onNavigate: (tab: string) => void;
}) {
  if (!stats) return null;
  const year = new Date().getFullYear();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const allLeads = clients.flatMap(c => c.leads);
  const leadsThisMonth = allLeads.filter(l => new Date(l.created_at) >= startOfMonth).length;
  const leadsLastMonth = allLeads.filter(l => { const d = new Date(l.created_at); return d >= startOfLastMonth && d < startOfMonth; }).length;
  const growth = leadsLastMonth > 0 ? Math.round(((leadsThisMonth - leadsLastMonth) / leadsLastMonth) * 100) : null;

  const topClient = clients.length > 0
    ? clients.reduce((best, c) => c.leads_this_month > best.leads_this_month ? c : best, clients[0])
    : null;

  const avgLeadsPerClient = clients.length > 0
    ? Math.round(stats.leadsThisMonth / clients.length * 10) / 10
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Overview</h1>
        <p className="text-sm text-gray-400">{year} at a glance</p>
      </div>

      {leadsToday > 0 && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 bg-purple-50 border border-purple-100 rounded-xl px-5 py-3.5">
          <Zap className="w-4 h-4 shrink-0" style={{ color: "hsl(252 89% 58%)" }} />
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{leadsToday} {leadsToday === 1 ? "lead" : "leads"} delivered today</span>
            {earningsToday > 0 && <span className="text-gray-400"> · {money(earningsToday)} earned</span>}
          </p>
        </motion.div>
      )}

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => onNavigate("invoice-queue")}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <DollarSign className="w-3.5 h-3.5" /> Invoice queue
        </button>
        <button onClick={() => onNavigate("reminders")}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <Clock className="w-3.5 h-3.5" /> Payment reminders
        </button>
        <button onClick={() => onNavigate("clients")}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <UserPlus className="w-3.5 h-3.5" /> Add client
        </button>
        <button onClick={() => onNavigate("content")}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <Zap className="w-3.5 h-3.5" /> Generate content
        </button>
        <button onClick={() => onNavigate("all-leads")}
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <List className="w-3.5 h-3.5" /> All leads
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard icon={DollarSign} label="Earned this year" value={money(stats.earningsThisYear)} sub={`${year}`} />
        <StatCard icon={TrendingUp} label="Earned this month" value={money(stats.earningsThisMonth)} />
        <StatCard icon={BarChart2} label="Leads this year" value={String(stats.leadsThisYear)} />
        <StatCard icon={Users} label="Leads this month" value={String(stats.leadsThisMonth)} />
        <StatCard icon={Users} label="Total clients" value={String(stats.totalClients)} />
        <StatCard icon={Zap} label="Leads today" value={String(leadsToday)}
          sub={earningsToday > 0 ? money(earningsToday) : undefined} />
      </div>

      {/* Key insights row */}
      <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-400 font-medium mb-2">Month-over-month growth</p>
          <div className="flex items-end gap-1.5">
            <p className="text-2xl font-bold text-gray-900">{growth !== null ? `${growth > 0 ? "+" : ""}${growth}%` : "-"}</p>
            {growth !== null && growth > 0 && <ArrowUp className="w-4 h-4 text-green-500 mb-0.5" />}
            {growth !== null && growth < 0 && <ArrowDown className="w-4 h-4 text-red-400 mb-0.5" />}
          </div>
          <p className="text-xs text-gray-400 mt-1">{leadsThisMonth} this month vs {leadsLastMonth} last</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-400 font-medium mb-2">Avg leads per client</p>
          <p className="text-2xl font-bold text-gray-900">{avgLeadsPerClient}</p>
          <p className="text-xs text-gray-400 mt-1">This month · {clients.length} clients</p>
        </div>
        <div className="bg-white border border-gray-100 rounded-xl p-5">
          <p className="text-xs text-gray-400 font-medium mb-2">Top client this month</p>
          <p className="text-lg font-bold text-gray-900 truncate">{topClient?.leads_this_month ? topClient.company : "-"}</p>
          <p className="text-xs text-gray-400 mt-1">{topClient?.leads_this_month ? `${topClient.leads_this_month} leads` : "No leads yet"}</p>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
        <p className="text-sm font-semibold text-gray-700 mb-1">Monthly revenue - {year}</p>
        <p className="text-xs text-gray-400 mb-5">How much you earned per month</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.monthlyBreakdown} barSize={14}>
            <CartesianGrid vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false}
              tickFormatter={v => `${v} kr`} width={48} />
            <Tooltip formatter={(v: number) => [money(v), "Revenue"]}
              contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "#f9fafb" }} />
            <Bar dataKey="earnings" fill="hsl(252, 89%, 58%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
        <p className="text-sm font-semibold text-gray-700 mb-1">Monthly leads - {year}</p>
        <p className="text-xs text-gray-400 mb-5">How many leads you delivered per month</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.monthlyBreakdown} barSize={14}>
            <CartesianGrid vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} width={28} />
            <Tooltip formatter={(v: number) => [v, "Leads"]}
              contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "#f9fafb" }} />
            <Bar dataKey="leads" fill="#e9d5ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <p className="text-sm font-semibold text-gray-700">Monthly breakdown</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Month</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400">Leads</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {[...stats.monthlyBreakdown].reverse().map(row => (
                <tr key={row.month} className="border-b border-gray-50 last:border-0">
                  <td className="px-6 py-3.5 font-medium text-gray-800">{row.month} {new Date().getFullYear()}</td>
                  <td className="px-6 py-3.5 text-right text-gray-600">{row.leads}</td>
                  <td className="px-6 py-3.5 text-right font-semibold text-gray-900">{money(row.earnings)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td className="px-6 py-3.5 font-bold text-gray-900">Total</td>
                <td className="px-6 py-3.5 text-right font-bold text-gray-900">{stats.leadsThisYear}</td>
                <td className="px-6 py-3.5 text-right font-bold text-gray-900">{money(stats.earningsThisYear)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const LEAD_STATUS_LABELS: Record<string, string> = { new: "New", contacted: "Contacted", converted: "Converted", lost: "Lost" };
const LEAD_STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-yellow-50 text-yellow-700",
  converted: "bg-green-50 text-green-700",
  lost: "bg-red-50 text-red-400",
};

function AllLeadsTab({ clients, authedPw, setClients }: { clients: ClientRow[]; authedPw: string; setClients: React.Dispatch<React.SetStateAction<ClientRow[]>> }) {
  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [leadStatuses, setLeadStatuses] = useState<Record<string, string>>({});
  const [leadNotes, setLeadNotes] = useState<Record<string, string | null>>({});

  // Add lead modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addClientId, setAddClientId] = useState(clients[0]?.id ?? "");
  const [addName, setAddName] = useState("");
  const [addEmail, setAddEmail] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addSource, setAddSource] = useState("manual");
  const [addPrice, setAddPrice] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const openAddModal = () => {
    setAddClientId(clients[0]?.id ?? "");
    setAddName(""); setAddEmail(""); setAddPhone(""); setAddSource("manual"); setAddPrice(""); setAddError(null);
    setShowAddModal(true);
  };

  const submitAddLead = async () => {
    if (!addName.trim()) { setAddError("Name is required"); return; }
    if (!addClientId) { setAddError("Select a client"); return; }
    setAddLoading(true); setAddError(null);
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
      body: JSON.stringify({ action: "add-lead-manual", clientId: addClientId, name: addName.trim(), email: addEmail.trim() || null, phone: addPhone.trim() || null, source: addSource || "manual", price: addPrice || undefined }),
    });
    setAddLoading(false);
    if (!r.ok) { setAddError("Failed to add lead"); return; }
    const { lead } = await r.json();
    setClients(prev => prev.map(c => c.id === addClientId ? { ...c, leads: [...c.leads, lead], leads_this_month: c.leads_this_month + 1 } : c));
    setShowAddModal(false);
  };

  const allLeads: FlatLead[] = clients
    .flatMap(c => c.leads.map(l => ({ ...l, clientName: c.company, clientId: c.id, currency: c.currency })))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getStatus = (l: FlatLead) => leadStatuses[l.id] ?? l.lead_status ?? "new";
  const getNotes = (l: FlatLead) => l.id in leadNotes ? leadNotes[l.id] : l.lead_notes;

  const filtered = allLeads.filter(l => {
    const matchSearch = !search ||
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.phone?.includes(search) ||
      l.clientName.toLowerCase().includes(search.toLowerCase());
    const matchClient = !clientFilter || l.clientId === clientFilter;
    const matchStatus = !statusFilter || getStatus(l) === statusFilter;
    return matchSearch && matchClient && matchStatus;
  });

  const updateLeadStatus = async (leadId: string, status: string) => {
    setUpdatingId(leadId);
    setLeadStatuses(prev => ({ ...prev, [leadId]: status }));
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
      body: JSON.stringify({ action: "update-lead", leadId, lead_status: status }),
    });
    setUpdatingId(null);
  };

  const saveNote = async (leadId: string) => {
    const note = noteDraft;
    setLeadNotes(prev => ({ ...prev, [leadId]: note }));
    setEditingNoteId(null);
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
      body: JSON.stringify({ action: "update-lead", leadId, lead_notes: note }),
    });
  };

  return (
    <div className="space-y-6">
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-gray-900">Add lead to client</p>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Client *</label>
                <select value={addClientId} onChange={e => setAddClientId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white">
                  {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Name *</label>
                  <input value={addName} onChange={e => setAddName(e.target.value)} placeholder="John Smith"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Email</label>
                  <input value={addEmail} onChange={e => setAddEmail(e.target.value)} placeholder="john@example.com" type="email"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                  <input value={addPhone} onChange={e => setAddPhone(e.target.value)} placeholder="+44 7700 900000"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Source</label>
                  <input value={addSource} onChange={e => setAddSource(e.target.value)} placeholder="manual"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-500 mb-1 block">Price (leave blank for client default)</label>
                  <input value={addPrice} onChange={e => setAddPrice(e.target.value)} placeholder="Leave blank = default" type="number" min="0"
                    className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
              </div>
            </div>
            {addError && <p className="text-xs text-red-500">{addError}</p>}
            <div className="flex gap-2 pt-1">
              <button onClick={submitAddLead} disabled={addLoading}
                className="flex-1 h-9 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
                style={{ background: "hsl(252 89% 58%)" }}>
                {addLoading ? "Adding…" : "Add lead"}
              </button>
              <button onClick={() => setShowAddModal(false)} className="px-4 h-9 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">All leads</h1>
          <p className="text-sm text-gray-400">{allLeads.length} leads across {clients.length} clients</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads…"
              className="h-9 pl-8 pr-7 rounded-lg border border-gray-200 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-gray-300 text-gray-800" />
            {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X className="w-3 h-3" /></button>}
          </div>
          <select value={clientFilter} onChange={e => setClientFilter(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white">
            <option value="">All clients</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="h-9 pl-3 pr-8 rounded-lg border border-gray-200 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white">
            <option value="">All statuses</option>
            {Object.entries(LEAD_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
          <button onClick={openAddModal}
            className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-white rounded-lg shrink-0"
            style={{ background: "hsl(252 89% 58%)" }}>
            <Plus className="w-3.5 h-3.5" /> Add lead
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-6 py-3.5 border-b border-gray-50 flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-400">
            {filtered.length !== allLeads.length ? `${filtered.length} of ${allLeads.length} leads` : `${allLeads.length} leads`}
          </p>
          <div className="flex gap-3 text-xs text-gray-400">
            {Object.entries(LEAD_STATUS_LABELS).map(([v, l]) => {
              const count = allLeads.filter(lead => getStatus(lead) === v).length;
              return count > 0 ? <span key={v} className={`px-2 py-0.5 rounded-full ${LEAD_STATUS_COLORS[v]}`}>{l}: {count}</span> : null;
            })}
          </div>
        </div>
        {allLeads.length === 0 ? (
          <div className="py-20 text-center text-sm text-gray-400">No leads yet across any client.</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No leads match the current filter.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map(lead => {
              const status = getStatus(lead);
              const notes = getNotes(lead);
              const isEditingNote = editingNoteId === lead.id;
              return (
                <div key={lead.id} className="px-4 py-3 space-y-2 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-400 shrink-0">{fmt(lead.created_at)}</span>
                    <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">{lead.clientName}</span>
                    <span className="text-sm font-medium text-gray-800">{lead.name ?? "-"}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${LEAD_STATUS_COLORS[status]}`}>{LEAD_STATUS_LABELS[status]}</span>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{lead.source ?? "website"}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 items-center">
                    {lead.email && <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600"><Mail className="w-3 h-3" />{lead.email}</a>}
                    {lead.phone && <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-gray-500 hover:text-purple-600"><Phone className="w-3 h-3" />{lead.phone}</a>}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select value={status} onChange={e => updateLeadStatus(lead.id, e.target.value)}
                      disabled={updatingId === lead.id}
                      className="h-7 px-2 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-200 disabled:opacity-50">
                      {Object.entries(LEAD_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                    {!isEditingNote ? (
                      <button onClick={() => { setEditingNoteId(lead.id); setNoteDraft(notes ?? ""); }}
                        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded border border-gray-200 hover:bg-white transition-colors">
                        <Pencil className="w-3 h-3" />{notes ? "Edit note" : "Add note"}
                      </button>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <input value={noteDraft} onChange={e => setNoteDraft(e.target.value)}
                          placeholder="Add a note…" autoFocus
                          className="h-7 px-2 text-xs rounded-lg border border-gray-200 w-48 focus:outline-none focus:ring-2 focus:ring-purple-200" />
                        <button onClick={() => saveNote(lead.id)}
                          className="text-xs text-white px-2 py-1 rounded-lg font-medium"
                          style={{ background: "hsl(252 89% 58%)" }}>Save</button>
                        <button onClick={() => setEditingNoteId(null)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                      </div>
                    )}
                    {notes && !isEditingNote && <span className="text-xs text-gray-500 italic truncate max-w-xs">{notes}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function GlobalSearchResults({ query, clients, onClose }: { query: string; clients: ClientRow[]; onClose: () => void }) {
  const q = query.toLowerCase();
  const matchedClients = clients.filter(c =>
    c.company.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  const matchedLeads = clients.flatMap(c => c.leads.map(l => ({ ...l, clientName: c.company }))).filter(l =>
    l.name?.toLowerCase().includes(q) || l.email?.toLowerCase().includes(q) || l.phone?.includes(q));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">Search: "{query}"</h2>
        <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"><X className="w-3.5 h-3.5" /> Clear</button>
      </div>
      {matchedClients.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50"><p className="text-xs font-semibold text-gray-400">Clients ({matchedClients.length})</p></div>
          <div className="divide-y divide-gray-50">
            {matchedClients.map(c => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div><p className="text-sm font-semibold text-gray-900">{c.company}</p><p className="text-xs text-gray-400">{c.email}</p></div>
                <span className="text-xs text-gray-400">{c.leads_this_month} leads this month</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {matchedLeads.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-50"><p className="text-xs font-semibold text-gray-400">Leads ({matchedLeads.length})</p></div>
          <div className="divide-y divide-gray-50">
            {matchedLeads.slice(0, 20).map(l => (
              <div key={l.id} className="px-5 py-3 flex flex-wrap items-center gap-3">
                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">{l.clientName}</span>
                <span className="text-sm text-gray-800 font-medium">{l.name ?? "-"}</span>
                {l.email && <a href={`mailto:${l.email}`} className="text-xs text-gray-500 hover:text-purple-600">{l.email}</a>}
                {l.phone && <a href={`tel:${l.phone}`} className="text-xs text-gray-500">{l.phone}</a>}
                <span className="text-xs text-gray-400 ml-auto">{fmt(l.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {matchedClients.length === 0 && matchedLeads.length === 0 && (
        <div className="text-center py-16 text-gray-400 text-sm">No results for "{query}"</div>
      )}
    </div>
  );
}

function BillingTab({ authedPw, onInvoiceSent }: { authedPw: string; onInvoiceSent: () => void }) {
  const [section, setSection] = useState<"invoices" | "reminders">("invoices");
  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button onClick={() => setSection("invoices")}
          className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${section === "invoices" ? "text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200"}`}
          style={section === "invoices" ? { background: "hsl(252 89% 58%)" } : {}}>
          Invoice queue
        </button>
        <button onClick={() => setSection("reminders")}
          className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${section === "reminders" ? "text-white" : "text-gray-500 bg-gray-100 hover:bg-gray-200"}`}
          style={section === "reminders" ? { background: "hsl(252 89% 58%)" } : {}}>
          Payment reminders
        </button>
      </div>
      {section === "invoices" ? <InvoiceQueueInner authedPw={authedPw} onInvoiceSent={onInvoiceSent} /> : <RemindersInner authedPw={authedPw} />}
    </div>
  );
}

function InvoiceQueueInner({ authedPw, onInvoiceSent }: { authedPw: string; onInvoiceSent: () => void }) {
  type QueueItem = { id: string; name: string; company: string; email: string; price_per_lead: number; currency: string; language: string; token: string; leads_count: number; amount_due: number; already_invoiced: boolean };
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/admin?action=invoice-queue", { headers: { "x-admin-password": authedPw } })
      .then(r => r.json())
      .then(d => setQueue(d.queue ?? []))
      .finally(() => setLoading(false));
  }, [authedPw]);

  const sendInvoice = async (clientId: string) => {
    setSending(clientId);
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
      body: JSON.stringify({ action: "send-invoice", clientId }),
    });
    setSending(null);
    if (r.ok) { setSent(prev => new Set([...prev, clientId])); onInvoiceSent(); }
  };

  const pending = queue.filter(c => !c.already_invoiced && !sent.has(c.id));
  const done = queue.filter(c => c.already_invoiced || sent.has(c.id));
  const totalPending = pending.reduce((s, c) => s + c.amount_due, 0);

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "hsl(252 89% 58%) transparent transparent transparent" }} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Invoice queue</h1>
        <p className="text-sm text-gray-400">{pending.length} clients ready to invoice{totalPending > 0 ? ` · ${money(totalPending)} total` : ""}</p>
      </div>
      {pending.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Pending invoices</p>
          </div>
          <div className="divide-y divide-gray-50">
            {pending.map(c => (
              <div key={c.id} className="px-6 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{c.company}</p>
                  <p className="text-xs text-gray-400">{c.leads_count} leads · {money(c.amount_due, c.currency)}</p>
                </div>
                <button onClick={() => sendInvoice(c.id)} disabled={sending === c.id}
                  className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-60 transition-opacity hover:opacity-90 shrink-0"
                  style={{ background: "hsl(252 89% 58%)" }}>
                  {sending === c.id ? "Sending…" : "Send invoice"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      {done.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Already invoiced this month</p>
          <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
            {done.map(c => (
              <div key={c.id} className="px-6 py-3 flex items-center justify-between">
                <p className="text-sm text-gray-600">{c.company}</p>
                <span className="flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="w-3 h-3" /> Invoiced</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {pending.length === 0 && done.length === 0 && (
        <div className="text-center py-20 text-gray-400 text-sm">No clients have leads this month yet.</div>
      )}
    </div>
  );
}

function RemindersInner({ authedPw }: { authedPw: string }) {
  type Reminder = { id: string; month_label: string; amount: number; currency: string; sent_at: string; reminder_7d_at: string | null; reminder_14d_at: string | null; clients: { name: string; company: string; email: string } };
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [sent, setSent] = useState<Record<string, boolean>>({});

  const load = () => {
    setLoading(true);
    fetch("/api/admin?action=check-reminders", { headers: { "x-admin-password": authedPw } })
      .then(r => r.json())
      .then(d => setReminders(d.reminders ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [authedPw]);

  const sendReminder = async (invoiceId: string, reminderType: string) => {
    setSending(invoiceId + reminderType);
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
      body: JSON.stringify({ action: "send-payment-reminder", invoiceId, reminderType }),
    });
    setSending(null);
    if (r.ok) setSent(prev => ({ ...prev, [invoiceId + reminderType]: true }));
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "hsl(252 89% 58%) transparent transparent transparent" }} /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Payment reminders</h1>
        <p className="text-sm text-gray-400">{reminders.length} unpaid invoices older than 7 days</p>
      </div>
      {reminders.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">All invoices are paid or too recent for reminders.</div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-50">
            {reminders.map(inv => {
              const client = Array.isArray(inv.clients) ? inv.clients[0] : inv.clients;
              const daysSince = Math.floor((Date.now() - new Date(inv.sent_at).getTime()) / (1000 * 60 * 60 * 24));
              const need7d = daysSince >= 7 && !inv.reminder_7d_at;
              const need14d = daysSince >= 14 && !inv.reminder_14d_at;
              return (
                <div key={inv.id} className="px-6 py-4 flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{client.company}</p>
                    <p className="text-xs text-gray-400">{inv.month_label} · {money(inv.amount, inv.currency)} · invoiced {daysSince}d ago</p>
                    {inv.reminder_7d_at && <p className="text-xs text-gray-400">7d reminder sent {fmt(inv.reminder_7d_at)}</p>}
                    {inv.reminder_14d_at && <p className="text-xs text-gray-400">14d reminder sent {fmt(inv.reminder_14d_at)}</p>}
                  </div>
                  <div className="flex gap-2">
                    {need7d && (
                      <button onClick={() => sendReminder(inv.id, "7d")} disabled={!!sending || sent[inv.id + "7d"]}
                        className="text-xs text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-60"
                        style={{ background: sent[inv.id + "7d"] ? "#10b981" : "hsl(252 89% 58%)" }}>
                        {sent[inv.id + "7d"] ? "Sent!" : "Send 7d reminder"}
                      </button>
                    )}
                    {need14d && (
                      <button onClick={() => sendReminder(inv.id, "14d")} disabled={!!sending || sent[inv.id + "14d"]}
                        className="text-xs bg-orange-500 text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-60">
                        {sent[inv.id + "14d"] ? "Sent!" : "Send 14d reminder"}
                      </button>
                    )}
                    {!need7d && !need14d && <span className="text-xs text-gray-400">Reminders sent</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function RevenueTab({ clients, stats }: { clients: ClientRow[]; stats: AdminStats | null }) {
  const year = new Date().getFullYear();

  const clientRevenue = clients
    .map(c => ({
      company: c.company,
      totalLeads: c.leads.length,
      allTimeRevenue: c.leads.length * c.price_per_lead,
      monthRevenue: c.amount_due,
      monthLeads: c.leads_this_month,
      pricePerLead: c.price_per_lead,
      currency: c.currency,
    }))
    .sort((a, b) => b.allTimeRevenue - a.allTimeRevenue);

  const totalAllTime = clientRevenue.reduce((acc, c) => acc + c.allTimeRevenue, 0);
  const totalThisMonth = clientRevenue.reduce((acc, c) => acc + c.monthRevenue, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Revenue</h1>
        <p className="text-sm text-gray-400">Financial breakdown by client</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard icon={DollarSign} label="All-time revenue" value={money(totalAllTime)} />
        <StatCard icon={TrendingUp} label="This month" value={money(totalThisMonth)} />
        {stats && <StatCard icon={BarChart2} label={`${year} total`} value={money(stats.earningsThisYear)} />}
      </div>

      {stats && (
        <div className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
          <p className="text-sm font-semibold text-gray-700 mb-1">Revenue by month - {year}</p>
          <p className="text-xs text-gray-400 mb-5">Monthly earnings across all clients</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.monthlyBreakdown} barSize={16}>
              <CartesianGrid vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false}
                tickFormatter={v => `${v} kr`} width={48} />
              <Tooltip formatter={(v: number) => [money(v), "Revenue"]}
                contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="earnings" fill="hsl(252, 89%, 58%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Revenue per client</p>
          <p className="text-xs text-gray-400">{clients.length} clients</p>
        </div>
        {clientRevenue.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">No clients yet.</div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-50">
              {clientRevenue.map((c, i) => (
                <div key={c.company + i} className="px-4 py-3 space-y-2">
                  <p className="text-sm font-semibold text-gray-900">{c.company}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    <div><span className="text-gray-400">This month </span><span className="font-semibold text-gray-900">{money(c.monthRevenue, c.currency)}</span></div>
                    <div><span className="text-gray-400">Leads </span><span className="font-semibold text-gray-900">{c.monthLeads}</span></div>
                    <div><span className="text-gray-400">All-time </span><span className="font-semibold text-gray-900">{money(c.allTimeRevenue, c.currency)}</span></div>
                    <div><span className="text-gray-400">Price/lead </span><span className="text-gray-500">{money(c.pricePerLead, c.currency)}</span></div>
                  </div>
                </div>
              ))}
              <div className="px-4 py-3 bg-gray-50">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-bold text-gray-900">
                  <div>Total this month: {money(totalThisMonth)}</div>
                  <div>All-time: {money(totalAllTime)}</div>
                </div>
              </div>
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Client</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400">This month</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400">Leads (month)</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400">All-time revenue</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400">Total leads</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400">Price/lead</th>
                  </tr>
                </thead>
                <tbody>
                  {clientRevenue.map((c, i) => (
                    <tr key={c.company + i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 font-semibold text-gray-900">{c.company}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-gray-900">{money(c.monthRevenue, c.currency)}</td>
                      <td className="px-6 py-3.5 text-right text-gray-600">{c.monthLeads}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-gray-900">{money(c.allTimeRevenue, c.currency)}</td>
                      <td className="px-6 py-3.5 text-right text-gray-600">{c.totalLeads}</td>
                      <td className="px-6 py-3.5 text-right text-gray-500">{money(c.pricePerLead, c.currency)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50">
                    <td className="px-6 py-3.5 font-bold text-gray-900">Total</td>
                    <td className="px-6 py-3.5 text-right font-bold text-gray-900">{money(totalThisMonth)}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-gray-900">{clientRevenue.reduce((a, c) => a + c.monthLeads, 0)}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-gray-900">{money(totalAllTime)}</td>
                    <td className="px-6 py-3.5 text-right font-bold text-gray-900">{clientRevenue.reduce((a, c) => a + c.totalLeads, 0)}</td>
                    <td className="px-6 py-3.5" />
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AddClientTab({ authedPw, onSuccess }: { authedPw: string; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [pricePerLead, setPricePerLead] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToken, setSuccessToken] = useState<string | null>(null);

  const dashboardUrl = successToken ? `${window.location.origin}/dashboard/${successToken}` : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !company || !email || !pricePerLead) { setError("All fields are required."); return; }
    if (isNaN(parseFloat(pricePerLead)) || parseFloat(pricePerLead) <= 0) { setError("Price per lead must be a positive number."); return; }
    setLoading(true);
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
      body: JSON.stringify({ action: "add-client", name, company, email, price_per_lead: pricePerLead, currency }),
    });
    setLoading(false);
    if (!r.ok) { const d = await r.json(); setError(d.error ?? "Failed to create client."); return; }
    const data = await r.json();
    setSuccessToken(data.token);
    onSuccess();
  };

  const reset = () => {
    setName(""); setCompany(""); setEmail(""); setPricePerLead(""); setCurrency("USD");
    setSuccessToken(null); setError(null);
  };

  if (successToken && dashboardUrl) return (
    <div className="max-w-xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Client added!</h1>
        <p className="text-sm text-gray-400">Share the dashboard link below with your new client.</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span><strong>{company}</strong> has been created successfully.</span>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2">Dashboard link</p>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
            <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <a href={dashboardUrl} target="_blank" rel="noopener noreferrer"
              className="text-xs text-purple-600 hover:underline truncate flex-1 font-mono">
              {dashboardUrl}
            </a>
            <CopyButton text={dashboardUrl} label="Copy" />
          </div>
          <p className="text-xs text-gray-400 mt-2">Send this link to {name}. They'll set their own password on first visit.</p>
        </div>
        <button onClick={reset}
          className="h-10 px-5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          Add another client
        </button>
      </motion.div>
    </div>
  );

  return (
    <div className="max-w-xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Add client</h1>
        <p className="text-sm text-gray-400">Create a new client and get their dashboard link instantly.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white border border-gray-100 rounded-xl p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Contact name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith"
                className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Company name</label>
              <input value={company} onChange={e => setCompany(e.target.value)} placeholder="Acme Corp"
                className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@acme.com"
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Price per lead</label>
              <input type="number" step="0.01" min="0" value={pricePerLead} onChange={e => setPricePerLead(e.target.value)} placeholder="50"
                className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-500">Currency</label>
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white">
                {["USD", "EUR", "GBP", "DKK", "SEK", "NOK"].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button type="submit" disabled={loading}
            className="mt-1 h-11 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
            style={{ background: "hsl(252 89% 58%)" }}>
            {loading ? "Creating…" : "Create client & get dashboard link"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function ClientsTab({ clients, pending, invoiced, expanded, setExpanded, handleInvoice, authedPw, setClients }: {
  clients: ClientRow[]; pending: ClientRow[]; invoiced: ClientRow[];
  expanded: string | null; setExpanded: (id: string | null) => void;
  handleInvoice: (c: ClientRow, invoiced: boolean) => void;
  authedPw: string; setClients: React.Dispatch<React.SetStateAction<ClientRow[]>>;
}) {
  const handleClientUpdated = (updated: Partial<ClientRow> & { id: string }) => {
    setClients(prev => prev.map(c => c.id === updated.id ? { ...c, ...updated } : c));
  };
  const handleClientDeleted = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    if (expanded === id) setExpanded(null);
  };
  const [search, setSearch] = useState("");
  const [showAddClient, setShowAddClient] = useState(false);
  const match = (c: ClientRow) => !search ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase());
  const filteredPending = pending.filter(match);
  const filteredInvoiced = invoiced.filter(match);
  const totalPendingRevenue = pending.reduce((acc, c) => acc + c.amount_due, 0);

  if (showAddClient) return (
    <div>
      <button onClick={() => setShowAddClient(false)} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 mb-6 transition-colors">
        ← Back to clients
      </button>
      <AddClientTab authedPw={authedPw} onSuccess={() => { setShowAddClient(false); }} />
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Clients</h1>
          <p className="text-sm text-gray-400">
            {clients.length} total · {pending.length} to invoice
            {totalPendingRevenue > 0 && ` · ${money(totalPendingRevenue)} pending`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients…"
              className="h-9 pl-8 pr-7 rounded-lg border border-gray-200 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-gray-300 text-gray-800" />
            {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X className="w-3 h-3" /></button>}
          </div>
          <button onClick={() => setShowAddClient(true)}
            className="flex items-center gap-1.5 h-9 px-3 text-xs font-semibold text-white rounded-lg shrink-0"
            style={{ background: "hsl(252 89% 58%)" }}>
            <UserPlus className="w-3.5 h-3.5" /> Add client
          </button>
        </div>
      </div>

      {filteredPending.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">To invoice</p>
            {filteredPending.length > 1 && <p className="text-xs text-gray-400 font-medium">{money(filteredPending.reduce((a, c) => a + c.amount_due, 0))} total</p>}
          </div>
          <div className="space-y-2">
            {filteredPending.map(client => (
              <ClientCard key={client.id} client={client} expanded={expanded === client.id}
                onToggle={() => setExpanded(expanded === client.id ? null : client.id)}
                onInvoice={handleInvoice} adminPw={authedPw}
                onInvoiceSent={() => setClients(prev => prev.map(c => c.id === client.id ? { ...c, last_invoiced_at: new Date().toISOString() } : c))}
                onClientUpdated={handleClientUpdated} onClientDeleted={handleClientDeleted} />
            ))}
          </div>
        </div>
      )}

      {filteredInvoiced.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Invoiced this month</p>
          <div className="space-y-2">
            {filteredInvoiced.map(client => (
              <ClientCard key={client.id} client={client} expanded={expanded === client.id}
                onToggle={() => setExpanded(expanded === client.id ? null : client.id)}
                onInvoice={handleInvoice} adminPw={authedPw}
                onInvoiceSent={() => setClients(prev => prev.map(c => c.id === client.id ? { ...c, last_invoiced_at: new Date().toISOString() } : c))}
                onClientUpdated={handleClientUpdated} onClientDeleted={handleClientDeleted} />
            ))}
          </div>
        </div>
      )}

      {filteredPending.length === 0 && filteredInvoiced.length === 0 && (
        <div className="text-center py-20 text-sm text-gray-400">
          {search ? `No clients match "${search}".` : "No clients yet."}
        </div>
      )}
    </div>
  );
}

function ClientCard({ client, expanded, onToggle, onInvoice, adminPw, onInvoiceSent, onClientUpdated, onClientDeleted }: {
  client: ClientRow; expanded: boolean; onToggle: () => void;
  onInvoice: (c: ClientRow, invoiced: boolean) => void; adminPw: string; onInvoiceSent: () => void;
  onClientUpdated: (updated: Partial<ClientRow> & { id: string }) => void;
  onClientDeleted: (id: string) => void;
}) {
  const invoicedThisMonth = isInvoicedThisMonth(client.last_invoiced_at);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [generatingLink, setGeneratingLink] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [invoicePaid, setInvoicePaid] = useState(false);
  const [togglingPaid, setTogglingPaid] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const dashboardUrl = client.token ? `${window.location.origin}/dashboard/${client.token}` : null;

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(client.name);
  const [editCompany, setEditCompany] = useState(client.company);
  const [editEmail, setEditEmail] = useState(client.email);
  const [editPhone, setEditPhone] = useState(client.phone ?? "");
  const [editPrice, setEditPrice] = useState(String(client.price_per_lead));
  const [editCurrency, setEditCurrency] = useState(client.currency);
  const [editLanguage, setEditLanguage] = useState(client.language ?? "en");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete state
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reset password state
  const [resettingPw, setResettingPw] = useState(false);
  const [pwResetDone, setPwResetDone] = useState(false);

  // Reactivate / remove cap state
  const [reactivating, setReactivating] = useState(false);
  const [removingCap, setRemovingCap] = useState(false);

  // Lead cap edit state
  const [editLeadCap, setEditLeadCap] = useState(client.lead_cap != null ? String(client.lead_cap) : "");

  // Onboarding checklist
  const defaultSteps = { ads: false, landing_page: false, lead_form: false, test_lead: false, first_lead: false };
  const [steps, setSteps] = useState<typeof defaultSteps>(client.onboarding_steps ?? defaultSteps);
  const [leadNotesDraft, setLeadNotesDraft] = useState<Record<string, string>>({});
  const [editingLeadNoteId, setEditingLeadNoteId] = useState<string | null>(null);
  const [leadStatuses, setLeadStatuses] = useState<Record<string, string>>({});

  // Add lead manually
  const [showAddLeadForm, setShowAddLeadForm] = useState(false);
  const [addLeadLoading, setAddLeadLoading] = useState(false);
  const [addLeadError, setAddLeadError] = useState<string | null>(null);
  const [addLeadName, setAddLeadName] = useState("");
  const [addLeadEmail, setAddLeadEmail] = useState("");
  const [addLeadPhone, setAddLeadPhone] = useState("");
  const [addLeadSource, setAddLeadSource] = useState("manual");
  const [addLeadPrice, setAddLeadPrice] = useState("");

  const handleAddLead = async () => {
    if (!addLeadName.trim()) { setAddLeadError("Name is required"); return; }
    setAddLeadLoading(true);
    setAddLeadError(null);
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify({
        action: "add-lead-manual",
        clientId: client.id,
        name: addLeadName.trim(),
        email: addLeadEmail.trim() || null,
        phone: addLeadPhone.trim() || null,
        source: addLeadSource || "manual",
        price: addLeadPrice || undefined,
      }),
    });
    setAddLeadLoading(false);
    if (!r.ok) { setAddLeadError("Failed to add lead"); return; }
    const { lead } = await r.json();
    onClientUpdated({ id: client.id, leads: [...client.leads, lead], leads_this_month: client.leads_this_month + 1 });
    setShowAddLeadForm(false);
    setAddLeadName(""); setAddLeadEmail(""); setAddLeadPhone(""); setAddLeadSource("manual"); setAddLeadPrice("");
  };

  const ONBOARDING = [
    { key: "ads" as const, label: "Set up Facebook / Google Ads" },
    { key: "landing_page" as const, label: "Build landing page" },
    { key: "lead_form" as const, label: "Configure lead form with client token" },
    { key: "test_lead" as const, label: "Submit a test lead" },
    { key: "first_lead" as const, label: "First real lead delivered" },
  ];

  const toggleStep = async (key: keyof typeof steps) => {
    const next = { ...steps, [key]: !steps[key] };
    setSteps(next);
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify({ action: "update-onboarding-steps", clientId: client.id, steps: next }),
    });
  };

  const saveLeadNote = async (leadId: string) => {
    const note = leadNotesDraft[leadId] ?? "";
    setEditingLeadNoteId(null);
    onClientUpdated({ id: client.id, leads: client.leads.map(l => l.id === leadId ? { ...l, lead_notes: note } : l) });
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify({ action: "update-lead", leadId, lead_notes: note }),
    });
  };

  const updateLeadStatus = async (leadId: string, status: string) => {
    setLeadStatuses(prev => ({ ...prev, [leadId]: status }));
    onClientUpdated({ id: client.id, leads: client.leads.map(l => l.id === leadId ? { ...l, lead_status: status as Lead["lead_status"] } : l) });
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify({ action: "update-lead", leadId, lead_status: status }),
    });
  };

  const allDone = ONBOARDING.every(s => steps[s.key]);
  const doneCount = ONBOARDING.filter(s => steps[s.key]).length;

  const handleDelete = async () => {
    setDeleting(true);
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify({ action: "delete-client", clientId: client.id }),
    });
    setDeleting(false);
    if (r.ok) onClientDeleted(client.id);
  };

  const handleResetPassword = async () => {
    setResettingPw(true);
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify({ action: "reset-client-password", clientId: client.id }),
    });
    setResettingPw(false);
    if (r.ok) setPwResetDone(true);
  };

  const handleReactivate = async () => {
    setReactivating(true);
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify({ action: "reactivate-client", clientId: client.id }),
    });
    setReactivating(false);
    if (r.ok) onClientUpdated({ id: client.id, cap_paused: false });
  };

  const handleRemoveCap = async () => {
    setRemovingCap(true);
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify({ action: "remove-cap", clientId: client.id }),
    });
    setRemovingCap(false);
    if (r.ok) onClientUpdated({ id: client.id, cap_paused: false, lead_cap: null });
  };

  const startEdit = () => {
    setEditName(client.name);
    setEditCompany(client.company);
    setEditEmail(client.email);
    setEditPhone(client.phone ?? "");
    setEditPrice(String(client.price_per_lead));
    setEditCurrency(client.currency);
    setEditLanguage(client.language ?? "en");
    setEditLeadCap(client.lead_cap != null ? String(client.lead_cap) : "");
    setSaveError(null);
    setEditing(true);
  };

  const cancelEdit = () => { setEditing(false); setSaveError(null); };

  const saveEdit = async () => {
    setSaving(true); setSaveError(null);
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify({
        action: "update-client",
        clientId: client.id,
        name: editName,
        company: editCompany,
        email: editEmail,
        phone: editPhone,
        price_per_lead: editPrice,
        currency: editCurrency,
        language: editLanguage,
        lead_cap: editLeadCap === "" ? null : editLeadCap,
      }),
    });
    setSaving(false);
    if (!r.ok) { setSaveError("Failed to save. Try again."); return; }
    onClientUpdated({
      id: client.id,
      name: editName,
      company: editCompany,
      email: editEmail,
      phone: editPhone || null,
      price_per_lead: parseFloat(editPrice),
      currency: editCurrency,
      language: editLanguage,
      lead_cap: editLeadCap === "" ? null : parseInt(editLeadCap),
    });
    setEditing(false);
  };

  const handleSendInvoice = async () => {
    setSending(true); setSendError(null);
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify({ action: "send-invoice", clientId: client.id }),
    });
    setSending(false);
    if (!r.ok) { setSendError("Failed to send. Try again."); return; }
    setSent(true); onInvoiceSent();
  };

  const handleTogglePaid = async () => {
    setTogglingPaid(true);
    const next = !invoicePaid;
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify({ action: "toggle-invoice-paid", clientId: client.id, paid: next }),
    });
    setInvoicePaid(next);
    setTogglingPaid(false);
  };

  const handleGenerateLink = async () => {
    setGeneratingLink(true); setSendError(null);
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": adminPw },
      body: JSON.stringify({ action: "generate-payment-link", clientId: client.id }),
    });
    setGeneratingLink(false);
    if (!r.ok) { const d = await r.json(); setSendError(d.error ?? "Failed to generate link."); return; }
    const data = await r.json();
    setGeneratedUrl(data.url);
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="font-semibold text-gray-900 text-sm">{client.company}</p>
            {invoicedThisMonth && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                <CheckCircle2 className="w-3 h-3" /> Invoiced
              </span>
            )}
            {client.cap_paused && (
              <span className="inline-flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-medium">
                <AlertTriangle className="w-3 h-3" /> Cap hit - paused
              </span>
            )}
            {!client.cap_paused && client.lead_cap && client.leads.length >= Math.floor(client.lead_cap * 0.8) && (
              <span className="inline-flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full font-medium">
                <AlertTriangle className="w-3 h-3" /> {Math.round((client.leads.length / client.lead_cap) * 100)}% of cap
              </span>
            )}
            {(() => {
              const monthsSince = (Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
              if (monthsSince >= 3 && !client.lead_cap) return (
                <span className="inline-flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full font-medium">
                  <TrendingUp className="w-3 h-3" /> Upsell - 3+ months
                </span>
              );
              if (monthsSince >= 1 && client.leads_this_month === 0) return (
                <span className="inline-flex items-center gap-1 text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-medium">
                  <AlertTriangle className="w-3 h-3" /> No leads this month
                </span>
              );
              return null;
            })()}
          </div>
          <p className="text-xs text-gray-400">{client.email}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-gray-900">{money(client.amount_due, client.currency)}</p>
          <p className="text-xs text-gray-400">{client.leads_this_month} leads this month</p>
        </div>
        <div className="text-gray-300 shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-50 px-4 sm:px-6 py-5">

          {/* Edit form */}
          {editing ? (
            <div className="mb-5 bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-600 mb-1">Edit client</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Contact name</label>
                  <input value={editName} onChange={e => setEditName(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Company name</label>
                  <input value={editCompany} onChange={e => setEditCompany(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Email</label>
                  <input type="email" value={editEmail} onChange={e => setEditEmail(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Phone</label>
                  <input type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)}
                    placeholder="+45 00 00 00 00"
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 placeholder:text-gray-400" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Price per lead</label>
                  <input type="number" step="0.01" min="0" value={editPrice} onChange={e => setEditPrice(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Currency</label>
                  <select value={editCurrency} onChange={e => setEditCurrency(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700">
                    {["USD", "EUR", "GBP", "DKK", "SEK", "NOK"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Dashboard language</label>
                  <select value={editLanguage} onChange={e => setEditLanguage(e.target.value)}
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-700">
                    <option value="en">English</option>
                    <option value="da">Dansk</option>
                    <option value="de">Deutsch</option>
                    <option value="sv">Svenska</option>
                    <option value="no">Norsk</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-gray-400">Lead cap <span className="text-gray-300">(leave blank = no cap)</span></label>
                  <input type="number" min="1" step="1" value={editLeadCap} onChange={e => setEditLeadCap(e.target.value)}
                    placeholder="e.g. 50"
                    className="h-9 px-3 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-900 placeholder:text-gray-400" />
                </div>
              </div>
              {saveError && <p className="text-xs text-red-500">{saveError}</p>}
              <div className="flex items-center gap-2 pt-1">
                <button onClick={saveEdit} disabled={saving}
                  className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-60 transition-opacity hover:opacity-90"
                  style={{ background: "hsl(252 89% 58%)" }}>
                  <Save className="w-3.5 h-3.5" />{saving ? "Saving…" : "Save changes"}
                </button>
                <button onClick={cancelEdit} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="mb-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-3">
                <div><p className="text-xs text-gray-400 mb-0.5">Total leads</p><p className="text-sm font-semibold text-gray-900">{client.leads.length}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Price per lead</p><p className="text-sm font-semibold text-gray-900">{money(client.price_per_lead, client.currency)}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Client since</p><p className="text-sm font-semibold text-gray-900">{fmt(client.created_at)}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Last invoiced</p><p className="text-sm font-semibold text-gray-900">{client.last_invoiced_at ? fmt(client.last_invoiced_at) : "Never"}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Contact name</p><p className="text-sm font-semibold text-gray-900">{client.name}</p></div>
                <div><p className="text-xs text-gray-400 mb-0.5">Email</p><p className="text-sm font-semibold text-gray-900 truncate">{client.email}</p></div>
                {client.phone && <div><p className="text-xs text-gray-400 mb-0.5">Phone</p><p className="text-sm font-semibold text-gray-900">{client.phone}</p></div>}
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Lead cap</p>
                  {client.lead_cap != null ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-900">{client.leads.length} / {client.lead_cap}</p>
                      <button onClick={handleRemoveCap} disabled={removingCap}
                        className="text-xs text-gray-400 hover:text-red-500 underline underline-offset-2 transition-colors disabled:opacity-60">
                        {removingCap ? "Removing…" : "Turn off"}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">No cap</p>
                  )}
                </div>
              </div>
              {client.cap_paused && (
                <div className="flex items-center gap-3 mb-3 px-3 py-2.5 bg-orange-50 border border-orange-200 rounded-lg flex-wrap">
                  <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                  <p className="text-xs text-orange-700 flex-1">
                    Lead cap of <strong>{client.lead_cap}</strong> reached - site is paused.
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={handleReactivate} disabled={reactivating || removingCap}
                      className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-60 transition-opacity hover:opacity-90"
                      style={{ background: "hsl(142 71% 45%)" }}>
                      <RotateCcw className="w-3 h-3" />{reactivating ? "Reactivating…" : "Reactivate"}
                    </button>
                    <button onClick={handleRemoveCap} disabled={reactivating || removingCap}
                      className="flex items-center gap-1.5 text-xs text-orange-700 border border-orange-300 bg-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-60 transition-colors hover:bg-orange-50">
                      <X className="w-3 h-3" />{removingCap ? "Removing…" : "Turn off cap"}
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <button onClick={startEdit}
                  className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                  <Pencil className="w-3 h-3" /> Edit client info
                </button>
                {pwResetDone ? (
                  <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Password reset - client can set a new one
                  </span>
                ) : (
                  <button onClick={handleResetPassword} disabled={resettingPw}
                    className="flex items-center gap-1.5 text-xs text-amber-600 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-50 transition-colors font-medium disabled:opacity-60">
                    <Lock className="w-3 h-3" />{resettingPw ? "Resetting…" : "Reset password"}
                  </button>
                )}
                {!confirmDelete ? (
                  <button onClick={() => setConfirmDelete(true)}
                    className="flex items-center gap-1.5 text-xs text-red-400 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium">
                    <Trash2 className="w-3 h-3" /> Delete client
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-500 font-medium">Delete {client.company} and all their leads?</span>
                    <button onClick={handleDelete} disabled={deleting}
                      className="text-xs text-white bg-red-500 hover:bg-red-600 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-60">
                      {deleting ? "Deleting…" : "Yes, delete"}
                    </button>
                    <button onClick={() => setConfirmDelete(false)}
                      className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 transition-colors">Cancel</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {dashboardUrl && (
            <div className="flex items-center gap-2 mb-5 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <a href={dashboardUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-purple-600 hover:text-purple-800 truncate flex-1 font-mono hover:underline transition-colors">
                {dashboardUrl}
              </a>
              <CopyButton text={dashboardUrl} label="Copy link" />
            </div>
          )}

          <div className="flex flex-col gap-3 mb-5">
            <div className="flex items-center gap-3 flex-wrap">
              {invoicedThisMonth ? (
                <button onClick={() => onInvoice(client, false)}
                  className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-100 transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Invoice sent - click to undo
                </button>
              ) : sent ? (
                <span className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Invoice sent!
                </span>
              ) : (
                <button onClick={handleSendInvoice} disabled={sending}
                  className="flex items-center gap-2 text-xs text-white px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: "hsl(252 89% 58%)" }}>
                  <Mail className="w-3.5 h-3.5" />{sending ? "Sending…" : "Send invoice email"}
                </button>
              )}
              {!invoicedThisMonth && !sent && (
                <button onClick={() => onInvoice(client, true)}
                  className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Mark as sent (no email)
                </button>
              )}
              <button onClick={handleTogglePaid} disabled={togglingPaid}
                className={`text-xs border px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-60 ${invoicePaid ? "text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100" : "text-gray-500 border-gray-200 hover:bg-gray-50"}`}>
                <CheckCircle2 className="w-3.5 h-3.5" />{togglingPaid ? "…" : invoicePaid ? "Paid (undo)" : "Mark as paid (test)"}
              </button>
              <button onClick={handleGenerateLink} disabled={generatingLink}
                className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 disabled:opacity-60">
                <Zap className="w-3.5 h-3.5" />{generatingLink ? "Generating…" : "Generate payment link"}
              </button>
              {sendError && <p className="text-xs text-red-500">{sendError}</p>}
              {generatedUrl && (
                <div className="w-full flex items-center gap-2 mt-1 px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <a href={generatedUrl} target="_blank" rel="noreferrer"
                    className="text-xs text-green-700 hover:underline truncate flex-1 font-mono">{generatedUrl}</a>
                  <CopyButton text={generatedUrl} label="Copy" />
                </div>
              )}
            </div>
          </div>

          {/* Onboarding checklist */}
          <div className="mb-4 bg-gray-50 border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-600">Onboarding checklist</p>
              <span className="text-xs text-gray-400">{doneCount}/{ONBOARDING.length} done</span>
            </div>
            <div className="space-y-2">
              {ONBOARDING.map(s => (
                <button key={s.key} onClick={() => toggleStep(s.key)}
                  className="flex items-center gap-2.5 w-full text-left group">
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${steps[s.key] ? "border-transparent" : "border-gray-300 group-hover:border-purple-400"}`}
                    style={steps[s.key] ? { background: "hsl(252 89% 58%)" } : {}}>
                    {steps[s.key] && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className={`text-xs transition-colors ${steps[s.key] ? "line-through text-gray-400" : "text-gray-700 group-hover:text-gray-900"}`}>{s.label}</span>
                </button>
              ))}
            </div>
            {allDone && (
              <p className="mt-3 text-xs text-green-600 font-medium">All done - client is fully set up</p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                Leads <span className="font-normal text-gray-400 normal-case tracking-normal">({client.leads.length})</span>
              </p>
              <button
                onClick={() => { setShowAddLeadForm(v => !v); setAddLeadError(null); }}
                className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add lead
              </button>
            </div>

            {showAddLeadForm && (
              <div className="mb-3 rounded-xl border border-purple-100 bg-purple-50/50 p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-700">Add lead manually</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Name *</label>
                    <input value={addLeadName} onChange={e => setAddLeadName(e.target.value)}
                      placeholder="John Smith"
                      className="w-full h-8 px-2.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Email</label>
                    <input value={addLeadEmail} onChange={e => setAddLeadEmail(e.target.value)}
                      placeholder="john@example.com" type="email"
                      className="w-full h-8 px-2.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Phone</label>
                    <input value={addLeadPhone} onChange={e => setAddLeadPhone(e.target.value)}
                      placeholder="+44 7700 900000"
                      className="w-full h-8 px-2.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Source</label>
                    <input value={addLeadSource} onChange={e => setAddLeadSource(e.target.value)}
                      placeholder="manual"
                      className="w-full h-8 px-2.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white" />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Price (leave blank for default)</label>
                    <input value={addLeadPrice} onChange={e => setAddLeadPrice(e.target.value)}
                      placeholder={String(client.price_per_lead)} type="number" min="0"
                      className="w-full h-8 px-2.5 text-xs rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white" />
                  </div>
                </div>
                {addLeadError && <p className="text-xs text-red-500">{addLeadError}</p>}
                <div className="flex items-center gap-2">
                  <button onClick={handleAddLead} disabled={addLeadLoading}
                    className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-white rounded-lg disabled:opacity-60 transition-opacity hover:opacity-90"
                    style={{ background: "hsl(252 89% 58%)" }}>
                    <Plus className="w-3.5 h-3.5" />{addLeadLoading ? "Adding…" : "Add lead"}
                  </button>
                  <button onClick={() => { setShowAddLeadForm(false); setAddLeadError(null); }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Cancel</button>
                </div>
              </div>
            )}

            {client.leads.length === 0 && !showAddLeadForm ? (
              <p className="text-sm text-gray-400 py-4 text-center">No leads yet.</p>
            ) : client.leads.length > 0 ? (
              <div className="rounded-lg border border-gray-100 overflow-hidden">
                <div className="divide-y divide-gray-50">
                  {client.leads.map(lead => {
                    const status = leadStatuses[lead.id] ?? lead.lead_status ?? "new";
                    const isEditingNote = editingLeadNoteId === lead.id;
                    return (
                      <div key={lead.id} className="px-4 py-3 space-y-2 group hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-xs font-medium text-gray-800">{lead.name ?? "-"}</p>
                              <span className="text-xs text-gray-400">{fmt(lead.created_at)}</span>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${LEAD_STATUS_COLORS[status]}`}>{LEAD_STATUS_LABELS[status]}</span>
                            </div>
                            {lead.email && <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-purple-600 truncate"><Mail className="w-3 h-3 shrink-0" />{lead.email}</a>}
                            {lead.phone && <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-gray-400"><Phone className="w-3 h-3 shrink-0" />{lead.phone}</a>}
                          </div>
                          <button disabled={deletingLeadId === lead.id}
                            onClick={async () => {
                              setDeletingLeadId(lead.id);
                              const r = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json", "x-admin-password": adminPw }, body: JSON.stringify({ action: "delete-lead", leadId: lead.id }) });
                              setDeletingLeadId(null);
                              if (r.ok) onClientUpdated({ id: client.id, leads: client.leads.filter(l => l.id !== lead.id) });
                            }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 shrink-0 disabled:opacity-30">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <select value={status} onChange={e => updateLeadStatus(lead.id, e.target.value)}
                            className="h-6 px-1.5 text-xs rounded border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-purple-300">
                            {Object.entries(LEAD_STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                          </select>
                          {!isEditingNote ? (
                            <button onClick={() => { setEditingLeadNoteId(lead.id); setLeadNotesDraft(p => ({ ...p, [lead.id]: lead.lead_notes ?? "" })); }}
                              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-1.5 py-0.5 rounded border border-gray-200 hover:bg-white transition-colors">
                              <Pencil className="w-2.5 h-2.5" />{lead.lead_notes ? "Edit note" : "Add note"}
                            </button>
                          ) : (
                            <div className="flex items-center gap-1">
                              <input value={leadNotesDraft[lead.id] ?? ""} onChange={e => setLeadNotesDraft(p => ({ ...p, [lead.id]: e.target.value }))}
                                autoFocus placeholder="Add a note…"
                                className="h-6 px-2 text-xs rounded border border-gray-200 w-40 focus:outline-none focus:ring-1 focus:ring-purple-300" />
                              <button onClick={() => saveLeadNote(lead.id)} className="text-xs text-white px-2 py-0.5 rounded font-medium" style={{ background: "hsl(252 89% 58%)" }}>Save</button>
                              <button onClick={() => setEditingLeadNoteId(null)} className="text-xs text-gray-400">×</button>
                            </div>
                          )}
                          {lead.lead_notes && !isEditingNote && <span className="text-xs text-gray-400 italic truncate max-w-xs">{lead.lead_notes}</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

type LangCode = "en";

const INDUSTRIES: { value: string; label: string; plural: string }[] = [
  { value: "plumbing",        label: "Plumber",          plural: "plumbing companies" },
  { value: "carpentry",       label: "Carpenter",        plural: "carpentry companies" },
  { value: "painting",        label: "Painter",          plural: "painting companies" },
  { value: "roofing",         label: "Roofer",           plural: "roofing companies" },
  { value: "electrical",      label: "Electrician",      plural: "electrical companies" },
  { value: "cleaning",        label: "Cleaner",          plural: "cleaning companies" },
  { value: "landscaping",     label: "Landscaper",       plural: "landscaping companies" },
  { value: "car mechanic",    label: "Car Mechanic",     plural: "car repair shops" },
  { value: "hairdresser",     label: "Hairdresser",      plural: "hair salons" },
  { value: "personal trainer",label: "Personal Trainer", plural: "personal trainers" },
  { value: "physiotherapy",   label: "Physiotherapist",  plural: "physiotherapy clinics" },
  { value: "accounting",      label: "Accountant",       plural: "accounting firms" },
  { value: "locksmith",       label: "Locksmith",        plural: "locksmith companies" },
  { value: "masonry",         label: "Mason",            plural: "masonry companies" },
  { value: "property service",label: "Property Service", plural: "property service companies" },
  { value: "other",           label: "Other",            plural: "businesses" },
];

const detectIndustry = (query: string): string | null => {
  const q = query.toLowerCase();
  for (const ind of INDUSTRIES) {
    if (ind.value === "other") continue;
    if (q.includes(ind.value.toLowerCase()) || q.includes(ind.label.toLowerCase())) return ind.value;
  }
  return null;
};

function getMsg(name: string, plural: string, label: string): { subject: string; body: string } {
  return {
    subject: `Free leads for your ${label} business - first 30 days`,
    body: `Hi ${name || "[name]"},\n\nI help small ${plural} get more clients through Google and Facebook ads, without you having to spend time on it yourself.\nWe use a pay-per-lead model, meaning you only pay per enquiry you receive - no fixed monthly price.\n\nThe first 30 days are free.\nFeel free to reply if this sounds interesting.`,
  };
}

const SUBJECT_VARIANTS = (label: string): string[] => [
  `Free leads for your ${label} business - first 30 days`,
  `You only pay when you get clients - ${label}`,
  `More ${label} clients - no fixed monthly price`,
];

function matchesEmployeeCount(employees: string | null, count: string): boolean {
  if (!count.trim()) return true;
  if (!employees) return false;
  const n = parseInt(count);
  if (isNaN(n)) return true;
  if (employees.includes("+")) return n >= parseInt(employees);
  const parts = employees.split("-");
  if (parts.length === 1) return n === parseInt(parts[0]);
  return n >= parseInt(parts[0]) && n <= parseInt(parts[1]);
}

const ENGLISH_CITIES = [
  "London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Sheffield", "Edinburgh",
  "Bristol", "Liverpool", "Cardiff", "Nottingham", "Leicester", "Coventry", "Bradford",
  "New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia",
  "San Antonio", "San Diego", "Dallas", "San Jose", "Austin", "Jacksonville",
  "Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Auckland",
];

type CvrResult = {
  name: string;
  city: string;
  zipcode: string;
  address: string;
  phone: string | null;
  email: string | null;
  homepage: string | null;
  industrydesc: string | null;
  employees: string | null;
  owners: { name: string }[] | null;
  vat: number | null;
};

const CONTACTED_KEY = "markety_contacted_companies";
const CONTACTED_DETAILS_KEY = "markety_contacted_details";

type ContactedCompany = CvrResult & { contactedAt: string };

function getContacted(): Set<number> {
  try { return new Set(JSON.parse(localStorage.getItem(CONTACTED_KEY) ?? "[]")); } catch { return new Set(); }
}
function getContactedDetails(): ContactedCompany[] {
  try { return JSON.parse(localStorage.getItem(CONTACTED_DETAILS_KEY) ?? "[]"); } catch { return []; }
}
function addContacted(company: CvrResult) {
  if (!company.vat) return;
  const s = getContacted(); s.add(company.vat);
  localStorage.setItem(CONTACTED_KEY, JSON.stringify([...s]));
  const details = getContactedDetails();
  if (!details.find(c => c.vat === company.vat)) {
    details.unshift({ ...company, contactedAt: new Date().toISOString() });
    localStorage.setItem(CONTACTED_DETAILS_KEY, JSON.stringify(details));
  }
}

function CopyField({ label, value, href }: { label: string; value: string; href?: string }) {
  const [copied, setCopied] = useState(false);
  const doCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="flex items-center justify-between gap-2 py-1.5 border-b border-gray-50 last:border-0">
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        {href
          ? <a href={href} target="_blank" rel="noreferrer" className="text-xs text-purple-600 hover:underline truncate block">{value}</a>
          : <p className="text-xs text-gray-800 truncate">{value}</p>}
      </div>
      <button onClick={doCopy} className="shrink-0 text-gray-300 hover:text-gray-500 transition-colors">
        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      </button>
    </div>
  );
}

function CompanyFinder({ onSelect }: { onSelect: (firstName: string, industryHint: string | null, email: string, companyName: string) => void }) {
  const [city, setCity] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CvrResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [used, setUsed] = useState(false);
  const [cityAttempt, setCityAttempt] = useState(0);
  const [employeeCount, setEmployeeCount] = useState("3");
  const [contacted, setContacted] = useState<Set<number>>(() => getContacted());

  const doSearch = async (attempt: number, empCount = employeeCount) => {
    if (!query.trim()) return;
    setLoading(true);
    if (attempt === 0) { setResult(null); setNotFound(false); setUsed(false); }
    const cityMod = attempt === 0 && !city.trim()
      ? ""
      : city.trim() || ENGLISH_CITIES[attempt % ENGLISH_CITIES.length];
    const q = cityMod ? `${query.trim()} ${cityMod}` : query.trim();
    try {
      const r = await fetch(`/api/admin?action=find-companies&q=${encodeURIComponent(q)}`);
      const d = await r.json();
      if (d.result && d.result.name) {
        const alreadyContacted = d.result.vat && getContacted().has(d.result.vat);
        if ((!d.result.email || !matchesEmployeeCount(d.result.employees, empCount) || alreadyContacted) && attempt < 15) {
          setCityAttempt(attempt + 1);
          await doSearch(attempt + 1, empCount);
          return;
        }
        setUsed(false);
        setResult(d.result);
      } else if (attempt < 15 && empCount.trim()) {
        setCityAttempt(attempt + 1);
        await doSearch(attempt + 1, empCount);
        return;
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const search = () => { setCityAttempt(0); doSearch(0, employeeCount); };
  const refresh = () => { const next = cityAttempt + 1; setCityAttempt(next); doSearch(next, employeeCount); };

  const use = () => {
    if (!result) return;
    const ownerName = result.owners?.[0]?.name ?? "";
    const firstName = ownerName.split(" ")[0] ?? "";
    const industryHint = detectIndustry(query);
    onSelect(firstName, industryHint, result.email ?? "", result.name);
    setUsed(true);
  };

  const ownerName = result?.owners?.[0]?.name ?? "";
  const firstName = ownerName.split(" ")[0] ?? "";
  const address = result ? `${result.address}, ${result.zipcode} ${result.city}` : "";
  const websiteUrl = result?.homepage ?? null;
  const googleUrl = result ? `https://www.google.com/search?q=${encodeURIComponent(result.name + " " + result.city + " website")}` : "";
  const linkedInUrl = result ? `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(result.name)}` : "";

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
      <div>
        <p className="text-sm font-semibold text-gray-900 mb-0.5">Company finder</p>
        <p className="text-xs text-gray-400">Search for English-speaking small businesses (UK, US, AU).</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500">Keyword</label>
          <input value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="plumber, carpenter, electrician..."
            className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500">City (optional)</label>
          <input value={city} onChange={e => setCity(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="London, Manchester..."
            className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200" />
        </div>
        <div className="flex flex-col gap-1.5 col-span-2">
          <label className="text-xs font-semibold text-gray-500">Employees (optional)</label>
          <input
            type="number"
            min="1"
            value={employeeCount}
            onChange={e => setEmployeeCount(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="e.g. 5"
            className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200" />
        </div>
      </div>

      <button onClick={search} disabled={loading || !query.trim()}
        className="h-9 px-4 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40"
        style={{ background: "hsl(252 89% 58%)" }}>
        {loading ? "Searching..." : "Search"}
      </button>

      {notFound && <p className="text-xs text-gray-400">No company found - try different keywords.</p>}

      {result && (
        <div className="border border-gray-100 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-bold text-gray-900">{result.name}</p>
              {result.industrydesc && <p className="text-xs text-gray-400 mt-0.5">{result.industrydesc}</p>}
            </div>
            <button onClick={refresh} disabled={loading}
              className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40 mt-0.5"
              title="Find another company">
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>

          <div className="px-4 py-2">
            {ownerName && <CopyField label="Owner" value={ownerName} />}
            {firstName && <CopyField label="First name" value={firstName} />}
            {result.email && <CopyField label="Email" value={result.email} href={`mailto:${result.email}`} />}
            {result.phone && <CopyField label="Phone" value={result.phone} href={`tel:${result.phone}`} />}
            {websiteUrl && <CopyField label="Website" value={websiteUrl} href={websiteUrl} />}
            {address && <CopyField label="Address" value={address} />}
            {result.employees && <CopyField label="Employees" value={result.employees} />}
            {result.vat && <CopyField label="CVR" value={String(result.vat)} />}
          </div>

          <div className="px-4 pb-3 pt-1 flex flex-wrap gap-2">
            <button onClick={use} disabled={used}
              className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg disabled:opacity-50 transition-opacity"
              style={{ background: "hsl(252 89% 58%)" }}>
              {used ? <><Check className="w-3 h-3" />Applied</> : "Use in message"}
            </button>
            {websiteUrl ? (
              <a href={websiteUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <ExternalLink className="w-3 h-3" />Open website
              </a>
            ) : (
              <a href={googleUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
                <ExternalLink className="w-3 h-3" />Find website
              </a>
            )}
            <a href={linkedInUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
              <ExternalLink className="w-3 h-3" />LinkedIn
            </a>
            {result.vat && !contacted.has(result.vat) && (
              <button
                onClick={() => {
                  addContacted(result);
                  const next = contacted;
                  next.add(result.vat!);
                  setContacted(new Set(next));
                  refresh();
                }}
                className="flex items-center gap-1.5 text-xs font-medium text-orange-600 border border-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">
                <Check className="w-3 h-3" />Outreached - skip next time
              </button>
            )}
            {result.vat && contacted.has(result.vat) && (
              <span className="flex items-center gap-1.5 text-xs text-gray-400 px-3 py-1.5">
                <Check className="w-3 h-3" />Already outreached
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OutreachTab({ authedPw }: { authedPw: string }) {
  const [name, setName] = useState("");
  const [toEmail, setToEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industryVal, setIndustryVal] = useState(INDUSTRIES[0].value);
  const [customIndustry, setCustomIndustry] = useState("");
  const [copiedSubject, setCopiedSubject] = useState(false);
  const [copiedBody, setCopiedBody] = useState(false);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<"success" | "error" | null>(null);
  const [subjectIdx, setSubjectIdx] = useState(0);
  const [autoLoading, setAutoLoading] = useState(false);
  const [autoResult, setAutoResult] = useState<CvrResult | null>(null);
  const [researching, setResearching] = useState(false);
  const [researchDone, setResearchDone] = useState(false);

  const isCustom = industryVal === "other";
  const selected = INDUSTRIES.find(i => i.value === industryVal) ?? INDUSTRIES[0];
  const plural = isCustom ? customIndustry || "businesses" : selected.plural;
  const label = isCustom ? customIndustry || "business" : selected.label;
  const subjectVariants = SUBJECT_VARIANTS(label);
  const generatedSubject = companyName
    ? `More clients for ${companyName}`
    : subjectVariants[subjectIdx % subjectVariants.length];
  const { body: generatedBody } = getMsg(name, plural, label);

  const [editableSubject, setEditableSubject] = useState(generatedSubject);
  const [editableBody, setEditableBody] = useState(generatedBody);

  useEffect(() => { setEditableSubject(generatedSubject); }, [generatedSubject]);
  useEffect(() => { setEditableBody(generatedBody); }, [generatedBody]);

  const handleSelect = (firstName: string, industryHint: string | null, email: string, company: string) => {
    setName(firstName);
    if (industryHint) setIndustryVal(industryHint);
    if (email) setToEmail(email);
    if (company) setCompanyName(company);
    setSendResult(null);
  };

  const findRandom = async () => {
    setAutoLoading(true);
    setAutoResult(null);
    setResearchDone(false);
    const validIndustries = INDUSTRIES.filter(i => i.value !== "other");
    const industry = validIndustries[Math.floor(Math.random() * validIndustries.length)];
    for (let attempt = 0; attempt < 15; attempt++) {
      try {
        const city = ENGLISH_CITIES[(Math.floor(Math.random() * ENGLISH_CITIES.length) + attempt) % ENGLISH_CITIES.length];
        const q = `${industry.value} ${city}`;
        const r = await fetch(`/api/admin?action=find-companies&q=${encodeURIComponent(q)}`);
        const d = await r.json();
        if (d.result?.name) {
          const alreadyContacted = d.result.vat && getContacted().has(d.result.vat);
          if (alreadyContacted || !d.result.email) continue;
          setAutoResult(d.result);
          const ownerName = d.result.owners?.[0]?.name ?? "";
          const firstName = ownerName.split(" ")[0] ?? "";
          handleSelect(firstName, industry.value, d.result.email ?? "", d.result.name);
          setAutoLoading(false);
          return;
        }
      } catch { /* try next city */ }
    }
    setAutoLoading(false);
  };

  const researchAndPersonalize = async () => {
    if (!autoResult?.homepage) return;
    setResearching(true);
    setResearchDone(false);
    try {
      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
        body: JSON.stringify({
          action: "research-company",
          homepage: autoResult.homepage,
          companyName: autoResult.name,
          industry: industryVal,
        }),
      });
      const d = await r.json();
      if (d.body) {
        setEditableBody(d.body);
        setResearchDone(true);
      }
    } catch { /* silent */ } finally {
      setResearching(false);
    }
  };

  const copy = (text: string, which: "subject" | "body") => {
    navigator.clipboard.writeText(text);
    if (which === "subject") { setCopiedSubject(true); setTimeout(() => setCopiedSubject(false), 1500); }
    else { setCopiedBody(true); setTimeout(() => setCopiedBody(false), 1500); }
  };

  const send = async () => {
    if (!toEmail.trim()) return;
    setSending(true);
    setSendResult(null);
    try {
      const r = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
        body: JSON.stringify({ action: "send-outreach", to: toEmail.trim(), subject: editableSubject, body: editableBody }),
      });
      setSendResult(r.ok ? "success" : "error");
    } catch {
      setSendResult("error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Outreach</h1>
        <p className="text-sm text-gray-400">Find a company and generate a ready-to-send message.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-3">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-0.5">Auto-fill</p>
              <p className="text-xs text-gray-400">Pick a random company and fill the message automatically.</p>
            </div>
            <button onClick={findRandom} disabled={autoLoading}
              className="h-9 px-4 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40 flex items-center gap-2"
              style={{ background: "hsl(252 89% 58%)" }}>
              {autoLoading ? (
                <><div className="w-3.5 h-3.5 border-2 border-t-transparent rounded-full animate-spin border-white/70" />Finding...</>
              ) : (
                <><RefreshCw className="w-3.5 h-3.5" />{autoResult ? "Try another" : "Find random company"}</>
              )}
            </button>
            {autoResult && (
              <div className="border border-gray-100 rounded-lg px-4 py-3 bg-gray-50 space-y-2">
                <div>
                  <p className="text-sm font-semibold text-gray-900">{autoResult.name}</p>
                  {autoResult.email && <p className="text-xs text-gray-500 mt-0.5">{autoResult.email}</p>}
                  {autoResult.industrydesc && <p className="text-xs text-gray-400 mt-0.5">{autoResult.industrydesc}</p>}
                  {(autoResult.city || autoResult.employees) && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {[autoResult.city, autoResult.employees ? `${autoResult.employees} emp.` : null].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                {autoResult.homepage && (
                  <button onClick={researchAndPersonalize} disabled={researching}
                    className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white transition-opacity disabled:opacity-50"
                    style={{ background: researchDone ? "hsl(142 71% 45%)" : "hsl(252 89% 58%)" }}>
                    {researching ? (
                      <><div className="w-3 h-3 border-2 border-t-transparent rounded-full animate-spin border-white/70" />Researching website...</>
                    ) : researchDone ? (
                      <><Check className="w-3 h-3" />Personalized</>
                    ) : (
                      <><Zap className="w-3 h-3" />Research & personalize</>
                    )}
                  </button>
                )}
                {!autoResult.homepage && (
                  <p className="text-xs text-gray-400">No website found - can't personalize</p>
                )}
              </div>
            )}
          </div>

          <CompanyFinder onSelect={handleSelect} />

          <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
            <p className="text-sm font-semibold text-gray-900">Message settings</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500">First name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Thomas"
                  className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500">Industry</label>
                <select value={industryVal} onChange={e => setIndustryVal(e.target.value)}
                  className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white">
                  {INDUSTRIES.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                </select>
                {isCustom && (
                  <input value={customIndustry} onChange={e => setCustomIndustry(e.target.value)}
                    placeholder="Type industry manually..."
                    className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">From</label>
            <div className="h-10 px-3 flex items-center rounded-lg border border-gray-100 bg-gray-50 text-sm text-gray-400">
              info@marketyleadgen.com
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500">To</label>
            <input value={toEmail} onChange={e => { setToEmail(e.target.value); setSendResult(null); }}
              placeholder="recipient@company.dk"
              className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500">Subject</label>
              <div className="flex items-center gap-2">
                <button onClick={() => setSubjectIdx(i => i + 1)}
                  className="text-gray-300 hover:text-gray-500 transition-colors" title="Try another subject">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => copy(editableSubject, "subject")}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  {copiedSubject ? <><Check className="w-3 h-3 text-green-500" /><span className="text-green-600">Copied</span></> : <><Copy className="w-3 h-3" />Copy</>}
                </button>
              </div>
            </div>
            <input
              value={editableSubject}
              onChange={e => setEditableSubject(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-500">Message</label>
              <button onClick={() => copy(editableBody, "body")}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                {copiedBody ? <><Check className="w-3 h-3 text-green-500" /><span className="text-green-600">Copied</span></> : <><Copy className="w-3 h-3" />Copy</>}
              </button>
            </div>
            <textarea
              value={editableBody}
              onChange={e => {
                setEditableBody(e.target.value);
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              rows={8}
              className="w-full px-3 py-3 rounded-lg border border-gray-200 text-sm text-gray-800 leading-relaxed focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white resize-none overflow-hidden" />
          </div>

          <button onClick={send} disabled={sending || !toEmail.trim()}
            className="w-full h-10 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40 flex items-center justify-center gap-2"
            style={{ background: "hsl(252 89% 58%)" }}>
            <Mail className="w-4 h-4" />
            {sending ? "Sending..." : "Send email"}
          </button>

          {sendResult === "success" && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> Email sent to {toEmail}
            </div>
          )}
          {sendResult === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <X className="w-4 h-4 shrink-0" /> Failed to send - check the email address
            </div>
          )}
        </div>
      </div>

      <ContactedList />
    </div>
  );
}

function ContactedList() {
  const [companies, setCompanies] = useState<ContactedCompany[]>(() => getContactedDetails());
  const [filter, setFilter] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "employees">("date");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [migrating, setMigrating] = useState(false);

  useEffect(() => {
    const details = getContactedDetails();
    const detailVats = new Set(details.map(c => c.vat));
    const oldVats = [...getContacted()].filter(v => !detailVats.has(v));
    if (oldVats.length === 0) return;
    setMigrating(true);
    Promise.all(
      oldVats.map(vat =>
        fetch(`/api/admin?action=find-companies&vat=${vat}`)
          .then(r => r.json())
          .then(d => d.result ? { ...d.result, contactedAt: new Date(0).toISOString() } : null)
          .catch(() => null)
      )
    ).then(results => {
      const valid = results.filter(Boolean) as ContactedCompany[];
      if (valid.length > 0) {
        const updated = [...details, ...valid];
        localStorage.setItem(CONTACTED_DETAILS_KEY, JSON.stringify(updated));
        setCompanies(updated);
      }
      setMigrating(false);
    });
  }, []);

  const filtered = companies.filter(c =>
    !filter || [c.name, c.city, c.industrydesc].some(v => v?.toLowerCase().includes(filter.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortBy === "date") cmp = new Date(b.contactedAt).getTime() - new Date(a.contactedAt).getTime();
    else if (sortBy === "name") cmp = a.name.localeCompare(b.name);
    else if (sortBy === "employees") {
      const ea = parseInt(a.employees?.split("-")[0] ?? "0");
      const eb = parseInt(b.employees?.split("-")[0] ?? "0");
      cmp = ea - eb;
    }
    return sortDir === "desc" ? cmp : -cmp;
  });

  if (companies.length === 0 && !migrating) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Contacted companies</h2>
          <p className="text-sm text-gray-400">{companies.length} {companies.length === 1 ? "company" : "companies"} outreached</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter..."
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm w-40 focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-gray-400" />
          <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-200">
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="employees">Employees</option>
          </select>
          <button onClick={() => setSortDir(d => d === "asc" ? "desc" : "asc")}
            className="h-9 px-3 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            {sortDir === "desc" ? "↓" : "↑"}
          </button>
        </div>
      </div>

      {migrating && <p className="text-xs text-gray-400">Loading info for previously contacted companies...</p>}

      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        {sorted.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-400 text-center">No companies match your filter.</p>
        ) : sorted.map(c => (
          <div key={c.vat ?? c.name} className="border-b border-gray-50 last:border-0">
            <button onClick={() => setExpanded(expanded === c.vat ? null : (c.vat ?? null))}
              className="w-full px-5 py-3.5 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{c.name}</p>
                <p className="text-xs text-gray-400 truncate">{[c.city, c.industrydesc].filter(Boolean).join(" · ")}</p>
              </div>
              <div className="shrink-0 text-right">
                {c.employees && <p className="text-xs text-gray-500">{c.employees} emp.</p>}
                {c.contactedAt && new Date(c.contactedAt).getFullYear() > 1970 && (
                  <p className="text-xs text-gray-400">{new Date(c.contactedAt).toLocaleDateString("da-DK", { day: "numeric", month: "short" })}</p>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-300 shrink-0 transition-transform ${expanded === c.vat ? "rotate-180" : ""}`} />
            </button>

            {expanded === c.vat && (
              <div className="px-5 pb-4 space-y-1 border-t border-gray-50">
                {c.owners?.[0] && <CopyField label="Owner" value={c.owners[0].name} />}
                {c.email && <CopyField label="Email" value={c.email} href={`mailto:${c.email}`} />}
                {c.phone && <CopyField label="Phone" value={c.phone} href={`tel:${c.phone}`} />}
                {c.homepage && <CopyField label="Website" value={c.homepage} href={c.homepage} />}
                {c.address && <CopyField label="Address" value={`${c.address}, ${c.zipcode} ${c.city}`} />}
                {c.employees && <CopyField label="Employees" value={c.employees} />}
                {c.vat && <CopyField label="CVR" value={String(c.vat)} />}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

type EmailRow = {
  uid: number;
  subject: string;
  from: string;
  date: string | null;
  seen: boolean;
};

function EmailBody({ uid, authedPw }: { uid: number; authedPw: string }) {
  const [body, setBody] = useState<{ html: string | null; text: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/emails?uid=${uid}`, { headers: { "x-admin-password": authedPw } })
      .then(r => r.json())
      .then(d => setBody(d))
      .catch(() => setBody({ html: null, text: "Failed to load email body." }))
      .finally(() => setLoading(false));
  }, [uid, authedPw]);

  if (loading) return (
    <div className="flex items-center gap-2 py-4 px-1 text-sm text-gray-400">
      <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin border-gray-300" /> Loading...
    </div>
  );

  if (body?.html) {
    const safeHtml = body.html
      .replace(/<base[^>]*>/gi, "")
      .replace(/<a /gi, "<a target=\"_blank\" rel=\"noopener noreferrer\" ");
    return (
      <iframe
        srcDoc={safeHtml}
        sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        className="w-full rounded-lg border border-gray-100 bg-white"
        style={{ minHeight: 320, height: "auto" }}
        onLoad={e => {
          const iframe = e.currentTarget;
          iframe.style.height = (iframe.contentDocument?.body?.scrollHeight ?? 320) + 24 + "px";
        }}
      />
    );
  }

  return (
    <pre className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100 font-sans">
      {body?.text || "(empty)"}
    </pre>
  );
}

function ContentTab({ authedPw }: { authedPw: string }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<ContentItem["type"] | "all">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkApproving, setBulkApproving] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [postNeedsManual, setPostNeedsManual] = useState<Record<string, string>>({});
  const [showEmptyNotif, setShowEmptyNotif] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin?action=list-content", { headers: { "x-admin-password": authedPw } });
      const d = await r.json();
      if (d.error) setError(d.error);
      else setItems(d.items ?? []);
    } catch {
      setError("Failed to load content");
    } finally {
      setLoading(false);
    }
  }, [authedPw]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!loading) {
      const hasPendingLinkedIn = items.some(i => i.type === "linkedin_post" && i.status === "pending");
      setShowEmptyNotif(!hasPendingLinkedIn);
    }
  }, [items, loading]);

  const updateStatus = async (id: string, status: ContentItem["status"], content?: string) => {
    setSaving(id);
    try {
      if (status === "approved") {
        const item = items.find(i => i.id === id);
        const r = await fetch("/api/admin?action=approve-and-post", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
          body: JSON.stringify({ id, type: item?.type, content: content ?? item?.content }),
        });
        const d = await r.json().catch(() => ({}));
        if (d.posted) {
          // Successfully posted - remove from list
          setItems(prev => prev.filter(i => i.id !== id));
        } else {
          // Approved but not posted - show manual options
          setItems(prev => prev.map(i => i.id === id ? {
            ...i,
            status: "approved",
            ...(content !== undefined ? { content } : {}),
          } : i));
          if (d.reason) setPostNeedsManual(prev => ({ ...prev, [id]: d.reason as string }));
        }
      } else {
        const body: Record<string, unknown> = { id, status };
        if (content !== undefined) body.content = content;
        await fetch("/api/admin?action=update-content-status", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
          body: JSON.stringify(body),
        });
        setItems(prev => prev.filter(i => i.id !== id));
      }
      if (editingId === id) setEditingId(null);
    } finally {
      setSaving(null);
    }
  };

  const markPosted = async (id: string) => {
    await fetch("/api/admin?action=update-content-status", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
      body: JSON.stringify({ id, status: "posted" }),
    });
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "posted", posted_at: new Date().toISOString() } : i));
  };

  const bulkApprove = async () => {
    if (selectedIds.size === 0) return;
    setBulkApproving(true);
    const ids = Array.from(selectedIds);
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
      body: JSON.stringify({ action: "bulk-approve-content", ids }),
    });
    setItems(prev => prev.map(i => selectedIds.has(i.id) ? { ...i, status: "approved" as const } : i));
    setSelectedIds(new Set());
    setBulkApproving(false);
  };

  const generateContent = async (type: "linkedin_post" | "x_post") => {
    setGenerating(type);
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
      body: JSON.stringify({ action: "generate-content", type }),
    });
    setGenerating(null);
    if (r.ok) await load();
  };

  const deleteItem = async (id: string) => {
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
      body: JSON.stringify({ action: "delete-content", id }),
    });
    setItems(prev => prev.filter(i => i.id !== id));
    setSelectedIds(prev => { const n = new Set(prev); n.delete(id); return n; });
  };

  const startEdit = (item: ContentItem) => { setEditDraft(item.content); setEditingId(item.id); };
  const cancelEdit = () => setEditingId(null);

const typeLabels: Record<ContentItem["type"], string> = {
    linkedin_post: "LinkedIn Posts",
    linkedin_dm: "LinkedIn DMs",
    email: "Emails",
    x_post: "X Posts",
  };

  const filtered = typeFilter === "all" ? items : items.filter(i => i.type === typeFilter);
  const pendingCount = items.filter(i => i.status === "pending").length;

  const statusColors: Record<ContentItem["status"], string> = {
    pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
    approved: "bg-blue-50 text-blue-700 border-blue-200",
    posted: "bg-green-50 text-green-700 border-green-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "hsl(252 89% 58%) transparent transparent transparent" }} />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 max-w-lg">
      <X className="w-4 h-4 shrink-0" /> {error}
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Content approvals</h2>
          <p className="text-sm text-gray-500">Review posts and messages before they go live</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {pendingCount > 0 && (
            <span className="text-xs font-semibold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded-full">
              {pendingCount} pending
            </span>
          )}
          {selectedIds.size > 0 && (
            <button onClick={bulkApprove} disabled={bulkApproving}
              className="text-xs text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-60"
              style={{ background: "hsl(142 71% 45%)" }}>
              {bulkApproving ? "Approving…" : `Approve ${selectedIds.size} selected`}
            </button>
          )}
          <button onClick={() => generateContent("linkedin_post")} disabled={generating === "linkedin_post"}
            title="Generate LinkedIn post"
            className="w-8 h-8 flex items-center justify-center rounded-lg disabled:opacity-60 hover:opacity-90 transition-opacity shrink-0"
            style={{ background: generating === "linkedin_post" ? "#888" : "#0A66C2" }}>
            {generating === "linkedin_post"
              ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            }
          </button>
          <button onClick={() => setShowEmptyNotif(true)} title="Test empty notification"
            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            Test notif
          </button>
          <button onClick={load} className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">Refresh</button>
        </div>
      </div>

      {showEmptyNotif && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-5">
          <span className="text-amber-500 text-base mt-0.5">!</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-800">No LinkedIn posts in queue</p>
            <p className="text-xs text-amber-700 mt-0.5">There are no pending posts ready to approve. Click the LinkedIn button above to generate a new one.</p>
          </div>
          <button onClick={() => setShowEmptyNotif(false)} className="text-amber-400 hover:text-amber-600 text-sm leading-none mt-0.5">x</button>
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "linkedin_post", "linkedin_dm", "email"] as const).map(t => {
          const count = t === "all" ? items.length : items.filter(i => i.type === t).length;
          const pending = t === "all" ? pendingCount : items.filter(i => i.type === t && i.status === "pending").length;
          return (
            <button key={t} onClick={() => setTypeFilter(t)}
              className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border transition-colors ${typeFilter === t ? "border-transparent text-white" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
              style={typeFilter === t ? { background: "hsl(252 89% 58%)" } : {}}>
              {t === "all" ? "All" : typeLabels[t]}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${typeFilter === t ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{count}</span>
              {pending > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${typeFilter === t ? "bg-yellow-300 text-yellow-900" : "bg-yellow-100 text-yellow-700"}`}>{pending}</span>}
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">
          {typeFilter === "all" ? "No content yet. Posts will appear here once generated." : `No ${typeLabels[typeFilter as ContentItem["type"]]} yet.`}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className={`bg-white border rounded-xl p-5 space-y-3 ${selectedIds.has(item.id) ? "border-purple-300 bg-purple-50/30" : "border-gray-200"}`}>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                {item.status === "pending" && (
                  <input type="checkbox" checked={selectedIds.has(item.id)}
                    onChange={e => setSelectedIds(prev => { const n = new Set(prev); e.target.checked ? n.add(item.id) : n.delete(item.id); return n; })}
                    className="w-3.5 h-3.5 rounded accent-purple-600 shrink-0" />
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColors[item.status]}`}>{item.status}</span>
                  <span
                    className="text-xs font-medium px-2 py-0.5 rounded-full border"
                    style={item.type === "linkedin_post"
                      ? { background: "#EEF4FF", color: "#0A66C2", borderColor: "#C7D9F5" }
                      : item.type === "x_post"
                      ? { background: "#F0F0F0", color: "#000", borderColor: "#D0D0D0" }
                      : { background: "#F9FAFB", color: "#6B7280", borderColor: "#F3F4F6" }}>
                    {item.type === "x_post" ? "𝕏 Post" : typeLabels[item.type]}
                  </span>
                  {item.type === "x_post" && (
                    <span className={`text-xs font-mono ${item.content.length > 280 ? "text-red-500 font-bold" : "text-gray-400"}`}>
                      {item.content.length}/280
                    </span>
                  )}
                  {item.recipient && <span className="text-xs text-gray-500">To: {item.recipient}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString("da-DK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                  <button onClick={() => deleteItem(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {editingId === item.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editDraft}
                    onChange={e => setEditDraft(e.target.value)}
                    rows={8}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-300"
                  />
                  {item.type === "x_post" && (
                    <p className={`text-xs font-mono text-right ${editDraft.length > 280 ? "text-red-500 font-bold" : "text-gray-400"}`}>
                      {editDraft.length}/280 characters
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={() => updateStatus(item.id, item.status, editDraft)}
                      disabled={saving === item.id}
                      className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-60"
                      style={{ background: "hsl(252 89% 58%)" }}>
                      <Save className="w-3 h-3" />{saving === item.id ? "Saving..." : "Save"}
                    </button>
                    <button onClick={cancelEdit} className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 transition-colors">Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{item.content}</p>
              )}

              {item.status === "pending" && editingId !== item.id && (
                <div className="flex gap-2 pt-1 flex-wrap">
                  <button
                    onClick={() => updateStatus(item.id, "approved")}
                    disabled={saving === item.id}
                    className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ background: "hsl(142 71% 45%)" }}>
                    <CheckCircle2 className="w-3.5 h-3.5" />{saving === item.id ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => startEdit(item)}
                    className="flex items-center gap-1.5 text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => updateStatus(item.id, "rejected")}
                    disabled={saving === item.id}
                    className="flex items-center gap-1.5 text-xs text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-60">
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}

              {item.status === "approved" && (item.type === "linkedin_post" || item.type === "x_post") && (
                <div className="flex flex-col gap-2 pt-1">
                  {postNeedsManual[item.id] && (
                    <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      Auto-post failed: {postNeedsManual[item.id]}. Copy and post manually below.
                    </p>
                  )}
                  <p className="text-xs text-gray-400">Copy the text, then open {item.type === "linkedin_post" ? "LinkedIn" : "X"} to paste and publish.</p>
                  <div className="flex flex-wrap gap-2">
                    <CopyButton text={item.content} label="Copy post text" />
                    <a
                      href={item.type === "linkedin_post" ? "https://www.linkedin.com/feed/?shareActive=true" : "https://x.com/compose/post"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
                      style={{ background: item.type === "linkedin_post" ? "#0A66C2" : "#000" }}>
                      <ExternalLink className="w-3 h-3" />
                      Open {item.type === "linkedin_post" ? "LinkedIn" : "X"}
                    </a>
                    <button
                      onClick={() => markPosted(item.id)}
                      className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark as posted
                    </button>
                  </div>
                </div>
              )}
              {item.status === "approved" && item.type !== "linkedin_post" && item.type !== "x_post" && (
                <div className="flex items-center gap-2 text-xs text-blue-600 font-medium pt-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse inline-block" />
                  Approved
                </div>
              )}

              {item.status === "posted" && item.posted_at && (
                <p className="text-xs text-green-600 font-medium pt-1">
                  Posted {new Date(item.posted_at).toLocaleDateString("da-DK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  cvr: string | null;
  company_description: string | null;
  goals: string | null;
  message: string | null;
  created_at: string;
  replied_at: string | null;
  reply_message: string | null;
  pipeline_status: "new" | "reached_out" | "demo" | "proposal" | "won" | "lost";
};

const PIPELINE_LABELS: Record<string, string> = { new: "New", reached_out: "Reached out", demo: "Demo booked", proposal: "Proposal sent", won: "Won", lost: "Lost" };
const PIPELINE_COLORS: Record<string, string> = { new: "bg-gray-100 text-gray-600", reached_out: "bg-blue-50 text-blue-700", demo: "bg-purple-50 text-purple-700", proposal: "bg-yellow-50 text-yellow-700", won: "bg-green-50 text-green-700", lost: "bg-red-50 text-red-400" };

function ContactCard({ c, authedPw, onReplied, onPipelineUpdate, onDelete }: {
  c: ContactSubmission;
  authedPw: string;
  onReplied: (id: string, body: string) => void;
  onPipelineUpdate: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState(c.pipeline_status ?? "new");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const deleteContact = async () => {
    setDeleting(true);
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
      body: JSON.stringify({ action: "delete-contact", id: c.id }),
    });
    onDelete(c.id);
  };

  const updatePipeline = async (status: string) => {
    setPipelineStatus(status as typeof pipelineStatus);
    onPipelineUpdate(c.id, status);
    await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
      body: JSON.stringify({ action: "update-contact-pipeline", id: c.id, pipeline_status: status }),
    });
  };
  const [replying, setReplying] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const first = c.name.split(" ")[0];
  const hasReplied = !!c.replied_at;

  const sendReply = async () => {
    if (!replyBody.trim()) return;
    setSending(true); setSendError(null);
    const r = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
      body: JSON.stringify({ action: "reply-contact", id: c.id, name: c.name, email: c.email, body: replyBody }),
    });
    setSending(false);
    if (!r.ok) { const d = await r.json(); setSendError(d.error ?? "Failed to send"); return; }
    onReplied(c.id, replyBody);
    setReplying(false);
    setReplyBody("");
  };

  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <button onClick={() => setExpanded(e => !e)}
        className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
            {hasReplied && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                <CheckCircle2 className="w-3 h-3" /> Replied
              </span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PIPELINE_COLORS[pipelineStatus]}`}>
              {PIPELINE_LABELS[pipelineStatus]}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">{c.email}{c.company ? ` · ${c.company}` : ""}</p>
        </div>
        <span className="text-xs text-gray-400 shrink-0">{fmt(c.created_at)}</span>
        <div className="text-gray-300 shrink-0">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-gray-50 px-6 py-5 space-y-4">
          <div className="flex items-center gap-2">
            <p className="text-xs text-gray-400 font-medium">Pipeline stage:</p>
            <select value={pipelineStatus} onChange={e => updatePipeline(e.target.value)}
              className="h-7 px-2 text-xs rounded-lg border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-200">
              {Object.entries(PIPELINE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Email</p>
              <p className="text-sm font-medium text-gray-900">{c.email}</p>
            </div>
            {c.company && <div><p className="text-xs text-gray-400 mb-0.5">Company</p><p className="text-sm font-medium text-gray-900">{c.company}</p></div>}
            {c.cvr && <div><p className="text-xs text-gray-400 mb-0.5">CVR</p><p className="text-sm font-medium text-gray-900">{c.cvr}</p></div>}
            <div><p className="text-xs text-gray-400 mb-0.5">Submitted</p><p className="text-sm font-medium text-gray-900">{fmt(c.created_at)}</p></div>
          </div>
          {c.company_description && (
            <div>
              <p className="text-xs text-gray-400 mb-1">What they do</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg px-4 py-3 whitespace-pre-wrap">{c.company_description}</p>
            </div>
          )}
          {c.goals && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Goals</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg px-4 py-3 whitespace-pre-wrap">{c.goals}</p>
            </div>
          )}
          {c.message && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Additional notes</p>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg px-4 py-3 whitespace-pre-wrap">{c.message}</p>
            </div>
          )}

          {replying ? (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
              <div className="text-xs text-gray-400 font-medium px-1 select-none">Hi, {first}</div>
              <textarea
                value={replyBody}
                onChange={e => setReplyBody(e.target.value)}
                rows={5}
                placeholder="Write your reply here..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white"
              />
              <div className="text-xs text-gray-400 px-1 select-none whitespace-pre">{"Markety,\nwww.marketyleadgen.com"}</div>
              {sendError && <p className="text-xs text-red-500">{sendError}</p>}
              <div className="flex gap-2">
                <button onClick={sendReply} disabled={sending || !replyBody.trim()}
                  className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg font-medium disabled:opacity-60 hover:opacity-90 transition-opacity"
                  style={{ background: "hsl(252 89% 58%)" }}>
                  <Mail className="w-3 h-3" />{sending ? "Sending..." : "Send reply"}
                </button>
                <button onClick={() => { setReplying(false); setSendError(null); }}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 transition-colors">Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => { setReplying(true); setReplyBody(c.reply_message ? c.reply_message.split("\n\n").slice(1, -2).join("\n\n") : ""); }}
              className="inline-flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition-opacity"
              style={{ background: "hsl(252 89% 58%)" }}>
              <Mail className="w-3 h-3" />{hasReplied ? "Edit & resend" : "Reply"}
            </button>
          )}

          {hasReplied && c.reply_message && !replying && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Sent reply <span className="text-gray-300">· {fmt(c.replied_at!)}</span></p>
              <p className="text-sm text-gray-600 bg-emerald-50 border border-emerald-100 rounded-lg px-4 py-3 whitespace-pre-wrap leading-relaxed break-all overflow-hidden">{c.reply_message}</p>
            </div>
          )}

          <div className="pt-2 border-t border-gray-50 flex justify-end">
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Delete this contact?</span>
                <button onClick={deleteContact} disabled={deleting}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-60">
                  {deleting ? "Deleting..." : "Yes, delete"}
                </button>
                <button onClick={() => setConfirmDelete(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ContactsTab({ authedPw }: { authedPw: string }) {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin?action=list-contacts", { headers: { "x-admin-password": authedPw } })
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setContacts(d.contacts ?? []); })
      .catch(() => setError("Failed to load contacts"))
      .finally(() => setLoading(false));
  }, [authedPw]);

  const handleReplied = (id: string, body: string) => {
    const c = contacts.find(c => c.id === id);
    if (!c) return;
    const first = c.name.split(" ")[0];
    const full = `Hi, ${first}\n\n${body}\n\nMarkety,\nwww.marketyleadgen.com`;
    setContacts(prev => prev.map(c => c.id === id ? { ...c, replied_at: new Date().toISOString(), reply_message: full } : c));
  };

  const handlePipelineUpdate = (id: string, status: string) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, pipeline_status: status as ContactSubmission["pipeline_status"] } : c));
  };

  const handleDelete = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const filtered = contacts.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const pending = filtered.filter(c => !c.replied_at);
  const replied = filtered.filter(c => !!c.replied_at);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: "hsl(252 89% 58%) transparent transparent transparent" }} />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 max-w-lg">
      <X className="w-4 h-4 shrink-0" /> {error}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Contacts</h1>
          <p className="text-sm text-gray-400">{contacts.length} form {contacts.length === 1 ? "submission" : "submissions"}</p>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..."
            className="h-9 pl-8 pr-7 rounded-lg border border-gray-200 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-gray-300 text-gray-800" />
          {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X className="w-3 h-3" /></button>}
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="text-center py-20 text-sm text-gray-400">No contact submissions yet.</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-sm text-gray-400">No contacts match your search.</div>
      ) : (
        <>
          {pending.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">New ({pending.length})</p>
              <div className="space-y-2">
                {pending.map(c => <ContactCard key={c.id} c={c} authedPw={authedPw} onReplied={handleReplied} onPipelineUpdate={handlePipelineUpdate} onDelete={handleDelete} />)}
              </div>
            </div>
          )}
          {replied.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Replied ({replied.length})</p>
              <div className="space-y-2">
                {replied.map(c => <ContactCard key={c.id} c={c} authedPw={authedPw} onReplied={handleReplied} onPipelineUpdate={handlePipelineUpdate} onDelete={handleDelete} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function EmailsTab({ authedPw }: { authedPw: string }) {
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | "all" | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);

  useEffect(() => {
    fetch("/api/emails", { headers: { "x-admin-password": authedPw } })
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setEmails(d.emails ?? []); })
      .catch(() => setError("Failed to load emails"))
      .finally(() => setLoading(false));
  }, [authedPw]);

  const deleteOne = async (uid: number) => {
    setDeleting(uid);
    try {
      await fetch("/api/emails", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
        body: JSON.stringify({ uid }),
      });
      setEmails(prev => prev.filter(e => e.uid !== uid));
      if (expanded === uid) setExpanded(null);
    } finally { setDeleting(null); }
  };

  const deleteAll = async () => {
    setDeleting("all");
    setConfirmAll(false);
    try {
      await fetch("/api/emails", {
        method: "DELETE",
        headers: { "Content-Type": "application/json", "x-admin-password": authedPw },
        body: JSON.stringify({ all: true }),
      });
      setEmails([]);
      setExpanded(null);
    } finally { setDeleting(null); }
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: "hsl(252 89% 58%) transparent transparent transparent" }} />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 max-w-lg">
      <X className="w-4 h-4 shrink-0" /> {error}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Inbox</h2>
          <p className="text-sm text-gray-500">info@marketyleadgen.com - last 50 emails</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">{emails.length} emails</span>
          {emails.length > 0 && (
            confirmAll ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Delete all?</span>
                <button onClick={deleteAll} disabled={deleting === "all"}
                  className="text-xs font-semibold text-red-600 hover:text-red-700 px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors">
                  {deleting === "all" ? "Deleting..." : "Yes, delete all"}
                </button>
                <button onClick={() => setConfirmAll(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
              </div>
            ) : (
              <button onClick={() => setConfirmAll(true)}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete all
              </button>
            )
          )}
        </div>
      </div>

      {emails.length === 0 ? (
        <div className="text-center py-16 text-gray-400 text-sm">No emails found</div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
          {emails.map(email => (
            <div key={email.uid}>
              <div className="flex items-start px-5 py-4 hover:bg-gray-50 transition-colors group">
                <div className="relative shrink-0 mr-4 mt-0.5">
                  <img src="/Design uden navn (1).png" alt="Markety" className="w-8 h-8 rounded-lg object-cover" />
                  {!email.seen && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-500 border border-white" />}
                </div>
                <button
                  onClick={() => setExpanded(expanded === email.uid ? null : email.uid)}
                  className="flex-1 min-w-0 text-left"
                >
                  <div className="flex items-center justify-between gap-4 mb-0.5">
                    <p className={`text-sm truncate ${email.seen ? "text-gray-600" : "text-gray-900 font-semibold"}`}>
                      {email.from || "(unknown sender)"}
                    </p>
                    <p className="text-xs text-gray-400 shrink-0">
                      {email.date ? new Date(email.date).toLocaleDateString("da-DK", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                  <p className={`text-sm truncate ${email.seen ? "text-gray-500" : "text-gray-800 font-medium"}`}>{email.subject}</p>
                </button>
                <div className="flex items-center gap-1 ml-3 shrink-0">
                  <button
                    onClick={() => deleteOne(email.uid)}
                    disabled={deleting === email.uid}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                    title="Delete"
                  >
                    {deleting === email.uid
                      ? <div className="w-3.5 h-3.5 border border-t-transparent rounded-full animate-spin border-red-400" />
                      : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                  {expanded === email.uid ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </div>
              </div>
              {expanded === email.uid && (
                <div className="px-5 pb-5 pt-1 ml-10">
                  <EmailBody uid={email.uid} authedPw={authedPw} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
