import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { clearUser } from "../slices/auth-slice/authSlice";
import { ProfileData } from "@/types/profile";

export const internalApi = createApi({
  reducerPath: "internalApi",
  baseQuery: fetchBaseQuery({ baseUrl: "/", credentials: "include" }),
  tagTypes: ["Profile"],
  endpoints: (builder) => ({
    getMe: builder.query<{ user: any }, void>({
      query: () => 'api/member/auth/getme',
    }),
    getProfile: builder.query<ProfileData, void>({
      query: () => "api/member/account/profile",
      providesTags: ["Profile"],
    }),
    updateProfile: builder.mutation<ProfileData, Partial<ProfileData>>({
      query: (profileUpdates) => ({
        url: "api/member/account/profile",
        method: "PUT",
        body: profileUpdates,
      }),
      invalidatesTags: ["Profile"], // Automatically triggers getProfile on success
    }),
    deleteProfile: builder.mutation<void, void>({
      query: () => ({
        url: "api/member/account/profile",
        method: "DELETE",
      }),
      invalidatesTags: ["Profile"],
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
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteProfileMutation,
  useGoogleLoginMutation,
  useLogoutMutation,
} = internalApi;