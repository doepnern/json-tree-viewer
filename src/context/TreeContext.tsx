import React, { createContext, useContext } from "react";
import { ACTIONTYPE, useTreeState } from "../hooks/useTreeState";
import exampleJson from "../components/Tree/example.json";
import { Tree } from "../components/Tree/treeModel";

const TreeCtxDispatch = createContext<React.Dispatch<ACTIONTYPE> | null>(null);
const TreeCtx = createContext<Tree | null>(null);

export function useTreeCtxDispatch(): React.Dispatch<ACTIONTYPE> {
  const ctx = useContext(TreeCtxDispatch);
  if (!ctx) throw new Error("context not found");
  return ctx;
}

export function useTreeCtx(): Tree {
  const ctx = useContext(TreeCtx);
  if (!ctx) throw new Error("context not found");
  return ctx;
}

export function TreeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [treeState, dispatch] = useTreeState(exampleJson);
  return (
    <TreeCtx.Provider value={treeState}>
      <TreeCtxDispatch.Provider value={dispatch}>
        {children}
      </TreeCtxDispatch.Provider>
    </TreeCtx.Provider>
  );
}
