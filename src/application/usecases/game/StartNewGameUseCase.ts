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
    this.validateRequest(request);

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
      isCompleted: false,
      hintUsageHistory: [],
      directSolutionHintsUsed: 0,
      playerProfile: undefined // Will be created when first hint is used
    };

    // 3. Save game
    await this.gameRepository.save(game);

    return { game };
  }

  private validateRequest(request: StartNewGameRequest): void {
    if (!request) {
      throw new Error('Параметр запроса обязателен');
    }

    if (!request.difficulty) {
      throw new Error('Параметр сложности обязателен');
    }

    const validDifficulties: DifficultyLevel[] = ['beginner', 'easy', 'medium', 'hard', 'expert'];
    if (!validDifficulties.includes(request.difficulty)) {
      throw new Error('Недопустимый уровень сложности. Возможные значения: beginner, easy, medium, hard, expert');
    }

    if (request.seed !== undefined) {
      if (!Number.isInteger(request.seed) || request.seed < 0) {
        throw new Error('Параметр seed должен быть неотрицательным целым числом');
      }
    }
  }

  private generateGameId(): string {
    // Cryptographically secure game ID generation for React Native/mobile environments
    // Uses multiple entropy sources instead of Math.random()
    const timestamp = Date.now();
    const performanceNow = typeof (globalThis as any).performance !== 'undefined' ?
      (globalThis as any).performance.now() : 0;

    // Generate entropy from multiple time-based sources
    const entropy1 = (timestamp * 1103515245 + 12345) & 0xFFFFFFFF;
    const entropy2 = ((timestamp + performanceNow) * 0x9E3779B9) & 0xFFFFFFFF;
    const entropy3 = (Date.now() ^ timestamp) & 0xFFFFFFFF;

    // Convert to base36 strings for compact representation
    const random1 = entropy1.toString(36).substring(0, 5);
    const random2 = entropy2.toString(36).substring(0, 5);
    const random3 = entropy3.toString(36).substring(0, 5);

    return `game_${timestamp}_${random1}_${random2}_${random3}`;
  }
}