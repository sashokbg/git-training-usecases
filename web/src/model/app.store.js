import { create } from 'zustand';

const COMPLETED_STORAGE_KEY = 'completed.exercises';
const SCORE_STORAGE_KEY = 'score.total';

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

function loadScoreFromStorage() {
  try {
    if (typeof localStorage === 'undefined') return 0;
    const raw = localStorage.getItem(SCORE_STORAGE_KEY);
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch (e) {
    return 0;
  }
}

function saveScoreToStorage(value) {
  try {
    if (typeof localStorage === 'undefined') return;
    const v = Math.max(0, Number(value) || 0);
    localStorage.setItem(SCORE_STORAGE_KEY, String(v));
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
  score: loadScoreFromStorage(),

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

  addScore: (points) => {
    const p = Math.max(0, Number(points) || 0);
    const next = (get().score || 0) + p;
    saveScoreToStorage(next);
    set({ score: next });
  },

  subtractScore: (points) => {
    const p = Math.max(0, Number(points) || 0);
    const next = Math.max(0, (get().score || 0) - p);
    saveScoreToStorage(next);
    set({ score: next });
  },
}));

export default useAppStore;
