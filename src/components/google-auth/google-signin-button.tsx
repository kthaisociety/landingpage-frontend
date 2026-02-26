"use client";
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth"; 
import { useGoogleLoginMutation } from "@/lib/apis/internal-apis";

export function GoogleLoginButton() {
  const { loginUser } = useAuth();
  const [googleLoginMutation] = useGoogleLoginMutation();
  const router = useRouter();

  const login = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async function (codeResponse) {
      try {
        const result = await googleLoginMutation(codeResponse.code).unwrap();

        if (result.user) {
          loginUser(result.user); 
          router.push("/");
        }
      } catch (error) {
        console.error("Login mutation failed", error);
      }
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
