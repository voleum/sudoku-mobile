import { StartNewGameUseCase } from '../src/application/usecases/game/StartNewGameUseCase';
import { PuzzleGeneratorService } from '../src/infrastructure/services/PuzzleGeneratorService';
import { InMemoryGameRepository } from '../src/infrastructure/repositories/InMemoryGameRepository';
import { DifficultyLevel } from '../src/domain/types/GameTypes';

describe('StartNewGameUseCase', () => {
  let useCase: StartNewGameUseCase;
  let puzzleGenerator: PuzzleGeneratorService;
  let gameRepository: InMemoryGameRepository;

  beforeEach(() => {
    puzzleGenerator = PuzzleGeneratorService.getInstance();
    gameRepository = new InMemoryGameRepository();
    useCase = new StartNewGameUseCase(puzzleGenerator, gameRepository);
  });

  test('should create new game with easy difficulty', async () => {
    const request = { difficulty: 'easy' as DifficultyLevel };

    const response = await useCase.execute(request);

    expect(response.game).toBeDefined();
    expect(response.game.difficulty).toBe('easy');
    expect(response.game.id).toBeDefined();
    expect(response.game.startTime).toBeInstanceOf(Date);
    expect(response.game.isCompleted).toBe(false);
    expect(response.game.hintsUsed).toBe(0);
    expect(response.game.errorsCount).toBe(0);
  });

  test('should create game with correct clue count for difficulty', async () => {
    const request = { difficulty: 'easy' as DifficultyLevel };

    const response = await useCase.execute(request);

    // Count filled cells in the grid
    let filledCells = 0;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (response.game.grid[row][col] !== 0) {
          filledCells++;
        }
      }
    }

    // Easy difficulty should have 32-35 clues according to updated business analysis
    // Source: 1.2-game-rules-gameplay.md section 1.2.2
    expect(filledCells).toBeGreaterThanOrEqual(32);
    expect(filledCells).toBeLessThanOrEqual(35);
  });

  test('should save game to repository', async () => {
    const request = { difficulty: 'medium' as DifficultyLevel };

    const response = await useCase.execute(request);

    const savedGame = await gameRepository.findById(response.game.id);
    expect(savedGame).toBeDefined();
    expect(savedGame?.difficulty).toBe('medium');
  });

  test('should create reproducible games with same seed', async () => {
    const seed = 12345;
    const request1 = { difficulty: 'hard' as DifficultyLevel, seed };
    const request2 = { difficulty: 'hard' as DifficultyLevel, seed };

    const response1 = await useCase.execute(request1);
    const response2 = await useCase.execute(request2);

    // Grids should be identical when using same seed
    expect(response1.game.originalGrid).toEqual(response2.game.originalGrid);
    expect(response1.game.solution).toEqual(response2.game.solution);
  });

  test('should create beginner difficulty game with correct clue count', async () => {
    const request = { difficulty: 'beginner' as DifficultyLevel };

    const response = await useCase.execute(request);

    // Count filled cells in the grid
    let filledCells = 0;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (response.game.grid[row][col] !== 0) {
          filledCells++;
        }
      }
    }

    // Beginner difficulty should have 36-40 clues according to business analysis
    // Source: 1.2-game-rules-gameplay.md section 1.2.2
    expect(response.game.difficulty).toBe('beginner');
    expect(filledCells).toBeGreaterThanOrEqual(36);
    expect(filledCells).toBeLessThanOrEqual(40);
  });
});