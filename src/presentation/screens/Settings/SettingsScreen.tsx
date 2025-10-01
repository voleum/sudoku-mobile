import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useSettingsStore } from '../../../application/stores/settingsStore';
import {
  SettingsSection,
  SettingToggle,
  SettingSlider,
  SettingSelector,
} from '../../components/settings';
import {
  ThemeType,
  ColorScheme,
  CellSize,
  FontSize,
  NumberStyle,
  AnimationSpeed,
  Quality,
  SettingsProfile,
  Language,
} from '../../../domain/types/SettingsTypes';
import { DifficultyLevel } from '../../../domain/types/GameTypes';
import { useTheme } from '../../theme';
import { Spacing } from '../../styles/spacing';

export const SettingsScreen: React.FC = () => {
  const { colors } = useTheme();
  const {
    settings,
    currentProfile,
    updateGameplaySettings,
    updateUISettings,
    updateAudioSettings,
    updateAdvancedSettings,
    applyProfile,
    getAvailableProfiles,
    resetToDefaults,
  } = useSettingsStore();

  // Опции для селекторов
  const difficultyOptions = [
    { value: 'beginner' as DifficultyLevel, label: 'Новичок', description: 'Самый простой уровень с максимумом подсказок' },
    { value: 'easy' as DifficultyLevel, label: 'Легкий', description: 'Простой уровень для начинающих' },
    { value: 'medium' as DifficultyLevel, label: 'Средний', description: 'Сбалансированный уровень сложности' },
    { value: 'hard' as DifficultyLevel, label: 'Сложный', description: 'Вызов для опытных игроков' },
    { value: 'expert' as DifficultyLevel, label: 'Эксперт', description: 'Максимальная сложность' },
  ];

  const themeOptions = [
    { value: ThemeType.LIGHT, label: 'Светлая', description: 'Светлое оформление' },
    { value: ThemeType.DARK, label: 'Темная', description: 'Темное оформление' },
    { value: ThemeType.AUTO, label: 'Автоматически', description: 'Следовать системным настройкам' },
  ];

  const colorSchemeOptions = [
    { value: ColorScheme.CLASSIC, label: 'Классическая', description: 'Синие и серые тона' },
    { value: ColorScheme.MODERN, label: 'Современная', description: 'Материальные цвета' },
    { value: ColorScheme.COLORFUL, label: 'Яркая', description: 'Насыщенные цвета' },
    { value: ColorScheme.ACCESSIBLE, label: 'Доступная', description: 'Высокий контраст' },
  ];

  const cellSizeOptions = [
    { value: CellSize.SMALL, label: 'Маленькие', description: 'Компактные ячейки' },
    { value: CellSize.MEDIUM, label: 'Средние', description: 'Стандартный размер' },
    { value: CellSize.LARGE, label: 'Большие', description: 'Увеличенные ячейки' },
  ];

  const fontSizeOptions = [
    { value: FontSize.SMALL, label: 'Маленький', description: 'Компактный текст' },
    { value: FontSize.MEDIUM, label: 'Средний', description: 'Стандартный размер' },
    { value: FontSize.LARGE, label: 'Большой', description: 'Увеличенный текст' },
  ];

  const numberStyleOptions = [
    { value: NumberStyle.CLASSIC, label: 'Классический', description: 'Традиционные цифры' },
    { value: NumberStyle.MODERN, label: 'Современный', description: 'Стильные цифры' },
    { value: NumberStyle.HANDWRITTEN, label: 'Рукописный', description: 'Рукописные цифры' },
  ];

  const animationSpeedOptions = [
    { value: AnimationSpeed.SLOW, label: 'Медленная', description: 'Плавные анимации' },
    { value: AnimationSpeed.NORMAL, label: 'Обычная', description: 'Стандартная скорость' },
    { value: AnimationSpeed.FAST, label: 'Быстрая', description: 'Ускоренные анимации' },
  ];

  const qualityOptions = [
    { value: Quality.LOW, label: 'Низкое', description: 'Экономия батареи' },
    { value: Quality.MEDIUM, label: 'Среднее', description: 'Сбалансированное качество' },
    { value: Quality.HIGH, label: 'Высокое', description: 'Лучшее качество' },
  ];

  const languageOptions = [
    { value: Language.RU, label: 'Русский', description: 'Русский интерфейс' },
    { value: Language.EN, label: 'English', description: 'English interface' },
  ];

  const profileOptions = getAvailableProfiles().map(profile => ({
    value: profile.id,
    label: profile.name,
    description: profile.description,
  }));

  // Форматтеры для слайдеров
  const formatVolume = (value: number) => `${value}%`;
  const formatHintsLimit = (value: number) => value === 0 ? 'Без ограничений' : `${value} подсказок`;
  const formatAutoSave = (value: number) => {
    if (value < 60) return `${value} сек`;
    const minutes = Math.floor(value / 60);
    const seconds = value % 60;
    return seconds === 0 ? `${minutes} мин` : `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Обработчики
  const handleResetSettings = () => {
    Alert.alert(
      'Сброс настроек',
      'Вы уверены, что хотите сбросить все настройки к значениям по умолчанию?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: resetToDefaults,
        },
      ]
    );
  };

  const handleProfileChange = (profile: SettingsProfile) => {
    Alert.alert(
      'Применить профиль',
      `Применить профиль "${profileOptions.find(p => p.value === profile)?.label}"? Текущие настройки будут заменены.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Применить',
          onPress: () => applyProfile(profile),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surfacePrimary }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Профили настроек */}
        <SettingsSection
          title="🎯 Профили настроек"
          description="Быстро применить готовые наборы настроек"
        >
          <SettingSelector
            title="Активный профиль"
            description={`Текущий: ${currentProfile ? profileOptions.find(p => p.value === currentProfile)?.label || 'Пользовательский' : 'Пользовательский'}`}
            value={currentProfile || SettingsProfile.MODERN}
            options={profileOptions}
            onValueChange={handleProfileChange}
            testID="settings-profile-selector"
          />
        </SettingsSection>

        {/* Геймплей */}
        <SettingsSection
          title="🎮 Геймплей"
          description="Настройки игрового процесса и сложности"
        >
          <SettingSelector
            title="Сложность по умолчанию"
            description="Уровень сложности для новых игр"
            value={settings.gameplay.defaultDifficulty}
            options={difficultyOptions}
            onValueChange={(value) => updateGameplaySettings({ defaultDifficulty: value })}
            testID="settings-default-difficulty"
          />

          <SettingToggle
            title="Подсказки включены"
            description="Разрешить использование системы подсказок"
            value={settings.gameplay.hintsEnabled}
            onValueChange={(value) => updateGameplaySettings({ hintsEnabled: value })}
            testID="settings-hints-enabled"
          />

          {settings.gameplay.hintsEnabled && (
            <SettingSlider
              title="Лимит подсказок"
              description="Максимальное количество подсказок за игру"
              value={settings.gameplay.hintsLimit}
              minimumValue={0}
              maximumValue={10}
              step={1}
              formatValue={formatHintsLimit}
              onValueChange={(value) => updateGameplaySettings({ hintsLimit: value })}
              testID="settings-hints-limit"
            />
          )}

          <SettingToggle
            title="Показывать оставшиеся цифры"
            description="Отображать количество неиспользованных цифр"
            value={settings.gameplay.showRemainingNumbers}
            onValueChange={(value) => updateGameplaySettings({ showRemainingNumbers: value })}
            testID="settings-remaining-numbers"
          />

          <SettingToggle
            title="Подсвечивать ошибки"
            description="Выделять неправильные ходы красным цветом"
            value={settings.gameplay.errorHighlighting}
            onValueChange={(value) => updateGameplaySettings({ errorHighlighting: value })}
            testID="settings-error-highlighting"
          />

          <SettingToggle
            title="Блокировать неверные ходы"
            description="Запрещать ввод заведомо неправильных цифр"
            value={settings.gameplay.preventInvalidMoves}
            onValueChange={(value) => updateGameplaySettings({ preventInvalidMoves: value })}
            testID="settings-prevent-invalid"
          />

          <SettingToggle
            title="Показывать конфликты"
            description="Выделять ячейки с повторяющимися цифрами"
            value={settings.gameplay.showConflictingCells}
            onValueChange={(value) => updateGameplaySettings({ showConflictingCells: value })}
            testID="settings-show-conflicts"
          />

          <SettingToggle
            title="Автоматические заметки"
            description="Автоматически добавлять заметки при вводе цифр"
            value={settings.gameplay.autoMarkNotes}
            onValueChange={(value) => updateGameplaySettings({ autoMarkNotes: value })}
            testID="settings-auto-notes"
          />

          <SettingToggle
            title="Показывать возможные значения"
            description="Отображать подсказки о допустимых цифрах"
            value={settings.gameplay.showPossibleValues}
            onValueChange={(value) => updateGameplaySettings({ showPossibleValues: value })}
            testID="settings-possible-values"
          />

          <SettingToggle
            title="Подсвечивать одинаковые цифры"
            description="Выделять все ячейки с той же цифрой"
            value={settings.gameplay.highlightSameNumbers}
            onValueChange={(value) => updateGameplaySettings({ highlightSameNumbers: value })}
            testID="settings-highlight-same"
          />

          <SettingToggle
            title="Автоматическая проверка завершения"
            description="Автоматически проверять завершение судоку при заполнении"
            value={settings.gameplay.autoCheckComplete}
            onValueChange={(value) => updateGameplaySettings({ autoCheckComplete: value })}
            testID="settings-auto-check-complete"
          />

          <SettingToggle
            title="Дзен-режим"
            description="Специальный режим для расслабления без таймера и счетчиков"
            value={settings.gameplay.zenMode}
            onValueChange={(value) => updateGameplaySettings({ zenMode: value })}
            testID="settings-zen-mode"
          />
        </SettingsSection>

        {/* Интерфейс */}
        <SettingsSection
          title="🎨 Интерфейс"
          description="Внешний вид и оформление игры"
        >
          <SettingSelector
            title="Язык интерфейса"
            description="Язык текстов и меню приложения"
            value={settings.ui.language}
            options={languageOptions}
            onValueChange={(value) => updateUISettings({ language: value })}
            testID="settings-language"
          />

          <SettingSelector
            title="Тема оформления"
            description="Цветовая схема приложения"
            value={settings.ui.theme}
            options={themeOptions}
            onValueChange={(value) => updateUISettings({ theme: value })}
            testID="settings-theme"
          />

          <SettingSelector
            title="Цветовая палитра"
            description="Стиль цветового оформления"
            value={settings.ui.colorScheme}
            options={colorSchemeOptions}
            onValueChange={(value) => updateUISettings({ colorScheme: value })}
            testID="settings-color-scheme"
          />

          <SettingSelector
            title="Размер ячеек"
            description="Размер ячеек игрового поля"
            value={settings.ui.cellSize}
            options={cellSizeOptions}
            onValueChange={(value) => updateUISettings({ cellSize: value })}
            testID="settings-cell-size"
          />

          <SettingSelector
            title="Размер шрифта"
            description="Размер текста в интерфейсе"
            value={settings.ui.fontSize}
            options={fontSizeOptions}
            onValueChange={(value) => updateUISettings({ fontSize: value })}
            testID="settings-font-size"
          />

          <SettingSelector
            title="Стиль цифр"
            description="Внешний вид цифр в ячейках"
            value={settings.ui.numbersStyle}
            options={numberStyleOptions}
            onValueChange={(value) => updateUISettings({ numbersStyle: value })}
            testID="settings-numbers-style"
          />

          <SettingToggle
            title="Показывать таймер"
            description="Отображать время игры"
            value={settings.ui.showTimer}
            onValueChange={(value) => updateUISettings({ showTimer: value })}
            testID="settings-show-timer"
          />

          <SettingToggle
            title="Показывать счетчик ходов"
            description="Отображать количество сделанных ходов"
            value={settings.ui.showMoveCounter}
            onValueChange={(value) => updateUISettings({ showMoveCounter: value })}
            testID="settings-show-moves"
          />

          <SettingToggle
            title="Показывать счетчик ошибок"
            description="Отображать количество ошибок"
            value={settings.ui.showErrorCounter}
            onValueChange={(value) => updateUISettings({ showErrorCounter: value })}
            testID="settings-show-errors"
          />

          <SettingToggle
            title="Показывать счетчик подсказок"
            description="Отображать оставшиеся подсказки"
            value={settings.ui.showHintCounter}
            onValueChange={(value) => updateUISettings({ showHintCounter: value })}
            testID="settings-show-hints"
          />

          <SettingToggle
            title="Анимации включены"
            description="Использовать анимации в интерфейсе"
            value={settings.ui.animationsEnabled}
            onValueChange={(value) => updateUISettings({ animationsEnabled: value })}
            testID="settings-animations-enabled"
          />

          {settings.ui.animationsEnabled && (
            <SettingSelector
              title="Скорость анимаций"
              description="Скорость воспроизведения анимаций"
              value={settings.ui.animationSpeed}
              options={animationSpeedOptions}
              onValueChange={(value) => updateUISettings({ animationSpeed: value })}
              testID="settings-animation-speed"
            />
          )}

          <SettingToggle
            title="Вибрация включена"
            description="Использовать вибрацию для тактильной обратной связи"
            value={settings.ui.vibrationEnabled}
            onValueChange={(value) => updateUISettings({ vibrationEnabled: value })}
            testID="settings-vibration"
          />
        </SettingsSection>

        {/* Звук и уведомления */}
        <SettingsSection
          title="🔊 Звук и уведомления"
          description="Настройки аудио и уведомлений"
        >
          <SettingToggle
            title="Звуковые эффекты"
            description="Воспроизводить звуки в игре"
            value={settings.audio.soundEnabled}
            onValueChange={(value) => updateAudioSettings({ soundEnabled: value })}
            testID="settings-sound-enabled"
          />

          {settings.audio.soundEnabled && (
            <>
              <SettingSlider
                title="Громкость звука"
                description="Уровень громкости звуковых эффектов"
                value={settings.audio.soundVolume}
                minimumValue={0}
                maximumValue={100}
                step={5}
                formatValue={formatVolume}
                onValueChange={(value) => updateAudioSettings({ soundVolume: value })}
                testID="settings-sound-volume"
              />

              <SettingToggle
                title="Звук размещения цифр"
                description="Звук при вводе цифры в ячейку"
                value={settings.audio.cellPlacementSound}
                onValueChange={(value) => updateAudioSettings({ cellPlacementSound: value })}
                testID="settings-cell-sound"
              />

              <SettingToggle
                title="Звук ошибки"
                description="Звуковое оповещение при ошибке"
                value={settings.audio.errorSound}
                onValueChange={(value) => updateAudioSettings({ errorSound: value })}
                testID="settings-error-sound"
              />

              <SettingToggle
                title="Звук успеха"
                description="Звук при правильном ходе"
                value={settings.audio.successSound}
                onValueChange={(value) => updateAudioSettings({ successSound: value })}
                testID="settings-success-sound"
              />

              <SettingToggle
                title="Звук подсказки"
                description="Звук при использовании подсказки"
                value={settings.audio.hintSound}
                onValueChange={(value) => updateAudioSettings({ hintSound: value })}
                testID="settings-hint-sound"
              />

              <SettingToggle
                title="Звук завершения"
                description="Музыка при завершении игры"
                value={settings.audio.completionSound}
                onValueChange={(value) => updateAudioSettings({ completionSound: value })}
                testID="settings-completion-sound"
              />
            </>
          )}

          <SettingToggle
            title="Уведомления включены"
            description="Разрешить push-уведомления"
            value={settings.audio.notificationsEnabled}
            onValueChange={(value) => updateAudioSettings({ notificationsEnabled: value })}
            testID="settings-notifications-enabled"
          />

          <SettingToggle
            title="Ежедневное напоминание"
            description="Напоминать о игре каждый день"
            value={settings.audio.dailyReminder}
            onValueChange={(value) => updateAudioSettings({ dailyReminder: value })}
            testID="settings-daily-reminder"
          />

          <SettingToggle
            title="Уведомления о достижениях"
            description="Уведомлять о получении новых достижений"
            value={settings.audio.achievementNotifications}
            onValueChange={(value) => updateAudioSettings({ achievementNotifications: value })}
            testID="settings-achievement-notifications"
          />

          <SettingToggle
            title="Фоновые звуки дзен-режима"
            description="Успокаивающие звуки для релаксации в дзен-режиме"
            value={settings.audio.zenAmbientSounds}
            onValueChange={(value) => updateAudioSettings({ zenAmbientSounds: value })}
            testID="settings-zen-ambient-sounds"
          />

          <SettingToggle
            title="Медитативная музыка"
            description="Мягкая музыка для концентрации в дзен-режиме"
            value={settings.audio.zenMusicEnabled}
            onValueChange={(value) => updateAudioSettings({ zenMusicEnabled: value })}
            testID="settings-zen-music"
          />
        </SettingsSection>

        {/* Продвинутые настройки */}
        <SettingsSection
          title="⚙️ Продвинутые настройки"
          description="Настройки производительности и данных"
        >
          <SettingSelector
            title="Качество анимаций"
            description="Влияет на производительность и расход батареи"
            value={settings.advanced.animationQuality}
            options={qualityOptions}
            onValueChange={(value) => updateAdvancedSettings({ animationQuality: value })}
            testID="settings-animation-quality"
          />

          <SettingSlider
            title="Автосохранение"
            description="Интервал автоматического сохранения игры"
            value={settings.advanced.autoSaveInterval}
            minimumValue={10}
            maximumValue={300}
            step={5}
            formatValue={formatAutoSave}
            onValueChange={(value) => updateAdvancedSettings({ autoSaveInterval: value })}
            testID="settings-auto-save"
          />

          <SettingToggle
            title="Пауза при сворачивании"
            description="Автоматически ставить игру на паузу при сворачивании приложения"
            value={settings.advanced.pauseOnMinimize}
            onValueChange={(value) => updateAdvancedSettings({ pauseOnMinimize: value })}
            testID="settings-pause-on-minimize"
          />

          <SettingToggle
            title="Аналитика включена"
            description="Разрешить сбор анонимной статистики для улучшения игры"
            value={settings.advanced.analyticsEnabled}
            onValueChange={(value) => updateAdvancedSettings({ analyticsEnabled: value })}
            testID="settings-analytics"
          />

          <SettingToggle
            title="Отчеты об ошибках"
            description="Автоматически отправлять отчеты о сбоях"
            value={settings.advanced.crashReportsEnabled}
            onValueChange={(value) => updateAdvancedSettings({ crashReportsEnabled: value })}
            testID="settings-crash-reports"
          />

          <SettingToggle
            title="Облачная синхронизация"
            description="Синхронизировать данные с облаком (в разработке)"
            value={settings.advanced.cloudSyncEnabled}
            onValueChange={(value) => updateAdvancedSettings({ cloudSyncEnabled: value })}
            disabled={true} // В разработке
            testID="settings-cloud-sync"
          />

          <SettingToggle
            title="Показывать метрики производительности"
            description="Отображать FPS и использование памяти (для разработчиков)"
            value={settings.advanced.showPerformanceMetrics}
            onValueChange={(value) => updateAdvancedSettings({ showPerformanceMetrics: value })}
            testID="settings-performance-metrics"
          />
        </SettingsSection>

        {/* Действия */}
        <SettingsSection
          title="🔄 Действия"
          description="Сброс и управление настройками"
        >
          <SettingToggle
            title="Сбросить все настройки"
            description="Вернуть все настройки к значениям по умолчанию"
            value={false}
            onValueChange={handleResetSettings}
            testID="settings-reset-all"
          />
        </SettingsSection>

        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
  },

  footer: {
    height: Spacing.xl,
  },
});