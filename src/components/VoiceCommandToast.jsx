import React, { useEffect, useState, useRef } from "react";
import { AlertCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { VOICE_TOAST_EVENT } from "../utils/voiceCommandExecutor";

/**
 * Global toast for invalid / unrecognized voice commands (no speech synthesis).
 */
const VoiceCommandToast = () => {
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const onToast = (e) => {
      const msg = e.detail?.message;
      if (msg == null || msg === "") return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setMessage(String(msg));
      setOpen(true);
      timeoutRef.current = setTimeout(() => {
        setOpen(false);
        timeoutRef.current = null;
      }, 2600);
    };
    window.addEventListener(VOICE_TOAST_EVENT, onToast);
    return () => {
      window.removeEventListener(VOICE_TOAST_EVENT, onToast);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  if (!open) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-24 left-1/2 z-[110] max-w-[min(90vw,22rem)] -translate-x-1/2 px-4"
      dir={language === "ur" ? "rtl" : "ltr"}
    >
      <div className="glass flex items-center gap-3 rounded-2xl border border-white/60 px-5 py-3.5 shadow-xl shadow-primary-900/5">
        <div className="shrink-0 rounded-xl bg-amber-100 p-2 text-amber-600">
          <AlertCircle size={20} strokeWidth={2.25} />
        </div>
        <span className="text-sm font-bold leading-snug text-slate-800">{message}</span>
      </div>
    </div>
  );
};

export default VoiceCommandToast;
