"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AuthProvider } from "@/contexts/auth-context";
import { Eye, EyeOff, ShieldCheck, ArrowLeft, Lock, User as UserIcon, Check, ChevronRight } from "lucide-react";
import Script from "next/script";

// TypeScript declaration for Google reCAPTCHA v3 global
declare global {
  interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? process.env.RECAPTCHA_SITE_KEY ?? "";

async function getCaptchaToken(): Promise<string> {
  if (!RECAPTCHA_SITE_KEY) {
    throw new Error("RECAPTCHA_SITE_KEY_MISSING");
  }
  if (typeof window === "undefined" || !window.grecaptcha) {
    throw new Error("RECAPTCHA_NOT_LOADED");
  }
  return Promise.race<string>([
    new Promise<string>((resolve, reject) => {
      window.grecaptcha.ready(async () => {
        try {
          const t = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action: "login" });
          resolve(t);
        } catch (err) {
          reject(err);
        }
      });
    }),
    new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error("RECAPTCHA_TIMEOUT")), 10000)
    ),
  ]);
}

// Reusable elegant vector brand logo
export function BrandLogo({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: "drop-shadow(0 4px 12px rgba(1, 32, 68, 0.15))" }}
    >
      <defs>
        <linearGradient id="logoGreen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#99BC0D" />
          <stop offset="100%" stopColor="#147115" />
        </linearGradient>
        <linearGradient id="logoGold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#D69B04" />
          <stop offset="100%" stopColor="#935F04" />
        </linearGradient>
        <linearGradient id="logoBlue" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0291C0" />
          <stop offset="100%" stopColor="#012044" />
        </linearGradient>
      </defs>
      <path
        d="M60 10 L100 30 L100 70 C100 95 80 112 60 118 C40 112 20 95 20 70 L20 30 Z"
        stroke="url(#logoBlue)"
        strokeWidth="6"
        strokeLinejoin="round"
        fill="none"
        opacity="0.15"
      />
      <path
        d="M25 45 C35 30, 55 35, 60 50 C65 65, 85 70, 95 55"
        stroke="url(#logoBlue)"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M30 75 C40 60, 58 62, 60 70 C62 78, 80 80, 90 65"
        stroke="url(#logoGold)"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="60" cy="60" r="12" fill="url(#logoGreen)" />
    </svg>
  );
}

function LoginForm() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loginError, setLoginError] = useState("");

  // 2FA state
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [twoFaToken, setTwoFaToken] = useState("");
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaLoading, setTwoFaLoading] = useState(false);
  const [twoFaError, setTwoFaError] = useState("");

  const { login, completeTwoFactor, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => {
      document.querySelectorAll('.grecaptcha-badge').forEach(el => el.remove());
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIdentifierError(""); setPasswordError(""); setLoginError("");
    let hasError = false;
    if (!identifier.trim()) { setIdentifierError("Please enter username, email or phone"); hasError = true; }
    if (!password) { setPasswordError("Please enter password"); hasError = true; }
    if (hasError) return;

    setLoading(true);

    let captchaToken = "";
    try {
      captchaToken = await getCaptchaToken();
    } catch (err: unknown) {
      console.warn("reCAPTCHA failed, proceeding without captcha:", err);
      captchaToken = "";
    }

    const result = await login(identifier, password, captchaToken);
    if (result.requiresTwoFactor && result.twoFactorToken) {
      setTwoFaToken(result.twoFactorToken);
      setStep("2fa");
      setLoading(false);
    } else if (result.success) {
      if ((window as any).MobileBridge) {
        (window as any).MobileBridge.postMessage('user_logged_in');
      }
      router.replace("/dashboard");
      return;
    } else {
      setLoginError("Invalid credentials. Please double-check and try again.");
      setLoading(false);
    }
  };

  const handle2faVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (twoFaCode.length !== 6) { setTwoFaError("Enter the 6-digit verification code"); return; }
    setTwoFaLoading(true);
    setTwoFaError("");
    const ok = await completeTwoFactor(twoFaCode, twoFaToken);
    if (ok) {
      if ((window as any).MobileBridge) {
        (window as any).MobileBridge.postMessage('user_logged_in');
      }
      router.replace("/dashboard");
      return;
    } else {
      setTwoFaError("Invalid code. Please try again (codes refresh every 30 seconds).");
    }
    setTwoFaLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      background: "var(--bg)",
      fontFamily: "var(--font-inter), sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Load reCAPTCHA v3 script */}
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      )}

      {/* ── LEFT PANEL: Prestige Brand Split ───────────────────────────────── */}
      <div className="login-left-brand" style={{
        flex: "1 1 50%",
        background: "linear-gradient(135deg, #011529 0%, #012044 50%, #013E67 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "60px 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Abstract futuristic background decorations */}
        <div style={{
          position: "absolute", width: "500px", height: "500px",
          background: "radial-gradient(circle, rgba(2, 145, 192, 0.15) 0%, rgba(255, 255, 255, 0) 70%)",
          top: "-150px", left: "-150px", zIndex: 0, pointerEvents: "none"
        }} />
        <div style={{
          position: "absolute", width: "600px", height: "600px",
          background: "radial-gradient(circle, rgba(153, 188, 13, 0.08) 0%, rgba(255, 255, 255, 0) 70%)",
          bottom: "-200px", right: "-100px", zIndex: 0, pointerEvents: "none"
        }} />

        {/* Brand logo top-left */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, zIndex: 1 }}>
          <BrandLogo size={44} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "18px", fontWeight: 800, color: "white", letterSpacing: "-0.5px" }}>Ferixcomerz</span>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "var(--brand-gold-bright)", letterSpacing: "1.5px", textTransform: "uppercase" }}>Enterprise Console</span>
          </div>
        </div>

        {/* Giant premium statement */}
        <div style={{ zIndex: 1, margin: "80px 0" }}>
          <span style={{
            fontSize: "12px", fontWeight: 700, color: "var(--brand-gold-bright)",
            letterSpacing: "3px", textTransform: "uppercase", display: "block", marginBottom: "16px"
          }}>
            Unified Global Trade Gateway
          </span>
          <h1 style={{
            fontSize: "48px", fontWeight: 800, color: "white",
            lineHeight: 1.15, letterSpacing: "-1.5px", marginBottom: "24px"
          }}>
            Control every page, every tab, <span style={{
              background: "linear-gradient(135deg, var(--brand-blue-bright) 0%, var(--brand-green-bright) 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
            }}>seamlessly.</span>
          </h1>
          <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6, maxWidth: "480px" }}>
            Deploy custom catalogs, balance wholesale contracts, monitor live ledger compliance, and scale transactions across global regions securely.
          </p>
        </div>

        {/* Footer info at bottom-left */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--brand-green-bright)", boxShadow: "0 0 8px var(--brand-green-bright)" }} />
            <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>Live Operations Online</span>
          </div>
          <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.4)" }}>|</span>
          <span style={{ fontSize: "12.5px", color: "rgba(255,255,255,0.6)" }}>System v3.8.4</span>
        </div>
      </div>

      {/* ── RIGHT PANEL: Gorgeous Interactive Form ───────────────────────────── */}
      <div style={{
        flex: "1 1 50%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "60px 40px",
        position: "relative"
      }} className="login-right-form">

        {/* Glassmorphic floating card */}
        <div style={{
          width: "100%",
          maxWidth: "440px",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(241, 223, 217, 0.6)",
          borderRadius: "24px",
          padding: "48px 40px",
          boxShadow: "0 20px 40px rgba(76, 59, 53, 0.04)"
        }}>
          {/* Header of card (shown on mobile, hidden on desktop if left brand panel covers it) */}
          <div className="mobile-brand-header" style={{ display: "none", flexDirection: "column", alignItems: "center", marginBottom: "32px" }}>
            <BrandLogo size={56} />
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--brand-blue-dark)", letterSpacing: "-0.5px", marginTop: "12px", marginBottom: "4px" }}>
              Ferixcomerz
            </h2>
            <span style={{ fontSize: "9px", fontWeight: 700, color: "var(--brand-gold-bright)", letterSpacing: "2px", textTransform: "uppercase" }}>
              Secure Admin Console
            </span>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-main)", letterSpacing: "-0.5px", margin: 0 }}>
              Authorized Sign In
            </h2>
            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", marginTop: "6px", margin: 0 }}>
              Provide your enterprise credentials to audit and manage records.
            </p>
          </div>

          {/* ── STEP 1: Credentials ─────────────────────────────────────────────── */}
          {step === "credentials" && (
            <form onSubmit={handleSubmit} style={{ width: "100%" }} noValidate>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Username, Email or Phone
                </label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)", display: "flex", alignItems: "center" }}>
                    <UserIcon size={18} />
                  </span>
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => { setIdentifier(e.target.value); setIdentifierError(""); setLoginError(""); }}
                    placeholder="admin@ferixcomerz.com"
                    autoComplete="username"
                    style={{
                      width: "100%", padding: "14px 16px 14px 44px", fontSize: "14px",
                      background: "#FFFFFF", border: "1.5px solid var(--border)", borderRadius: "12px",
                      outline: "none", color: "var(--text-main)", transition: "all 0.2s",
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.01)"
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = "var(--primary)";
                      e.target.style.boxShadow = "0 0 0 4px rgba(2, 145, 192, 0.12)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "var(--border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                </div>
                {identifierError && <p style={{ color: "var(--brand-gold-dark)", fontSize: "12.5px", marginTop: "6px", fontWeight: 500 }}>{identifierError}</p>}
              </div>

              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Password
                  </label>
                </div>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-light)", display: "flex", alignItems: "center" }}>
                    <Lock size={18} />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setPasswordError(""); setLoginError(""); }}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    style={{
                      width: "100%", padding: "14px 48px 14px 44px", fontSize: "14px",
                      background: "#FFFFFF", border: "1.5px solid var(--border)", borderRadius: "12px",
                      outline: "none", color: "var(--text-main)", transition: "all 0.2s",
                      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.01)"
                    }}
                    onFocus={e => {
                      e.target.style.borderColor = "var(--primary)";
                      e.target.style.boxShadow = "0 0 0 4px rgba(2, 145, 192, 0.12)";
                    }}
                    onBlur={e => {
                      e.target.style.borderColor = "var(--border)";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    style={{
                      position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)",
                      background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)",
                      display: "flex", alignItems: "center", padding: "4px"
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {passwordError && <p style={{ color: "var(--brand-gold-dark)", fontSize: "12.5px", marginTop: "6px", fontWeight: 500 }}>{passwordError}</p>}
              </div>

              {loginError && (
                <div style={{
                  background: "rgba(147, 95, 4, 0.08)",
                  border: "1px solid rgba(147, 95, 4, 0.15)",
                  borderRadius: "10px", padding: "12px 16px", marginBottom: "20px",
                  color: "var(--brand-gold-dark)", fontSize: "13px", fontWeight: 600, textAlign: "center"
                }}>
                  {loginError}
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "13px", color: "var(--text-secondary)", userSelect: "none" }}>
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    style={{
                      width: "16px", height: "16px", cursor: "pointer",
                      accentColor: "var(--primary)", borderRadius: "4px"
                    }}
                  />
                  Remember me
                </label>
                <a href="#" onClick={e => e.preventDefault()} style={{ color: "var(--primary)", fontSize: "13px", fontWeight: 700, textDecoration: "none" }}>
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%", padding: "14px",
                  background: "linear-gradient(135deg, var(--brand-blue-medium) 0%, var(--brand-blue-dark) 100%)",
                  border: "none", borderRadius: "12px", color: "white", fontSize: "15px", fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.2px",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                  boxShadow: "0 6px 20px rgba(2, 145, 192, 0.3)", transition: "all 0.25s"
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-1.5px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(2, 145, 192, 0.45)";
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "none";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(2, 145, 192, 0.3)";
                }}
              >
                {loading ? (
                  <>
                    <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    Verifying Credentials...
                  </>
                ) : (
                  <>
                    Access Dashboard Console <ChevronRight size={16} />
                  </>
                )}
              </button>

              <div style={{ fontSize: "11px", color: "var(--text-muted)", textAlign: "center", marginTop: "28px", lineHeight: 1.5 }}>
                Protected by Google reCAPTCHA v3.{" "}
                <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>Privacy</a>
                {" & "}
                <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>Terms</a>
              </div>
            </form>
          )}

          {/* ── STEP 2: 2FA Code Entry ────────────────────────────────────────────── */}
          {step === "2fa" && (
            <form onSubmit={handle2faVerify} style={{ width: "100%", textAlign: "center" }}>
              <div style={{
                width: "60px", height: "60px", borderRadius: "50%",
                background: "rgba(2, 145, 192, 0.08)", border: "2px solid var(--primary)",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px"
              }}>
                <ShieldCheck size={26} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-main)", margin: "0 0 8px" }}>Two-Factor Security</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "0 0 24px", lineHeight: 1.6 }}>
                Enter the 6-digit verification code from your authenticator application.
              </p>

              <input
                value={twoFaCode}
                onChange={e => { setTwoFaCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setTwoFaError(""); }}
                placeholder="000 000"
                maxLength={6}
                autoFocus
                style={{
                  width: "100%", fontSize: "26px", fontFamily: "monospace", letterSpacing: "0.2em",
                  textAlign: "center", padding: "14px", background: "#FFFFFF", border: "1.5px solid var(--border)",
                  borderRadius: "12px", color: "var(--text-main)", outline: "none", transition: "all 0.2s"
                }}
                onFocus={e => {
                  e.target.style.borderColor = "var(--primary)";
                  e.target.style.boxShadow = "0 0 0 4px rgba(2, 145, 192, 0.12)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
              {twoFaError && <p style={{ color: "var(--brand-gold-dark)", fontSize: "13px", marginTop: "8px", fontWeight: 500 }}>{twoFaError}</p>}

              <button
                type="submit"
                disabled={twoFaLoading || twoFaCode.length !== 6}
                style={{
                  width: "100%", padding: "14px",
                  background: (twoFaCode.length === 6 && !twoFaLoading) ? "linear-gradient(135deg, var(--brand-blue-medium) 0%, var(--brand-blue-dark) 100%)" : "var(--btn-disabled)",
                  border: "none", borderRadius: "12px", color: "white", fontSize: "14px", fontWeight: 700,
                  cursor: twoFaCode.length === 6 ? "pointer" : "not-allowed",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                  marginTop: "16px", boxShadow: "0 4px 14px rgba(1, 62, 103, 0.15)", transition: "all 0.2s"
                }}
              >
                {twoFaLoading ? (
                  <>
                    <div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    Verifying...
                  </>
                ) : "Verify & Sign In"}
              </button>

              <button
                type="button"
                onClick={() => { setStep("credentials"); setTwoFaCode(""); setTwoFaError(""); }}
                style={{
                  marginTop: "18px", background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-muted)", fontSize: "13px", fontWeight: 600,
                  display: "inline-flex", alignItems: "center", gap: "6px"
                }}
              >
                <ArrowLeft size={14} /> Back to credentials
              </button>
            </form>
          )}
        </div>

        {/* Floating copyright / version micro footer */}
        <div style={{ marginTop: "32px", fontSize: "12px", color: "var(--text-muted)" }}>
          &copy; {new Date().getFullYear()} Ferixcomerz Inc. Secure Ledger Network.
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: var(--text-light); }

        @media (max-width: 991px) {
          .login-left-brand {
            display: none !important;
          }
          .login-right-form {
            flex: 1 1 100% !important;
            padding: 24px 16px !important;
            background: radial-gradient(circle at 10% 20%, rgba(2, 145, 192, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(153, 188, 13, 0.05) 0%, transparent 40%), var(--bg);
          }
          .mobile-brand-header {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginForm />
    </AuthProvider>
  );
}
