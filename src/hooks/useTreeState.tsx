import { useReducer } from "react";
import {
  JsonValue,
  Leaf,
  Node,
  parseJson,
  Tree,
} from "../components/Tree/treeModel";

export function useTreeState(obj: Record<string, JsonValue>) {
  const state = useReducer(treeStateReducer, parseJson(obj));
  return state;
}

const initialState = new Tree();

export type ACTIONTYPE =
  | { type: "removeNode"; value: Node | Leaf }
  | {
      type: "addNode";
      value: { newNode: Leaf | Node; parentNode: null | Node };
    };

function treeStateReducer(state: typeof initialState, action: ACTIONTYPE) {
  switch (action.type) {
    case "removeNode":
      return state.removeNode(action.value);
    case "addNode":
      return state.addNode(action.value.parentNode, action.value.newNode);
    default:
      return state;
  }
}
