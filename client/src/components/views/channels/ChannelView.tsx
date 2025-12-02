import { motion, AnimatePresence } from "framer-motion";
import { useChannelStore } from "../../../store/useChannelStore";
import { Users, Hash, CheckSquare, X, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const ChannelView = () => {
    const { channels, activeChannelId, activeSubgroupId, setActiveSubgroup, addSubgroup } = useChannelStore();
    const activeChannel = channels.find(c => c.id === activeChannelId);

    const [showSubgroupModal, setShowSubgroupModal] = useState(false);
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [subgroupName, setSubgroupName] = useState("");
    const [subgroupMembers, setSubgroupMembers] = useState(1);
    const [taskTitle, setTaskTitle] = useState("");
    const [taskDesc, setTaskDesc] = useState("");
    const [tasks, setTasks] = useState<Record<string, { id: string; title: string; description: string; done: boolean }[]>>({});

    const handleAddSubgroup = () => {
        if (!subgroupName.trim()) {
            toast.error("Subgroup name is required");
            return;
        }
        if (!activeChannelId) return;

        addSubgroup(activeChannelId, {
            name: subgroupName,
            members: subgroupMembers,
        });
        toast.success(`Subgroup "${subgroupName}" added!`);
        setSubgroupName("");
        setSubgroupMembers(1);
        setShowSubgroupModal(false);
    };

    const handleCreateTask = () => {
        if (!taskTitle.trim()) {
            toast.error("Task title is required");
            return;
        }
        if (!activeSubgroupId) return;

        const newTask = {
            id: Date.now().toString(),
            title: taskTitle,
            description: taskDesc,
            done: false,
        };

        setTasks(prev => ({
            ...prev,
            [activeSubgroupId]: [...(prev[activeSubgroupId] || []), newTask]
        }));
        toast.success("Task created!");
        setTaskTitle("");
        setTaskDesc("");
        setShowTaskModal(false);
    };

    const toggleTask = (taskId: string) => {
        if (!activeSubgroupId) return;
        setTasks(prev => ({
            ...prev,
            [activeSubgroupId]: prev[activeSubgroupId]?.map(t =>
                t.id === taskId ? { ...t, done: !t.done } : t
            ) || []
        }));
    };

    const currentTasks = activeSubgroupId ? (tasks[activeSubgroupId] || []) : [];

    if (!activeChannel) {
        return (
            <div className="h-full flex items-center justify-center text-[var(--color-ink)]/40 font-hand text-2xl">
                Select a team to view details.
            </div>
        );
    }

    return (
        <>
            <div className="h-full p-8 overflow-y-auto">
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={activeChannel.id}
                    >
                        <h1 className="text-6xl font-serif font-bold text-[var(--color-ink)] mb-4 flex items-center gap-4">
                            {activeChannel.name}
                            <span className={`w-4 h-4 rounded-full ${activeChannel.color} border border-[var(--color-ink)]`} />
                        </h1>
                        <p className="text-xl font-hand text-[var(--color-ink)]/60 max-w-2xl">
                            {activeChannel.description}
                        </p>
                    </motion.div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Subgroups Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <h3 className="font-serif text-2xl font-bold text-[var(--color-ink)] flex items-center gap-2">
                            <Hash size={24} /> Subgroups
                        </h3>
                        <div className="space-y-4">
                            {activeChannel.subgroups.map((subgroup) => (
                                <motion.div
                                    key={subgroup.id}
                                    onClick={() => setActiveSubgroup(subgroup.id)}
                                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${activeSubgroupId === subgroup.id
                                        ? "bg-[var(--color-ink)] text-[var(--color-paper)] border-[var(--color-ink)]"
                                        : "bg-white text-[var(--color-ink)] border-[var(--color-ink)]/10 hover:border-[var(--color-ink)]"
                                        }`}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold font-serif text-lg">{subgroup.name}</span>
                                        <span className="flex items-center gap-1 text-sm opacity-60">
                                            <Users size={14} /> {subgroup.members}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                            <button
                                onClick={() => setShowSubgroupModal(true)}
                                className="w-full py-3 border-2 border-dashed border-[var(--color-ink)]/30 rounded-xl font-hand text-[var(--color-ink)]/60 hover:border-[var(--color-ink)] hover:text-[var(--color-ink)] transition-all"
                            >
                                + Add Subgroup
                            </button>
                        </div>
                    </div>

                    {/* Tasks/Content Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-serif text-2xl font-bold text-[var(--color-ink)] flex items-center gap-2">
                                <CheckSquare size={24} /> Active Tasks
                            </h3>
                            {activeSubgroupId && (
                                <button
                                    onClick={() => setShowTaskModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)] text-[var(--color-ink)] font-hand rounded-full border-2 border-[var(--color-ink)] hover:shadow-[2px_2px_0px_var(--color-ink)] transition-all"
                                >
                                    <Plus size={16} /> Add Task
                                </button>
                            )}
                        </div>

                        <div className="bg-[var(--color-surface)] rounded-2xl p-8 border-2 border-[var(--color-ink)] shadow-[8px_8px_0px_rgba(0,0,0,0.05)] min-h-[400px]">
                            {activeSubgroupId ? (
                                <div>
                                    <p className="font-hand text-lg text-[var(--color-ink)]/60 mb-6">
                                        Tasks for <span className="font-bold text-[var(--color-ink)]">
                                            {activeChannel.subgroups.find(s => s.id === activeSubgroupId)?.name}
                                        </span>
                                    </p>

                                    {currentTasks.length === 0 ? (
                                        <div className="text-center py-12">
                                            <p className="font-hand text-xl text-[var(--color-ink)]/40 mb-4">No tasks yet</p>
                                            <button
                                                onClick={() => setShowTaskModal(true)}
                                                className="px-6 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] font-bold rounded-full hover:scale-105 transition-transform"
                                            >
                                                Create First Task
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {currentTasks.map((task) => (
                                                <motion.div
                                                    key={task.id}
                                                    className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-[var(--color-ink)]/10 hover:border-[var(--color-ink)]/30 transition-colors"
                                                    whileHover={{ x: 5 }}
                                                >
                                                    <div
                                                        onClick={() => toggleTask(task.id)}
                                                        className={`w-6 h-6 border-2 border-[var(--color-ink)] rounded cursor-pointer flex items-center justify-center ${task.done ? 'bg-[var(--color-accent)]' : 'bg-white'}`}
                                                    >
                                                        {task.done && <CheckSquare size={14} />}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className={`font-serif font-bold ${task.done ? 'line-through opacity-50' : ''}`}>{task.title}</p>
                                                        {task.description && <p className="font-hand text-sm text-[var(--color-ink)]/50">{task.description}</p>}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center min-h-[300px]">
                                    <p className="font-hand text-xl text-[var(--color-ink)]/40">
                                        Select a subgroup to view tasks.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Add Subgroup Modal */}
            <AnimatePresence>
                {showSubgroupModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowSubgroupModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border-2 border-[var(--color-ink)]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-serif font-bold">Add Subgroup</h3>
                                <button onClick={() => setShowSubgroupModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block font-hand text-sm text-[#1a1a1a]/60 mb-1">Subgroup Name *</label>
                                    <input
                                        type="text"
                                        value={subgroupName}
                                        onChange={(e) => setSubgroupName(e.target.value)}
                                        className="w-full border-2 border-[var(--color-ink)]/20 rounded-xl p-3 focus:border-[var(--color-accent)] focus:outline-none"
                                        placeholder="e.g., Photography"
                                    />
                                </div>

                                <div>
                                    <label className="block font-hand text-sm text-[#1a1a1a]/60 mb-1">Number of Members</label>
                                    <input
                                        type="number"
                                        min={1}
                                        value={subgroupMembers}
                                        onChange={(e) => setSubgroupMembers(Number(e.target.value))}
                                        className="w-full border-2 border-[var(--color-ink)]/20 rounded-xl p-3 focus:border-[var(--color-accent)] focus:outline-none"
                                    />
                                </div>

                                <button
                                    onClick={handleAddSubgroup}
                                    className="w-full mt-4 py-3 bg-[var(--color-ink)] text-white font-hand text-lg rounded-xl hover:bg-[var(--color-ink)]/90 transition-colors"
                                >
                                    Add Subgroup
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Task Modal */}
            <AnimatePresence>
                {showTaskModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowTaskModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl border-2 border-[var(--color-ink)]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-serif font-bold">Create Task</h3>
                                <button onClick={() => setShowTaskModal(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block font-hand text-sm text-[#1a1a1a]/60 mb-1">Task Title *</label>
                                    <input
                                        type="text"
                                        value={taskTitle}
                                        onChange={(e) => setTaskTitle(e.target.value)}
                                        className="w-full border-2 border-[var(--color-ink)]/20 rounded-xl p-3 focus:border-[var(--color-accent)] focus:outline-none"
                                        placeholder="What needs to be done?"
                                    />
                                </div>

                                <div>
                                    <label className="block font-hand text-sm text-[#1a1a1a]/60 mb-1">Description</label>
                                    <textarea
                                        value={taskDesc}
                                        onChange={(e) => setTaskDesc(e.target.value)}
                                        rows={3}
                                        className="w-full border-2 border-[var(--color-ink)]/20 rounded-xl p-3 focus:border-[var(--color-accent)] focus:outline-none resize-none"
                                        placeholder="Add details..."
                                    />
                                </div>

                                <button
                                    onClick={handleCreateTask}
                                    className="w-full mt-4 py-3 bg-[var(--color-ink)] text-white font-hand text-lg rounded-xl hover:bg-[var(--color-ink)]/90 transition-colors"
                                >
                                    Create Task
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
