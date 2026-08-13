"use client";
import AdminShell from "@/components/admin/admin-shell";
import dynamic from "next/dynamic";
import type * as RechartsTypes from "recharts";
import { useAuth } from "@/contexts/auth-context";

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
  Clock, ShieldCheck, ArrowRight, Activity, Calendar
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getRecentOrders, getTopProducts, getRecentCustomers, getReportsSummary } from "@/lib/api";

const quickActions = [
  { label: "Invoice",  Icon: FileText,    color: "var(--brand-blue-bright)", href: "/invoicing"       },
  { label: "Payment",  Icon: CreditCard,  color: "var(--brand-gold-bright)", href: "/wallet-payments" },
  { label: "Product",  Icon: Package,     color: "var(--brand-gold-dark)",   href: "/products"        },
  { label: "Order",    Icon: ShoppingCart,color: "var(--brand-blue-dark)",   href: "/orders"          },
  { label: "Customer", Icon: UserPlus,    color: "var(--brand-green-bright)",href: "/users"           },
];

function shortRef(prefix: string, value?: string | null) {
  const clean = value?.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  if (!clean) return `${prefix}-N/A`;
  return `${prefix}-${clean.slice(-5)}`;
}

function formatOrderRef(orderNumber?: string | null, fallbackId?: string | null) {
  if (orderNumber?.trim()) return `#${orderNumber.trim()}`;
  return `#${shortRef("ORD", fallbackId)}`;
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || "";
  const map: Record<string, { bg: string; color: string; label: string }> = {
    completed: { bg: "rgba(20, 113, 21, 0.08)",  color: "var(--brand-green-deep)", label: "Completed" },
    delivered: { bg: "rgba(20, 113, 21, 0.08)",  color: "var(--brand-green-deep)", label: "Delivered" },
    processing:{ bg: "rgba(2, 145, 192, 0.08)",  color: "var(--brand-blue-bright)", label: "Processing" },
    pending:   { bg: "rgba(214, 155, 4, 0.08)",  color: "var(--brand-gold-bright)", label: "Pending" },
    cancelled: { bg: "rgba(147, 95, 4, 0.08)",   color: "var(--brand-gold-dark)", label: "Cancelled" },
    paid:      { bg: "rgba(20, 113, 21, 0.08)",  color: "var(--brand-green-deep)", label: "Paid" },
  };
  const style = map[s] || { bg: "rgba(127, 109, 103, 0.08)", color: "var(--text-muted)", label: status };
  return (
    <span style={{
      background: style.bg, color: style.color, fontSize: "10.5px", fontWeight: 800,
      padding: "2px 8px", borderRadius: "12px", whiteSpace: "nowrap", border: `1px solid ${style.color}15`
    }}>
      {style.label}
    </span>
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
  const { user: authUser } = useAuth();
  const router = useRouter();
  const border    = "var(--border)";
  const textMain  = "var(--text-main)";
  const textMuted = "var(--text-muted)";
  const textSec   = "var(--text-secondary)";
  const surface   = "var(--surface)";

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
    "var(--brand-gold-dark)"
  ];

  const salesData: Array<{ date: string; sales: number; customers: number }> = report?.revenueSeries?.length > 0
    ? report.revenueSeries.map((s: any) => ({ date: String(s.label), sales: Number(s.revenue || 0), customers: Number(s.customers || 0) }))
    : [{ date: "Jan", sales: 0 }, { date: "Feb", sales: 0 }, { date: "Mar", sales: 0 },
       { date: "Apr", sales: 0 }, { date: "May", sales: 0 }, { date: "Jun", sales: 0 }].map((item) => ({ ...item, customers: 0 }));

  const channelData: Array<{ name: string; value: number; amount: number; color: string }> = report?.salesByCategory?.length > 0
    ? report.salesByCategory.slice(0, 5).map((cat: any, i: number) => ({
        name: cat.name, value: Number(cat.value || 0), amount: 0, color: CHART_COLORS[i % CHART_COLORS.length],
      }))
    : [{ name: "General Catalog", value: 100, amount: 0, color: "var(--brand-blue-bright)" }];

  const activities: Array<{ text: string; time: string; color: string }> = report?.recentTransactions?.length > 0
    ? report.recentTransactions.slice(0, 5).map((tx: any) => ({
        text: `Order ${shortRef("ORD", tx.id)} · ${tx.customer || "Customer"} · ${fmt(tx.amount)}`,
        time: tx.date ? new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Today",
        color: (tx.status === "paid" || tx.status === "delivered") ? "var(--brand-green-deep)" : "var(--brand-blue-bright)",
      }))
    : orders.slice(0, 5).map((o, i) => ({
        text: `${formatOrderRef(o.orderNumber, o.id)} · ${
          o.user ? `${o.user.firstName || ""} ${o.user.lastName || ""}`.trim() || o.user.email || "Customer" : "Customer"
        } · ${fmt(parseFloat(o.total || "0"))}`,
        time: new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));

  const displayProducts: Product[] = report?.topProducts?.length > 0
    ? report.topProducts.map((p: any) => ({
        id: p.name,
        name: p.name,
        price: p.sales > 0 ? p.revenue / p.sales : 0,
        _count: { orderItems: p.sales },
      }))
    : products;

  const kpis = [
    { label: "Net Revenue", val: fmt(totalRevenue), change: `${report?.stats?.revenueGrowth ?? 0}%`, up: (report?.stats?.revenueGrowth ?? 0) >= 0, color: "var(--brand-blue-bright)", spark: salesData.slice(-7).map(s => s.sales) },
    { label: "Orders Cleared", val: String(totalOrdersCount), change: `${report?.stats?.ordersGrowth ?? 0}%`, up: (report?.stats?.ordersGrowth ?? 0) >= 0, color: "var(--brand-gold-bright)", spark: salesData.slice(-7).map(s => s.sales) },
    { label: "New Customers", val: String(totalUsersCount), change: `${report?.stats?.customersGrowth ?? 0}%`, up: (report?.stats?.customersGrowth ?? 0) >= 0, color: "var(--brand-green-bright)", spark: salesData.map(s => s.customers || 0).slice(-7) },
    { label: "Disbursed Credit", val: fmt(creditDisbursed), change: "Active Ledger", up: true, color: "var(--brand-blue-dark)", spark: [3, 5, 8, 4, 11, 9, 14] },
    { label: "Risk Exposure", val: fmt(totalOutstanding), change: "Live Audit", up: false, color: "var(--brand-gold-dark)", spark: [4, 4, 4, 4, 4, 4, 4] },
  ];

  return (
    <div style={{ fontFamily: "var(--font-inter), sans-serif", display: "flex", flexDirection: "column", gap: 20 }}>
      {isDashboardLoading && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(255,247,244,0.6)", backdropFilter: "blur(4px)",
          zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 40, height: 40, margin: "0 auto 12px", border: "3px solid var(--border)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            <p style={{ color: "var(--text-muted)", fontSize: "13px", fontWeight: 600 }}>Syncing Ledger Data...</p>
          </div>
        </div>
      )}

      {/* ── LUXURY DUAL-TONE WELCOME HERO ── */}
      <div style={{
        background: "linear-gradient(135deg, #012044 0%, #013E67 100%)",
        borderRadius: 16,
        padding: "24px",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 20,
        boxShadow: "0 10px 30px rgba(1, 32, 68, 0.15)",
        border: "1px solid rgba(255,255,255,0.06)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Dynamic Glowing Brand Watermark */}
        <div style={{
          position: "absolute", right: "-40px", bottom: "-40px", width: 240, height: 240,
          background: "radial-gradient(circle, rgba(2, 145, 192, 0.2) 0%, rgba(0,0,0,0) 70%)",
          pointerEvents: "none", zIndex: 1
        }} />

        <div style={{ zIndex: 2, position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
            <span style={{
              background: "rgba(214, 155, 4, 0.2)", color: "var(--brand-gold-bright)",
              fontSize: "10px", fontWeight: 800, padding: "3px 10px", borderRadius: "12px",
              border: "1px solid rgba(214, 155, 4, 0.3)", textTransform: "uppercase", letterSpacing: "1px"
            }}>
              Active Security Guard
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
              <ShieldCheck size={13} color="var(--brand-green-bright)" /> Encryption Handshake Active
            </span>
          </div>
          <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.5px", margin: 0 }}>
            Welcome, {authUser?.name || "Officer"}
          </h1>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)", marginTop: 4, margin: 0, maxWidth: 520 }}>
            You are securely logged into the Ferixcomerz Enterprise Console. Here is your operations framework overview for {selectedLabel}.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12, zIndex: 2, position: "relative" }}>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{
              background: "rgba(255,255,255,0.08)", color: "white", border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 10, padding: "8px 16px", fontSize: "13px", fontWeight: 700,
              outline: "none", cursor: "pointer", backdropFilter: "blur(10px)"
            }}
          >
            {(availableMonths.length > 0 ? availableMonths : [{ value: selectedMonth, label: selectedLabel }]).map((month) => (
              <option key={month.value} value={month.value} style={{ background: "#012044", color: "white" }}>{month.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── SIDE-BY-SIDE COMPACT METRIC BOXES ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: 12,
        width: "100%"
      }} className="metric-row-grid">
        {kpis.map(({ label, val, change, up, color, spark }) => {
          const sparkData = spark.map(v => ({ v }));
          return (
            <div key={label} style={{
              background: "white",
              border: `1px solid ${border}`,
              borderRadius: 12,
              padding: "14px 16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 4px 12px rgba(76, 59, 53, 0.02)",
              minWidth: 0,
              minHeight: 110,
              position: "relative",
              overflow: "hidden"
            }}>
              {/* Highlight bar */}
              <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 4, background: color }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
                <span style={{ fontSize: "11px", color: textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2px" }}>{label}</span>
                <span style={{
                  fontSize: "10px", fontWeight: 800,
                  color: up ? "var(--brand-green-deep)" : "var(--brand-gold-dark)",
                  background: up ? "rgba(20, 113, 21, 0.08)" : "rgba(147, 95, 4, 0.08)",
                  padding: "1px 6px", borderRadius: "10px",
                }}>
                  {change}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 10, marginTop: "auto" }}>
                <div style={{ fontSize: "18px", fontWeight: 850, color: textMain, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
                  {val}
                </div>
                {/* Micro-sparkline */}
                <div style={{ width: 55, height: 22, flexShrink: 0, opacity: 0.8 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`sg-${label}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={color} stopOpacity={0.25} />
                          <stop offset="100%" stopColor={color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#sg-${label})`} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── QUICK GATEWAY COLUMN & SYSTEM CONTROL ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr",
        gap: 20
      }} className="dashboard-grid-two">

        {/* Left: Financial Performance Area Chart */}
        <div style={{
          background: "white",
          border: `1px solid ${border}`,
          borderRadius: 16,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 4px 12px rgba(76, 59, 53, 0.02)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: "15px", fontWeight: 800, color: textMain, margin: 0 }}>Revenue Dynamics</h2>
              <p style={{ fontSize: "11px", color: textMuted, margin: "2px 0 0" }}>Capital yield overview compared with forecast frames</p>
            </div>
            <span style={{ fontSize: "12px", color: "var(--brand-blue-bright)", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
              <Activity size={14} /> Live Telemetry
            </span>
          </div>

          <div style={{ height: 230, width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--brand-blue-bright)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--brand-blue-bright)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={border} vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: textMuted, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: textMuted, fontWeight: 600 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(Number(v)/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background: "#FFFFFF", border: `1px solid ${border}`, borderRadius: 8, fontSize: "11px" }} formatter={(v: number) => [`$${Number(v).toLocaleString()}`, "Yield"]} />
                <Area type="monotone" dataKey="sales" stroke="var(--brand-blue-bright)" strokeWidth={2} fill="url(#salesGrad)" dot={{ fill: "var(--brand-blue-bright)", r: 3, strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Quick Action Buttons & Categorization */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Quick Actions Panel */}
          <div style={{
            background: "white",
            border: `1px solid ${border}`,
            borderRadius: 16,
            padding: "20px",
            boxShadow: "0 4px 12px rgba(76, 59, 53, 0.02)"
          }}>
            <h2 style={{ fontSize: "14px", fontWeight: 800, color: textMain, margin: "0 0 12px" }}>System Management Shortcuts</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {quickActions.map(({ label, Icon, color, href }) => (
                <button
                  key={label}
                  onClick={() => router.push(href)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: surface, border: `1px solid ${border}`, borderRadius: 10,
                    padding: "8px 12px", cursor: "pointer", transition: "all 0.2s"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "var(--primary)";
                    e.currentTarget.style.background = "#FFFFFF";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = border;
                    e.currentTarget.style.background = surface;
                  }}
                >
                  <Icon size={14} color={color} />
                  <span style={{ fontSize: "12px", fontWeight: 700, color: textSec }}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Share Allocation by Sector */}
          <div style={{
            background: "white",
            border: `1px solid ${border}`,
            borderRadius: 16,
            padding: "16px 20px",
            boxShadow: "0 4px 12px rgba(76, 59, 53, 0.02)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16
          }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: "13.5px", fontWeight: 800, color: textMain, margin: 0 }}>Category Sales Weight</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
                {channelData.slice(0, 3).map((ch, i) => (
                  <div key={ch.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: ch.color, flexShrink: 0 }} />
                      <span style={{ fontWeight: 600, color: textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {ch.name}
                      </span>
                    </div>
                    <span style={{ fontWeight: 700, color: textMuted }}>{ch.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ width: 75, height: 75, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={channelData} cx="50%" cy="50%" innerRadius={22} outerRadius={34} dataKey="value" stroke="none" paddingAngle={3}>
                    {channelData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ── SYSTEM RECORD TABLES SIT SIDE-BY-SIDE ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 20
      }} className="dashboard-grid-two">

        {/* Left: Active Pipeline Queue */}
        <div style={{
          background: "white",
          border: `1px solid ${border}`,
          borderRadius: 16,
          padding: "20px",
          boxShadow: "0 4px 12px rgba(76, 59, 53, 0.02)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: "14px", fontWeight: 800, color: textMain, margin: 0 }}>Active Pipeline Queue</h2>
            <span onClick={() => router.push("/orders")} style={{ fontSize: "11px", color: "var(--primary)", fontWeight: 700, cursor: "pointer" }}>
              Full Orders &rarr;
            </span>
          </div>

          {orders.length === 0 ? (
            <div style={{ fontSize: "12px", color: textMuted, padding: "20px 0", textAlign: "center" }}>No records pending</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {orders.slice(0, 4).map((o) => {
                const name = o.user ? `${o.user.firstName || ""} ${o.user.lastName || ""}`.trim() || o.user.email || "Guest" : "Guest";
                return (
                  <div key={o.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                    paddingBottom: 10, borderBottom: `1px solid ${border}`, fontSize: "12.5px"
                  }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontWeight: 700, color: textMain }}>{formatOrderRef(o.orderNumber, o.id)}</div>
                      <div style={{ fontSize: "11px", color: textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: textMain }}>{fmt(parseFloat(o.total || "0"))}</div>
                    <StatusBadge status={o.status} />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Product Velocity Track */}
        <div style={{
          background: "white",
          border: `1px solid ${border}`,
          borderRadius: 16,
          padding: "20px",
          boxShadow: "0 4px 12px rgba(76, 59, 53, 0.02)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h2 style={{ fontSize: "14px", fontWeight: 800, color: textMain, margin: 0 }}>Product Velocity</h2>
            <span onClick={() => router.push("/products")} style={{ fontSize: "11px", color: "var(--primary)", fontWeight: 700, cursor: "pointer" }}>
              Catalog List
            </span>
          </div>

          {displayProducts.length === 0 ? (
            <div style={{ fontSize: "12px", color: textMuted, padding: "20px 0", textAlign: "center" }}>No catalog telemetry recorded</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {displayProducts.slice(0, 4).map((p) => (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                  paddingBottom: 10, borderBottom: `1px solid ${border}`, fontSize: "12.5px"
                }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, color: textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--brand-green-deep)", fontWeight: 700 }}>
                      {p._count?.orderItems || 0} Units Cleared
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: textMain }}>
                    {fmt((p._count?.orderItems || 0) * (p.price || 0))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      <style>{`
        .metric-row-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }
        .dashboard-grid-two {
          display: grid;
          grid-template-columns: 1.6fr 1fr;
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .metric-row-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .dashboard-grid-two {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .metric-row-grid {
            grid-template-columns: 1fr;
          }
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
