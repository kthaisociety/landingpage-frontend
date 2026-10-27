// The browser's runtime config, as a script: the root layout loads it before
// any app code, and src/config/env.ts reads window.RUNTIME_ENV. This is what lets
// one image run in staging and production. Public values only: anyone can
// read this.
export const dynamic = "force-dynamic";

export function GET() {
  const env = { BACKEND_URL: process.env.BACKEND_URL ?? "" };
  return new Response(`window.RUNTIME_ENV=${JSON.stringify(env)};\n`, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
