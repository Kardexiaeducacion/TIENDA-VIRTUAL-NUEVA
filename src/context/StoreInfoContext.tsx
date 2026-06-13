"use client";

import React, { createContext, useContext } from "react";
import { StoreInfo, DEFAULT_STORE_INFO } from "@/utils/storeInfo";

const StoreInfoContext = createContext<StoreInfo>(DEFAULT_STORE_INFO);

export function StoreInfoProvider({ children, info }: { children: React.ReactNode; info: StoreInfo }) {
  return (
    <StoreInfoContext.Provider value={info}>
      {children}
    </StoreInfoContext.Provider>
  );
}

export function useStoreInfo() {
  return useContext(StoreInfoContext);
}
