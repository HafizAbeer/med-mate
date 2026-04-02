import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Plus, User } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import clsx from "clsx";

const AddMedicine = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { role } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    dosage: "",
    frequency: "Daily",
    time: "08:00",
  });
  const [patients, setPatients] = useState([]);
  const [patientId, setPatientId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onVoice = (e) => {
      if (e.detail?.type === "closeModal") navigate(-1);
    };
    window.addEventListener("med-mate-voice", onVoice);
    return () => window.removeEventListener("med-mate-voice", onVoice);
  }, [navigate]);

  useEffect(() => {
    if (role !== "caretaker") return;
    const load = async () => {
      try {
        const res = await API.get("/caretaker/patients");
        if (res.data.success) {
          const list = res.data.data || [];
          setPatients(list);
          if (list.length === 1) setPatientId(list[0]._id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (role === "caretaker" && !patientId) {
      setError(t.selectPatientForMedicine);
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        dosage: formData.dosage,
        time: formData.time,
        type: "pills",
      };
      if (role === "caretaker") {
        payload.patientId = patientId;
      }

      const response = await API.post("/medicine", payload);

      if (response.data.success) {
        navigate("/");
      }
    } catch (err) {
      setError(err.response?.data?.message || t.addMedFailed);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} className="text-slate-600" />
        </button>
        <h1 className="text-2xl font-bold text-slate-800">{t.addMedicine}</h1>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 italic">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          {role === "caretaker" && (
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                <User size={18} className="text-primary-600" />
                {t.medicineForPatient}
              </label>
              <select
                required
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
                className={clsx(
                  "w-full px-4 py-4 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-lg bg-slate-50 focus:bg-white transition-all",
                  patients.length === 0 && "opacity-60"
                )}
                disabled={patients.length === 0}
              >
                <option value="">
                  {patients.length === 0 ? t.noPatientsAddFirst : t.selectPatientPlaceholder}
                </option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t.addMedNameLabel}</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-lg bg-slate-50 focus:bg-white transition-all"
              placeholder={t.addMedPlaceholderName}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t.addMedDosageLabel}</label>
              <input
                type="text"
                required
                value={formData.dosage}
                onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
                className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-lg bg-slate-50 focus:bg-white transition-all"
                placeholder={t.addMedPlaceholderDosage}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">{t.addMedFrequencyLabel}</label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-4 rounded-xl border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-lg bg-slate-50 focus:bg-white transition-all"
              >
                <option value="Daily">{t.freqDaily}</option>
                <option value="Twice Daily">{t.freqTwice}</option>
                <option value="Weekly">{t.freqWeekly}</option>
                <option value="As needed">{t.freqAsNeeded}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t.addMedScheduleLabel}</label>
            <div className="flex items-center gap-4 p-4 rounded-xl border border-slate-200 bg-slate-50">
              <Clock className="text-primary-500" />
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="bg-transparent text-xl font-bold text-slate-700 outline-none w-full"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading || (role === "caretaker" && patients.length === 0)}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg shadow-primary-200 disabled:opacity-50"
            >
              {isLoading ? (
                <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Plus size={24} />
                  {t.addMedSave}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicine;
