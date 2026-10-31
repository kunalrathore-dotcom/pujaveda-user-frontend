import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Universal ScrollToTop for the Storefront.
 * Listens to location changes (pathname + search) and immediately resets
 * window and any possible container scroll position to top.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // 1. Reset window scroll
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });

    // 2. Reset document element & body
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
    }

    // 3. Reset any scrollable main containers
    const mainEl = document.querySelector("main");
    if (mainEl) {
      mainEl.scrollTop = 0;
    }
  }, [pathname, search]);

  return null;
}

