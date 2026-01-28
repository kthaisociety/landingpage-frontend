import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearUser } from "../slices/auth-slice/authSlice";

export const internalApi = createApi({
  reducerPath: "internalApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/", credentials: "include" }),
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => "api/auth/me",
    }),
    getProfile: builder.query({
      query: () => "api/auth/profile",
    }),
    getMeMocked: builder.query({
      query: () => "testServerApi",
    }),
    // googleLogin: builder.mutation({
    //   query: (code: string) => ({
    //     url: "testServerApi/auth",
    //     method: "POST",
    //     body: { code },
    //     headers: {
    //       Authorization: `Bearer ${code}`,
    //     },
    //   }),
    // }),
    googleLogin: builder.mutation({
      query: (code: string) => ({
        url: "auth/google",
        method: "POST",
        body: { code },
        headers: {
          Authorization: `Bearer ${code}`,
        },
      }),
    }),
    // testing with testServerApi
    logout: builder.mutation({
      query: () => ({
        url: "testServerApi/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(clearUser());
          dispatch(internalApi.util.resetApiState());
        } catch (err) {
          console.log("Logout error:", err);
        }
      },
    }),
  }),
});

export const {
  useGetMeQuery,
  useGetMeMockedQuery,
  useGetProfileQuery,
  useGoogleLoginMutation,
  useLogoutMutation,
} = internalApi;
