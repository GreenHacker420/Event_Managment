import { motion, AnimatePresence } from "framer-motion";
import { useChannelStore } from "../../../store/useChannelStore";
import { Palette, Truck, Megaphone, Cpu, ChevronRight, X, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const iconMap: Record<string, any> = {
    Palette,
    Truck,
    Megaphone,
    Cpu,
    Users,
};

const colorOptions = [
    'bg-[#ffcc00]',
    'bg-[#ff4d4d]',
    'bg-[#4dffb8]',
    'bg-[#4d94ff]',
    'bg-[#ff94ff]',
    'bg-[#94ff4d]',
];

import { useParams } from "react-router-dom";
import { useEffect } from "react";

export const ChannelList = () => {
    const { eventId } = useParams();
    const { channels, activeChannelId, setActiveChannel, addChannel, fetchChannels } = useChannelStore();
    const [showModal, setShowModal] = useState(false);
    const [teamName, setTeamName] = useState("");
    const [teamDesc, setTeamDesc] = useState("");
    const [selectedColor, setSelectedColor] = useState(colorOptions[0]);

    useEffect(() => {
        if (eventId) {
            fetchChannels(eventId);
        }
    }, [eventId, fetchChannels]);

    const handleCreateTeam = () => {
        if (!teamName.trim()) {
            toast.error("Team name is required");
            return;
        }
        if (!eventId) return;

        addChannel(eventId, {
            name: teamName,
            description: teamDesc,
            icon: 'Users',
            color: selectedColor,
        });
        toast.success(`Team "${teamName}" created!`);
        setTeamName("");
        setTeamDesc("");
        setSelectedColor(colorOptions[0]);
        setShowModal(false);
    };

    return (
        <>
            <div className="h-full bg-[var(--color-paper)] border-r-2 border-[var(--color-ink)]/10 p-6 flex flex-col">
                <h2 className="font-serif text-3xl font-bold mb-8 text-[var(--color-ink)]">Teams</h2>

                <div className="space-y-4 flex-1 overflow-y-auto">
                    {channels.map((channel) => {
                        const Icon = iconMap[channel.icon] || Users;
                        const isActive = activeChannelId === channel.id;

                        return (
                            <motion.div
                                key={channel.id}
                                onClick={() => setActiveChannel(channel.id)}
                                className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer ${isActive
                                    ? "bg-[var(--color-surface)] border-[var(--color-ink)] shadow-[4px_4px_0px_var(--color-ink)]"
                                    : "bg-white border-transparent hover:border-[var(--color-ink)]/20 hover:bg-[var(--color-surface)]/50"
                                    }`}
                                whileHover={{ x: 5 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-[var(--color-ink)] ${channel.color}`}>
                                        <Icon className="text-[var(--color-ink)]" size={20} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-serif text-lg font-bold text-[var(--color-ink)]">{channel.name}</h3>
                                        <p className="font-hand text-sm text-[var(--color-ink)]/60 line-clamp-1">{channel.description}</p>
                                    </div>
                                    {isActive && <ChevronRight className="text-[var(--color-ink)]" />}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                <div className="pt-6 border-t-2 border-dashed border-[var(--color-ink)]/10">
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full py-3 border-2 border-dashed border-[var(--color-ink)]/30 rounded-xl font-hand text-[var(--color-ink)]/60 hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-all"
                    >
                        + New Team
                    </button>
                </div>
            </div>

            {/* Create Team Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border-2 border-[var(--color-ink)]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-serif font-bold">Create New Team</h3>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block font-hand text-sm text-[#1a1a1a]/60 mb-1">Team Name *</label>
                                    <input
                                        type="text"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        className="w-full border-2 border-[var(--color-ink)]/20 rounded-xl p-3 focus:border-[var(--color-accent)] focus:outline-none"
                                        placeholder="e.g., Catering"
                                    />
                                </div>

                                <div>
                                    <label className="block font-hand text-sm text-[#1a1a1a]/60 mb-1">Description</label>
                                    <textarea
                                        value={teamDesc}
                                        onChange={(e) => setTeamDesc(e.target.value)}
                                        rows={2}
                                        className="w-full border-2 border-[var(--color-ink)]/20 rounded-xl p-3 focus:border-[var(--color-accent)] focus:outline-none resize-none"
                                        placeholder="What does this team handle?"
                                    />
                                </div>

                                <div>
                                    <label className="block font-hand text-sm text-[#1a1a1a]/60 mb-2">Team Color</label>
                                    <div className="flex gap-2">
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setSelectedColor(color)}
                                                className={`w-10 h-10 rounded-full ${color} border-2 ${selectedColor === color ? 'border-[var(--color-ink)] scale-110' : 'border-transparent'} transition-all`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <button
                                    onClick={handleCreateTeam}
                                    className="w-full mt-4 py-3 bg-[var(--color-ink)] text-white font-hand text-lg rounded-xl hover:bg-[var(--color-ink)]/90 transition-colors"
                                >
                                    Create Team
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
