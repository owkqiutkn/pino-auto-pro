"use client";

import { CookieManager } from "react-cookie-manager";
import { useLocale } from "next-intl";
import { CookieModalCloseButton } from "./CookieModalCloseButton";

const COOKIE_TRANSLATIONS = {
  en: {
    title: "Cookie Preferences",
    message:
      "We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking Accept, you consent to our use of cookies.",
    buttonText: "Accept All",
    declineButtonText: "Decline All",
    manageButtonText: "Manage Cookies",
    privacyPolicyText: "Privacy Policy",
    manageTitle: "Cookie Preferences",
    manageMessage:
      "Manage your cookie preferences below. Essential cookies are always enabled as they are necessary for the website to function properly.",
    manageEssentialTitle: "Essential",
    manageEssentialSubtitle: "Required for the website to function properly",
    manageEssentialStatus: "Status: Always enabled",
    manageEssentialStatusButtonText: "Always On",
    manageAnalyticsTitle: "Analytics",
    manageAnalyticsSubtitle:
      "Help us understand how visitors interact with our website",
    manageSocialTitle: "Social",
    manageSocialSubtitle: "Enable social media features and sharing",
    manageAdvertTitle: "Advertising",
    manageAdvertSubtitle:
      "Personalize advertisements and measure their performance",
    manageCookiesStatus: "Status: {{status}} on {{date}}",
    manageCookiesStatusConsented: "Consented",
    manageCookiesStatusDeclined: "Declined",
    manageCancelButtonText: "Cancel",
    manageSaveButtonText: "Save Preferences",
  },
  fr: {
    title: "Préférences de cookies",
    message:
      "Nous utilisons des cookies pour améliorer votre expérience de navigation, personnaliser le contenu et analyser notre trafic. En cliquant sur Accepter, vous consentez à l'utilisation de nos cookies.",
    buttonText: "Tout accepter",
    declineButtonText: "Tout refuser",
    manageButtonText: "Gérer les cookies",
    privacyPolicyText: "Politique de confidentialité",
    manageTitle: "Préférences de cookies",
    manageMessage:
      "Gérez vos préférences de cookies ci-dessous. Les cookies essentiels sont toujours activés car ils sont nécessaires au bon fonctionnement du site.",
    manageEssentialTitle: "Essentiels",
    manageEssentialSubtitle: "Nécessaires au bon fonctionnement du site",
    manageEssentialStatus: "Statut : Toujours activés",
    manageEssentialStatusButtonText: "Toujours activés",
    manageAnalyticsTitle: "Analytiques",
    manageAnalyticsSubtitle:
      "Nous aident à comprendre comment les visiteurs interagissent avec notre site",
    manageSocialTitle: "Réseaux sociaux",
    manageSocialSubtitle:
      "Activer les fonctionnalités des réseaux sociaux et le partage",
    manageAdvertTitle: "Publicité",
    manageAdvertSubtitle:
      "Personnaliser les annonces et mesurer leurs performances",
    manageCookiesStatus: "Statut : {{status}} le {{date}}",
    manageCookiesStatusConsented: "Accepté",
    manageCookiesStatusDeclined: "Refusé",
    manageCancelButtonText: "Annuler",
    manageSaveButtonText: "Enregistrer les préférences",
  },
} as const;

type CookiePreferences = {
  Analytics: boolean;
  Social: boolean;
  Advertising: boolean;
};

export function CookieManagerProvider({
  analyticsMeasurementId,
  children,
}: {
  analyticsMeasurementId?: string | null;
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const translations =
    COOKIE_TRANSLATIONS[locale === "fr" ? "fr" : "en"] ??
    COOKIE_TRANSLATIONS.en;
  const measurementId = analyticsMeasurementId?.trim();

  const applyConsent = (preferences: CookiePreferences) => {
    if (typeof window === "undefined") return;

    if (measurementId) {
      // When true, GA library will ignore all hits for this measurement ID.
      (window as Window & Record<string, unknown>)[`ga-disable-${measurementId}`] =
        !preferences.Analytics;
    }

    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: preferences.Analytics ? "granted" : "denied",
        ad_storage: preferences.Advertising ? "granted" : "denied",
        ad_user_data: preferences.Advertising ? "granted" : "denied",
        ad_personalization: preferences.Advertising ? "granted" : "denied",
      });
    }
  };

  return (
    <CookieManager
      initialPreferences={{
        Analytics: true,
        Social: true,
        Advertising: true,
      }}
      disableGeolocation
      showManageButton
      enableFloatingButton
      displayType="popup"
      theme="light"
      privacyPolicyUrl="/legal/privacy"
      translations={translations}
      onAccept={() => {
        applyConsent({ Analytics: true, Social: true, Advertising: true });
      }}
      onDecline={() => {
        applyConsent({ Analytics: false, Social: false, Advertising: false });
      }}
      onManage={(preferences) => {
        applyConsent({
          Analytics: preferences?.Analytics ?? true,
          Social: preferences?.Social ?? true,
          Advertising: preferences?.Advertising ?? true,
        });
      }}
      classNames={{
        floatingButtonCloseButton: "!hidden",
        modalContent: "relative",
        floatingButton:
          "cookie-floating-btn fixed bottom-5 left-4 z-[99999] h-9 w-9 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.32,0,72,1)] hover:scale-110 focus:outline-none group cursor-pointer bg-[#b91c1c] text-white shadow-[0_10px_30px_rgba(0,0,0,0.6)] ring-1 ring-red-500/60 backdrop-blur-sm hover:bg-[#dc2626] md:bottom-7 md:left-6",
      }}
    >
      <CookieModalCloseButton />
      {children}
    </CookieManager>
  );
}
