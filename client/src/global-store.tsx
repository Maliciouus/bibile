import { create } from "zustand";

interface SearchState {
  messageData: any;
  setMessageData: any;
}

export const useSearchState = create<SearchState>()((set) => ({
  messageData: [],
  setMessageData: (data: any) => set({ messageData: data }),
}));
