import React from "react";
import { useLocation } from "react-router-dom";
import { Mic } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useVoiceCommands } from "../hooks/useVoiceCommands";

const PUBLIC_PREFIXES = ["/login", "/signup", "/verify-email", "/forgot-password", "/reset-password"];

function isPublicAuthPath(pathname) {
  return PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/**
 * Mic on auth pages (Layout is not mounted). Logged-in app uses Layout sidebar / bottom mic.
 */
const VoiceFloatingAuth = () => {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  const { runVoiceCommand, isListening } = useVoiceCommands();

  if (isAuthenticated || !isPublicAuthPath(pathname)) return null;

  return (
    <button
      type="button"
      onClick={runVoiceCommand}
      title={t.voiceCommandTitle}
      className={clsx(
        "fixed z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-500/30 transition-transform hover:scale-105 active:scale-95",
        language === "ur" ? "bottom-6 left-6" : "bottom-6 right-6"
      )}
      aria-label={t.voiceCommandBtn}
    >
      <Mic size={26} className={isListening ? "animate-pulse" : ""} />
    </button>
  );
};

export default VoiceFloatingAuth;
