import { createContext, useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { AppState } from '../types';

export interface AppContextType {
  state: AppState;
  setAppState: Dispatch<SetStateAction<AppState>>;
  updateAppState: (updates: Partial<AppState>) => void;
  handleQuizAnswer: (quizId: number, answerKey: string) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppStateContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppStateContext must be used within a Provider');
  return ctx;
};
