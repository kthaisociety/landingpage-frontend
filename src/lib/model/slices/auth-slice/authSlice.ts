import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { jwtDecode } from "jwt-decode";

interface User {
  name: string;
  email: string;
  picture: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  error?: string;
}

const initialState: AuthState = {
  user: null,
  isLoggedIn: false,
  loading: true, // start as loading until we check session
};

export const getToken = () => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("accessToken");
  }
  return null;
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isLoggedIn = true;
      state.loading = false;
    },
    clearUser: (state) => {
      state.user = null;
      state.isLoggedIn = false;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    decodeJWT: (state, action: PayloadAction<string>) => {
      try {
        const decoded = jwtDecode<User>(action.payload);
        state.user = decoded;
        state.isLoggedIn = true;
        state.loading = false;
      } catch (error) {
        console.error("Invalid Token", error);
        state.user = null;
        state.isLoggedIn = false;
        state.loading = false;
      }
    },
  },
});

export const { setUser, clearUser, setLoading, decodeJWT } = authSlice.actions;
export const authReducer = authSlice.reducer;
