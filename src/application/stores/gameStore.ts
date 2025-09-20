import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GameEntity, CellPosition, DifficultyLevel } from '@domain/types/GameTypes';

interface GameStore {
  currentGame: GameEntity | null;
  selectedCell: CellPosition | null;

  startNewGame: (difficulty: DifficultyLevel) => void;
  selectCell: (row: number, col: number) => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set) => ({
        currentGame: null,
        selectedCell: null,

        startNewGame: (difficulty) => {
          console.log('Start new game:', difficulty);
        },

        selectCell: (row, col) => {
          set({ selectedCell: { row, col } });
        },
      }),
      { name: 'sudoku-game-store' }
    )
  )
);