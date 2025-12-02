import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useAppStore } from "../../store/useAppStore";

interface CompleteProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const CompleteProfileModal = ({ isOpen, onClose }: CompleteProfileModalProps) => {
    const { updateProfile } = useAppStore();
    const [formData, setFormData] = useState({
        role: "",
        company: "",
        phone: "",
        bio: "",
        location: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile(formData);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-[var(--color-paper)] border-2 border-[var(--color-ink)] shadow-[8px_8px_0px_var(--color-ink)] rounded-xl p-8 z-[70]"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-serif font-bold">Complete Your Profile</h2>
                            <button onClick={onClose} className="p-2 hover:bg-[var(--color-ink)]/5 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block font-hand text-lg mb-1">Role / Title</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 bg-white border-2 border-[var(--color-ink)] rounded-lg focus:outline-none focus:shadow-[4px_4px_0px_var(--color-ink)] transition-shadow"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    placeholder="e.g. Event Planner"
                                />
                            </div>

                            <div>
                                <label className="block font-hand text-lg mb-1">Company</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-white border-2 border-[var(--color-ink)] rounded-lg focus:outline-none focus:shadow-[4px_4px_0px_var(--color-ink)] transition-shadow"
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="e.g. Dream Events Co."
                                />
                            </div>

                            <div>
                                <label className="block font-hand text-lg mb-1">Bio</label>
                                <textarea
                                    className="w-full p-3 bg-white border-2 border-[var(--color-ink)] rounded-lg focus:outline-none focus:shadow-[4px_4px_0px_var(--color-ink)] transition-shadow resize-none h-24"
                                    value={formData.bio}
                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                    placeholder="Tell us a bit about yourself..."
                                />
                            </div>

                            <div>
                                <label className="block font-hand text-lg mb-1">Location</label>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-white border-2 border-[var(--color-ink)] rounded-lg focus:outline-none focus:shadow-[4px_4px_0px_var(--color-ink)] transition-shadow"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. New York, NY"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 mt-4 bg-[var(--color-accent)] text-[var(--color-paper)] font-bold rounded-lg border-2 border-[var(--color-ink)] shadow-[4px_4px_0px_var(--color-ink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--color-ink)] transition-all"
                            >
                                Save Profile
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
