import { IGameRepository } from '../../domain/interfaces/IGameRepository';
import { GameEntity } from '../../domain/types/GameTypes';

export class InMemoryGameRepository implements IGameRepository {
  private games: Map<string, GameEntity> = new Map();

  async save(game: GameEntity): Promise<void> {
    this.games.set(game.id, { ...game });
  }

  async findById(id: string): Promise<GameEntity | null> {
    const game = this.games.get(id);
    return game ? { ...game } : null;
  }

  async findAll(): Promise<GameEntity[]> {
    return Array.from(this.games.values()).map(game => ({ ...game }));
  }

  async findByDifficulty(difficulty: string): Promise<GameEntity[]> {
    return Array.from(this.games.values())
      .filter(game => game.difficulty === difficulty)
      .map(game => ({ ...game }));
  }

  async delete(id: string): Promise<void> {
    this.games.delete(id);
  }

  async findInProgress(): Promise<GameEntity[]> {
    return Array.from(this.games.values())
      .filter(game => !game.isCompleted)
      .map(game => ({ ...game }));
  }
}