import { HintSystemService } from '../src/infrastructure/services/HintSystemService';
import { ISudokuSolver } from '../src/domain/interfaces/ISudokuSolver';
import {
  HintLevel,
  HintRequest,
  SudokuGrid,
  PlayerProfile,
  GameHintUsage
} from '../src/domain/types/GameTypes';

describe('HintSystemService', () => {
  let hintSystemService: HintSystemService;
  let mockSolverService: jest.Mocked<ISudokuSolver>;
  let validGrid: SudokuGrid;

  // Helper function to create GameHintUsage with ratingPenalty
  const createHintUsage = (level: HintLevel, technique: string = 'Test', wasHelpful: boolean = true): GameHintUsage => ({
    level,
    technique,
    timestamp: new Date(),
    wasHelpful,
    ratingPenalty: hintSystemService ? hintSystemService.calculateRatingPenalty(level) : 0
  });

  beforeEach(() => {
    // Create mock solver service
    mockSolverService = {
      getHint: jest.fn(),
      analyzeTechniques: jest.fn(),
      solve: jest.fn(),
      hasUniqueSolution: jest.fn(),
      findAllSolutions: jest.fn(),
      isSolvable: jest.fn(),
      getNextMove: jest.fn()
    } as jest.Mocked<ISudokuSolver>;

    hintSystemService = new HintSystemService(mockSolverService);

    // Create a valid test grid
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
  });

  describe('getHint', () => {
    it('should provide general direction hint for level 1', async () => {
      const request: HintRequest = {
        grid: validGrid,
        difficulty: 'easy',
        requestedLevel: HintLevel.GENERAL_DIRECTION
      };

      mockSolverService.analyzeTechniques.mockReturnValue([
        { technique: 'Naked Singles', applicable: true, positions: [], explanation: '', difficulty: 'basic' }
      ]);

      const result = await hintSystemService.getHint(request);

      expect(result.level).toBe(HintLevel.GENERAL_DIRECTION);
      expect(result.message).toContain('блок');
      expect(result.colorHighlights).toHaveLength(1);
      expect(result.colorHighlights[0].color).toBe('yellow');
    });

    it('should provide specific technique hint for level 2', async () => {
      const request: HintRequest = {
        grid: validGrid,
        difficulty: 'medium',
        requestedLevel: HintLevel.SPECIFIC_TECHNIQUE
      };

      mockSolverService.getHint.mockReturnValue({
        hasHint: true,
        position: { row: 0, col: 2, box: 0 },
        value: 4,
        technique: 'Naked Singles',
        explanation: 'Only one number fits',
        difficulty: 'basic',
        confidence: 0.9
      });

      mockSolverService.analyzeTechniques.mockReturnValue([
        { technique: 'Naked Singles', applicable: true, positions: [], explanation: '', difficulty: 'basic' }
      ]);

      const result = await hintSystemService.getHint(request);

      expect(result.level).toBe(HintLevel.SPECIFIC_TECHNIQUE);
      expect(result.technique).toBe('Naked Singles');
      expect(result.message).toContain('Naked Singles');
      expect(result.explanation).toBeDefined();
      expect(result.targetCells).toHaveLength(1);
      expect(result.colorHighlights).toHaveLength(2); // target + related
    });

    it('should provide exact location hint for level 3', async () => {
      const request: HintRequest = {
        grid: validGrid,
        difficulty: 'hard',
        requestedLevel: HintLevel.EXACT_LOCATION
      };

      mockSolverService.getHint.mockReturnValue({
        hasHint: true,
        position: { row: 1, col: 1, box: 0 },
        value: 7,
        technique: 'Hidden Singles',
        explanation: 'Only position for this number',
        difficulty: 'basic',
        confidence: 0.8
      });

      mockSolverService.analyzeTechniques.mockReturnValue([
        { technique: 'Hidden Singles', applicable: true, positions: [], explanation: '', difficulty: 'basic' }
      ]);

      const result = await hintSystemService.getHint(request);

      expect(result.level).toBe(HintLevel.EXACT_LOCATION);
      expect(result.targetCells).toHaveLength(1);
      expect(result.targetCells[0]).toEqual({ row: 1, col: 1, box: 0 });
      expect(result.message).toContain('B2');
      expect(result.relatedCells.length).toBeGreaterThan(0);
    });

    it('should provide direct solution hint for level 4', async () => {
      const request: HintRequest = {
        grid: validGrid,
        difficulty: 'expert',
        requestedLevel: HintLevel.DIRECT_SOLUTION
      };

      mockSolverService.getHint.mockReturnValue({
        hasHint: true,
        position: { row: 2, col: 0, box: 0 },
        value: 1,
        technique: 'Naked Singles',
        explanation: 'Direct placement',
        difficulty: 'basic',
        confidence: 1.0
      });

      mockSolverService.analyzeTechniques.mockReturnValue([
        { technique: 'Naked Singles', applicable: true, positions: [], explanation: '', difficulty: 'basic' }
      ]);

      const result = await hintSystemService.getHint(request);

      expect(result.level).toBe(HintLevel.DIRECT_SOLUTION);
      expect(result.suggestedValue).toBe(1);
      expect(result.message).toContain('Поставьте цифру 1');
      expect(result.confidence).toBe(1.0);
      expect(result.colorHighlights[0].color).toBe('green');
    });

    it('should handle case when no hint is available', async () => {
      const request: HintRequest = {
        grid: validGrid,
        difficulty: 'easy',
        requestedLevel: HintLevel.SPECIFIC_TECHNIQUE
      };

      mockSolverService.getHint.mockReturnValue({
        hasHint: false,
        technique: '',
        explanation: '',
        difficulty: 'basic',
        confidence: 0
      });

      mockSolverService.analyzeTechniques.mockReturnValue([]);

      const result = await hintSystemService.getHint(request);

      expect(result.confidence).toBe(0.0);
      expect(result.message).toContain('нет доступных подсказок');
    });
  });

  describe('getAvailableTechniques', () => {
    it('should return applicable techniques', async () => {
      mockSolverService.analyzeTechniques.mockReturnValue([
        { technique: 'Naked Singles', applicable: true, positions: [], explanation: '', difficulty: 'basic' },
        { technique: 'Hidden Singles', applicable: false, positions: [], explanation: '', difficulty: 'basic' },
        { technique: 'Naked Pairs', applicable: true, positions: [], explanation: '', difficulty: 'intermediate' }
      ]);

      const techniques = await hintSystemService.getAvailableTechniques(validGrid);

      expect(techniques).toEqual(['Naked Singles', 'Naked Pairs']);
    });
  });

  describe('updatePlayerProfile', () => {
    it('should update player profile based on hint usage', () => {
      const profile: PlayerProfile = {
        preferredTechniques: [],
        problemAreas: [],
        learningSpeed: 'medium',
        patienceLevel: 'medium',
        visualPreference: true
      };

      const hintUsage: GameHintUsage[] = [
        createHintUsage(HintLevel.SPECIFIC_TECHNIQUE, 'Naked Singles', true),
        createHintUsage(HintLevel.SPECIFIC_TECHNIQUE, 'Naked Singles', true),
        createHintUsage(HintLevel.EXACT_LOCATION, 'Hidden Singles', false)
      ];

      const updatedProfile = hintSystemService.updatePlayerProfile(profile, hintUsage);

      expect(updatedProfile.preferredTechniques[0]).toBe('Naked Singles');
      expect(updatedProfile.preferredTechniques[1]).toBe('Hidden Singles');
      expect(updatedProfile.learningSpeed).toBeDefined();
    });

    it('should adjust learning speed based on hint frequency', () => {
      const profile: PlayerProfile = {
        preferredTechniques: [],
        problemAreas: [],
        learningSpeed: 'medium',
        patienceLevel: 'medium',
        visualPreference: true
      };

      // Create many recent hints to simulate slow learner
      const manyHints: GameHintUsage[] = Array.from({ length: 25 }, (_, i) => ({
        level: HintLevel.GENERAL_DIRECTION,
        technique: 'General',
        timestamp: new Date(Date.now() - i * 60000), // Recent hints
        wasHelpful: true,
        ratingPenalty: 5
      }));

      const updatedProfile = hintSystemService.updatePlayerProfile(profile, manyHints);

      expect(updatedProfile.learningSpeed).toBe('slow');
      expect(updatedProfile.patienceLevel).toBe('low');
    });
  });

  describe('isHintAllowed', () => {
    it('should allow non-direct solution hints for beginner', () => {
      const currentUsage: GameHintUsage[] = [];

      const allowed = hintSystemService.isHintAllowed(HintLevel.GENERAL_DIRECTION, currentUsage, 'beginner');

      expect(allowed).toBe(true);
    });

    it('should limit direct solution hints to 3 per game', () => {
      const currentUsage: GameHintUsage[] = [
        createHintUsage(HintLevel.DIRECT_SOLUTION),
        createHintUsage(HintLevel.DIRECT_SOLUTION),
        createHintUsage(HintLevel.DIRECT_SOLUTION)
      ];

      const allowed = hintSystemService.isHintAllowed(HintLevel.DIRECT_SOLUTION, currentUsage, 'beginner');

      expect(allowed).toBe(false);
    });

    it('should allow direct solution hints under the limit', () => {
      const currentUsage: GameHintUsage[] = [
        createHintUsage(HintLevel.DIRECT_SOLUTION),
        createHintUsage(HintLevel.DIRECT_SOLUTION)
      ];

      const allowed = hintSystemService.isHintAllowed(HintLevel.DIRECT_SOLUTION, currentUsage, 'beginner');

      expect(allowed).toBe(true);
    });

    it('should enforce progressive difficulty in medium level', () => {
      const currentUsage: GameHintUsage[] = [
        createHintUsage(HintLevel.GENERAL_DIRECTION, 'Test', true),
        createHintUsage(HintLevel.SPECIFIC_TECHNIQUE, 'Test', true),
        createHintUsage(HintLevel.GENERAL_DIRECTION, 'Test', true),
        createHintUsage(HintLevel.SPECIFIC_TECHNIQUE, 'Test', true),
        createHintUsage(HintLevel.GENERAL_DIRECTION, 'Test', true)
      ];

      // Should not allow 6th level 1-2 hint (max 5)
      const allowed1 = hintSystemService.isHintAllowed(HintLevel.GENERAL_DIRECTION, currentUsage, 'medium');
      expect(allowed1).toBe(false);

      // Should allow level 3 hint (max 2)
      const allowed2 = hintSystemService.isHintAllowed(HintLevel.EXACT_LOCATION, currentUsage, 'medium');
      expect(allowed2).toBe(true);
    });

    // Hybrid system compliance tests (Business Analysis + Technical Specification)
    it('should allow unlimited level 1-2 hints for beginner (Business Analysis)', () => {
      const currentUsage: GameHintUsage[] = Array.from({ length: 10 }, () =>
        createHintUsage(HintLevel.GENERAL_DIRECTION)
      );

      const allowed = hintSystemService.isHintAllowed(HintLevel.SPECIFIC_TECHNIQUE, currentUsage, 'beginner');
      expect(allowed).toBe(true);
    });

    it('should limit easy difficulty to 10 hints total (Technical Specification)', () => {
      const currentUsage: GameHintUsage[] = Array.from({ length: 10 }, () =>
        createHintUsage(HintLevel.GENERAL_DIRECTION)
      );

      const allowed = hintSystemService.isHintAllowed(HintLevel.GENERAL_DIRECTION, currentUsage, 'easy');
      expect(allowed).toBe(false);
    });

    it('should limit medium difficulty to 7 hints total (Technical Specification)', () => {
      const currentUsage: GameHintUsage[] = Array.from({ length: 7 }, () =>
        createHintUsage(HintLevel.GENERAL_DIRECTION, 'Test', true)
      );

      const allowed = hintSystemService.isHintAllowed(HintLevel.GENERAL_DIRECTION, currentUsage, 'medium');
      expect(allowed).toBe(false);
    });

    it('should limit hard difficulty to 5 hints total (Technical Specification)', () => {
      const currentUsage: GameHintUsage[] = Array.from({ length: 5 }, () =>
        createHintUsage(HintLevel.GENERAL_DIRECTION, 'Test', true)
      );

      const allowed = hintSystemService.isHintAllowed(HintLevel.GENERAL_DIRECTION, currentUsage, 'hard');
      expect(allowed).toBe(false);
    });

    it('should limit expert difficulty to 3 hints total (Technical Specification)', () => {
      const currentUsage: GameHintUsage[] = Array.from({ length: 3 }, () =>
        createHintUsage(HintLevel.GENERAL_DIRECTION, 'Test', true)
      );

      const allowed = hintSystemService.isHintAllowed(HintLevel.GENERAL_DIRECTION, currentUsage, 'expert');
      expect(allowed).toBe(false);
    });

    it('should restrict expert to level 1 hints only (Business Analysis logic)', () => {
      const currentUsage: GameHintUsage[] = [];

      // Should allow level 1 hint
      const allowed1 = hintSystemService.isHintAllowed(HintLevel.GENERAL_DIRECTION, currentUsage, 'expert');
      expect(allowed1).toBe(true);

      // Should not allow level 2+ hints
      const allowed2 = hintSystemService.isHintAllowed(HintLevel.SPECIFIC_TECHNIQUE, currentUsage, 'expert');
      expect(allowed2).toBe(false);
    });

    it('should not allow direct solutions for hard difficulty (Business Analysis logic)', () => {
      const currentUsage: GameHintUsage[] = [];

      const allowed = hintSystemService.isHintAllowed(HintLevel.DIRECT_SOLUTION, currentUsage, 'hard');
      expect(allowed).toBe(false);
    });
  });

  describe('calculateComplexity', () => {
    it('should calculate complexity based on empty cells and techniques', () => {
      mockSolverService.analyzeTechniques.mockReturnValue([
        { technique: 'Naked Singles', applicable: true, positions: [], explanation: '', difficulty: 'basic' },
        { technique: 'X-Wing', applicable: true, positions: [], explanation: '', difficulty: 'advanced' }
      ]);

      const complexity = hintSystemService.calculateComplexity(validGrid);

      expect(complexity).toBeGreaterThan(0);
      expect(typeof complexity).toBe('number');
    });

    it('should return higher complexity for grids with more empty cells', () => {
      const almostEmptyGrid: SudokuGrid = Array(9).fill(null).map(() => Array(9).fill(0));
      almostEmptyGrid[0][0] = 5;

      mockSolverService.analyzeTechniques.mockReturnValue([]);

      const complexity = hintSystemService.calculateComplexity(almostEmptyGrid);

      expect(complexity).toBeGreaterThan(50); // 80 empty cells * 1.0 base weight
    });
  });

  describe('calculateRatingPenalty', () => {
    it('should return correct penalties according to Business Analysis', () => {
      // Business Analysis: строки 644-648
      expect(hintSystemService.calculateRatingPenalty(HintLevel.GENERAL_DIRECTION)).toBe(5);
      expect(hintSystemService.calculateRatingPenalty(HintLevel.SPECIFIC_TECHNIQUE)).toBe(10);
      expect(hintSystemService.calculateRatingPenalty(HintLevel.EXACT_LOCATION)).toBe(20);
      expect(hintSystemService.calculateRatingPenalty(HintLevel.DIRECT_SOLUTION)).toBe(50);
    });

    it('should include ratingPenalty in hint responses', async () => {
      const request: HintRequest = {
        grid: validGrid,
        difficulty: 'medium',
        requestedLevel: HintLevel.SPECIFIC_TECHNIQUE
      };

      mockSolverService.getHint.mockReturnValue({
        hasHint: true,
        position: { row: 0, col: 2, box: 0 },
        value: 4,
        technique: 'Naked Singles',
        explanation: 'Only one number fits',
        difficulty: 'basic',
        confidence: 0.9
      });

      mockSolverService.analyzeTechniques.mockReturnValue([
        { technique: 'Naked Singles', applicable: true, positions: [], explanation: '', difficulty: 'basic' }
      ]);

      const result = await hintSystemService.getHint(request);

      expect(result.ratingPenalty).toBe(10); // Specific Technique = -10%
    });
  });
});