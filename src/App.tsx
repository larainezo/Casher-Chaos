import { ComponentRefresh, GameService } from "gamez";
import { createRoot } from "react-dom/client";
import GameComponent from "./Game";
import { ASSETS, LEVELS } from "./constants";
import "./styles/globals.css";

const container = document.getElementById("root")!;
const root = createRoot(container);

// ✅ Create a new GameService instance inside ComponentRefresh
// This ensures it gets recreated when refresh() is called
function App() {
  const gs = new GameService("cashier-chaos", LEVELS, ASSETS);
  return <GameComponent gs={gs} />;
}

// Wrap in ComponentRefresh to enable full game restarts
root.render(
  <ComponentRefresh>
    <App />
  </ComponentRefresh>
);