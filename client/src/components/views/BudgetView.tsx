import { motion } from "framer-motion";
import { Plus, Edit2 } from "lucide-react";
import { useState } from "react";
import { useBudgetStore } from "../../store/useBudgetStore";
import { EditBudgetModal } from "./budget/EditBudgetModal";
import { AddExpenseModal } from "./budget/AddExpenseModal";
import { AddProjectedCostModal } from "./budget/AddProjectedCostModal";

export const BudgetView = () => {
    const { totalBudget, expenses, projectedCosts } = useBudgetStore();
    const [showEditBudget, setShowEditBudget] = useState(false);
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [showAddProjected, setShowAddProjected] = useState(false);

    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const utilization = Math.min((totalSpent / totalBudget) * 100, 100);
    const totalProjected = projectedCosts.reduce((acc, curr) => acc + curr.amount, 0);

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <EditBudgetModal isOpen={showEditBudget} onClose={() => setShowEditBudget(false)} />
            <AddExpenseModal isOpen={showAddExpense} onClose={() => setShowAddExpense(false)} />
            <AddProjectedCostModal isOpen={showAddProjected} onClose={() => setShowAddProjected(false)} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-5xl font-serif font-bold mb-8 text-[var(--color-ink)]">Budget & Expenses</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Budget Utilization Card */}
                    <div className="bg-[var(--color-paper)] border-2 border-[var(--color-ink)] rounded-xl p-8 shadow-[8px_8px_0px_var(--color-ink)] h-full min-h-[400px] flex flex-col">
                        <div className="flex justify-between items-start mb-8">
                            <h3 className="text-2xl font-serif font-bold">Budget Utilization</h3>
                            <button
                                onClick={() => setShowEditBudget(true)}
                                className="p-2 hover:bg-[var(--color-ink)]/5 rounded-full transition-colors"
                            >
                                <Edit2 size={24} className="text-[var(--color-ink)]/60" />
                            </button>
                        </div>

                        <div className="relative h-16 bg-[var(--color-ink)]/10 rounded-lg border-2 border-[var(--color-ink)] overflow-hidden mb-6">
                            <motion.div
                                className="absolute top-0 left-0 h-full bg-[#E5989B]"
                                initial={{ width: 0 }}
                                animate={{ width: `${utilization}%` }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center font-bold text-xl z-10">
                                {Math.round(utilization)}%
                            </div>
                        </div>
                        <p className="text-lg font-hand text-[var(--color-ink)]/60 mt-auto italic">
                            Spent: ${totalSpent.toLocaleString()} / ${totalBudget.toLocaleString()}
                        </p>
                    </div>

                    {/* Recent Transactions */}
                    <div className="bg-[var(--color-paper)] border-2 border-[var(--color-ink)] rounded-xl p-8 shadow-[8px_8px_0px_var(--color-ink)] h-full min-h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-serif font-bold">Recent Expenses</h3>
                            <button
                                onClick={() => setShowAddExpense(true)}
                                className="p-2 hover:bg-[var(--color-ink)]/5 rounded-full transition-colors"
                            >
                                <Plus size={24} className="text-[var(--color-ink)]/60" />
                            </button>
                        </div>
                        <ul className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                            {expenses.map((item) => (
                                <li key={item.id} className="flex justify-between items-center border-b border-[var(--color-ink)]/10 pb-4 last:border-0">
                                    <div>
                                        <p className="font-serif text-lg">{item.name}</p>
                                        <p className="text-sm text-[var(--color-ink)]/60 font-hand">{item.date}</p>
                                    </div>
                                    <span className="font-hand font-bold text-lg text-red-500">-${item.amount.toLocaleString()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Estimated Costs */}
                    <div className="bg-[var(--color-paper)] border-2 border-[var(--color-ink)] rounded-xl p-8 shadow-[8px_8px_0px_var(--color-ink)] h-full min-h-[400px] flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                            <h3 className="text-2xl font-serif font-bold">Projected Costs</h3>
                            <button
                                onClick={() => setShowAddProjected(true)}
                                className="p-2 hover:bg-[var(--color-ink)]/5 rounded-full transition-colors"
                            >
                                <Plus size={24} className="text-[var(--color-ink)]/60" />
                            </button>
                        </div>
                        <div className="space-y-4 flex-1">
                            {projectedCosts.map((cost, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <span className="font-serif text-lg">{cost.category}</span>
                                    <span className="font-hand font-bold text-lg">${cost.amount.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 border-t-2 border-[var(--color-ink)] flex justify-between items-center font-bold mt-auto">
                            <span className="text-lg">Total Projected</span>
                            <span className="text-xl">${totalProjected.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
