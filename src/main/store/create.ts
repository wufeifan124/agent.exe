import { createStore } from 'zustand/vanilla';
import { AppState } from './types';

export const store = createStore<AppState>()(() => ({
  counter: 10,
}));
