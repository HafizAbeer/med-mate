import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import { Sparkles, AlertTriangle, Apple, Heart, Send, X, User as UserIcon, Bot } from "lucide-react";
import API from "../utils/api";

const AISuggestions = () => {
  const { t, language } = useLanguage();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const chatEndRef = useRef(null);

  useLayoutEffect(() => {
    setMessages([{ role: "assistant", content: t.aiChatWelcome }]);
  }, [language, t.aiChatWelcome]);

  const iconMap = {
    warning: AlertTriangle,
    diet: Apple,
    health: Heart,
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await API.get("/ai/suggestions");
        if (res.data.success) {
          setSuggestions(res.data.data);
        }
      } catch (err) {
        console.error("Error fetching AI suggestions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, chatOpen]);

  const chatOpenRef = useRef(chatOpen);
  chatOpenRef.current = chatOpen;

  useEffect(() => {
    const onVoice = (e) => {
      const d = e.detail;
      if (!d) return;
      if (d.type === "closeModal" && chatOpenRef.current) setChatOpen(false);
      if (d.type === "openAiChat") setChatOpen(true);
    };
    window.addEventListener("med-mate-voice", onVoice);
    return () => window.removeEventListener("med-mate-voice", onVoice);
  }, []);

  const handleSendChat = async () => {
    if (!chatInput.trim() || chatLoading) return;

    const userMsg = { role: "user", content: chatInput };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const res = await API.post("/ai/chat", {
        message: chatInput,
        messageHistory: messages,
      });
      if (res.data.success) {
        setMessages((prev) => [...prev, { role: "assistant", content: res.data.data }]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [...prev, { role: "assistant", content: t.aiChatError }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="animate-fade-in relative min-h-full pb-20">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 rounded-xl text-purple-600">
          <Sparkles size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-800">{t.suggestions}</h1>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 gap-3 bg-white rounded-3xl border border-slate-100">
            <Sparkles className="text-purple-400 animate-spin" size={32} />
            <p className="text-slate-400 font-bold animate-pulse">{t.aiAnalyzing}</p>
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((item, idx) => {
            const Icon = iconMap[item.type] || Heart;
            return (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex gap-4 transition-all hover:shadow-md hover:border-purple-100"
              >
                <div
                  className={`p-3 rounded-full h-fit flex-shrink-0 ${
                    item.type === "warning"
                      ? "bg-orange-100 text-orange-600"
                      : item.type === "diet"
                        ? "bg-green-100 text-green-600"
                        : "bg-sky-100 text-sky-600"
                  }`}
                >
                  <Icon size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                  <p className="text-slate-600 mt-1 leading-relaxed">{item.message}</p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400">
            <Sparkles size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">{t.aiAddMedicinesHint}</p>
          </div>
        )}
      </div>

      <div className="mt-8 p-6 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl text-white relative overflow-hidden group shadow-xl">
        <div className="relative z-10">
          <h2 className="text-xl font-bold mb-2">{t.aiAskTitle}</h2>
          <p className="opacity-90 mb-4 max-w-md">{t.aiAskSubtitle}</p>
          <button
            type="button"
            onClick={() => setChatOpen(true)}
            className="bg-white text-purple-600 px-6 py-2 rounded-xl font-bold shadow-lg hover:bg-purple-50 transition-all active:scale-95 flex items-center gap-2"
          >
            <Sparkles size={18} />
            {t.aiStartChat}
          </button>
        </div>
        <Sparkles
          className="absolute -bottom-4 -right-4 text-white opacity-20 transition-transform group-hover:scale-110 group-hover:rotate-12"
          size={120}
        />
      </div>

      {chatOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg h-[80vh] md:h-[600px] rounded-t-3xl md:rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-purple-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-600 text-white rounded-lg">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 line-height-tight">{t.aiAssistantTitle}</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">{t.aiOnlineStatus}</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-themed p-4 space-y-4 bg-slate-50/30">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`p-2 rounded-xl h-fit ${
                      msg.role === "user" ? "bg-indigo-600 text-white" : "bg-white border border-slate-100 text-slate-700 shadow-sm"
                    }`}
                  >
                    {msg.role === "user" ? <UserIcon size={18} /> : <Bot size={18} />}
                  </div>
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white rounded-tr-none shadow-indigo-100 shadow-lg"
                        : "bg-white border border-slate-100 text-slate-700 rounded-tl-none shadow-sm"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex gap-3">
                  <div className="p-2 rounded-xl h-fit bg-white border border-slate-100 text-slate-400 shadow-sm animate-pulse">
                    <Bot size={18} />
                  </div>
                  <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center">
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-slate-100 bg-white">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                  placeholder={t.aiChatPlaceholder}
                  className="flex-1 bg-slate-100 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500/20 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendChat}
                  disabled={!chatInput.trim() || chatLoading}
                  className="p-3 bg-purple-600 text-white rounded-2xl shadow-lg shadow-purple-200 hover:bg-purple-700 disabled:opacity-50 disabled:shadow-none transition-all active:scale-90"
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="text-[10px] text-center text-slate-400 mt-2">{t.aiDisclaimer}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AISuggestions;
