import { Leaf, Node } from "./treeModel";
import styles from "./trees.module.css";
import { ReactComponent as FolderIcon } from "../../assets/folder-svgrepo-com.svg";
import { ReactComponent as FileIcon } from "../../assets/file-svgrepo-com.svg";
import { memo, useState } from "react";
import { useTreeCtx, useTreeCtxDispatch } from "../../context/TreeContext";
import { TreeActions } from "../TreeActions/TreeActions";

const INSET = 32;

export function Tree() {
  const treeState = useTreeCtx();
  return <NodeRepresentation node={treeState.rootNode} />;
}

const NodeRepresentation = memo(({ node }: { node: Node }) => {
  const dispatch = useTreeCtxDispatch();
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
          onClick={() => dispatch({ type: "removeNode", value: node })}
        />
      </div>
      {!collapsed && (
        <div style={insetStyling}>
          {node.children.map((c) => getTreeComponentJsxRepresentation(c))}
          <TreeActions node={node} />
        </div>
      )}
    </>
  );
});

const LeafRepresentation = memo(({ leaf }: { leaf: Leaf }) => {
  const dispatch = useTreeCtxDispatch();
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
          onClick={() => dispatch({ type: "removeNode", value: leaf })}
        />
      </div>
    </>
  );
});

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

function getTreeComponentJsxRepresentation(c: Node | Leaf) {
  if (c instanceof Node)
    return <NodeRepresentation node={c as Node} key={c.getPathString()} />;
  return <LeafRepresentation leaf={c as Leaf} key={c.getPathString()} />;
}
