import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface ButtonProps {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    loading?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: "button" | "submit" | "reset";
}

const variantClasses = {
    primary: "bg-[var(--color-ink)] text-[var(--color-paper)] shadow-[4px_4px_0px_var(--color-accent)]",
    secondary: "bg-[var(--color-accent)] text-[var(--color-ink)] border-2 border-[var(--color-ink)]",
    outline: "bg-transparent border-2 border-[var(--color-ink)] text-[var(--color-ink)]",
    ghost: "bg-transparent text-[var(--color-ink)] hover:bg-black/5",
    danger: "bg-red-500 text-white",
};

const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
};

export function Button({
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    children,
    className = "",
    disabled,
    onClick,
    type = "button",
}: ButtonProps) {
    return (
        <motion.button
            type={type}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            disabled={disabled || loading}
            onClick={onClick}
            className={`
                ${variantClasses[variant]}
                ${sizeClasses[size]}
                font-hand font-bold rounded-xl
                flex items-center justify-center gap-2
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
                ${className}
            `}
        >
            {loading ? <Loader2 size={18} className="animate-spin" /> : icon}
            {children}
        </motion.button>
    );
}
