import { NextRequest, NextResponse } from "next/server";
import { getBackendUrl } from "@/lib/bff-utils";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("ferixcomerz_refresh")?.value;

  if (refreshToken) {
    fetch(`${getBackendUrl()}/api/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => {});
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set("ferixcomerz_token", "", { maxAge: 0, path: "/" });
  res.cookies.set("ferixcomerz_refresh", "", { maxAge: 0, path: "/" });
  res.cookies.set("ferixcomerz_admin_token", "", { maxAge: 0, path: "/" });
  return res;
}
