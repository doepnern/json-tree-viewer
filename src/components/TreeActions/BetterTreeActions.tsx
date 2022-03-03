import React, { useRef, useState } from "react";
import { useBetterTreeCtxDispatch } from "../../context/BetterTreeContext";
import {
  createLeafState,
  createNodeState,
} from "../../hooks/useBetterTreeState";
import styles from "./TreeActions.module.css";

export function BetterTreeActions({ parentId }: { parentId: string }) {
  return (
    <div className={styles.actionsDiv}>
      <AddNode parentId={parentId} />
      <AddLeaf parentId={parentId} />
    </div>
  );
}

function AddLeaf({ parentId }: { parentId: string }) {
  const dispatch = useBetterTreeCtxDispatch();
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
        parentId: parentId,
        newNode: createLeafState({ content, name: folderName }),
      },
    });
  };
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSubmit();
      }}
      className={styles.button}
    >
      <div
        style={{ height: "100%", width: "100%" }}
        onClick={(e) => {
          handleSubmit();
        }}
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
          />
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
          />
        </div>
      </div>
      <input type="submit" hidden />
    </form>
  );
}

function AddNode({ parentId }: { parentId: string }) {
  const dispatch = useBetterTreeCtxDispatch();
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
        parentId: parentId,
        newNode: createNodeState({ children: [], name: folderName }),
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
