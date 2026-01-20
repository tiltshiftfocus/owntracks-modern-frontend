import { subHours } from 'date-fns';
import { create } from 'zustand';
import { DateOrNull } from '../types';
interface OwnTracksDateStore {
    customDate: { from: DateOrNull, to: DateOrNull },
    setCustomDate: (from: DateOrNull, to: DateOrNull) => void
}

export const useOwnTracksStore = create<OwnTracksDateStore>()((set) => ({
    customDate: { from: subHours(new Date(), 12), to: new Date() },
    setCustomDate: (from: DateOrNull, to: DateOrNull) => {
        set({ customDate: { from, to } })
    }
}))