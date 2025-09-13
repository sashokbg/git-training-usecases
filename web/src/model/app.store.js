import { create } from 'zustand';

export const useAppStore = create((set) => ({
  isLoggedIn: false,
  loginInProgress: false,
  showAliasImport: false,
  backgroundOpInProgress: false,
  currentEditor: "",

  setCurrentEditor: (value) => set({ currentEditor: value }),
  setShowAliasImport: (value) => set({ showAliasImport: value }),
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
  setLoginInProgress: (value) => set({ loginInProgress: value }),
  resetShellState: () => set({ isLoggedIn: false, loginInProgress: false, sessionStatus: null }),
  setBackgroundOpInProgress: (value) => set({ backgroundOpInProgress: value }),
}));

export default useAppStore;
