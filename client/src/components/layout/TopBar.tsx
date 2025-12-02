import { User, Bell, Search, Settings, LogOut } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CompleteProfileModal } from "../views/CompleteProfileModal";
import { useNavigate } from "react-router-dom";

export const TopBar = () => {
    const { user, logout } = useAppStore();
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [showCompleteProfile, setShowCompleteProfile] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            <CompleteProfileModal
                isOpen={showCompleteProfile}
                onClose={() => setShowCompleteProfile(false)}
            />

            <div className="fixed top-0 right-0 left-0 h-16 z-40 px-6 flex justify-between items-center pointer-events-none">
                {/* Left side spacer */}
                <div />

                {/* Right side actions */}
                <div className="flex items-center gap-4 pointer-events-auto mt-4">
                    {!user?.isProfileComplete && (
                        <motion.button
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            onClick={() => setShowCompleteProfile(true)}
                            className="bg-[var(--color-accent)] text-[var(--color-paper)] px-4 py-2 rounded-lg border-2 border-[var(--color-ink)] shadow-[4px_4px_0px_var(--color-ink)] font-bold text-sm hover:translate-y-[-2px] transition-transform"
                        >
                            Complete Profile
                        </motion.button>
                    )}

                    <div className="flex items-center gap-2 bg-[var(--color-paper)] p-2 rounded-full border-2 border-[var(--color-ink)] shadow-[4px_4px_0px_var(--color-ink)]">
                        <button className="p-2 hover:bg-[var(--color-ink)]/5 rounded-full transition-colors">
                            <Search size={20} className="text-[var(--color-ink)]" />
                        </button>
                        <button className="p-2 hover:bg-[var(--color-ink)]/5 rounded-full transition-colors">
                            <Bell size={20} className="text-[var(--color-ink)]" />
                        </button>

                        <div className="w-px h-6 bg-[var(--color-ink)]/20 mx-1" />

                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="flex items-center gap-2 pl-2 pr-1 hover:bg-[var(--color-ink)]/5 rounded-full transition-colors"
                            >
                                <span className="font-hand font-bold text-sm hidden md:block">
                                    {user?.name || "Guest"}
                                </span>
                                <div className="w-8 h-8 bg-[var(--color-ink)] rounded-full flex items-center justify-center text-[var(--color-paper)]">
                                    <User size={16} />
                                </div>
                            </button>

                            <AnimatePresence>
                                {showProfileMenu && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-4 w-64 bg-[var(--color-paper)] border-2 border-[var(--color-ink)] rounded-xl shadow-[8px_8px_0px_var(--color-ink)] overflow-hidden"
                                    >
                                        <div className="p-4 border-b-2 border-[var(--color-ink)]/10 bg-[var(--color-ink)]/5">
                                            <p className="font-serif font-bold text-lg">{user?.name}</p>
                                            {user?.role && <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-ink)]/60">{user.role}</p>}
                                            {user?.company && <p className="text-xs font-serif italic text-[var(--color-ink)]/40">{user.company}</p>}
                                        </div>
                                        <div className="p-2">
                                            <button
                                                onClick={() => {
                                                    navigate('/profile');
                                                    setShowProfileMenu(false);
                                                }}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-[var(--color-ink)]/5 rounded-lg transition-colors text-left"
                                            >
                                                <User size={18} />
                                                <span className="font-hand">Profile</span>
                                            </button>
                                            <button className="w-full flex items-center gap-3 p-3 hover:bg-[var(--color-ink)]/5 rounded-lg transition-colors text-left">
                                                <Settings size={18} />
                                                <span className="font-hand">Settings</span>
                                            </button>
                                            <div className="h-px bg-[var(--color-ink)]/10 my-1" />
                                            <button
                                                onClick={logout}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-red-50 text-red-600 rounded-lg transition-colors text-left"
                                            >
                                                <LogOut size={18} />
                                                <span className="font-hand font-bold">Log Out</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};
