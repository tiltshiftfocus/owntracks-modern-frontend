import { create } from 'zustand';

type DateOrNull = Date | null

interface OwnTracksStore {
    customDate: { from: DateOrNull, to: DateOrNull },
    setCustomDate: (from: DateOrNull, to: DateOrNull) => void
}

export const useOwnTracksStore = create<OwnTracksStore>()((set) => ({
    customDate: { from: new Date(), to: new Date() },
    setCustomDate: (from: DateOrNull, to: DateOrNull) => set({ customDate: { from, to } })
}))