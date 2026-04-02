import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import API from "../utils/api";
import clsx from "clsx";
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  UserX,
  Pill,
  UserCheck,
  Shield,
  Loader2,
} from "lucide-react";

const StatCard = ({ icon: Icon, label, value, accent }) => (
  <div className="glass p-4 sm:p-5 rounded-2xl flex items-start gap-4 hover:scale-[1.01] transition-transform">
    <div
      className={clsx(
        "p-3 rounded-xl shadow-inner shrink-0",
        accent === "teal" && "bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600",
        accent === "slate" && "bg-gradient-to-br from-slate-100 to-slate-50 text-slate-600",
        accent === "amber" && "bg-gradient-to-br from-amber-100 to-amber-50 text-amber-700",
        accent === "rose" && "bg-gradient-to-br from-rose-100 to-rose-50 text-rose-600"
      )}
    >
      <Icon size={22} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl sm:text-3xl font-black text-slate-800 tabular-nums">{value}</p>
    </div>
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [caretakers, setCaretakers] = useState([]);
  const [unassigned, setUnassigned] = useState([]);
  const [patientsMedicines, setPatientsMedicines] = useState([]);
  const [assigningId, setAssigningId] = useState(null);
  const [selection, setSelection] = useState({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, careRes, unRes, pmRes] = await Promise.all([
        API.get("/admin/stats"),
        API.get("/admin/caretakers"),
        API.get("/admin/unassigned-patients"),
        API.get("/admin/patients-medicines"),
      ]);
      if (statsRes.data.success) setStats(statsRes.data.data);
      if (careRes.data.success) setCaretakers(careRes.data.data || []);
      if (unRes.data.success) setUnassigned(unRes.data.data || []);
      if (pmRes.data.success) setPatientsMedicines(pmRes.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const onVoice = (e) => {
      const d = e.detail;
      if (!d) return;
      if (d.type === "refresh") loadData();
      if (d.type === "scrollTo" && d.id) {
        document.getElementById(d.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };
    window.addEventListener("med-mate-voice", onVoice);
    return () => window.removeEventListener("med-mate-voice", onVoice);
  }, [loadData]);

  const handleAssign = async (patientId) => {
    const caretakerId = selection[patientId];
    if (!caretakerId) return;
    setAssigningId(patientId);
    try {
      const res = await API.put("/admin/assign-patient", { patientId, caretakerId });
      if (res.data.success) {
        setSelection((prev) => {
          const next = { ...prev };
          delete next[patientId];
          return next;
        });
        await loadData();
      }
    } catch (e) {
      console.error(e);
      alert(e.response?.data?.message || t.adminAssignmentFailed);
    } finally {
      setAssigningId(null);
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3 text-slate-500">
        <Loader2 className="animate-spin text-primary-600" size={32} />
        <span className="font-medium">{t.loadingStats}</span>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
            {t.adminPanel}
            {user?.name && (
              <span className="text-gradient">
                {" "}
                — {user.name.split(" ")[0]}
              </span>
            )}
          </h1>
          <p className="text-slate-500 font-medium flex items-center gap-2 flex-wrap">
            <Shield size={16} className="text-primary-600 shrink-0" />
            {t.adminSubtitle}
          </p>
        </div>
      </div>

      {/* Stats */}
      <section id="admin-overview">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <LayoutDashboard size={20} className="text-primary-600" />
          {t.systemOverview}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard icon={Users} label={t.patients} value={stats?.patients ?? "—"} accent="teal" />
          <StatCard icon={HeartHandshake} label={t.caretakers} value={stats?.caretakers ?? "—"} accent="slate" />
          <StatCard icon={UserX} label={t.unassignedPatients} value={stats?.unassignedPatients ?? "—"} accent="amber" />
          <StatCard icon={Pill} label={t.totalMedicines} value={stats?.medicines ?? "—"} accent="rose" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4">
          <StatCard icon={Shield} label={t.admins} value={stats?.admins ?? "—"} accent="slate" />
          <StatCard icon={UserCheck} label={t.verifiedUsers} value={stats?.verifiedUsers ?? "—"} accent="teal" />
          <StatCard icon={Users} label={t.totalUsers} value={stats?.totalUsers ?? "—"} accent="slate" />
        </div>
      </section>

      {/* Caretakers table / cards */}
      <section id="admin-caretakers">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <HeartHandshake size={20} className="text-primary-600" />
          {t.caretakersPatientsTitle}
        </h2>
        <div className="hidden md:block surface-raised rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 font-bold text-slate-600">{t.name}</th>
                  <th className="px-4 py-3 font-bold text-slate-600">{t.email}</th>
                  <th className="px-4 py-3 font-bold text-slate-600 text-right">{t.assignedPatients}</th>
                </tr>
              </thead>
              <tbody>
                {caretakers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                      {t.noCaretakers}
                    </td>
                  </tr>
                ) : (
                  caretakers.map((c) => (
                    <tr key={c._id} className="border-b border-slate-50 last:border-0 hover:bg-primary-50/30">
                      <td className="px-4 py-3 font-semibold text-slate-800">{c.name}</td>
                      <td className="px-4 py-3 text-slate-600">{c.email}</td>
                      <td className="px-4 py-3 text-right font-bold text-primary-700 tabular-nums">
                        {c.assignedPatients}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="md:hidden space-y-3">
          {caretakers.length === 0 ? (
            <div className="p-6 text-center text-slate-500 glass rounded-2xl">{t.noCaretakers}</div>
          ) : (
            caretakers.map((c) => (
              <div key={c._id} className="glass p-4 rounded-2xl flex justify-between items-center gap-3">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{c.name}</p>
                  <p className="text-xs text-slate-500 truncate">{c.email}</p>
                </div>
                <span className="shrink-0 bg-primary-100 text-primary-800 font-black px-3 py-1 rounded-full text-sm tabular-nums">
                  {c.assignedPatients}
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Patients & their medicines */}
      <section id="admin-patients-medicines">
        <h2 className="text-lg font-bold text-slate-800 mb-1 flex items-center gap-2">
          <Pill size={20} className="text-primary-600" />
          {t.patientsMedicinesTitle}
        </h2>
        <p className="text-sm text-slate-500 font-medium mb-4">{t.patientsMedicinesSubtitle}</p>

        {patientsMedicines.length === 0 ? (
          <div className="p-8 text-center glass rounded-2xl text-slate-500 font-medium">{t.noPatientsYet}</div>
        ) : (
          <div className="space-y-4">
            {patientsMedicines.map((p) => (
              <div key={p._id} className="glass rounded-2xl overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100/80 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-lg">{p.name}</p>
                    <p className="text-sm text-slate-500 truncate">{p.email}</p>
                    <p className="text-xs font-semibold text-primary-600 mt-2">
                      {t.caretakerLabel}:{" "}
                      {p.caretaker?.name ? (
                        <span className="text-slate-700">{p.caretaker.name}</span>
                      ) : (
                        <span className="text-amber-700">{t.unassignedCaretaker}</span>
                      )}
                    </p>
                  </div>
                  <span className="shrink-0 self-start bg-primary-100 text-primary-800 font-bold px-3 py-1.5 rounded-full text-sm tabular-nums">
                    {p.medicines?.length || 0}
                  </span>
                </div>

                {!p.medicines || p.medicines.length === 0 ? (
                  <p className="px-4 sm:px-5 py-6 text-slate-500 text-sm font-medium">{t.noMedicinesListed}</p>
                ) : (
                  <>
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50/80 border-b border-slate-100">
                          <tr>
                            <th className="px-4 py-2.5 font-bold text-slate-600">{t.medName}</th>
                            <th className="px-4 py-2.5 font-bold text-slate-600">{t.medDosage}</th>
                            <th className="px-4 py-2.5 font-bold text-slate-600">{t.medTime}</th>
                            <th className="px-4 py-2.5 font-bold text-slate-600">{t.medType}</th>
                            <th className="px-4 py-2.5 font-bold text-slate-600">{t.medStatus}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.medicines.map((m) => (
                            <tr
                              key={m._id}
                              className="border-b border-slate-50 last:border-0 hover:bg-primary-50/20"
                            >
                              <td className="px-4 py-2.5 font-semibold text-slate-800">{m.name}</td>
                              <td className="px-4 py-2.5 text-slate-600">{m.dosage || "—"}</td>
                              <td className="px-4 py-2.5 text-slate-600 tabular-nums">{m.time || "—"}</td>
                              <td className="px-4 py-2.5 text-slate-600">{m.type || "—"}</td>
                              <td className="px-4 py-2.5">
                                <span
                                  className={clsx(
                                    "text-xs font-bold px-2 py-1 rounded-lg",
                                    String(m.status).toLowerCase() === "taken"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-amber-100 text-amber-800"
                                  )}
                                >
                                  {m.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="md:hidden divide-y divide-slate-100">
                      {p.medicines.map((m) => (
                        <div key={m._id} className="px-4 py-3 space-y-1">
                          <p className="font-bold text-slate-800">{m.name}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span>
                              {t.medDosage}: <span className="text-slate-700">{m.dosage || "—"}</span>
                            </span>
                            <span>
                              {t.medTime}: <span className="text-slate-700 tabular-nums">{m.time || "—"}</span>
                            </span>
                            {m.type && (
                              <span>
                                {t.medType}: <span className="text-slate-700">{m.type}</span>
                              </span>
                            )}
                          </div>
                          <span
                            className={clsx(
                              "inline-block text-xs font-bold px-2 py-0.5 rounded-lg mt-1",
                              String(m.status).toLowerCase() === "taken"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            )}
                          >
                            {m.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Unassigned */}
      <section id="admin-unassigned">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <UserX size={20} className="text-amber-600" />
          {t.unassignedSection}
        </h2>
        {unassigned.length === 0 ? (
          <div className="p-8 text-center glass rounded-2xl text-slate-500 font-medium">{t.allPatientsAssigned}</div>
        ) : (
          <div className="space-y-3">
            {unassigned.map((p) => (
              <div
                key={p._id}
                className="glass p-4 sm:p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800">{p.name}</p>
                  <p className="text-sm text-slate-500 truncate">{p.email}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                  <select
                    value={selection[p._id] || ""}
                    onChange={(e) =>
                      setSelection((prev) => ({ ...prev, [p._id]: e.target.value }))
                    }
                    className="w-full sm:w-56 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 font-medium focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none"
                  >
                    <option value="">{t.selectCaretaker}</option>
                    {caretakers.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={!selection[p._id] || assigningId === p._id}
                    onClick={() => handleAssign(p._id)}
                    className={clsx(
                      "w-full sm:w-auto px-6 py-3 rounded-xl font-bold shadow-lg transition-all",
                      selection[p._id] && assigningId !== p._id
                        ? "bg-primary-600 text-white hover:bg-primary-700 shadow-primary-200"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    )}
                  >
                    {assigningId === p._id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={18} />
                        {t.assigning}
                      </span>
                    ) : (
                      t.assign
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
