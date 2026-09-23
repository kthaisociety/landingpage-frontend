"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import { useAuth } from "@/lib/providers/auth-provider/authProvider";
import { API_URL } from "@/config";

function GoogleLoginButton({
  onError,
}: {
  onError: (message: string | null) => void;
}) {
  const [pending, setPending] = useState(false);

  const login = async () => {
    setPending(true);
    onError(null);
    try {
      const response = await fetch(`${API_URL}/auth/google`, {
        method: "GET",
        credentials: "include",
      });
      const data = response.ok ? await response.json() : null;

      if (data?.url) {
        // Leave the button disabled while the browser navigates to Google.
        window.location.href = data.url;
        return;
      }

      onError(
        response.status === 429
          ? "Too many sign-in attempts from your network right now. Please wait a minute and try again."
          : "Couldn't start sign-in. Please try again.",
      );
    } catch (error) {
      console.error("Failed to fetch login URL:", error);
      onError("Couldn't reach the server. Please try again.");
    }
    setPending(false);
  };

  return (
    <button
      type="button"
      onClick={login}
      disabled={pending}
      className="
        inline-flex items-center justify-center
        rounded-xl px-6 py-3
        text-base font-semibold
        bg-primary text-white
        cursor-pointer
        transition-all duration-300 ease-out
        hover:bg-primary/90
        hover:shadow-lg hover:-translate-y-0.5
        disabled:opacity-60 disabled:cursor-wait
      "
    >
      {pending ? "Signing in…" : "Member Login"}
    </button>
  );
}

export default function MemberLogin() {
  const [loginTextMask, setLoginTextMask] = useState<string | undefined>();
  const [loginError, setLoginError] = useState<string | null>(null);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
      return;
    }

    // Generate Canvas Mask for AsciiGrid
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.font = "bold 200px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const text = "Login";
    ctx.fillText(text, canvas.width / 2, 0);

    const dataUrl = canvas.toDataURL("image/png");

    requestAnimationFrame(() => {
      setLoginTextMask(dataUrl);
    });
  }, [isAuthenticated, router]);

  return (
    <div className="min-w-screen">
      <section className="relative bg-white text-secondary-black pt-64 pb-24 overflow-hidden">
        {/* Ascii Grid Background */}
        <div className="absolute inset-0 ">
          <AsciiGrid
            color="rgba(0, 0, 0, 0.2)"
            cellSize={12}
            logoSrc={loginTextMask}
            logoPosition="center"
            logoScale={0.9}
            enableDripping={false}
            className="w-full h-full"
          />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-linear-to-t from-white via-white/50 to-transparent pointer-events-none" />
        </div>

        <div className="container max-w-7xl relative z-10 mx-auto px-4 md:px-6 pb-8">
          {/* Main Title */}
          <h4 className="text-3xl mb-2 tracking-tighter">
            <span className="font-times font-normal text-primary">
              (Member)
            </span>{" "}
            Only
          </h4>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
            Login
          </h1>

          <p className="text-lg md:text-xl mb-8 max-w-2xl opacity-95 leading-relaxed font-serif">
            Access to this platform is restricted to members of the{" "}
            <span className="font-semibold">KTH AI Society</span>. If you are
            already a member, please log in to continue. Not a member yet? You
            can apply to join and gain access to exclusive projects, events, and
            collaborations.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Embedded Google Login Button */}
            <GoogleLoginButton onError={setLoginError} />

            <Link
              href="/apply"
              className="
                inline-flex items-center justify-center
                rounded-xl px-6 py-3
                text-base font-semibold
                border border-primary/30
                text-primary
                transition-all duration-300 ease-out
                hover:bg-primary/5
                hover:shadow-md hover:-translate-y-0.5
              "
            >
              Apply for Membership
            </Link>
          </div>

          {loginError && (
            <p role="alert" className="mt-4 text-sm text-red-600">
              {loginError}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
