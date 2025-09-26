import {
  AppSettings,
  DEFAULT_APP_SETTINGS,
  SettingsProfile,
  ThemeType,
  ColorScheme,
  CellSize,
  FontSize,
  NumberStyle,
  AnimationSpeed,
  Quality
} from '../types/SettingsTypes';

// Entity для настроек согласно системному анализу
export class Settings {
  private _data: AppSettings;
  private _profile: SettingsProfile | null;
  private _lastModified: Date;

  constructor(data?: Partial<AppSettings>, profile?: SettingsProfile) {
    this._data = { ...DEFAULT_APP_SETTINGS, ...data };
    this._profile = profile || null;
    this._lastModified = new Date();
  }

  // Геттеры для доступа к настройкам
  get gameplay() {
    return this._data.gameplay;
  }

  get ui() {
    return this._data.ui;
  }

  get audio() {
    return this._data.audio;
  }

  get advanced() {
    return this._data.advanced;
  }

  get profile() {
    return this._profile;
  }

  get lastModified() {
    return this._lastModified;
  }

  get data(): AppSettings {
    return { ...this._data };
  }

  // Обновление настроек с валидацией
  updateGameplay(updates: Partial<typeof this._data.gameplay>): void {
    this.validateGameplaySettings(updates);
    this._data.gameplay = { ...this._data.gameplay, ...updates };
    this._profile = null; // Сброс профиля при ручном изменении
    this._lastModified = new Date();
  }

  updateUI(updates: Partial<typeof this._data.ui>): void {
    this.validateUISettings(updates);
    this._data.ui = { ...this._data.ui, ...updates };
    this._profile = null;
    this._lastModified = new Date();
  }

  updateAudio(updates: Partial<typeof this._data.audio>): void {
    this.validateAudioSettings(updates);
    this._data.audio = { ...this._data.audio, ...updates };
    this._profile = null;
    this._lastModified = new Date();
  }

  updateAdvanced(updates: Partial<typeof this._data.advanced>): void {
    this.validateAdvancedSettings(updates);
    this._data.advanced = { ...this._data.advanced, ...updates };
    this._profile = null;
    this._lastModified = new Date();
  }

  // Применение профиля
  applyProfile(profileSettings: AppSettings, profile: SettingsProfile): void {
    this._data = { ...profileSettings };
    this._profile = profile;
    this._lastModified = new Date();
  }

  // Сброс к значениям по умолчанию
  reset(): void {
    this._data = { ...DEFAULT_APP_SETTINGS };
    this._profile = null;
    this._lastModified = new Date();
  }

  // Валидация настроек геймплея
  private validateGameplaySettings(updates: Partial<typeof this._data.gameplay>): void {
    if (updates.hintsLimit !== undefined) {
      if (updates.hintsLimit < 0 || updates.hintsLimit > 20) {
        throw new Error('hintsLimit должен быть между 0 и 20');
      }
    }

    if (updates.defaultDifficulty !== undefined) {
      const validDifficulties = ['beginner', 'easy', 'medium', 'hard', 'expert'];
      if (!validDifficulties.includes(updates.defaultDifficulty)) {
        throw new Error(`Неверный уровень сложности: ${updates.defaultDifficulty}`);
      }
    }
  }

  // Валидация настроек UI
  private validateUISettings(updates: Partial<typeof this._data.ui>): void {
    if (updates.theme !== undefined) {
      if (!Object.values(ThemeType).includes(updates.theme)) {
        throw new Error(`Неверная тема: ${updates.theme}`);
      }
    }

    if (updates.colorScheme !== undefined) {
      if (!Object.values(ColorScheme).includes(updates.colorScheme)) {
        throw new Error(`Неверная цветовая схема: ${updates.colorScheme}`);
      }
    }

    if (updates.cellSize !== undefined) {
      if (!Object.values(CellSize).includes(updates.cellSize)) {
        throw new Error(`Неверный размер ячеек: ${updates.cellSize}`);
      }
    }

    if (updates.fontSize !== undefined) {
      if (!Object.values(FontSize).includes(updates.fontSize)) {
        throw new Error(`Неверный размер шрифта: ${updates.fontSize}`);
      }
    }

    if (updates.numbersStyle !== undefined) {
      if (!Object.values(NumberStyle).includes(updates.numbersStyle)) {
        throw new Error(`Неверный стиль цифр: ${updates.numbersStyle}`);
      }
    }

    if (updates.animationSpeed !== undefined) {
      if (!Object.values(AnimationSpeed).includes(updates.animationSpeed)) {
        throw new Error(`Неверная скорость анимации: ${updates.animationSpeed}`);
      }
    }
  }

  // Валидация настроек аудио
  private validateAudioSettings(updates: Partial<typeof this._data.audio>): void {
    if (updates.soundVolume !== undefined) {
      if (updates.soundVolume < 0 || updates.soundVolume > 100) {
        throw new Error('soundVolume должен быть между 0 и 100');
      }
    }

    if (updates.reminderTime !== undefined) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(updates.reminderTime)) {
        throw new Error('reminderTime должен быть в формате HH:MM');
      }
    }
  }

  // Валидация продвинутых настроек
  private validateAdvancedSettings(updates: Partial<typeof this._data.advanced>): void {
    if (updates.animationQuality !== undefined) {
      if (!Object.values(Quality).includes(updates.animationQuality)) {
        throw new Error(`Неверное качество анимации: ${updates.animationQuality}`);
      }
    }

    if (updates.autoSaveInterval !== undefined) {
      if (updates.autoSaveInterval < 5 || updates.autoSaveInterval > 600) {
        throw new Error('autoSaveInterval должен быть между 5 и 600 секунд');
      }
    }
  }

  // Проверка на равенство с другими настройками
  equals(other: Settings): boolean {
    return JSON.stringify(this._data) === JSON.stringify(other._data);
  }

  // Клонирование настроек
  clone(): Settings {
    return new Settings(this._data, this._profile || undefined);
  }

  // Экспорт в JSON
  toJSON(): string {
    return JSON.stringify({
      data: this._data,
      profile: this._profile,
      lastModified: this._lastModified.toISOString(),
    }, null, 2);
  }

  // Импорт из JSON
  static fromJSON(json: string): Settings {
    try {
      const parsed = JSON.parse(json);
      const settings = new Settings(parsed.data, parsed.profile);
      if (parsed.lastModified) {
        settings._lastModified = new Date(parsed.lastModified);
      }
      return settings;
    } catch (error) {
      throw new Error(`Ошибка парсинга настроек: ${error}`);
    }
  }
}