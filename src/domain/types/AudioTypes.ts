/**
 * Audio Types
 * Типы для системы звуковых эффектов приложения
 * Согласно бизнес-анализу (раздел 1.4.5 - Звук и уведомления)
 */

import type { AudioSettings } from './SettingsTypes';

/**
 * Типы звуковых эффектов в игре
 */
export enum SoundType {
  // Игровые действия
  CELL_PLACEMENT = 'cell_placement', // Размещение цифры в ячейке
  CELL_ERASE = 'cell_erase', // Удаление цифры из ячейки
  NOTE_TOGGLE = 'note_toggle', // Переключение режима заметок

  // Обратная связь
  ERROR = 'error', // Ошибочный ход
  SUCCESS = 'success', // Правильное действие
  HINT = 'hint', // Использование подсказки

  // Завершение игры
  PUZZLE_COMPLETE = 'puzzle_complete', // Успешное завершение головоломки
  NEW_RECORD = 'new_record', // Новый рекорд

  // Достижения
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked', // Разблокировка достижения

  // UI взаимодействия
  BUTTON_TAP = 'button_tap', // Нажатие кнопки
  MENU_OPEN = 'menu_open', // Открытие меню
  MENU_CLOSE = 'menu_close', // Закрытие меню
}

/**
 * ПРИМЕЧАНИЕ: AudioSettings определен в SettingsTypes.ts
 * Здесь экспортируем только VibrationIntensity, который используется в AudioSettings
 */

/**
 * Интенсивность вибрации
 * Согласно бизнес-анализу (раздел 1.3 - Тактильная обратная связь)
 */
export enum VibrationIntensity {
  OFF = 'off', // Выключена
  LIGHT = 'light', // Слабая
  MEDIUM = 'medium', // Средняя
  STRONG = 'strong', // Сильная
}

/**
 * Результат воспроизведения звука
 */
export interface PlaySoundResult {
  success: boolean;
  soundType: SoundType;
  error?: string;
}

/**
 * Конфигурация звукового эффекта
 */
export interface SoundConfig {
  type: SoundType;
  fileName: string; // Имя файла в assets
  volume?: number; // Громкость конкретного звука (0-1)
  vibrate?: boolean; // Вибрация при воспроизведении
  vibrationPattern?: number[]; // Паттерн вибрации [delay, duration, ...]
}

/**
 * Интерфейс аудио сервиса
 * Clean Architecture: определяем контракт в domain layer
 */
export interface IAudioService {
  /**
   * Инициализация аудио системы
   */
  initialize(): Promise<void>;

  /**
   * Воспроизведение звукового эффекта
   * @param soundType - тип звука
   * @param overrideVolume - переопределить громкость (опционально)
   */
  playSound(soundType: SoundType, overrideVolume?: number): Promise<PlaySoundResult>;

  /**
   * Остановка всех звуков
   */
  stopAllSounds(): void;

  /**
   * Получение текущих настроек аудио
   */
  getSettings(): AudioSettings;

  /**
   * Обновление настроек аудио
   * @param settings - частичные настройки для обновления
   */
  updateSettings(settings: Partial<AudioSettings>): void;

  /**
   * Проверка, включены ли звуки
   */
  isSoundEnabled(): boolean;

  /**
   * Установка глобальной громкости
   * @param volume - громкость (0-100)
   */
  setVolume(volume: number): void;

  /**
   * Вибрация устройства
   * @param pattern - паттерн вибрации
   */
  vibrate(pattern?: number[]): void;

  /**
   * Очистка ресурсов
   */
  cleanup(): Promise<void>;
}

/**
 * ПРИМЕЧАНИЕ: DEFAULT_AUDIO_SETTINGS определен в SettingsTypes.ts
 */

/**
 * Стандартные паттерны вибрации (миллисекунды)
 */
export const VIBRATION_PATTERNS: Record<string, number[]> = {
  [VibrationIntensity.LIGHT]: [0, 10],
  [VibrationIntensity.MEDIUM]: [0, 25],
  [VibrationIntensity.STRONG]: [0, 50],
  ERROR: [0, 50, 100, 50], // Двойная вибрация для ошибки
  SUCCESS: [0, 30, 50, 30, 50, 30], // Тройная вибрация для успеха
  ACHIEVEMENT: [0, 100, 100, 100, 100, 100], // Длинная вибрация для достижения
};

/**
 * Карта звуковых файлов
 * Определяет соответствие между типом звука и файлом
 */
export const SOUND_FILES: Record<SoundType, SoundConfig> = {
  [SoundType.CELL_PLACEMENT]: {
    type: SoundType.CELL_PLACEMENT,
    fileName: 'cell_placement.mp3',
    volume: 0.6,
    vibrate: true,
    vibrationPattern: VIBRATION_PATTERNS[VibrationIntensity.LIGHT],
  },
  [SoundType.CELL_ERASE]: {
    type: SoundType.CELL_ERASE,
    fileName: 'cell_erase.mp3',
    volume: 0.5,
  },
  [SoundType.NOTE_TOGGLE]: {
    type: SoundType.NOTE_TOGGLE,
    fileName: 'note_toggle.mp3',
    volume: 0.4,
  },
  [SoundType.ERROR]: {
    type: SoundType.ERROR,
    fileName: 'error.mp3',
    volume: 0.8,
    vibrate: true,
    vibrationPattern: VIBRATION_PATTERNS.ERROR,
  },
  [SoundType.SUCCESS]: {
    type: SoundType.SUCCESS,
    fileName: 'success.mp3',
    volume: 0.7,
    vibrate: true,
    vibrationPattern: VIBRATION_PATTERNS[VibrationIntensity.LIGHT],
  },
  [SoundType.HINT]: {
    type: SoundType.HINT,
    fileName: 'hint.mp3',
    volume: 0.6,
  },
  [SoundType.PUZZLE_COMPLETE]: {
    type: SoundType.PUZZLE_COMPLETE,
    fileName: 'puzzle_complete.mp3',
    volume: 0.9,
    vibrate: true,
    vibrationPattern: VIBRATION_PATTERNS.SUCCESS,
  },
  [SoundType.NEW_RECORD]: {
    type: SoundType.NEW_RECORD,
    fileName: 'new_record.mp3',
    volume: 1.0,
    vibrate: true,
    vibrationPattern: VIBRATION_PATTERNS.SUCCESS,
  },
  [SoundType.ACHIEVEMENT_UNLOCKED]: {
    type: SoundType.ACHIEVEMENT_UNLOCKED,
    fileName: 'achievement.mp3',
    volume: 0.8,
    vibrate: true,
    vibrationPattern: VIBRATION_PATTERNS.ACHIEVEMENT,
  },
  [SoundType.BUTTON_TAP]: {
    type: SoundType.BUTTON_TAP,
    fileName: 'button_tap.mp3',
    volume: 0.3,
  },
  [SoundType.MENU_OPEN]: {
    type: SoundType.MENU_OPEN,
    fileName: 'menu_open.mp3',
    volume: 0.4,
  },
  [SoundType.MENU_CLOSE]: {
    type: SoundType.MENU_CLOSE,
    fileName: 'menu_close.mp3',
    volume: 0.4,
  },
};
