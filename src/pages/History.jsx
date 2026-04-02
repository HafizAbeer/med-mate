import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Calendar, CheckCircle, XCircle } from 'lucide-react';
import API from '../utils/api';
import clsx from 'clsx';

const History = () => {
    const { t } = useLanguage();
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await API.get("/medicine");
                if (response.data.success) {
                    // Simple grouping by date for demonstration
                    const grouped = [
                        {
                            id: 1,
                            meds: response.data.data.map(med => ({
                                name: med.name,
                                time: med.time,
                                status: med.status.toLowerCase()
                            }))
                        }
                    ];
                    setHistoryData(grouped);
                }
            } catch (error) {
                console.error("Error fetching history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);


    return (
        <div className="animate-fade-in">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">{t.history}</h1>

            <div className="space-y-6">
                {historyData.map((day) => (
                    <div key={day.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                            <Calendar size={20} className="text-primary-500" />
                            {t.historyAllTime}
                        </h2>

                        <div className="space-y-3">
                            {day.meds.map((med, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-50">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-800">{med.name}</span>
                                        <span className="text-sm text-slate-500">{med.time}</span>
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
                ))}
            </div>
        </div>
    );
};

export default History;
