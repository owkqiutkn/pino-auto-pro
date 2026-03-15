"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

type FooterVisibilityContextValue = {
  footerBottomInView: boolean;
};

const FooterVisibilityContext = createContext<FooterVisibilityContextValue>({
  footerBottomInView: false,
});

export function useFooterVisibility() {
  return useContext(FooterVisibilityContext);
}

const FLOATING_BUTTON_OFFSET_ABOVE_FOOTER = "4rem"; // so buttons sit above footer text

export const FLOATING_BOTTOM_WHEN_FOOTER_VISIBLE = FLOATING_BUTTON_OFFSET_ABOVE_FOOTER;

export function FooterVisibilityProvider({ children }: { children: ReactNode }) {
  const [footerBottomInView, setFooterBottomInView] = useState(false);
  const pathname = usePathname();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observedRef = useRef<Element | null>(null);

  const setupObserver = useCallback(() => {
    const el = document.getElementById("footer-bottom-bar");
    if (!el) return;

    if (observedRef.current === el && observerRef.current) return;
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
    observedRef.current = el;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) {
          setFooterBottomInView(entry.isIntersecting);
          if (entry.isIntersecting) {
            document.body.classList.add("footer-visible");
          } else {
            document.body.classList.remove("footer-visible");
          }
        }
      },
      { root: null, rootMargin: "0px", threshold: 0 }
    );
    observer.observe(el);
    observerRef.current = observer;
  }, []);

  useEffect(() => {
    setFooterBottomInView(false);
    document.body.classList.remove("footer-visible");
    observedRef.current = null;
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const timeout = setTimeout(setupObserver, 100);
    return () => clearTimeout(timeout);
  }, [pathname, setupObserver]);

  return (
    <FooterVisibilityContext.Provider value={{ footerBottomInView }}>
      {children}
    </FooterVisibilityContext.Provider>
  );
}
