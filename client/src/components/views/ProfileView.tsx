import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { toast } from "sonner";

export const ProfileView = () => {
    const navigate = useNavigate();
    const { user, login } = useAppStore();
    const [name, setName] = useState(user?.name || "");
    const [avatar, setAvatar] = useState<string | null>(null);

    const handleSave = () => {
        if (name.trim()) {
            login(name);
            toast.success("Profile updated!");
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen pb-32 px-8 pt-12 max-w-2xl mx-auto">
            <button
                onClick={() => navigate("/")}
                className="flex items-center gap-2 font-hand text-[var(--color-ink)]/60 hover:text-[var(--color-ink)] mb-8 transition-colors"
            >
                <ArrowLeft size={20} />
                Back to Dashboard
            </button>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-5xl font-serif font-bold mb-8">Profile</h1>

                <div className="bg-white border-2 border-[var(--color-ink)] rounded-2xl p-8 shadow-[8px_8px_0px_var(--color-ink)]">
                    <div className="flex flex-col items-center mb-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-[var(--color-ink)] overflow-hidden bg-[var(--color-accent)] flex items-center justify-center">
                                {avatar ? (
                                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl font-serif font-bold text-[var(--color-ink)]">
                                        {name.charAt(0).toUpperCase() || "?"}
                                    </span>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 w-10 h-10 bg-[var(--color-ink)] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                <Camera size={18} className="text-white" />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                        <p className="font-hand text-sm text-[var(--color-ink)]/50 mt-3">Click camera to upload photo</p>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block font-hand text-sm text-[var(--color-ink)]/60 mb-2">Display Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[var(--color-surface)] border-2 border-[var(--color-ink)]/20 rounded-xl py-3 px-4 focus:outline-none focus:border-[var(--color-ink)] transition-colors font-serif text-lg"
                                placeholder="Your name"
                            />
                        </div>

                        <div>
                            <label className="block font-hand text-sm text-[var(--color-ink)]/60 mb-2">Email</label>
                            <input
                                type="email"
                                disabled
                                value="Connected via Google"
                                className="w-full bg-[var(--color-surface)]/50 border-2 border-[var(--color-ink)]/10 rounded-xl py-3 px-4 font-serif text-lg text-[var(--color-ink)]/40 cursor-not-allowed"
                            />
                        </div>

                        <button
                            onClick={handleSave}
                            className="w-full mt-4 py-4 bg-[var(--color-ink)] text-white font-serif font-bold text-lg rounded-xl flex items-center justify-center gap-2 hover:bg-[var(--color-ink)]/90 transition-colors"
                        >
                            <Save size={20} />
                            Save Changes
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
