import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useBudgetStore } from "../../../store/useBudgetStore";

interface EditBudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const EditBudgetModal = ({ isOpen, onClose }: EditBudgetModalProps) => {
    const { totalBudget, setTotalBudget } = useBudgetStore();
    const [amount, setAmount] = useState(totalBudget.toString());

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTotalBudget(Number(amount));
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-[var(--color-paper)] border-2 border-[var(--color-ink)] shadow-[8px_8px_0px_var(--color-ink)] rounded-xl p-8 z-[70]"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-serif font-bold">Edit Total Budget</h2>
                            <button onClick={onClose} className="p-2 hover:bg-[var(--color-ink)]/5 rounded-full">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <label className="block font-hand text-lg mb-2">Total Amount ($)</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full p-3 bg-white border-2 border-[var(--color-ink)] rounded-lg focus:outline-none focus:shadow-[4px_4px_0px_var(--color-ink)] transition-shadow text-xl font-bold"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <button
                                type="submit"
                                className="w-full py-3 mt-6 bg-[var(--color-accent)] text-[var(--color-paper)] font-bold rounded-lg border-2 border-[var(--color-ink)] shadow-[4px_4px_0px_var(--color-ink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_var(--color-ink)] transition-all"
                            >
                                Save Changes
                            </button>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
