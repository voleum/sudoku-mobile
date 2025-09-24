// Базовый абстрактный класс для всех доменных исключений
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

// Ошибка неверного хода в игре
export class InvalidMoveError extends DomainError {
  readonly code = 'INVALID_MOVE';

  constructor(message: string = 'Invalid move attempted') {
    super(message);
  }
}

// Ошибка когда игра не найдена
export class GameNotFoundError extends DomainError {
  readonly code = 'GAME_NOT_FOUND';

  constructor(gameId: string) {
    super(`Game with id ${gameId} not found`);
  }
}

// Ошибка когда игра уже завершена
export class GameCompletedError extends DomainError {
  readonly code = 'GAME_COMPLETED';

  constructor(message: string = 'Cannot perform action on completed game') {
    super(message);
  }
}

// Ошибка превышения лимита подсказок
export class HintLimitExceededError extends DomainError {
  readonly code = 'HINT_LIMIT_EXCEEDED';

  constructor(message: string = 'Hint limit has been exceeded') {
    super(message);
  }
}

// Ошибка недопустимого уровня подсказки
export class InvalidHintLevelError extends DomainError {
  readonly code = 'INVALID_HINT_LEVEL';

  constructor(level: string) {
    super(`Invalid hint level: ${level}`);
  }
}

// Ошибка недопустимого уровня сложности
export class InvalidDifficultyError extends DomainError {
  readonly code = 'INVALID_DIFFICULTY';

  constructor(difficulty: string) {
    super(`Invalid difficulty level: ${difficulty}. Valid values: beginner, easy, medium, hard, expert`);
  }
}

// Ошибка недопустимого параметра seed
export class InvalidSeedError extends DomainError {
  readonly code = 'INVALID_SEED';

  constructor(message: string = 'Seed parameter must be a non-negative integer') {
    super(message);
  }
}

// Ошибка для неожиданных исключений
export class UnknownError extends DomainError {
  readonly code = 'UNKNOWN_ERROR';

  constructor(message: string = 'An unexpected error occurred') {
    super(message);
  }
}

// Ошибка отсутствия обязательного параметра
export class MissingRequiredParameterError extends DomainError {
  readonly code = 'MISSING_REQUIRED_PARAMETER';

  constructor(parameterName: string) {
    super(`Required parameter "${parameterName}" is missing`);
  }
}