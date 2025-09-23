import { IHintSystem } from '../../../domain/interfaces/IHintSystem';
import { IGameRepository } from '../../../domain/interfaces/IGameRepository';
import {
  HintRequest,
  HintResponse,
  HintLevel,
  GameEntity,
  GameHintUsage,
  PlayerProfile
} from '../../../domain/types/GameTypes';

export interface UseHintRequest {
  gameId: string;
  requestedLevel: HintLevel;
}

export interface UseHintResponse {
  hint: HintResponse;
  updatedGame: GameEntity;
  hintsRemaining?: number;
}

export class UseHintUseCase {
  constructor(
    private hintSystem: IHintSystem,
    private gameRepository: IGameRepository
  ) {}

  async execute(request: UseHintRequest): Promise<UseHintResponse> {
    // 1. Load current game
    const game = await this.gameRepository.findById(request.gameId);
    if (!game) {
      throw new Error(`Game with id ${request.gameId} not found`);
    }

    if (game.isCompleted) {
      throw new Error('Cannot use hints on completed game');
    }

    // 2. Validate hint request
    this.validateHintRequest(request, game);

    // 3. Check if hint is allowed based on current usage
    if (!this.hintSystem.isHintAllowed(request.requestedLevel, game.hintUsageHistory, game.difficulty)) {
      throw new Error(this.getHintLimitMessage(request.requestedLevel));
    }

    // 4. Create hint request
    const hintRequest: HintRequest = {
      grid: game.grid,
      difficulty: game.difficulty,
      requestedLevel: request.requestedLevel,
      playerProfile: game.playerProfile
    };

    // 5. Get hint from hint system
    const hint = await this.hintSystem.getHint(hintRequest);

    // 6. Update game state
    const updatedGame = this.updateGameWithHintUsage(game, hint, request.requestedLevel);

    // 7. Save updated game
    await this.gameRepository.save(updatedGame);

    // 8. Calculate remaining hints for direct solution level
    const hintsRemaining = request.requestedLevel === HintLevel.DIRECT_SOLUTION
      ? this.calculateRemainingDirectHints(updatedGame)
      : undefined;

    return {
      hint,
      updatedGame,
      hintsRemaining
    };
  }

  private validateHintRequest(request: UseHintRequest, game: GameEntity): void {
    if (!Object.values(HintLevel).includes(request.requestedLevel)) {
      throw new Error(`Invalid hint level: ${request.requestedLevel}`);
    }

    // Additional validation based on business rules
    if (request.requestedLevel === HintLevel.DIRECT_SOLUTION) {
      const directHintsUsed = game.hintUsageHistory.filter(
        usage => usage.level === HintLevel.DIRECT_SOLUTION
      ).length;

      if (directHintsUsed >= 3) {
        throw new Error('Maximum direct solution hints (3) already used for this game');
      }
    }
  }

  private updateGameWithHintUsage(
    game: GameEntity,
    hint: HintResponse,
    requestedLevel: HintLevel
  ): GameEntity {
    const hintUsage: GameHintUsage = {
      level: requestedLevel,
      technique: hint.technique || 'General',
      timestamp: new Date(),
      wasHelpful: hint.confidence > 0.5, // Assume helpful if confidence is high
      ratingPenalty: hint.ratingPenalty // Store penalty for rating calculation (Business Analysis requirement)
    };

    const updatedGame: GameEntity = {
      ...game,
      hintsUsed: game.hintsUsed + 1,
      hintUsageHistory: [...game.hintUsageHistory, hintUsage]
    };

    // Update direct solution hints counter
    if (requestedLevel === HintLevel.DIRECT_SOLUTION) {
      updatedGame.directSolutionHintsUsed = game.directSolutionHintsUsed + 1;
    }

    // Update player profile if it exists
    if (game.playerProfile) {
      updatedGame.playerProfile = this.hintSystem.updatePlayerProfile(
        game.playerProfile,
        updatedGame.hintUsageHistory
      );
    } else {
      // Create initial player profile
      updatedGame.playerProfile = this.createInitialPlayerProfile(hintUsage);
    }

    return updatedGame;
  }

  private createInitialPlayerProfile(firstHintUsage: GameHintUsage): PlayerProfile {
    return {
      preferredTechniques: [firstHintUsage.technique],
      problemAreas: [],
      learningSpeed: 'medium',
      patienceLevel: 'medium',
      visualPreference: true // Default to visual hints
    };
  }

  private calculateRemainingDirectHints(game: GameEntity): number {
    return Math.max(0, 3 - game.directSolutionHintsUsed);
  }

  private getHintLimitMessage(level: HintLevel): string {
    switch (level) {
      case HintLevel.DIRECT_SOLUTION:
        return 'You have reached the maximum limit of 3 direct solution hints per game. Try using lower level hints to continue learning.';
      default:
        return 'Hint limit reached for this level.';
    }
  }
}