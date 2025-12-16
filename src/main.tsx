import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize i18n before first render
import "@/i18n";

import { initializeColorScheme } from "./hooks/useColorScheme";

// Initialize saved color scheme on app load
initializeColorScheme();

createRoot(document.getElementById("root")!).render(<App />);
