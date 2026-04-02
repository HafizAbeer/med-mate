import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Pill, User, HeartHandshake } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import clsx from "clsx";
import { isValidPhoneNumber } from "libphonenumber-js";
import {
  countryList,
  CustomCountrySelector,
  getMaxLengthForCountry,
} from "../components/CountryPhonePicker";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { t } = useLanguage();
  const [role, setRole] = useState("patient");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dateOfBirth: "",
    gender: "",
    phoneBody: "",
  });

  const [selectedCountry, setSelectedCountry] = useState(
    countryList.find((c) => c.code === "PK") || countryList[0]
  );

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const maxLength = getMaxLengthForCountry(selectedCountry.code);

  useEffect(() => {
    if (formData.phoneBody.length > maxLength) {
      setFormData((prev) => ({
        ...prev,
        phoneBody: prev.phoneBody.slice(0, maxLength),
      }));
    }
  }, [selectedCountry, maxLength]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.firstName.length < 3) {
      setError(t.signupFirstNameError);
      return;
    }
    if (formData.lastName.length < 3) {
      setError(t.signupLastNameError);
      return;
    }
    if (formData.password.length < 8) {
      setError(t.signupPasswordError);
      return;
    }
    if (!formData.gender) {
      setError(t.signupGenderError);
      return;
    }

    const fullPhoneNumber = `${selectedCountry.callingCode}${formData.phoneBody}`;

    if (!isValidPhoneNumber(fullPhoneNumber, selectedCountry.code)) {
      setError(`${t.signupPhoneError} ${selectedCountry.code}`);
      return;
    }

    setIsLoading(true);

    try {
      const result = await signup({
        ...formData,
        phoneNumber: fullPhoneNumber,
        role,
      });

      if (result.success) {
        navigate(`/verify-email?email=${formData.email}`);
      } else {
        setError(result.message || t.signupFailed);
      }
    } catch (err) {
      console.log("Signup error:", err);
      setError(err.response?.data?.message || err.message || t.signupErrorGeneric);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-lg max-w-lg w-full border border-slate-100 my-8">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-primary-100 rounded-2xl mb-4">
            <Pill size={40} className="text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">{t.signupTitle}</h1>
          <p className="text-slate-500 mt-2">{t.signupSubtitle}</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole("patient")}
              className={clsx(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                role === "patient"
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-slate-100 hover:border-slate-200 text-slate-500"
              )}
            >
              <User size={24} />
              <span className="font-semibold">{t.rolePatient}</span>
            </button>
            <button
              type="button"
              onClick={() => setRole("caretaker")}
              className={clsx(
                "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
                role === "caretaker"
                  ? "border-primary-500 bg-primary-50 text-primary-700"
                  : "border-slate-100 hover:border-slate-200 text-slate-500"
              )}
            >
              <HeartHandshake size={24} />
              <span className="font-semibold">{t.roleCaretaker}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.firstNameLabel}</label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.lastNameLabel}</label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.dateOfBirthLabel}</label>
              <input
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-100 outline-none transition-all text-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.genderLabel}</label>
              <select
                required
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-100 outline-none transition-all bg-white text-slate-600"
              >
                <option value="" disabled>
                  {t.selectGender}
                </option>
                <option value="Male">{t.male}</option>
                <option value="Female">{t.female}</option>
                <option value="Other">{t.otherGender}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.contactNumber}</label>
            <div className="flex rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-primary-100 transition-all overflow-visible">
              <CustomCountrySelector selected={selectedCountry} onSelect={setSelectedCountry} />
              <input
                type="tel"
                required
                value={formData.phoneBody}
                maxLength={maxLength}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "");
                  if (val.length <= maxLength) {
                    setFormData({ ...formData, phoneBody: val });
                  }
                }}
                className="flex-1 px-4 py-3 outline-none bg-transparent"
                placeholder={t.phonePlaceholderPk}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.email}</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              placeholder={t.emailPlaceholderGeneric}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.password}</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-md shadow-primary-200 mt-2 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              t.createAccountBtn
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500">
          {t.alreadyHaveAccount}{" "}
          <Link to="/login" className="text-primary-600 font-semibold hover:underline">
            {t.signInLink}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
