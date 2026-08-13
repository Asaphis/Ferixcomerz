"use client";
import React, { useState, useRef, useEffect } from "react";
import { Menu, Search, Bell, ChevronDown, LogOut, User, Settings, Check } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { getNotifications, markNotificationRead } from "@/lib/api";
import BrandLogo from "./logo";

const pageNames: Record<string, string> = {
  "/dashboard": "Dashboard Overview", "/users": "User Administration", "/orders": "Orders & Payments",
  "/categories": "Inventory Categories", "/brands": "Brand Management", "/reviews": "Customer Reviews",
  "/products": "Product Catalogue", "/wholesale": "Wholesale Operations", "/credit-system": "Credit Management",
  "/wallet-payments": "Wallet Ledger & Payments", "/countries-currencies": "Currencies & Regions",
  "/locations-shipping": "Shipping Operations", "/services": "Services Offered",
  "/invoicing": "Invoicing & Estimates", "/cms-pages": "Content Management", "/notifications": "System Notifications",
  "/reports": "Statistical Reports", "/settings": "System Settings",
};

interface TopbarProps {
  collapsed: boolean;
  sidebarW: number;
  onMenuToggle: () => void;
  onMobileMenuToggle: () => void;
}

type NotifItem = { id: string; title: string; message: string; isRead: boolean; createdAt: string; type?: string; url?: string };

export default function Topbar({ collapsed, sidebarW, onMenuToggle, onMobileMenuToggle }: TopbarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifs, setNotifs] = useState<NotifItem[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const border = "var(--border)";
  const textMain = "var(--text-main)";
  const textMuted = "var(--text-muted)";
  const surface = "var(--surface)";
  const currentPage = pageNames[pathname] || "Dashboard Overview";

  const unread = notifs.filter(n => !n.isRead).length;

  // Fetch notifications
  const fetchNotifs = async () => {
    setNotifLoading(true);
    try {
      const res: any = await getNotifications({ limit: 8 });
      const raw: any[] = Array.isArray(res.data?.data) ? res.data.data : Array.isArray(res.data) ? res.data : [];
      const mapped: NotifItem[] = raw
        .map((n: any) => {
          const data = typeof n.data === 'string' ? JSON.parse(n.data) : n.data;
          return {
            id: n.id || String(Math.random()),
            title: n.title || n.type || "Notification",
            message: n.message || n.body || "",
            isRead: n.isRead ?? n.read ?? false,
            createdAt: n.createdAt ? new Date(n.createdAt).toLocaleDateString() : "",
            type: data?.type || n.type || "",
            url: data?.url || "",
          };
        });
      setNotifs(mapped);
    } catch {
      // silently fail
    }
    setNotifLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(() => {
      fetchNotifs();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node) &&
        menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target as Node) &&
        notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkAllRead = async () => {
    const unreadIds = notifs.filter(n => !n.isRead).map(n => n.id);
    await Promise.allSettled(unreadIds.map(id => markNotificationRead(id)));
    setNotifs(d => d.map(n => ({ ...n, isRead: true })));
  };

  const handleMarkOne = async (id: string) => {
    try { await markNotificationRead(id); } catch {}
    setNotifs(d => d.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const handleNotifClick = async (n: NotifItem) => {
    if (!n.isRead) handleMarkOne(n.id);
    setShowNotifMenu(false);
    
    if (n.url) {
      router.push(n.url);
      return;
    }
    if (n.type === 'NEW_ORDER') {
      router.push('/orders');
      return;
    } 
    if (n.type === 'USER_REGISTER') {
      router.push('/users');
      return;
    }
    router.push(`/notifications/${n.id}`);
  };

  const handleLogout = () => { setShowUserMenu(false); logout(); };
  const handleProfile = () => { setShowUserMenu(false); router.push("/settings"); };

  return (
    <>
      {/* Desktop topbar */}
      <header className="topbar-desktop" style={{
        position: "fixed", top: 0, right: 0, height: 72,
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: `1px solid ${border}`,
        display: "none", alignItems: "center", gap: 14,
        padding: "0 24px", zIndex: 40, transition: "left 0.3s cubic-bezier(0.16, 1, 0.3, 1)", left: sidebarW,
        boxShadow: "0 2px 12px rgba(76, 59, 53, 0.02)",
        maxWidth: "calc(100% - var(--sidebar-width))"
      }}>
        <button
          onClick={onMenuToggle}
          style={{
            background: "none", border: "none", cursor: "pointer", color: textMuted,
            padding: 10, borderRadius: 10, display: "flex", alignItems: "center", flexShrink: 0,
            transition: "all 0.25s",
            minWidth: "44px",
            minHeight: "44px",
            justifyContent: "center"
          }}
          onMouseEnter={e => e.currentTarget.style.background = "var(--surface)"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >
          <Menu size={20} />
        </button>

        {/* Display Current Dashboard Page Name */}
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
          <h2 style={{ fontSize: "16px", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.3px", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {currentPage}
          </h2>
          <span style={{ fontSize: "10.5px", color: "var(--brand-gold-dark)", fontWeight: 600 }}>
            System Administration
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 20 }} />

        {/* Search */}
        <div className="topbar-search" style={{
          display: "flex", alignItems: "center", gap: 10, background: surface,
          border: `1.5px solid ${border}`, borderRadius: 10, padding: "8px 14px", width: 220, flexShrink: 0,
          transition: "all 0.25s",
          maxWidth: "280px"
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "var(--primary)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = border}
        >
          <Search size={14} color={textMuted} />
          <span style={{ fontSize: "12.5px", color: textMuted, fontWeight: 500 }}>Search console...</span>
        </div>

        {/* Desktop Bell Button */}
        <button
          ref={bellRef}
          onClick={() => { setShowNotifMenu(v => !v); if (!showNotifMenu) fetchNotifs(); }}
          style={{
            position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
            width: 40, height: 40, background: surface, border: `1.5px solid ${border}`,
            borderRadius: 10, cursor: "pointer", color: showNotifMenu ? "var(--primary)" : textMuted,
            flexShrink: 0, transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            minWidth: "44px",
            minHeight: "44px"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.background = "#FFFFFF";
          }}
          onMouseLeave={e => {
            if (!showNotifMenu) {
              e.currentTarget.style.borderColor = border;
              e.currentTarget.style.background = surface;
            }
          }}
        >
          <Bell size={16} />
          {unread > 0 && (
            <div style={{
              position: "absolute", top: -2, right: -2, width: 10, height: 10,
              background: "var(--brand-gold-bright)", borderRadius: "50%", border: `2.5px solid #FFFFFF`,
              boxShadow: "0 0 6px var(--brand-gold-bright)"
            }} />
          )}
        </button>

        {/* User Card */}
        <div
          ref={avatarRef}
          onClick={() => setShowUserMenu(v => !v)}
          style={{
            display: "flex", alignItems: "center", gap: 10, background: surface,
            border: `1.5px solid ${border}`, borderRadius: 12, padding: "6px 12px", cursor: "pointer",
            flexShrink: 0, transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            maxWidth: "200px"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.background = "#FFFFFF";
          }}
          onMouseLeave={e => {
            if (!showUserMenu) {
              e.currentTarget.style.borderColor = border;
              e.currentTarget.style.background = surface;
            }
          }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--brand-blue-bright), var(--brand-blue-dark))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "12px", fontWeight: 700, color: "white", flexShrink: 0,
            boxShadow: "0 2px 8px rgba(2, 145, 192, 0.3)"
          }}>
            {user?.name?.[0]?.toUpperCase() || "A"}
          </div>
          <div className="topbar-user-info" style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: "12.5px", fontWeight: 700, color: textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user?.name?.split(" ")[0] || "Admin"}
            </div>
            <div style={{ fontSize: "10px", color: "var(--brand-green-deep)", fontWeight: 700, letterSpacing: "0.2px" }}>
              Super Administrator
            </div>
          </div>
          <ChevronDown size={14} color={textMuted} style={{
            transform: showUserMenu ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.25s",
            opacity: 0.8,
            flexShrink: 0
          }} />
        </div>
      </header>

      {/* Mobile topbar */}
      <header className="topbar-mobile" style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 60,
        background: "#FFFFFF", borderBottom: `1px solid ${border}`,
        display: "none", alignItems: "center", padding: "0 16px", zIndex: 40, gap: 12,
        boxShadow: "0 2px 12px rgba(76, 59, 53, 0.02)",
        maxWidth: "100%"
      }}>
        <button
          onClick={onMobileMenuToggle}
          style={{
            background: "none", border: "none", cursor: "pointer", color: textMuted,
            padding: 10, borderRadius: 8, display: "flex", alignItems: "center", flexShrink: 0,
            minWidth: "44px",
            minHeight: "44px",
            justifyContent: "center"
          }}
        >
          <Menu size={22} />
        </button>
        <BrandLogo size={28} />
        <span style={{ fontSize: "14px", fontWeight: 800, color: textMain, letterSpacing: "-0.3px", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {currentPage}
        </span>

        {/* Mobile Bell Button */}
        <button
          onClick={() => { setShowNotifMenu(v => !v); if (!showNotifMenu) fetchNotifs(); }}
          style={{
            position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
            width: 40, height: 40, background: surface, border: `1.5px solid ${border}`,
            borderRadius: 10, cursor: "pointer", color: showNotifMenu ? "var(--primary)" : textMuted,
            flexShrink: 0, transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            minWidth: "44px",
            minHeight: "44px"
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = "var(--primary)";
            e.currentTarget.style.background = "#FFFFFF";
          }}
          onMouseLeave={e => {
            if (!showNotifMenu) {
              e.currentTarget.style.borderColor = border;
              e.currentTarget.style.background = surface;
            }
          }}
        >
          <Bell size={16} />
          {unread > 0 && (
            <div style={{
              position: "absolute", top: -2, right: -2, width: 10, height: 10,
              background: "var(--brand-gold-bright)", borderRadius: "50%", border: `2.5px solid #FFFFFF`,
              boxShadow: "0 0 6px var(--brand-gold-bright)"
            }} />
          )}
        </button>

        <div
          onClick={() => setShowUserMenu(v => !v)}
          style={{
            width: 36, height: 36, borderRadius: "50%",
            background: "linear-gradient(135deg, var(--brand-blue-bright), var(--brand-blue-dark))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "13px", fontWeight: 700, color: "white", flexShrink: 0, cursor: "pointer",
            minWidth: "44px",
            minHeight: "44px"
          }}
        >
          {user?.name?.[0]?.toUpperCase() || "A"}
        </div>
      </header>

      {/* ── Notification Dropdown ── */}
      {showNotifMenu && (
        <div ref={notifRef} className="dropdown-safe" style={{
          position: "fixed", top: 76, right: 24, width: 360, maxWidth: "calc(100vw - 48px)",
          background: "#FFFFFF", border: `1px solid ${border}`, borderRadius: 16,
          boxShadow: "0 12px 36px rgba(76, 59, 53, 0.12)",
          overflow: "hidden", zIndex: 9999,
          animation: "fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Bell size={15} color="var(--primary)" />
              <span style={{ fontSize: "13.5px", fontWeight: 700, color: textMain }}>Live Notifications</span>
              {unread > 0 && (
                <span style={{
                  background: "var(--brand-gold-bright)", color: "white",
                  fontSize: "10px", fontWeight: 700, borderRadius: 10, padding: "2px 6px"
                }}>
                  {unread} New
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {unread > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  style={{ fontSize: "11.5px", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "var(--font-inter)" }}
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => { setShowNotifMenu(false); router.push("/notifications"); }}
                style={{ fontSize: "11.5px", color: textMuted, background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontFamily: "var(--font-inter)" }}
              >
                View Box
              </button>
            </div>
          </div>

          {/* Notification list */}
          <div style={{ maxHeight: 360, overflowY: "auto" }}>
            {notifLoading ? (
              <div style={{ padding: "32px", textAlign: "center", color: textMuted, fontSize: "13px" }}>
                <div style={{ width: "20px", height: "20px", margin: "0 auto 8px", border: "2px solid rgba(2,145,192,0.15)", borderTopColor: "var(--primary)", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                Retrieving updates...
              </div>
            ) : notifs.length === 0 ? (
              <div style={{ padding: "36px 20px", textAlign: "center" }}>
                <Bell size={28} color={textMuted} style={{ margin: "0 auto 10px", display: "block", opacity: 0.5 }} />
                <div style={{ fontSize: "13px", color: textMuted, fontWeight: 500 }}>No live notifications</div>
              </div>
            ) : notifs.slice(0, 8).map(n => (
              <div key={n.id} 
                onClick={() => handleNotifClick(n)}
                style={{
                  padding: "14px 20px", borderBottom: `1px solid ${border}`,
                  background: n.isRead ? "transparent" : "rgba(2, 145, 192, 0.03)",
                  display: "flex", gap: 12, alignItems: "flex-start",
                  cursor: "pointer", transition: "background 0.15s"
                }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(2,145,192,0.02)"}
                onMouseLeave={e => e.currentTarget.style.background = n.isRead ? "transparent" : "rgba(2, 145, 192, 0.03)"}
              >
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: n.isRead ? "transparent" : "var(--primary)",
                  boxShadow: n.isRead ? "none" : "0 0 6px var(--primary)",
                  flexShrink: 0, marginTop: 6
                }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", fontWeight: n.isRead ? 500 : 700, color: textMain, marginBottom: 2 }}>{n.title}</div>
                  {n.message && <div style={{ fontSize: "12px", color: textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n.message}</div>}
                  {n.createdAt && <div style={{ fontSize: "10.5px", color: textMuted, marginTop: 4 }}>{n.createdAt}</div>}
                </div>
                {!n.isRead && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleMarkOne(n.id); }}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "var(--brand-green-deep)", padding: 4, flexShrink: 0 }}
                    title="Mark as read"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 20px", borderTop: `1px solid ${border}`, textAlign: "center", background: surface }}>
            <button
              onClick={() => { setShowNotifMenu(false); router.push("/notifications"); }}
              style={{ fontSize: "12.5px", color: "var(--primary)", background: "none", border: "none", cursor: "pointer", fontWeight: 700, fontFamily: "var(--font-inter)" }}
            >
              All notifications center &rarr;
            </button>
          </div>
        </div>
      )}

      {/* ── User dropdown ── */}
      {showUserMenu && (
        <div ref={menuRef} className="dropdown-safe" style={{
          position: "fixed", top: 76, right: 24, width: 220, maxWidth: "calc(100vw - 48px)",
          background: "#FFFFFF",
          border: `1px solid ${border}`, borderRadius: 16,
          boxShadow: "0 12px 36px rgba(76, 59, 53, 0.12)",
          overflow: "hidden", zIndex: 9999,
          animation: "fadeInUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
        }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${border}`, background: surface }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--brand-blue-bright), var(--brand-blue-dark))",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "var(--text-white)", flexShrink: 0
              }}>
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 700, color: textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name || "Admin"}
                </div>
                <div style={{ fontSize: "11px", color: "var(--brand-gold-bright)", fontWeight: 600 }}>
                  {user?.role || "Administrator"}
                </div>
              </div>
            </div>
          </div>
          {[{ icon: User, label: "My Profile Settings", action: handleProfile }, { icon: Settings, label: "System Config", action: handleProfile }].map(({ icon: Icon, label, action }) => (
            <button
              key={label}
              onClick={action}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 20px",
                background: "none", border: "none", cursor: "pointer", color: textMuted, fontSize: "13px",
                fontFamily: "var(--font-inter)", textAlign: "left", fontWeight: 500, transition: "background 0.25s",
                minHeight: "44px"
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--surface)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <Icon size={15} color={textMuted} /> {label}
            </button>
          ))}
          <div style={{ height: 1, background: border }} />
          <button
            onClick={handleLogout}
            style={{
              width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 20px",
              background: "none", border: "none", cursor: "pointer", color: "var(--brand-gold-dark)",
              fontSize: "13px", fontFamily: "var(--font-inter)", fontWeight: 700, transition: "background 0.25s",
              minHeight: "44px"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(147, 95, 4, 0.08)"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            <LogOut size={15} color="var(--brand-gold-dark)" /> Sign Out Securely
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @media (min-width: 768px) { .topbar-mobile { display: none !important; } .topbar-desktop { display: flex !important; } }
        @media (max-width: 767px) { .topbar-mobile { display: flex !important; } .topbar-desktop { display: none !important; } }
        @media (max-width: 1024px) { .topbar-search { display: none !important; } }
        @media (max-width: 900px) { .topbar-user-info { display: none !important; } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
}
