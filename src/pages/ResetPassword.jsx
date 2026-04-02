import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Pill, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyResetCode, resetPassword } = useAuth();
    const { t } = useLanguage();

    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get("email") || "";

    const [email, setEmail] = useState(emailParam);
    const [code, setCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [step, setStep] = useState(1);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!emailParam && !email) {
            setError(t.verifyEmailMissing);
        }
    }, [emailParam, email, t]);

    const handleVerifyCode = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const result = await verifyResetCode(email, code);
            if (result.success) {
                setStep(2);
            } else {
                setError(result.message || t.invalidResetCode);
            }
        } catch (err) {
            setError(err.response?.data?.message || t.verifyFailed);
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            return setError(t.passwordsMismatch);
        }
        if (newPassword.length < 6) {
            return setError(t.passwordMin6);
        }

        setError("");
        setSuccessMsg("");
        setIsLoading(true);

        try {
            const result = await resetPassword({ email, code, newPassword });
            if (result.success) {
                setSuccessMsg(t.resetSuccess);
                setTimeout(() => {
                    navigate("/login");
                }, 2000);
            } else {
                setError(result.message || t.verifyFailed);
            }
        } catch (err) {
            setError(err.response?.data?.message || t.verifyErrorGeneric);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full border border-slate-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-primary-100 rounded-2xl mb-4">
                        <Pill size={40} className="text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">{t.resetPasswordTitle}</h1>
                    <p className="text-slate-500 mt-2 text-center">
                        {step === 1 ? `${t.resetCodeSentTo} ${email}` : t.resetNewPasswordHint}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 animate-shake">
                        {error}
                    </div>
                )}

                {successMsg && (
                    <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 text-sm font-medium border border-green-100 flex items-center gap-2">
                        <CheckCircle2 size={18} />
                        {successMsg}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleVerifyCode} className="space-y-6">
                        {!emailParam && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">{t.emailAddressLabel}</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                    placeholder={t.enterEmailPlaceholder}
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2 text-center">{t.resetCodeLabel}</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-100 outline-none text-center text-3xl tracking-[1em] font-bold"
                                placeholder="000000"
                                maxLength={6}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !email}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-md shadow-primary-200 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                t.verifyCodeBtn
                            )}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">{t.newPasswordLabel}</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">{t.confirmNewPass}</label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !!successMsg}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-md shadow-primary-200 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                t.resetPasswordBtn
                            )}
                        </button>
                    </form>
                )}

                <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                    <Link
                        to="/login"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-primary-600 font-medium transition-colors"
                    >
                        <ArrowLeft size={16} /> {t.backToLogin}
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
