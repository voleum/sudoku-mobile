import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { Card } from '../../components/common/Card';
import { AppLogo } from '../../components/about';
import { Colors } from '../../styles/colors';
import { Typography } from '../../styles/typography';
import { Spacing } from '../../styles/spacing';
import { getAppInfo, getContactInfo, getTechnologyInfo, getVersionString } from '../../../utils/appInfo';

export const AboutScreen: React.FC = () => {
  // TODO: Интеграция с i18n системой согласно 2.1.6-internationalization-planning.md
  // После установки react-i18next заменить захардкоженные строки на переводы
  // const { t } = useTranslation('about');

  // Реальные данные приложения из package.json согласно системному анализу
  const appInfo = getAppInfo();
  const contactInfo = getContactInfo();
  const technologies = getTechnologyInfo();

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

  // Обработчик оценки приложения
  const handleRateApp = () => {
    Alert.alert(
      'Оценить приложение',
      'Нравится наша игра? Поставьте оценку в магазине приложений!',
      [
        { text: 'Позже', style: 'cancel' },
        {
          text: 'Оценить',
          onPress: () => {
            // URL для магазинов приложений (будет заменен при публикации)
            const storeUrl = Platform.select({
              ios: 'https://apps.apple.com/app/id123456789', // Заменить на реальный App Store ID
              android: 'https://play.google.com/store/apps/details?id=com.sudokugame', // Заменить на реальный package ID
            });
            if (storeUrl) {
              handleLinkPress(storeUrl, 'магазин приложений');
            }
          }
        }
      ]
    );
  };

  // Обработчик обратной связи
  const handleFeedback = () => {
    Alert.alert(
      'Обратная связь',
      'Выберите способ связи с нами:',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => handleLinkPress(`mailto:${contactInfo.email}?subject=Судоку - Обратная связь`, 'email')
        },
        {
          text: 'GitHub Issues',
          onPress: () => handleLinkPress(`${contactInfo.github}/issues`, 'GitHub Issues')
        }
      ]
    );
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
            <AppLogo
              version={appInfo.version}
              size="large"
              testID="about-app-logo"
            />
            <View style={styles.appTitleContainer}>
              <Text style={styles.appTitle}>{appInfo.displayName}</Text>
              <Text style={styles.appSubtitle}>Логическая головоломка</Text>
            </View>
          </View>

          <Text style={styles.appDescription}>
            {appInfo.description}
          </Text>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Версия:</Text>
              <Text style={styles.infoValue}>{getVersionString()}</Text>
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
            {technologies.map((tech, index) => (
              <Text key={index} style={styles.creditsItem}>• {tech}</Text>
            ))}
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

        {/* Действия пользователя */}
        <Card
          style={styles.card}
          testID="actions-card"
          accessibilityLabel="Действия пользователя: оценка приложения и обратная связь"
        >
          <Text style={styles.sectionTitle}>👍 Помогите проекту</Text>

          <Card
            pressable
            onPress={handleRateApp}
            style={styles.actionItem}
            testID="rate-app-button"
            accessibilityRole="button"
            accessibilityLabel="Оценить приложение в магазине приложений"
          >
            <View style={styles.actionRow}>
              <Text style={styles.actionIcon}>⭐</Text>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Оценить приложение</Text>
                <Text style={styles.actionDescription}>
                  Поставьте оценку в магазине приложений
                </Text>
              </View>
            </View>
          </Card>

          <Card
            pressable
            onPress={handleFeedback}
            style={styles.actionItem}
            testID="feedback-button"
            accessibilityRole="button"
            accessibilityLabel="Отправить обратную связь разработчикам"
          >
            <View style={styles.actionRow}>
              <Text style={styles.actionIcon}>💬</Text>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Обратная связь</Text>
                <Text style={styles.actionDescription}>
                  Отправьте отзыв или сообщите об ошибке
                </Text>
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

  // Действия пользователя
  actionItem: {
    marginBottom: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    minHeight: 44, // Минимальная высота для touch target (iOS requirement)
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  actionIcon: {
    fontSize: Typography.fontSize.xl,
    marginRight: Spacing.md,
  },

  actionInfo: {
    flex: 1,
  },

  actionTitle: {
    ...Typography.body1,
    color: Colors.text.primary,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },

  actionDescription: {
    ...Typography.body2,
    color: Colors.text.secondary,
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