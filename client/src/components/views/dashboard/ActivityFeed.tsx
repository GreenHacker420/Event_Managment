import { motion } from "framer-motion";
import { CheckSquare, DollarSign, Users, Hash, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { activitiesApi } from "../../../lib/api";
import { useAppStore } from "../../../store/useAppStore";

const iconMap: Record<string, any> = {
    task_created: CheckSquare,
    task_completed: CheckSquare,
    expense_added: DollarSign,
    member_added: Users,
    channel_created: Hash,
    event_updated: Calendar,
};

const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
};

export const ActivityFeed = () => {
    const { activeEventId } = useAppStore();

    const { data: activities = [] } = useQuery({
        queryKey: ['activities', activeEventId],
        queryFn: () => activeEventId ? activitiesApi.getAll(activeEventId) : Promise.resolve([]),
        enabled: !!activeEventId,
    });

    return (
        <div className="bg-[var(--color-surface)] p-8 rounded-3xl border-2 border-[var(--color-ink)] shadow-[8px_8px_0px_rgba(0,0,0,0.05)] h-full">
            <h2 className="font-serif text-3xl font-bold mb-6 text-[var(--color-ink)]">Recent Activity</h2>

            {activities.length === 0 ? (
                <p className="font-hand text-lg text-[var(--color-ink)]/40 text-center py-8">
                    No activity yet. Start by creating tasks or expenses!
                </p>
            ) : (
                <div className="relative pl-4 border-l-2 border-dashed border-[var(--color-ink)]/20 space-y-8">
                    {activities.slice(0, 5).map((item: any, index: number) => {
                        const Icon = iconMap[item.type] || CheckSquare;
                        return (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="relative"
                            >
                                <div className="absolute -left-[21px] top-1 w-3 h-3 bg-[var(--color-ink)] rounded-full border-2 border-[var(--color-surface)]" />
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 p-1.5 bg-white rounded-lg border border-[var(--color-ink)]/10">
                                        <Icon size={14} className="text-[var(--color-ink)]" />
                                    </div>
                                    <div>
                                        <p className="font-hand text-lg leading-tight text-[var(--color-ink)]">
                                            {item.description}
                                        </p>
                                        <span className="text-xs font-sans text-[var(--color-ink)]/40 uppercase tracking-wider">
                                            {formatTime(item.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
