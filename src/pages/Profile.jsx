import React, { useState, useCallback, useEffect, useRef } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import {
  Globe,
  Bell,
  Shield,
  LogOut,
  ChevronRight,
  CheckCircle2,
  X,
  PenLine,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Profile = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const { user, logout, role, updateProfile, updatePassword } = useAuth();
  const navigate = useNavigate();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successModalMessage, setSuccessModalMessage] = useState("");

  const [showNameModal, setShowNameModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [nameFirst, setNameFirst] = useState("");
  const [nameLast, setNameLast] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameLoading, setNameLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const getInitialNames = useCallback(() => {
    if (user?.firstName && user?.lastName) {
      return { firstName: user.firstName, lastName: user.lastName };
    }
    const parts = (user?.name || "").trim().split(/\s+/);
    if (parts.length === 0) return { firstName: "", lastName: "" };
    if (parts.length === 1) return { firstName: parts[0], lastName: "" };
    return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
  }, [user]);

  const openNameModal = () => {
    const { firstName, lastName } = getInitialNames();
    setNameFirst(firstName);
    setNameLast(lastName);
    setNameError("");
    setShowNameModal(true);
  };

  const openPasswordModal = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setShowPasswordModal(true);
  };

  const profileVoiceRef = useRef({ openNameModal, openPasswordModal });
  profileVoiceRef.current = { openNameModal, openPasswordModal };

  useEffect(() => {
    const onVoice = (e) => {
      const d = e.detail;
      if (!d) return;
      if (d.type === "closeModal") {
        setShowNameModal(false);
        setShowPasswordModal(false);
        setShowPrivacyModal(false);
        setShowSuccessModal(false);
        return;
      }
      if (d.type === "profileIntent") {
        if (d.intent === "editName") profileVoiceRef.current.openNameModal();
        else if (d.intent === "editPassword") profileVoiceRef.current.openPasswordModal();
        else if (d.intent === "privacy") setShowPrivacyModal(true);
      }
    };
    window.addEventListener("med-mate-voice", onVoice);
    return () => window.removeEventListener("med-mate-voice", onVoice);
  }, []);

  const showLanguageToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2600);
  };

  const openSuccessModal = (msg) => {
    setSuccessModalMessage(msg);
    setShowSuccessModal(true);
  };

  const handleSaveName = async (e) => {
    e.preventDefault();
    setNameError("");
    setNameLoading(true);
    try {
      const res = await updateProfile({
        firstName: nameFirst.trim(),
        lastName: nameLast.trim(),
      });
      if (res.success) {
        setShowNameModal(false);
        openSuccessModal(t.nameUpdateSuccess);
      } else {
        setNameError(res.message || "Failed");
      }
    } catch (err) {
      setNameError(err.response?.data?.message || "Failed to update");
    } finally {
      setNameLoading(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    if (newPassword !== confirmPassword) {
      setPasswordError(t.passwordsDoNotMatch);
      return;
    }
    setPasswordLoading(true);
    try {
      const res = await updatePassword({
        currentPassword,
        newPassword,
      });
      if (res.success) {
        setShowPasswordModal(false);
        openSuccessModal(t.passwordUpdateSuccess);
      } else {
        setPasswordError(res.message || "Failed");
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const MenuItem = ({ icon: Icon, label, onClick, value, isToggle }) => (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full flex items-center justify-between p-5 hover:bg-white/40 transition-all duration-300 group rounded-2xl mb-2 last:mb-0 text-left"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/50 rounded-xl text-primary-600 shadow-sm transition-transform group-hover:scale-110 group-hover:rotate-3">
          <Icon size={22} />
        </div>
        <span className="font-semibold text-slate-700 tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {value && (
          <span className="text-sm text-slate-500 font-medium bg-white/30 px-3 py-1 rounded-full">{value}</span>
        )}
        {isToggle ? (
          <div
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${
              notificationsEnabled ? "bg-primary-500" : "bg-slate-300"
            }`}
          >
            <motion.div
              animate={{ x: notificationsEnabled ? 24 : 0 }}
              className="w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </div>
        ) : (
          <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
        )}
      </div>
    </motion.button>
  );

  return (
    <div className="animate-fade-in-up pb-12 relative">
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary-100/30 blur-3xl rounded-full -z-10" />

      <h1 className="text-3xl font-black text-slate-800 mb-8 tracking-tighter">
        {t.profile}
      </h1>

      {/* User Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-8 rounded-[2rem] flex items-center gap-6 mb-8 hover:shadow-xl transition-shadow duration-500 group"
      >
        <div className="relative">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg transform group-hover:rotate-6 transition-transform">
            {user?.name?.charAt(0) || "U"}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-secondary-500 border-4 border-white rounded-full shadow-sm" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 leading-tight">
            <span className="text-gradient">{user?.name || t.dashboardGuestUser}</span>
          </h2>
          <p className="text-slate-500 font-medium">{user?.email || t.noEmailProvided}</p>
          <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mt-2">
            {role === "admin" ? t.roleAdmin : role === "caretaker" ? t.roleCaretaker : t.rolePatient}
          </p>
        </div>
      </motion.div>

      {/* Account: name & password — same for patient, caretaker, admin */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="glass p-3 rounded-[2rem] shadow-sm mb-8"
      >
        <MenuItem icon={PenLine} label={t.editName} onClick={openNameModal} />
        <MenuItem icon={KeyRound} label={t.changePassword} onClick={openPasswordModal} />
      </motion.div>

      {/* Settings List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-3 rounded-[2rem] shadow-sm mb-8"
      >
        <MenuItem
          icon={Globe}
          label={t.profileLanguage}
          value={language === "en" ? t.englishLabel : t.urduLabel}
          onClick={() => {
            toggleLanguage();
            showLanguageToast(t.languageUpdated);
          }}
        />
        <MenuItem
          icon={Bell}
          label={t.profileNotifications}
          isToggle
          onClick={() => setNotificationsEnabled(!notificationsEnabled)}
        />
        <MenuItem
          icon={Shield}
          label={t.profilePrivacySecurity}
          onClick={() => setShowPrivacyModal(true)}
        />
      </motion.div>

      {/* Logout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass p-3 rounded-[2rem] shadow-sm"
      >
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 p-5 hover:bg-red-50/50 transition-all rounded-2xl text-red-600 text-left group active:scale-[0.98]"
        >
          <div className="p-3 bg-red-100/50 rounded-xl text-red-600 group-hover:scale-110 transition-transform shadow-sm">
            <LogOut size={22} />
          </div>
          <span className="font-bold tracking-tight">{t.logout}</span>
        </button>
      </motion.div>

      {/* Edit name modal */}
      <AnimatePresence>
        {showNameModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600" />
              <button
                type="button"
                onClick={() => setShowNameModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                  <PenLine size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">{t.editName}</h3>
              </div>
              <form onSubmit={handleSaveName} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">{t.firstNameLabel}</label>
                  <input
                    type="text"
                    value={nameFirst}
                    onChange={(e) => setNameFirst(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
                    required
                    minLength={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">{t.lastNameLabel}</label>
                  <input
                    type="text"
                    value={nameLast}
                    onChange={(e) => setNameLast(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
                    required
                    minLength={3}
                  />
                </div>
                {nameError && <p className="text-sm text-red-600 font-medium">{nameError}</p>}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNameModal(false)}
                    className="flex-1 py-3 rounded-xl font-bold border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={nameLoading}
                    className="flex-1 py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {nameLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        {t.saving}
                      </>
                    ) : (
                      t.saveChanges
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Change password modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600" />
              <button
                type="button"
                onClick={() => setShowPasswordModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-primary-50 rounded-xl text-primary-600">
                  <KeyRound size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-800">{t.changePassword}</h3>
              </div>
              <form onSubmit={handleSavePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">{t.currentPasswordLabel}</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
                    required
                    autoComplete="current-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">{t.newPasswordLabel}</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-600 mb-1.5">{t.confirmPasswordLabel}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/80 focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
                    required
                    minLength={8}
                    autoComplete="new-password"
                  />
                </div>
                {passwordError && <p className="text-sm text-red-600 font-medium">{passwordError}</p>}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="flex-1 py-3 rounded-xl font-bold border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex-1 py-3 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {passwordLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        {t.updatingPassword}
                      </>
                    ) : (
                      t.updatePasswordBtn
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success completion (name / password) — themed modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 320 }}
              className="glass p-8 rounded-[2rem] max-w-sm w-full shadow-2xl border border-white/60 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />
              <div className="flex flex-col items-center text-center pt-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.08, damping: 12 }}
                  className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mb-5 shadow-inner ring-4 ring-primary-50"
                >
                  <CheckCircle2 size={40} strokeWidth={2.25} className="text-primary-600" />
                </motion.div>
                <h3 className="text-xl font-black text-slate-800 mb-2 tracking-tight">{t.successTitle}</h3>
                <p className="text-slate-600 font-medium leading-relaxed mb-7">{successModalMessage}</p>
                <button
                  type="button"
                  onClick={() => setShowSuccessModal(false)}
                  className="w-full py-3.5 rounded-xl font-bold bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-300/40 active:scale-[0.98] transition-all"
                >
                  {t.gotIt}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Privacy Modal */}
      <AnimatePresence>
        {showPrivacyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600" />
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-500 mb-4">
                  <Shield size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{t.privacyModalTitle}</h3>
                <p className="text-slate-500 mb-6">
                  {t.privacyModalBody}
                </p>
                <div className="flex items-center gap-2 text-green-600 font-bold mb-6">
                  <CheckCircle2 size={20} />
                  <span>{t.privacyAccountSecure}</span>
                </div>
                <button
                  onClick={() => setShowPrivacyModal(false)}
                  className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold active:scale-95 transition-transform"
                >
                  {t.closeBtn}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Themed toast (language change) */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-[min(90vw,20rem)]"
          >
            <div className="glass px-5 py-3.5 rounded-2xl border border-white/60 shadow-xl shadow-primary-900/5 flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary-100 text-primary-600 shrink-0">
                <Globe size={20} strokeWidth={2.25} />
              </div>
              <span className="font-bold text-slate-800 text-sm leading-snug">{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;
