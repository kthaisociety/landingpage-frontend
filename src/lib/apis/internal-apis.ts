import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { User } from "@/types/auth";

export const internalApi = createApi({
  reducerPath: "internalApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/", credentials: "include" }),
  tagTypes: ["auth"],
  endpoints: function (builder) {
    return {
      getMe: builder.query<{ user: User }, void>({
        query: function () {
          return "api/member/auth/getme";
        },
      }),
      googleLogin: builder.mutation({
        query: function (code: string) {
          return {
            url: "api/member/auth",
            method: "POST",
            body: { code },
            headers: { Authorization: `Bearer ${code}` },
          };
        },
      }),
      logout: builder.mutation<void, void>({
        query: function () {
          return { url: "api/member/logout", method: "POST" };
        },
      }),
    };
  },
});

export const { useLazyGetMeQuery, useGoogleLoginMutation, useLogoutMutation } =
  internalApi;
