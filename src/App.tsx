import { APITester } from "./APITester";
import { NOAAData } from "./NOAAData";
import "./index.css";

export function App() {
  return (
    <div className="app">
      <h1>Агромет</h1>
      <NOAAData />
    </div>
  );
}

export default App;
