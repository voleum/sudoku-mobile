import { MoveValidator } from '../src/domain/rules';
import { SudokuGrid, ErrorType, CellValue } from '../src/domain/types/GameTypes';

describe('MoveValidator', () => {
  let validGrid: SudokuGrid;
  let originalGrid: SudokuGrid;

  beforeEach(() => {
    // Create a valid grid with some filled cells
    validGrid = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];

    originalGrid = [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ];
  });

  describe('validateMove', () => {
    it('should allow placing a valid number in an empty cell', () => {
      const result = MoveValidator.validateMove(validGrid, originalGrid, 0, 2, 4);

      expect(result.isValid).toBe(true);
      expect(result.conflicts).toHaveLength(0);
      expect(result.errorType).toBeUndefined();
    });

    it('should reject placing a number that conflicts with row', () => {
      const result = MoveValidator.validateMove(validGrid, originalGrid, 0, 2, 5); // 5 already exists in row 0

      expect(result.isValid).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0]).toEqual({ row: 0, col: 0, box: 0 });
      expect(result.errorType).toBe(ErrorType.ROW_DUPLICATE);
    });

    it('should reject placing a number that conflicts with column', () => {
      const result = MoveValidator.validateMove(validGrid, originalGrid, 0, 2, 8); // 8 already exists in column 2

      expect(result.isValid).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0]).toEqual({ row: 2, col: 2, box: 0 });
      expect(result.errorType).toBe(ErrorType.COLUMN_DUPLICATE);
    });

    it('should reject placing a number that conflicts with box', () => {
      const result = MoveValidator.validateMove(validGrid, originalGrid, 0, 2, 6); // 6 already exists in box

      expect(result.isValid).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0]).toEqual({ row: 1, col: 0, box: 0 });
      expect(result.errorType).toBe(ErrorType.BOX_DUPLICATE);
    });

    it('should reject modifying a clue cell', () => {
      const result = MoveValidator.validateMove(validGrid, originalGrid, 0, 0, 1); // Try to modify cell with value 5

      expect(result.isValid).toBe(false);
      expect(result.errorType).toBe(ErrorType.MODIFY_CLUE);
      expect(result.errorMessage).toBe('Cannot modify a given clue');
    });

    it('should reject invalid number values', () => {
      const result = MoveValidator.validateMove(validGrid, originalGrid, 0, 2, 10 as CellValue); // Invalid number

      expect(result.isValid).toBe(false);
      expect(result.errorType).toBe(ErrorType.INVALID_NUMBER);
    });

    it('should allow clearing a cell', () => {
      const result = MoveValidator.validateMove(validGrid, originalGrid, 0, 2, 0);

      expect(result.isValid).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should detect multiple conflicts', () => {
      // Create a grid with conflicts
      const conflictGrid = [...validGrid];
      conflictGrid[0][2] = 5; // This will conflict with row and potentially other constraints

      const result = MoveValidator.validateMove(conflictGrid, originalGrid, 0, 3, 5);

      expect(result.isValid).toBe(false);
      expect(result.conflicts.length).toBeGreaterThan(0);
    });
  });

  describe('validateCompleteGrid', () => {
    it('should validate a correct grid', () => {
      const result = MoveValidator.validateCompleteGrid(validGrid);

      expect(result.isValid).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should detect conflicts in a grid', () => {
      const conflictGrid = [...validGrid];
      conflictGrid[0][2] = 5; // Create a row conflict

      const result = MoveValidator.validateCompleteGrid(conflictGrid);

      expect(result.isValid).toBe(false);
      expect(result.conflicts.length).toBeGreaterThan(0);
    });
  });

  describe('helper methods', () => {
    it('should correctly calculate box index', () => {
      expect(MoveValidator.getBoxIndex(0, 0)).toBe(0);
      expect(MoveValidator.getBoxIndex(1, 1)).toBe(0);
      expect(MoveValidator.getBoxIndex(2, 2)).toBe(0);
      expect(MoveValidator.getBoxIndex(0, 3)).toBe(1);
      expect(MoveValidator.getBoxIndex(3, 0)).toBe(3);
      expect(MoveValidator.getBoxIndex(4, 4)).toBe(4);
    });

    it('should return cells in same row', () => {
      const cells = MoveValidator.getCellsInSameRow(0);

      expect(cells).toHaveLength(9);
      expect(cells[0]).toEqual({ row: 0, col: 0, box: 0 });
      expect(cells[8]).toEqual({ row: 0, col: 8, box: 2 });
    });

    it('should return cells in same column', () => {
      const cells = MoveValidator.getCellsInSameColumn(0);

      expect(cells).toHaveLength(9);
      expect(cells[0]).toEqual({ row: 0, col: 0, box: 0 });
      expect(cells[8]).toEqual({ row: 8, col: 0, box: 6 });
    });

    it('should return cells in same box', () => {
      const cells = MoveValidator.getCellsInSameBox(1, 1);

      expect(cells).toHaveLength(9);
      expect(cells).toContainEqual({ row: 0, col: 0, box: 0 });
      expect(cells).toContainEqual({ row: 2, col: 2, box: 0 });
    });
  });

  describe('input validation', () => {
    it('should throw error for invalid row index', () => {
      expect(() => {
        MoveValidator.validateMove(validGrid, originalGrid, -1, 0, 5);
      }).toThrow('Invalid position: row=-1, col=0. Must be within 0-8');

      expect(() => {
        MoveValidator.validateMove(validGrid, originalGrid, 9, 0, 5);
      }).toThrow('Invalid position: row=9, col=0. Must be within 0-8');
    });

    it('should throw error for invalid column index', () => {
      expect(() => {
        MoveValidator.validateMove(validGrid, originalGrid, 0, -1, 5);
      }).toThrow('Invalid position: row=0, col=-1. Must be within 0-8');

      expect(() => {
        MoveValidator.validateMove(validGrid, originalGrid, 0, 9, 5);
      }).toThrow('Invalid position: row=0, col=9. Must be within 0-8');
    });

    it('should accept valid positions', () => {
      expect(() => {
        MoveValidator.validateMove(validGrid, originalGrid, 0, 0, 5);
      }).not.toThrow();

      expect(() => {
        MoveValidator.validateMove(validGrid, originalGrid, 8, 8, 5);
      }).not.toThrow();
    });
  });

  describe('validation modes', () => {
    it('should validate immediately in immediate mode', () => {
      const result = MoveValidator.validateMove(
        validGrid,
        originalGrid,
        0, 2, 5, // Invalid move
        { mode: 'immediate', allowErrors: true, strictMode: false }
      );

      expect(result.isValid).toBe(false);
      expect(result.conflicts.length).toBeGreaterThan(0);
    });

    it('should not validate incomplete grid in onComplete mode', () => {
      const result = MoveValidator.validateMove(
        validGrid,
        originalGrid,
        0, 2, 5, // Invalid move
        { mode: 'onComplete', allowErrors: true, strictMode: false }
      );

      // Should return valid because grid is not complete
      expect(result.isValid).toBe(true);
      expect(result.conflicts).toHaveLength(0);
    });

    it('should validate in manual mode', () => {
      const result = MoveValidator.validateMove(
        validGrid,
        originalGrid,
        0, 2, 5, // Invalid move
        { mode: 'manual', allowErrors: true, strictMode: false }
      );

      expect(result.isValid).toBe(false);
      expect(result.conflicts.length).toBeGreaterThan(0);
    });
  });

  describe('strict mode', () => {
    it('should block invalid moves in strict mode', () => {
      const result = MoveValidator.validateMove(
        validGrid,
        originalGrid,
        0, 2, 5,
        { mode: 'immediate', allowErrors: false, strictMode: true }
      );

      expect(result.isValid).toBe(false);
    });

    it('should allow errors in non-strict mode', () => {
      const result = MoveValidator.validateMove(
        validGrid,
        originalGrid,
        0, 2, 5,
        { mode: 'immediate', allowErrors: true, strictMode: false }
      );

      expect(result.isValid).toBe(false);
      expect(result.conflicts.length).toBeGreaterThan(0);
    });
  });
});