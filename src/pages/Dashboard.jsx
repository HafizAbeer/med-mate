import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import MedicineCard from "../components/MedicineCard";
import { CalendarDays, Bell, User } from "lucide-react";

const Dashboard = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await API.get("/medicine");
        if (response.data.success) {
          // Normalize status from backend 'Taken' to frontend 'taken' if needed
          const normalizedMeds = response.data.data.map(med => ({
            ...med,
            status: med.status.toLowerCase()
          }));
          setMedicines(normalizedMeds);
        }
      } catch (error) {
        console.error("Error fetching medicines:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMedicines();
  }, []);

  const handleTake = async (id) => {
    try {
      const response = await API.put(`/medicine/${id}`, { status: "Taken" });
      if (response.data.success) {
        setMedicines((prev) =>
          prev.map((m) => (m._id === id ? { ...m, status: "taken" } : m))
        );
      }
    } catch (error) {
      console.error("Error updating medicine status:", error);
    }
  };

  const upcomingMeds = medicines.filter((m) => m.status === "pending");
  const otherMeds = medicines.filter((m) => m.status !== "pending");


  return (
    <div className="animate-fade-in-up">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            {t.welcome}, <span className="text-gradient">{user?.name?.split(' ')[0] || t.dashboardGuestUser}</span>
          </h1>
          {user?.caretakerName && (
            <p className="text-primary-600 font-bold text-sm mb-3 flex items-center gap-2">
              <User size={16} />
              {t.dashboardCaretakerPrefix} {user.caretakerName}
            </p>
          )}
          <p className="text-slate-500 flex items-center gap-2 font-medium bg-white/50 w-fit px-3 py-1 rounded-full border border-white/60 backdrop-blur-sm">
            <CalendarDays size={18} className="text-primary-500" />
            <span className="capitalize">{new Date().toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </p>
        </div>

        <div className="flex gap-3">
          <div className="glass p-4 rounded-2xl flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-default">
            <div className="bg-gradient-to-br from-orange-100 to-orange-50 p-3 rounded-xl text-orange-500 shadow-inner">
              <Bell size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                {t.nextDose}
              </p>
              <p className="font-bold text-slate-800 text-lg">
                {upcomingMeds.length > 0 ? upcomingMeds[0].time : "--:--"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          {t.upcoming}
          <span className="bg-primary-100 text-primary-700 text-xs px-2 py-1 rounded-full">
            {upcomingMeds.length}
          </span>
        </h2>
        <div className="grid grid-cols-1 gap-4">
          {upcomingMeds.length > 0 ? (
            upcomingMeds.map((med) => (
              <MedicineCard key={med._id} medicine={med} onTake={handleTake} />
            ))
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-500">
              {t.noUpcoming}
            </div>
          )}
        </div>
      </section>

      {/* Other Status Section */}
      {otherMeds.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-slate-800 mb-4">
            {t.completedMissed}
          </h2>
          <div className="grid grid-cols-1 gap-4 opacity-80">
            {otherMeds.map((med) => (
              <MedicineCard key={med._id} medicine={med} onTake={handleTake} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
