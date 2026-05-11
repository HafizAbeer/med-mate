import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const DeleteModal = ({ isOpen, onClose, onConfirm, itemName }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          <div className="p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
                <Trash2 size={32} />
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <h3 className="text-2xl font-black text-slate-800 mb-2">
              {t.deleteMedicine || "Delete Medicine"}
            </h3>
            <p className="text-slate-500 font-medium leading-relaxed">
              {t.deleteConfirm || "Are you sure you want to delete this medicine?"}
              {itemName && (
                <span className="block mt-2 font-bold text-slate-800">
                  "{itemName}"
                </span>
              )}
            </p>

            <div className="flex gap-3 mt-8">
              <button
                onClick={onClose}
                className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                {t.cancel || "Cancel"}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className="flex-[1.5] py-4 px-6 bg-red-600 text-white rounded-2xl font-bold shadow-lg shadow-red-200 hover:bg-red-700 active:scale-95 transition-all"
              >
                {t.deleteMedicine || "Delete"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default DeleteModal;
