import { motion } from "framer-motion";

export const SoulLoader = () => {
    const confettiColors = ["#FF6B6B", "#4ECDC4", "#FFE66D", "#95E1D3", "#F38181", "#AA96DA"];
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[var(--color-paper)] overflow-hidden">
            {/* Floating confetti particles */}
            {[...Array(20)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-3 h-3 rounded-sm"
                    style={{
                        backgroundColor: confettiColors[i % confettiColors.length],
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    initial={{ opacity: 0, scale: 0, rotate: 0 }}
                    animate={{
                        opacity: [0, 1, 1, 0],
                        scale: [0, 1, 1, 0],
                        rotate: [0, 180, 360],
                        y: [0, -100, -200],
                    }}
                    transition={{
                        duration: 3,
                        delay: i * 0.15,
                        repeat: Infinity,
                        ease: "easeOut",
                    }}
                />
            ))}

            <div className="relative flex flex-col items-center">
                {/* Main animated icon - Calendar transforming to party */}
                <div className="relative w-32 h-32 mb-8">
                    {/* Pulsing glow */}
                    <motion.div
                        className="absolute inset-0 rounded-2xl bg-[var(--color-accent)]"
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.1, 0.3],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    {/* Calendar/Event card */}
                    <motion.div
                        className="absolute inset-0 bg-white rounded-2xl border-4 border-[#1a1a1a] shadow-[6px_6px_0px_#1a1a1a] flex flex-col overflow-hidden"
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.6, ease: "backOut" }}
                    >
                        {/* Calendar header */}
                        <motion.div 
                            className="h-8 bg-[#1a1a1a] flex items-center justify-center gap-1"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 rounded-full bg-white"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                />
                            ))}
                        </motion.div>
                        
                        {/* Calendar body with animated checkmark */}
                        <div className="flex-1 flex items-center justify-center">
                            <motion.svg
                                width="50"
                                height="50"
                                viewBox="0 0 50 50"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                <motion.path
                                    d="M10 25 L20 35 L40 15"
                                    fill="none"
                                    stroke="#1a1a1a"
                                    strokeWidth="5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: 1, duration: 0.5, ease: "easeOut" }}
                                />
                            </motion.svg>
                        </div>
                    </motion.div>

                    {/* Sparkles around the card */}
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-[var(--color-accent)]"
                            style={{
                                left: `${50 + 60 * Math.cos((i * Math.PI * 2) / 6)}%`,
                                top: `${50 + 60 * Math.sin((i * Math.PI * 2) / 6)}%`,
                                borderRadius: i % 2 === 0 ? "50%" : "2px",
                            }}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: [0, 1.5, 0],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                delay: 1.2 + i * 0.1,
                                duration: 0.8,
                                repeat: Infinity,
                                repeatDelay: 1.5,
                            }}
                        />
                    ))}
                </div>

                {/* Animated text */}
                <div className="flex flex-col items-center gap-2">
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8, duration: 0.5 }}
                        className="font-hand text-5xl font-bold text-[#1a1a1a]"
                    >
                        <motion.span
                            animate={{ rotate: [0, -5, 5, 0] }}
                            transition={{ delay: 1.5, duration: 0.5 }}
                            className="inline-block"
                        >
                            let's
                        </motion.span>{" "}
                        <motion.span
                            className="inline-block text-[var(--color-accent)]"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ delay: 1.7, duration: 0.4 }}
                        >
                            happen
                        </motion.span>{" "}
                        <motion.span
                            className="inline-block"
                            animate={{ y: [0, -5, 0] }}
                            transition={{ delay: 1.9, duration: 0.4 }}
                        >
                            event
                        </motion.span>
                    </motion.p>
                    
                    {/* Loading dots */}
                    <div className="flex gap-2 mt-4">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                className="w-3 h-3 rounded-full bg-[#1a1a1a]"
                                animate={{
                                    y: [0, -10, 0],
                                    opacity: [0.3, 1, 0.3],
                                }}
                                transition={{
                                    duration: 0.8,
                                    delay: i * 0.15,
                                    repeat: Infinity,
                                }}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
