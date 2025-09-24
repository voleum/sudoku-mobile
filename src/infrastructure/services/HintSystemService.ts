import { IHintSystem } from '../../domain/interfaces/IHintSystem';
import { ISudokuSolver, HintResult } from '../../domain/interfaces/ISudokuSolver';
import {
  HintRequest,
  HintResponse,
  PlayerProfile,
  SudokuGrid,
  HintLevel,
  CellPosition,
  GameHintUsage,
  CellValue,
  DifficultyLevel
} from '../../domain/types/GameTypes';
import { MoveValidator } from '../../domain/rules/SudokuRules';
import {
  DomainError,
  InvalidHintLevelError,
  UnknownError,
  MissingRequiredParameterError
} from '../../domain/errors';

export class HintSystemService implements IHintSystem {
  private static readonly MAX_DIRECT_SOLUTION_HINTS = 3;
  private static readonly TECHNIQUE_DIFFICULTY_MAP = {
    'Naked Singles': 'basic',
    'Hidden Singles': 'basic',
    'Naked Pairs': 'intermediate',
    'Box/Line Reduction': 'intermediate',
    'X-Wing': 'advanced',
    'Swordfish': 'advanced'
  } as const;

  constructor(private sudokuSolver: ISudokuSolver) {}

  async getHint(request: HintRequest): Promise<HintResponse> {
    try {
      // Validate input parameters
      this.validateHintRequest(request);

      const complexity = this.calculateComplexity(request.grid);
      const availableTechniques = await this.getAvailableTechniques(request.grid);

      // Get hint from solver first
      const solverHint = this.sudokuSolver.getHint(request.grid);

      switch (request.requestedLevel) {
        case HintLevel.GENERAL_DIRECTION:
          return this.generateGeneralDirectionHint(request.grid, availableTechniques, complexity);

        case HintLevel.SPECIFIC_TECHNIQUE:
          return this.generateSpecificTechniqueHint(request.grid, solverHint, availableTechniques);

        case HintLevel.EXACT_LOCATION:
          return this.generateExactLocationHint(request.grid, solverHint);

        case HintLevel.DIRECT_SOLUTION:
          return this.generateDirectSolutionHint(request.grid, solverHint);

        default:
          throw new InvalidHintLevelError(request.requestedLevel.toString());
      }
    } catch (error) {
      if (error instanceof DomainError) {
        throw error;
      }

      // Log unexpected errors for debugging
      console.error('Unexpected error in getHint:', error);
      throw new UnknownError('Failed to generate hint due to unexpected error');
    }
  }

  async getAvailableTechniques(grid: SudokuGrid): Promise<string[]> {
    const techniques = this.sudokuSolver.analyzeTechniques(grid);
    return techniques
      .filter(t => t.applicable)
      .map(t => t.technique);
  }

  updatePlayerProfile(profile: PlayerProfile, hintUsage: GameHintUsage[]): PlayerProfile {
    const updatedProfile = { ...profile };

    // Update preferred techniques based on usage
    const techniqueUsage = new Map<string, number>();
    hintUsage.forEach(usage => {
      const count = techniqueUsage.get(usage.technique) || 0;
      techniqueUsage.set(usage.technique, count + 1);
    });

    // Sort techniques by usage frequency
    updatedProfile.preferredTechniques = Array.from(techniqueUsage.entries())
      .sort(([,a], [,b]) => b - a)
      .map(([technique]) => technique);

    // Determine learning speed based on hint frequency
    const recentHints = hintUsage.filter(usage =>
      Date.now() - usage.timestamp.getTime() < 7 * 24 * 60 * 60 * 1000 // Last 7 days
    );

    if (recentHints.length > 20) {
      updatedProfile.learningSpeed = 'slow';
      updatedProfile.patienceLevel = 'low';
    } else if (recentHints.length > 10) {
      updatedProfile.learningSpeed = 'medium';
      updatedProfile.patienceLevel = 'medium';
    } else {
      updatedProfile.learningSpeed = 'fast';
      updatedProfile.patienceLevel = 'high';
    }

    return updatedProfile;
  }

  isHintAllowed(level: HintLevel, currentUsage: GameHintUsage[], difficulty: DifficultyLevel): boolean {
    // Hybrid system: combines Business Analysis logic with Technical Specification limits
    // Business Analysis: detailed level restrictions with educational progression
    // Technical Specification: higher overall limits for better user experience

    const usageStats = this.calculateUsageStats(currentUsage, level);

    // Universal limit: Maximum 3 direct solution hints per game (Business Analysis)
    if (this.isDirectSolutionLimitExceeded(level, usageStats.directSolutionCount)) {
      return false;
    }

    // Hybrid difficulty-based limits
    return this.isHintAllowedForDifficulty(level, difficulty, usageStats, currentUsage);
  }

  private calculateUsageStats(currentUsage: GameHintUsage[], level: HintLevel) {
    return {
      currentLevelUsage: currentUsage.filter(usage => usage.level === level).length,
      directSolutionCount: currentUsage.filter(usage => usage.level === HintLevel.DIRECT_SOLUTION).length,
      totalHints: currentUsage.length,
      basicHintsCount: currentUsage.filter(u => u.level <= HintLevel.SPECIFIC_TECHNIQUE).length
    };
  }

  private isDirectSolutionLimitExceeded(level: HintLevel, directSolutionCount: number): boolean {
    return level === HintLevel.DIRECT_SOLUTION && directSolutionCount >= HintSystemService.MAX_DIRECT_SOLUTION_HINTS;
  }

  private isHintAllowedForDifficulty(
    level: HintLevel,
    difficulty: DifficultyLevel,
    stats: ReturnType<typeof this.calculateUsageStats>,
    currentUsage: GameHintUsage[]
  ): boolean {
    switch (difficulty) {
      case 'beginner':
        return this.isHintAllowedForBeginner(level, stats);

      case 'easy':
        return this.isHintAllowedForEasy(level, stats);

      case 'medium':
        return this.isHintAllowedForMedium(level, stats, currentUsage);

      case 'hard':
        return this.isHintAllowedForHard(level, stats, currentUsage);

      case 'expert':
        return this.isHintAllowedForExpert(level, stats);

      default:
        return false;
    }
  }

  private isHintAllowedForBeginner(level: HintLevel, stats: ReturnType<typeof this.calculateUsageStats>): boolean {
    // Business Analysis: Unlimited level 1-2 hints for educational purposes
    return level <= HintLevel.SPECIFIC_TECHNIQUE ||
           (level === HintLevel.EXACT_LOCATION && stats.currentLevelUsage < 5) ||
           (level === HintLevel.DIRECT_SOLUTION && stats.directSolutionCount < 3);
  }

  private isHintAllowedForEasy(level: HintLevel, stats: ReturnType<typeof this.calculateUsageStats>): boolean {
    // Technical Specification: 10 hints total, but with educational progression
    if (stats.totalHints >= 10) return false;
    // Allow more freedom for beginners while maintaining some structure
    return level <= HintLevel.EXACT_LOCATION || stats.directSolutionCount < 2;
  }

  private isHintAllowedForMedium(
    level: HintLevel,
    stats: ReturnType<typeof this.calculateUsageStats>,
    currentUsage: GameHintUsage[]
  ): boolean {
    // Technical Specification: 7 hints total, with Business Analysis structure
    if (stats.totalHints >= 7) return false;
    // Encourage learning: prefer lower level hints
    if (level <= HintLevel.SPECIFIC_TECHNIQUE) {
      return stats.basicHintsCount < 5;
    } else if (level === HintLevel.EXACT_LOCATION) {
      return stats.currentLevelUsage < 2;
    } else {
      return stats.directSolutionCount < 1;
    }
  }

  private isHintAllowedForHard(
    level: HintLevel,
    stats: ReturnType<typeof this.calculateUsageStats>,
    currentUsage: GameHintUsage[]
  ): boolean {
    // Technical Specification: 5 hints total, with strict educational limits
    if (stats.totalHints >= 5) return false;
    // Mostly level 1-2 hints to encourage skill development
    if (level <= HintLevel.SPECIFIC_TECHNIQUE) {
      return stats.basicHintsCount < 4;
    } else if (level === HintLevel.EXACT_LOCATION) {
      return stats.currentLevelUsage < 1;
    } else {
      return false; // No direct solutions for hard difficulty
    }
  }

  private isHintAllowedForExpert(level: HintLevel, stats: ReturnType<typeof this.calculateUsageStats>): boolean {
    // Technical Specification: 3 hints total, with maximum restriction
    if (stats.totalHints >= 3) return false;
    // Expert level: only general direction hints allowed
    return level === HintLevel.GENERAL_DIRECTION && stats.currentLevelUsage < 3;
  }

  calculateComplexity(grid: SudokuGrid): number {
    const emptyCells = this.countEmptyCells(grid);
    const techniques = this.sudokuSolver.analyzeTechniques(grid);
    const applicableTechniques = techniques.filter(t => t.applicable);

    const baseWeight = 1.0;
    const techniqueWeight = 0.5;
    const depthWeight = 2.0;

    const maxLogicalDepth = this.calculateLogicalDepth(applicableTechniques);

    return emptyCells * baseWeight +
           applicableTechniques.length * techniqueWeight +
           maxLogicalDepth * depthWeight;
  }

  calculateRatingPenalty(level: HintLevel): number {
    // Business Analysis: Rating penalty system (строки 644-648)
    switch (level) {
      case HintLevel.GENERAL_DIRECTION:
        return 5; // -5% от финального рейтинга
      case HintLevel.SPECIFIC_TECHNIQUE:
        return 10; // -10% от финального рейтинга
      case HintLevel.EXACT_LOCATION:
        return 20; // -20% от финального рейтинга
      case HintLevel.DIRECT_SOLUTION:
        return 50; // -50% от финального рейтинга
      default:
        return 0;
    }
  }

  private generateGeneralDirectionHint(
    grid: SudokuGrid,
    _techniques: string[],
    complexity: number
  ): HintResponse {
    const targetArea = this.findBestAreaToFocus(grid);
    const areaName = this.getAreaName(targetArea);

    let message: string;
    if (complexity < 10) {
      message = `Обратите внимание на ${areaName} - там можно найти очевидные варианты`;
    } else if (complexity < 20) {
      message = `Попробуйте применить технику исключения в ${areaName}`;
    } else {
      message = `Поищите сложные паттерны в ${areaName} - возможно, потребуются продвинутые техники`;
    }

    return {
      level: HintLevel.GENERAL_DIRECTION,
      message,
      targetCells: targetArea,
      relatedCells: [],
      confidence: 0.7,
      colorHighlights: [{
        cells: targetArea,
        color: 'yellow',
        purpose: 'related'
      }],
      ratingPenalty: this.calculateRatingPenalty(HintLevel.GENERAL_DIRECTION)
    };
  }

  private generateSpecificTechniqueHint(
    grid: SudokuGrid,
    solverHint: HintResult,
    _techniques: string[]
  ): HintResponse {
    if (!solverHint.hasHint) {
      return this.generateNoHintAvailable();
    }

    const technique = solverHint.technique;
    const targetCell = solverHint.position ? [solverHint.position] : [];

    let message: string;
    let explanation: string;

    switch (technique) {
      case 'Naked Singles':
        message = `Используйте технику 'Naked Singles' - есть ячейка с единственным возможным вариантом`;
        explanation = `Найдите ячейку, где исключением остается только одна возможная цифра`;
        break;
      case 'Hidden Singles':
        message = `Примените технику 'Hidden Singles' - цифра может стоять только в одном месте`;
        explanation = `В одном из блоков/строк/столбцов есть цифра, которая может быть размещена только в одной позиции`;
        break;
      default:
        message = `Попробуйте технику '${technique}'`;
        explanation = `Эта техника поможет найти следующий ход`;
    }

    const relatedCells = this.getRelatedCells(grid, targetCell[0]);

    return {
      level: HintLevel.SPECIFIC_TECHNIQUE,
      message,
      technique,
      explanation,
      targetCells: targetCell,
      relatedCells,
      confidence: solverHint.confidence || 0.8,
      colorHighlights: [
        {
          cells: targetCell,
          color: 'blue',
          purpose: 'target'
        },
        {
          cells: relatedCells,
          color: 'yellow',
          purpose: 'related'
        }
      ],
      ratingPenalty: this.calculateRatingPenalty(HintLevel.SPECIFIC_TECHNIQUE)
    };
  }

  private generateExactLocationHint(grid: SudokuGrid, solverHint: HintResult): HintResponse {
    if (!solverHint.hasHint || !solverHint.position) {
      return this.generateNoHintAvailable();
    }

    const position = solverHint.position;
    const targetCell = [position];
    const relatedCells = this.getRelatedCells(grid, position);

    const message = `Ячейка ${this.formatCellPosition(position)} является ключевой для продвижения`;
    const explanation = `Проанализируйте возможные варианты для этой ячейки, учитывая ограничения строки, столбца и блока`;

    return {
      level: HintLevel.EXACT_LOCATION,
      message,
      technique: solverHint.technique,
      explanation,
      targetCells: targetCell,
      relatedCells,
      confidence: solverHint.confidence || 0.9,
      colorHighlights: [
        {
          cells: targetCell,
          color: 'blue',
          purpose: 'target'
        },
        {
          cells: relatedCells,
          color: 'yellow',
          purpose: 'related'
        }
      ],
      ratingPenalty: this.calculateRatingPenalty(HintLevel.EXACT_LOCATION)
    };
  }

  private generateDirectSolutionHint(grid: SudokuGrid, solverHint: HintResult): HintResponse {
    if (!solverHint.hasHint || !solverHint.position || !solverHint.value) {
      return this.generateNoHintAvailable();
    }

    const position = solverHint.position;
    const value = solverHint.value;
    const targetCell = [position];

    const message = `Поставьте цифру ${value} в ячейку ${this.formatCellPosition(position)}`;
    const explanation = `Это прямое решение основано на анализе всех возможных вариантов`;

    return {
      level: HintLevel.DIRECT_SOLUTION,
      message,
      technique: solverHint.technique,
      explanation,
      targetCells: targetCell,
      relatedCells: [],
      suggestedValue: value as CellValue,
      confidence: 1.0,
      colorHighlights: [
        {
          cells: targetCell,
          color: 'green',
          purpose: 'positive'
        }
      ],
      ratingPenalty: this.calculateRatingPenalty(HintLevel.DIRECT_SOLUTION)
    };
  }

  private generateNoHintAvailable(): HintResponse {
    return {
      level: HintLevel.GENERAL_DIRECTION,
      message: 'В данный момент нет доступных подсказок. Проверьте правильность текущих ходов.',
      targetCells: [],
      relatedCells: [],
      confidence: 0.0,
      colorHighlights: [],
      ratingPenalty: 0 // No penalty for unavailable hints
    };
  }

  private findBestAreaToFocus(grid: SudokuGrid): CellPosition[] {
    // Find area with most constraints (filled cells)
    let bestScore = -1;
    let bestArea: CellPosition[] = [];

    // Check each 3x3 block
    for (let blockRow = 0; blockRow < 3; blockRow++) {
      for (let blockCol = 0; blockCol < 3; blockCol++) {
        const blockCells: CellPosition[] = [];
        let filledCount = 0;

        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const row = blockRow * 3 + r;
            const col = blockCol * 3 + c;
            const position = MoveValidator.createCellPosition(row, col);
            blockCells.push(position);

            if (grid[row][col] !== 0) {
              filledCount++;
            }
          }
        }

        // Score: prefer blocks with more filled cells but not complete
        const score = filledCount < 9 ? filledCount : 0;
        if (score > bestScore) {
          bestScore = score;
          bestArea = blockCells.filter(pos => grid[pos.row][pos.col] === 0);
        }
      }
    }

    return bestArea;
  }

  private getAreaName(cells: CellPosition[]): string {
    if (cells.length === 0) return 'игровое поле';

    const firstCell = cells[0];
    const blockNum = firstCell.box + 1;
    return `блок ${blockNum}`;
  }

  private getRelatedCells(grid: SudokuGrid, position: CellPosition): CellPosition[] {
    const related: CellPosition[] = [];

    // Add row cells
    related.push(...MoveValidator.getCellsInSameRow(position.row));

    // Add column cells
    related.push(...MoveValidator.getCellsInSameColumn(position.col));

    // Add box cells
    related.push(...MoveValidator.getCellsInSameBox(position.row, position.col));

    // Remove duplicates and target cell
    const uniqueRelated = related.filter((cell, index, array) =>
      array.findIndex(c => c.row === cell.row && c.col === cell.col) === index &&
      !(cell.row === position.row && cell.col === position.col)
    );

    return uniqueRelated;
  }

  private formatCellPosition(position: CellPosition): string {
    const column = String.fromCharCode(65 + position.col); // A-I
    const row = (position.row + 1).toString(); // 1-9
    return `${column}${row}`;
  }

  private countEmptyCells(grid: SudokuGrid): number {
    let count = 0;
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) count++;
      }
    }
    return count;
  }

  private calculateLogicalDepth(techniques: any[]): number {
    // Estimate logical depth based on technique complexity
    let maxDepth = 1;

    for (const technique of techniques) {
      const complexity = HintSystemService.TECHNIQUE_DIFFICULTY_MAP[technique.technique as keyof typeof HintSystemService.TECHNIQUE_DIFFICULTY_MAP];
      switch (complexity) {
        case 'basic':
          maxDepth = Math.max(maxDepth, 1);
          break;
        case 'intermediate':
          maxDepth = Math.max(maxDepth, 2);
          break;
        case 'advanced':
          maxDepth = Math.max(maxDepth, 3);
          break;
      }
    }

    return maxDepth;
  }

  private validateHintRequest(request: HintRequest): void {
    if (!request) {
      throw new MissingRequiredParameterError('request');
    }

    if (!request.grid) {
      throw new MissingRequiredParameterError('grid');
    }

    if (!request.difficulty) {
      throw new MissingRequiredParameterError('difficulty');
    }

    if (request.requestedLevel === undefined || request.requestedLevel === null) {
      throw new MissingRequiredParameterError('requestedLevel');
    }

    // Validate grid is 9x9
    if (!Array.isArray(request.grid) || request.grid.length !== 9) {
      throw new UnknownError('Grid must be a 9x9 array');
    }

    for (let i = 0; i < 9; i++) {
      if (!Array.isArray(request.grid[i]) || request.grid[i].length !== 9) {
        throw new UnknownError(`Grid row ${i} must be an array of 9 elements`);
      }
    }

    // Validate hint level
    const validLevels = Object.values(HintLevel);
    if (!validLevels.includes(request.requestedLevel)) {
      throw new InvalidHintLevelError(request.requestedLevel.toString());
    }
  }
}