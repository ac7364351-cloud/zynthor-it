import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

/**
 * ScrollManager handles all scroll restoration, route transition resets,
 * and deliberate anchor target scrolling.
 *
 * Root cause of previous scroll bug:
 * 1. Default browser `history.scrollRestoration = 'auto'` recalled arbitrary pixel offsets on reload.
 * 2. `scroll-smooth` on <html> fought with initial rendering & image load layout shifts.
 * 3. Leftover URL hash fragments from clicks caused browsers to jump automatically to bottom anchors on reload.
 */
const ScrollManager = () => {
  const { pathname, hash } = useLocation();
  const navType = useNavigationType();

  // Configure manual scroll restoration once upon application initialization
  useEffect(() => {
    if (typeof window !== "undefined" && "scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Check if the current session was initiated by a page reload (refresh)
    let isReload = false;
    try {
      const navEntries = performance.getEntriesByType("navigation");
      if (navEntries && navEntries.length > 0) {
        isReload = navEntries[0].type === "reload";
      } else if (window.performance && window.performance.navigation) {
        // Fallback for legacy browsers
        isReload = window.performance.navigation.type === 1;
      }
    } catch {
      isReload = false;
    }

    if (isReload) {
      // On browser refresh, ensure homepage starts strictly at the top
      const currentPath = typeof window !== "undefined" ? window.location.pathname : "";
      if (currentPath === "/" || currentPath === "") {
        if (window.location.hash) {
          // Clean lingering anchor from URL without triggering a route push
          window.history.replaceState(null, "", currentPath);
        }
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      } else {
        // On other routes, reload starts at the top of that specific route
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      }
    }
  }, []); // Run once on initial mount

  // Handle route changes and intentional anchor targets
  useEffect(() => {
    if (hash) {
      const targetId = hash.replace("#", "");
      // Small timeout allows DOM elements and any dynamic height components to settle
      const timeoutId = setTimeout(() => {
        let targetElement = document.getElementById(targetId);
        if (!targetElement && (targetId === "contact" || targetId === "contact-form")) {
          targetElement = document.getElementById("contact-form") || document.getElementById("contact");
        }
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 70);

      return () => clearTimeout(timeoutId);
    } else {
      // Navigating to a new route without a hash opens cleanly at the top
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  }, [pathname, hash, navType]);

  return null;
};

export default ScrollManager;
