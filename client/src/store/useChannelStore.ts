import { create } from 'zustand';
import { channelsApi, subgroupsApi } from '../lib/api';

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
            const data = await channelsApi.getAll(eventId);
            set({ channels: data });
        } catch (error) {
            console.error("Failed to fetch channels", error);
        }
    },

    addChannel: async (eventId: string, channel: any) => {
        try {
            const data = await channelsApi.create(eventId, channel);
            set((state) => ({
                channels: [...state.channels, { ...data.channel, subgroups: [] }]
            }));
        } catch (error) {
            console.error("Failed to create channel", error);
        }
    },

    addSubgroup: async (channelId: string, subgroup: any) => {
        try {
            const data = await subgroupsApi.create(channelId, subgroup);
            set((state) => ({
                channels: state.channels.map(ch =>
                    ch.id === channelId
                        ? { ...ch, subgroups: [...(ch.subgroups || []), data.subgroup] }
                        : ch
                )
            }));
        } catch (error) {
            console.error("Failed to create subgroup", error);
        }
    },
}));
