/**
 * useAudio Hook
 * Хук для работы со звуковыми эффектами в компонентах
 * Интегрируется с AudioService и settingsStore
 */

import { useEffect, useCallback, useRef } from 'react';
import { SoundType } from '../../domain/types/AudioTypes';
import { getAudioService } from '../../infrastructure/services/AudioService';
import { useSettingsStore } from '../../application/stores/settingsStore';

/**
 * Хук для работы со звуковыми эффектами
 *
 * @example
 * const { playSound, updateAudioSettings, audioSettings } = useAudio();
 *
 * // Воспроизвести звук при нажатии
 * const handleButtonPress = () => {
 *   playSound(SoundType.BUTTON_TAP);
 * };
 *
 * // Изменить громкость
 * const handleVolumeChange = (volume: number) => {
 *   updateAudioSettings({ soundVolume: volume });
 * };
 */
export function useAudio() {
  const audioService = useRef(getAudioService()).current;
  const audioSettings = useSettingsStore((state) => state.settings.audio);
  const updateAudioSettings = useSettingsStore((state) => state.updateAudioSettings);

  // Инициализация AudioService при монтировании
  useEffect(() => {
    let isActive = true;

    const initAudio = async () => {
      try {
        await audioService.initialize();

        if (isActive) {
          // Синхронизация настроек из store с AudioService
          audioService.updateSettings(audioSettings);
        }
      } catch (error) {
        console.error('[useAudio] Failed to initialize AudioService:', error);
      }
    };

    initAudio();

    // Cleanup при размонтировании
    return () => {
      isActive = false;
    };
  }, [audioService, audioSettings]);

  // Синхронизация настроек при изменении
  useEffect(() => {
    audioService.updateSettings(audioSettings);
  }, [audioService, audioSettings]);

  /**
   * Воспроизведение звукового эффекта
   */
  const playSound = useCallback(
    async (soundType: SoundType, overrideVolume?: number) => {
      try {
        const result = await audioService.playSound(soundType, overrideVolume);
        if (!result.success) {
          console.warn(`[useAudio] Failed to play sound ${soundType}:`, result.error);
        }
        return result;
      } catch (error) {
        console.error(`[useAudio] Error playing sound ${soundType}:`, error);
        return {
          success: false,
          soundType,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    [audioService],
  );

  /**
   * Остановка всех звуков
   */
  const stopAllSounds = useCallback(() => {
    audioService.stopAllSounds();
  }, [audioService]);

  /**
   * Установка громкости
   */
  const setVolume = useCallback(
    (volume: number) => {
      audioService.setVolume(volume);
      updateAudioSettings({ soundVolume: volume });
    },
    [audioService, updateAudioSettings],
  );

  /**
   * Переключение звуков (включить/выключить)
   */
  const toggleSound = useCallback(() => {
    const newState = !audioSettings.soundEnabled;
    updateAudioSettings({ soundEnabled: newState });
  }, [audioSettings.soundEnabled, updateAudioSettings]);

  /**
   * Переключение вибрации (включить/выключить)
   */
  const toggleVibration = useCallback(() => {
    const newState = !audioSettings.vibrationEnabled;
    updateAudioSettings({ vibrationEnabled: newState });
  }, [audioSettings.vibrationEnabled, updateAudioSettings]);

  /**
   * Вибрация устройства
   */
  const vibrate = useCallback(
    (pattern?: number[]) => {
      audioService.vibrate(pattern);
    },
    [audioService],
  );

  return {
    // Состояние
    audioSettings,
    isSoundEnabled: audioSettings.soundEnabled,
    isVibrationEnabled: audioSettings.vibrationEnabled,
    volume: audioSettings.soundVolume,

    // Действия
    playSound,
    stopAllSounds,
    setVolume,
    toggleSound,
    toggleVibration,
    vibrate,
    updateAudioSettings,
  };
}

/**
 * Хук для быстрого воспроизведения звуков без полной интеграции
 * Используется в простых компонентах, где не нужен полный контроль
 *
 * @example
 * const playSound = useSimpleAudio();
 *
 * <Button onPress={() => playSound(SoundType.BUTTON_TAP)}>
 *   Нажми меня
 * </Button>
 */
export function useSimpleAudio() {
  const audioService = useRef(getAudioService()).current;

  // Инициализация один раз
  useEffect(() => {
    audioService.initialize().catch((error) => {
      console.error('[useSimpleAudio] Failed to initialize:', error);
    });
  }, [audioService]);

  return useCallback(
    async (soundType: SoundType, overrideVolume?: number) => {
      try {
        await audioService.playSound(soundType, overrideVolume);
      } catch (error) {
        console.error(`[useSimpleAudio] Error:`, error);
      }
    },
    [audioService],
  );
}
