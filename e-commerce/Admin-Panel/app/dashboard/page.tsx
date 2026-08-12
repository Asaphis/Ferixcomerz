"use client";
import AdminShell from "@/components/admin/admin-shell";
// Lazy-loaded — recharts is ~180 KB, defer until after shell paint
import dynamic from "next/dynamic";
import type * as RechartsTypes from "recharts";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Recharts = dynamic(() => import("recharts") as any, { ssr: false });
const _rc = typeof window !== "undefined" ? require("recharts") : {};
const AreaChart: typeof RechartsTypes.AreaChart = _rc.AreaChart;
const Area: typeof RechartsTypes.Area = _rc.Area;
const XAxis: typeof RechartsTypes.XAxis = _rc.XAxis;
const YAxis: typeof RechartsTypes.YAxis = _rc.YAxis;
const CartesianGrid: typeof RechartsTypes.CartesianGrid = _rc.CartesianGrid;
const Tooltip: typeof RechartsTypes.Tooltip = _rc.Tooltip;
const ResponsiveContainer: typeof RechartsTypes.ResponsiveContainer = _rc.ResponsiveContainer;
const PieChart: typeof RechartsTypes.PieChart = _rc.PieChart;
const Pie: typeof RechartsTypes.Pie = _rc.Pie;
const Cell: typeof RechartsTypes.Cell = _rc.Cell;
import {
  TrendingUp, TrendingDown, ShoppingCart, DollarSign, Package,
  CreditCard, FileText, UserPlus, BarChart2, Settings, Wallet,
  ArrowUpRight, ArrowDownRight, Clock, Award
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRecentOrders, getTopProducts, getRecentCustomers, getReportsSummary } from "@/lib/api";

const quickActions = [
  { label: "New Invoice",  Icon: FileText,    color: "var(--brand-blue-bright)", href: "/invoicing"       },
  { label: "New Estimate", Icon: FileText,    color: "var(--brand-green-deep)",  href: "/invoicing"       },
  { label: "New Payment",  Icon: CreditCard,  color: "var(--brand-gold-bright)", href: "/wallet-payments" },
  { label: "Add Product",  Icon: Package,     color: "var(--brand-gold-dark)",   href: "/products"        },
  { label: "New Purchase", Icon: ShoppingCart,color: "var(--brand-blue-dark)",   href: "/orders"          },
  { label: "New Customer", Icon: UserPlus,    color: "var(--brand-green-bright)",href: "/users"           },
  { label: "View Reports", Icon: BarChart2,   color: "var(--brand-blue-medium)", href: "/reports"         },
  { label: "Settings",     Icon: Settings,    color: "var(--text-muted)",        href: "/settings"        },
];

function shortRef(prefix: string, value?: string | null) {
  const clean = value?.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!clean) return `${prefix}-UNKNOWN`;
  return `${prefix}-${clean.slice(-6)}`;
}

function formatOrderRef(orderNumber?: string | null, fallbackId?: string | null) {
  if (orderNumber?.trim()) return `#${orderNumber.trim()}`;
  return `#${shortRef("ORD", fallbackId)}`;
}

function formatActivityOrderRef(id?: string | null) {
  if (!id?.trim()) return "Transaction";
  return `Order ${shortRef("ORD", id)}`;
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || "";
  const map: Record<string, { bg: string; color: string; label: string }> = {
    completed: { bg: "rgba(20, 113, 21, 0.1)",  color: "var(--brand-green-deep)", label: "Completed" },
    delivered: { bg: "rgba(20, 113, 21, 0.1)",  color: "var(--brand-green-deep)", label: "Delivered" },
    processing:{ bg: "rgba(2, 145, 192, 0.1)",  color: "var(--brand-blue-bright)", label: "Processing" },
    pending:   { bg: "rgba(214, 155, 4, 0.1)",  color: "var(--brand-gold-bright)", label: "Pending" },
    cancelled: { bg: "rgba(147, 95, 4, 0.1)",   color: "var(--brand-gold-dark)", label: "Cancelled" },
    paid:      { bg: "rgba(20, 113, 21, 0.1)",  color: "var(--brand-green-deep)", label: "Paid" },
  };
  const style = map[s] || { bg: "rgba(127, 109, 103, 0.1)", color: "var(--text-muted)", label: status };
  return (
    <span style={{
      background: style.bg, color: style.color, fontSize: "11px", fontWeight: 700,
      padding: "4px 10px", borderRadius: "20px", whiteSpace: "nowrap", border: `1px solid ${style.bg}`
    }}>
      {style.label}
    </span>
  );
}

function ActivityIcon({ color }: { color: string }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
      background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center",
      border: `1.5px solid ${color}20`
    }}>
      <ShoppingCart size={15} color={color} />
    </div>
  );
}

interface Order {
  id: string; orderNumber?: string; status: string; paymentStatus?: string;
  total: string; createdAt: string;
  user?: { firstName?: string; lastName?: string; email?: string } | null;
}
interface Product {
  id: string; name: string; price: number; salePrice?: number;
  _count?: { orderItems?: number };
}
interface Customer {
  id: string; firstName?: string; lastName?: string; email: string; createdAt: string;
}

function DashboardContent() {
  const router = useRouter();
  const card      = "var(--card)";
  const border    = "var(--border)";
  const textMain  = "var(--text-main)";
  const textMuted = "var(--text-muted)";
  const textSec   = "var(--text-secondary)";
  const surface   = "var(--surface)";
  const gridLine  = "var(--border)";

  const [orders, setOrders]       = useState<Order[]>([]);
  const [products, setProducts]   = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [report, setReport]       = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [availableMonths, setAvailableMonths] = useState<Array<{ value: string; label: string }>>([]);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  useEffect(() => {
    setIsDashboardLoading(true);
    Promise.allSettled([
      getRecentOrders(5),
      getTopProducts(5),
      getRecentCustomers(5),
      getReportsSummary("month", selectedMonth),
    ]).then(([ordersRes, productsRes, customersRes, reportRes]) => {
      if (ordersRes.status === "fulfilled") {
        const data = ordersRes.value.data?.data || ordersRes.value.data || [];
        const meta = ordersRes.value.data?.meta || {};
        setOrders(Array.isArray(data) ? data.slice(0, 5) : []);
        if (meta.total !== undefined) setTotalOrders(meta.total);
      }
      if (productsRes.status === "fulfilled") {
        const data = productsRes.value.data?.data || productsRes.value.data || [];
        setProducts(Array.isArray(data) ? data.slice(0, 5) : []);
      }
      if (customersRes.status === "fulfilled") {
        const data = customersRes.value.data?.data || customersRes.value.data || [];
        setCustomers(Array.isArray(data) ? data.slice(0, 5) : []);
      }
      if (reportRes.status === "fulfilled") {
        const d = reportRes.value.data;
        setReport(d);
        setAvailableMonths(Array.isArray(d?.availableMonths) ? d.availableMonths : []);
        if (d?.stats?.totalOrders !== undefined) setTotalOrders(d.stats.totalOrders);
      }
    }).finally(() => setIsDashboardLoading(false));
  }, [selectedMonth]);

  const cardStyle = (extra?: React.CSSProperties): React.CSSProperties => ({
    background: card,
    border: `1px solid ${border}`,
    borderRadius: 16,
    overflow: "hidden",
    minWidth: 0,
    boxShadow: "0 10px 30px rgba(76, 59, 53, 0.04)",
    ...extra,
  });

  const fmt = (n: number) =>
    `$${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalRevenue     = report?.stats?.totalRevenue    ?? 0;
  const totalOrdersCount = report?.stats?.totalOrders     ?? totalOrders;
  const totalUsersCount  = report?.stats?.newCustomers    ?? 0;
  const creditDisbursed  = report?.stats?.creditDisbursed ?? 0;
  const totalOutstanding = report?.credit?.totalOutstanding ?? 0;
  const selectedLabel = report?.selectedLabel || "This Month";

  const CHART_COLORS = [
    "var(--brand-blue-bright)",
    "var(--brand-gold-bright)",
    "var(--brand-green-bright)",
    "var(--brand-blue-dark)",
    "var(--brand-gold-dark)",
    "var(--brand-green-deep)"
  ];

  // Area chart monthly series from reports
  const salesData: Array<{ date: string; sales: number; customers: number }> = report?.revenueSeries?.length > 0
    ? report.revenueSeries.map((s: any) => ({ date: String(s.label), sales: Number(s.revenue || 0), customers: Number(s.customers || 0) }))
    : [{ date: "Jan", sales: 0 }, { date: "Feb", sales: 0 }, { date: "Mar", sales: 0 },
       { date: "Apr", sales: 0 }, { date: "May", sales: 0 }, { date: "Jun", sales: 0 }].map((item) => ({ ...item, customers: 0 }));

  // Pie chart sales by category
  const channelData: Array<{ name: string; value: number; amount: number; color: string }> = report?.salesByCategory?.length > 0
    ? report.salesByCategory.slice(0, 5).map((cat: any, i: number) => ({
        name: cat.name, value: Number(cat.value || 0), amount: 0, color: CHART_COLORS[i % CHART_COLORS.length],
      }))
    : [{ name: "No sales recorded yet", value: 100, amount: 0, color: "var(--text-muted)" }];

  // Activity feed recent transactions
  const activities: Array<{ text: string; time: string; color: string; icon: string }> = report?.recentTransactions?.length > 0
    ? report.recentTransactions.slice(0, 5).map((tx: any) => ({
        text: `${formatActivityOrderRef(tx.id)}  ·  ${tx.customer || "Customer"}  ·  ${fmt(tx.amount)}`,
        time: tx.date ? new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
        color: (tx.status === "paid" || tx.status === "delivered") ? "var(--brand-green-deep)" : tx.status === "pending" ? "var(--brand-gold-bright)" : "var(--brand-blue-bright)",
        icon: "ShoppingBag",
      }))
    : orders.slice(0, 5).map((o, i) => ({
        text: `${formatOrderRef(o.orderNumber, o.id)}  ·  ${
          o.user ? `${o.user.firstName || ""} ${o.user.lastName || ""}`.trim() || o.user.email || "Customer" : "Customer"
        }  ·  ${fmt(parseFloat(o.total || "0"))}`,
        time: new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        color: CHART_COLORS[i % CHART_COLORS.length],
        icon: "ShoppingBag",
      }));

  // Top products
  const displayProducts: Product[] = report?.topProducts?.length > 0
    ? report.topProducts.map((p: any) => ({
        id: p.name,
        name: p.name,
        price: p.sales > 0 ? p.revenue / p.sales : 0,
        _count: { orderItems: p.sales },
      }))
    : products;

  // KPI metadata with dynamic gradients and styling
  const kpiCards = [
    { label: "Monthly Revenue",  value: fmt(totalRevenue),         change: `${report?.stats?.revenueGrowth ?? 0}%`,   up: (report?.stats?.revenueGrowth ?? 0) >= 0,  Icon: DollarSign,   color: "var(--brand-blue-bright)", bgGrad: "linear-gradient(135deg, rgba(2, 145, 192, 0.08) 0%, rgba(255, 255, 255, 0) 100%)", spark: salesData.slice(-7).map(s => s.sales) },
    { label: "Monthly Orders",   value: String(totalOrdersCount),  change: `${report?.stats?.ordersGrowth ?? 0}%`,    up: (report?.stats?.ordersGrowth ?? 0) >= 0,   Icon: ShoppingCart, color: "var(--brand-gold-bright)", bgGrad: "linear-gradient(135deg, rgba(214, 155, 4, 0.08) 0%, rgba(255, 255, 255, 0) 100%)", spark: salesData.slice(-7).map(s => s.sales) },
    { label: "New Customers",    value: String(totalUsersCount),   change: `${report?.stats?.customersGrowth ?? 0}%`, up: (report?.stats?.customersGrowth ?? 0) >= 0, Icon: UserPlus,     color: "var(--brand-green-bright)", bgGrad: "linear-gradient(135deg, rgba(153, 188, 13, 0.08) 0%, rgba(255, 255, 255, 0) 100%)", spark: salesData.map(s => s.customers || 0).slice(-7) },
    { label: "Credit Disbursed", value: fmt(creditDisbursed),      change: selectedLabel,                               up: true,                                              Icon: CreditCard,   color: "var(--brand-blue-dark)", bgGrad: "linear-gradient(135deg, rgba(1, 62, 103, 0.08) 0%, rgba(255, 255, 255, 0) 100%)", spark: [5,8,6,10,9,12,15] },
    { label: "Outstanding Balance", value: fmt(totalOutstanding),  change: "Live Tracking",                           up: false,                                             Icon: Wallet,       color: "var(--brand-gold-dark)", bgGrad: "linear-gradient(135deg, rgba(147, 95, 4, 0.08) 0%, rgba(255, 255, 255, 0) 100%)", spark: [5,5,5,5,5,5,5] },
  ];

  const COLORS = ["var(--brand-blue-bright)","var(--brand-gold-bright)","var(--brand-green-bright)","var(--brand-blue-dark)","var(--brand-gold-dark)"];

  const getInitials = (order: Order) => {
    const u = order.user;
    if (u?.firstName && u?.lastName) return `${u.firstName[0]}${u.lastName[0]}`.toUpperCase();
    if (u?.firstName) return u.firstName.slice(0, 2).toUpperCase();
    if (u?.email) return u.email.slice(0, 2).toUpperCase();
    return "US";
  };
  const getName = (order: Order) => {
    const u = order.user;
    if (!u) return "Guest Customer";
    return [u.firstName, u.lastName].filter(Boolean).join(" ") || u.email || "Unknown User";
  };
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (d: string) => new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ fontFamily: "var(--font-inter), sans-serif", padding: 0 }}>
      {isDashboardLoading && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(255,247,244,0.7)", backdropFilter: "blur(4px)",
          zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 48, height: 48, margin: "0 auto 16px", border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "14px", fontWeight: 600 }}>Syncing Ledger Data...</p>
          </div>
        </div>
      )}

      <div className="dash-outer">
        {/* ── TOP AREA ── */}
        <div className="dash-top">
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            flexWrap: "wrap", gap: 16, marginBottom: 24, background: "#FFFFFF",
            padding: "16px 24px", borderRadius: 16, border: `1px solid ${border}`,
            boxShadow: "0 10px 30px rgba(76, 59, 53, 0.02)"
          }}>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: 800, color: textMain, letterSpacing: "-0.5px", margin: 0 }}>
                Operations Dashboard
              </h1>
              <p style={{ fontSize: "13px", color: textMuted, marginTop: 4, margin: 0 }}>
                Synthesized real-time telemetry and ledger audits for <strong style={{ color: "var(--brand-blue-bright)" }}>{selectedLabel}</strong>.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: "12px", fontWeight: 700, color: textSec, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Active Period:
              </span>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{
                  background: surface, color: textMain, border: `1.5px solid ${border}`,
                  borderRadius: 10, padding: "8px 16px", fontSize: "13px", fontWeight: 700,
                  outline: "none", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.01)"
                }}
              >
                {(availableMonths.length > 0 ? availableMonths : [{ value: selectedMonth, label: selectedLabel }]).map((month) => (
                  <option key={month.value} value={month.value}>{month.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* KPI Card Grid */}
          <div className="kpi-grid" style={{ marginBottom: 24 }}>
            {kpiCards.map(({ label, value, change, up, Icon, color, bgGrad, spark }) => {
              const sparkData = spark.map(v => ({ v }));
              return (
                <div key={label} className="kpi-card" style={cardStyle({
                  padding: "16px 20px", position: "relative",
                  background: `${bgGrad}, #FFFFFF`
                })}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, background: `${color}15`,
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        border: `1px solid ${color}22`
                      }}>
                        <Icon size={16} color={color} />
                      </div>
                      <span style={{ fontSize: "12.5px", color: textMuted, fontWeight: 600 }}>{label}</span>
                    </div>
                    <span style={{
                      fontSize: "11px", fontWeight: 800,
                      color: up ? "var(--brand-green-deep)" : "var(--brand-gold-dark)",
                      background: up ? "rgba(20, 113, 21, 0.08)" : "rgba(147, 95, 4, 0.08)",
                      padding: "4px 8px", borderRadius: "12px",
                      display: "flex", alignItems: "center", gap: 4
                    }}>
                      {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {change}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: "22px", fontWeight: 800, color: textMain, letterSpacing: "-0.5px" }}>{value}</div>
                      <div style={{ fontSize: "10.5px", color: textMuted, marginTop: 4, fontWeight: 500 }}>
                        {label.includes("Revenue") || label.includes("Orders") ? `Against previous term` : `Updated just now`}
                      </div>
                    </div>
                    {/* Sparkline chart */}
                    <div className="kpi-spark" style={{ width: 85, height: 36, flexShrink: 0, overflow: "hidden" }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id={`sg-${label}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                              <stop offset="100%" stopColor={color} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#sg-${label})`} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT DOCK (Sidebar widgets) ── */}
        <div className="dash-sidebar">
          {/* Quick Actions Panel */}
          <div style={cardStyle({ padding: 20, marginBottom: 20 })}>
            <div style={{ fontSize: "14px", fontWeight: 800, color: textMain, letterSpacing: "-0.2px", marginBottom: 14 }}>
              System Actions Gateway
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {quickActions.map(({ label, Icon, color, href }) => (
                <button
                  key={label}
                  onClick={() => router.push(href)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    background: surface, border: `1.5px solid ${border}`, borderRadius: 12,
                    padding: "12px 6px", cursor: "pointer", transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.background = "#FFFFFF";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = border;
                    e.currentTarget.style.background = surface;
                    e.currentTarget.style.transform = "none";
                  }}
                >
                  <div style={{
                    width: 32, height: 32, borderRadius: 10, background: `${color}12`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: `1px solid ${color}20`
                  }}>
                    <Icon size={14} color={color} />
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 600, color: textSec, textAlign: "center", lineHeight: 1.2 }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* KPI Ledger Overview */}
          <div style={cardStyle({ padding: 20, marginBottom: 20 })}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: textMain, letterSpacing: "-0.2px" }}>Ledger Breakdown</div>
              <span onClick={() => router.push("/orders")} style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 700, cursor: "pointer" }}>
                View Logs
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative", width: 96, height: 96, flexShrink: 0 }}>
                <svg viewBox="0 0 100 100" width="100%" height="100%">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="10" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--brand-blue-bright)" strokeWidth="10"
                    strokeDasharray="251.3" strokeDashoffset={totalOrdersCount > 0 ? "80" : "251.3"} strokeLinecap="round" transform="rotate(-90 50 50)" />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: "16px", fontWeight: 800, color: textMain }}>{totalOrdersCount}</span>
                  <span style={{ fontSize: "9px", color: textMuted, fontWeight: 600, textTransform: "uppercase" }}>Orders</span>
                </div>
              </div>
              <div style={{ flex: 1 }}>
                {[
                  { label: "Gross Revenue", val: fmt(totalRevenue), color: "var(--brand-blue-bright)" },
                  { label: "New Signups",   val: totalUsersCount,  color: "var(--brand-green-bright)" },
                  { label: "Credit Disbursed", val: fmt(creditDisbursed), color: "var(--brand-gold-bright)" },
                ].map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                      <span style={{ fontSize: "12px", color: textMuted, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {item.label}
                      </span>
                    </div>
                    <span style={{ fontSize: "12.5px", fontWeight: 700, color: textMain }}>{item.val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Audits Feed */}
          <div style={cardStyle({ padding: 20 })}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div style={{ fontSize: "14px", fontWeight: 800, color: textMain, letterSpacing: "-0.2px" }}>Real-time Audit Ledger</div>
              <span onClick={() => router.push("/orders")} style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 700, cursor: "pointer" }}>
                Full Audit
              </span>
            </div>
            {activities.length === 0 ? (
              <div style={{ fontSize: "13px", color: textMuted, textAlign: "center", padding: "24px 0" }}>
                <Clock size={20} color={textMuted} style={{ margin: "0 auto 8px", opacity: 0.5 }} />
                No transactions recorded
              </div>
            ) : activities.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <ActivityIcon color={a.color} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "12.5px", color: textMain, fontWeight: 600, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {a.text}
                  </div>
                  <div style={{ fontSize: "10.5px", color: textMuted, marginTop: 3, display: "flex", alignItems: "center", gap: 4 }}>
                    <Clock size={11} /> {a.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CENTRAL GRAPHS & TELEMETRY ── */}
        <div className="dash-bottom">
          <div className="charts-row" style={{ marginBottom: 24 }}>
            {/* Sales Chart */}
            <div style={cardStyle({ padding: 24 })}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: textMain, letterSpacing: "-0.2px" }}>Revenue & Capital Yield</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
                    <span style={{ fontSize: "24px", fontWeight: 800, color: textMain, letterSpacing: "-0.5px" }}>{fmt(totalRevenue)}</span>
                    <span style={{
                      fontSize: "11.5px", fontWeight: 800, color: "var(--brand-green-deep)",
                      background: "rgba(20, 113, 21, 0.08)", padding: "4px 8px", borderRadius: "12px",
                      display: "flex", alignItems: "center", gap: 4
                    }}>
                      <TrendingUp size={12} /> Live Target
                    </span>
                  </div>
                </div>
                <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 10, padding: "6px 14px", fontSize: "12px", fontWeight: 700, color: textSec }}>
                  {selectedLabel} Analytics
                </div>
              </div>
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--brand-blue-bright)" stopOpacity={0.35} />
                        <stop offset="100%" stopColor="var(--brand-blue-bright)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridLine} vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: textMuted, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: textMuted, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(Number(v)/1000).toFixed(1)}k`} />
                    <Tooltip contentStyle={{ background: "#FFFFFF", border: `1.5px solid ${border}`, borderRadius: 12, boxShadow: "0 8px 24px rgba(76,59,53,0.06)", fontSize: "12px" }} formatter={(v: number) => [`$${Number(v).toLocaleString()}`, "Ledger Revenue"]} />
                    <Area type="monotone" dataKey="sales" stroke="var(--brand-blue-bright)" strokeWidth={3} fill="url(#salesGrad)" dot={{ fill: "var(--brand-blue-bright)", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart */}
            <div style={cardStyle({ padding: 24 })}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div style={{ fontSize: "14px", fontWeight: 800, color: textMain, letterSpacing: "-0.2px" }}>Share Allocation by Sector</div>
                <div style={{ background: surface, border: `1.5px solid ${border}`, borderRadius: 10, padding: "6px 14px", fontSize: "12px", fontWeight: 700, color: textSec }}>
                  {selectedLabel}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ width: 140, height: 140, flexShrink: 0, position: "relative" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={channelData} cx="50%" cy="50%" innerRadius={48} outerRadius={68} dataKey="value" stroke="none" paddingAngle={3}>
                        {channelData.map((e: any, i: number) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
                    <span style={{ fontSize: "14px", fontWeight: 800, color: textMain }}>{fmt(totalRevenue)}</span>
                    <span style={{ fontSize: "9px", color: textMuted, fontWeight: 600, textTransform: "uppercase" }}>Yield</span>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                  {channelData.slice(0, 4).map((ch: any) => (
                    <div key={ch.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: ch.color, flexShrink: 0 }} />
                        <span style={{ fontSize: "12px", fontWeight: 600, color: textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {ch.name}
                        </span>
                      </div>
                      <span style={{ fontSize: "11.5px", fontWeight: 700, color: textMuted }}>
                        {ch.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tables Row */}
          <div className="tables-row" style={{ marginBottom: 24 }}>
            {/* Recent Orders table widget */}
            <div style={cardStyle({ padding: 20 })}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: "14px", fontWeight: 800, color: textMain, letterSpacing: "-0.2px" }}>Order Pipeline</div>
                <span onClick={() => router.push("/orders")} style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 700, cursor: "pointer" }}>
                  Active Queue &rarr;
                </span>
              </div>
              {orders.length === 0 ? (
                <div style={{ fontSize: "13px", color: textMuted, textAlign: "center", padding: "28px 0" }}>No records present</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {orders.map((o, idx) => {
                    const initials = getInitials(o);
                    const name = getName(o);
                    const color = COLORS[idx % COLORS.length];
                    return (
                      <div key={o.id} style={{
                        display: "flex", alignItems: "center", gap: 12, paddingBottom: 10,
                        borderBottom: `1px solid ${border}`
                      }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%", background: `${color}12`,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px",
                          fontWeight: 800, color, flexShrink: 0, border: `1px solid ${color}22`
                        }}>
                          {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: textMain }}>{formatOrderRef(o.orderNumber, o.id)}</div>
                          <div style={{ fontSize: "11px", color: textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                        </div>
                        <div style={{ fontSize: "11px", color: textMuted, whiteSpace: "nowrap" }}>{formatTime(o.createdAt)}</div>
                        <div style={{ fontSize: "13px", fontWeight: 800, color: textMain, whiteSpace: "nowrap", marginLeft: 4 }}>
                          {fmt(parseFloat(o.total || "0"))}
                        </div>
                        <StatusBadge status={o.status} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Top Products widget */}
            <div style={cardStyle({ padding: 20 })}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: "14px", fontWeight: 800, color: textMain, letterSpacing: "-0.2px" }}>Product Performance</div>
                <span onClick={() => router.push("/products")} style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 700, cursor: "pointer" }}>
                  Products list
                </span>
              </div>
              {displayProducts.length === 0 ? (
                <div style={{ fontSize: "13px", color: textMuted, textAlign: "center", padding: "28px 0" }}>No records present</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {displayProducts.map((p) => (
                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 10, borderBottom: `1px solid ${border}` }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: 10, background: "rgba(2, 145, 192, 0.08)",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        border: "1px solid rgba(2, 145, 192, 0.12)"
                      }}>
                        <Package size={15} color="var(--brand-blue-bright)" />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                        <div style={{ fontSize: "11px", color: "var(--brand-green-deep)", fontWeight: 700 }}>
                          {p._count?.orderItems || 0} Units Cleared
                        </div>
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: 800, color: textMain, whiteSpace: "nowrap" }}>
                        {fmt((p._count?.orderItems || 0) * (p.salePrice || p.price || 0))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* New Customers widget */}
            <div style={cardStyle({ padding: 20 })}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ fontSize: "14px", fontWeight: 800, color: textMain, letterSpacing: "-0.2px" }}>Acquisition Ledger</div>
                <span onClick={() => router.push("/users")} style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 700, cursor: "pointer" }}>
                  Users db
                </span>
              </div>
              {customers.length === 0 ? (
                <div style={{ fontSize: "13px", color: textMuted, textAlign: "center", padding: "28px 0" }}>No records present</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {customers.map((c, idx) => {
                    const initials = c.firstName && c.lastName
                      ? `${c.firstName[0]}${c.lastName[0]}`.toUpperCase()
                      : c.email.slice(0, 2).toUpperCase();
                    const name = [c.firstName, c.lastName].filter(Boolean).join(" ") || c.email;
                    const color = COLORS[idx % COLORS.length];
                    return (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, paddingBottom: 10, borderBottom: `1px solid ${border}` }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: "50%", background: `${color}12`,
                          display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px",
                          fontWeight: 800, color, flexShrink: 0, border: `1px solid ${color}22`
                        }}>
                          {initials}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: "13px", fontWeight: 700, color: textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                          <div style={{ fontSize: "11px", color: textMuted, fontWeight: 500 }}>Signed {formatDate(c.createdAt)}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Financial summary blocks */}
          <div className="financial-grid">
            {[
              { label: "Active Credit Exposure", val: fmt(totalOutstanding),  sub: "Risk outstanding balance",         color: "var(--brand-gold-dark)", hl: false },
              { label: "Disbursed Credit",      val: fmt(creditDisbursed),   sub: `Credit issued in active range`,    color: "var(--brand-blue-medium)", hl: false },
              { label: "Accounts Created",      val: String(totalUsersCount), sub: `Customer accounts registered`,    color: "var(--brand-green-bright)", hl: false },
              { label: "Invoiced Revenue",      val: fmt(totalRevenue),       sub: `Gross settlement ledger yield`,    color: "var(--brand-blue-dark)", hl: true  },
            ].map(item => (
              <div key={item.label} style={{
                background: item.hl ? "linear-gradient(135deg, var(--brand-blue-navy) 0%, var(--brand-blue-dark) 100%)" : "#FFFFFF",
                border: `1.5px solid ${item.hl ? "transparent" : border}`,
                borderRadius: 16, padding: "18px 16px",
                boxShadow: "0 8px 24px rgba(76,59,53,0.02)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: 10,
                    background: item.hl ? "rgba(255,255,255,0.12)" : `${item.color}12`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: item.hl ? "1px solid rgba(255,255,255,0.15)" : `1px solid ${item.color}20`
                  }}>
                    <Wallet size={15} color={item.hl ? "#fff" : item.color} />
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 700, color: item.hl ? "rgba(255,255,255,0.85)" : textMuted }}>
                    {item.label}
                  </div>
                </div>
                <div style={{ fontSize: "20px", fontWeight: 800, color: item.hl ? "#FFFFFF" : textMain, marginBottom: 4, letterSpacing: "-0.5px" }}>
                  {item.val}
                </div>
                <div style={{ fontSize: "11px", color: item.hl ? "rgba(255,255,255,0.7)" : textMuted, fontWeight: 500 }}>
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        .dash-outer {
          display: grid;
          grid-template-columns: 1fr 310px;
          grid-template-areas: "top sidebar" "bottom sidebar";
          gap: 20px;
          align-items: start;
          width: 100%;
          min-width: 0;
        }
        .dash-top    { grid-area: top;     min-width: 0; }
        .dash-bottom { grid-area: bottom;  min-width: 0; }
        .dash-sidebar { grid-area: sidebar; position: sticky; top: 92px; min-width: 0; }
        .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 14px; width: 100%; }
        .kpi-card { min-width: 0; overflow: hidden; min-height: 100px; }
        .charts-row     { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; width: 100%; overflow: hidden; }
        .tables-row     { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 16px; width: 100%; overflow: hidden; }
        .financial-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; width: 100%; }
        @media (max-width: 1200px) {
          .dash-outer { grid-template-columns: 1fr 280px; gap: 16px; }
          .kpi-grid   { grid-template-columns: repeat(3, 1fr); }
        }
        @media (max-width: 880px) {
          .dash-outer   { grid-template-columns: 1fr; grid-template-areas: "top" "sidebar" "bottom"; }
          .dash-sidebar { position: static; }
          .kpi-grid     { grid-template-columns: repeat(2, 1fr); }
          .charts-row   { grid-template-columns: 1fr; }
          .tables-row   { grid-template-columns: 1fr; }
          .financial-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .kpi-grid       { grid-template-columns: repeat(2, 1fr); gap: 10px; }
          .financial-grid { grid-template-columns: repeat(2, 1fr); }
          .kpi-spark      { display: none !important; }
          .kpi-card       { min-height: 84px; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <AdminShell>
      <DashboardContent />
    </AdminShell>
  );
}
