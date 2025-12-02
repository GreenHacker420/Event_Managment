import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, LogOut, Settings } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

export const UserMenu = () => {
    const { user, logout } = useAppStore();
    const [isOpen, setIsOpen] = useState(false);

    const handleSignOut = () => {
        logout();
        setIsOpen(false);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-[var(--color-accent)] border-2 border-[var(--color-ink)] flex items-center justify-center hover:shadow-[2px_2px_0px_var(--color-ink)] transition-all"
            >
                <User size={20} className="text-[var(--color-ink)]" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                            className="absolute right-0 top-12 w-56 bg-white border-2 border-[var(--color-ink)] rounded-xl shadow-[4px_4px_0px_var(--color-ink)] z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b-2 border-dashed border-[var(--color-ink)]/20">
                                <p className="font-serif font-bold text-[var(--color-ink)]">{user?.name || 'Guest'}</p>
                                <p className="font-hand text-sm text-[var(--color-ink)]/60">Welcome back!</p>
                            </div>
                            <div className="p-2">
                                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--color-surface)] transition-colors text-left">
                                    <Settings size={18} />
                                    <span className="font-hand">Profile</span>
                                </button>
                                <button 
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors text-left"
                                >
                                    <LogOut size={18} />
                                    <span className="font-hand">Sign out</span>
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
