import { AppSettings } from '../types/SettingsTypes';

// Интерфейс репозитория настроек согласно системному анализу
export interface ISettingsRepository {
  // Получение текущих настроек
  getSettings(): Promise<AppSettings>;

  // Сохранение настроек
  save(settings: AppSettings): Promise<void>;

  // Сброс настроек к значениям по умолчанию
  reset(): Promise<void>;

  // Проверка существования настроек
  exists(): Promise<boolean>;

  // Экспорт настроек в JSON
  export(): Promise<string>;

  // Импорт настроек из JSON
  import(settingsJson: string): Promise<boolean>;
}