import React, { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import API from "../utils/api";
import { useSearchParams } from "react-router-dom";
import { Pill, Activity, User, Phone, Calendar, Plus } from "lucide-react";
import { isValidPhoneNumber } from "libphonenumber-js";
import {
  countryList,
  CustomCountrySelector,
  getMaxLengthForCountry,
} from "../components/CountryPhonePicker";

const emptyPatientForm = () => ({
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  dateOfBirth: "",
  gender: "",
  phoneBody: "",
});

const CaretakerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [patientForm, setPatientForm] = useState(emptyPatientForm);
  const [selectedCountry, setSelectedCountry] = useState(
    countryList.find((c) => c.code === "PK") || countryList[0]
  );
  const maxLength = getMaxLengthForCountry(selectedCountry.code);

  useEffect(() => {
    if (searchParams.get("addPatient") === "true") {
      setShowAddModal(true);
    } else {
      setShowAddModal(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!showAddModal) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [showAddModal]);

  useEffect(() => {
    if (patientForm.phoneBody.length > maxLength) {
      setPatientForm((prev) => ({
        ...prev,
        phoneBody: prev.phoneBody.slice(0, maxLength),
      }));
    }
  }, [selectedCountry, maxLength]);

  const [addLoading, setAddLoading] = useState(false);
  const [addMessage, setAddMessage] = useState({ type: "", text: "" });

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddMessage({ type: "", text: "" });
    setPatientForm(emptyPatientForm());
    const current = new URLSearchParams(searchParams);
    current.delete("addPatient");
    setSearchParams(current, { replace: true });
  };

  const showAddModalRef = useRef(showAddModal);
  showAddModalRef.current = showAddModal;
  const closeAddModalRef = useRef(closeAddModal);
  closeAddModalRef.current = closeAddModal;

  useEffect(() => {
    const onVoice = (e) => {
      if (e.detail?.type === "closeModal" && showAddModalRef.current) {
        closeAddModalRef.current();
      }
    };
    window.addEventListener("med-mate-voice", onVoice);
    return () => window.removeEventListener("med-mate-voice", onVoice);
  }, []);

  const fetchPatients = async () => {
    try {
      const res = await API.get("/caretaker/patients");
      if (res.data.success) {
        setPatients(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatientData = async () => {
    setLoading(true);
    try {
      const url = selectedPatient
        ? `/medicine?patientId=${selectedPatient._id}`
        : "/medicine";
      const response = await API.get(url);
      if (response.data.success) {
        const normalizedMeds = response.data.data.map((med) => ({
          ...med,
          status: med.status.toLowerCase(),
        }));
        setMedicines(normalizedMeds);
      }
    } catch (error) {
      console.error("Error fetching patient medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientData();
  }, [selectedPatient]);

  const handleAddPatient = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    setAddMessage({ type: "", text: "" });

    if (patientForm.firstName.trim().length < 3 || patientForm.lastName.trim().length < 3) {
      setAddMessage({ type: "error", text: t.addPatientNameError });
      setAddLoading(false);
      return;
    }
    if (patientForm.password.length < 8) {
      setAddMessage({ type: "error", text: t.passwordMin8 });
      setAddLoading(false);
      return;
    }
    if (!patientForm.gender) {
      setAddMessage({ type: "error", text: t.signupGenderError });
      setAddLoading(false);
      return;
    }

    const fullPhone = `${selectedCountry.callingCode}${patientForm.phoneBody}`;
    if (!isValidPhoneNumber(fullPhone, selectedCountry.code)) {
      setAddMessage({ type: "error", text: t.invalidPhone });
      setAddLoading(false);
      return;
    }

    try {
      const res = await API.post("/caretaker/add-patient", {
        firstName: patientForm.firstName.trim(),
        lastName: patientForm.lastName.trim(),
        email: patientForm.email.trim(),
        password: patientForm.password,
        dateOfBirth: patientForm.dateOfBirth,
        gender: patientForm.gender,
        phoneNumber: fullPhone,
      });
      if (res.data.success) {
        setAddMessage({ type: "success", text: res.data.message });
        setPatientForm(emptyPatientForm());
        fetchPatients();
        setTimeout(() => closeAddModal(), 2000);
      }
    } catch (err) {
      setAddMessage({
        type: "error",
        text: err.response?.data?.message || t.addPatientFailed,
      });
    } finally {
      setAddLoading(false);
    }
  };

  const completedMeds = medicines.filter((m) => m.status === "taken").length;
  const missedCount = medicines.filter((m) => m.status === "missed").length;
  const totalMeds = medicines.length;
  const adherence = totalMeds > 0 ? Math.round((completedMeds / totalMeds) * 100) : 0;
  const upcomingMeds = medicines.filter((m) => m.status === "pending");
  const nextDose = upcomingMeds.length > 0 ? upcomingMeds[0].time : "--:--";

  const callHref =
    selectedPatient?.phoneNumber &&
    `tel:${String(selectedPatient.phoneNumber).replace(/\s/g, "")}`;

  return (
    <div className="animate-fade-in-up space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setSelectedPatient(null)}
          className={clsx(
            "px-5 py-2.5 rounded-2xl font-bold transition-all border shadow-sm",
            !selectedPatient
              ? "bg-primary-600 text-white border-primary-600"
              : "bg-white text-slate-600 border-slate-100 hover:border-primary-200"
          )}
        >
          {t.ctAllPatients}
        </button>
        {patients.map((p) => (
          <button
            key={p._id}
            onClick={() => setSelectedPatient(p)}
            className={clsx(
              "px-5 py-2.5 rounded-2xl font-bold transition-all border shadow-sm flex items-center gap-2",
              selectedPatient?._id === p._id
                ? "bg-primary-600 text-white border-primary-600"
                : "bg-white text-slate-600 border-slate-100 hover:border-primary-200"
            )}
          >
            <User size={16} />
            {p.name}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const next = new URLSearchParams(searchParams);
            next.set("addPatient", "true");
            setSearchParams(next);
          }}
          className="px-5 py-2.5 rounded-2xl font-bold transition-all border border-dashed border-primary-300 text-primary-600 hover:bg-primary-50 flex items-center gap-2"
        >
          <Plus size={18} />
          {t.ctAddPatient}
        </button>
      </div>

      {showAddModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-900/40 backdrop-blur-sm p-4 cursor-pointer"
          onClick={(e) => e.target === e.currentTarget && closeAddModal()}
        >
          <div
            className="flex h-[min(90vh,720px)] w-full max-w-lg min-h-0 flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-scale-in cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="shrink-0 px-6 pt-6 sm:px-8 sm:pt-8">
              <h3 className="text-2xl font-black text-slate-800 mb-2">{t.addNewPatientTitle}</h3>
              <p className="text-slate-500 font-medium text-sm">{t.addNewPatientSubtitle}</p>
            </div>

            <form onSubmit={handleAddPatient} className="flex min-h-0 flex-1 flex-col">
              <div className="scrollbar-themed min-h-0 flex-1 overflow-y-auto px-6 sm:px-8 py-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.firstNameLabel}</label>
                  <input
                    type="text"
                    required
                    value={patientForm.firstName}
                    onChange={(e) => setPatientForm({ ...patientForm, firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100 transition-all outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.lastNameLabel}</label>
                  <input
                    type="text"
                    required
                    value={patientForm.lastName}
                    onChange={(e) => setPatientForm({ ...patientForm, lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.dateOfBirthLabel}</label>
                  <input
                    type="date"
                    required
                    value={patientForm.dateOfBirth}
                    onChange={(e) => setPatientForm({ ...patientForm, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100 transition-all outline-none text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.genderLabel}</label>
                  <select
                    required
                    value={patientForm.gender}
                    onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100 transition-all outline-none text-slate-700"
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
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.phoneLabel}</label>
                <div className="flex rounded-2xl border border-slate-100 bg-slate-50 focus-within:ring-4 focus-within:ring-primary-100 focus-within:border-primary-500 transition-all overflow-visible">
                  <CustomCountrySelector selected={selectedCountry} onSelect={setSelectedCountry} />
                  <input
                    type="tel"
                    required
                    value={patientForm.phoneBody}
                    maxLength={maxLength}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      if (val.length <= maxLength) {
                        setPatientForm({ ...patientForm, phoneBody: val });
                      }
                    }}
                    className="flex-1 px-4 py-3 outline-none bg-transparent min-w-0"
                    placeholder={t.phonePlaceholderPk}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.email}</label>
                <input
                  type="email"
                  required
                  value={patientForm.email}
                  onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100 transition-all outline-none"
                  placeholder={t.ctEmailPlaceholder}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">{t.newPasswordLabel}</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={patientForm.password}
                  onChange={(e) => setPatientForm({ ...patientForm, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-100 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100 transition-all outline-none"
                  placeholder="••••••••"
                />
                <p className="text-xs text-slate-400 mt-1.5 font-medium">
                  {t.patientPasswordHint}
                </p>
              </div>

              {addMessage.text && (
                <div
                  className={clsx(
                    "p-4 rounded-2xl font-bold text-sm",
                    addMessage.type === "success"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-red-50 text-red-600"
                  )}
                >
                  {addMessage.text}
                </div>
              )}
              </div>

              <div className="flex shrink-0 gap-3 border-t border-slate-100 bg-white px-6 py-4 sm:px-8 sm:pb-6">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="flex-1 py-4 px-6 rounded-2xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="flex-[1.5] py-4 px-8 bg-primary-600 text-white rounded-2xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 active:scale-95 transition-all disabled:opacity-50"
                >
                  {addLoading ? t.saving : t.addPatientBtn}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-cyan-700/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 text-emerald-100 mb-3">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-md">
                <Activity size={18} className="animate-pulse" />
              </div>
              <span className="font-bold text-xs tracking-[0.2em] uppercase">
                {t.caretakerDashboard}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              {selectedPatient ? `${t.ctMonitoringPrefix} ${selectedPatient.name}` : t.ctMonitoringAll}
            </h1>
            <p className="mt-3 text-emerald-50/80 flex items-center gap-2 font-medium">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              {t.ctActiveSession}
            </p>
          </div>
          <div className="bg-white/15 p-4 rounded-2xl backdrop-blur-xl border border-white/20 shadow-inner group transition-all hover:scale-110">
            <User size={36} className="text-white group-hover:rotate-12 transition-transform" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 relative z-10">
          <div className="glass-morphism p-5 rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
            <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider mb-2">{t.ctAdherence}</p>
            <p className="text-3xl font-black">{adherence}%</p>
          </div>
          <div className="glass-morphism p-5 rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
            <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider mb-2">{t.ctNextDose}</p>
            <p className="text-2xl font-black">{nextDose}</p>
          </div>
          <div className="glass-morphism p-5 rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
            <p className="text-emerald-100/70 text-xs font-bold uppercase tracking-wider mb-2">{t.ctMissed}</p>
            <p className="text-2xl font-black text-white">{missedCount}</p>
          </div>
          {callHref ? (
            <a
              href={callHref}
              className="bg-white text-emerald-700 hover:bg-emerald-50 hover:shadow-lg p-5 rounded-2xl font-black transition-all flex items-center justify-center gap-3 transform active:scale-95 shadow-xl"
            >
              <Phone size={22} fill="currentColor" className="opacity-30" />
              <span>{t.callPatient}</span>
            </a>
          ) : (
            <div
              className="bg-white/20 text-emerald-50 p-5 rounded-2xl font-bold flex flex-col items-center justify-center gap-1 text-center border border-white/10"
              title={t.selectPatientToCall}
            >
              <Phone size={22} className="opacity-50" />
              <span className="text-xs leading-tight">{t.selectPatientToCallShort}</span>
            </div>
          )}
        </div>
      </div>

      <div className="px-2">
        <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-6">
          <div className="bg-primary-100 p-2 rounded-xl">
            <Pill className="text-primary-600" size={24} />
          </div>
          {t.ctPatientSchedule}
        </h2>

        <div className="grid gap-5">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
              <span className="w-12 h-12 border-4 border-primary-100 border-t-primary-600 rounded-full animate-spin" />
              <p className="text-slate-400 font-bold animate-pulse">{t.ctFetchingData}</p>
            </div>
          ) : medicines.length > 0 ? (
            medicines.map((med) => (
              <div
                key={med._id}
                className="group bg-white p-6 rounded-[1.5rem] border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-xl hover:shadow-primary-500/5 hover:border-primary-100 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`p-4 rounded-2xl transition-all duration-500 ${
                      med.status === "taken"
                        ? "bg-emerald-50 text-emerald-500 rotate-12"
                        : "bg-slate-50 text-slate-400 group-hover:rotate-6"
                    }`}
                  >
                    <Pill size={28} />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 text-xl group-hover:text-primary-600 transition-colors uppercase tracking-tight">
                      {med.name}
                    </h3>
                    <div className="flex items-center gap-3 text-slate-500 mt-2 font-bold text-sm flex-wrap">
                      <Calendar size={16} className="text-primary-500 shrink-0" />
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-xs">{med.time}</span>
                      <span className="text-slate-200 hidden sm:inline">|</span>
                      <span>{med.dosage}</span>
                    </div>
                  </div>
                </div>

                <div
                  className={`px-5 py-2.5 rounded-xl font-black text-xs tracking-widest uppercase shadow-sm ${
                    med.status === "taken"
                      ? "bg-emerald-500 text-white"
                      : med.status === "pending"
                        ? "bg-amber-400 text-white"
                        : "bg-red-500 text-white"
                  }`}
                >
                  {med.status}
                </div>
              </div>
            ))
          ) : (
            <div className="p-16 text-center bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-200 text-slate-400 flex flex-col items-center gap-4">
              <div className="bg-white p-4 rounded-full shadow-sm">
                <Pill size={40} className="text-slate-200" />
              </div>
              <p className="font-bold text-lg">{t.ctNoMedicineRecords}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CaretakerDashboard;
