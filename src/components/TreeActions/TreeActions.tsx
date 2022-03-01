import React, { useRef, useState } from "react";
import { useTreeCtxDispatch } from "../../context/TreeContext";
import { Leaf, Node } from "../Tree/treeModel";
import styles from "./TreeActions.module.css";

export function TreeActions({ node }: { node: Node }) {
  return (
    <div className={styles.actionsDiv}>
      <AddNode node={node} />
      <AddLeaf node={node} />
    </div>
  );
}

function AddLeaf({ node }: { node: Node }) {
  const dispatch = useTreeCtxDispatch();
  const [folderName, setItemName] = useState("");
  const [content, setContent] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSubmit = () => {
    if (folderName.length < 1) {
      if (inputRef.current) inputRef.current.focus();
      return;
    }
    dispatch({
      type: "addNode",
      value: {
        parentNode: node,
        newNode: new Leaf(folderName.trimEnd(), content.trimEnd(), node),
      },
    });
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      onClick={handleSubmit}
      className={styles.button}
    >
      <p>Add Item</p>
      <div className={styles.addLeaveInoutContainer}>
        <input
          onClick={(e) => e.stopPropagation()}
          ref={inputRef}
          id="lefName"
          name="leafName"
          className={styles.input}
          onChange={(e) => {
            setItemName(e.target.value);
          }}
          type="text"
          placeholder="Item name"
        ></input>
        <input
          onClick={(e) => e.stopPropagation()}
          id="leafContent"
          name="leafContent"
          className={styles.input}
          onChange={(e) => {
            setContent(e.target.value);
          }}
          type="text"
          placeholder="Item content"
        ></input>
        <input style={{ display: "none" }} type={"submit"} />
      </div>
    </form>
  );
}

function AddNode({ node }: { node: Node }) {
  const dispatch = useTreeCtxDispatch();
  const [folderName, setFolderName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const handleSubmit = () => {
    if (folderName.length < 1) {
      if (inputRef.current) inputRef.current.focus();
      return;
    }
    dispatch({
      type: "addNode",
      value: {
        parentNode: node,
        newNode: new Node(folderName.trimEnd(), node),
      },
    });
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      onClick={handleSubmit}
      className={styles.button}
    >
      <p>Add Node</p>
      <div style={{ display: "flex" }}>
        <input
          onClick={(e) => e.stopPropagation()}
          ref={inputRef}
          name="folderName"
          className={styles.input}
          onChange={(e) => {
            setFolderName(e.target.value);
          }}
          type="text"
          placeholder="Folder name"
        ></input>
      </div>
    </form>
  );
}
