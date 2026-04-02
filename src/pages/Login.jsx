import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pill } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login({ email, password });
      if (result.success) {
        navigate("/");
      } else {
        setError(result.message || t.loginFailed);
      }
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.isVerified === false) {
        navigate(`/verify-email?email=${errorData.email}`);
      } else {
        setError(errorData?.message || t.loginErrorGeneric);
      }
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
          <h1 className="text-3xl font-bold text-slate-800">{t.loginWelcomeBack}</h1>
          <p className="text-slate-500 mt-2">{t.loginSubtitle}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t.email}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-lg"
              placeholder={t.enterEmailPlaceholder}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t.password}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-lg"
              placeholder="••••••••"
            />
            <div className="flex justify-end mt-2">
              <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:underline">
                {t.forgotPasswordLink}
              </Link>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-md shadow-primary-200 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              t.signInBtn
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500">
          {t.noAccount}{" "}
          <Link to="/signup" className="text-primary-600 font-semibold hover:underline">
            {t.createAccountLink}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
