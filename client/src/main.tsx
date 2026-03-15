import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { ClerkProvider } from "@clerk/react";
import { dark } from "@clerk/themes";

// clerk setup
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

createRoot(document.getElementById("root")! as HTMLElement).render(
  <ClerkProvider
    appearance={{
      theme: dark,
      variables: {
        colorPrimary: "#e60076",
        colorTextOnPrimaryBackground: "#fff",
      },
    }}
    publishableKey={PUBLISHABLE_KEY}
  >
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </ClerkProvider>,
);
