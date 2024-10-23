import { BetaMessageParam } from '@anthropic-ai/sdk/resources/beta/messages/messages';

export type AppState = {
  instructions: string | null;
  humanSupervised: boolean;
  running: boolean;
  error: string | null;

  runHistory: BetaMessageParam[];

  START_RUN: () => void;
  STOP_RUN: () => void;
  SET_INSTRUCTIONS: (instructions: string) => void;
  SET_HUMAN_SUPERVISED: (humanSupervised: boolean) => void;
};
