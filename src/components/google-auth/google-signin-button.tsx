"use client";
// import { useGoogleLogin } from "@react-oauth/google";
// import { useAuth } from "@/components/providers/auth-provider/authProvider";

export function GoogleLoginButton() {
  // const { loginUser } = useAuth();

  // const login = useGoogleLogin({
  //   flow: "auth-code",
  //   onSuccess: async function (codeResponse) {
  //     loginUser(codeResponse.code);
  //   },
  //   onError: function () {
  //     return console.error("Google login failed");
  //   },
  // });

  const login = async () =>{
    try {
      // Thanks to your next.config.ts, Next.js routes this to your Go backend!
      const response = await fetch("/api/auth/google");
      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to fetch login URL:", error);
    }
  }

  return (
    <button
      type="button"
      onClick={function () {
        return login();
      }}
      className="
        inline-flex items-center justify-center
        rounded-xl px-6 py-3
        text-base font-semibold
        bg-primary text-white
        transition-all duration-300 ease-out
        hover:bg-primary/90
        hover:shadow-lg hover:-translate-y-0.5
      "
    >
      Member Login
    </button>
  );
}
