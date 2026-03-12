"use client";

import {useEffect, useState} from "react";
import {useTranslations} from "next-intl";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("Common");

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 400);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({top: 0, behavior: "smooth"})}
      aria-label={t("scrollTop")}
      className="fixed bottom-5 right-4 z-[9999] flex h-9 w-9 items-center justify-center rounded-full bg-[#0c1320] text-xs font-semibold text-white shadow-[0_10px_30px_rgba(0,0,0,0.6)] ring-1 ring-white/40 backdrop-blur-sm hover:bg-black/90 md:bottom-7 md:right-6"
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

