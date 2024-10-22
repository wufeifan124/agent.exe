export type AppState = {
  instructions: string | null;
  humanSupervised: boolean;
  running: boolean;
  error: string | null;
  START_RUN: (payload: {
    instructions: string;
    humanSupervised: boolean;
  }) => void;
};
