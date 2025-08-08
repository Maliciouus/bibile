import { create } from "zustand";

type SearchStore = {
  currentLoadedBooks: any;
  setCurrentLoadedBooks: (currentLoadedBooks: any) => void;
  currentContent: any;
  setCurrentContent: (currentContent: any) => void;
  currentKeyWord: string;
  setCurrentKeyWord: (currentKeyWord: string) => void;
  retriggerSearch: boolean;
  setRetriggerSearch: (retriggerSearch: boolean) => void;
  currentLoadedMessages: any;
  setCurrentLoadedMessages: (currentLoadedMessages: any) => void;
  currentMessageContent: any;
  setCurrentMessageContent: (currentMessageContent: any) => void;
};

export const useSearchStore = create<SearchStore>()((set) => {
  return {
    currentLoadedBooks: [],
    setCurrentLoadedBooks: (currentLoadedBooks: any) =>
      set({ currentLoadedBooks }),
    currentContent: [],
    setCurrentContent: (currentContent: any) => set({ currentContent }),
    currentKeyWord: "",
    setCurrentKeyWord: (currentKeyWord: string) => set({ currentKeyWord }),
    retriggerSearch: false,
    setRetriggerSearch: (retriggerSearch: boolean) => set({ retriggerSearch }),
    currentLoadedMessages: [],
    setCurrentLoadedMessages: (currentLoadedMessages: any) =>
      set({ currentLoadedMessages }),
    currentMessageContent: [],
    setCurrentMessageContent: (currentMessageContent: any) =>
      set({ currentMessageContent }),
  };
});

type utilsStore = {
  currentTab: string;
  updateCurrentTab: (currentTab: string) => void;
  isSheetOpen: boolean;
  setIsSheetOpen: (isSheetOpen: boolean) => void;
};

export const useUtilsStore = create<utilsStore>()((set) => {
  return {
    currentTab: "bible",
    updateCurrentTab: (currentTab: string) => set({ currentTab }),
    isSheetOpen: false,
    setIsSheetOpen: (isSheetOpen: boolean) => set({ isSheetOpen }),
  };
});
