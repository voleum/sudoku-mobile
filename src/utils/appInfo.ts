/**
 * Утилита для получения информации о приложении из package.json
 * Согласно требованиям системного анализа для AboutScreen
 */

import packageJson from '../../package.json';

export interface AppInfo {
  name: string;
  displayName: string;
  version: string;
  buildNumber: string;
  releaseDate: string;
  developer: string;
  description: string;
}

export interface ContactInfo {
  email: string;
  website: string;
  github: string;
}

/**
 * Получить информацию о приложении
 * @returns AppInfo объект с данными приложения
 */
export const getAppInfo = (): AppInfo => {
  return {
    name: packageJson.name,
    displayName: 'Судоку', // Локализованное название
    version: packageJson.version,
    buildNumber: '1', // Получается из build системы при сборке
    releaseDate: 'Сентябрь 2025', // TODO: автоматическое определение из git tags
    developer: 'voleum',
    description: 'Кросплатформенная игра Судоку с современным дизайном и интуитивным интерфейсом',
  };
};

/**
 * Получить контактную информацию
 * @returns ContactInfo объект с контактами
 */
export const getContactInfo = (): ContactInfo => {
  return {
    email: 'voleum.dev@gmail.com', // Реальный email разработчика
    website: 'https://github.com/voleum/sudoku-mobile', // GitHub как основной веб-сайт проекта
    github: 'https://github.com/voleum/sudoku-mobile',
  };
};

/**
 * Получить информацию о технологиях из package.json
 * @returns массив строк с используемыми технологиями
 */
export const getTechnologyInfo = (): string[] => {
  const technologies = [];

  if (packageJson.dependencies['react-native']) {
    technologies.push(`React Native ${packageJson.dependencies['react-native']}`);
  }

  if (packageJson.devDependencies?.typescript) {
    technologies.push('TypeScript');
  }

  if (packageJson.dependencies.zustand) {
    technologies.push('Zustand для state management');
  }

  if (packageJson.dependencies['react-native-sqlite-storage']) {
    technologies.push('SQLite для локального хранения');
  }

  if (packageJson.devDependencies?.jest) {
    technologies.push('Jest для тестирования');
  }

  return technologies;
};

/**
 * Получить версию для отображения
 * @returns строка вида "1.0.0 (build 123)"
 */
export const getVersionString = (): string => {
  const info = getAppInfo();
  return `${info.version} (build ${info.buildNumber})`;
};