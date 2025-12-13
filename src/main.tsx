import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initializeColorScheme } from "./hooks/useColorScheme";

// Initialize saved color scheme on app load
initializeColorScheme();

createRoot(document.getElementById("root")!).render(<App />);
