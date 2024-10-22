import type { Reducer } from 'zutron';

import { type AppState } from './types';

type CounterAction = {
  type: 'COUNTER:SET';
  payload: number;
};

export const counterReducer: Reducer<number> = (
  state,
  action: CounterAction,
) => {
  switch (action.type) {
    case 'COUNTER:SET':
      return action.payload;
    default:
      return state;
  }
};
export const rootReducer: Reducer<AppState> = (state, action) => ({
  counter: counterReducer(state.counter, action),
});

export type Subscribe = (
  listener: (state: AppState, prevState: AppState) => void,
) => () => void;
export type Handlers = Record<string, () => void>;

export type Store = {
  getState: () => AppState;
  getInitialState: () => AppState;
  setState: (stateSetter: (state: AppState) => AppState) => void;
  subscribe: Subscribe;
};
