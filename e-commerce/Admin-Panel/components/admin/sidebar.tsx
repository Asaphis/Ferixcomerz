"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, ShoppingCart, Tag, Award, Star, Package,
  Truck, CreditCard, Wallet, MapPin, DollarSign, Wrench, FileText,
  Layout, Bell, BarChart3, Settings, X,
  LogOut, User, ChevronUp,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import BrandLogo from "./logo";

const navItems = [
  { label: "Dashboard",        icon: LayoutDashboard, href: "/dashboard"      },
  { label: "Users & Roles",    icon: Users,           href: "/users"          },
  { label: "Orders",           icon: ShoppingCart,    href: "/orders"         },
  { label: "Categories",       icon: Tag,             href: "/categories"     },
  { label: "Brands",           icon: Award,           href: "/brands"         },
  { label: "Reviews",          icon: Star,            href: "/reviews"        },
  { label: "Products",         icon: Package,         href: "/products"       },
  { label: "Wholesale",        icon: Truck,           href: "/wholesale"      },
  { label: "Credit System",    icon: CreditCard,      href: "/credit-system"  },
  { label: "Wallet & Payments",icon: Wallet,          href: "/wallet-payments"},
  { label: "Locations",        icon: MapPin,          href: "/locations"      },
  { label: "Currencies",       icon: DollarSign,      href: "/currencies"     },
  { label: "Shipping",         icon: Truck,           href: "/shipping"       },
  { label: "Services",         icon: Wrench,          href: "/services"       },
  { label: "Invoicing",        icon: FileText,        href: "/invoicing"      },
  { label: "CMS & Pages",      icon: Layout,          href: "/cms-pages"      },
  { label: "Notifications",    icon: Bell,            href: "/notifications"  },
  { label: "Reports",          icon: BarChart3,       href: "/reports"        },
  { label: "Settings",         icon: Settings,        href: "/settings"       },
];

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showUserPopup, setShowUserPopup] = useState(false);

  // Luxury theme mapping
  const bgGradient = "linear-gradient(180deg, #012044 0%, #013E67 100%)";
  const border     = "rgba(241, 223, 217, 0.12)";
  const textMain   = "rgba(255, 255, 255, 0.95)";
  const textMuted  = "rgba(255, 255, 255, 0.65)";
  const activeBg   = "linear-gradient(90deg, rgba(2, 145, 192, 0.2) 0%, rgba(2, 145, 192, 0.05) 100%)";
  const activeColor = "#0291C0"; // Cyan-blue active indicator

  const handleLogout = () => {
    setShowUserPopup(false);
    onMobileClose();
    logout();
  };

  const handleProfile = () => {
    setShowUserPopup(false);
    onMobileClose();
    router.push("/settings");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        width: collapsed ? 60 : 260,
        transition: "width 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        zIndex: 30, overflow: "hidden", display: "none",
      }} className="sidebar-desktop">
        <div style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          background: bgGradient,
          borderRight: `1px solid ${border}`,
          overflow: "hidden"
        }}>
          {/* Brand Header */}
          <div style={{
            padding: collapsed ? "0 12px" : "0 24px",
            height: 72,
            borderBottom: `1px solid ${border}`,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "space-between",
            flexShrink: 0,
            background: "rgba(1, 32, 68, 0.4)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <BrandLogo size={collapsed ? 30 : 36} />
              {!collapsed && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{
                    fontSize: "16px",
                    fontWeight: 800,
                    color: "white",
                    letterSpacing: "-0.4px",
                    lineHeight: 1.2
                  }}>
                    Ferixcomerz
                  </span>
                  <span style={{
                    fontSize: "9px",
                    fontWeight: 700,
                    color: "var(--brand-gold-bright)",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    opacity: 0.9
                  }}>
                    Admin Portal
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation List */}
          <div style={{
            flex: 1,
            overflowY: "auto",
            padding: "16px 12px",
            display: "flex",
            flexDirection: "column",
            gap: "4px"
          }} className="sidebar-scroll">
            {navItems.map(({ label, icon: Icon, href }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  style={{ textDecoration: "none", display: "block" }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: collapsed ? 0 : 12,
                    padding: collapsed ? "12px 0" : "12px 14px",
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderRadius: "10px",
                    background: active ? activeBg : "transparent",
                    color: active ? "white" : textMuted,
                    cursor: "pointer",
                    transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                    border: active ? "1px solid rgba(2, 145, 192, 0.25)" : "1px solid transparent",
                    position: "relative",
                    minHeight: collapsed ? "44px" : "auto"
                  }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                        e.currentTarget.style.color = "white";
                        e.currentTarget.style.transform = "translateX(2px)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = textMuted;
                        e.currentTarget.style.transform = "translateX(0)";
                      }
                    }}
                  >
                    <Icon size={18} style={{
                      flexShrink: 0,
                      color: active ? activeColor : "inherit",
                      transition: "color 0.25s"
                    }} />
                    {!collapsed && (
                      <span style={{
                        fontSize: "13px",
                        fontWeight: active ? 600 : 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1
                      }}>
                        {label}
                      </span>
                    )}
                    {active && !collapsed && (
                      <div style={{
                        width: 4,
                        height: 16,
                        background: "var(--brand-gold-bright)",
                        borderRadius: 2,
                        flexShrink: 0,
                        boxShadow: "0 0 8px var(--brand-gold-bright)"
                      }} />
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Bottom Profile and Signout Trigger */}
          {user && (
            <div style={{ position: "relative", flexShrink: 0, borderTop: `1px solid ${border}`, background: "rgba(1, 32, 68, 0.3)" }}>
              {showUserPopup && !collapsed && (
                <div style={{
                  position: "absolute", bottom: "100%", left: 12, right: 12,
                  background: "rgba(1, 32, 68, 0.95)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: `1px solid ${border}`,
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 -8px 24px rgba(0,0,0,0.4)",
                  marginBottom: 8,
                  zIndex: 99,
                  animation: "fadeInUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
                }}>
                  <button
                    onClick={handleProfile}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 16px", background: "none", border: "none",
                      cursor: "pointer", color: "white", fontSize: "13px", fontWeight: 500,
                      fontFamily: "var(--font-inter)", textAlign: "left",
                      minHeight: "44px"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    <User size={15} color="var(--brand-blue-bright)" /> My Profile Settings
                  </button>
                  <div style={{ height: 1, background: border }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", gap: 10,
                      padding: "12px 16px", background: "none", border: "none",
                      cursor: "pointer", color: "var(--brand-gold-bright)", fontSize: "13px", fontWeight: 600,
                      fontFamily: "var(--font-inter)", textAlign: "left",
                      minHeight: "44px"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(214, 155, 4, 0.12)"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    <LogOut size={15} color="var(--brand-gold-bright)" /> Sign Out Securely
                  </button>
                </div>
              )}

              <div
                onClick={() => setShowUserPopup(v => !v)}
                style={{
                  padding: collapsed ? "16px 0" : "14px 20px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "space-between",
                  gap: 12,
                  background: showUserPopup ? "rgba(255,255,255,0.04)" : "transparent",
                  transition: "background 0.25s",
                  minHeight: collapsed ? "72px" : "auto"
                }}
                onMouseEnter={e => { if (!showUserPopup) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                onMouseLeave={e => { if (!showUserPopup) e.currentTarget.style.background = "transparent"; }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: "linear-gradient(135deg, var(--brand-blue-bright), var(--brand-green-bright))",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 700, color: "white", flexShrink: 0,
                    boxShadow: "0 2px 8px rgba(2, 145, 192, 0.4)"
                  }}>
                    {user.name?.[0]?.toUpperCase() || "A"}
                  </div>
                  {!collapsed && (
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: "13px", fontWeight: 600, color: textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.name}
                      </div>
                      <div style={{ fontSize: "10.5px", color: "var(--brand-gold-bright)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        {user.role}
                      </div>
                    </div>
                  )}
                </div>
                {!collapsed && (
                  <ChevronUp size={16} color="white" style={{
                    transform: showUserPopup ? "rotate(0deg)" : "rotate(180deg)",
                    transition: "transform 0.25s",
                    flexShrink: 0,
                    opacity: 0.8
                  }} />
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex" }}>
          <div 
            style={{ 
              position: "absolute", 
              inset: 0, 
              background: "var(--overlay)", 
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              animation: "fadeIn 0.2s ease"
            }} 
            onClick={onMobileClose} 
          />
          <aside style={{ 
            position: "relative", 
            width: "100%", 
            maxWidth: "320px",
            zIndex: 201, 
            animation: "slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            maxHeight: "100vh",
            overflow: "hidden"
          }}>
            <div style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: "100%",
              background: bgGradient,
              borderRight: `1px solid ${border}`,
              overflow: "hidden"
            }}>
              {/* Brand Header */}
              <div style={{
                padding: "0 20px",
                height: 64,
                borderBottom: `1px solid ${border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexShrink: 0,
                background: "rgba(1, 32, 68, 0.4)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <BrandLogo size={32} />
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{
                      fontSize: "15px",
                      fontWeight: 800,
                      color: "white",
                      letterSpacing: "-0.4px",
                      lineHeight: 1.2
                    }}>
                      Ferixcomerz
                    </span>
                    <span style={{
                      fontSize: "8px",
                      fontWeight: 700,
                      color: "var(--brand-gold-bright)",
                      letterSpacing: "1.5px",
                      textTransform: "uppercase",
                      opacity: 0.9
                    }}>
                      Admin Portal
                    </span>
                  </div>
                </div>
                <button
                  onClick={onMobileClose}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "none",
                    cursor: "pointer",
                    color: textMuted,
                    padding: 8,
                    display: "flex",
                    alignItems: "center",
                    borderRadius: "8px",
                    transition: "all 0.2s",
                    minWidth: "40px",
                    minHeight: "40px",
                    justifyContent: "center"
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Navigation List */}
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 12px",
                display: "flex",
                flexDirection: "column",
                gap: "4px"
              }} className="sidebar-scroll">
                {navItems.map(({ label, icon: Icon, href }) => {
                  const active = pathname === href || pathname.startsWith(href + "/");
                  return (
                    <Link
                      key={href}
                      href={href}
                      style={{ textDecoration: "none", display: "block" }}
                      onClick={onMobileClose}
                    >
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "12px 14px",
                        justifyContent: "flex-start",
                        borderRadius: "10px",
                        background: active ? activeBg : "transparent",
                        color: active ? "white" : textMuted,
                        cursor: "pointer",
                        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                        border: active ? "1px solid rgba(2, 145, 192, 0.25)" : "1px solid transparent",
                        position: "relative",
                        minHeight: "48px"
                      }}
                        onMouseEnter={e => {
                          if (!active) {
                            e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                            e.currentTarget.style.color = "white";
                          }
                        }}
                        onMouseLeave={e => {
                          if (!active) {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = textMuted;
                          }
                        }}
                      >
                        <Icon size={18} style={{
                          flexShrink: 0,
                          color: active ? activeColor : "inherit",
                          transition: "color 0.25s"
                        }} />
                        <span style={{
                          fontSize: "14px",
                          fontWeight: active ? 600 : 500,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1
                        }}>
                          {label}
                        </span>
                        {active && (
                          <div style={{
                            width: 4,
                            height: 16,
                            background: "var(--brand-gold-bright)",
                            borderRadius: 2,
                            flexShrink: 0,
                            boxShadow: "0 0 8px var(--brand-gold-bright)"
                          }} />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Bottom Profile and Signout Trigger */}
              {user && (
                <div style={{ position: "relative", flexShrink: 0, borderTop: `1px solid ${border}`, background: "rgba(1, 32, 68, 0.3)" }}>
                  <div
                    onClick={() => setShowUserPopup(v => !v)}
                    style={{
                      padding: "14px 20px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      background: showUserPopup ? "rgba(255,255,255,0.04)" : "transparent",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={e => { if (!showUserPopup) e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={e => { if (!showUserPopup) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: "linear-gradient(135deg, var(--brand-blue-bright), var(--brand-green-bright))",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "13px", fontWeight: 700, color: "white", flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(2, 145, 192, 0.4)"
                      }}>
                        {user.name?.[0]?.toUpperCase() || "A"}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {user.name}
                        </div>
                        <div style={{ fontSize: "10.5px", color: "var(--brand-gold-bright)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          {user.role}
                        </div>
                      </div>
                    </div>
                    <ChevronUp size={16} color="white" style={{
                      transform: showUserPopup ? "rotate(0deg)" : "rotate(180deg)",
                      transition: "transform 0.25s",
                      flexShrink: 0,
                      opacity: 0.8
                    }} />
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

      <style>{`
        @media (max-width: 767px) { .sidebar-desktop { display: none !important; } }
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 999px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
      `}</style>
    </>
  );
}
