import { GameEntity } from '../types/GameTypes';

export interface IGameRepository {
  save(game: GameEntity): Promise<void>;
  findById(id: string): Promise<GameEntity | null>;
  findAll(): Promise<GameEntity[]>;
  findByDifficulty(difficulty: string): Promise<GameEntity[]>;
  delete(id: string): Promise<void>;
  findInProgress(): Promise<GameEntity[]>;
}