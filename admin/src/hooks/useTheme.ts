// Theme hook - forces the app to always stay in light mode by stripping the
// "dark" class from <html> and setting localStorage. Dark mode is not
// currently supported; this prevents OS-level dark mode from leaking in.
import { useEffect } from "react";

export function useTheme() {
  useEffect(() => {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  return { isDark: false, toggle: () => {} };
}
