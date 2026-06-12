// Application entry point. Mounts the React tree onto #root.
// Also disables right-click and drag on images site-wide to protect assets.
// The __revealAll global is a dev utility to instantly reveal all
// scroll-animated elements without scrolling.
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

document.addEventListener("contextmenu", (e) => {
  if (e.target instanceof HTMLImageElement) e.preventDefault();
}, true);

document.addEventListener("dragstart", (e) => {
  if (e.target instanceof HTMLImageElement) e.preventDefault();
}, true);

createRoot(document.getElementById("root")!).render(<App />);
(window as unknown as Window).__revealAll = () => {
	document.querySelectorAll(".reveal").forEach((el) => el.classList.add("revealed"));
};
