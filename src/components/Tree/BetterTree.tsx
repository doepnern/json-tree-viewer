import styles from "./trees.module.css";
import { ReactComponent as FolderIcon } from "../../assets/folder-svgrepo-com.svg";
import { ReactComponent as FileIcon } from "../../assets/file-svgrepo-com.svg";
import { memo, useEffect, useMemo, useState } from "react";
import {
  useBetterTreeCtx,
  useBetterTreeCtxDispatch,
} from "../../context/BetterTreeContext";
import {
  Id,
  isNodeState,
  LeafState,
  NodeState,
} from "../../hooks/useBetterTreeState";
import { BetterTreeActions } from "../TreeActions/BetterTreeActions";

const INSET = 32;

export function BetterTreeRepresentation() {
  const { rootNode, nodes } = useBetterTreeCtx();

  const rootNodeState = nodes.find((n) => n.id === rootNode);
  const rootNodeStateind = nodes.findIndex((n) => n.id === rootNode) as any;
  console.log(rootNodeState === nodes[rootNodeStateind]);

  if (!isNodeState(rootNodeState)) throw new Error("Didnt find root node");
  return <NodeWrapper node={rootNodeState} parentId={null} />;
}

//only rerender Node if one of the children got changed
function NodeWrapper({
  node,
  parentId,
}: {
  node: NodeState;
  parentId: Id | null;
}) {
  const { nodes } = useBetterTreeCtx();
  const children = node.children.map((c) => {
    const child = nodes.find((e) => e.id === c);
    if (!child) throw new Error("cant find all children of component");
    return child;
  });

  return (
    <NodeRepresentation children={children} node={node} parentId={parentId} />
  );
}

type NodeRepresentationProps = {
  node: NodeState;
  parentId: Id | null;
  children: (NodeState | LeafState)[];
};

const NodeRepresentation = memo(
  ({ node, parentId, children }: NodeRepresentationProps) => {
    const dispatch = useBetterTreeCtxDispatch();
    const [collapsed, setCollapsed] = useState(true);
    const insetStyling = {
      paddingLeft: INSET + "px",
      marginBottom: "0.2rem",
      marginTop: "0.2rem",
    };

    return (
      <>
        <div
          className={styles.nodeContainer}
          onClick={() => setCollapsed((c) => !c)}
        >
          <FolderIcon
            style={{
              height: "20px",
              width: "20px",
              padding: "0 0.5rem 0 0.5rem",
            }}
          />
          {node.name + (collapsed ? "(+)" : " (-)")}
          <RemoveButton
            onClick={() =>
              dispatch({
                type: "removeNode",
                value: { nodeId: node.id, parentId: parentId },
              })
            }
          />
        </div>
        {!collapsed && (
          <div style={insetStyling}>
            {children.map((c) => getTreeComponentJsxRepresentation(c, node.id))}
            <BetterTreeActions parentId={node.id} />
          </div>
        )}
      </>
    );
  },
  nodesAreEqual
);

function nodesAreEqual(
  prevProps: NodeRepresentationProps,
  nextProps: NodeRepresentationProps
): boolean {
  return (
    prevProps.children.length === nextProps.children.length &&
    prevProps.children.every((c, ind) => nextProps.children[ind] === c) &&
    prevProps.node === nextProps.node &&
    prevProps.parentId === nextProps.parentId
  );
}

const LeafRepresentation = memo(
  ({ leaf, parentId }: { leaf: LeafState; parentId: string }) => {
    const dispatch = useBetterTreeCtxDispatch();
    return (
      <>
        <div className={styles.leafContainer}>
          <div>
            <FileIcon
              style={{
                height: "20px",
                width: "20px",
                padding: "0 0.5rem 0 0.5rem",
              }}
            />
            {leaf.name}: {leaf.content}
          </div>
          <RemoveButton
            onClick={() =>
              dispatch({
                type: "removeNode",
                value: { nodeId: leaf.id, parentId: parentId },
              })
            }
          />
        </div>
      </>
    );
  }
);

function RemoveButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className={styles.removeButton}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      delete
    </button>
  );
}

function getTreeComponentJsxRepresentation(
  c: LeafState | NodeState,
  parentId: string
) {
  if (isNodeState(c))
    return <NodeWrapper node={c} parentId={parentId} key={c.id} />;
  return <LeafRepresentation leaf={c} parentId={parentId} key={c.id} />;
}
