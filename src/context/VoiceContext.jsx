import React, { createContext, useContext, useState, useEffect } from "react";

const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    // Check karo ke speech synthesis aur recognition browser mein available hain ya nahi
    if ("speechSynthesis" in window && "webkitSpeechRecognition" in window) {
      setSpeechSupported(true);
    }

    // Pre-load voices
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const speak = (text, lang = "en-US") => {
    if (!speechSupported) return;

    // Cancel any current speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;

    const voices = window.speechSynthesis.getVoices();
    // Pehle country-specific language try karo, warna simple language code par aa jao
    const voice =
      voices.find((v) => v.lang === lang) ||
      voices.find((v) => v.lang.includes(lang.split("-")[0]));

    if (voice) {
      utterance.voice = voice;
    } else {
      console.warn(`No voice found for language: ${lang}`);
    }

    window.speechSynthesis.speak(utterance);
  };

  const listen = (onResult, options = {}) => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const { lang = "ur-PK" } = options;

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = lang;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    recognition.start();
  };

  return (
    <VoiceContext.Provider
      value={{ speak, listen, isListening, speechSupported }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => useContext(VoiceContext);
