/**
 * Maps speech to navigation and actions. English + Urdu (spoken / roman).
 * Pass { role, isAuthenticated, pathname } for full routing.
 */

const addIntent =
  /add|new|create|register|open|start|شامل|ضاف|karna|کرنا|karni|کرنی|banana|banani|کھول|lagana|لگانا|jao|جاؤ|دکھا|dikha|dikhao/i;

const medicineWord =
  /medicine|medication|meds|pill|tablets?|capsule|دوا|dawa|dawai|dava/i;

const patientWord = /patient|مریض|mareez|mreez|mariz|marees/i;

function wantsMedicinePage(raw) {
  return (
    (medicineWord.test(raw) && addIntent.test(raw)) ||
    /(go\s*to|open|show).*(medicine|add\s*medicine|دوا)/i.test(raw) ||
    /(medicine|دوا).*(page|screen|form|صفحہ|فارم)/i.test(raw)
  );
}

function wantsPatientForm(raw) {
  return (
    (patientWord.test(raw) && addIntent.test(raw)) ||
    /(go\s*to|open|show).*(add\s*patient|new\s*patient|مریض)/i.test(raw) ||
    /(patient|مریض).*(form|screen|add|شامل)/i.test(raw)
  );
}

export function matchVoiceCommand(transcript, { role, isAuthenticated, pathname }) {
  const raw = String(transcript || "").trim();
  if (!raw) return { type: "none" };

  const path = pathname || "";
  const onProfile = path.startsWith("/profile");

  // —— Global: language (works signed in or on auth pages) ——
  if (
    /(switch|change|toggle).*(language|urdu|english|اردو|انگریزی)/i.test(raw) ||
    /(language|زبان).*(urdu|english|اردو|انگریزی)/i.test(raw) ||
    /^(urdu|english|اردو|انگریزی)$/i.test(raw.trim()) ||
    /(bolo|speak).*(urdu|english)/i.test(raw)
  ) {
    return { type: "toggleLanguage" };
  }

  // —— Close / cancel (modals) ——
  if (
    /^(close|cancel|stop|exit|بند|منسوخ|بند کرو|رک جاؤ)$/i.test(raw.trim()) ||
    /(close|cancel).*(window|dialog|modal|popup|form|باکس)/i.test(raw)
  ) {
    return { type: "closeModal" };
  }

  // —— Not logged in: auth & marketing routes ——
  if (!isAuthenticated) {
    if (/(login|sign\s*in|لاگ ان|log\s*on)/i.test(raw)) return { type: "navigate", to: "/login" };
    if (/(sign\s*up|register|create\s*(an?\s*)?account|سائن اپ|اکاؤنٹ بنائ)/i.test(raw)) {
      return { type: "navigate", to: "/signup" };
    }
    if (/(forgot|lost).*(password|پاس)|reset\s*password|پاس ورڈ بھول/i.test(raw)) {
      return { type: "navigate", to: "/forgot-password" };
    }
    if (/(verify|تصدیق).*(email|ای میل|code|کوڈ)/i.test(raw)) {
      return { type: "navigate", to: "/verify-email" };
    }
    return { type: "none" };
  }

  // —— Logged in: logout & back ——
  if (/(log\s*out|sign\s*out|لاگ آؤٹ|سائن آؤٹ|خارج)/i.test(raw)) {
    return { type: "logout" };
  }
  if (/(go\s*back|back|previous|peeche|پیچھے|واپس)/i.test(raw)) {
    return { type: "goBack" };
  }

  // —— Profile page: edit name, password, privacy ——
  if (onProfile) {
    if (/(edit|change|update).*(name|نام)|نام بدل/i.test(raw)) {
      return { type: "profileIntent", intent: "editName" };
    }
    if (/(change|update|reset).*(password|پاس ورڈ)|پاس ورڈ بدل/i.test(raw)) {
      return { type: "profileIntent", intent: "editPassword" };
    }
    if (/(privacy|پرائیویسی|policy|حفاظت)/i.test(raw)) {
      return { type: "profileIntent", intent: "privacy" };
    }
  }

  // —— Admin-only: refresh & section scroll (home dashboard) ——
  if (role === "admin" && (path === "/" || path === "")) {
    if (/(refresh|reload|update\s*data|تازہ|ریفریش)/i.test(raw)) {
      return { type: "refreshAdmin" };
    }
    if (/(overview|statistics|stats|system|خلاصہ|اعداد)/i.test(raw)) {
      return { type: "scrollTo", id: "admin-overview" };
    }
    if (/(caretaker|care\s*taker|دیکھ بھال)/i.test(raw)) {
      return { type: "scrollTo", id: "admin-caretakers" };
    }
    if (/(patient|مریض).*(medicine|دوا)|medicines?\s*list|دوائیں/i.test(raw)) {
      return { type: "scrollTo", id: "admin-patients-medicines" };
    }
    if (/(unassigned|غیر مقرر|بغیر تفویض)/i.test(raw)) {
      return { type: "scrollTo", id: "admin-unassigned" };
    }
  }

  // —— Admin navigation ——
  if (role === "admin") {
    if (/(profile|account|پروفائل|اکاؤنٹ)/i.test(raw)) return { type: "navigate", to: "/profile" };
    if (/(admin|panel|dashboard|ڈیش|بورڈ|ہوم|home|main)/i.test(raw)) {
      return { type: "navigate", to: "/" };
    }
    return { type: "none" };
  }

  // —— Patient & caretaker: medicines ——
  if (wantsMedicinePage(raw)) {
    if (role === "patient" || role === "caretaker") return { type: "navigate", to: "/add" };
    return { type: "none" };
  }

  // —— Caretaker: add patient ——
  if (wantsPatientForm(raw)) {
    if (role === "caretaker") return { type: "navigate", to: "/?addPatient=true" };
    return { type: "notCaretaker" };
  }

  // —— Short navigations (no "add" needed) ——
  if (medicineWord.test(raw) && /(page|screen|section|کھول|جاؤ)/i.test(raw)) {
    if (role === "patient" || role === "caretaker") return { type: "navigate", to: "/add" };
  }

  if (/(history|past\s*record|records|تاریخ|سابق|ماضی|پچھلا)/i.test(raw)) {
    return { type: "navigate", to: "/history" };
  }

  if (/(suggestion|suggestions|recommend|ai|مشور|تجویز|تجاویز|ذہنی)/i.test(raw)) {
    return { type: "navigate", to: "/suggestions" };
  }

  if (/(profile|account|my\s*account|پروفائل|اکاؤنٹ|پروفایل)/i.test(raw)) {
    return { type: "navigate", to: "/profile" };
  }

  if (/(dashboard|home\s*screen|main\s*screen|ہوم|صفحہ|ڈیش بورڈ|مرکزی)/i.test(raw)) {
    return { type: "navigate", to: "/" };
  }

  if (path.startsWith("/suggestions")) {
    if (
      /(open|start).*(chat|assistant|چیٹ)|چیٹ کھول|بات چیت|گفتگو|AI\s*(chat|assistant|help)|پوچھو/i.test(raw)
    ) {
      return { type: "openAiChat" };
    }
  }

  // Caretaker: "add patient" nav label phrases
  if (role === "caretaker" && /(add\s*patient|نیا\s*مریض|مریض\s*شامل)/i.test(raw)) {
    return { type: "navigate", to: "/?addPatient=true" };
  }

  return { type: "none" };
}
