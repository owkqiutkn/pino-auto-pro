"use client";

import { useEffect, useRef } from "react";

const MODAL_SELECTOR =
  ".cookie-manager div.fixed.inset-0 div[class*='max-w-lg'][class*='rounded-xl']";
const CANCEL_BUTTON_TEXTS = ["Cancel", "Annuler"];

function findCancelButton(container: HTMLElement): HTMLButtonElement | null {
  const buttons = container.querySelectorAll("button");
  for (const btn of buttons) {
    const text = btn.textContent?.trim() ?? "";
    if (CANCEL_BUTTON_TEXTS.some((t) => text === t)) return btn as HTMLButtonElement;
  }
  return null;
}

export function CookieModalCloseButton() {
  useEffect(() => {
    let closeBtn: HTMLButtonElement | null = null;

    const injectCloseButton = () => {
      const modalContent = document.querySelector(MODAL_SELECTOR);
      if (!modalContent || !(modalContent instanceof HTMLElement)) return false;

      // Skip if we already injected our button
      if (modalContent.querySelector("[data-cookie-modal-close]")) return true;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("aria-label", "Close");
      btn.setAttribute("data-cookie-modal-close", "true");
      btn.className =
        "absolute top-4 right-4 p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1";
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      `;
      btn.onclick = () => {
        const cancelBtn = findCancelButton(modalContent);
        cancelBtn?.click();
      };

      modalContent.style.position = "relative";
      modalContent.appendChild(btn);
      closeBtn = btn;
      return true;
    };

    const removeCloseButton = () => {
      const existing = document.querySelector("[data-cookie-modal-close]");
      if (existing?.parentElement) existing.remove();
      closeBtn = null;
    };

    const checkAndInject = () => {
      if (injectCloseButton()) return;
      removeCloseButton();
    };

    // Initial check
    checkAndInject();

    const observer = new MutationObserver(() => {
      checkAndInject();
    });

    const cookieManager = document.querySelector(".cookie-manager");
    if (cookieManager) {
      observer.observe(cookieManager, { childList: true, subtree: true });
    }

    // Fallback: poll when modal might open
    const interval = setInterval(checkAndInject, 300);

    return () => {
      observer.disconnect();
      clearInterval(interval);
      removeCloseButton();
    };
  }, []);

  return null;
}
