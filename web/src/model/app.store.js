import { create } from 'zustand';

const COMPLETED_STORAGE_KEY = 'completed.exercises';

function loadCompletedFromStorage() {
  try {
    if (typeof localStorage === 'undefined') return {};
    const raw = localStorage.getItem(COMPLETED_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

function saveCompletedToStorage(map) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(COMPLETED_STORAGE_KEY, JSON.stringify(map || {}));
  } catch (e) {
  }
}

export const useAppStore = create((set, get) => ({
  isLoggedIn: false,
  loginInProgress: false,
  showAliasImport: false,
  backgroundOpInProgress: false,
  currentEditor: "",
  completedExercises: loadCompletedFromStorage(), // { [exerciseTitle]: true }

  setCurrentEditor: (value) => set({ currentEditor: value }),
  setShowAliasImport: (value) => set({ showAliasImport: value }),
  setIsLoggedIn: (value) => set({ isLoggedIn: value }),
  setLoginInProgress: (value) => set({ loginInProgress: value }),
  resetShellState: () => set({ isLoggedIn: false, loginInProgress: false, sessionStatus: null }),
  setBackgroundOpInProgress: (value) => set({ backgroundOpInProgress: value }),

  markExerciseComplete: (title) => {
    if (!title) return;
    const current = get().completedExercises || {};
    if (current[title]) return; // already marked
    const next = { ...current, [title]: true };
    saveCompletedToStorage(next);
    set({ completedExercises: next });
  },

  unmarkExerciseComplete: (title) => {
    if (!title) return;
    const current = get().completedExercises || {};
    if (!current[title]) return;
    const next = { ...current };
    delete next[title];
    saveCompletedToStorage(next);
    set({ completedExercises: next });
  },
}));

export default useAppStore;
