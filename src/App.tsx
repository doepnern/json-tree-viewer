import "./App.css";
import { BetterTreeRepresentation } from "./components";
import { BetterTreeContextProvider } from "./context/BetterTreeContext";

function App() {
  return (
    <div className="App">
      <BetterTreeContextProvider>
        <BetterTreeRepresentation />
      </BetterTreeContextProvider>
    </div>
  );
}

export default App;
