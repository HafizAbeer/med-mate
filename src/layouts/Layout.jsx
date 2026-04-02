import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Pill, History, Lightbulb, UserCircle, UserPlus, Globe, Mic, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import clsx from 'clsx';

const Layout = () => {
    const { role } = useAuth();
    const { t, language, toggleLanguage } = useLanguage();
    const location = useLocation();
    const { runVoiceCommand, isListening } = useVoiceCommands();

    const isAdmin = role === 'admin';

    const navItems = isAdmin
        ? [
            { to: "/", icon: LayoutDashboard, label: t.adminPanel, end: true },
            { to: "/profile", icon: UserCircle, label: t.profile },
        ]
        : [
            { to: "/", icon: LayoutDashboard, label: t.dashboard, end: true },
            ...(role === 'caretaker' ? [{ to: "/?addPatient=true", icon: UserPlus, label: t.addPatientNav, isAddPatient: true }] : []),
            { to: "/history", icon: History, label: t.history },
            { to: "/suggestions", icon: Lightbulb, label: t.suggestions },
            { to: "/profile", icon: UserCircle, label: t.profile },
        ];

    const isLinkActive = (item) => {
        const searchParams = new URLSearchParams(location.search);
        if (item.isAddPatient) {
            return searchParams.get('addPatient') === 'true';
        }
        // If it's the dashboard, it's only active if NOT adding a patient
        if (item.to === "/" && item.end) {
            return location.pathname === "/" && !searchParams.get('addPatient');
        }
        return location.pathname === item.to;
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row font-sans text-slate-900" dir={language === 'ur' ? 'rtl' : 'ltr'}>
            {/* Sidebar (Desktop) / Header (Mobile) */}
            <aside className={clsx(
                "glass md:w-64 md:h-[calc(100vh-2rem)] md:fixed flex-shrink-0 z-20 md:top-4 md:rounded-3xl transition-all duration-300",
                language === 'ur' ? "md:right-4" : "md:left-4",
                "md:flex md:flex-col md:min-h-0"
            )}>
                <div className="p-4 flex justify-between items-center md:flex-col md:items-start md:gap-6 h-16 md:h-auto shrink-0">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary-600">
                        <div className="p-1.5 bg-primary-100 rounded-lg">
                            <Pill size={24} className="text-primary-600" />
                        </div>
                        {t.appName}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={runVoiceCommand}
                            className={clsx(
                                "p-2 rounded-full transition-colors",
                                isListening ? "bg-red-100 text-red-600 animate-pulse" : "hover:bg-primary-50 text-slate-400 hover:text-primary-600"
                            )}
                            title={t.voiceCommandTitle}
                        >
                            <Mic size={20} />
                        </button>
                        <button
                            onClick={toggleLanguage}
                            className="md:hidden p-2 hover:bg-slate-100 rounded-full"
                        >
                            <Globe size={20} />
                        </button>
                    </div>
                </div>

                <nav className="hidden md:flex flex-col flex-1 min-h-0 overflow-y-auto scrollbar-themed px-4 gap-1 py-2">
                    {navItems.map((item) => {
                        const active = isLinkActive(item);
                        return (
                            <Link
                                key={`${item.to}-${item.label}`}
                                to={item.to}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-medium group shrink-0",
                                    active
                                        ? "bg-primary-50 text-primary-700 shadow-sm border border-primary-100"
                                        : "text-slate-500 hover:text-slate-900 hover:bg-white hover:shadow-sm"
                                )}
                            >
                                <item.icon size={20} className={clsx("transition-transform group-hover:scale-110 shrink-0", active ? "text-primary-600" : "text-slate-400 group-hover:text-primary-500")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="hidden md:block shrink-0 px-8 pt-2 pb-8 w-full border-t border-slate-100/60 mt-auto bg-white/40">
                    {!isAdmin && (
                    <Link
                        to="/add"
                        className="flex items-center justify-center gap-2 w-full p-4 bg-primary-600 text-white rounded-xl font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 hover:scale-[1.02] transition-all mb-4"
                    >
                        <Plus size={20} />
                        {t.addMedicine}
                    </Link>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <button
                            onClick={toggleLanguage}
                            className="flex items-center gap-2 text-sm text-slate-600 hover:text-primary-600 font-medium w-full"
                        >
                            <Globe size={16} />
                            {language === 'en' ? t.switchToUrdu : t.switchToEnglish}
                        </button>
                    </div>

                    {/* Mic Button Desktop */}
                    <button
                        type="button"
                        onClick={runVoiceCommand}
                        className={clsx(
                            "mt-4 flex items-center justify-center gap-2 w-full p-3 rounded-xl border border-slate-200 transition-all font-medium",
                            isListening ? "bg-red-50 text-red-600 border-red-200" : "bg-white text-slate-600 hover:border-primary-300 hover:text-primary-600"
                        )}
                    >
                        <Mic size={20} className={isListening ? "animate-pulse" : ""} />
                        <span>{isListening ? t.voiceListening : t.voiceCommandBtn}</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={clsx(
                "flex-1 p-4 md:p-8 pb-24 md:pb-8 transition-all duration-300",
                language === 'ur' ? "md:mr-[18rem]" : "md:ml-[18rem]"
            )}>
                <div className="max-w-5xl mx-auto">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/20 z-50 rounded-t-2xl pb-safe">
                {!isAdmin && (
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <Link
                        to="/add"
                        className="flex items-center justify-center w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg shadow-primary-500/30 hover:scale-110 transition-transform"
                    >
                        <Plus size={28} />
                    </Link>
                </div>
                )}

                <div className="flex justify-around items-center h-16 px-2">
                    {navItems.map((item) => {
                        const active = isLinkActive(item);
                        return (
                            <Link
                                key={`${item.to}-${item.label}`}
                                to={item.to}
                                className={clsx(
                                    "flex flex-col items-center gap-1 p-2 rounded-lg w-full",
                                    active ? "text-primary-600" : "text-slate-400"
                                )}
                            >
                                <item.icon size={24} strokeWidth={active ? 2.5 : 2} />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </div>
    );
};

export default Layout;
