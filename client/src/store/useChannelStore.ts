import { create } from 'zustand';

export type Subgroup = {
    id: string;
    name: string;
    members: number;
};

export type Channel = {
    id: string;
    name: string;
    description: string;
    icon: string; // lucide icon name 
    subgroups: Subgroup[];
    color: string;
};

interface ChannelState {
    channels: Channel[];
    activeChannelId: string | null;
    activeSubgroupId: string | null;
    setActiveChannel: (channelId: string | null) => void;
    setActiveSubgroup: (subgroupId: string | null) => void;
    fetchChannels: (eventId: string) => Promise<void>;
    addChannel: (eventId: string, channel: Omit<Channel, 'id' | 'subgroups'>) => Promise<void>;
    addSubgroup: (channelId: string, subgroup: Omit<Subgroup, 'id'>) => Promise<void>;
}

export const useChannelStore = create<ChannelState>((set) => ({
    channels: [],
    activeChannelId: null,
    activeSubgroupId: null,
    setActiveChannel: (channelId) => set({ activeChannelId: channelId, activeSubgroupId: null }),
    setActiveSubgroup: (subgroupId) => set({ activeSubgroupId: subgroupId }),

    fetchChannels: async (eventId: string) => {
        try {
            const response = await fetch(`/api/events/${eventId}/channels`);
            if (response.ok) {
                const data = await response.json();
                set({ channels: data });
            }
        } catch (error) {
            console.error("Failed to fetch channels", error);
        }
    },

    addChannel: async (eventId: string, channel: any) => {
        try {
            const response = await fetch(`/api/events/${eventId}/channels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(channel)
            });
            if (response.ok) {
                const data = await response.json();
                set((state) => ({
                    channels: [...state.channels, { ...data.channel, subgroups: [] }]
                }));
            }
        } catch (error) {
            console.error("Failed to create channel", error);
        }
    },

    addSubgroup: async (channelId: string, subgroup: any) => {
        try {
            const response = await fetch(`/api/events/${channelId}/subgroups`, { // Note: Route might need adjustment if nested under events in a specific way, but we defined it as /:channelId/subgroups in events.js which is mounted at /api/events... wait.
                // In events.js: events.post('/:channelId/subgroups', ...)
                // And events is mounted at /api/events
                // So the URL is /api/events/:channelId/subgroups. 
                // This is a bit weird REST-wise (usually /api/channels/:id/subgroups), but it works for now.
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subgroup)
            });

            if (response.ok) {
                const data = await response.json();
                set((state) => ({
                    channels: state.channels.map(ch =>
                        ch.id === channelId
                            ? { ...ch, subgroups: [...(ch.subgroups || []), data.subgroup] }
                            : ch
                    )
                }));
            }
        } catch (error) {
            console.error("Failed to create subgroup", error);
        }
    },
}));
