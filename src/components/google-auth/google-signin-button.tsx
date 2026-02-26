"use client";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/hooks/auth";

export function GoogleLoginButton() {
  const { loginUser } = useAuth();

  const login = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async function (codeResponse) {
      loginUser(codeResponse.code);
    },
    onError: function () {
      return console.error("Google login failed");
    },
  });

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
