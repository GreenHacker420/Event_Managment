import { motion } from "framer-motion";
import {
    LayoutGrid,
    PenTool,
    CheckSquare,
    MessageSquare,
    Hash,
    CircleDollarSign
} from "lucide-react";
import { useAppStore } from "../../store/useAppStore";
import { useNavigate, useLocation } from "react-router-dom";

export const SketchDock = () => {
    const { setCursorVariant } = useAppStore();
    const navigate = useNavigate();
    const location = useLocation();

    const items = [
        { id: "dashboard", path: "/", icon: LayoutGrid, label: "The Desk" },
        { id: "create-event", path: "/create", icon: PenTool, label: "Draft" },
        { id: "tasks", path: "/tasks", icon: CheckSquare, label: "To-Dos" },
        { id: "messages", path: "/messages", icon: MessageSquare, label: "Notes" },
        { id: "channels", path: "/channels", icon: Hash, label: "Channels" },
        { id: "budget", path: "/budget", icon: CircleDollarSign, label: "Budget" },
    ];

    return (
        <div className="fixed left-6 top-1/2 -translate-y-1/2 z-50">
            <motion.div
                className="flex flex-col items-center gap-6 px-4 py-8 bg-[var(--color-paper)] border-2 border-[var(--color-ink)] shadow-[4px_4px_0px_var(--color-ink)] rounded-full"
                initial={{ x: -100 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", bounce: 0.2 }}
            >
                {items.map((item) => (
                    <DockItem
                        key={item.id}
                        item={item}
                        isActive={location.pathname === item.path}
                        onClick={() => navigate(item.path)}
                        onHoverStart={() => setCursorVariant("hover")}
                        onHoverEnd={() => setCursorVariant("default")}
                    />
                ))}
            </motion.div>
        </div>
    );
};

function DockItem({ item, isActive, onClick, onHoverStart, onHoverEnd }: any) {
    return (
        <motion.button
            onClick={onClick}
            onHoverStart={onHoverStart}
            onHoverEnd={onHoverEnd}
            className={`relative p-2 transition-colors duration-300 ${isActive ? "text-[var(--color-accent)]" : "text-[var(--color-ink)]/60 hover:text-[var(--color-ink)]"
                }`}
            whileHover={{ scale: 1.2, rotate: Math.random() * 10 - 5 }}
            whileTap={{ scale: 0.9 }}
        >
            <item.icon size={24} strokeWidth={2.5} />

            {/* The Vertical Stroke - Hand drawn style */}
            {isActive && (
                <motion.div
                    layoutId="active-underline"
                    className="absolute top-0 bottom-0 -left-3 w-1 bg-[var(--color-accent)] rounded-full"
                    style={{ borderRadius: "40% 100% 20% 80% / 80% 60% 90% 30%" }} // Organic shape vertical
                />
            )}
        </motion.button>
    );
}
