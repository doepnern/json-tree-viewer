import React, { createContext, useContext } from "react";
import exampleJson from "../components/Tree/example.json";
import {
  ACTIONTYPE,
  initialState,
  useBetterTreeState,
} from "../hooks/useBetterTreeState";

const BetterTreeCtxDispatch = createContext<React.Dispatch<ACTIONTYPE> | null>(
  null
);

const BetterTreeCtx = createContext<null | typeof initialState>(null);

export function useBetterTreeCtxDispatch(): React.Dispatch<ACTIONTYPE> {
  const ctx = useContext(BetterTreeCtxDispatch);
  if (!ctx) throw new Error("context not found");
  return ctx;
}

export function useBetterTreeCtx() {
  const ctx = useContext(BetterTreeCtx);
  if (!ctx) throw new Error("context not found");
  return ctx;
}

export function BetterTreeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [treeState, dispatch] = useBetterTreeState(exampleJson);
  return (
    <BetterTreeCtx.Provider value={treeState}>
      <BetterTreeCtxDispatch.Provider value={dispatch}>
        {children}
      </BetterTreeCtxDispatch.Provider>
    </BetterTreeCtx.Provider>
  );
}
