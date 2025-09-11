import { create } from 'zustand';

export const useAppStore = create((set) => ({
  isLoggedIn: false,
  loginInProgress: false,
  hiddenChannelOps: 0,
  showAliasImport: false,

  setShowAliasImport: (value) => set({ showAliasImport: value }),
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
  setLoginInProgress: (value) => set({ loginInProgress: value }),
  resetShellState: () => set({ isLoggedIn: false, loginInProgress: false, sessionStatus: null }),
  startHiddenChannelOp: () => set((state) => ({ hiddenChannelOps: state.hiddenChannelOps + 1 })),
  endHiddenChannelOp: () => set((state) => ({ hiddenChannelOps: Math.max(0, state.hiddenChannelOps - 1) })),
  resetHiddenChannelOps: () => set({ hiddenChannelOps: 0 }),
}));

export default useAppStore;
