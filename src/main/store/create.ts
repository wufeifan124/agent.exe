import { createStore } from 'zustand/vanilla';
import { createDispatch } from 'zutron/main';
import { AppState } from './types';
import { startRun } from './startRun';

export const store = createStore<AppState>((set, get) => ({
  instructions: 'Click the search bar', // Default value
  humanSupervised: true, // Default value
  running: true,
  error: null,
  runHistory: [],
  START_RUN: async () => startRun(set, get),
  STOP_RUN: () => set({ running: false }), // Add this line
  SET_INSTRUCTIONS: (instructions) => set({ instructions }),
  SET_HUMAN_SUPERVISED: (humanSupervised) => set({ humanSupervised }),
}));

export const dispatch = createDispatch(store);
