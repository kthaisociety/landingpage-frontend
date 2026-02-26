// /* eslint-disable import/no-unresolved */
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { useRouter } from "next/navigation";

// // TODO: This file uses legacy api-client. Consider removing or refactoring to use RTK Query
// /*
// import {
//   authApi,
//   type LoginCredentials,
//   type RegisterCredentials,
//   type AuthResponse,
// } from "@/lib/integration/api-client";
// */
// type AuthResponse = any;
// type LoginCredentials = any;
// type RegisterCredentials = any;
// const authApi = { login: null, register: null, logout: null, getSession: null };

// const shouldBypassAuth = process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";
// const getAdminEmailList = () =>
//   (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
//     .split(",")
//     .map((email) => email.trim())
//     .filter(Boolean);
// const devBypassEmail =
//   process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH_EMAIL ||
//   getAdminEmailList()[0] ||
//   "dev@kthais.com";
// const devSession: AuthResponse = {
//   user: {
//     id: 0,
//     email: devBypassEmail,
//     provider: "dev",
//     firstName: "Dev",
//     lastName: "User",
//   },
//   message: "Bypassed auth for local development",
// };

// export function useLogin() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
//     onSuccess: (data) => {
//       queryClient.setQueryData(["auth-session"], data);
//       // Get the redirect URL from the query params, default to member dashboard
//       const redirectTo =
//         new URLSearchParams(window.location.search).get("from") ||
//         "/member/dashboard";
//       router.push(redirectTo);
//     },
//   });
// }

// export function useRegister() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: (credentials: RegisterCredentials) =>
//       authApi.register(credentials),
//     onSuccess: (data) => {
//       queryClient.setQueryData(["auth-session"], data);
//       router.push("/member/dashboard");
//     },
//   });
// }

// export function useLogout() {
//   const queryClient = useQueryClient();
//   const router = useRouter();

//   return useMutation({
//     mutationFn: () =>
//       shouldBypassAuth ? Promise.resolve(null) : authApi.logout(),
//     onSuccess: () => {
//       queryClient.setQueryData(["auth-session"], null);
//       router.push("/auth/login");
//     },
//   });
// }

// export function useSession() {
//   return useQuery<AuthResponse>({
//     queryKey: ["auth-session"],
//     queryFn: shouldBypassAuth
//       ? async () => devSession
//       : () => authApi.getSession(),
//     initialData: shouldBypassAuth ? devSession : undefined,
//     retry: shouldBypassAuth ? false : 1,
//     staleTime: shouldBypassAuth ? Infinity : 5 * 60 * 1000,
//     refetchOnWindowFocus: !shouldBypassAuth,
//     throwOnError: false,
//   });
// }
