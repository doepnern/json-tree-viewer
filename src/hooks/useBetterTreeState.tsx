import { useMemo, useReducer } from "react";
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

//changed nodes from array to object for faster lookup times
export const initialState: {
  nodes: Record<Id, NodeState | LeafState>;
  rootNode: Id;
} = {
  nodes: { [rootNode.id]: rootNode },
  rootNode: rootNode.id,
};

export function useBetterTreeState(initialTree: Record<string, JsonValue>) {
  const init = useMemo(() => parseJson(initialTree), [initialTree]);
  const state = useReducer(treeStateReducer, init);

  return state;
}

function treeStateReducer(state: typeof initialState, action: ACTIONTYPE) {
  const newState = { ...state, nodes: { ...state.nodes } };

  //actions will only change the immediate parent which is the only Node that needs to change the UI(It could be reasonable to update all parents child arrays up to the root node but I couldnt think of an upside to that in this case)
  switch (action.type) {
    case "addNode": {
      //replaces parent of given node adn adds node to children
      const { newNode, parentId } = action.value;
      newState.nodes[newNode.id] = newNode;
      const parentCopy = findAndCopyParent(newState.nodes, parentId);
      parentCopy.children.push(newNode.id);
      //addd new parent
      newState.nodes[parentCopy.id] = parentCopy;
      if (parentCopy.id === "root_id") newState.rootNode = parentCopy.id;
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
      newState.nodes = removeById(newState.nodes, nodeId);
      //remove node from parent
      const parentCopy = findAndCopyParent(newState.nodes, parentId);
      parentCopy.children = parentCopy.children.filter((n) => n !== nodeId);
      //add new parent
      newState.nodes[parentCopy.id] = parentCopy;
      if (parentCopy.id === "root_id") newState.rootNode = parentCopy.id;
      return newState;
    }
    default:
      return state;
  }
}

function findAndCopyParent(nodes: typeof initialState["nodes"], parentId: Id) {
  //find and copy parent
  const parent = nodes[parentId];
  if (!(parent && "children" in parent)) throw new Error("invalid parent");
  //create copy of parent
  const parentCopy = createNodeState(parent);
  //praent needs to keep same id so we dont have to propagate to all parents - might be better to propagate to parents
  parentCopy.id = parentId;
  return parentCopy;
}

export function findNodeById(nodes: typeof initialState["nodes"], id: Id) {
  return nodes[id];
}

//only use with mutable objects, mutates input to delete node
function removeById(nodes: typeof initialState["nodes"], id: Id) {
  //reove old parent
  delete nodes[id];
  return nodes;
}

export function parseJson(jsonData: Record<string, JsonValue>) {
  const state = initialState;
  parseJsonLevel(jsonData, findNodeById(state.nodes, state.rootNode), state);
  return state;
}

function parseJsonLevel(
  jsonData: Record<string, JsonValue>,
  currentNode: NodeState | LeafState,
  state: typeof initialState
) {
  if (isLeafState(currentNode)) return;
  const levelKeys = Object.keys(jsonData);

  levelKeys.forEach((lk) => {
    const levelData = jsonData[lk];
    if (isObject(levelData)) {
      // is node
      const newNode = createNodeState({ children: [], name: lk });
      currentNode.children.push(newNode.id);
      state.nodes[newNode.id] = newNode;
      parseJsonLevel(levelData, newNode, state);
    } else {
      // is leaf
      const newLeaf = createLeafState({
        content: JSON.stringify(levelData),
        name: lk,
      });
      state.nodes[newLeaf.id] = newLeaf;
      currentNode.children.push(newLeaf.id);
    }
  });
}

function isObject(e: JsonValue): e is JsonObj {
  return e != null && typeof e === "object" && !(e instanceof Array);
}
