import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { GameEntity, CellPosition, DifficultyLevel, HintLevel, HintResponse } from '@domain/types/GameTypes';
import { MoveValidator } from '@domain/rules';

interface GameStore {
  currentGame: GameEntity | null;
  selectedCell: CellPosition | null;
  currentHint: HintResponse | null;
  isHintActive: boolean;

  startNewGame: (difficulty: DifficultyLevel) => void;
  selectCell: (row: number, col: number) => void;
  useHint: (level: HintLevel) => Promise<void>;
  clearHint: () => void;
  setCurrentGame: (game: GameEntity) => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    persist(
      (set, get) => ({
        currentGame: null,
        selectedCell: null,
        currentHint: null,
        isHintActive: false,

        startNewGame: (difficulty) => {
          console.log('Start new game:', difficulty);
          // Clear any active hints when starting new game
          set({ currentHint: null, isHintActive: false });
        },

        selectCell: (row, col) => {
          set({ selectedCell: MoveValidator.createCellPosition(row, col) });
        },

        useHint: async (level: HintLevel) => {
          const { currentGame } = get();
          if (!currentGame) {
            throw new Error('No active game to provide hints for');
          }

          // TODO: Implement actual hint system integration
          // This will be implemented when dependency injection is set up
          console.log(`Hint requested for level ${level}`);

          // For now, set a placeholder hint
          const placeholderHint: HintResponse = {
            level,
            message: 'Hint system will be integrated with dependency injection',
            targetCells: [],
            relatedCells: [],
            confidence: 0.5,
            colorHighlights: [],
            ratingPenalty: 0 // Placeholder, no penalty for integration placeholder
          };

          set({
            currentHint: placeholderHint,
            isHintActive: true
          });
        },

        clearHint: () => {
          set({ currentHint: null, isHintActive: false });
        },

        setCurrentGame: (game: GameEntity) => {
          set({ currentGame: game });
        },
      }),
      {
        name: 'sudoku-game-store',
        // Don't persist hints as they are temporary
        partialize: (state) => ({
          currentGame: state.currentGame,
          selectedCell: state.selectedCell
        })
      }
    )
  )
);