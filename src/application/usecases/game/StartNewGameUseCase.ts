import { GameEntity, DifficultyLevel } from '../../../domain/types/GameTypes';
import { IPuzzleGenerator } from '../../../domain/interfaces/IPuzzleGenerator';
import { IGameRepository } from '../../../domain/interfaces/IGameRepository';

export interface StartNewGameRequest {
  difficulty: DifficultyLevel;
  seed?: number;
}

export interface StartNewGameResponse {
  game: GameEntity;
}

export class StartNewGameUseCase {
  constructor(
    private puzzleGenerator: IPuzzleGenerator,
    private gameRepository: IGameRepository
  ) {}

  async execute(request: StartNewGameRequest): Promise<StartNewGameResponse> {
    // 1. Generate puzzle
    const puzzle = await this.puzzleGenerator.generate(request.difficulty, request.seed);

    // 2. Create game entity
    const game: GameEntity = {
      id: this.generateGameId(),
      puzzleId: puzzle.id,
      grid: puzzle.grid.map(row => [...row]),
      originalGrid: puzzle.grid.map(row => [...row]),
      solution: puzzle.solution.map(row => [...row]),
      difficulty: puzzle.difficulty,
      startTime: new Date(),
      currentTime: 0,
      hintsUsed: 0,
      errorsCount: 0,
      isCompleted: false
    };

    // 3. Save game
    await this.gameRepository.save(game);

    return { game };
  }

  private generateGameId(): string {
    return 'game_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}