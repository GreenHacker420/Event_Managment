import { motion } from "framer-motion";
import { Calendar, MapPin, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { eventsApi } from "../../../lib/api";

import { useAppStore } from "../../../store/useAppStore";

export const EventList = () => {
    const navigate = useNavigate();
    const { setActiveEventId } = useAppStore();
    const { data: events, isLoading, error } = useQuery({
        queryKey: ['events'],
        queryFn: eventsApi.getAll,
        select: (data) => data.map((event: any) => ({
            ...event,

            budget: {
                total: Number(event.budget) || 0,
                spent: 0
            },
            status: event.status || 'Planning',
            color: "bg-[#ffcc00]"
        }))
    });

    const handleEventClick = (eventId: string) => {
        setActiveEventId(eventId);
        navigate(`/events/${eventId}/channels`);
    };

    if (isLoading) return <div className="p-8 text-center font-hand text-xl">Loading events...</div>;
    if (error) return <div className="p-8 text-center font-hand text-xl text-red-500">Error loading events. Please try again.</div>;

    return (
        <div className="bg-[var(--color-paper)] p-8 rounded-3xl border-2 border-[var(--color-ink)] shadow-[8px_8px_0px_rgba(0,0,0,0.05)] relative">
            {/* Binder Rings */}
            <div className="absolute top-0 left-8 -translate-y-1/2 flex gap-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="w-4 h-12 bg-[var(--color-ink)] rounded-full border-2 border-white" />
                ))}
            </div>

            <h2 className="font-serif text-3xl font-bold mb-6 mt-4 text-[var(--color-ink)]">Active Events</h2>

            <div className="space-y-4">
                {events?.length === 0 ? (
                    <div className="text-center py-8 font-hand text-[var(--color-ink)]/60">
                        No events found. Create one to get started!
                    </div>
                ) : (
                    events?.map((event: any, index: number) => (
                        <motion.div
                            key={event.id}
                            onClick={() => handleEventClick(event.id)}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-white p-4 rounded-xl border-2 border-[var(--color-ink)]/10 hover:border-[var(--color-ink)] transition-colors cursor-pointer"
                            whileHover={{ x: 5 }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-serif text-xl font-bold text-[var(--color-ink)] group-hover:text-[var(--color-accent)] transition-colors">
                                        {event.title}
                                    </h3>
                                    <div className="flex items-center gap-4 mt-2 text-sm font-hand text-[var(--color-ink)]/60">
                                        <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(event.date).toLocaleDateString()}</span>
                                        {event.location && <span className="flex items-center gap-1"><MapPin size={14} /> {event.location}</span>}
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold border border-[var(--color-ink)] ${event.status === 'active' ? 'bg-[var(--color-accent)]' :
                                    event.status === 'completed' ? 'bg-[var(--color-secondary)]' : 'bg-[var(--color-surface)]'
                                    }`}>
                                    {event.status}
                                </div>
                            </div>

                            {/* Hover Action */}
                            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <MoreHorizontal className="text-[var(--color-ink)]" />
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <button
                onClick={() => navigate('/create')}
                className="w-full mt-6 py-3 border-2 border-dashed border-[var(--color-ink)]/30 rounded-xl font-hand text-[var(--color-ink)]/60 hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-all"
            >
                + Create New Event
            </button>
        </div>
    );
};
