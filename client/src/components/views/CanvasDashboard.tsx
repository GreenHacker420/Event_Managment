import { motion } from "framer-motion";
import { DashboardStats } from "./dashboard/DashboardStats";
import { EventList } from "./dashboard/EventList";
import { ActivityFeed } from "./dashboard/ActivityFeed";
import { useAppStore } from "../../store/useAppStore";

export const CanvasDashboard = () => {
    const { user } = useAppStore();
    
    return (
        <div className="relative w-full min-h-screen pb-32 px-8 pt-12 max-w-7xl mx-auto">
            {/* Header Section - Handwritten and Raw */}
            <header className="mb-12 relative">
                <motion.div
                    initial={{ opacity: 0, rotate: -2 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    transition={{ duration: 0.8, ease: "backOut" }}
                >
                    <h1 className="text-8xl font-serif font-bold tracking-tighter text-[var(--color-ink)] mb-4 relative inline-block">
                        Event Dashboard
                        <svg className="absolute -bottom-4 left-0 w-full h-4 text-[var(--color-secondary)] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                            <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                        </svg>
                    </h1>
                    <p className="text-2xl font-hand text-[var(--color-ink)]/60 max-w-md leading-relaxed rotate-1 ml-4">
                        Welcome back, {user?.name || 'Organizer'}! <br />
                        Your events are waiting.
                    </p>
                </motion.div>
            </header>

            {/* The Desk Layout */}
            <div className="space-y-12">

                {/* Top Row: Stats */}
                <DashboardStats />

                {/* Main Workspace: Projects & Log */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Active Projects (2/3 width) */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                        >
                            <EventList />
                        </motion.div>
                    </div>

                    {/* Right Column: Activity Log (1/3 width) */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="h-full"
                        >
                            <ActivityFeed />
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
};
