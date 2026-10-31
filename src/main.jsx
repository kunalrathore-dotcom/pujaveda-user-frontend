import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { StoreProvider } from "./context/StoreContext";
import { AuthProvider } from "./context/AuthContext";
import { CatalogProvider } from "./context/CatalogContext";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <StoreProvider>
      <AuthProvider>
        <CatalogProvider>
          <App />
        </CatalogProvider>
      </AuthProvider>
    </StoreProvider>
  </StrictMode>,
);

