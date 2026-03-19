"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  useFooterVisibility,
  FLOATING_BOTTOM_WHEN_FOOTER_VISIBLE,
} from "@/components/FooterVisibilityProvider";

const SCROLL_THRESHOLD = 400;

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const lastVisibleRef = useRef(false);
  const tickingRef = useRef(false);
  const t = useTranslations("Common");
  const { footerBottomInView } = useFooterVisibility();

  const updateVisibility = useCallback(() => {
    const nowVisible = window.scrollY > SCROLL_THRESHOLD;
    if (lastVisibleRef.current !== nowVisible) {
      lastVisibleRef.current = nowVisible;
      setVisible(nowVisible);
    }
    tickingRef.current = false;
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (!tickingRef.current) {
        tickingRef.current = true;
        requestAnimationFrame(updateVisibility);
      }
    };
    updateVisibility();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [updateVisibility]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
      aria-label={t("scrollTop")}
      className="fixed bottom-5 right-4 z-[9999] flex h-9 w-9 items-center justify-center rounded-full bg-[#b91c1c] text-xs font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.6)] ring-1 ring-red-500/60 backdrop-blur-sm hover:bg-[#dc2626] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-[#b91c1c] md:bottom-7 md:right-6"
      style={
        footerBottomInView
          ? { bottom: FLOATING_BOTTOM_WHEN_FOOTER_VISIBLE }
          : undefined
      }
    >
      <span className="sr-only">{t("scrollTop")}</span>
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="18 15 12 9 6 15" />
      </svg>
    </button>
  );
}

