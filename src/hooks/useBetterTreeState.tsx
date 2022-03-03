import { useEffect, useReducer } from "react";
import { v4 as uuidv4 } from "uuid";
export type JsonValue =
  | undefined
  | null
  | string
  | number
  | boolean
  | JsonObj
  | JsonArray;
interface JsonObj {
  [key: string]: JsonValue;
}
interface JsonArray extends Array<JsonValue> {}

export type Id = string;
export type NodeState = {
  children: Id[];
  name: string;
  id: Id;
};
export type LeafState = {
  name: string;
  content: string;
  id: Id;
};

export function createNodeState({
  name = "default",
  children = [],
}: {
  name?: string;
  children?: Id[];
}): NodeState {
  const id = uuidv4();
  return {
    name,
    children: [...children],
    id,
  };
}

export function isNodeState(e: any): e is NodeState {
  if (e && "children" in e) return true;
  return false;
}

export function createLeafState({
  name = "default",
  content = "default",
}: {
  name?: string;
  content?: string;
}): LeafState {
  const id = uuidv4();
  return {
    name,
    content,
    id,
  };
}
export function isLeafState(e: any): e is LeafState {
  if (e && "content" in e) return true;
  return false;
}

export type ACTIONTYPE =
  | {
      type: "addNode";
      value: { newNode: LeafState | NodeState; parentId: Id };
    }
  | { type: "removeNode"; value: { nodeId: Id; parentId: Id | null } };

const rootNode = createNodeState({ name: "rootNode" });
rootNode.id = "root_id";

export const initialState: { nodes: (NodeState | LeafState)[]; rootNode: Id } =
  {
    nodes: [rootNode],
    rootNode: rootNode.id,
  };

export function useBetterTreeState(initialTree: Record<string, JsonValue>) {
  const state = useReducer(treeStateReducer, initialState);
  return state;
}

function treeStateReducer(state: typeof initialState, action: ACTIONTYPE) {
  const newState = { ...state, nodes: [...state.nodes] };

  switch (action.type) {
    case "addNode": {
      //replaces parent of given node adn adds node to children
      const { newNode, parentId } = action.value;
      newState.nodes.push(newNode);
      const parentCopy = findAndCopyParent(newState.nodes, parentId);
      parentCopy.children.push(newNode.id);
      //remove old parent
      newState.nodes = removeById(newState.nodes, parentId);
      //addd new parent
      newState.nodes.push(parentCopy);
      if (parentCopy.id === "root_id") newState.rootNode = parentCopy.id;
      console.log(newState.nodes[0] === state.nodes[0]);

      return newState;
    }
    case "removeNode": {
      //replaces parent of given node and remove node from children
      const { nodeId, parentId } = action.value;
      if (parentId === null) {
        console.warn("cant remove root node");
        return state;
      }
      //remove node from nodes
      newState.nodes.filter((n) => n.id !== nodeId);
      //remove node from parent
      const parentCopy = findAndCopyParent(newState.nodes, parentId);
      parentCopy.children = parentCopy.children.filter((n) => n !== nodeId);
      //remove old parent
      newState.nodes = removeById(newState.nodes, parentId);
      //add new parent
      newState.nodes.push(parentCopy);
      if (parentCopy.id === "root_id") newState.rootNode = parentCopy.id;
      return newState;
    }
    default:
      return state;
  }
}

function findAndCopyParent(nodes: typeof initialState["nodes"], parentId: Id) {
  //find and copy parent
  const parent = nodes.find((n) => n.id === parentId);
  if (!(parent && "children" in parent)) throw new Error("invalid parent");
  //create copy of parent
  const parentCopy = createNodeState(parent);
  //praent needs to keep same id
  parentCopy.id = parentId;
  return parentCopy;
}

function removeById(nodes: typeof initialState["nodes"], id: Id) {
  //reove old parent
  return nodes.filter((n) => n.id !== id);
}
