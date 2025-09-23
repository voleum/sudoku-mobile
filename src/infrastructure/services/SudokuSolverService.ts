import {
  ISudokuSolver,
  SolverResult,
  SolverPerformanceMetrics,
  HintResult,
  TechniqueAnalysis,
  NextMoveResult
} from '../../domain/interfaces/ISudokuSolver';
import { SudokuGrid, CellPosition, CellValue } from '../../domain/types/GameTypes';
import { SudokuRules, MoveValidator } from '../../domain/rules/SudokuRules';
import { SUDOKU_RULES } from '../../shared/constants/GameConstants';

// Performance API compatibility for Node.js environments
declare const performance: { now(): number } | undefined;

export class SudokuSolverService implements ISudokuSolver {
  private static instance: SudokuSolverService;
  private uniquenessCache: Map<string, boolean> = new Map();

  public static getInstance(): SudokuSolverService {
    if (!SudokuSolverService.instance) {
      SudokuSolverService.instance = new SudokuSolverService();
    }
    return SudokuSolverService.instance;
  }

  solve(grid: SudokuGrid, timeoutMs: number = 30000): SolverResult {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const workingGrid = SudokuRules.copyGrid(grid);

    // Early validation check - if initial grid is invalid, return immediately
    if (!SudokuRules.isValidGrid(workingGrid)) {
      const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      return {
        solution: null,
        solvable: false,
        uniqueSolution: false,
        solutionsCount: 0,
        timedOut: false,
        performanceMetrics: {
          solvingTimeMs: endTime - startTime,
          constraintPropagationSteps: 0,
          backtrackingSteps: 0,
          nodesExplored: 0,
          maxDepthReached: 0
        }
      };
    }

    const metrics: SolverPerformanceMetrics = {
      solvingTimeMs: 0,
      constraintPropagationSteps: 0,
      backtrackingSteps: 0,
      nodesExplored: 0,
      maxDepthReached: 0
    };

    // Phase 1: Constraint Propagation
    const propagationResult = this.constraintPropagation(workingGrid, metrics);

    let solvable = false;
    let solution: SudokuGrid | null = null;

    if (propagationResult.isComplete) {
      // Puzzle solved through constraint propagation alone
      solvable = true;
      solution = workingGrid;
    } else if (propagationResult.isValid) {
      // Phase 2: Backtracking fallback with timeout
      const timeoutTime = startTime + timeoutMs;
      const backtrackResult = this.backtrackingSolver(workingGrid, metrics, 0, timeoutTime);
      solvable = backtrackResult;
      solution = solvable ? workingGrid : null;
    }

    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    metrics.solvingTimeMs = endTime - startTime;

    // Check if timed out
    const timedOut = metrics.solvingTimeMs >= timeoutMs;

    // Check solution uniqueness (skip if timed out)
    const uniqueSolution = solvable && !timedOut ? this.hasUniqueSolution(grid) : false;
    const solutionsCount = solvable && !timedOut ? (uniqueSolution ? 1 : this.countSolutions(grid, 2)) : 0;

    return {
      solution,
      solvable,
      uniqueSolution,
      solutionsCount,
      timedOut,
      performanceMetrics: metrics
    };
  }

  hasUniqueSolution(grid: SudokuGrid): boolean {
    // Check cache first
    const cacheKey = this.generateGridCacheKey(grid);
    if (this.uniquenessCache.has(cacheKey)) {
      return this.uniquenessCache.get(cacheKey)!;
    }

    // Calculate uniqueness
    const solutions = this.findAllSolutions(grid, 2);
    const isUnique = solutions.length === 1;

    // Cache the result
    this.uniquenessCache.set(cacheKey, isUnique);

    // Limit cache size to prevent memory leaks
    if (this.uniquenessCache.size > 1000) {
      const firstKey = this.uniquenessCache.keys().next().value;
      if (firstKey !== undefined) {
        this.uniquenessCache.delete(firstKey);
      }
    }

    return isUnique;
  }

  findAllSolutions(grid: SudokuGrid, maxSolutions: number = 10): SudokuGrid[] {
    const solutions: SudokuGrid[] = [];
    const workingGrid = SudokuRules.copyGrid(grid);

    this.findAllSolutionsRecursive(workingGrid, solutions, maxSolutions);

    return solutions;
  }

  isSolvable(grid: SudokuGrid): boolean {
    const result = this.solve(grid);
    return result.solvable;
  }

  private constraintPropagation(grid: SudokuGrid, metrics: SolverPerformanceMetrics): { isValid: boolean; isComplete: boolean } {
    let changed = true;
    let isValid = true;

    // Create possibility matrix
    const possibilities = this.initializePossibilities(grid);

    while (changed && isValid) {
      changed = false;
      metrics.constraintPropagationSteps++;

      // Naked Singles: cells with only one possible value
      for (let row = 0; row < SUDOKU_RULES.GRID_SIZE; row++) {
        for (let col = 0; col < SUDOKU_RULES.GRID_SIZE; col++) {
          if (grid[row][col] === SUDOKU_RULES.EMPTY_CELL && possibilities[row][col].size === 1) {
            const value = Array.from(possibilities[row][col])[0] as CellValue;
            grid[row][col] = value;
            this.updatePossibilities(possibilities, row, col, value);
            changed = true;
          }
        }
      }

      // Hidden Singles: values that can only go in one cell in a unit
      changed = this.findHiddenSingles(grid, possibilities) || changed;

      // Check for invalid states (cells with no possibilities)
      isValid = this.validatePossibilities(grid, possibilities);
    }

    const isComplete = this.isGridComplete(grid);
    return { isValid, isComplete };
  }

  private initializePossibilities(grid: SudokuGrid): Set<number>[][] {
    const possibilities: Set<number>[][] = [];

    for (let row = 0; row < SUDOKU_RULES.GRID_SIZE; row++) {
      possibilities[row] = [];
      for (let col = 0; col < SUDOKU_RULES.GRID_SIZE; col++) {
        if (grid[row][col] === SUDOKU_RULES.EMPTY_CELL) {
          possibilities[row][col] = new Set(SudokuRules.getPossibleValues(grid, row, col));
        } else {
          possibilities[row][col] = new Set();
        }
      }
    }

    return possibilities;
  }

  private updatePossibilities(possibilities: Set<number>[][], row: number, col: number, value: number): void {
    // Remove value from row
    for (let c = 0; c < SUDOKU_RULES.GRID_SIZE; c++) {
      possibilities[row][c].delete(value);
    }

    // Remove value from column
    for (let r = 0; r < SUDOKU_RULES.GRID_SIZE; r++) {
      possibilities[r][col].delete(value);
    }

    // Remove value from box
    const boxStartRow = Math.floor(row / SUDOKU_RULES.BOX_SIZE) * SUDOKU_RULES.BOX_SIZE;
    const boxStartCol = Math.floor(col / SUDOKU_RULES.BOX_SIZE) * SUDOKU_RULES.BOX_SIZE;

    for (let r = boxStartRow; r < boxStartRow + SUDOKU_RULES.BOX_SIZE; r++) {
      for (let c = boxStartCol; c < boxStartCol + SUDOKU_RULES.BOX_SIZE; c++) {
        possibilities[r][c].delete(value);
      }
    }

    // Clear possibilities for the filled cell
    possibilities[row][col].clear();
  }

  private findHiddenSingles(grid: SudokuGrid, possibilities: Set<number>[][]): boolean {
    let changed = false;

    // Check rows
    for (let row = 0; row < SUDOKU_RULES.GRID_SIZE; row++) {
      changed = this.checkUnitForHiddenSingles(grid, possibilities, this.getRowCells(row)) || changed;
    }

    // Check columns
    for (let col = 0; col < SUDOKU_RULES.GRID_SIZE; col++) {
      changed = this.checkUnitForHiddenSingles(grid, possibilities, this.getColumnCells(col)) || changed;
    }

    // Check boxes
    for (let box = 0; box < SUDOKU_RULES.GRID_SIZE; box++) {
      changed = this.checkUnitForHiddenSingles(grid, possibilities, this.getBoxCells(box)) || changed;
    }

    return changed;
  }

  private checkUnitForHiddenSingles(grid: SudokuGrid, possibilities: Set<number>[][], cells: CellPosition[]): boolean {
    let changed = false;

    for (let value = 1; value <= SUDOKU_RULES.GRID_SIZE; value++) {
      const possibleCells = cells.filter(({ row, col }) =>
        grid[row][col] === SUDOKU_RULES.EMPTY_CELL && possibilities[row][col].has(value)
      );

      if (possibleCells.length === 1) {
        const { row, col } = possibleCells[0];
        grid[row][col] = value as CellValue;
        this.updatePossibilities(possibilities, row, col, value);
        changed = true;
      }
    }

    return changed;
  }

  private validatePossibilities(grid: SudokuGrid, possibilities: Set<number>[][]): boolean {
    for (let row = 0; row < SUDOKU_RULES.GRID_SIZE; row++) {
      for (let col = 0; col < SUDOKU_RULES.GRID_SIZE; col++) {
        if (grid[row][col] === SUDOKU_RULES.EMPTY_CELL && possibilities[row][col].size === 0) {
          return false;
        }
      }
    }
    return true;
  }

  private backtrackingSolver(grid: SudokuGrid, metrics: SolverPerformanceMetrics, depth: number, timeoutTime?: number): boolean {
    metrics.maxDepthReached = Math.max(metrics.maxDepthReached, depth);
    metrics.nodesExplored++;

    // Check timeout if provided
    if (timeoutTime) {
      const currentTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      if (currentTime >= timeoutTime) {
        return false; // Timeout reached
      }
    }

    const emptyCell = this.findBestEmptyCell(grid);

    if (!emptyCell) {
      return true; // Puzzle solved
    }

    const { row, col } = emptyCell;
    const possibleValues = SudokuRules.getPossibleValues(grid, row, col);

    for (const value of possibleValues) {
      metrics.backtrackingSteps++;
      grid[row][col] = value;

      if (this.backtrackingSolver(grid, metrics, depth + 1, timeoutTime)) {
        return true;
      }

      grid[row][col] = SUDOKU_RULES.EMPTY_CELL;
    }

    return false;
  }

  private findBestEmptyCell(grid: SudokuGrid): CellPosition | null {
    let bestCell: CellPosition | null = null;
    let minPossibilities = SUDOKU_RULES.GRID_SIZE + 1;
    let maxDegree = -1; // For tie-breaking: choose cell that constrains most neighbors

    for (let row = 0; row < SUDOKU_RULES.GRID_SIZE; row++) {
      for (let col = 0; col < SUDOKU_RULES.GRID_SIZE; col++) {
        if (grid[row][col] === SUDOKU_RULES.EMPTY_CELL) {
          const possibilities = SudokuRules.getPossibleValues(grid, row, col).length;

          // Skip cells with no possibilities (invalid state)
          if (possibilities === 0) {
            continue;
          }

          // If we find a cell with only one possibility, return it immediately (naked single)
          if (possibilities === 1) {
            return MoveValidator.createCellPosition(row, col);
          }

          // MRV heuristic: prefer cells with fewer possibilities
          if (possibilities < minPossibilities) {
            minPossibilities = possibilities;
            bestCell = MoveValidator.createCellPosition(row, col);
            maxDegree = this.calculateCellDegree(grid, row, col);
          }
          // Tie-breaking with degree heuristic: prefer cells that constrain more neighbors
          else if (possibilities === minPossibilities && bestCell) {
            const degree = this.calculateCellDegree(grid, row, col);
            if (degree > maxDegree) {
              bestCell = MoveValidator.createCellPosition(row, col);
              maxDegree = degree;
            }
          }
        }
      }
    }

    return bestCell;
  }

  private findAllSolutionsRecursive(grid: SudokuGrid, solutions: SudokuGrid[], maxSolutions: number): void {
    if (solutions.length >= maxSolutions) {
      return;
    }

    const emptyCell = this.findBestEmptyCell(grid);

    if (!emptyCell) {
      solutions.push(SudokuRules.copyGrid(grid));
      return;
    }

    const { row, col } = emptyCell;
    const possibleValues = SudokuRules.getPossibleValues(grid, row, col);

    for (const value of possibleValues) {
      grid[row][col] = value;
      this.findAllSolutionsRecursive(grid, solutions, maxSolutions);
      grid[row][col] = SUDOKU_RULES.EMPTY_CELL;

      if (solutions.length >= maxSolutions) {
        break;
      }
    }
  }

  private countSolutions(grid: SudokuGrid, maxCount: number): number {
    const solutions = this.findAllSolutions(grid, maxCount);
    return solutions.length;
  }

  private isGridComplete(grid: SudokuGrid): boolean {
    for (let row = 0; row < SUDOKU_RULES.GRID_SIZE; row++) {
      for (let col = 0; col < SUDOKU_RULES.GRID_SIZE; col++) {
        if (grid[row][col] === SUDOKU_RULES.EMPTY_CELL) {
          return false;
        }
      }
    }
    return true;
  }

  private getRowCells(row: number): CellPosition[] {
    const cells: CellPosition[] = [];
    for (let col = 0; col < SUDOKU_RULES.GRID_SIZE; col++) {
      cells.push(MoveValidator.createCellPosition(row, col));
    }
    return cells;
  }

  private getColumnCells(col: number): CellPosition[] {
    const cells: CellPosition[] = [];
    for (let row = 0; row < SUDOKU_RULES.GRID_SIZE; row++) {
      cells.push(MoveValidator.createCellPosition(row, col));
    }
    return cells;
  }

  private getBoxCells(box: number): CellPosition[] {
    const cells: CellPosition[] = [];
    const startRow = Math.floor(box / SUDOKU_RULES.BOX_SIZE) * SUDOKU_RULES.BOX_SIZE;
    const startCol = (box % SUDOKU_RULES.BOX_SIZE) * SUDOKU_RULES.BOX_SIZE;

    for (let row = startRow; row < startRow + SUDOKU_RULES.BOX_SIZE; row++) {
      for (let col = startCol; col < startCol + SUDOKU_RULES.BOX_SIZE; col++) {
        cells.push(MoveValidator.createCellPosition(row, col));
      }
    }
    return cells;
  }

  getHint(grid: SudokuGrid): HintResult {
    // Try to find a hint using logical techniques first
    const nextMove = this.getNextMove(grid);

    if (nextMove) {
      return {
        hasHint: true,
        position: nextMove.position,
        value: nextMove.value,
        technique: nextMove.technique,
        explanation: nextMove.explanation,
        difficulty: this.getTechniqueDifficulty(nextMove.technique),
        confidence: nextMove.confidence
      };
    }

    // If no logical move found, provide a basic hint
    const emptyCell = this.findBestEmptyCell(grid);
    if (emptyCell) {
      const possibleValues = SudokuRules.getPossibleValues(grid, emptyCell.row, emptyCell.col);
      if (possibleValues.length > 0) {
        return {
          hasHint: true,
          position: emptyCell,
          technique: 'Possible values',
          explanation: `Cell at row ${emptyCell.row + 1}, column ${emptyCell.col + 1} can contain: ${possibleValues.join(', ')}`,
          difficulty: 'basic',
          confidence: 0.3 // Low confidence for basic possible values hint
        };
      }
    }

    return {
      hasHint: false,
      technique: 'No hint available',
      explanation: 'No obvious moves found. Try backtracking or check for errors.',
      difficulty: 'basic',
      confidence: 0.0 // No confidence when no hint available
    };
  }

  analyzeTechniques(grid: SudokuGrid): TechniqueAnalysis[] {
    const techniques: TechniqueAnalysis[] = [];

    // Analyze naked singles
    const nakedSingles = this.findNakedSingles(grid);
    techniques.push({
      technique: 'Naked Singles',
      applicable: nakedSingles.length > 0,
      positions: nakedSingles,
      explanation: nakedSingles.length > 0
        ? `Found ${nakedSingles.length} cells with only one possible value`
        : 'No cells with only one possible value found',
      difficulty: 'basic'
    });

    // Analyze hidden singles
    const hiddenSingles = this.findHiddenSinglesPositions(grid);
    techniques.push({
      technique: 'Hidden Singles',
      applicable: hiddenSingles.length > 0,
      positions: hiddenSingles,
      explanation: hiddenSingles.length > 0
        ? `Found ${hiddenSingles.length} cells where a number can only go in one place`
        : 'No hidden singles found',
      difficulty: 'basic'
    });

    // Could add more advanced techniques here (naked pairs, etc.)

    return techniques;
  }

  getNextMove(grid: SudokuGrid, excludeTechniques: string[] = []): NextMoveResult | null {
    // Try naked singles first (easiest technique)
    if (!excludeTechniques.includes('Naked Singles')) {
      const nakedSingle = this.findFirstNakedSingle(grid);
      if (nakedSingle) {
        return {
          position: nakedSingle.position,
          value: nakedSingle.value,
          technique: 'Naked Singles',
          confidence: 1.0,
          explanation: `Cell at row ${nakedSingle.position.row + 1}, column ${nakedSingle.position.col + 1} can only contain ${nakedSingle.value}`
        };
      }
    }

    // Try hidden singles
    if (!excludeTechniques.includes('Hidden Singles')) {
      const hiddenSingle = this.findFirstHiddenSingle(grid);
      if (hiddenSingle) {
        return {
          position: hiddenSingle.position,
          value: hiddenSingle.value,
          technique: 'Hidden Singles',
          confidence: 0.9,
          explanation: `In ${hiddenSingle.unit}, ${hiddenSingle.value} can only go in row ${hiddenSingle.position.row + 1}, column ${hiddenSingle.position.col + 1}`
        };
      }
    }

    return null;
  }

  private getTechniqueDifficulty(technique: string): 'basic' | 'intermediate' | 'advanced' {
    const basicTechniques = ['Naked Singles', 'Hidden Singles', 'Possible values'];
    const intermediateTechniques = ['Naked Pairs', 'Hidden Pairs', 'Pointing Pairs'];

    if (basicTechniques.includes(technique)) {
      return 'basic';
    } else if (intermediateTechniques.includes(technique)) {
      return 'intermediate';
    } else {
      return 'advanced';
    }
  }

  private findNakedSingles(grid: SudokuGrid): CellPosition[] {
    const positions: CellPosition[] = [];

    for (let row = 0; row < SUDOKU_RULES.GRID_SIZE; row++) {
      for (let col = 0; col < SUDOKU_RULES.GRID_SIZE; col++) {
        if (grid[row][col] === SUDOKU_RULES.EMPTY_CELL) {
          const possibleValues = SudokuRules.getPossibleValues(grid, row, col);
          if (possibleValues.length === 1) {
            positions.push(MoveValidator.createCellPosition(row, col));
          }
        }
      }
    }

    return positions;
  }

  private findFirstNakedSingle(grid: SudokuGrid): { position: CellPosition; value: number } | null {
    for (let row = 0; row < SUDOKU_RULES.GRID_SIZE; row++) {
      for (let col = 0; col < SUDOKU_RULES.GRID_SIZE; col++) {
        if (grid[row][col] === SUDOKU_RULES.EMPTY_CELL) {
          const possibleValues = SudokuRules.getPossibleValues(grid, row, col);
          if (possibleValues.length === 1) {
            return {
              position: MoveValidator.createCellPosition(row, col),
              value: possibleValues[0]
            };
          }
        }
      }
    }
    return null;
  }

  private findHiddenSinglesPositions(grid: SudokuGrid): CellPosition[] {
    const positions: CellPosition[] = [];

    // Check rows
    for (let row = 0; row < SUDOKU_RULES.GRID_SIZE; row++) {
      const hiddenSingles = this.findHiddenSinglesInUnit(grid, this.getRowCells(row));
      positions.push(...hiddenSingles);
    }

    // Check columns
    for (let col = 0; col < SUDOKU_RULES.GRID_SIZE; col++) {
      const hiddenSingles = this.findHiddenSinglesInUnit(grid, this.getColumnCells(col));
      positions.push(...hiddenSingles);
    }

    // Check boxes
    for (let box = 0; box < SUDOKU_RULES.GRID_SIZE; box++) {
      const hiddenSingles = this.findHiddenSinglesInUnit(grid, this.getBoxCells(box));
      positions.push(...hiddenSingles);
    }

    // Remove duplicates
    return positions.filter((pos, index, self) =>
      index === self.findIndex(p => p.row === pos.row && p.col === pos.col)
    );
  }

  private findFirstHiddenSingle(grid: SudokuGrid): { position: CellPosition; value: number; unit: string } | null {
    // Check rows
    for (let row = 0; row < SUDOKU_RULES.GRID_SIZE; row++) {
      const result = this.findFirstHiddenSingleInUnit(grid, this.getRowCells(row), `row ${row + 1}`);
      if (result) return result;
    }

    // Check columns
    for (let col = 0; col < SUDOKU_RULES.GRID_SIZE; col++) {
      const result = this.findFirstHiddenSingleInUnit(grid, this.getColumnCells(col), `column ${col + 1}`);
      if (result) return result;
    }

    // Check boxes
    for (let box = 0; box < SUDOKU_RULES.GRID_SIZE; box++) {
      const result = this.findFirstHiddenSingleInUnit(grid, this.getBoxCells(box), `box ${box + 1}`);
      if (result) return result;
    }

    return null;
  }

  private findHiddenSinglesInUnit(grid: SudokuGrid, cells: CellPosition[]): CellPosition[] {
    const positions: CellPosition[] = [];

    for (let value = 1; value <= SUDOKU_RULES.GRID_SIZE; value++) {
      const possibleCells = cells.filter(({ row, col }) =>
        grid[row][col] === SUDOKU_RULES.EMPTY_CELL &&
        SudokuRules.getPossibleValues(grid, row, col).includes(value as CellValue)
      );

      if (possibleCells.length === 1) {
        positions.push(possibleCells[0]);
      }
    }

    return positions;
  }

  private findFirstHiddenSingleInUnit(
    grid: SudokuGrid,
    cells: CellPosition[],
    unitName: string
  ): { position: CellPosition; value: number; unit: string } | null {
    for (let value = 1; value <= SUDOKU_RULES.GRID_SIZE; value++) {
      const possibleCells = cells.filter(({ row, col }) =>
        grid[row][col] === SUDOKU_RULES.EMPTY_CELL &&
        SudokuRules.getPossibleValues(grid, row, col).includes(value as CellValue)
      );

      if (possibleCells.length === 1) {
        return {
          position: possibleCells[0],
          value,
          unit: unitName
        };
      }
    }
    return null;
  }

  private calculateCellDegree(grid: SudokuGrid, row: number, col: number): number {
    // Calculate how many empty cells are in the same row, column, and box
    // This helps choose cells that will constrain more neighbors when filled
    let degree = 0;

    // Count empty cells in the same row
    for (let c = 0; c < SUDOKU_RULES.GRID_SIZE; c++) {
      if (c !== col && grid[row][c] === SUDOKU_RULES.EMPTY_CELL) {
        degree++;
      }
    }

    // Count empty cells in the same column
    for (let r = 0; r < SUDOKU_RULES.GRID_SIZE; r++) {
      if (r !== row && grid[r][col] === SUDOKU_RULES.EMPTY_CELL) {
        degree++;
      }
    }

    // Count empty cells in the same box
    const boxStartRow = Math.floor(row / SUDOKU_RULES.BOX_SIZE) * SUDOKU_RULES.BOX_SIZE;
    const boxStartCol = Math.floor(col / SUDOKU_RULES.BOX_SIZE) * SUDOKU_RULES.BOX_SIZE;

    for (let r = boxStartRow; r < boxStartRow + SUDOKU_RULES.BOX_SIZE; r++) {
      for (let c = boxStartCol; c < boxStartCol + SUDOKU_RULES.BOX_SIZE; c++) {
        if ((r !== row || c !== col) && grid[r][c] === SUDOKU_RULES.EMPTY_CELL) {
          degree++;
        }
      }
    }

    return degree;
  }

  private generateGridCacheKey(grid: SudokuGrid): string {
    // Create a string representation of the grid for caching
    return grid.map(row => row.join('')).join('');
  }
}