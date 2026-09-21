import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// See src/app/api/onboarding/submit-email/route.ts — same reason this
// proxies through the Next.js server instead of the browser calling
// onboarding-service directly. Lives at /onboarding/contract (not under
// /api) so the emailed link matches the same {PORTAL_BASE_URL}/<step>
// pattern as /onboarding/start and /onboarding/confirm — see
// onboarding-service's provisioning.Service.issueContractDownloadLink.
const { ONBOARDING_SERVICE_URL } = process.env;

// A GET that streams the file straight through, not a page: the emailed
// link is meant to be clicked and downloaded directly, with no
// confirmation step in between — unlike the confirm-email link, a mail
// scanner prefetching this one is harmless (it never consumes the token,
// see onboarding-service's models.PurposeContractDownload).
export async function GET(request: NextRequest) {
  if (!ONBOARDING_SERVICE_URL) {
    console.error("ONBOARDING_SERVICE_URL is not configured");
    return NextResponse.json(
      { error: "Onboarding is not configured" },
      { status: 500 },
    );
  }

  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "token is required" }, { status: 400 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(
      `${ONBOARDING_SERVICE_URL}/portal/contract?token=${encodeURIComponent(token)}`,
    );
  } catch (error) {
    console.error("Error fetching onboarding contract:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }

  if (!upstream.ok) {
    let data: unknown;
    try {
      data = await upstream.json();
    } catch {
      data = { error: await upstream.text() };
    }
    return NextResponse.json(data as object, { status: upstream.status });
  }

  const headers = new Headers();
  const contentType = upstream.headers.get("Content-Type");
  const contentDisposition = upstream.headers.get("Content-Disposition");
  headers.set("Content-Type", contentType || "application/octet-stream");
  if (contentDisposition) {
    headers.set("Content-Disposition", contentDisposition);
  }

  return new Response(upstream.body, { status: 200, headers });
}
