import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store/useAppStore";
import { toast } from "sonner";

export const ProfileView = () => {
    const navigate = useNavigate();
    const { user, login } = useAppStore();
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [bio, setBio] = useState("");
    const [role, setRole] = useState("organizer");
    const [notifications, setNotifications] = useState(true);
    const [avatar, setAvatar] = useState<string | null>(null);

    const handleSave = () => {
        if (name.trim()) {
            login(name);
            toast.success("Profile updated successfully!");
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
                toast.success("Photo uploaded!");
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen w-full p-8 md:p-12 md:pl-32 max-w-5xl mx-auto pb-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <button
                    onClick={() => navigate("/")}
                    className="flex items-center gap-2 font-hand text-lg text-[var(--color-ink)]/60 hover:text-[var(--color-ink)] mb-8 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Dashboard
                </button>

                <header className="mb-12">
                    <h2 className="text-6xl font-serif font-bold text-[#1a1a1a] mb-4">
                        Your Profile
                    </h2>
                    <p className="text-xl font-hand text-[#1a1a1a]/60">
                        Manage your account settings and preferences.
                    </p>
                </header>

                <div className="space-y-12">
                    <div className="flex items-center gap-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full border-4 border-[var(--color-ink)] overflow-hidden bg-[var(--color-accent)] flex items-center justify-center shadow-[4px_4px_0px_var(--color-ink)]">
                                {avatar ? (
                                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-5xl font-serif font-bold text-[var(--color-ink)]">
                                        {name.charAt(0).toUpperCase() || "?"}
                                    </span>
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 w-10 h-10 bg-[var(--color-ink)] rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform border-2 border-white">
                                <Camera size={18} className="text-white" />
                                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                            </label>
                        </div>
                        <div>
                            <h3 className="text-2xl font-serif font-bold text-[var(--color-ink)]">{name || "Your Name"}</h3>
                            <p className="font-hand text-[var(--color-ink)]/60">Click the camera to change your photo</p>
                        </div>
                    </div>

                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Display Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-transparent text-4xl font-serif font-bold text-[var(--color-ink)] placeholder:text-[var(--color-ink)]/20 border-b-4 border-[var(--color-ink)]/10 focus:border-[var(--color-accent)] focus:outline-none py-4 transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-2">
                            <label className="block font-hand text-lg text-[#1a1a1a]/60">Email Address</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-transparent text-xl font-serif text-[var(--color-ink)] border-b-2 border-[var(--color-ink)]/10 focus:border-[var(--color-accent)] focus:outline-none py-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block font-hand text-lg text-[#1a1a1a]/60">Phone Number</label>
                            <input
                                type="tel"
                                placeholder="+1 (555) 000-0000"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-transparent text-xl font-serif text-[var(--color-ink)] border-b-2 border-[var(--color-ink)]/10 focus:border-[var(--color-accent)] focus:outline-none py-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block font-hand text-lg text-[#1a1a1a]/60">Location</label>
                            <input
                                type="text"
                                placeholder="City, Country"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-transparent text-xl font-serif text-[var(--color-ink)] border-b-2 border-[var(--color-ink)]/10 focus:border-[var(--color-accent)] focus:outline-none py-2"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block font-hand text-lg text-[#1a1a1a]/60">Role</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full bg-transparent text-xl font-serif text-[var(--color-ink)] border-b-2 border-[var(--color-ink)]/10 focus:border-[var(--color-accent)] focus:outline-none py-2 appearance-none cursor-pointer"
                            >
                                <option value="organizer">Event Organizer</option>
                                <option value="coordinator">Event Coordinator</option>
                                <option value="vendor">Vendor</option>
                                <option value="guest">Guest</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block font-hand text-lg text-[#1a1a1a]/60">Bio</label>
                        <textarea
                            rows={4}
                            placeholder="Tell us a bit about yourself..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full bg-[var(--color-ink)]/5 rounded-xl p-6 text-lg font-serif text-[var(--color-ink)] placeholder:text-[var(--color-ink)]/20 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/20 resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-between p-6 bg-[var(--color-surface)] rounded-xl border-2 border-[var(--color-ink)]/10">
                        <div>
                            <h4 className="font-serif font-bold text-lg text-[var(--color-ink)]">Email Notifications</h4>
                            <p className="font-hand text-[var(--color-ink)]/60">Receive updates about your events</p>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            className={`w-14 h-8 rounded-full border-2 border-[var(--color-ink)] transition-colors relative ${notifications ? 'bg-[var(--color-accent)]' : 'bg-white'}`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-[var(--color-ink)] absolute top-0.5 transition-all ${notifications ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                    </div>

                    <div className="flex justify-end gap-4 pt-8">
                        <motion.button
                            type="button"
                            onClick={() => navigate("/")}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-8 py-4 bg-transparent text-[var(--color-ink)] font-hand text-xl font-bold rounded-full border-2 border-[var(--color-ink)]/20 hover:border-[var(--color-ink)] transition-all"
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            type="button"
                            onClick={handleSave}
                            whileHover={{ scale: 1.05, rotate: 2 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-4 bg-[var(--color-ink)] text-[var(--color-paper)] font-hand text-xl font-bold rounded-full shadow-[4px_4px_0px_var(--color-accent)] border-2 border-transparent hover:border-[var(--color-accent)] transition-all"
                        >
                            Save Changes
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
