import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import API from '../utils/api';
import { formatTime } from '../utils/formatTime';
import clsx from 'clsx';

const History = () => {
    const { t } = useLanguage();
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    const isTimePassed = (scheduledTime, dateStr) => {
        const now = new Date();
        const checkDate = new Date(dateStr);
        checkDate.setHours(0, 0, 0, 0);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (checkDate < today) return true;
        if (checkDate > today) return false;

        const [hours, minutes] = scheduledTime.split(':').map(Number);
        const scheduled = new Date();
        scheduled.setHours(hours, minutes, 0, 0);
        
        return now >= scheduled;
    };

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const [medsRes, logsRes] = await Promise.all([
                    API.get("/medicine"),
                    API.get("/medicine/history")
                ]);

                if (medsRes.data.success && logsRes.data.success) {
                    const medicines = medsRes.data.data;
                    const logs = logsRes.data.data;

                    // Find medicines that exist in logs but are no longer in the dashboard
                    const medicinesFromLogs = [];
                    logs.forEach(log => {
                        const exists = medicines.some(m => m._id === log.medicine || m.name === log.medicineName);
                        const alreadyInList = medicinesFromLogs.some(m => m.name === log.medicineName);
                        if (!exists && !alreadyInList) {
                            medicinesFromLogs.push({
                                _id: log.medicine,
                                name: log.medicineName,
                                time: log.time,
                                dosage: log.dosage,
                                createdAt: log.date, // Proxy for creation date
                                isDeleted: true
                            });
                        }
                    });

                    const allMeds = [...medicines, ...medicinesFromLogs];

                    // Generate history for the last 7 days
                    const days = [];
                    for (let i = 0; i < 7; i++) {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        days.push(d.toISOString().split('T')[0]);
                    }

                    const formattedHistory = days.map((dateStr, idx) => {
                        const medsForDay = allMeds.map(med => {
                            // Check if this medicine existed on this date (based on createdAt)
                            const createdDate = new Date(med.createdAt).toISOString().split('T')[0];
                            if (createdDate > dateStr) return null;

                            // Check if time has passed
                            if (!isTimePassed(med.time, dateStr)) return null;

                            // Find log for this medicine on this date
                            const log = logs.find(l => {
                                const logDate = new Date(l.date).toISOString().split('T')[0];
                                return logDate === dateStr && (l.medicine === med._id || l.medicineName === med.name);
                            });

                            if (med.isDeleted && !log) return null;

                            return {
                                name: med.name,
                                time: med.time,
                                status: log ? 'taken' : 'missed'
                            };
                        }).filter(Boolean);

                        return {
                            id: idx,
                            date: dateStr,
                            meds: medsForDay
                        };
                    }).filter(day => day.meds.length > 0);

                    setHistoryData(formattedHistory);
                }
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const formatDateLabel = (dateStr) => {
        const d = new Date(dateStr);
        const today = new Date();
        today.setHours(0,0,0,0);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0,0,0,0);

        const checkD = new Date(dateStr);
        checkD.setHours(0,0,0,0);

        if (checkD.getTime() === today.getTime()) return t.today || "Today";
        if (checkD.getTime() === yesterday.getTime()) return t.yesterday || "Yesterday";
        
        return d.toLocaleDateString(undefined, { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    };


    return (
        <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">{t.history}</h1>

            <div className="space-y-6">
                {loading ? (
                    <div className="flex justify-center p-12">
                        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                    </div>
                ) : historyData.length > 0 ? (
                    historyData.map((day) => (
                        <div key={day.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                            <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <Calendar size={20} className="text-primary-500" />
                                {formatDateLabel(day.date)}
                            </h2>

                            <div className="space-y-3">
                                {day.meds.map((med, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-slate-800">{med.name}</span>
                                            <span className="text-sm text-slate-500">{formatTime(med.time)}</span>
                                        </div>

                                        <div className={clsx(
                                            "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
                                            med.status === 'taken' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                        )}>
                                            {med.status === 'taken' ? <CheckCircle size={14} /> : <XCircle size={14} />}
                                            {med.status === 'taken' ? t.historyStatusTaken : t.historyStatusMissed}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
                        <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                        <p className="font-bold">{t.noHistoryYet || "No history records for today yet"}</p>
                    </div>
                )}
            </div>
        </div>
    );
};


export default History;
