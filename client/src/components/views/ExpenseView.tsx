import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "../../store/useAppStore";
import { Plus, X, DollarSign, Calendar, Tag, Check, Clock, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expensesApi, eventsApi } from "../../lib/api";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

interface ExpenseForm {
    amount: number;
    description: string;
    category: string;
    date: string;
}

export function ExpenseView() {
    const { setCursorVariant } = useAppStore();
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const queryClient = useQueryClient();
    const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseForm>();

    const { data: events } = useQuery({
        queryKey: ['events'],
        queryFn: eventsApi.getAll
    });

    const { data: expenses, isLoading } = useQuery({
        queryKey: ['expenses', selectedEventId],
        queryFn: () => expensesApi.getAll(selectedEventId!),
        enabled: !!selectedEventId
    });

    const createExpenseMutation = useMutation({
        mutationFn: (data: ExpenseForm) => expensesApi.create(selectedEventId!, data),
        onSuccess: () => {
            toast.success("Expense added successfully!");
            queryClient.invalidateQueries({ queryKey: ['expenses', selectedEventId] });
            setShowCreateModal(false);
            reset();
        },
        onError: () => {
            toast.error("Failed to add expense.");
        }
    });

    const onSubmit = (data: ExpenseForm) => {
        createExpenseMutation.mutate(data);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <Check size={16} className="text-green-600" />;
            case 'pending': return <Clock size={16} className="text-yellow-600" />;
            case 'rejected': return <XCircle size={16} className="text-red-600" />;
            default: return null;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800 border-green-300';
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const totalExpenses = expenses?.reduce((sum: number, exp: any) => sum + Number(exp.amount), 0) || 0;
    const approvedExpenses = expenses?.filter((exp: any) => exp.status === 'approved')
        .reduce((sum: number, exp: any) => sum + Number(exp.amount), 0) || 0;

    return (
        <div className="min-h-screen w-full p-8 md:p-12 md:pl-32 max-w-5xl mx-auto pb-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
            >
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-6xl font-serif font-bold text-[#1a1a1a] mb-4">
                            Expense Tracker
                        </h2>
                        <p className="text-xl font-hand text-[#1a1a1a]/60">
                            Manage your event budget and expenses.
                        </p>
                    </div>

                    {selectedEventId && (
                        <motion.button
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowCreateModal(true)}
                            className="w-16 h-16 bg-[var(--color-accent)] rounded-full flex items-center justify-center text-[var(--color-paper)] shadow-[4px_4px_0px_var(--color-ink)] border-2 border-[var(--color-ink)]"
                            onMouseEnter={() => setCursorVariant("hover")}
                            onMouseLeave={() => setCursorVariant("default")}
                        >
                            <Plus size={32} />
                        </motion.button>
                    )}
                </header>

                {/* Event Selection */}
                <div className="mb-8">
                    <label className="block font-hand text-lg text-[#1a1a1a]/60 mb-2">Select Event</label>
                    <select
                        value={selectedEventId || ''}
                        onChange={(e) => setSelectedEventId(e.target.value || null)}
                        className="w-full md:w-96 bg-white text-xl font-serif text-[var(--color-ink)] border-2 border-[var(--color-ink)]/20 rounded-xl p-3 focus:border-[var(--color-accent)] focus:outline-none"
                    >
                        <option value="">-- Select an event --</option>
                        {events?.map((event: any) => (
                            <option key={event.id} value={event.id}>{event.title}</option>
                        ))}
                    </select>
                </div>

                {/* Budget Summary */}
                {selectedEventId && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-xl border-2 border-[var(--color-ink)]/10">
                            <div className="flex items-center gap-3 mb-2">
                                <DollarSign className="text-[var(--color-accent)]" />
                                <span className="font-hand text-[#1a1a1a]/60">Total Expenses</span>
                            </div>
                            <p className="text-3xl font-serif font-bold">${totalExpenses.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border-2 border-[var(--color-ink)]/10">
                            <div className="flex items-center gap-3 mb-2">
                                <Check className="text-green-600" />
                                <span className="font-hand text-[#1a1a1a]/60">Approved</span>
                            </div>
                            <p className="text-3xl font-serif font-bold text-green-600">${approvedExpenses.toFixed(2)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl border-2 border-[var(--color-ink)]/10">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="text-yellow-600" />
                                <span className="font-hand text-[#1a1a1a]/60">Pending</span>
                            </div>
                            <p className="text-3xl font-serif font-bold text-yellow-600">${(totalExpenses - approvedExpenses).toFixed(2)}</p>
                        </div>
                    </div>
                )}

                {/* Expense List */}
                <div className="bg-white p-8 rounded-2xl border-2 border-[var(--color-ink)] shadow-[8px_8px_0px_rgba(0,0,0,0.05)]">
                    <h3 className="font-serif text-2xl font-bold mb-6">Expenses</h3>
                    
                    {!selectedEventId ? (
                        <div className="text-center font-hand text-[#1a1a1a]/60 py-8">
                            Please select an event to view expenses.
                        </div>
                    ) : isLoading ? (
                        <div className="text-center font-hand text-[#1a1a1a]/60">Loading expenses...</div>
                    ) : expenses?.length === 0 ? (
                        <div className="text-center font-hand text-[#1a1a1a]/60 py-8">
                            No expenses yet. Click + to add one!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {expenses?.map((expense: any) => (
                                <motion.div
                                    key={expense.id}
                                    className="flex items-center justify-between p-4 border-2 border-[var(--color-ink)]/10 rounded-xl hover:border-[var(--color-ink)]/30 transition-colors"
                                    whileHover={{ x: 5 }}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-[var(--color-accent)]/20 rounded-full flex items-center justify-center">
                                            <DollarSign className="text-[var(--color-ink)]" />
                                        </div>
                                        <div>
                                            <h4 className="font-serif font-bold text-lg">{expense.description}</h4>
                                            <div className="flex items-center gap-3 text-sm font-hand text-[#1a1a1a]/60">
                                                {expense.category && (
                                                    <span className="flex items-center gap-1">
                                                        <Tag size={12} /> {expense.category}
                                                    </span>
                                                )}
                                                {expense.date && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} /> {new Date(expense.date).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${getStatusColor(expense.status)}`}>
                                            {getStatusIcon(expense.status)}
                                            {expense.status}
                                        </span>
                                        <span className="text-2xl font-serif font-bold">${Number(expense.amount).toFixed(2)}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Create Expense Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowCreateModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border-2 border-[var(--color-ink)]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-serif font-bold">Add Expense</h3>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                                <div>
                                    <label className="block font-hand text-sm text-[#1a1a1a]/60 mb-1">Amount *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        {...register("amount", { required: true, min: 0.01 })}
                                        className="w-full border-2 border-[var(--color-ink)]/20 rounded-xl p-3 focus:border-[var(--color-accent)] focus:outline-none"
                                        placeholder="0.00"
                                    />
                                    {errors.amount && <span className="text-red-500 text-sm">Amount is required</span>}
                                </div>

                                <div>
                                    <label className="block font-hand text-sm text-[#1a1a1a]/60 mb-1">Description *</label>
                                    <input
                                        type="text"
                                        {...register("description", { required: true })}
                                        className="w-full border-2 border-[var(--color-ink)]/20 rounded-xl p-3 focus:border-[var(--color-accent)] focus:outline-none"
                                        placeholder="What was this expense for?"
                                    />
                                    {errors.description && <span className="text-red-500 text-sm">Description is required</span>}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-hand text-sm text-[#1a1a1a]/60 mb-1">Category</label>
                                        <select
                                            {...register("category")}
                                            className="w-full border-2 border-[var(--color-ink)]/20 rounded-xl p-3 focus:border-[var(--color-accent)] focus:outline-none"
                                        >
                                            <option value="General">General</option>
                                            <option value="Venue">Venue</option>
                                            <option value="Catering">Catering</option>
                                            <option value="Decoration">Decoration</option>
                                            <option value="Marketing">Marketing</option>
                                            <option value="Equipment">Equipment</option>
                                            <option value="Transportation">Transportation</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-hand text-sm text-[#1a1a1a]/60 mb-1">Date</label>
                                        <input
                                            type="date"
                                            {...register("date")}
                                            className="w-full border-2 border-[var(--color-ink)]/20 rounded-xl p-3 focus:border-[var(--color-accent)] focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={createExpenseMutation.isPending}
                                    className="w-full mt-4 py-3 bg-[var(--color-ink)] text-white font-hand text-lg rounded-xl hover:bg-[var(--color-ink)]/90 transition-colors disabled:opacity-50"
                                >
                                    {createExpenseMutation.isPending ? 'Adding...' : 'Add Expense'}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
