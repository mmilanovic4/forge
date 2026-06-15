"use client";
import { createContext, useContext } from "react";

const AppContext = createContext({});

export function AppProvider({ children, value }) {
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}
