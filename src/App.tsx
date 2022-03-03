import "./App.css";
import { BetterTree, Tree } from "./components";
import { BetterTreeContextProvider } from "./context/BetterTreeContext";
import { TreeContextProvider } from "./context/TreeContext";

function App() {
  return (
    <div className="App">
      <BetterTreeContextProvider>
        <BetterTree />
      </BetterTreeContextProvider>
    </div>
  );
}

function AppOld() {
  return (
    <div className="App">
      <TreeContextProvider>
        <Tree />
      </TreeContextProvider>
    </div>
  );
}

export default App;
