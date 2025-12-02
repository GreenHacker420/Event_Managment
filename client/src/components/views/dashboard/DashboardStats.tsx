import { motion } from "framer-motion";
import { PieChart, TrendingUp, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { eventsApi, tasksApi, expensesApi } from "../../../lib/api";
import { useAppStore } from "../../../store/useAppStore";

export const DashboardStats = () => {
    const { activeEventId } = useAppStore();

    const { data: events = [] } = useQuery({
        queryKey: ['events'],
        queryFn: eventsApi.getAll,
    });

    const { data: tasks = [] } = useQuery({
        queryKey: ['tasks', activeEventId],
        queryFn: () => activeEventId ? tasksApi.getAll(activeEventId) : Promise.resolve([]),
        enabled: !!activeEventId,
    });

    const { data: expenses = [] } = useQuery({
        queryKey: ['expenses', activeEventId],
        queryFn: () => activeEventId ? expensesApi.getAll(activeEventId) : Promise.resolve([]),
        enabled: !!activeEventId,
    });

    const activeEvent = events.find((e: any) => e.id === activeEventId);
    const totalBudget = Number(activeEvent?.budget) || 10000;
    const totalSpent = expenses.reduce((acc: number, curr: any) => acc + Number(curr.amount || 0), 0);
    const utilization = totalBudget > 0 ? Math.min((totalSpent / totalBudget) * 100, 100) : 0;

    const completedTasks = tasks.filter((t: any) => t.status === 'done').length;
    const totalTasks = tasks.length || 1;
    const taskProgress = (completedTasks / totalTasks) * 100;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Budget Meter - "Ink Pot" Style */}
            <motion.div
                className="bg-[var(--color-surface)] p-6 rounded-2xl shadow-[4px_4px_0px_var(--color-ink)] border-2 border-[var(--color-ink)] relative overflow-hidden"
                whileHover={{ scale: 1.02, rotate: 1 }}
            >
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-serif text-xl font-bold text-[var(--color-ink)]">Budget Utilization</h3>
                    <DollarSign className="text-[var(--color-ink)]/40" />
                </div>
                <div className="relative h-32 w-full bg-[var(--color-paper)] rounded-xl border-2 border-[var(--color-ink)] overflow-hidden">
                    {/* The Liquid */}
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 bg-[var(--color-accent)] opacity-80"
                        initial={{ height: "0%" }}
                        animate={{ height: `${utilization}%` }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    >
                        <div className="absolute top-0 left-0 right-0 h-4 bg-[var(--color-accent)] opacity-50 animate-wave" />
                    </motion.div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-hand text-3xl font-bold text-[var(--color-ink)]">{Math.round(utilization)}%</span>
                    </div>
                </div>
                <p className="mt-2 font-hand text-sm text-[var(--color-ink)]/60">Spent: ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}</p>
            </motion.div>

            {/* Task Pie - Hand Drawn Circle */}
            <motion.div
                className="bg-[var(--color-paper)] p-6 rounded-2xl shadow-[4px_4px_0px_var(--color-ink)] border-2 border-[var(--color-ink)]"
                whileHover={{ scale: 1.02, rotate: -1 }}
            >
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-serif text-xl font-bold text-[var(--color-ink)]">Tasks Done</h3>
                    <PieChart className="text-[var(--color-ink)]/40" />
                </div>
                <div className="flex items-center justify-center h-32">
                    <svg viewBox="0 0 100 100" className="w-24 h-24 transform -rotate-90">
                        <circle cx="50" cy="50" r="40" stroke="var(--color-surface)" strokeWidth="12" fill="none" />
                        <motion.circle
                            cx="50" cy="50" r="40"
                            stroke="var(--color-ink)"
                            strokeWidth="12"
                            fill="none"
                            strokeDasharray="251.2"
                            initial={{ strokeDashoffset: 251.2 }}
                            animate={{ strokeDashoffset: 251.2 * (1 - taskProgress / 100) }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            strokeLinecap="round"
                        />
                    </svg>
                </div>
                <div className="text-center mt-[-1rem]">
                    <span className="font-hand text-2xl font-bold">{completedTasks}/{tasks.length}</span>
                </div>
            </motion.div>

            {/* Team Velocity - Scribble Graph */}
            <motion.div
                className="bg-[var(--color-secondary)] p-6 rounded-2xl shadow-[4px_4px_0px_var(--color-ink)] border-2 border-[var(--color-ink)]"
                whileHover={{ scale: 1.02, rotate: 1 }}
            >
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-serif text-xl font-bold text-[var(--color-ink)]">Velocity</h3>
                    <TrendingUp className="text-[var(--color-ink)]/40" />
                </div>
                <div className="h-32 flex items-end justify-between px-2 gap-2">
                    {[40, 60, 30, 80, 50, 90, 75].map((h, i) => (
                        <motion.div
                            key={i}
                            className="w-full bg-[var(--color-ink)] rounded-t-sm"
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ delay: i * 0.1, duration: 0.5 }}
                        />
                    ))}
                </div>
                <p className="mt-2 font-hand text-sm text-[var(--color-ink)]/60 text-center">High energy this week!</p>
            </motion.div>
        </div>
    );
};
