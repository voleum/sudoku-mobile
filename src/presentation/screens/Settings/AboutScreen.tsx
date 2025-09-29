import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { Card } from '../../components/common/Card';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';

export const AboutScreen: React.FC = () => {
  // Информация о приложении согласно package.json
  const appInfo = {
    name: 'Судоку',
    version: '0.0.1',
    buildNumber: '1',
    releaseDate: 'Сентябрь 2025',
    developer: 'voleum',
    description: 'Кросплатформенная игра Судоку с современным дизайном и интуитивным интерфейсом',
  };

  // Контактная информация
  const contactInfo = {
    email: 'support@sudoku-game.com',
    website: 'https://sudoku-game.com',
    github: 'https://github.com/voleum/sudoku-mobile',
  };

  // Обработчик открытия ссылок
  const handleLinkPress = async (url: string, linkType: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Ошибка',
          `Не удается открыть ${linkType}. Скопируйте ссылку вручную: ${url}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Ошибка',
        `Не удается открыть ${linkType}. Проверьте подключение к интернету.`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID="about-screen"
      >
        {/* Информация о приложении */}
        <Card
          style={styles.card}
          testID="app-info-card"
          accessibilityLabel={`Информация о приложении ${appInfo.name} версии ${appInfo.version}`}
        >
          <View style={styles.header}>
            <View style={styles.appIconContainer}>
              <Text style={styles.appIcon}>🧩</Text>
            </View>
            <View style={styles.appTitleContainer}>
              <Text style={styles.appTitle}>{appInfo.name}</Text>
              <Text style={styles.appSubtitle}>Логическая головоломка</Text>
            </View>
          </View>

          <Text style={styles.appDescription}>
            {appInfo.description}
          </Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Версия:</Text>
              <Text style={styles.infoValue}>{appInfo.version} (build {appInfo.buildNumber})</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Дата релиза:</Text>
              <Text style={styles.infoValue}>{appInfo.releaseDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Разработчик:</Text>
              <Text style={styles.infoValue}>{appInfo.developer}</Text>
            </View>
          </View>
        </Card>

        {/* Возможности приложения */}
        <Card
          style={styles.card}
          testID="features-card"
          accessibilityLabel="Основные возможности приложения"
        >
          <Text style={styles.sectionTitle}>🎯 Возможности</Text>
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>• 5 уровней сложности (Новичок → Эксперт)</Text>
            <Text style={styles.featureItem}>• Интеллектуальная система подсказок</Text>
            <Text style={styles.featureItem}>• Детальная статистика и достижения</Text>
            <Text style={styles.featureItem}>• Настраиваемый интерфейс и темы</Text>
            <Text style={styles.featureItem}>• Дзен-режим для медитативной игры</Text>
            <Text style={styles.featureItem}>• Поддержка accessibility</Text>
          </View>
        </Card>

        {/* Благодарности */}
        <Card
          style={styles.card}
          testID="credits-card"
          accessibilityLabel="Благодарности и используемые технологии"
        >
          <Text style={styles.sectionTitle}>🤝 Благодарности</Text>
          <View style={styles.creditsSection}>
            <Text style={styles.creditsSubtitle}>Технологии:</Text>
            <Text style={styles.creditsItem}>• React Native 0.81.4</Text>
            <Text style={styles.creditsItem}>• TypeScript</Text>
            <Text style={styles.creditsItem}>• Zustand для state management</Text>
            <Text style={styles.creditsItem}>• SQLite для локального хранения</Text>
            <Text style={styles.creditsItem}>• Jest для тестирования</Text>
          </View>

          <View style={styles.creditsSection}>
            <Text style={styles.creditsSubtitle}>Алгоритмы:</Text>
            <Text style={styles.creditsItem}>• Constraint Propagation для решения судоку</Text>
            <Text style={styles.creditsItem}>• Backtracking для генерации головоломок</Text>
            <Text style={styles.creditsItem}>• Symmetry-based pattern generation</Text>
          </View>
        </Card>

        {/* Контактная информация */}
        <Card
          style={styles.card}
          testID="contact-card"
          accessibilityLabel="Контактная информация и поддержка"
        >
          <Text style={styles.sectionTitle}>📞 Контакты</Text>

          <Card
            pressable
            onPress={() => handleLinkPress(`mailto:${contactInfo.email}`, 'email')}
            style={styles.contactItem}
          >
            <View style={styles.contactRow}>
              <Text style={styles.contactIcon}>✉️</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Поддержка</Text>
                <Text style={styles.contactValue}>{contactInfo.email}</Text>
              </View>
            </View>
          </Card>

          <Card
            pressable
            onPress={() => handleLinkPress(contactInfo.website, 'веб-сайт')}
            style={styles.contactItem}
          >
            <View style={styles.contactRow}>
              <Text style={styles.contactIcon}>🌐</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Веб-сайт</Text>
                <Text style={styles.contactValue}>{contactInfo.website}</Text>
              </View>
            </View>
          </Card>

          <Card
            pressable
            onPress={() => handleLinkPress(contactInfo.github, 'GitHub')}
            style={styles.contactItem}
          >
            <View style={styles.contactRow}>
              <Text style={styles.contactIcon}>⚙️</Text>
              <View style={styles.contactInfo}>
                <Text style={styles.contactTitle}>Исходный код</Text>
                <Text style={styles.contactValue}>{contactInfo.github}</Text>
              </View>
            </View>
          </Card>
        </Card>

        {/* Правовая информация */}
        <Card
          style={styles.card}
          testID="legal-card"
          accessibilityLabel="Правовая информация и лицензии"
        >
          <Text style={styles.sectionTitle}>⚖️ Правовая информация</Text>

          <View style={styles.legalSection}>
            <Text style={styles.legalTitle}>Авторские права</Text>
            <Text style={styles.legalText}>
              © 2025 voleum. Все права защищены. Судоку является классической логической игрой,
              находящейся в общественном достоянии.
            </Text>
          </View>

          <View style={styles.legalSection}>
            <Text style={styles.legalTitle}>Лицензия</Text>
            <Text style={styles.legalText}>
              Приложение разработано для образовательных и развлекательных целей.
              Исходный код доступен под лицензией MIT.
            </Text>
          </View>

          <View style={styles.legalSection}>
            <Text style={styles.legalTitle}>Конфиденциальность</Text>
            <Text style={styles.legalText}>
              Приложение не собирает персональные данные пользователей.
              Вся игровая статистика хранится локально на устройстве.
            </Text>
          </View>

          <View style={styles.legalSection}>
            <Text style={styles.legalTitle}>Третьи стороны</Text>
            <Text style={styles.legalText}>
              Приложение использует открытые библиотеки React Native ecosystem.
              Полный список зависимостей доступен в репозитории проекта.
            </Text>
          </View>
        </Card>

        {/* Дополнительное пространство внизу */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingVertical: Spacing.md,
  },

  card: {
    marginHorizontal: Spacing.screen,
    marginVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },

  // Заголовок приложения
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  appIconContainer: {
    marginRight: Spacing.md,
  },

  appIcon: {
    fontSize: Typography.fontSize['4xl'],
  },

  appTitleContainer: {
    flex: 1,
  },

  appTitle: {
    ...Typography.heading2,
    color: Colors.text.primary,
    fontWeight: 'bold',
    marginBottom: Spacing.xs,
  },

  appSubtitle: {
    ...Typography.body2,
    color: Colors.text.secondary,
  },

  appDescription: {
    ...Typography.body1,
    color: Colors.text.primary,
    lineHeight: Typography.lineHeight.lg,
    marginBottom: Spacing.lg,
  },

  // Секции информации
  sectionTitle: {
    ...Typography.heading3,
    color: Colors.text.primary,
    fontWeight: 'bold',
    marginBottom: Spacing.md,
  },

  infoSection: {
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    paddingTop: Spacing.md,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  infoLabel: {
    ...Typography.body1,
    color: Colors.text.secondary,
    flex: 1,
  },

  infoValue: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },

  // Возможности
  featuresList: {
    marginTop: Spacing.sm,
  },

  featureItem: {
    ...Typography.body1,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    lineHeight: Typography.lineHeight.lg,
  },

  // Благодарности
  creditsSection: {
    marginBottom: Spacing.md,
  },

  creditsSubtitle: {
    ...Typography.body1,
    color: Colors.text.secondary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },

  creditsItem: {
    ...Typography.body2,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    paddingLeft: Spacing.sm,
  },

  // Контакты
  contactItem: {
    marginBottom: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
  },

  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  contactIcon: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.md,
  },

  contactInfo: {
    flex: 1,
  },

  contactTitle: {
    ...Typography.body1,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },

  contactValue: {
    ...Typography.body1,
    color: Colors.primary,
    fontWeight: '600',
  },

  // Правовая информация
  legalSection: {
    marginBottom: Spacing.lg,
  },

  legalTitle: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },

  legalText: {
    ...Typography.body2,
    color: Colors.text.secondary,
    lineHeight: Typography.lineHeight.lg,
  },

  bottomSpacer: {
    height: Spacing.xl,
  },
});