"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AsciiGrid } from "@/components/ui/ascii-grid";
import { GoogleLoginButton } from "@/components/google-auth/google-signin-button";
import { LoginProvider } from "@/components/providers/google-oauth-provider";
import {
  useGoogleLoginMutation,
} from "@/lib/apis/internal-apis";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { setUser } from "@/lib/store/slices/auth-slice/authSlice";

function MemberLogin() {
  const [loginTextMask, setLoginTextMask] = useState<string | undefined>();
  const [googleLoginMutation] = useGoogleLoginMutation();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;
    console.log("here1")
    if (isLoggedIn){
      console.log("Here2")
      router.push("/");
    } 

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.font = "bold 200px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    const text = "Login";
    ctx.fillText(text, canvas.width / 2, 0);
    const dataUrl = canvas.toDataURL("image/png");
    requestAnimationFrame(() => setLoginTextMask(dataUrl));
  }, [isLoggedIn]);

  return (
    <div className="min-w-screen">
      <section className="relative bg-white text-secondary-black pt-64 pb-24  overflow-hidden">
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
            <span className="font-serif font-normal text-primary">
              (Member)
            </span>{" "}
            Only
          </h4>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
            Login
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl mb-8 max-w-2xl opacity-95 leading-relaxed font-serif">
            Access to this platform is restricted to members of the{" "}
            <span className="font-semibold">KTH AI Society</span>. If you are
            already a member, please log in to continue. Not a member yet? You
            can apply to join and gain access to exclusive projects, events, and
            collaborations.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Login Button */}
            <LoginProvider>
              <GoogleLoginButton
                onGoogleLogin={async function (
                  accessToken: string
                ): Promise<void> {
                  const result = await googleLoginMutation(
                    accessToken
                  ).unwrap();

                  // Dispatch user data to Redux
                  if (result.user) {
                    dispatch(setUser(result.user));
                    router.push("/");
                  }
                }}
              />
            </LoginProvider>

            {/* Apply Button */}
            <a
              href="https://kthaisociety.se/apply" // update if needed
              target="_blank"
              rel="noopener noreferrer"
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
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MemberLogin;
