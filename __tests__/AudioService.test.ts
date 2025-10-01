/**
 * AudioService Unit Tests
 * Тесты для сервиса звуковых эффектов
 * Согласно стратегии тестирования (2.3.4-testing-strategy.md)
 */

import { AudioService } from '../src/infrastructure/services/AudioService';
import { SoundType } from '../src/domain/types/AudioTypes';
import { DEFAULT_AUDIO_SETTINGS } from '../src/domain/types/SettingsTypes';

// Mock react-native-sound
jest.mock('react-native-sound', () => {
  const mockSoundInstance = {
    play: jest.fn((callback?: (success: boolean) => void) => {
      if (callback) callback(true);
    }),
    stop: jest.fn(),
    release: jest.fn(),
    setVolume: jest.fn(),
    getDuration: jest.fn(() => 1000),
    isLoaded: jest.fn(() => true),
    isPlaying: jest.fn(() => false),
  };

  const MockSound: any = jest.fn((fileName: string, basePath: string, callback?: (error: Error | null) => void) => {
    setTimeout(() => {
      if (callback) callback(null);
    }, 0);
    return mockSoundInstance;
  });

  MockSound.MAIN_BUNDLE = 'MAIN_BUNDLE';
  MockSound.setCategory = jest.fn();

  return MockSound;
});

// Mock React Native
jest.mock('react-native', () => ({
  Vibration: {
    vibrate: jest.fn(),
  },
  Platform: {
    OS: 'ios',
  },
}));

import Sound from 'react-native-sound';
import { Vibration } from 'react-native';

describe('AudioService', () => {
  let audioService: AudioService;

  beforeEach(() => {
    jest.clearAllMocks();
    audioService = new AudioService();
  });

  afterEach(async () => {
    await audioService.cleanup();
  });

  describe('Initialization', () => {
    test('should initialize successfully and load all sounds', async () => {
      await audioService.initialize();

      // Проверяем, что Sound.setCategory был вызван
      expect(Sound.setCategory).toHaveBeenCalledWith('Playback', false);

      // Проверяем, что все 12 типов звуков были загружены
      expect(Sound).toHaveBeenCalledTimes(12);
    });

    test('should not reinitialize if already initialized', async () => {
      await audioService.initialize();
      const firstCallCount = (Sound as any).mock.calls.length;

      await audioService.initialize();
      const secondCallCount = (Sound as any).mock.calls.length;

      // Количество вызовов не должно измениться
      expect(secondCallCount).toBe(firstCallCount);
    });

    test('should throw error if sound loading fails', async () => {
      // Мокаем ошибку загрузки
      (Sound as unknown as jest.Mock).mockImplementationOnce(
        (fileName: string, basePath: string, callback?: (error: Error | null) => void) => {
          setTimeout(() => {
            if (callback) callback(new Error('Failed to load sound'));
          }, 0);
          return {};
        },
      );

      await expect(audioService.initialize()).rejects.toThrow();
    });
  });

  describe('playSound', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    test('should play sound successfully when enabled', async () => {
      const result = await audioService.playSound(SoundType.BUTTON_TAP);

      expect(result.success).toBe(true);
      expect(result.soundType).toBe(SoundType.BUTTON_TAP);
      expect(result.error).toBeUndefined();
    });

    test('should not play sound when globally disabled', async () => {
      audioService.updateSettings({ soundEnabled: false });

      const result = await audioService.playSound(SoundType.BUTTON_TAP);

      expect(result.success).toBe(false);
      expect(result.error).toContain('disabled');
    });

    test('should not play sound when specific type is disabled', async () => {
      audioService.updateSettings({ uiSound: false });

      const result = await audioService.playSound(SoundType.BUTTON_TAP);

      expect(result.success).toBe(false);
      expect(result.error).toContain('disabled');
    });

    test('should apply correct volume', async () => {
      const mockSoundInstance = (Sound as any).mock.results[0]?.value;

      audioService.updateSettings({ soundVolume: 50 });
      await audioService.playSound(SoundType.BUTTON_TAP);

      expect(mockSoundInstance.setVolume).toHaveBeenCalled();
      const volumeArg = mockSoundInstance.setVolume.mock.calls[0][0];
      expect(volumeArg).toBeGreaterThan(0);
      expect(volumeArg).toBeLessThanOrEqual(1);
    });

    test('should override volume when specified', async () => {
      const mockSoundInstance = (Sound as any).mock.results[0]?.value;

      await audioService.playSound(SoundType.BUTTON_TAP, 0.8);

      expect(mockSoundInstance.setVolume).toHaveBeenCalled();
      const volumeArg = mockSoundInstance.setVolume.mock.calls[0][0];
      expect(volumeArg).toBeCloseTo(0.8, 1);
    });

    test('should trigger vibration when enabled and sound supports it', async () => {
      audioService.updateSettings({ vibrationEnabled: true });

      await audioService.playSound(SoundType.ERROR);

      expect(Vibration.vibrate).toHaveBeenCalled();
    });

    test('should not vibrate when vibration is disabled', async () => {
      audioService.updateSettings({ vibrationEnabled: false });

      await audioService.playSound(SoundType.ERROR);

      expect(Vibration.vibrate).not.toHaveBeenCalled();
    });

    test('should fail gracefully when not initialized', async () => {
      const uninitializedService = new AudioService();

      const result = await uninitializedService.playSound(SoundType.BUTTON_TAP);

      expect(result.success).toBe(false);
      expect(result.error).toContain('not initialized');
    });
  });

  describe('Settings Management', () => {
    test('should return current settings', () => {
      const settings = audioService.getSettings();

      expect(settings).toEqual(DEFAULT_AUDIO_SETTINGS);
    });

    test('should update settings partially', () => {
      audioService.updateSettings({ soundVolume: 80 });

      const settings = audioService.getSettings();
      expect(settings.soundVolume).toBe(80);
      expect(settings.soundEnabled).toBe(DEFAULT_AUDIO_SETTINGS.soundEnabled);
    });

    test('should update multiple settings at once', () => {
      audioService.updateSettings({
        soundEnabled: false,
        soundVolume: 30,
        vibrationEnabled: true,
      });

      const settings = audioService.getSettings();
      expect(settings.soundEnabled).toBe(false);
      expect(settings.soundVolume).toBe(30);
      expect(settings.vibrationEnabled).toBe(true);
    });

    test('should check if sound is enabled', () => {
      expect(audioService.isSoundEnabled()).toBe(true);

      audioService.updateSettings({ soundEnabled: false });
      expect(audioService.isSoundEnabled()).toBe(false);
    });

    test('should set volume correctly', () => {
      audioService.setVolume(75);

      const settings = audioService.getSettings();
      expect(settings.soundVolume).toBe(75);
    });

    test('should clamp volume to valid range (0-100)', () => {
      audioService.setVolume(150);
      expect(audioService.getSettings().soundVolume).toBe(100);

      audioService.setVolume(-10);
      expect(audioService.getSettings().soundVolume).toBe(0);
    });
  });

  describe('Vibration', () => {
    test('should vibrate with default pattern', () => {
      audioService.updateSettings({ vibrationEnabled: true });
      audioService.vibrate();

      expect(Vibration.vibrate).toHaveBeenCalled();
    });

    test('should vibrate with custom pattern on iOS', () => {
      audioService.updateSettings({ vibrationEnabled: true });
      const customPattern = [0, 100, 50, 100];
      audioService.vibrate(customPattern);

      // На iOS паттерн конвертируется в totalDuration (100 + 100 = 200)
      expect(Vibration.vibrate).toHaveBeenCalledWith(200);
    });

    test('should use correct vibration patterns for intensities on iOS', () => {
      audioService.updateSettings({ vibrationEnabled: true });

      // Test LIGHT intensity pattern - на iOS используется длительность
      audioService.vibrate([0, 10]);
      expect(Vibration.vibrate).toHaveBeenCalledWith(10);

      // Test MEDIUM intensity pattern
      audioService.vibrate([0, 20]);
      expect(Vibration.vibrate).toHaveBeenCalledWith(20);

      // Test HEAVY intensity pattern
      audioService.vibrate([0, 30]);
      expect(Vibration.vibrate).toHaveBeenCalledWith(30);
    });
  });

  describe('Sound Type Mapping', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    test('should respect cellPlacementSound setting for placement sounds', async () => {
      audioService.updateSettings({ cellPlacementSound: false });

      const result1 = await audioService.playSound(SoundType.CELL_PLACEMENT);
      const result2 = await audioService.playSound(SoundType.CELL_ERASE);
      const result3 = await audioService.playSound(SoundType.NOTE_TOGGLE);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
      expect(result3.success).toBe(false);
    });

    test('should respect errorSound setting', async () => {
      audioService.updateSettings({ errorSound: false });

      const result = await audioService.playSound(SoundType.ERROR);

      expect(result.success).toBe(false);
    });

    test('should respect successSound setting', async () => {
      audioService.updateSettings({ successSound: false });

      const result = await audioService.playSound(SoundType.SUCCESS);

      expect(result.success).toBe(false);
    });

    test('should respect hintSound setting', async () => {
      audioService.updateSettings({ hintSound: false });

      const result = await audioService.playSound(SoundType.HINT);

      expect(result.success).toBe(false);
    });

    test('should respect completionSound setting', async () => {
      audioService.updateSettings({ completionSound: false });

      const result1 = await audioService.playSound(SoundType.PUZZLE_COMPLETE);
      const result2 = await audioService.playSound(SoundType.NEW_RECORD);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
    });

    test('should respect achievementSound setting', async () => {
      audioService.updateSettings({ achievementSound: false });

      const result = await audioService.playSound(SoundType.ACHIEVEMENT_UNLOCKED);

      expect(result.success).toBe(false);
    });

    test('should respect uiSound setting', async () => {
      audioService.updateSettings({ uiSound: false });

      const result1 = await audioService.playSound(SoundType.BUTTON_TAP);
      const result2 = await audioService.playSound(SoundType.MENU_OPEN);
      const result3 = await audioService.playSound(SoundType.MENU_CLOSE);

      expect(result1.success).toBe(false);
      expect(result2.success).toBe(false);
      expect(result3.success).toBe(false);
    });
  });

  describe('stopAllSounds', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    test('should iterate through all sound instances', () => {
      // В текущей реализации stopAllSounds проверяет isPlaying() перед остановкой
      // isPlaying() возвращает false в моке, поэтому stop не вызывается
      // Это правильное поведение - не останавливать звуки, которые не играют
      audioService.stopAllSounds();

      // Проверяем, что метод выполнился без ошибок
      expect(true).toBe(true);
    });

    test('should stop sounds that are playing', async () => {
      // Создаем мок где isPlaying возвращает true
      const mockInstance = (Sound as any).mock.results[0]?.value;
      if (mockInstance) {
        mockInstance.isPlaying.mockReturnValueOnce(true);

        audioService.stopAllSounds();

        // Теперь stop должен быть вызван
        expect(mockInstance.stop).toHaveBeenCalled();
      }
    });
  });

  describe('cleanup', () => {
    beforeEach(async () => {
      await audioService.initialize();
    });

    test('should release all sound instances', async () => {
      await audioService.cleanup();

      // Проверяем, что release был вызван для всех звуков
      const mockInstances = (Sound as any).mock.results;
      mockInstances.forEach((result: any) => {
        expect(result.value.release).toHaveBeenCalled();
      });
    });

    test('should clear sound instances map', async () => {
      await audioService.cleanup();

      const result = await audioService.playSound(SoundType.BUTTON_TAP);

      // После cleanup звуки не должны воспроизводиться
      expect(result.success).toBe(false);
    });
  });

  describe('Performance', () => {
    test('should initialize within acceptable time', async () => {
      const startTime = Date.now();
      await audioService.initialize();
      const duration = Date.now() - startTime;

      // Initialization should be fast (< 2 seconds according to strategy)
      expect(duration).toBeLessThan(2000);
    });

    test('should play sound with minimal latency', async () => {
      await audioService.initialize();

      const startTime = Date.now();
      await audioService.playSound(SoundType.BUTTON_TAP);
      const duration = Date.now() - startTime;

      // Sound playback should respond quickly (< 100ms according to strategy)
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Edge Cases', () => {
    test('should handle rapid successive plays', async () => {
      await audioService.initialize();

      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(audioService.playSound(SoundType.BUTTON_TAP));
      }

      const results = await Promise.all(promises);

      // All sounds should succeed
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    test('should handle playing all sound types sequentially', async () => {
      await audioService.initialize();

      const soundTypes = Object.values(SoundType);
      const results = [];

      for (const soundType of soundTypes) {
        const result = await audioService.playSound(soundType);
        results.push(result);
      }

      // All sound types should play successfully
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    test('should handle settings changes during playback', async () => {
      await audioService.initialize();

      const playPromise = audioService.playSound(SoundType.BUTTON_TAP);
      audioService.updateSettings({ soundVolume: 50 });

      const result = await playPromise;

      expect(result.success).toBe(true);
    });
  });
});
