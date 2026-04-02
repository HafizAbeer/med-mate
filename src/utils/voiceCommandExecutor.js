/**
 * Runs matcher results: navigation, global actions, and window events for page-specific UI.
 */
export const VOICE_EVENT = "med-mate-voice";
export const VOICE_TOAST_EVENT = "med-mate-voice-toast";

export function emitVoiceDetail(detail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(VOICE_EVENT, { detail }));
}

export function emitVoiceToast(message) {
  if (typeof window === "undefined" || message == null || message === "") return;
  window.dispatchEvent(
    new CustomEvent(VOICE_TOAST_EVENT, { detail: { message: String(message) } })
  );
}

/**
 * @returns {boolean} true if the command was handled (no further "unknown" feedback needed)
 */
export function executeVoiceCommand(result, {
  navigate,
  logout,
  toggleLanguage,
  t,
}) {
  if (!result || result.type === "none") return false;

  if (result.type === "navigate") {
    navigate(result.to);
    return true;
  }

  if (result.type === "notCaretaker") {
    emitVoiceToast(t.voiceInvalidCommand);
    return true;
  }

  if (result.type === "toggleLanguage") {
    toggleLanguage();
    return true;
  }

  if (result.type === "logout") {
    logout();
    navigate("/login");
    return true;
  }

  if (result.type === "goBack") {
    navigate(-1);
    return true;
  }

  if (result.type === "closeModal") {
    emitVoiceDetail({ type: "closeModal" });
    return true;
  }

  if (result.type === "refreshAdmin") {
    emitVoiceDetail({ type: "refresh" });
    return true;
  }

  if (result.type === "scrollTo") {
    emitVoiceDetail({ type: "scrollTo", id: result.id });
    return true;
  }

  if (result.type === "profileIntent") {
    emitVoiceDetail({ type: "profileIntent", intent: result.intent });
    return true;
  }

  if (result.type === "openAiChat") {
    emitVoiceDetail({ type: "openAiChat" });
    return true;
  }

  return false;
}
