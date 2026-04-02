import React from "react";
import { Clock, CheckCircle, AlertCircle, Pill, Volume2 } from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "../context/LanguageContext";
import { useVoice } from "../context/VoiceContext";

const MedicineCard = ({ medicine, onTake }) => {
  const { t, language } = useLanguage();
  const { speak } = useVoice();

  // Status check kar rahe hain ke medicine li ja chuki hai ya miss hui hai
  const isTaken = medicine.status === "taken";
  const isMissed = medicine.status === "missed";

  return (
    <div
      className={clsx(
        "relative p-5 rounded-2xl transition-all flex items-center justify-between group",
        isTaken
          ? "bg-emerald-50/50 border border-emerald-200"
          : isMissed
            ? "bg-red-50/50 border border-red-200"
            : "surface-raised hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/5 transition-all duration-300"
      )}
    >
      <div className="flex items-center gap-4">
        <div
          className={clsx(
            "p-3.5 rounded-2xl transition-colors",
            isTaken
              ? "bg-emerald-100 text-emerald-600"
              : isMissed
                ? "bg-red-100 text-red-600"
                : "bg-primary-50 text-primary-600 group-hover:bg-primary-100"
          )}
        >
          <Pill size={28} />
        </div>

        <div>
          <h3
            className={clsx(
              "text-lg font-bold",
              isTaken ? "text-emerald-900" : "text-slate-800"
            )}
          >
            {medicine.name}
          </h3>
          <div className="flex items-center gap-2 text-slate-500 mt-1.5 text-sm font-medium">
            <Clock size={16} className="text-primary-500" />
            <span>{medicine.time}</span>
            <span className="text-slate-400 px-1">•</span>
            <span>{medicine.dosage}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            if (language === "ur") {
              speak(
                `${medicine.name}, ${medicine.dosage} کھانے کا وقت ہو گیا ہے`,
                "ur-PK"
              );
            } else {
              speak(
                `Time to take ${medicine.name}, ${medicine.dosage}`,
                "en-US"
              );
            }
          }}
          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
          title={t.medicineCardReadAloud}
        >
          <Volume2 size={20} />
        </button>

        {isTaken ? (
          <div className="flex items-center gap-2 text-emerald-600 font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-emerald-100">
            <CheckCircle size={20} />
            <span>{t.taken}</span>
          </div>
        ) : isMissed ? (
          <div className="flex items-center gap-2 text-red-600 font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-red-100">
            <AlertCircle size={20} />
            <span>{t.missed}</span>
          </div>
        ) : (
          <button
            onClick={() => onTake(medicine._id)}
            className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md shadow-primary-200 transition-colors active:scale-95"
          >
            {t.takeAction}
          </button>
        )}
      </div>
    </div>
  );
};

export default MedicineCard;
