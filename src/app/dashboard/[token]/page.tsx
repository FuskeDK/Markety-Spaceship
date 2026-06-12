"use client";
/* eslint-disable */
// Client-facing dashboard — the only page clients see after onboarding.
// Auth: no traditional login session. Each client has a unique URL token
// (/dashboard/:token). First visit prompts them to "claim" the dashboard
// by setting a password; subsequent visits require that password.
// The token never changes; the password adds a second factor.
//
// All data comes from api/dashboard-api.ts (GET with ?token= param).
// Mutations (update-lead-status, set-deal-value, change-password, etc.)
// are POSTed to the same endpoint.
//
// Tab structure (all defined as local functions in this file):
//   OverviewTab    — lead list, stats cards, CSV export
//   AnalyticsTab   — monthly trend chart, source breakdown, day-of-week chart,
//                    ROI calculator (uses client.deal_value)
//   InvoicesTab    — invoice history, Stripe payment links
//   CampaignsTab   — active campaigns + campaign manager info
//   AccountTab     — change password
//   WebshopTab     — product catalogue + order management (if client has products)
//
// i18n: strings come from src/lib/translations.ts (English + Danish).
// The client's `language` field in Supabase determines which strings to use.
import { useEffect, useState, useRef, useCallback, type ComponentType } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import {
  Users, TrendingUp, Calendar, DollarSign, Mail, Phone, Lock, Eye, EyeOff,
  Download, Search, X, Copy, Check, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowUpDown,
  LayoutDashboard, BarChart3, Receipt, Megaphone, Settings,
  ArrowUp, ArrowDown, KeyRound, Headphones, Activity, CircleDot,
  Package, ShoppingBag, Plus, Pencil, Trash2, ImageIcon, AlertCircle, RefreshCw,
  type LucideProps,
} from "lucide-react";
import { t, getLocale } from "@/lib/translations";

type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
  message: string;
  createdAt: string;
  answered: boolean;
};

type Lead = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  source: string | null;
  created_at: string;
  price: number | null;
  lead_status: "new" | "contacted" | "converted" | "lost";
};

type Client = {
  name: string;
  company: string;
  email: string;
  price_per_lead: number;
  currency: string;
  created_at: string;
  claimed: boolean;
  language: string;
  deal_value: number | null;
};

type Invoice = {
  id: string;
  month_key: string;
  month_label: string;
  leads_count: number;
  amount: number;
  currency: string;
  stripe_link: string | null;
  sent_at: string;
  paid_at: string | null;
};

type DbProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  category_slug: string | null;
  in_stock: boolean;
  created_at: string;
};

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

type Order = {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
};

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

function isNew(iso: string) {
  return Date.now() - new Date(iso).getTime() < 24 * 60 * 60 * 1000;
}

function buildChartData(leads: Lead[], days: number, locale: string) {
  const dayMap: Record<string, number> = {};
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    dayMap[d.toLocaleDateString(locale, { day: "numeric", month: "short" })] = 0;
  }
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - (days - 1));
  cutoff.setHours(0, 0, 0, 0);
  for (const lead of leads) {
    const d = new Date(lead.created_at);
    if (d >= cutoff) {
      const key = d.toLocaleDateString(locale, { day: "numeric", month: "short" });
      if (key in dayMap) dayMap[key]++;
    }
  }
  return Object.entries(dayMap).map(([date, leads]) => ({ date, leads }));
}

function buildMonthlyData(leads: Lead[], locale: string) {
  const now = new Date();
  return Array.from({ length: 6 }, (_, i) => {
    const start = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const end = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 1);
    return {
      month: start.toLocaleDateString(locale, { month: "short", year: "2-digit" }),
      leads: leads.filter(l => { const d = new Date(l.created_at); return d >= start && d < end; }).length,
    };
  });
}

function buildSourceData(leads: Lead[]) {
  const counts: Record<string, number> = {};
  for (const l of leads) {
    const src = l.source ?? "website";
    counts[src] = (counts[src] ?? 0) + 1;
  }
  return Object.entries(counts).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);
}

function buildDayOfWeekData(leads: Lead[], locale: string) {
  // Jan 1–7 2024 = Mon–Sun
  const dayNames = Array.from({ length: 7 }, (_, i) =>
    new Date(2024, 0, 1 + i).toLocaleDateString(locale, { weekday: "short" })
  );
  const counts: Record<string, number> = Object.fromEntries(dayNames.map(d => [d, 0]));
  for (const l of leads) {
    counts[dayNames[(new Date(l.created_at).getDay() + 6) % 7]]++;
  }
  return dayNames.map(day => ({ day, leads: counts[day] }));
}

function exportCSV(leads: Lead[], company: string, lang: string, locale: string) {
  const rows = [
    [t(lang, "colDate"), t(lang, "colName"), t(lang, "colEmail"), t(lang, "colPhone"), t(lang, "colSource")],
    ...leads.map(l => [formatDate(l.created_at, locale), l.name ?? "", l.email ?? "", l.phone ?? "", l.source ?? "website"]),
  ];
  const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${company.replace(/\s+/g, "-")}-leads.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function CopyableText({ text, href, icon: Icon }: { text: string; href?: string; icon?: ComponentType<LucideProps> }) {
  const [copied, setCopied] = useState(false);
  const copy = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <span className="group inline-flex items-center gap-1.5">
      {href
        ? <a href={href} className="flex items-center gap-1.5 text-gray-500 hover:text-purple-600 transition-colors">{Icon && <Icon className="w-3 h-3" />}{text}</a>
        : <span className="text-gray-500">{text}</span>}
      <button onClick={copy} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-gray-500">
        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
      </button>
    </span>
  );
}

function SortHeader({ col, label, sort, onSort }: {
  col: "date" | "name"; label: string;
  sort: { col: string; dir: "asc" | "desc" }; onSort: (col: "date" | "name") => void;
}) {
  const active = sort.col === col;
  return (
    <button onClick={() => onSort(col)} className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-600 transition-colors group">
      {label}
      {active ? (sort.dir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
              : <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-40 transition-opacity" />}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, sub }: { icon: ComponentType<LucideProps>; label: string; value: string; sub?: string }) {
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

function InsightCard({ label, value, sub, trend }: {
  label: string; value: string; sub?: string; trend?: "up" | "down" | "neutral";
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <p className="text-xs text-gray-400 font-medium mb-2">{label}</p>
      <div className="flex items-end gap-1.5">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend === "up" && <ArrowUp className="w-4 h-4 text-green-500 mb-0.5" />}
        {trend === "down" && <ArrowDown className="w-4 h-4 text-red-400 mb-0.5" />}
      </div>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function formatRelativeTime(isoString: string) {
  const date = new Date(isoString);
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMin = Math.floor(diffMs / (1000 * 60));
      return diffMin <= 1 ? "Lige nu" : `${diffMin} min. siden`;
    }
    return `${diffHours} t. siden`;
  }
  if (diffDays === 1) return "I går";
  if (diffDays < 7) return `${diffDays} dage siden`;
  return date.toLocaleDateString("da-DK", { day: "numeric", month: "short", year: diffDays > 365 ? "numeric" : undefined });
}

function ContactCard({ c, isOpen, onToggle, reply, onReplyChange, onSend, sending, sent, sendError }: {
  c: Contact;
  isOpen: boolean;
  onToggle: () => void;
  reply: string;
  onReplyChange: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  sent: boolean;
  sendError: string | null;
}) {
  const isAnswered = c.answered || sent;
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-gray-50 transition-colors">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 mb-0.5">{c.name || "–"}</p>
          {c.message && <p className="text-xs text-gray-400 truncate">{c.message}</p>}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {c.createdAt && <span className="text-xs text-gray-300">{formatRelativeTime(c.createdAt)}</span>}
          {isAnswered && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
              <Check className="w-3 h-3" /> Besvaret
            </span>
          )}
          {isOpen ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
        </div>
      </button>

      {isOpen && (
        <div className="border-t border-gray-50 px-5 py-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            {c.email && (
              <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-xs text-purple-600 hover:underline">
                <Mail className="w-3 h-3" />{c.email}
              </a>
            )}
            {c.phone && (
              <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600">
                <Phone className="w-3 h-3" />{c.phone}
              </a>
            )}
          </div>

          {c.message && (
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3 leading-relaxed">
              "{c.message}"
            </p>
          )}

          {isAnswered ? (
            <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
              <Check className="w-4 h-4" /> Svar sendt
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <textarea
                className="w-full resize-none rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:border-transparent leading-relaxed overflow-hidden"
                style={{ "--tw-ring-color": "hsl(252 89% 58% / 0.25)" } as React.CSSProperties}
                placeholder="Skriv dit svar..."
                rows={3}
                value={reply}
                onChange={e => {
                  onReplyChange(e.target.value);
                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
              />
              {sendError && <p className="text-xs text-red-500">{sendError}</p>}
              <button
                onClick={onSend}
                disabled={sending || !reply.trim()}
                className="self-start h-9 px-4 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-40"
                style={{ background: "hsl(252 89% 58%)" }}>
                {sending ? "Sender..." : "Send svar"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BeskeederTab() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<Record<string, boolean>>({});
  const [sent, setSent] = useState<Record<string, boolean>>({});
  const [sendError, setSendError] = useState<Record<string, string | null>>({});

  useEffect(() => {
    fetch("/api/nordic-messages")
      .then(r => r.json())
      .then(d => { setContacts(d.contacts ?? []); setLoading(false); })
      .catch(() => { setFetchError("Kunne ikke hente beskeder."); setLoading(false); });
  }, []);

  async function sendReply(contact: Contact) {
    if (!replies[contact.id]?.trim()) return;
    setSending(s => ({ ...s, [contact.id]: true }));
    setSendError(e => ({ ...e, [contact.id]: null }));
    try {
      const res = await fetch("/api/nordic-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: contact.email, contactName: contact.name, replyMessage: replies[contact.id], recordId: contact.id }),
      });
      if (res.ok) {
        setSent(s => ({ ...s, [contact.id]: true }));
        setReplies(r => ({ ...r, [contact.id]: "" }));
      } else {
        setSendError(e => ({ ...e, [contact.id]: "Svar kunne ikke sendes." }));
      }
    } catch {
      setSendError(e => ({ ...e, [contact.id]: "Svar kunne ikke sendes." }));
    } finally {
      setSending(s => ({ ...s, [contact.id]: false }));
    }
  }

  if (loading) return <div className="flex items-center justify-center py-24 text-sm text-gray-400">Henter beskeder...</div>;
  if (fetchError) return <div className="flex items-center justify-center py-24 text-sm text-red-400">{fetchError}</div>;

  const unanswered = contacts.filter(c => !c.answered && !sent[c.id]);
  const answered   = contacts.filter(c => c.answered  ||  sent[c.id]);

  function cardProps(c: Contact, i: number) {
    return {
      c,
      isOpen: expanded === c.id,
      onToggle: () => setExpanded(expanded === c.id ? null : c.id),
      reply: replies[c.id] ?? "",
      onReplyChange: (v: string) => setReplies(r => ({ ...r, [c.id]: v })),
      onSend: () => sendReply(c),
      sending: sending[c.id] ?? false,
      sent: sent[c.id] ?? false,
      sendError: sendError[c.id] ?? null,
      key: c.id,
    };
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Beskeder</h1>
        <p className="text-sm text-gray-400">Henvendelser fra kontaktformularen på hjemmesiden.</p>
      </motion.div>

      {contacts.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl py-20 text-center text-sm text-gray-400">
          Ingen beskeder endnu.
        </div>
      ) : (
        <>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Ubesvarede · {unanswered.length}
            </p>
            {unanswered.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl py-8 text-center text-sm text-gray-300">
                Ingen ubesvarede beskeder.
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {unanswered.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                    <ContactCard {...cardProps(c, i)} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {answered.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Besvaret · {answered.length}
              </p>
              <div className="flex flex-col gap-2">
                {answered.map((c, i) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                    <ContactCard {...cardProps(c, i)} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"} value={value}
        onChange={e => onChange(e.target.value)} placeholder={placeholder ?? "Password"}
        className="w-full h-11 px-4 pr-11 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:border-transparent"
        style={{ "--tw-ring-color": "hsl(252 89% 58% / 0.3)" } as React.CSSProperties}
      />
      <button type="button" onClick={() => setShow(s => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}

function AuthCard({ company, children }: { company: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-100 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-50 flex items-center gap-3">
          <img src="/Markety.png" alt="Markety" className="h-6 w-auto" />
          <span className="text-sm text-gray-300">|</span>
          <span className="text-sm font-semibold text-gray-700">{company}</span>
        </div>
        <div className="px-8 py-8">{children}</div>
      </motion.div>
    </div>
  );
}

const SESSION_PREFIX = "markety_session_";

const Dashboard = () => {
  const params = useParams(); const token = params?.token as string;
  const [client, setClient] = useState<Client | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [tab, setTab] = useState<"overview" | "analytics" | "invoices" | "campaigns" | "account" | "beskeder" | "produkter" | "ordrer">("overview");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [hasNewBeskeder, setHasNewBeskeder] = useState(false);

  const [claimPassword, setClaimPassword] = useState("");
  const [claimConfirm, setClaimConfirm] = useState("");
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimLoading, setClaimLoading] = useState(false);

  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const lang = client?.language ?? "en";
  const locale = getLocale(lang);

  const fetchData = useCallback(async (silent = false) => {
    if (!token) return;
    if (!silent) setRefreshing(true);
    fetch(`/api/dashboard-api?token=${token}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setClient(data.client); setLeads(data.leads); setInvoices(data.invoices ?? []); setOrders(data.orders ?? []); })
      .catch(() => setError("Dashboard not found."))
      .finally(() => { if (!silent) setRefreshing(false); });
  }, [token]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) setSidebarCollapsed(true);
  }, []);

  useEffect(() => {
    if (!token) return;
    if (localStorage.getItem(`${SESSION_PREFIX}${token}`)) setAuthenticated(true);
    setLoading(true);
    fetch(`/api/dashboard-api?token=${token}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setClient(data.client); setLeads(data.leads); setInvoices(data.invoices ?? []); setOrders(data.orders ?? []); })
      .catch(() => setError("Dashboard not found."))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!authenticated) return;
    const id = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(id);
  }, [authenticated, fetchData]);

  useEffect(() => {
    if (!authenticated || !client?.company.toLowerCase().includes("nordic")) return;
    const lastSeen = parseInt(localStorage.getItem("markety_beskeder_seen_at") || "0");
    fetch("/api/nordic-messages")
      .then(r => r.json())
      .then(d => {
        const hasNew = (d.contacts ?? []).some(
          (c: { createdAt: string }) => new Date(c.createdAt).getTime() > lastSeen
        );
        setHasNewBeskeder(hasNew);
      })
      .catch(() => {});
  }, [authenticated, client?.company]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimError(null);
    if (claimPassword.length < 6) { setClaimError(t(lang, "claimErrorMin")); return; }
    if (claimPassword !== claimConfirm) { setClaimError(t(lang, "claimErrorMatch")); return; }
    setClaimLoading(true);
    const r = await fetch("/api/dashboard-api", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "claim", token, password: claimPassword }),
    });
    setClaimLoading(false);
    if (!r.ok) { const d = await r.json(); setClaimError(d.error ?? t(lang, "somethingWentWrong")); return; }
    localStorage.setItem(`${SESSION_PREFIX}${token}`, "1");
    setClient(c => c ? { ...c, claimed: true } : c);
    setAuthenticated(true);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);
    const r = await fetch("/api/dashboard-api", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", token, password: loginPassword }),
    });
    setLoginLoading(false);
    if (!r.ok) { setLoginError(t(lang, "loginError")); return; }
    localStorage.setItem(`${SESSION_PREFIX}${token}`, "1");
    setAuthenticated(true);
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
        style={{ borderColor: "hsl(252 89% 58%) transparent transparent transparent" }} />
    </div>
  );

  if (error || !client) return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-2xl font-bold text-gray-900">{t("en", "dashboardNotFound")}</p>
      <p className="text-gray-500 text-sm">{t("en", "dashboardNotFoundSub")}</p>
    </div>
  );

  if (!client.claimed) return (
    <AuthCard company={client.company}>
      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-5">
        <Lock className="w-5 h-5" style={{ color: "hsl(252 89% 58%)" }} />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Dashboard for {client.company}</h1>
      <p className="text-sm text-gray-400 mb-6">{t(lang, "claimSubtitle")}</p>
      <form onSubmit={handleClaim} className="flex flex-col gap-3">
        <PasswordInput value={claimPassword} onChange={setClaimPassword} placeholder={t(lang, "claimPassword")} />
        <PasswordInput value={claimConfirm} onChange={setClaimConfirm} placeholder={t(lang, "claimConfirm")} />
        {claimError && <p className="text-xs text-red-500">{claimError}</p>}
        <button type="submit" disabled={claimLoading}
          className="mt-1 h-11 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ background: "hsl(252 89% 58%)" }}>
          {claimLoading ? t(lang, "claimLoading") : t(lang, "claimButton")}
        </button>
      </form>
    </AuthCard>
  );

  if (!authenticated) return (
    <AuthCard company={client.company}>
      <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mb-5">
        <Lock className="w-5 h-5" style={{ color: "hsl(252 89% 58%)" }} />
      </div>
      <h1 className="text-xl font-bold text-gray-900 mb-1">Dashboard for {client.company}</h1>
      <p className="text-sm text-gray-400 mb-6">{t(lang, "loginSubtitle")}</p>
      <form onSubmit={handleLogin} className="flex flex-col gap-3">
        <PasswordInput value={loginPassword} onChange={setLoginPassword} placeholder={t(lang, "loginPassword")} />
        {loginError && <p className="text-xs text-red-500">{loginError}</p>}
        <button type="submit" disabled={loginLoading}
          className="mt-1 h-11 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
          style={{ background: "hsl(252 89% 58%)" }}>
          {loginLoading ? t(lang, "loginLoading") : t(lang, "loginButton")}
        </button>
      </form>
      <p className="text-xs text-gray-400 mt-4 text-center">
        {t(lang, "forgotPassword")} <a href="mailto:info@marketyleadgen.com" className="underline">info@marketyleadgen.com</a>
      </p>
    </AuthCard>
  );

  const isNordicSolfilm = client.company.toLowerCase().includes("nordic");
  const isMyTrendyPhone = client.company.toLowerCase().includes("mytrendyphone") || client.company.toLowerCase().includes("trendyphone");

  const TABS = [
    { id: "overview" as const, label: t(lang, "tabOverview"), icon: LayoutDashboard, blink: false },
    { id: "analytics" as const, label: t(lang, "tabAnalytics"), icon: BarChart3, blink: false },
    { id: "invoices" as const, label: t(lang, "tabInvoices"), icon: Receipt, blink: false },
    { id: "campaigns" as const, label: t(lang, "tabCampaigns"), icon: Megaphone, blink: false },
    ...(isNordicSolfilm ? [{ id: "beskeder" as const, label: "Beskeder", icon: Mail, blink: hasNewBeskeder }] : []),
    ...(isMyTrendyPhone ? [
      { id: "produkter" as const, label: "Produkter", icon: Package, blink: false },
      { id: "ordrer" as const, label: "Ordrer", icon: ShoppingBag, blink: false },
    ] : []),
    { id: "account" as const, label: t(lang, "tabAccount"), icon: Settings, blink: false },
  ];

  const handleTabClick = (id: typeof tab) => {
    if (id === "beskeder") {
      localStorage.setItem("markety_beskeder_seen_at", Date.now().toString());
      setHasNewBeskeder(false);
    }
    setTab(id);
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? "w-14" : "w-56"} bg-white border-r border-gray-100 flex flex-col shrink-0 transition-all duration-200`}>
        {/* Logo + company */}
        <div className={`h-16 flex items-center border-b border-gray-100 shrink-0 overflow-hidden ${sidebarCollapsed ? "justify-center px-0" : "gap-2.5 px-5 min-w-0"}`}>
          <img src="/markety-logo.png" alt="Markety" className="h-5 w-auto shrink-0" />
          {!sidebarCollapsed && <span className="text-xs text-gray-500 font-medium truncate">{client.company}</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {TABS.map(tb => (
            <button
              key={tb.id}
              onClick={() => handleTabClick(tb.id)}
              title={sidebarCollapsed ? tb.label : undefined}
              className={`w-full flex items-center rounded-lg text-sm font-medium transition-colors ${sidebarCollapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2.5 text-left"} ${
                tab === tb.id ? "text-purple-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
              }`}
              style={tab === tb.id ? { background: "hsl(252 89% 58% / 0.08)" } : {}}
            >
              <tb.icon className={`w-4 h-4 shrink-0 ${tab === tb.id ? "text-purple-600" : ""}`} />
              {!sidebarCollapsed && <span className="flex-1">{tb.label}</span>}
              {!sidebarCollapsed && tb.blink && tab !== tb.id && (
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-3 border-t border-gray-100 space-y-0.5 shrink-0">
          <button
            onClick={() => setSidebarCollapsed(c => !c)}
            className={`w-full flex items-center rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors ${sidebarCollapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2.5"}`}
            title={sidebarCollapsed ? "Expand" : "Collapse"}
          >
            {sidebarCollapsed ? <ChevronRight className="w-4 h-4 shrink-0" /> : <ChevronLeft className="w-4 h-4 shrink-0" />}
            {!sidebarCollapsed && <span className="flex-1">Collapse</span>}
          </button>
          <button
            onClick={() => fetchData()}
            disabled={refreshing}
            title={sidebarCollapsed ? t(lang, "refresh") : undefined}
            className={`w-full flex items-center rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors disabled:opacity-40 ${sidebarCollapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2.5"}`}
          >
            <RefreshCw className={`w-4 h-4 shrink-0 ${refreshing ? "animate-spin" : ""}`} />
            {!sidebarCollapsed && t(lang, "refresh")}
          </button>
          {!sidebarCollapsed && (
            <div className="px-3 py-2">
              <p className="text-xs text-gray-400 truncate">{t(lang, "clientSince", { date: formatDate(client.created_at, locale) })}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">
          {tab === "overview" && <OverviewTab leads={leads} client={client} lang={lang} locale={locale} token={token!}
            onLeadStatusUpdate={(id, status) => setLeads(prev => prev.map(l => l.id === id ? { ...l, lead_status: status } : l))} />}
          {tab === "analytics" && <AnalyticsTab leads={leads} lang={lang} locale={locale} />}
          {tab === "invoices" && <InvoicesTab leads={leads} client={client} invoices={invoices} lang={lang} locale={locale} />}
          {tab === "campaigns" && <CampaignsTab leads={leads} client={client} lang={lang} locale={locale} />}
          {tab === "beskeder" && <BeskeederTab />}
          {tab === "produkter" && <ProdukterTab token={token!} />}
          {tab === "ordrer" && <OrdrerTab orders={orders} token={token!} onOrderUpdated={(id, status) => setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o))} />}
          {tab === "account" && <AccountTab token={token!} client={client} lang={lang} locale={locale} />}
        </div>
        <p className="text-center text-xs text-gray-300 pb-8">
          Powered by <span translate="no">Markety</span> · info@marketyleadgen.com
        </p>
      </main>
    </div>
  );
};

function OverviewTab({ leads, client, lang, locale, token, onLeadStatusUpdate }: { leads: Lead[]; client: Client; lang: string; locale: string; token: string; onLeadStatusUpdate: (id: string, status: Lead["lead_status"]) => void }) {
  const [chartDays, setChartDays] = useState<7 | 30 | 90>(30);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<{ col: "date" | "name"; dir: "asc" | "desc" }>({ col: "date", dir: "desc" });
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);
  const [dealValue, setDealValue] = useState<string>(client.deal_value != null ? String(client.deal_value) : "");
  const [savingDeal, setSavingDeal] = useState(false);
  const [dealSaved, setDealSaved] = useState(false);

  const updateLeadStatus = async (leadId: string, status: Lead["lead_status"]) => {
    setUpdatingLeadId(leadId);
    onLeadStatusUpdate(leadId, status);
    await fetch("/api/dashboard-api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-lead-status", token, leadId, lead_status: status }),
    });
    setUpdatingLeadId(null);
  };

  const saveDealValue = async () => {
    setSavingDeal(true);
    await fetch("/api/dashboard-api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "set-deal-value", token, deal_value: dealValue === "" ? null : Number(dealValue) }),
    });
    setSavingDeal(false);
    setDealSaved(true);
    setTimeout(() => setDealSaved(false), 2000);
  };

  const statusLabels: Record<Lead["lead_status"], string> = { new: "New", contacted: "Contacted", converted: "Converted", lost: "Lost" };
  const statusColors: Record<Lead["lead_status"], string> = {
    new: "bg-blue-50 text-blue-700 border-blue-200",
    contacted: "bg-yellow-50 text-yellow-700 border-yellow-200",
    converted: "bg-green-50 text-green-700 border-green-200",
    lost: "bg-red-50 text-red-400 border-red-200",
  };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now); startOfWeek.setDate(now.getDate() - 6);
  const leadsThisMonth = leads.filter(l => new Date(l.created_at) >= startOfMonth).length;
  const leadsThisWeek = leads.filter(l => new Date(l.created_at) >= startOfWeek).length;
  const totalSpend = leads.reduce((acc, l) => acc + (l.price != null ? Number(l.price) : client.price_per_lead), 0);

  function toggleSort(col: "date" | "name") {
    setSort(prev => prev.col === col
      ? { col, dir: prev.dir === "asc" ? "desc" : "asc" }
      : { col, dir: col === "date" ? "desc" : "asc" });
  }

  const filtered = search
    ? leads.filter(l =>
        l.name?.toLowerCase().includes(search.toLowerCase()) ||
        l.email?.toLowerCase().includes(search.toLowerCase()) ||
        l.phone?.includes(search))
    : leads;

  const sorted = [...filtered].sort((a, b) => {
    if (sort.col === "date") {
      const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sort.dir === "desc" ? diff : -diff;
    }
    return sort.dir === "asc"
      ? (a.name ?? "").localeCompare(b.name ?? "")
      : (b.name ?? "").localeCompare(a.name ?? "");
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t(lang, "overviewTitle")}</h1>
        <p className="text-sm text-gray-400">{t(lang, "overviewSub", { company: client.company })}</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard icon={Users} label={t(lang, "totalLeads")} value={String(leads.length)} sub={t(lang, "allTime")} />
        <StatCard icon={Calendar} label={t(lang, "thisMonth")} value={String(leadsThisMonth)} />
        <StatCard icon={TrendingUp} label={t(lang, "thisWeek")} value={String(leadsThisWeek)} />
        <StatCard icon={DollarSign} label={t(lang, "totalInvested")} value={formatMoney(totalSpend, client.currency || "USD")}
          sub={t(lang, "perLead", { price: formatMoney(client.price_per_lead, client.currency || "USD") })} />
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm font-semibold text-gray-700">{t(lang, "leadsPerDay")}</p>
          <div className="flex gap-1">
            {([7, 30, 90] as const).map(d => (
              <button key={d} onClick={() => setChartDays(d)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  chartDays === d ? "text-white" : "text-gray-400 hover:text-gray-600 bg-gray-100"
                }`}
                style={chartDays === d ? { background: "hsl(252 89% 58%)" } : {}}>
                {d}d
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={buildChartData(leads, chartDays, locale)} barSize={chartDays <= 7 ? 20 : chartDays <= 30 ? 10 : 5}>
            <CartesianGrid vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false}
              interval={chartDays <= 7 ? 0 : "preserveStartEnd"} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "#f9fafb" }} />
            <Bar dataKey="leads" fill="hsl(252, 89%, 58%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* ROI Calculator */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
        className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <p className="text-sm font-semibold text-gray-700">ROI calculator</p>
            <p className="text-xs text-gray-400">Enter your average deal value to see your estimated return</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{client.currency}</span>
              <input type="number" value={dealValue} onChange={e => setDealValue(e.target.value)}
                placeholder="e.g. 5000"
                className="h-9 pl-12 pr-3 rounded-lg border border-gray-200 text-sm w-36 focus:outline-none focus:ring-2 focus:ring-purple-200 text-gray-800" />
            </div>
            <button onClick={saveDealValue} disabled={savingDeal}
              className="h-9 px-3 text-xs font-medium text-white rounded-lg disabled:opacity-60"
              style={{ background: dealSaved ? "#10b981" : "hsl(252 89% 58%)" }}>
              {dealSaved ? "Saved!" : savingDeal ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
        {dealValue && Number(dealValue) > 0 && leads.length > 0 && (() => {
          const dv = Number(dealValue);
          const converted = leads.filter(l => l.lead_status === "converted").length;
          const closeRate = leads.length > 0 ? converted / leads.length : 0.2;
          const estRevenue = leads.length * closeRate * dv;
          const totalCost = leads.reduce((s, l) => s + (l.price != null ? Number(l.price) : client.price_per_lead), 0);
          const roi = totalCost > 0 ? ((estRevenue - totalCost) / totalCost * 100) : 0;
          return (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
              <div><p className="text-xs text-gray-400 mb-0.5">Total leads</p><p className="text-lg font-bold text-gray-900">{leads.length}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Est. close rate</p><p className="text-lg font-bold text-gray-900">{converted > 0 ? `${Math.round(closeRate * 100)}%` : "20%"}<span className="text-xs text-gray-400 font-normal ml-1">{converted > 0 ? "from tracking" : "default"}</span></p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Est. revenue</p><p className="text-lg font-bold text-green-600">{formatMoney(estRevenue, client.currency)}</p></div>
              <div><p className="text-xs text-gray-400 mb-0.5">Est. ROI</p><p className={`text-lg font-bold ${roi >= 0 ? "text-green-600" : "text-red-500"}`}>{roi >= 0 ? "+" : ""}{Math.round(roi)}%</p></div>
            </div>
          );
        })()}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-gray-700 mr-auto">
            {t(lang, "allLeads")}{" "}
            {search && filtered.length !== leads.length &&
              <span className="text-xs text-gray-400 font-normal">({filtered.length} of {leads.length})</span>}
          </p>
          {leads.length > 0 && (
            <>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t(lang, "searchLeads")}
                  className="h-8 pl-8 pr-7 rounded-lg border border-gray-200 text-xs w-40 sm:w-48 focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-gray-300 text-gray-800" />
                {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"><X className="w-3 h-3" /></button>}
              </div>
              <button onClick={() => exportCSV(leads, client.company, lang, locale)}
                className="flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-3.5 h-3.5" /> {t(lang, "exportCsv")}
              </button>
            </>
          )}
        </div>
        {leads.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">{t(lang, "noLeadsYet")}</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-400">{t(lang, "noLeadsMatch", { search })}</div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-50">
              {sorted.map((lead, i) => (
                <motion.div key={lead.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: Math.min(i * 0.02, 0.4) }}
                  className="px-4 py-3 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-800">{lead.name ?? "–"}</p>
                    <span className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                      {formatDate(lead.created_at, locale)}
                      {isNew(lead.created_at) && <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    {lead.email && <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-purple-600"><Mail className="w-3 h-3 shrink-0" /><span className="truncate">{lead.email}</span></a>}
                    {lead.phone && <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-gray-400"><Phone className="w-3 h-3 shrink-0" />{lead.phone}</a>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    <span className="inline-block text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{lead.source ?? "website"}</span>
                    {(["new","contacted","converted","lost"] as Lead["lead_status"][]).map(s => (
                      <button key={s} onClick={() => updateLeadStatus(lead.id, s)} disabled={updatingLeadId === lead.id}
                        className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-all ${lead.lead_status === s ? statusColors[s] : "border-gray-200 text-gray-400 hover:border-gray-300"}`}>
                        {statusLabels[s]}
                      </button>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-6 py-3"><SortHeader col="date" label={t(lang, "colDate")} sort={sort} onSort={toggleSort} /></th>
                    <th className="text-left px-6 py-3"><SortHeader col="name" label={t(lang, "colName")} sort={sort} onSort={toggleSort} /></th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">{t(lang, "colEmail")}</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">{t(lang, "colPhone")}</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((lead, i) => (
                    <motion.tr key={lead.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.02, 0.4) }}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 text-gray-400 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          {formatDate(lead.created_at, locale)}
                          {isNew(lead.created_at) && <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-medium text-gray-800">{lead.name ?? "-"}</td>
                      <td className="px-6 py-3.5">{lead.email ? <CopyableText text={lead.email} href={`mailto:${lead.email}`} icon={Mail} /> : <span className="text-gray-400">-</span>}</td>
                      <td className="px-6 py-3.5">{lead.phone ? <CopyableText text={lead.phone} href={`tel:${lead.phone}`} icon={Phone} /> : <span className="text-gray-400">-</span>}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex gap-1 flex-wrap">
                          {(["new","contacted","converted","lost"] as Lead["lead_status"][]).map(s => (
                            <button key={s} onClick={() => updateLeadStatus(lead.id, s)} disabled={updatingLeadId === lead.id}
                              className={`text-xs px-2 py-0.5 rounded-full border font-medium transition-all ${lead.lead_status === s ? statusColors[s] : "border-gray-200 text-gray-400 hover:border-gray-300"}`}>
                              {statusLabels[s]}
                            </button>
                          ))}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

function AnalyticsTab({ leads, lang, locale }: { leads: Lead[]; lang: string; locale: string }) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thisMonthLeads = leads.filter(l => new Date(l.created_at) >= startOfMonth).length;
  const lastMonthLeads = leads.filter(l => { const d = new Date(l.created_at); return d >= startOfLastMonth && d < startOfMonth; }).length;
  const monthDiff = thisMonthLeads - lastMonthLeads;
  const avgPerDay30 = leads.filter(l => Date.now() - new Date(l.created_at).getTime() < 30 * 24 * 60 * 60 * 1000).length / 30;
  const dayData = buildDayOfWeekData(leads, locale);
  const bestDay = dayData.reduce((b, d) => d.leads > b.leads ? d : b, { day: "-", leads: 0 });
  const monthlyData = buildMonthlyData(leads, locale);
  const sourceData = buildSourceData(leads);

  if (leads.length === 0) return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t(lang, "analyticsTitle")}</h1>
        <p className="text-sm text-gray-400">{t(lang, "analyticsSub")}</p>
      </div>
      <div className="bg-white border border-gray-100 rounded-xl py-20 text-center text-sm text-gray-400">{t(lang, "analyticsEmpty")}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t(lang, "analyticsTitle")}</h1>
        <p className="text-sm text-gray-400">{t(lang, "analyticsSub")}</p>
      </motion.div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <InsightCard label={t(lang, "thisMonth")} value={String(thisMonthLeads)}
          sub={lastMonthLeads > 0 || thisMonthLeads > 0
            ? `${monthDiff >= 0 ? "+" : ""}${monthDiff} ${t(lang, "vsLastMonth")}`
            : t(lang, "firstMonth")}
          trend={monthDiff > 0 ? "up" : monthDiff < 0 ? "down" : "neutral"} />
        <InsightCard label={t(lang, "lastMonth")} value={String(lastMonthLeads)} sub={t(lang, "previousPeriod")} />
        <InsightCard label={t(lang, "avgPerDay")} value={avgPerDay30.toFixed(1)} sub={t(lang, "last30Days")} />
        <InsightCard label={t(lang, "bestDay")} value={bestDay.leads > 0 ? bestDay.day : "–"}
          sub={bestDay.leads > 0 ? t(lang, "leadsTotal", { n: String(bestDay.leads) }) : t(lang, "notEnoughData")} />
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
        <p className="text-sm font-semibold text-gray-700 mb-1">{t(lang, "monthlyTrend")}</p>
        <p className="text-xs text-gray-400 mb-5">{t(lang, "monthlyTrendSub")}</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} barSize={22}>
            <CartesianGrid vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "#f9fafb" }} />
            <Bar dataKey="leads" fill="hsl(252, 89%, 58%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
          <p className="text-sm font-semibold text-gray-700 mb-1">{t(lang, "bySource")}</p>
          <p className="text-xs text-gray-400 mb-5">{t(lang, "bySourceSub")}</p>
          <ResponsiveContainer width="100%" height={Math.max(sourceData.length * 44, 100)}>
            <BarChart data={sourceData} layout="vertical" barSize={16}>
              <CartesianGrid horizontal={false} stroke="#f3f4f6" />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <YAxis type="category" dataKey="source" tick={{ fontSize: 11, fill: "#6b7280" }} tickLine={false} axisLine={false} width={72} />
              <Tooltip contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="count" fill="hsl(252, 89%, 58%)" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white border border-gray-100 rounded-xl p-4 sm:p-6">
          <p className="text-sm font-semibold text-gray-700 mb-1">{t(lang, "byDayOfWeek")}</p>
          <p className="text-xs text-gray-400 mb-5">{t(lang, "byDayOfWeekSub")}</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dayData} barSize={22}>
              <CartesianGrid vertical={false} stroke="#f3f4f6" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "#f9fafb" }} />
              <Bar dataKey="leads" fill="#e9d5ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

function InvoicesTab({ invoices, client, lang, locale }: { leads: Lead[]; client: Client; invoices: Invoice[]; lang: string; locale: string }) {
  const totalBilled = invoices.reduce((acc, inv) => acc + Number(inv.amount), 0);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t(lang, "invoicesTitle")}</h1>
        <p className="text-sm text-gray-400">{t(lang, "invoicesSub")}</p>
      </motion.div>

      {invoices.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-xs text-gray-400 font-medium mb-1">{t(lang, "totalBilledAllTime")}</p>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(totalBilled, client.currency || "USD")}</p>
            <p className="text-xs text-gray-400 mt-1">
              {invoices.length !== 1
                ? t(lang, "invoiceCountPlural", { n: String(invoices.length) })
                : t(lang, "invoiceCount", { n: String(invoices.length) })}
            </p>
          </div>
          <div className="bg-white border border-gray-100 rounded-xl p-5">
            <p className="text-xs text-gray-400 font-medium mb-1">{t(lang, "latestInvoice")}</p>
            <p className="text-2xl font-bold text-gray-900">{formatMoney(Number(invoices[0].amount), invoices[0].currency)}</p>
            <p className="text-xs text-gray-400 mt-1">{invoices[0].month_label}</p>
          </div>
        </div>
      )}

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <p className="text-sm font-semibold text-gray-700">{t(lang, "invoiceHistory")}</p>
        </div>
        {invoices.length === 0 ? (
          <div className="px-6 py-16 text-center text-sm text-gray-400">{t(lang, "noInvoicesYet")}</div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-gray-50">
              {invoices.map(inv => (
                <div key={inv.id} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">{inv.month_label}</p>
                    <p className="text-xs text-gray-400">{inv.leads_count} leads · {formatMoney(Number(inv.amount), inv.currency)}</p>
                  </div>
                  <div className="shrink-0">
                    {inv.paid_at ? (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full font-semibold">✓ {t(lang, "invoicePaidBadge")}</span>
                    ) : inv.stripe_link ? (
                      <a href={inv.stripe_link} target="_blank" rel="noreferrer"
                        className="inline-flex items-center text-xs font-semibold text-white px-3 py-1.5 rounded-full"
                        style={{ background: "hsl(252 89% 58%)" }}>{t(lang, "payNow")}</a>
                    ) : (
                      <span className="inline-flex text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full font-medium">{t(lang, "invoiceSentBadge")}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400">{t(lang, "colPeriod")}</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400">{t(lang, "colLeads")}</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400">{t(lang, "colAmount")}</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-400">{t(lang, "colPay")}</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(inv => (
                    <tr key={inv.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3.5 font-medium text-gray-800">{inv.month_label}</td>
                      <td className="px-6 py-3.5 text-right text-gray-600">{inv.leads_count}</td>
                      <td className="px-6 py-3.5 text-right font-semibold text-gray-900">{formatMoney(Number(inv.amount), inv.currency)}</td>
                      <td className="px-6 py-3.5 text-right">
                        {inv.paid_at ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold">✓ {t(lang, "invoicePaidBadge")}</span>
                        ) : inv.stripe_link ? (
                          <a href={inv.stripe_link} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-medium text-white px-3 py-1 rounded-full"
                            style={{ background: "hsl(252 89% 58%)" }}>{t(lang, "payNow")}</a>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full font-medium">{t(lang, "invoiceSentBadge")}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </motion.div>

      <p className="text-xs text-gray-400 text-center">
        {t(lang, "invoiceQuestion")}{" "}
        <a href="mailto:info@marketyleadgen.com" className="text-purple-600 hover:underline">{t(lang, "contactUs")}</a>
      </p>
    </div>
  );
}

function CampaignsTab({ leads, client, lang, locale }: { leads: Lead[]; client: Client; lang: string; locale: string }) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const leadsThisMonth = leads.filter(l => new Date(l.created_at) >= startOfMonth).length;
  const leadsLastMonth = leads.filter(l => { const d = new Date(l.created_at); return d >= startOfLastMonth && d < startOfMonth; }).length;
  const lastLead = leads[0] ? new Date(leads[0].created_at) : null;
  const daysSinceLastLead = lastLead ? Math.floor((Date.now() - lastLead.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const isActive = daysSinceLastLead !== null && daysSinceLastLead < 30;
  const sources = [...new Set(leads.map(l => l.source ?? "website"))];

  const pacing = leadsLastMonth > 0
    ? Math.round((leadsThisMonth / leadsLastMonth) * 100)
    : null;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t(lang, "campaignsTitle")}</h1>
        <p className="text-sm text-gray-400">{t(lang, "campaignsSub")}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-base font-bold text-gray-900">{t(lang, "campaignName")}</p>
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${isActive ? "text-green-700 bg-green-50" : "text-gray-500 bg-gray-100"}`}>
                <CircleDot className="w-2.5 h-2.5" />{isActive ? t(lang, "campaignActive") : t(lang, "campaignInactive")}
              </span>
            </div>
            <p className="text-sm text-gray-400">{t(lang, "campaignManagedBy", { company: client.company })}</p>
          </div>
          <Activity className="w-5 h-5 text-gray-300 shrink-0 mt-0.5" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{t(lang, "leadsThisMonth")}</p>
            <p className="text-xl font-bold text-gray-900">{leadsThisMonth}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{t(lang, "lastMonth")}</p>
            <p className="text-xl font-bold text-gray-900">{leadsLastMonth}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{t(lang, "pacingVsLast")}</p>
            <p className={`text-xl font-bold ${pacing === null ? "text-gray-400" : pacing >= 100 ? "text-green-600" : pacing >= 75 ? "text-amber-500" : "text-red-500"}`}>
              {pacing === null ? "–" : `${pacing}%`}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">{t(lang, "lastLead")}</p>
            <p className="text-sm font-semibold text-gray-800">
              {lastLead
                ? daysSinceLastLead === 0 ? t(lang, "today")
                : daysSinceLastLead === 1 ? t(lang, "yesterday")
                : t(lang, "daysAgo", { n: String(daysSinceLastLead) })
                : "–"}
            </p>
          </div>
        </div>

        {sources.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2">{t(lang, "activeChannels")}</p>
            <div className="flex flex-wrap gap-2">
              {sources.map(src => (
                <span key={src} className="inline-flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full capitalize">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                  {src}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white border border-gray-100 rounded-xl p-6">
        <p className="text-sm font-semibold text-gray-900 mb-1">{t(lang, "perfHistory")}</p>
        <p className="text-xs text-gray-400 mb-5">{t(lang, "perfHistorySub")}</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={buildMonthlyData(leads, locale)} barSize={22}>
            <CartesianGrid vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={{ border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12 }} cursor={{ fill: "#f9fafb" }} />
            <Bar dataKey="leads" fill="hsl(252, 89%, 58%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white border border-gray-100 rounded-xl p-6">
        <p className="text-sm font-semibold text-gray-900 mb-3">{t(lang, "campaignManager")}</p>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">{t(lang, "campaignManagerText")}</p>
        <a href="mailto:info@marketyleadgen.com"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <Mail className="w-3.5 h-3.5" /> {t(lang, "getInTouch")}
        </a>
      </motion.div>
    </div>
  );
}

function AccountTab({ token, client, lang, locale }: { token: string; client: Client; lang: string; locale: string }) {
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (newPw.length < 6) { setPwError(t(lang, "pwErrorMin")); return; }
    if (newPw !== confirmPw) { setPwError(t(lang, "pwErrorMatch")); return; }
    setPwLoading(true);
    const r = await fetch("/api/dashboard-api", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "change-password", token, currentPassword: currentPw, newPassword: newPw }),
    });
    setPwLoading(false);
    if (!r.ok) { const d = await r.json(); setPwError(d.error ?? t(lang, "somethingWentWrong")); return; }
    setPwSuccess(true);
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setTimeout(() => setPwSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t(lang, "accountTitle")}</h1>
        <p className="text-sm text-gray-400">{t(lang, "accountSub")}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="bg-white border border-gray-100 rounded-xl p-6">
        <p className="text-sm font-semibold text-gray-900 mb-4">{t(lang, "yourPlan")}</p>
        <div className="grid grid-cols-2 gap-4">
          <div><p className="text-xs text-gray-400 mb-0.5">{t(lang, "labelCompany")}</p><p className="text-sm font-semibold text-gray-800">{client.company}</p></div>
          <div><p className="text-xs text-gray-400 mb-0.5">{t(lang, "labelContact")}</p><p className="text-sm font-semibold text-gray-800">{client.name}</p></div>
          <div><p className="text-xs text-gray-400 mb-0.5">{t(lang, "labelPricePerLead")}</p><p className="text-sm font-semibold text-gray-800">{formatMoney(client.price_per_lead, client.currency || "USD")}</p></div>
          <div><p className="text-xs text-gray-400 mb-0.5">{t(lang, "labelClientSince")}</p><p className="text-sm font-semibold text-gray-800">{formatDate(client.created_at, locale)}</p></div>
          <div><p className="text-xs text-gray-400 mb-0.5">{t(lang, "colEmail")}</p><p className="text-sm font-semibold text-gray-800 truncate">{client.email}</p></div>
          <div><p className="text-xs text-gray-400 mb-0.5">{t(lang, "labelCurrency")}</p><p className="text-sm font-semibold text-gray-800">{client.currency || "USD"}</p></div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-900">{t(lang, "changePassword")}</p>
        </div>
        {pwSuccess && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-4 py-3 mb-4">
            <Check className="w-4 h-4 shrink-0" /> {t(lang, "pwUpdated")}
          </div>
        )}
        <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
          <PasswordInput value={currentPw} onChange={setCurrentPw} placeholder={t(lang, "currentPassword")} />
          <PasswordInput value={newPw} onChange={setNewPw} placeholder={t(lang, "newPassword")} />
          <PasswordInput value={confirmPw} onChange={setConfirmPw} placeholder={t(lang, "confirmNewPassword")} />
          {pwError && <p className="text-xs text-red-500">{pwError}</p>}
          <button type="submit" disabled={pwLoading}
            className="mt-1 h-10 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60 w-full sm:w-auto sm:px-6"
            style={{ background: "hsl(252 89% 58%)" }}>
            {pwLoading ? t(lang, "updating") : t(lang, "updatePassword")}
          </button>
        </form>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bg-white border border-gray-100 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-3">
          <Headphones className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-semibold text-gray-900">{t(lang, "needHelp")}</p>
        </div>
        <p className="text-sm text-gray-500 mb-4 leading-relaxed">{t(lang, "needHelpText")}</p>
        <a href="mailto:info@marketyleadgen.com"
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
          <Mail className="w-3.5 h-3.5" /> info@marketyleadgen.com
        </a>
      </motion.div>
    </div>
  );
}

// ── ProdukterTab ──────────────────────────────────────────────────────────────

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  image: string;
  categorySlug: string;
  inStock: boolean;
};

const emptyForm: ProductFormState = { name: "", description: "", price: "", image: "", categorySlug: "", inStock: true };

function ProdukterTab({ token }: { token: string }) {
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: false } | { open: true; editing: DbProduct | null }>({ open: false });
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/dashboard-api?token=${token}&resource=products`)
      .then(r => r.json())
      .then(d => { setProducts(d.products ?? []); setLoading(false); })
      .catch(() => { setError("Kunne ikke hente produkter."); setLoading(false); });
  }, [token]);

  function openAdd() {
    setForm(emptyForm);
    setSaveError(null);
    setModal({ open: true, editing: null });
    setTimeout(() => nameRef.current?.focus(), 50);
  }

  function openEdit(p: DbProduct) {
    setForm({ name: p.name, description: p.description ?? "", price: String(p.price), image: p.image ?? "", categorySlug: p.category_slug ?? "", inStock: p.in_stock });
    setSaveError(null);
    setModal({ open: true, editing: p });
    setTimeout(() => nameRef.current?.focus(), 50);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.price) { setSaveError("Navn og pris er påkrævet."); return; }
    setSaving(true);
    setSaveError(null);
    const isEditing = modal.open && modal.editing;
    const body = isEditing
      ? { action: "update-product", token, id: modal.editing!.id, name: form.name.trim(), description: form.description || null, price: parseFloat(form.price), image: form.image || null, categorySlug: form.categorySlug || null, inStock: form.inStock }
      : { action: "add-product", token, name: form.name.trim(), description: form.description || null, price: parseFloat(form.price), image: form.image || null, categorySlug: form.categorySlug || null };
    const r = await fetch("/api/dashboard-api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (!r.ok) { setSaveError("Noget gik galt. Prøv igen."); return; }
    const d = await r.json();
    if (isEditing) {
      setProducts(prev => prev.map(p => p.id === modal.editing!.id ? { ...p, name: form.name.trim(), description: form.description || null, price: parseFloat(form.price), image: form.image || null, category_slug: form.categorySlug || null, in_stock: form.inStock } : p));
    } else {
      setProducts(prev => [d.product, ...prev]);
    }
    setModal({ open: false });
  }

  async function handleDelete(id: string) {
    const r = await fetch("/api/dashboard-api", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "delete-product", token, id }) });
    if (r.ok) { setProducts(prev => prev.filter(p => p.id !== id)); setDeleteConfirm(null); }
  }

  if (loading) return <div className="flex items-center justify-center py-24 text-sm text-gray-400">Henter produkter...</div>;
  if (error) return <div className="flex items-center justify-center py-24 text-sm text-red-400">{error}</div>;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Produkter</h1>
          <p className="text-sm text-gray-400">Administrer dit produktkatalog - {products.length} produkter i alt</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold text-white"
          style={{ background: "hsl(252 89% 58%)" }}>
          <Plus className="w-4 h-4" /> Tilføj produkt
        </button>
      </motion.div>

      {products.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl py-20 text-center">
          <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Ingen produkter endnu. Tilføj dit første produkt.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}
              className="bg-white border border-gray-100 rounded-xl overflow-hidden group">
              <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-10 h-10 text-gray-200" /></div>
                )}
                {!p.in_stock && (
                  <span className="absolute top-2 right-2 text-xs bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">Udsolgt</span>
                )}
              </div>
              <div className="p-4">
                {p.category_slug && <p className="text-[11px] text-gray-400 uppercase tracking-wide font-medium mb-1">{p.category_slug}</p>}
                <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-2 line-clamp-2">{p.name}</h3>
                {p.description && <p className="text-xs text-gray-400 mb-3 line-clamp-2">{p.description}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900">{Number(p.price).toFixed(2)} kr</span>
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(p)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteConfirm(p.id)}
                      className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setModal({ open: false })}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 z-10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">{modal.editing ? "Rediger produkt" : "Tilføj produkt"}</h2>
              <button onClick={() => setModal({ open: false })} className="text-gray-300 hover:text-gray-500 transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Navn *</label>
                <input ref={nameRef} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  placeholder="Fx Spigen Ultra Hybrid Case" className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Beskrivelse</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2}
                  placeholder="Kort produktbeskrivelse..." className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Pris (kr) *</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required
                    placeholder="199.00" className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Kategori</label>
                  <select value={form.categorySlug} onChange={e => setForm(f => ({ ...f, categorySlug: e.target.value }))}
                    className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white">
                    <option value="">Vælg kategori</option>
                    <option value="phone-cases">Mobilcovers</option>
                    <option value="screen-protectors">Skærmskånere</option>
                    <option value="chargers-cables">Opladere og kabler</option>
                    <option value="wireless-charging">Trådløs opladning</option>
                    <option value="headphones-earbuds">Hovedtelefoner og earbuds</option>
                    <option value="power-banks">Powerbanks</option>
                    <option value="mounts-stands">Holdere og stativer</option>
                    <option value="tablet-cases">Tabletcovers</option>
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Billed URL</label>
                <input type="url" value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  placeholder="https://images.unsplash.com/..." className="h-10 px-3 rounded-lg border border-gray-200 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-200" />
              </div>
              {modal.editing && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className={`relative w-10 h-6 rounded-full transition-colors ${form.inStock ? "bg-purple-600" : "bg-gray-200"}`}
                    style={form.inStock ? { background: "hsl(252 89% 58%)" } : {}}
                    onClick={() => setForm(f => ({ ...f, inStock: !f.inStock }))}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.inStock ? "translate-x-5" : "translate-x-1"}`} />
                  </div>
                  <span className="text-sm text-gray-700">På lager</span>
                </label>
              )}
              {saveError && <p className="flex items-center gap-1.5 text-xs text-red-500"><AlertCircle className="w-3.5 h-3.5" />{saveError}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModal({ open: false })}
                  className="flex-1 h-10 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  Annuller
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 h-10 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                  style={{ background: "hsl(252 89% 58%)" }}>
                  {saving ? "Gemmer..." : modal.editing ? "Gem ændringer" : "Tilføj produkt"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" onClick={() => setDeleteConfirm(null)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 z-10 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-2">Slet produkt?</h3>
            <p className="text-sm text-gray-400 mb-5">Denne handling kan ikke fortrydes.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 h-10 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Annuller</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 h-10 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors">Slet</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ── OrdrerTab ─────────────────────────────────────────────────────────────────

function OrdrerTab({ orders, token, onOrderUpdated }: {
  orders: Order[];
  token: string;
  onOrderUpdated: (id: string, status: string) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  async function markHandled(id: string) {
    setUpdating(id);
    const r = await fetch("/api/dashboard-api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-order", token, id, status: "handled" }),
    });
    setUpdating(null);
    if (r.ok) onOrderUpdated(id, "handled");
  }

  const pending = orders.filter(o => o.status === "pending");
  const handled = orders.filter(o => o.status !== "pending");

  function OrderCard({ o }: { o: Order }) {
    const isOpen = expanded === o.id;
    const isHandled = o.status !== "pending";
    return (
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <button onClick={() => setExpanded(isOpen ? null : o.id)}
          className="w-full px-4 sm:px-5 py-4 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-semibold text-gray-900">{o.customer_name || "–"}</p>
              {isHandled
                ? <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium"><Check className="w-3 h-3" />Behandlet</span>
                : <span className="inline-flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full font-medium"><CircleDot className="w-3 h-3" />Afventer</span>}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{o.customer_address || "Ingen adresse"}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{Number(o.total).toFixed(2)} kr</p>
              <p className="text-xs text-gray-300">{formatRelativeTime(o.created_at)}</p>
            </div>
            {isOpen ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
          </div>
        </button>
        {isOpen && (
          <div className="border-t border-gray-50 px-5 py-4 space-y-4">
            <div className="flex flex-wrap gap-4 text-xs text-gray-500">
              {o.customer_email && <a href={`mailto:${o.customer_email}`} className="flex items-center gap-1 text-purple-600 hover:underline"><Mail className="w-3 h-3" />{o.customer_email}</a>}
              {o.customer_phone && <a href={`tel:${o.customer_phone}`} className="flex items-center gap-1 hover:text-gray-700"><Phone className="w-3 h-3" />{o.customer_phone}</a>}
              {o.customer_address && <span>{o.customer_address}</span>}
            </div>
            {o.items.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Produkter</p>
                {o.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    {item.image && <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-50 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.quantity} stk × {Number(item.price).toFixed(2)} kr</p>
                    </div>
                    <span className="text-sm font-bold text-gray-900 shrink-0">{(item.quantity * item.price).toFixed(2)} kr</span>
                  </div>
                ))}
                <div className="flex justify-between pt-2 border-t border-gray-100 text-sm font-bold text-gray-900">
                  <span>Total</span><span>{Number(o.total).toFixed(2)} kr</span>
                </div>
              </div>
            )}
            {!isHandled && (
              <button onClick={() => markHandled(o.id)} disabled={updating === o.id}
                className="flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-semibold text-white transition-opacity disabled:opacity-60"
                style={{ background: "hsl(252 89% 58%)" }}>
                <Check className="w-4 h-4" />
                {updating === o.id ? "Opdaterer..." : "Marker som behandlet"}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Ordrer</h1>
        <p className="text-sm text-gray-400">Webshop-ordrer fra kunder. {pending.length} afventer behandling.</p>
      </motion.div>

      {orders.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl py-20 text-center">
          <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Ingen ordrer endnu.</p>
        </div>
      ) : (
        <>
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Afventer · {pending.length}</p>
            {pending.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-xl py-8 text-center text-sm text-gray-300">Ingen afventende ordrer.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {pending.map((o, i) => (
                  <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                    <OrderCard o={o} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          {handled.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Behandlet · {handled.length}</p>
              <div className="flex flex-col gap-2">
                {handled.map((o, i) => (
                  <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                    <OrderCard o={o} />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
