/**
 * Audio Service
 * Сервис для работы со звуковыми эффектами
 * Согласно бизнес-анализу (раздел 1.4.5)
 * Clean Architecture: реализация интерфейса IAudioService из domain layer
 */

import Sound from 'react-native-sound';
import { Vibration, Platform } from 'react-native';
import {
  IAudioService,
  SoundType,
  PlaySoundResult,
  SOUND_FILES,
  VIBRATION_PATTERNS,
  VibrationIntensity,
} from '../../domain/types/AudioTypes';
import { AudioSettings, DEFAULT_AUDIO_SETTINGS } from '../../domain/types/SettingsTypes';

/**
 * Реализация аудио сервиса с использованием react-native-sound
 */
export class AudioService implements IAudioService {
  private settings: AudioSettings;
  private soundInstances: Map<SoundType, Sound>;
  private initialized: boolean;

  constructor() {
    this.settings = { ...DEFAULT_AUDIO_SETTINGS };
    this.soundInstances = new Map();
    this.initialized = false;

    // Установка категории звука для iOS
    Sound.setCategory('Playback', false);
  }

  /**
   * Инициализация аудио системы
   * Предзагрузка всех звуковых эффектов
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      // Предзагрузка всех звуков
      const loadPromises = Object.values(SOUND_FILES).map((config) =>
        this.loadSound(config.type, config.fileName),
      );

      await Promise.all(loadPromises);

      this.initialized = true;
      console.log('[AudioService] Initialized successfully');
    } catch (error) {
      console.error('[AudioService] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Загрузка одного звукового файла
   */
  private loadSound(soundType: SoundType, fileName: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Путь к звуковому файлу в бандле
      const sound = new Sound(fileName, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.error(`[AudioService] Failed to load sound: ${fileName}`, error);
          reject(error);
          return;
        }

        this.soundInstances.set(soundType, sound);
        resolve();
      });
    });
  }

  /**
   * Воспроизведение звукового эффекта
   */
  async playSound(soundType: SoundType, overrideVolume?: number): Promise<PlaySoundResult> {
    // Проверка инициализации
    if (!this.initialized) {
      return {
        success: false,
        soundType,
        error: 'AudioService not initialized',
      };
    }

    // Проверка, включены ли звуки глобально
    if (!this.settings.soundEnabled) {
      return {
        success: false,
        soundType,
        error: 'Sound is disabled globally',
      };
    }

    // Проверка настроек конкретного типа звука
    if (!this.shouldPlaySoundType(soundType)) {
      return {
        success: false,
        soundType,
        error: 'This sound type is disabled',
      };
    }

    try {
      const soundInstance = this.soundInstances.get(soundType);

      if (!soundInstance) {
        return {
          success: false,
          soundType,
          error: 'Sound instance not found',
        };
      }

      // Вычисление финальной громкости
      const soundConfig = SOUND_FILES[soundType];
      const baseVolume = soundConfig.volume ?? 1.0;
      const globalVolume = this.settings.soundVolume / 100;
      const finalVolume = overrideVolume ?? baseVolume * globalVolume;

      // Установка громкости и воспроизведение
      soundInstance.setVolume(Math.max(0, Math.min(1, finalVolume)));
      soundInstance.play((success) => {
        if (!success) {
          console.warn(`[AudioService] Sound playback failed: ${soundType}`);
        }
      });

      // Воспроизведение вибрации (если включена)
      if (
        this.settings.vibrationEnabled &&
        soundConfig.vibrate &&
        this.settings.vibrationIntensity !== VibrationIntensity.OFF
      ) {
        const pattern = soundConfig.vibrationPattern || VIBRATION_PATTERNS[this.settings.vibrationIntensity];
        this.vibrate(pattern);
      }

      return {
        success: true,
        soundType,
      };
    } catch (error) {
      console.error(`[AudioService] Error playing sound ${soundType}:`, error);
      return {
        success: false,
        soundType,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Проверка, нужно ли воспроизводить конкретный тип звука
   */
  private shouldPlaySoundType(soundType: SoundType): boolean {
    switch (soundType) {
      case SoundType.CELL_PLACEMENT:
      case SoundType.CELL_ERASE:
      case SoundType.NOTE_TOGGLE:
        return this.settings.cellPlacementSound;

      case SoundType.ERROR:
        return this.settings.errorSound;

      case SoundType.SUCCESS:
        return this.settings.successSound;

      case SoundType.HINT:
        return this.settings.hintSound;

      case SoundType.PUZZLE_COMPLETE:
      case SoundType.NEW_RECORD:
        return this.settings.completionSound;

      case SoundType.ACHIEVEMENT_UNLOCKED:
        return this.settings.achievementSound;

      case SoundType.BUTTON_TAP:
      case SoundType.MENU_OPEN:
      case SoundType.MENU_CLOSE:
        return this.settings.uiSound;

      default:
        return true;
    }
  }

  /**
   * Остановка всех звуков
   */
  stopAllSounds(): void {
    this.soundInstances.forEach((sound) => {
      if (sound.isPlaying()) {
        sound.stop();
      }
    });
  }

  /**
   * Получение текущих настроек
   */
  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  /**
   * Обновление настроек
   */
  updateSettings(newSettings: Partial<AudioSettings>): void {
    this.settings = {
      ...this.settings,
      ...newSettings,
    };

    // Нормализация громкости (0-100)
    if (newSettings.soundVolume !== undefined) {
      this.settings.soundVolume = Math.max(0, Math.min(100, newSettings.soundVolume));
    }

    console.log('[AudioService] Settings updated:', this.settings);
  }

  /**
   * Проверка, включены ли звуки
   */
  isSoundEnabled(): boolean {
    return this.settings.soundEnabled;
  }

  /**
   * Установка глобальной громкости
   */
  setVolume(volume: number): void {
    this.settings.soundVolume = Math.max(0, Math.min(100, volume));
    console.log(`[AudioService] Volume set to ${this.settings.soundVolume}%`);
  }

  /**
   * Вибрация устройства
   * @param pattern - паттерн вибрации [delay, duration, delay, duration, ...]
   */
  vibrate(pattern?: number[]): void {
    if (!this.settings.vibrationEnabled || this.settings.vibrationIntensity === VibrationIntensity.OFF) {
      return;
    }

    try {
      if (pattern && pattern.length > 0) {
        // Паттерн вибрации (массив)
        if (Platform.OS === 'android') {
          Vibration.vibrate(pattern);
        } else {
          // iOS не поддерживает паттерны, используем простую вибрацию
          // Берем сумму всех длительностей
          const totalDuration = pattern.reduce((acc, val, idx) => (idx % 2 === 1 ? acc + val : acc), 0);
          Vibration.vibrate(totalDuration);
        }
      } else {
        // Простая вибрация на основе интенсивности
        const defaultPattern = VIBRATION_PATTERNS[this.settings.vibrationIntensity];
        if (Platform.OS === 'android') {
          Vibration.vibrate(defaultPattern);
        } else {
          // Для iOS берем первую длительность
          Vibration.vibrate(defaultPattern[1] || 25);
        }
      }
    } catch (error) {
      console.warn('[AudioService] Vibration error:', error);
    }
  }

  /**
   * Очистка ресурсов
   */
  async cleanup(): Promise<void> {
    try {
      // Останавливаем все звуки
      this.stopAllSounds();

      // Освобождаем все звуковые инстансы
      this.soundInstances.forEach((sound) => {
        sound.release();
      });

      this.soundInstances.clear();
      this.initialized = false;

      console.log('[AudioService] Cleanup completed');
    } catch (error) {
      console.error('[AudioService] Cleanup error:', error);
      throw error;
    }
  }
}

// Синглтон экземпляр сервиса
let audioServiceInstance: AudioService | null = null;

/**
 * Получить единственный экземпляр AudioService
 */
export function getAudioService(): AudioService {
  if (!audioServiceInstance) {
    audioServiceInstance = new AudioService();
  }
  return audioServiceInstance;
}

/**
 * Сбросить экземпляр AudioService (для тестирования)
 */
export function resetAudioService(): void {
  if (audioServiceInstance) {
    audioServiceInstance.cleanup().catch(console.error);
    audioServiceInstance = null;
  }
}
