"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { AuthProvider } from "@/contexts/auth-context";
import { Eye, EyeOff, ShieldCheck, ArrowLeft, Lock, User as UserIcon, ChevronRight } from "lucide-react";
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
      alignItems: "center",
      justifyContent: "center",
      background: "radial-gradient(circle at 0% 0%, #012044 0%, #011529 50%, #010A14 100%)",
      fontFamily: "var(--font-inter), sans-serif",
      position: "relative",
      overflow: "hidden",
      padding: "16px"
    }}>
      {/* Load reCAPTCHA v3 script */}
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      )}

      {/* Floating Gorgeous Brand Light Nodes */}
      <div style={{
        position: "absolute", width: "min(45vw, 300px)", height: "min(45vw, 300px)",
        background: "radial-gradient(circle, rgba(153, 188, 13, 0.12) 0%, rgba(255, 255, 255, 0) 70%)",
        top: "-15%", left: "-10%", zIndex: 0, pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", width: "min(50vw, 350px)", height: "min(50vw, 350px)",
        background: "radial-gradient(circle, rgba(2, 145, 192, 0.15) 0%, rgba(255, 255, 255, 0) 70%)",
        bottom: "-20%", right: "-10%", zIndex: 0, pointerEvents: "none"
      }} />
      <div style={{
        position: "absolute", width: "min(35vw, 250px)", height: "min(35vw, 250px)",
        background: "radial-gradient(circle, rgba(214, 155, 4, 0.08) 0%, rgba(255, 255, 255, 0) 70%)",
        bottom: "30%", left: "40%", zIndex: 0, pointerEvents: "none"
      }} />

      {/* Glassmorphic central luxury card */}
      <div style={{
        width: "100%",
        maxWidth: "480px",
        background: "rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "28px",
        padding: "clamp(32px, 8vw, 52px)",
        boxShadow: "0 30px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
        zIndex: 1,
        transition: "all 0.3s ease",
        color: "#FFFFFF"
      }}>
        {/* Brand header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "clamp(24px, 6vw, 40px)" }}>
          <div style={{ transform: "scale(1.1)", marginBottom: "clamp(12px, 3vw, 16px)" }}>
            <BrandLogo size={64} />
          </div>
          <h2 style={{ fontSize: "clamp(22px, 5vw, 28px)", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.75px", margin: 0 }}>
            Ferixcomerz
          </h2>
          <span style={{ fontSize: "clamp(9px, 2vw, 10px)", fontWeight: 700, color: "var(--brand-gold-bright)", letterSpacing: "2.5px", textTransform: "uppercase", marginTop: "6px" }}>
            Enterprise Console
          </span>
        </div>

        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.3px", margin: 0 }}>
            Authorized Sign In
          </h3>
          <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.6)", marginTop: "8px", margin: 0, lineHeight: 1.5 }}>
            Provide secure system credentials to access the administrative panel.
          </p>
        </div>

        {/* ── STEP 1: Credentials ─────────────────────────────────────────────── */}
        {step === "credentials" && (
          <form onSubmit={handleSubmit} style={{ width: "100%" }} noValidate>
            <div style={{ marginBottom: "22px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.7)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "1px" }}>
                Username, Email or Phone
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center" }}>
                  <UserIcon size={18} />
                </span>
                <input
                  type="text"
                  value={identifier}
                  onChange={e => { setIdentifier(e.target.value); setIdentifierError(""); setLoginError(""); }}
                  placeholder="admin@ferixcomerz.com"
                  autoComplete="username"
                  style={{
                    width: "100%", padding: "clamp(14px, 4vw, 15px) clamp(14px, 4vw, 48px)", fontSize: "clamp(14px, 3vw, 14.5px)",
                    background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "14px",
                    outline: "none", color: "#FFFFFF", transition: "all 0.25s",
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)"
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "var(--primary)";
                    e.target.style.background = "rgba(255, 255, 255, 0.08)";
                    e.target.style.boxShadow = "0 0 0 4px rgba(2, 145, 192, 0.25)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
                    e.target.style.background = "rgba(255, 255, 255, 0.05)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              {identifierError && <p style={{ color: "var(--brand-gold-bright)", fontSize: "12.5px", marginTop: "6px", fontWeight: 500 }}>{identifierError}</p>}
            </div>

            <div style={{ marginBottom: "22px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Password
                </label>
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center" }}>
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setPasswordError(""); setLoginError(""); }}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  style={{
                    width: "100%", padding: "clamp(14px, 4vw, 15px) clamp(14px, 4vw, 52px)", fontSize: "clamp(14px, 3vw, 14.5px)",
                    background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.15)", borderRadius: "14px",
                    outline: "none", color: "#FFFFFF", transition: "all 0.25s",
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)"
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = "var(--primary)";
                    e.target.style.background = "rgba(255, 255, 255, 0.08)";
                    e.target.style.boxShadow = "0 0 0 4px rgba(2, 145, 192, 0.25)";
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
                    e.target.style.background = "rgba(255, 255, 255, 0.05)";
                    e.target.style.boxShadow = "none";
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: "absolute", right: "16px", top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.4)",
                    display: "flex", alignItems: "center", padding: "4px"
                  }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && <p style={{ color: "var(--brand-gold-bright)", fontSize: "12.5px", marginTop: "6px", fontWeight: 500 }}>{passwordError}</p>}
            </div>

            {loginError && (
              <div style={{
                background: "rgba(214, 155, 4, 0.15)",
                border: "1px solid rgba(214, 155, 4, 0.3)",
                borderRadius: "12px", padding: "12px 16px", marginBottom: "22px",
                color: "var(--brand-gold-bright)", fontSize: "13px", fontWeight: 600, textAlign: "center"
              }}>
                {loginError}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px", color: "rgba(255,255,255,0.75)", userSelect: "none" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{
                    width: "17px", height: "17px", cursor: "pointer",
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
                width: "100%", padding: "clamp(14px, 4vw, 16px)",
                background: "linear-gradient(135deg, var(--brand-blue-bright) 0%, var(--brand-blue-medium) 100%)",
                border: "none", borderRadius: "14px", color: "white", fontSize: "clamp(14px, 3vw, 15px)", fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer", letterSpacing: "0.2px",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                boxShadow: "0 6px 20px rgba(2, 145, 192, 0.35)", transition: "all 0.25s"
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-1.5px)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(2, 145, 192, 0.5)";
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(2, 145, 192, 0.35)";
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  Access Dashboard Console <ChevronRight size={16} />
                </>
              )}
            </button>

            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", textAlign: "center", marginTop: "32px", lineHeight: 1.5 }}>
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
              width: "64px", height: "64px", borderRadius: "50%",
              background: "rgba(2, 145, 192, 0.15)", border: "2px solid var(--primary)",
              display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px"
            }}>
              <ShieldCheck size={28} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700, color: "#FFFFFF", margin: "0 0 8px" }}>Two-Factor Security</h3>
            <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,0.6)", margin: "0 0 28px", lineHeight: 1.6 }}>
              Enter the 6-digit verification code from your authenticator application.
            </p>

            <input
              value={twoFaCode}
              onChange={e => { setTwoFaCode(e.target.value.replace(/\D/g, "").slice(0, 6)); setTwoFaError(""); }}
              placeholder="000 000"
              maxLength={6}
              autoFocus
              style={{
                width: "100%", fontSize: "clamp(20px, 5vw, 28px)", fontFamily: "monospace", letterSpacing: "0.2em",
                textAlign: "center", padding: "clamp(12px, 3vw, 15px)", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.15)",
                borderRadius: "14px", color: "#FFFFFF", outline: "none", transition: "all 0.25s"
              }}
              onFocus={e => {
                e.target.style.borderColor = "var(--primary)";
                e.target.style.background = "rgba(255, 255, 255, 0.08)";
                e.target.style.boxShadow = "0 0 0 4px rgba(2, 145, 192, 0.25)";
              }}
              onBlur={e => {
                e.target.style.borderColor = "rgba(255, 255, 255, 0.15)";
                e.target.style.background = "rgba(255, 255, 255, 0.05)";
                e.target.style.boxShadow = "none";
              }}
            />
            {twoFaError && <p style={{ color: "var(--brand-gold-bright)", fontSize: "13px", marginTop: "8px", fontWeight: 500 }}>{twoFaError}</p>}

            <button
              type="submit"
              disabled={twoFaLoading || twoFaCode.length !== 6}
              style={{
                width: "100%", padding: "clamp(14px, 4vw, 16px)",
                background: (twoFaCode.length === 6 && !twoFaLoading) ? "linear-gradient(135deg, var(--brand-blue-bright) 0%, var(--brand-blue-medium) 100%)" : "var(--btn-disabled)",
                border: "none", borderRadius: "14px", color: "white", fontSize: "clamp(14px, 3vw, 15px)", fontWeight: 700,
                cursor: twoFaCode.length === 6 ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
                marginTop: "20px", boxShadow: "0 6px 20px rgba(1, 62, 103, 0.2)", transition: "all 0.2s"
              }}
            >
              {twoFaLoading ? (
                <>
                  <div style={{ width: "18px", height: "18px", border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  Verifying...
                </>
              ) : "Verify & Sign In"}
            </button>

            <button
              type="button"
              onClick={() => { setStep("credentials"); setTwoFaCode(""); setTwoFaError(""); }}
              style={{
                marginTop: "22px", background: "none", border: "none", cursor: "pointer",
                color: "rgba(255,255,255,0.6)", fontSize: "13px", fontWeight: 600,
                display: "inline-flex", alignItems: "center", gap: "6px"
              }}
            >
              <ArrowLeft size={14} /> Back to credentials
            </button>
          </form>
        )}
      </div>

      {/* Floating copyright footer */}
      <div style={{ position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)", fontSize: "12px", color: "rgba(255,255,255,0.4)", zIndex: 1, whiteSpace: "nowrap" }}>
        &copy; {new Date().getFullYear()} Ferixcomerz Inc. Secure Ledger Network.
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder { color: rgba(255, 255, 255, 0.3); }
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
