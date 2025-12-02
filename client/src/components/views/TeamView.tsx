import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, UserPlus, Mail, X, Trash2, Crown, User, CheckSquare, Hash, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { membersApi, tasksApi, channelsApi } from "../../lib/api";
import { useAppStore } from "../../store/useAppStore";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";

const roleColors: Record<string, string> = {
    organizer: "#fbbf24",
    team_lead: "#60a5fa",
    member: "#34d399",
    viewer: "#a78bfa",
};

export function TeamView() {
    const { activeEventId } = useAppStore();
    const queryClient = useQueryClient();
    const [showModal, setShowModal] = useState(false);
    const [showMemberDetail, setShowMemberDetail] = useState<any>(null);
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("member");
    const [sendInvite, setSendInvite] = useState(true);

    const { data: members = [], isLoading } = useQuery({
        queryKey: ['members', activeEventId],
        queryFn: () => activeEventId ? membersApi.getAll(activeEventId) : Promise.resolve([]),
        enabled: !!activeEventId,
    });

    const { data: allTasks = [] } = useQuery({
        queryKey: ['tasks', activeEventId],
        queryFn: () => activeEventId ? tasksApi.getAll(activeEventId) : Promise.resolve([]),
        enabled: !!activeEventId,
    });

    const { data: channels = [] } = useQuery({
        queryKey: ['channels', activeEventId],
        queryFn: () => activeEventId ? channelsApi.getAll(activeEventId) : Promise.resolve([]),
        enabled: !!activeEventId,
    });

    const getMemberTasks = (userId: string) => allTasks.filter((t: any) => t.assigneeId === userId);
    const getMemberChannel = (channelId: string) => channels.find((c: any) => c.id === channelId);

    const addMemberMutation = useMutation({
        mutationFn: (data: any) => membersApi.add(activeEventId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members', activeEventId] });
            toast.success("Team member added!");
            setShowModal(false);
            setEmail("");
            setRole("member");
        },
        onError: (err: any) => toast.error(err.response?.data?.error || "Failed to add member"),
    });

    const removeMemberMutation = useMutation({
        mutationFn: (memberId: string) => membersApi.remove(memberId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members', activeEventId] });
            toast.success("Member removed");
        },
    });

    const handleAddMember = () => {
        if (!email.trim()) {
            toast.error("Email is required");
            return;
        }
        addMemberMutation.mutate({ email, role, sendInvite });
    };

    if (!activeEventId) {
        return (
            <div className="min-h-screen w-full p-8 md:p-12 md:pl-32 flex items-center justify-center">
                <p className="font-hand text-2xl text-[var(--color-ink)]/40">
                    Select an event to manage team members
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full p-8 md:p-12 md:pl-32 max-w-6xl mx-auto pb-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <header className="mb-12 flex justify-between items-start">
                    <div>
                        <h2 className="text-5xl font-serif font-bold text-[var(--color-ink)] mb-4 flex items-center gap-4">
                            <Users size={48} /> Team Members
                        </h2>
                        <p className="text-xl font-hand text-[var(--color-ink)]/60">
                            Manage your event team and assign roles
                        </p>
                    </div>
                    <motion.button
                        onClick={() => setShowModal(true)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] font-hand text-lg rounded-full shadow-[4px_4px_0px_var(--color-accent)]"
                    >
                        <UserPlus size={20} /> Add Member
                    </motion.button>
                </header>

                {isLoading ? (
                    <div className="text-center py-12">
                        <p className="font-hand text-xl text-[var(--color-ink)]/40">Loading team...</p>
                    </div>
                ) : members.length === 0 ? (
                    <div className="text-center py-16 bg-[var(--color-surface)] rounded-3xl border-2 border-[var(--color-ink)]">
                        <Users size={64} className="mx-auto mb-4 text-[var(--color-ink)]/20" />
                        <p className="font-hand text-2xl text-[var(--color-ink)]/40 mb-4">No team members yet</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-[var(--color-accent)] text-[var(--color-ink)] font-hand rounded-full border-2 border-[var(--color-ink)]"
                        >
                            Invite your first team member
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {members.map((member: any) => {
                            const memberTasks = getMemberTasks(member.userId);
                            const completedTasks = memberTasks.filter((t: any) => t.status === 'done').length;
                            const memberChannel = member.channelId ? getMemberChannel(member.channelId) : null;
                            
                            return (
                                <motion.div
                                    key={member.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={() => setShowMemberDetail(member)}
                                    className="bg-[var(--color-surface)] rounded-2xl p-6 border-2 border-[var(--color-ink)] shadow-[4px_4px_0px_rgba(0,0,0,0.05)] cursor-pointer hover:shadow-[6px_6px_0px_rgba(0,0,0,0.1)] transition-shadow"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            {member.userImage ? (
                                                <img src={member.userImage} alt="" className="w-14 h-14 rounded-full border-2 border-[var(--color-ink)]" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-full bg-[var(--color-accent)] border-2 border-[var(--color-ink)] flex items-center justify-center">
                                                    <span className="text-xl font-serif font-bold">
                                                        {(member.userName || member.userEmail)?.[0]?.toUpperCase() || "?"}
                                                    </span>
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-serif font-bold text-lg">{member.userName || "Unnamed"}</h3>
                                                <p className="font-hand text-sm text-[var(--color-ink)]/60">{member.userEmail}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); removeMemberMutation.mutate(member.id); }}
                                            className="p-2 hover:bg-red-100 rounded-full transition-colors"
                                        >
                                            <Trash2 size={18} className="text-red-500" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {member.role === 'organizer' ? <Crown size={16} /> : <User size={16} />}
                                            <span
                                                className="px-3 py-1 rounded-full text-sm font-hand capitalize"
                                                style={{ backgroundColor: roleColors[member.role] + '30', color: roleColors[member.role] }}
                                            >
                                                {member.role?.replace('_', ' ')}
                                            </span>
                                        </div>
                                        {memberTasks.length > 0 && (
                                            <span className="text-xs font-hand text-[var(--color-ink)]/50">
                                                {completedTasks}/{memberTasks.length} tasks
                                            </span>
                                        )}
                                    </div>
                                    {memberChannel && (
                                        <div className="mt-3 pt-3 border-t border-[var(--color-ink)]/10">
                                            <span className="text-xs font-hand text-[var(--color-ink)]/50 flex items-center gap-1">
                                                <Hash size={12} /> {memberChannel.name}
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </motion.div>

            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[var(--color-paper)] rounded-2xl p-8 w-full max-w-md border-2 border-[var(--color-ink)] shadow-[8px_8px_0px_var(--color-ink)]"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-serif font-bold">Add Team Member</h3>
                                <button onClick={() => setShowModal(false)}>
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block font-hand text-lg mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="colleague@example.com"
                                        className="w-full px-4 py-3 border-2 border-[var(--color-ink)] rounded-xl font-serif focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-hand text-lg mb-2">Role</label>
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-[var(--color-ink)] rounded-xl font-serif focus:outline-none"
                                    >
                                        <option value="member">Team Member</option>
                                        <option value="team_lead">Team Lead</option>
                                        <option value="organizer">Organizer</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </div>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={sendInvite}
                                        onChange={(e) => setSendInvite(e.target.checked)}
                                        className="w-5 h-5"
                                    />
                                    <span className="font-hand">
                                        <Mail size={16} className="inline mr-1" />
                                        Send email invitation
                                    </span>
                                </label>

                                <motion.button
                                    onClick={handleAddMember}
                                    disabled={addMemberMutation.isPending}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-4 bg-[var(--color-ink)] text-[var(--color-paper)] font-hand text-xl rounded-full disabled:opacity-50"
                                >
                                    {addMemberMutation.isPending ? "Adding..." : "Add to Team"}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Member Detail Modal */}
            <Modal
                isOpen={!!showMemberDetail}
                onClose={() => setShowMemberDetail(null)}
                title="Member Details"
                size="lg"
            >
                {showMemberDetail && (() => {
                    const memberTasks = getMemberTasks(showMemberDetail.userId);
                    const completedTasks = memberTasks.filter((t: any) => t.status === 'done');
                    const pendingTasks = memberTasks.filter((t: any) => t.status !== 'done');
                    const memberChannel = showMemberDetail.channelId ? getMemberChannel(showMemberDetail.channelId) : null;

                    return (
                        <div className="space-y-6">
                            {/* Member Info */}
                            <div className="flex items-center gap-4">
                                {showMemberDetail.userImage ? (
                                    <img src={showMemberDetail.userImage} alt="" className="w-20 h-20 rounded-full border-2 border-[var(--color-ink)]" />
                                ) : (
                                    <div className="w-20 h-20 rounded-full bg-[var(--color-accent)] border-2 border-[var(--color-ink)] flex items-center justify-center">
                                        <span className="text-3xl font-serif font-bold">
                                            {(showMemberDetail.userName || showMemberDetail.userEmail)?.[0]?.toUpperCase()}
                                        </span>
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-serif font-bold text-2xl">{showMemberDetail.userName || "Unnamed"}</h3>
                                    <p className="font-hand text-[var(--color-ink)]/60">{showMemberDetail.userEmail}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span
                                            className="px-3 py-1 rounded-full text-sm font-hand capitalize"
                                            style={{ backgroundColor: roleColors[showMemberDetail.role] + '30', color: roleColors[showMemberDetail.role] }}
                                        >
                                            {showMemberDetail.role?.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Team/Channel Assignment */}
                            <div className="bg-[var(--color-surface)] rounded-xl p-4">
                                <h4 className="font-serif font-bold mb-3 flex items-center gap-2">
                                    <Hash size={18} /> Team Assignment
                                </h4>
                                {memberChannel ? (
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full ${memberChannel.color} border-2 border-[var(--color-ink)] flex items-center justify-center`}>
                                            <Users size={16} />
                                        </div>
                                        <div>
                                            <p className="font-bold">{memberChannel.name}</p>
                                            <p className="text-sm text-[var(--color-ink)]/50">{memberChannel.description}</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-[var(--color-ink)]/40 mb-2">Not assigned to any team</p>
                                        <select
                                            className="px-4 py-2 border-2 border-[var(--color-ink)]/20 rounded-lg font-hand"
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    membersApi.update(showMemberDetail.id, { channelId: e.target.value })
                                                        .then(() => {
                                                            queryClient.invalidateQueries({ queryKey: ['members', activeEventId] });
                                                            toast.success("Member assigned to team");
                                                        });
                                                }
                                            }}
                                        >
                                            <option value="">Assign to team...</option>
                                            {channels.map((c: any) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            {/* Tasks */}
                            <div>
                                <h4 className="font-serif font-bold mb-3 flex items-center gap-2">
                                    <CheckSquare size={18} /> Tasks ({memberTasks.length})
                                </h4>
                                {memberTasks.length === 0 ? (
                                    <p className="text-[var(--color-ink)]/40 text-center py-4">No tasks assigned</p>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {pendingTasks.map((task: any) => (
                                            <div key={task.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-[var(--color-ink)]/10">
                                                <div className="w-5 h-5 border-2 border-[var(--color-ink)] rounded" />
                                                <span className="flex-1 font-hand">{task.title}</span>
                                            </div>
                                        ))}
                                        {completedTasks.map((task: any) => (
                                            <div key={task.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                                <CheckSquare size={18} className="text-green-500" />
                                                <span className="flex-1 font-hand line-through text-[var(--color-ink)]/50">{task.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-[var(--color-ink)]/10">
                                <button
                                    onClick={() => {
                                        removeMemberMutation.mutate(showMemberDetail.id);
                                        setShowMemberDetail(null);
                                    }}
                                    className="flex-1 py-3 border-2 border-red-300 text-red-500 font-hand rounded-xl hover:bg-red-50 transition-colors"
                                >
                                    Remove from Team
                                </button>
                                <button
                                    onClick={() => setShowMemberDetail(null)}
                                    className="flex-1 py-3 bg-[var(--color-ink)] text-[var(--color-paper)] font-hand rounded-xl"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    );
                })()}
            </Modal>
        </div>
    );
}
