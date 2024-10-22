import { createStore } from 'zustand/vanilla';
import { createDispatch } from 'zutron/main';
import { AppState } from './types';
import { startRun } from './startRun';

export const store = createStore<AppState>((set, get) => ({
  instructions: null,
  humanSupervised: true,
  running: false,
  error: null,
  START_RUN: async (payload) => {
    startRun(set, get, payload);
  },
}));

export const dispatch = createDispatch(store);
