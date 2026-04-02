import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Pill, RefreshCw, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyEmail, resendCode } = useAuth();
    const { t } = useLanguage();

    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get("email") || "";

    const [email, setEmail] = useState(emailParam);
    const [verificationCode, setVerificationCode] = useState("");
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        if (!emailParam) {
            setError(t.verifyEmailMissing);
        }
    }, [emailParam, t]);

    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [countdown]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");
        setIsLoading(true);

        try {
            const result = await verifyEmail({
                email,
                code: verificationCode,
            });

            if (result.success) {
                setSuccessMsg(result.message || t.verifySuccessMsg);
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

    const handleResend = async () => {
        if (countdown > 0 || !email) return;

        setError("");
        setResendLoading(true);
        try {
            const result = await resendCode(email);
            if (result.success) {
                setSuccessMsg(t.resendSuccess);
                setCountdown(60);
            } else {
                setError(result.message || t.resendFailed);
            }
        } catch (err) {
            setError(err.response?.data?.message || t.resendError);
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-lg max-w-md w-full border border-slate-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="p-3 bg-primary-100 rounded-2xl mb-4">
                        <Pill size={40} className="text-primary-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">{t.verifyEmailTitle}</h1>
                    <p className="text-slate-500 mt-2 text-center">
                        {email
                            ? `${t.verifyCodeSentPrefix} ${email}`
                            : t.verifyNeedEmail}
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

                <form onSubmit={handleVerify} className="space-y-6">
                    {!emailParam && (
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                {t.emailAddressLabel}
                            </label>
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
                        <label className="block text-sm font-medium text-slate-700 mb-2 text-center">
                            {t.verificationCodeLabel}
                        </label>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-100 outline-none text-center text-3xl tracking-[1em] font-bold"
                            placeholder="000000"
                            maxLength={6}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || !email || !!successMsg}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-md shadow-primary-200 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            t.verifyAndContinue
                        )}
                    </button>
                </form>

                <div className="mt-8 space-y-4 text-center">
                    <div className="text-slate-500">
                        {t.didntReceiveCode}{" "}
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={countdown > 0 || resendLoading || !email}
                            className="text-primary-600 font-bold hover:underline disabled:text-slate-400 disabled:no-underline flex items-center gap-1 mx-auto mt-1"
                        >
                            {resendLoading ? (
                                <RefreshCw size={16} className="animate-spin" />
                            ) : countdown > 0 ? (
                                `${t.resendInPrefix} ${countdown}s`
                            ) : (
                                t.resendCodeButton
                            )}
                        </button>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => navigate("/signup")}
                            className="text-slate-500 text-sm font-medium hover:text-primary-600 transition-colors"
                        >
                            {t.backToSignup}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
