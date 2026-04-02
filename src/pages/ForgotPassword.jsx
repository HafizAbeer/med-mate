import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Pill, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { forgotPassword } = useAuth();
    const { t } = useLanguage();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setIsLoading(true);

        try {
            const result = await forgotPassword(email);
            if (result.success) {
                setSuccessMsg(result.message || t.resendSuccess);
                setTimeout(() => {
                    navigate(`/reset-password?email=${encodeURIComponent(email)}`);
                }, 2000);
            } else {
                setError(result.message || t.resendFailed);
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
                    <h1 className="text-2xl font-bold text-slate-800">{t.forgotPasswordTitle}</h1>
                    <p className="text-slate-500 mt-2 text-center">{t.forgotPasswordSubtitle}</p>
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">{t.emailAddressLabel}</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                placeholder={t.enterEmailPlaceholder}
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
                            t.sendResetCode
                        )}
                    </button>
                </form>

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

export default ForgotPassword;
