import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  AppSettings,
  DEFAULT_APP_SETTINGS,
  GameplaySettings,
  UISettings,
  AudioSettings,
  AdvancedSettings,
  SettingsProfile,
  ProfileInfo,
  ThemeType,
  ColorScheme,
  CellSize,
  FontSize,
  AnimationSpeed,
  Quality,
} from '../../domain/types/SettingsTypes';

interface SettingsState {
  // Текущие настройки
  settings: AppSettings;
  currentProfile: SettingsProfile | null;

  // Действия для обновления настроек по категориям
  updateGameplaySettings: (settings: Partial<GameplaySettings>) => void;
  updateUISettings: (settings: Partial<UISettings>) => void;
  updateAudioSettings: (settings: Partial<AudioSettings>) => void;
  updateAdvancedSettings: (settings: Partial<AdvancedSettings>) => void;

  // Управление профилями
  applyProfile: (profile: SettingsProfile) => void;
  getAvailableProfiles: () => ProfileInfo[];

  // Сброс настроек
  resetToDefaults: () => void;
  resetCategory: (category: keyof AppSettings) => void;

  // Импорт/экспорт настроек
  exportSettings: () => string;
  importSettings: (settingsJson: string) => boolean;
}

// Предустановленные профили настроек
const SETTINGS_PROFILES: Record<SettingsProfile, ProfileInfo> = {
  [SettingsProfile.CLASSIC]: {
    id: SettingsProfile.CLASSIC,
    name: 'Классический',
    description: 'Стандартные настройки для традиционного опыта игры',
    settings: {
      gameplay: {
        ...DEFAULT_APP_SETTINGS.gameplay,
        hintsEnabled: true,
        hintsLimit: 5,
        errorHighlighting: true,
        preventInvalidMoves: false,
        autoMarkNotes: false,
        showPossibleValues: false,
      },
      ui: {
        ...DEFAULT_APP_SETTINGS.ui,
        theme: ThemeType.LIGHT,
        colorScheme: ColorScheme.CLASSIC,
        animationsEnabled: true,
        animationSpeed: AnimationSpeed.NORMAL,
      },
      audio: {
        ...DEFAULT_APP_SETTINGS.audio,
        soundEnabled: true,
        soundVolume: 50,
      },
      advanced: DEFAULT_APP_SETTINGS.advanced,
    },
  },
  [SettingsProfile.MODERN]: {
    id: SettingsProfile.MODERN,
    name: 'Современный',
    description: 'Современный интерфейс с подсказками и автозаполнением',
    settings: {
      gameplay: {
        ...DEFAULT_APP_SETTINGS.gameplay,
        hintsEnabled: true,
        hintsLimit: 8,
        showRemainingNumbers: true,
        autoMarkNotes: true,
        showPossibleValues: true,
        highlightSameNumbers: true,
      },
      ui: {
        ...DEFAULT_APP_SETTINGS.ui,
        theme: ThemeType.AUTO,
        colorScheme: ColorScheme.MODERN,
        animationsEnabled: true,
        animationSpeed: AnimationSpeed.FAST,
      },
      audio: {
        ...DEFAULT_APP_SETTINGS.audio,
        soundEnabled: true,
        soundVolume: 70,
      },
      advanced: {
        ...DEFAULT_APP_SETTINGS.advanced,
        animationQuality: Quality.HIGH,
      },
    },
  },
  [SettingsProfile.MINIMALIST]: {
    id: SettingsProfile.MINIMALIST,
    name: 'Минималистический',
    description: 'Чистый интерфейс без подсказок и лишних элементов',
    settings: {
      gameplay: {
        ...DEFAULT_APP_SETTINGS.gameplay,
        hintsEnabled: false,
        hintsLimit: 0,
        showRemainingNumbers: false,
        errorHighlighting: false,
        autoMarkNotes: false,
        showPossibleValues: false,
        highlightSameNumbers: false,
      },
      ui: {
        ...DEFAULT_APP_SETTINGS.ui,
        theme: ThemeType.LIGHT,
        colorScheme: ColorScheme.CLASSIC,
        showTimer: false,
        showMoveCounter: false,
        showErrorCounter: false,
        showHintCounter: false,
        animationsEnabled: false,
      },
      audio: {
        ...DEFAULT_APP_SETTINGS.audio,
        soundEnabled: false,
        notificationsEnabled: false,
      },
      advanced: {
        ...DEFAULT_APP_SETTINGS.advanced,
        animationQuality: Quality.LOW,
      },
    },
  },
  [SettingsProfile.BEGINNER]: {
    id: SettingsProfile.BEGINNER,
    name: 'Для новичков',
    description: 'Максимальная помощь и подсказки для начинающих игроков',
    settings: {
      gameplay: {
        ...DEFAULT_APP_SETTINGS.gameplay,
        defaultDifficulty: 'beginner',
        hintsEnabled: true,
        hintsLimit: 10,
        showRemainingNumbers: true,
        errorHighlighting: true,
        preventInvalidMoves: true,
        showConflictingCells: true,
        autoMarkNotes: true,
        showPossibleValues: true,
        highlightSameNumbers: true,
      },
      ui: {
        ...DEFAULT_APP_SETTINGS.ui,
        theme: ThemeType.LIGHT,
        colorScheme: ColorScheme.COLORFUL,
        cellSize: CellSize.LARGE,
        fontSize: FontSize.LARGE,
        animationsEnabled: true,
        animationSpeed: AnimationSpeed.SLOW,
      },
      audio: {
        ...DEFAULT_APP_SETTINGS.audio,
        soundEnabled: true,
        soundVolume: 80,
        achievementNotifications: true,
      },
      advanced: {
        ...DEFAULT_APP_SETTINGS.advanced,
        autoSaveInterval: 15, // Более частые автосохранения
      },
    },
  },
  [SettingsProfile.EXPERT]: {
    id: SettingsProfile.EXPERT,
    name: 'Для экспертов',
    description: 'Строгий режим без помощи для опытных игроков',
    settings: {
      gameplay: {
        ...DEFAULT_APP_SETTINGS.gameplay,
        defaultDifficulty: 'expert',
        hintsEnabled: false,
        hintsLimit: 0,
        showRemainingNumbers: false,
        errorHighlighting: false,
        preventInvalidMoves: false,
        showConflictingCells: false,
        autoMarkNotes: false,
        showPossibleValues: false,
        highlightSameNumbers: false,
      },
      ui: {
        ...DEFAULT_APP_SETTINGS.ui,
        theme: ThemeType.DARK,
        colorScheme: ColorScheme.CLASSIC,
        animationsEnabled: true,
        animationSpeed: AnimationSpeed.FAST,
      },
      audio: {
        ...DEFAULT_APP_SETTINGS.audio,
        soundEnabled: true,
        soundVolume: 30,
        errorSound: false, // Не отвлекать звуками ошибок
      },
      advanced: {
        ...DEFAULT_APP_SETTINGS.advanced,
        animationQuality: Quality.HIGH,
        showPerformanceMetrics: true, // Для анализа производительности
      },
    },
  },
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      settings: DEFAULT_APP_SETTINGS,
      currentProfile: null,

      // Обновление категорий настроек
      updateGameplaySettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            gameplay: { ...state.settings.gameplay, ...newSettings },
          },
          currentProfile: null, // Сброс профиля при ручном изменении
        })),

      updateUISettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            ui: { ...state.settings.ui, ...newSettings },
          },
          currentProfile: null,
        })),

      updateAudioSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            audio: { ...state.settings.audio, ...newSettings },
          },
          currentProfile: null,
        })),

      updateAdvancedSettings: (newSettings) =>
        set((state) => ({
          settings: {
            ...state.settings,
            advanced: { ...state.settings.advanced, ...newSettings },
          },
          currentProfile: null,
        })),

      // Применение профиля
      applyProfile: (profile) => {
        const profileInfo = SETTINGS_PROFILES[profile];
        if (profileInfo) {
          set({
            settings: { ...profileInfo.settings },
            currentProfile: profile,
          });
        }
      },

      // Получение доступных профилей
      getAvailableProfiles: () => Object.values(SETTINGS_PROFILES),

      // Сброс настроек
      resetToDefaults: () =>
        set({
          settings: { ...DEFAULT_APP_SETTINGS },
          currentProfile: null,
        }),

      resetCategory: (category) =>
        set((state) => ({
          settings: {
            ...state.settings,
            [category]: { ...DEFAULT_APP_SETTINGS[category] },
          },
          currentProfile: null,
        })),

      // Импорт/экспорт
      exportSettings: () => {
        const { settings, currentProfile } = get();
        return JSON.stringify({ settings, currentProfile }, null, 2);
      },

      importSettings: (settingsJson) => {
        try {
          const parsed = JSON.parse(settingsJson);
          if (parsed.settings) {
            set({
              settings: { ...DEFAULT_APP_SETTINGS, ...parsed.settings },
              currentProfile: parsed.currentProfile || null,
            });
            return true;
          }
          return false;
        } catch (error) {
          console.error('Ошибка импорта настроек:', error);
          return false;
        }
      },
    }),
    {
      name: 'sudoku-settings', // Ключ для localStorage
      version: 1,
    }
  )
);