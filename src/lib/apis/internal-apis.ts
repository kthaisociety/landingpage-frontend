import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearUser } from "../store/slices/auth-slice/authSlice";

export const internalApi = createApi({
  reducerPath: "internalApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/", credentials: "include" }),
  tagTypes: ["auth"],
  endpoints: (builder) => ({
    getMe: builder.query<{ user: any }, void>({
      query: () => 'api/member/auth/getme',
    }),
    googleLogin: builder.mutation({
      query: (code: string) => ({
        url: "api/member/auth",
        method: "POST",
        body: { code },
        headers: { Authorization: `Bearer ${code}` },
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({ url: "api/member/logout", method: "POST" }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearUser());
          dispatch(internalApi.util.resetApiState());
        } catch (err) {
          console.error("Logout error:", err);
        }
      },
    }),
  }),
});

export const {
  useLazyGetMeQuery,
  useGoogleLoginMutation,
  useLogoutMutation,
} = internalApi;