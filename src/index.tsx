import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { DynamicSearch } from "./screens/DynamicSearch";
import { SearchProvider } from "./contexts/SearchContext";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <SearchProvider>
      <DynamicSearch />
    </SearchProvider>
  </StrictMode>,
);
