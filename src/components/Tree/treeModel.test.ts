import { Leaf, Node, parseJson } from "./treeModel";
import exampleJson from "./example.json";
describe("parses json correctly to its tree representation", () => {
  const tree = parseJson(exampleJson);
  it("has correct tree structure", () => {
    expect(tree.rootNode.children.length).toBe(2);
    expect(tree.rootNode.children[0].depth).toBe(1);
    expect(
      (
        (tree.rootNode.children[0] as unknown as Node)
          .children[0] as unknown as Node
      ).children.length
    ).toBe(7);
  });

  it("parses leafs correctly", () => {
    const leafExample = tree.rootNode.children[1] as unknown as Leaf;
    expect(leafExample instanceof Leaf).toBe(true);
    expect(leafExample.content).toBe(JSON.stringify("hello"));
    expect(leafExample.name).toBe("leafBase");
    expect(leafExample.depth).toBe(1);
  });

  it("parses nodes correctly", () => {
    const nodeExample = tree.rootNode.children[0] as unknown as Node;
    expect(nodeExample instanceof Node).toBe(true);
    expect(nodeExample.depth).toBe(1);
    expect(nodeExample.name).toBe("nodeBase");
  });
});
