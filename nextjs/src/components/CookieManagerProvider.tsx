"use client";

import { CookieManager } from "react-cookie-manager";
import { useLocale } from "next-intl";

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

export function CookieManagerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = useLocale();
  const translations =
    COOKIE_TRANSLATIONS[locale === "fr" ? "fr" : "en"] ??
    COOKIE_TRANSLATIONS.en;

  return (
    <CookieManager
      disableGeolocation
      showManageButton
      enableFloatingButton
      displayType="popup"
      theme="light"
      privacyPolicyUrl="/legal/privacy"
      translations={translations}
      classNames={{
        floatingButtonCloseButton: "!hidden",
      }}
    >
      {children}
    </CookieManager>
  );
}
