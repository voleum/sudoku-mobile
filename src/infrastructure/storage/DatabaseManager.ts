import SQLite from 'react-native-sqlite-storage';

/**
 * Database Manager for SQLite operations
 * Based on schema from 2.2.4-database-schema.md
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private db: SQLite.SQLiteDatabase | null = null;
  private readonly dbName = 'sudoku_game.db';
  private readonly dbVersion = '1.0';

  private constructor() {
    SQLite.DEBUG(false); // Set to true for development
    SQLite.enablePromise(true);
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize and open the database
   */
  public async initialize(): Promise<void> {
    try {
      if (this.db) {
        return; // Already initialized
      }

      this.db = await SQLite.openDatabase({
        name: this.dbName,
        location: 'default',
        createFromLocation: '~www/sudoku_game.db', // Optional: preloaded database
      });

      console.log('Database opened successfully');

      // Create tables if they don't exist
      await this.createTables();

      // Run migrations if needed
      await this.runMigrations();

    } catch (error) {
      console.error('Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get the database instance
   */
  public getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  /**
   * Close the database
   */
  public async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      console.log('Database closed');
    }
  }

  /**
   * Create all necessary tables
   */
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const tables = [
      this.getGamesTableSchema(),
      this.getGameMovesTableSchema(),
      this.getStatisticsTableSchema(),
      this.getAchievementsTableSchema(),
      this.getDailyStatsTableSchema(),
      this.getPuzzlesCacheTableSchema(),
      this.getMigrationsTableSchema(),
    ];

    const indexes = [
      this.getGamesIndexes(),
      this.getGameMovesIndexes(),
      this.getStatisticsIndexes(),
      this.getAchievementsIndexes(),
      this.getDailyStatsIndexes(),
      this.getPuzzlesCacheIndexes(),
      this.getMigrationsIndexes(),
    ];

    try {
      await this.db.transaction(async (tx) => {
        // Create tables
        for (const tableSQL of tables) {
          await tx.executeSql(tableSQL);
        }

        // Create indexes
        for (const indexQueries of indexes) {
          for (const indexSQL of indexQueries) {
            await tx.executeSql(indexSQL);
          }
        }
      });

      console.log('All tables and indexes created successfully');
    } catch (error) {
      console.error('Error creating tables:', error);
      throw error;
    }
  }

  /**
   * Run database migrations
   */
  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const [results] = await this.db.executeSql(
        'SELECT version FROM migrations WHERE applied = 1 ORDER BY applied_at DESC LIMIT 1'
      );

      let currentVersion = '1.0.0';
      if (results.rows.length > 0) {
        currentVersion = results.rows.item(0).version;
      }

      console.log(`Current database version: ${currentVersion}`);

      // Add migration logic here when needed
      // if (currentVersion < '1.1.0') {
      //   await this.migrateToV1_1_0();
      // }

    } catch (error) {
      console.log('Migrations table not found, this is a fresh installation');
      // Insert initial migration record
      await this.db.executeSql(
        `INSERT INTO migrations (version, name, applied, applied_at, description)
         VALUES (?, ?, 1, ?, ?)`,
        [this.dbVersion, 'initial_schema', Math.floor(Date.now() / 1000), 'Initial database schema']
      );
    }
  }

  // Table Schema Definitions (based on 2.2.4-database-schema.md)

  private getGamesTableSchema(): string {
    return `
      CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY,
        difficulty TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        original_grid TEXT NOT NULL,
        current_grid TEXT NOT NULL,
        solution_grid TEXT,
        notes_grid TEXT,
        created_at INTEGER NOT NULL,
        started_at INTEGER,
        completed_at INTEGER,
        last_played_at INTEGER NOT NULL,
        play_time_seconds INTEGER NOT NULL DEFAULT 0,
        pause_time_seconds INTEGER NOT NULL DEFAULT 0,
        total_moves INTEGER NOT NULL DEFAULT 0,
        hints_used INTEGER NOT NULL DEFAULT 0,
        errors_count INTEGER NOT NULL DEFAULT 0,
        game_version TEXT NOT NULL DEFAULT '1.0',
        device_id TEXT,
        sync_status TEXT DEFAULT 'local',
        metadata TEXT,
        CHECK (difficulty IN ('beginner', 'easy', 'medium', 'hard', 'expert')),
        CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
        CHECK (play_time_seconds >= 0),
        CHECK (hints_used >= 0),
        CHECK (errors_count >= 0),
        CHECK (total_moves >= 0)
      )
    `;
  }

  private getGameMovesTableSchema(): string {
    return `
      CREATE TABLE IF NOT EXISTS game_moves (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_id TEXT NOT NULL,
        move_number INTEGER NOT NULL,
        row INTEGER NOT NULL,
        col INTEGER NOT NULL,
        old_value INTEGER NOT NULL,
        new_value INTEGER NOT NULL,
        move_type TEXT NOT NULL,
        is_notes INTEGER NOT NULL DEFAULT 0,
        notes_added TEXT,
        notes_removed TEXT,
        timestamp INTEGER NOT NULL,
        game_time_seconds INTEGER NOT NULL,
        is_valid INTEGER NOT NULL DEFAULT 1,
        conflicts TEXT,
        device_info TEXT,
        FOREIGN KEY (game_id) REFERENCES games(id) ON DELETE CASCADE,
        CHECK (row >= 0 AND row <= 8),
        CHECK (col >= 0 AND col <= 8),
        CHECK (old_value >= 0 AND old_value <= 9),
        CHECK (new_value >= 0 AND new_value <= 9),
        CHECK (move_type IN ('user', 'hint', 'auto', 'undo')),
        CHECK (is_notes IN (0, 1)),
        CHECK (is_valid IN (0, 1))
      )
    `;
  }

  private getStatisticsTableSchema(): string {
    return `
      CREATE TABLE IF NOT EXISTS statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        difficulty TEXT NOT NULL,
        games_started INTEGER NOT NULL DEFAULT 0,
        games_completed INTEGER NOT NULL DEFAULT 0,
        games_abandoned INTEGER NOT NULL DEFAULT 0,
        total_play_time INTEGER NOT NULL DEFAULT 0,
        best_time INTEGER,
        average_time INTEGER,
        worst_time INTEGER,
        total_moves INTEGER NOT NULL DEFAULT 0,
        average_moves REAL,
        best_moves INTEGER,
        total_hints_used INTEGER NOT NULL DEFAULT 0,
        total_errors INTEGER NOT NULL DEFAULT 0,
        current_streak INTEGER NOT NULL DEFAULT 0,
        longest_streak INTEGER NOT NULL DEFAULT 0,
        current_loss_streak INTEGER NOT NULL DEFAULT 0,
        perfect_games INTEGER NOT NULL DEFAULT 0,
        hint_free_games INTEGER NOT NULL DEFAULT 0,
        speed_records INTEGER NOT NULL DEFAULT 0,
        first_game_at INTEGER,
        last_game_at INTEGER,
        last_updated_at INTEGER NOT NULL,
        version TEXT NOT NULL DEFAULT '1.0',
        CHECK (difficulty IN ('beginner', 'easy', 'medium', 'hard', 'expert')),
        CHECK (games_completed <= games_started),
        CHECK (current_streak >= 0),
        CHECK (longest_streak >= 0),
        UNIQUE(difficulty)
      )
    `;
  }

  private getAchievementsTableSchema(): string {
    return `
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        is_unlocked INTEGER NOT NULL DEFAULT 0,
        progress_current INTEGER NOT NULL DEFAULT 0,
        progress_target INTEGER NOT NULL,
        achievement_type TEXT NOT NULL,
        difficulty_specific TEXT,
        reward_type TEXT,
        reward_value TEXT,
        unlocked_at INTEGER,
        first_progress_at INTEGER,
        last_progress_at INTEGER,
        icon TEXT,
        rarity TEXT NOT NULL DEFAULT 'common',
        points INTEGER NOT NULL DEFAULT 0,
        hidden INTEGER NOT NULL DEFAULT 0,
        CHECK (is_unlocked IN (0, 1)),
        CHECK (progress_current >= 0),
        CHECK (progress_target > 0),
        CHECK (progress_current <= progress_target),
        CHECK (achievement_type IN ('single', 'progress', 'milestone')),
        CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
        CHECK (hidden IN (0, 1))
      )
    `;
  }

  private getDailyStatsTableSchema(): string {
    return `
      CREATE TABLE IF NOT EXISTS daily_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        games_played INTEGER NOT NULL DEFAULT 0,
        games_completed INTEGER NOT NULL DEFAULT 0,
        total_play_time INTEGER NOT NULL DEFAULT 0,
        total_moves INTEGER NOT NULL DEFAULT 0,
        hints_used INTEGER NOT NULL DEFAULT 0,
        errors_made INTEGER NOT NULL DEFAULT 0,
        best_time_easy INTEGER,
        best_time_medium INTEGER,
        best_time_hard INTEGER,
        best_time_expert INTEGER,
        achievements_unlocked INTEGER NOT NULL DEFAULT 0,
        perfect_games INTEGER NOT NULL DEFAULT 0,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        UNIQUE(date),
        CHECK (games_completed <= games_played),
        CHECK (perfect_games <= games_completed)
      )
    `;
  }

  private getPuzzlesCacheTableSchema(): string {
    return `
      CREATE TABLE IF NOT EXISTS puzzles_cache (
        id TEXT PRIMARY KEY,
        difficulty TEXT NOT NULL,
        puzzle_grid TEXT NOT NULL,
        solution_grid TEXT NOT NULL,
        filled_cells INTEGER NOT NULL,
        estimated_time INTEGER,
        complexity_score REAL,
        generator_algorithm TEXT NOT NULL,
        generator_seed TEXT,
        generator_version TEXT NOT NULL,
        used_count INTEGER NOT NULL DEFAULT 0,
        last_used_at INTEGER,
        generated_at INTEGER NOT NULL,
        expires_at INTEGER,
        CHECK (difficulty IN ('beginner', 'easy', 'medium', 'hard', 'expert')),
        CHECK (filled_cells >= 17 AND filled_cells <= 81),
        CHECK (used_count >= 0)
      )
    `;
  }

  private getMigrationsTableSchema(): string {
    return `
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        version TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        up_script TEXT NOT NULL,
        down_script TEXT,
        applied INTEGER NOT NULL DEFAULT 0,
        applied_at INTEGER,
        description TEXT,
        checksum TEXT,
        CHECK (applied IN (0, 1))
      )
    `;
  }

  // Index Creation Methods

  private getGamesIndexes(): string[] {
    return [
      'CREATE INDEX IF NOT EXISTS idx_games_difficulty ON games(difficulty)',
      'CREATE INDEX IF NOT EXISTS idx_games_status ON games(status)',
      'CREATE INDEX IF NOT EXISTS idx_games_created_at ON games(created_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_games_last_played ON games(last_played_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_games_completed ON games(completed_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_games_lookup ON games(status, difficulty, last_played_at DESC)',
    ];
  }

  private getGameMovesIndexes(): string[] {
    return [
      'CREATE INDEX IF NOT EXISTS idx_moves_game_id ON game_moves(game_id)',
      'CREATE INDEX IF NOT EXISTS idx_moves_game_move ON game_moves(game_id, move_number)',
      'CREATE INDEX IF NOT EXISTS idx_moves_timestamp ON game_moves(timestamp DESC)',
      'CREATE INDEX IF NOT EXISTS idx_moves_position ON game_moves(row, col)',
    ];
  }

  private getStatisticsIndexes(): string[] {
    return [
      'CREATE INDEX IF NOT EXISTS idx_stats_difficulty ON statistics(difficulty)',
      'CREATE INDEX IF NOT EXISTS idx_stats_last_game ON statistics(last_game_at DESC)',
    ];
  }

  private getAchievementsIndexes(): string[] {
    return [
      'CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category)',
      'CREATE INDEX IF NOT EXISTS idx_achievements_unlocked ON achievements(is_unlocked, unlocked_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_achievements_progress ON achievements(achievement_type, progress_current)',
      'CREATE INDEX IF NOT EXISTS idx_achievements_difficulty ON achievements(difficulty_specific)',
    ];
  }

  private getDailyStatsIndexes(): string[] {
    return [
      'CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC)',
      'CREATE INDEX IF NOT EXISTS idx_daily_stats_games ON daily_stats(games_played DESC)',
    ];
  }

  private getPuzzlesCacheIndexes(): string[] {
    return [
      'CREATE INDEX IF NOT EXISTS idx_puzzles_difficulty ON puzzles_cache(difficulty)',
      'CREATE INDEX IF NOT EXISTS idx_puzzles_unused ON puzzles_cache(difficulty, used_count, generated_at)',
      'CREATE INDEX IF NOT EXISTS idx_puzzles_expires ON puzzles_cache(expires_at)',
    ];
  }

  private getMigrationsIndexes(): string[] {
    return [
      'CREATE INDEX IF NOT EXISTS idx_migrations_version ON migrations(version)',
      'CREATE INDEX IF NOT EXISTS idx_migrations_applied ON migrations(applied, applied_at)',
    ];
  }

  /**
   * Execute a query with parameters
   */
  public async executeQuery(
    query: string,
    params: any[] = []
  ): Promise<[SQLite.ResultSet]> {
    if (!this.db) throw new Error('Database not initialized');
    return this.db.executeSql(query, params);
  }

  /**
   * Execute multiple queries in a transaction
   */
  public async executeTransaction(
    queries: Array<{ query: string; params?: any[] }>
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.transaction(async (tx) => {
      for (const { query, params = [] } of queries) {
        await tx.executeSql(query, params);
      }
    });
  }

  /**
   * Vacuum the database (cleanup and optimization)
   */
  public async vacuum(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.executeSql('VACUUM');
  }
}