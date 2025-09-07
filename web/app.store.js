import { create } from 'zustand';

export const useAppStore = create((set) => ({
  isLoggedIn: false,
  loginInProgress: false,

  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
  setLoginInProgress: (value) => set({ loginInProgress: value }),
  resetShellState: () => set({ isLoggedIn: false, loginInProgress: false, sessionStatus: null }),
}));

export default useAppStore;
