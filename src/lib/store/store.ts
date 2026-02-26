import { configureStore } from "@reduxjs/toolkit";
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import { authReducer } from "./slices/auth-slice/authSlice";
import { internalApi } from "../apis/internal-apis";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      [internalApi.reducerPath]: internalApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(internalApi.middleware),
    devTools: process.env.NODE_ENV !== "production",
  });
};

export type RootState = ReturnType<ReturnType<typeof makeStore>["getState"]>;
export type AppDispatch = ReturnType<typeof makeStore>["dispatch"];
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppStore = ReturnType<typeof makeStore>;
