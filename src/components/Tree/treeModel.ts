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

export function parseJson(jsonData: Record<string, JsonValue>) {
  const tree = new Tree();
  parseJsonLevel(jsonData, tree.rootNode);
  return tree;
}

function parseJsonLevel(
  jsonData: Record<string, JsonValue>,
  currentNode: Node
) {
  const levelKeys = Object.keys(jsonData);

  levelKeys.forEach((lk) => {
    const levelData = jsonData[lk];
    if (isObject(levelData)) {
      // is node
      const len = currentNode.children.push(new Node(lk, currentNode));
      parseJsonLevel(levelData, currentNode.children[len - 1] as Node);
    } else {
      // is leaf
      currentNode.children.push(new Leaf(lk, levelData, currentNode));
    }
  });
}

function isObject(e: JsonValue): e is JsonObj {
  return e != null && typeof e === "object" && !(e instanceof Array);
}

export class Tree {
  rootNode: Node;
  constructor() {
    this.rootNode = new Node("root", null);
  }

  toString() {
    return this.rootNode.toString();
  }
  /*
    call after making change to tree with changed node, will propagate the changes to the top of the tree,
     replacing all changed nodes on the way.
     This prevents the whole tree from being replaced. Only the directly adjacent childen will have their parents mutated which should
     be fine because it is not relevant for the ui
  */
  propagateChanges(newLastNode: Node | Leaf, oldNode: Node | Leaf) {
    const newTree = new Tree();
    const path = oldNode.getPath();

    //recreate path to old node
    const newRootNode = Tree.updateNodesAlongPath(0, path, null, newLastNode);
    if (!(newRootNode instanceof Node))
      throw new Error("expected to get back root node");
    newTree.rootNode = newRootNode;
    Tree.updateImmediateChildren(newTree.rootNode);
    return newTree;
  }

  removeNode(node: Node | Leaf) {
    if (node.parent === null) {
      console.warn("cant remove root node");
      return this;
    }
    const n: Node | Leaf = node.parent.clone();
    if (n instanceof Leaf) throw new Error("leafs not allowed as parents");
    n.children = n.children.filter((e) => e !== node);
    Tree.updateImmediateChildren(n);
    const newTre = this.propagateChanges(n, node.parent);
    return newTre;
  }

  addNode(parentNode: Node | null, node: Node | Leaf) {
    if (parentNode == null) {
      if (!(node instanceof Node))
        throw new Error("cant make leaf node new root");
      const t = new Tree();
      t.rootNode = node;
      return t;
    }
    if (parentNode.children.some((c) => c.name === node.name)) {
      console.error("only unique names in one subfolder allowed");
      return this;
    }
    node.parent = parentNode;
    const clone = parentNode.clone();
    clone.children = [...parentNode.children, node];
    const newTree = this.propagateChanges(clone, parentNode);
    Tree.updateImmediateChildren(clone);
    return newTree;
  }
  static updateImmediateChildren(node: Node) {
    const childs = node.children;
    childs.forEach((c) => (c.parent = node));
  }

  //replaces last node along a path and updates all children and parents on the path plus the parents of the directly adjacent nodes
  static updateNodesAlongPath(
    currentNodeIndex: number,
    path: (Leaf | Node | BaseNode)[],
    previousNode: Leaf | Node | null,
    newLastNode: Leaf | Node
  ) {
    //if last node reached, return
    if (currentNodeIndex === path.length - 1) {
      newLastNode.parent = previousNode;
      return newLastNode;
    }
    const pathNode = path[currentNodeIndex];
    if (!(pathNode instanceof Leaf || pathNode instanceof Node))
      throw new Error("only nodes and leaves allowed");

    //recreate all nodes in path
    const clone = pathNode.clone();
    clone.parent = previousNode;

    if (
      clone instanceof Leaf ||
      pathNode instanceof Leaf ||
      currentNodeIndex === path.length - 1
    ) {
      return clone;
    }
    //find out where in the children array the next node in the path is
    const nextPathNodeIndex = pathNode.children.findIndex(
      (c) => c === path[currentNodeIndex + 1]
    );
    if (nextPathNodeIndex === -1) throw new Error("old node not found");

    //recursively find the new child
    const newUpdatedChild = Tree.updateNodesAlongPath(
      currentNodeIndex + 1,
      path,
      clone,
      newLastNode
    );
    if (!newUpdatedChild) throw new Error("expected another child");

    const newChildren = [
      ...pathNode.children.slice(0, nextPathNodeIndex),
      newUpdatedChild,
      ...pathNode.children.slice(nextPathNodeIndex + 1),
    ];

    clone.children = newChildren;

    Tree.updateImmediateChildren(clone);
    return clone;
  }
}

export class BaseNode {
  name: string;
  depth: number;
  parent: Node | Leaf | null;
  constructor(name: string, parent: Leaf | Node | null) {
    this.name = name;
    this.depth = parent ? parent.depth + 1 : 0;
    this.parent = parent;
  }
  getPath(): (Leaf | Node | BaseNode)[] {
    return this.parent ? [...this.parent.getPath(), this] : [this];
  }
  getPathString() {
    return this.getPath()
      .map((node) => node.name)
      .join("/");
  }
}

export class Node extends BaseNode {
  children: (Node | Leaf)[];
  constructor(name: string, parent: Node | Leaf | null) {
    super(name, parent);
    this.children = [];
  }
  toString() {
    const inset = Array(this.depth).fill("  ");
    const childStrings = this.children.map((c) => c.toString());
    const str: string =
      inset.join("") + this.name + "----------> \n" + childStrings.join("\n");
    return str;
  }
  clone() {
    const clone = new Node(this.name, this.parent);
    clone.children = [...this.children];
    return clone;
  }
}

export class Leaf extends BaseNode {
  content: string;
  constructor(
    name: string,
    value: Exclude<JsonValue, JsonObj>,
    parent: Node | Leaf | null
  ) {
    super(name, parent);
    this.content = JSON.stringify(value);
  }
  toString() {
    const inset = Array(this.depth).fill("  ");
    return inset.join("") + this.name + ":" + this.content;
  }
  clone() {
    const clone = new Leaf(this.name, this.content, this.parent);
    return clone;
  }
}
