import "./App.css";
import { TreeRepresentation } from "./components";
import { TreeContextProvider } from "./context/TreeContext";

function App() {
  return (
    <div className="App">
      <TreeContextProvider>
        <TreeRepresentation />
      </TreeContextProvider>
    </div>
  );
}

export default App;
