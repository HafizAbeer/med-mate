import React from "react";
import { Clock, CheckCircle, AlertCircle, Pill, Volume2, Trash2 } from "lucide-react";
import clsx from "clsx";
import { useLanguage } from "../context/LanguageContext";
import { formatTime } from "../utils/formatTime";
import { useVoice } from "../context/VoiceContext";

const MedicineCard = ({ medicine, onTake, onDelete }) => {
  const { t, language } = useLanguage();
  const { speak } = useVoice();

  // Status check kar rahe hain ke medicine li ja chuki hai ya miss hui hai
  const isTaken = medicine.status === "taken";
  const isMissed = medicine.status === "missed";

  return (
    <div
      className={clsx(
        "relative p-4 sm:p-5 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group",
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
            "p-3 rounded-xl sm:p-3.5 sm:rounded-2xl transition-colors shrink-0",
            isTaken
              ? "bg-emerald-100 text-emerald-600"
              : isMissed
                ? "bg-red-100 text-red-600"
                : "bg-primary-50 text-primary-600 group-hover:bg-primary-100"
          )}
        >
          <Pill size={24} className="sm:w-[28px] sm:h-[28px]" />
        </div>

        <div className="min-w-0">
          <h3
            className={clsx(
              "text-base sm:text-lg font-bold truncate",
              isTaken ? "text-emerald-900" : "text-slate-800"
            )}
          >
            {medicine.name}
          </h3>
          <div className="flex items-center gap-2 text-slate-500 mt-1 text-xs sm:text-sm font-medium flex-wrap">
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-primary-500 sm:w-[16px] sm:h-[16px]" />
              <span>{formatTime(medicine.time)}</span>
            </div>
            <span className="text-slate-300 hidden sm:inline">•</span>
            <span className="bg-slate-50 sm:bg-transparent px-2 py-0.5 sm:p-0 rounded text-[10px] sm:text-sm">{medicine.dosage}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 sm:gap-3 w-full sm:w-auto border-t sm:border-t-0 border-slate-100/60 pt-3 sm:pt-0">
        <button
          onClick={() => {
            onDelete(medicine._id, medicine.name);
          }}
          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          title={t.deleteMedicine || "Delete Medicine"}
        >
          <Trash2 size={18} className="sm:w-[20px] sm:h-[20px]" />
        </button>

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
          <Volume2 size={18} className="sm:w-[20px] sm:h-[20px]" />
        </button>

        {isTaken ? (
          <div className="flex items-center gap-2 text-emerald-600 font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-emerald-100 text-xs sm:text-sm">
            <CheckCircle size={18} className="sm:w-[20px] sm:h-[20px]" />
            <span>{t.taken}</span>
          </div>
        ) : isMissed ? (
          <div className="flex items-center gap-2 text-red-600 font-bold bg-white px-3 py-1.5 rounded-lg shadow-sm border border-red-100 text-xs sm:text-sm">
            <AlertCircle size={18} className="sm:w-[20px] sm:h-[20px]" />
            <span>{t.missed}</span>
          </div>
        ) : (
          <button
            onClick={() => onTake(medicine._id)}
            className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-md shadow-primary-200 transition-colors active:scale-95 text-xs sm:text-base"
          >
            {t.takeAction}
          </button>
        )}
      </div>
    </div>
  );
};

export default MedicineCard;
