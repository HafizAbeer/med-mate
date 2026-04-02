import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { useVoice } from "../context/VoiceContext";
import { matchVoiceCommand } from "../utils/voiceCommands";
import { executeVoiceCommand, emitVoiceToast } from "../utils/voiceCommandExecutor";

export function useVoiceCommands() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, isAuthenticated, logout } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { listen, isListening } = useVoice();

  const recLang = language === "en" ? "en-US" : "ur-PK";

  const runVoiceCommand = useCallback(() => {
    listen(
      (transcript) => {
        const result = matchVoiceCommand(transcript, {
          role,
          isAuthenticated,
          pathname: location.pathname,
        });
        const handled = executeVoiceCommand(result, {
          navigate,
          logout,
          toggleLanguage,
          t,
        });
        if (!handled) {
          emitVoiceToast(t.voiceInvalidCommand);
        }
      },
      { lang: recLang }
    );
  }, [
    listen,
    navigate,
    logout,
    toggleLanguage,
    role,
    isAuthenticated,
    location.pathname,
    recLang,
    t,
  ]);

  return { runVoiceCommand, isListening };
}
