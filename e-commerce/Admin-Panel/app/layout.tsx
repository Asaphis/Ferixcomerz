import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import GlobalGuard from "@/components/admin/global-guard";

export const metadata: Metadata = {
  title: "Ferixcomerz Admin Portal",
  description: "Ferixcomerz - Admin Dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <GlobalGuard>
          {children}
        </GlobalGuard>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "var(--card)",
              color: "var(--text-main)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
              fontSize: "14px",
              maxWidth: "calc(100vw - 32px)",
            },
          }}
        />
      </body>
    </html>
  );
}

