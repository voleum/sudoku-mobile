# Тестирование на устройствах - Кросс-платформенная игра Судоку

## Статус: ✅ Завершено
**Дата создания**: 2 октября 2025
**Версия документа**: 1.0
**Ответственный**: voleum

---

## 📋 Обзор

Этот документ содержит полное руководство по тестированию приложения на физических устройствах iOS и Android. Тестирование на реальных устройствах критически важно для:

- ✅ Проверки производительности на различном железе
- ✅ Тестирования реального пользовательского опыта
- ✅ Выявления device-specific багов
- ✅ Проверки адаптивной верстки на разных размерах экранов
- ✅ Тестирования сенсорного взаимодействия
- ✅ Проверки корректной работы с различными версиями ОС

---

## 🎯 Device Test Matrix

### iOS Devices

#### Primary Devices (Must Pass) - Обязательные для тестирования

| Устройство | iOS Version | Screen Size | Статус | Примечания |
|-----------|-------------|-------------|--------|------------|
| **iPhone SE (3rd gen)** | iOS 15.0+ | 4.7" (375x667) | ⏳ Pending | Минимальный target, компактный экран |
| **iPhone 12** | iOS 16.0+ | 6.1" (390x844) | ⏳ Pending | Популярная модель, стандартный размер |
| **iPhone 14 Pro** | iOS 17.0+ | 6.1" (393x852) | ⏳ Pending | Флагман, Dynamic Island |
| **iPad (9th gen)** | iPadOS 16.0+ | 10.2" (810x1080) | ⏳ Pending | Планшет, landscape поддержка |

#### Secondary Devices (Should Pass) - Желательные для тестирования

| Устройство | iOS Version | Screen Size | Статус | Примечания |
|-----------|-------------|-------------|--------|------------|
| iPhone XR | iOS 15.0+ | 6.1" (414x896) | ⏳ Pending | Бюджетный сегмент |
| iPhone 13 mini | iOS 16.0+ | 5.4" (375x812) | ⏳ Pending | Компактный размер |
| iPad Air (5th gen) | iPadOS 16.0+ | 10.9" (820x1180) | ⏳ Pending | Premium планшет |

**iOS Version Support:**
- ✅ iOS 15.0+ (Минимальная поддерживаемая версия)
- ✅ iOS 16.0+ (Рекомендуемая)
- ✅ iOS 17.0+ (Последние фичи)

---

### Android Devices

#### Primary Devices (Must Pass) - Обязательные для тестирования

| Устройство | Android Version | API Level | Screen | Статус | Примечания |
|-----------|----------------|-----------|--------|--------|------------|
| **Pixel 4a** | Android 11+ | API 30+ | 5.81" (1080x2340) | ⏳ Pending | Pure Android |
| **Samsung Galaxy S21** | Android 12+ | API 31+ | 6.2" (1080x2400) | ⏳ Pending | Популярный флагман, One UI |
| **OnePlus 9** | Android 11+ | API 30+ | 6.55" (1080x2400) | ⏳ Pending | Альтернативный Android |
| **Samsung Galaxy Tab A8** | Android 12+ | API 31+ | 10.5" (1920x1200) | ⏳ Pending | Планшет |

#### Secondary Devices (Should Pass) - Желательные для тестирования

| Устройство | Android Version | API Level | Screen | Статус | Примечания |
|-----------|----------------|-----------|--------|--------|------------|
| Xiaomi Redmi Note 10 | Android 11+ | API 30+ | 6.43" (1080x2400) | ⏳ Pending | Бюджетный сегмент, MIUI |
| Samsung Galaxy A52 | Android 11+ | API 30+ | 6.5" (1080x2400) | ⏳ Pending | Mid-range |
| Google Pixel 6 | Android 12+ | API 31+ | 6.4" (1080x2400) | ⏳ Pending | Последний Pixel |

**Android Version Support:**
- ✅ API 26 (Android 8.0) - Минимальная поддерживаемая версия
- ✅ API 30 (Android 11) - Target baseline
- ✅ API 31 (Android 12) - Рекомендуемая
- ✅ API 33 (Android 13) - Последняя

**Screen Densities:**
- MDPI (160 dpi) - Low density
- HDPI (240 dpi) - Medium density
- XHDPI (320 dpi) - High density ✅
- XXHDPI (480 dpi) - Extra high density ✅
- XXXHDPI (640 dpi) - Extra extra high density ✅

---

## 🚀 Подготовка устройств

### iOS Device Setup

#### 1. Требования

```bash
# Проверьте версию Xcode
xcodebuild -version
# Требуется Xcode 14.0+

# Проверьте установленные симуляторы
xcrun simctl list devices

# Проверьте доступные provisioning profiles
security find-identity -v -p codesigning
```

#### 2. Настройка физического устройства

**Шаги для подключения физического iPhone/iPad:**

1. **Подключение устройства**
   ```bash
   # Подключите устройство через USB
   # Разрешите доверие компьютеру на устройстве

   # Проверьте подключенные устройства
   xcrun xctrace list devices
   ```

2. **Настройка Developer Account**
   - Откройте Xcode → Preferences → Accounts
   - Добавьте Apple ID (бесплатный или платный Developer account)
   - Автоматическое управление подписью (Automatic Signing)

3. **Provisioning Profile**
   ```bash
   # Xcode автоматически создаст development provisioning profile
   # Проверьте в Xcode → Project → Signing & Capabilities
   ```

4. **Запуск на устройстве**
   ```bash
   # Сборка и установка на подключенное устройство
   cd ios
   pod install
   cd ..

   # Запуск через React Native CLI
   npx react-native run-ios --device "Имя вашего устройства"

   # Или через Xcode
   # Откройте ios/sudoku.xcworkspace
   # Выберите устройство в Xcode
   # Нажмите Run (⌘R)
   ```

#### 3. TestFlight Setup (для бета-тестирования)

```bash
# 1. Создайте архив приложения
cd ios
xcodebuild -workspace sudoku.xcworkspace \
  -scheme sudoku \
  -configuration Release \
  -archivePath ./build/sudoku.xcarchive \
  archive

# 2. Экспорт для App Store
xcodebuild -exportArchive \
  -archivePath ./build/sudoku.xcarchive \
  -exportPath ./build \
  -exportOptionsPlist ExportOptions.plist

# 3. Загрузка в App Store Connect
# Используйте Transporter app или:
xcrun altool --upload-app \
  --type ios \
  --file ./build/sudoku.ipa \
  --username "your@email.com" \
  --password "app-specific-password"
```

**ExportOptions.plist для TestFlight:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>method</key>
    <string>app-store</string>
    <key>uploadSymbols</key>
    <true/>
    <key>uploadBitcode</key>
    <false/>
    <key>compileBitcode</key>
    <false/>
    <key>teamID</key>
    <string>YOUR_TEAM_ID</string>
</dict>
</plist>
```

---

### Android Device Setup

#### 1. Требования

```bash
# Проверьте версию Android SDK
sdkmanager --version

# Проверьте установленные платформы
sdkmanager --list | grep "platforms"

# Проверьте подключенные устройства
adb devices
```

#### 2. Настройка физического устройства

**Шаги для подключения физического Android устройства:**

1. **Включение режима разработчика на устройстве**
   - Настройки → О телефоне → Номер сборки (нажать 7 раз)
   - Появится "Вы стали разработчиком!"

2. **Включение USB отладки**
   - Настройки → Для разработчиков → USB-отладка (включить)
   - Подключите устройство через USB
   - Разрешите отладку по USB на устройстве

3. **Проверка подключения**
   ```bash
   # Проверьте подключенные устройства
   adb devices

   # Должно показать:
   # List of devices attached
   # ABC123456789    device
   ```

4. **Запуск на устройстве**
   ```bash
   # Сборка и установка на подключенное устройство
   cd android
   ./gradlew clean
   cd ..

   # Запуск через React Native CLI
   npx react-native run-android --deviceId=ABC123456789

   # Или используйте:
   npx react-native run-android
   # (автоматически выберет подключенное устройство)
   ```

#### 3. Google Play Internal Testing Setup

**Подготовка релизной сборки для Internal Testing:**

1. **Создание ключа подписи (signing key)**
   ```bash
   # Генерация release keystore (один раз)
   cd android/app
   keytool -genkeypair -v \
     -storetype PKCS12 \
     -keystore sudoku-release.keystore \
     -alias sudoku-key-alias \
     -keyalg RSA \
     -keysize 2048 \
     -validity 10000

   # Сохраните пароли в безопасном месте!
   ```

2. **Настройка gradle.properties**
   ```properties
   # android/gradle.properties
   SUDOKU_RELEASE_STORE_FILE=sudoku-release.keystore
   SUDOKU_RELEASE_KEY_ALIAS=sudoku-key-alias
   SUDOKU_RELEASE_STORE_PASSWORD=ваш_пароль_хранилища
   SUDOKU_RELEASE_KEY_PASSWORD=ваш_пароль_ключа
   ```

3. **Настройка build.gradle**
   ```gradle
   // android/app/build.gradle
   android {
       ...
       signingConfigs {
           release {
               if (project.hasProperty('SUDOKU_RELEASE_STORE_FILE')) {
                   storeFile file(SUDOKU_RELEASE_STORE_FILE)
                   storePassword SUDOKU_RELEASE_STORE_PASSWORD
                   keyAlias SUDOKU_RELEASE_KEY_ALIAS
                   keyPassword SUDOKU_RELEASE_KEY_PASSWORD
               }
           }
       }
       buildTypes {
           release {
               signingConfig signingConfigs.release
               minifyEnabled true
               proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
           }
       }
   }
   ```

4. **Сборка AAB для Play Console**
   ```bash
   # Сборка Android App Bundle
   cd android
   ./gradlew bundleRelease

   # Результат: android/app/build/outputs/bundle/release/app-release.aab
   ```

5. **Загрузка в Google Play Console**
   - Откройте [Google Play Console](https://play.google.com/console)
   - Создайте новое приложение
   - Testing → Internal testing → Create new release
   - Загрузите app-release.aab
   - Добавьте тестеров по email

---

## 🧪 Тестовые сценарии для устройств

### Manual Testing Checklist

#### 1. Запуск и первое впечатление

**iOS:**
- [ ] Холодный запуск < 3 секунд
- [ ] Теплый запуск < 1.5 секунд
- [ ] Splash screen отображается корректно
- [ ] Навигация работает плавно (60 FPS)
- [ ] Иконка приложения отображается корректно
- [ ] Landscape и Portrait режимы работают (для iPad)

**Android:**
- [ ] Холодный запуск < 3 секунд
- [ ] Теплый запуск < 1.5 секунд
- [ ] Splash screen отображается корректно
- [ ] Навигация работает плавно (60 FPS)
- [ ] Иконка приложения отображается корректно
- [ ] Back button работает корректно
- [ ] Разные screen densities поддерживаются

#### 2. Основной геймплей

**Общие тесты:**
- [ ] Создание новой игры для всех уровней сложности
- [ ] Выбор ячейки работает точно (touch accuracy)
- [ ] Ввод чисел через NumberPad работает корректно
- [ ] Конфликты отображаются правильно (красный цвет)
- [ ] Система подсказок работает (Hint button)
- [ ] Очистка ячейки работает (Erase button)
- [ ] Режим заметок (Notes mode) работает
- [ ] Таймер работает корректно
- [ ] Счетчик ходов обновляется

**Тест производительности:**
- [ ] Нет лагов при вводе чисел
- [ ] Нет лагов при переключении экранов
- [ ] Плавная анимация (60 FPS)
- [ ] Отсутствие memory leaks (играть 30+ минут)

#### 3. Сохранение и загрузка

**Общие тесты:**
- [ ] Игра автоматически сохраняется
- [ ] Можно возобновить игру после закрытия приложения
- [ ] Все ходы сохраняются корректно
- [ ] Таймер продолжается с правильного значения
- [ ] Множественные сохраненные игры работают

**iOS специфика:**
- [ ] App переходит в background корректно
- [ ] App возвращается из background с сохраненным состоянием

**Android специфика:**
- [ ] Back button корректно сохраняет игру
- [ ] App переживает process death
- [ ] Rotation сохраняет состояние игры

#### 4. Настройки

**Общие тесты:**
- [ ] Смена темы (светлая/темная/авто) работает
- [ ] Звуковые эффекты включаются/выключаются
- [ ] Вибрация работает (если включена)
- [ ] Настройки сохраняются после перезапуска
- [ ] Язык меняется корректно (рус/eng)

**iOS специфика:**
- [ ] Автоматическая тема следует системным настройкам
- [ ] Haptic feedback работает (если поддерживается)

**Android специфика:**
- [ ] Автоматическая тема следует системным настройкам
- [ ] Вибрация работает на разных устройствах

#### 5. Статистика

**Общие тесты:**
- [ ] Статистика обновляется после завершения игры
- [ ] Графики отображаются корректно
- [ ] Достижения разблокируются
- [ ] История игр сохраняется

#### 6. Адаптивность и доступность

**Screen Sizes:**
- [ ] Маленькие экраны (iPhone SE, 4.7")
- [ ] Стандартные экраны (iPhone 12, 6.1")
- [ ] Большие экраны (iPhone 14 Pro Max, 6.7")
- [ ] Планшеты (iPad, 10.2"+)

**Accessibility:**
- [ ] VoiceOver работает (iOS)
- [ ] TalkBack работает (Android)
- [ ] Контрастность цветов достаточная
- [ ] Размер текста регулируется
- [ ] Touch targets ≥ 44x44 pt

#### 7. Граничные случаи

**Общие тесты:**
- [ ] Низкий заряд батареи
- [ ] Низкий объем памяти
- [ ] Отсутствие свободного места для сохранения
- [ ] Множественные быстрые нажатия (button spam)
- [ ] Быстрое переключение между экранами
- [ ] Работа в режиме энергосбережения

**iOS специфика:**
- [ ] Low Power Mode
- [ ] Call interruption (входящий звонок)
- [ ] Notification interruption

**Android специфика:**
- [ ] Battery Saver mode
- [ ] Process death и restoration
- [ ] Different OEM skins (Samsung One UI, MIUI, etc.)

---

## 📊 Device Test Report Template

### Test Session Report

**Дата тестирования**: _________________
**Тестировщик**: _________________
**Версия приложения**: _________________

#### Device Information

**Platform**: ☐ iOS ☐ Android
**Устройство**: _________________
**OS Version**: _________________
**Screen Size**: _________________
**Build Type**: ☐ Debug ☐ Release

#### Test Results

| Тестовый сценарий | Статус | Комментарии |
|------------------|--------|-------------|
| Запуск приложения | ☐ Pass ☐ Fail |  |
| Создание новой игры | ☐ Pass ☐ Fail |  |
| Игровой процесс | ☐ Pass ☐ Fail |  |
| Сохранение/загрузка | ☐ Pass ☐ Fail |  |
| Настройки | ☐ Pass ☐ Fail |  |
| Статистика | ☐ Pass ☐ Fail |  |
| Производительность | ☐ Pass ☐ Fail |  |
| Accessibility | ☐ Pass ☐ Fail |  |

#### Performance Metrics

| Метрика | Значение | Target | Статус |
|---------|----------|--------|--------|
| Cold Start Time | ___ ms | < 3000 ms | ☐ Pass ☐ Fail |
| Warm Start Time | ___ ms | < 1500 ms | ☐ Pass ☐ Fail |
| Average Frame Rate | ___ FPS | > 55 FPS | ☐ Pass ☐ Fail |
| Memory Usage | ___ MB | < 100 MB | ☐ Pass ☐ Fail |

#### Bugs Found

| Баг ID | Severity | Описание | Steps to Reproduce |
|--------|----------|----------|-------------------|
|        |          |          |                   |

**Severity Levels:**
- **Critical**: Приложение крашится или не запускается
- **High**: Основная функциональность не работает
- **Medium**: Второстепенная функциональность не работает
- **Low**: Косметические проблемы, опечатки

#### Overall Assessment

**Готовность к релизу**: ☐ Ready ☐ Not Ready
**Комментарии**:

---

## 🔧 Troubleshooting

### iOS Common Issues

**Проблема: "Untrusted Developer"**
```
Решение:
1. Settings → General → VPN & Device Management
2. Найдите ваш developer profile
3. Tap "Trust"
```

**Проблема: Code signing error**
```bash
# Очистите кеш подписи
rm -rf ~/Library/Developer/Xcode/DerivedData
cd ios
pod deintegrate
pod install
```

**Проблема: Device not detected**
```bash
# Перезапустите службы
sudo killall -STOP -c usbd
sudo killall -CONT usbd

# Проверьте подключение
xcrun xctrace list devices
```

### Android Common Issues

**Проблема: Device unauthorized**
```bash
# Отзовите все USB debugging авторизации
adb kill-server
adb start-server
adb devices

# Разрешите отладку на устройстве заново
```

**Проблема: INSTALL_FAILED_INSUFFICIENT_STORAGE**
```bash
# Очистите кеш приложения на устройстве
adb shell pm clear com.sudoku

# Удалите старую версию
adb uninstall com.sudoku

# Установите заново
npx react-native run-android
```

**Проблема: Gradle build fails**
```bash
# Очистите gradle cache
cd android
./gradlew clean
./gradlew cleanBuildCache

# Invalidate caches
rm -rf ~/.gradle/caches
```

---

## 📦 NPM Scripts для тестирования на устройствах

Добавьте в `package.json`:

```json
{
  "scripts": {
    "ios:device": "npx react-native run-ios --device",
    "android:device": "npx react-native run-android",
    "ios:release": "npx react-native run-ios --configuration Release --device",
    "android:release": "cd android && ./gradlew assembleRelease && cd ..",
    "android:bundle": "cd android && ./gradlew bundleRelease && cd ..",
    "device:list": "xcrun xctrace list devices && echo '\n--- Android Devices ---\n' && adb devices"
  }
}
```

**Использование:**

```bash
# Список подключенных устройств
npm run device:list

# Запуск на iOS устройстве (debug)
npm run ios:device

# Запуск на Android устройстве (debug)
npm run android:device

# Запуск на iOS устройстве (release)
npm run ios:release

# Сборка Android APK (release)
npm run android:release

# Сборка Android AAB для Play Store
npm run android:bundle
```

---

## 📱 Beta Testing

### TestFlight (iOS)

**Подготовка:**

1. **App Store Connect Setup**
   - Создайте приложение в App Store Connect
   - Заполните App Information
   - Добавьте скриншоты и описание

2. **TestFlight Internal Testing**
   - Добавьте internal testers (до 100 человек)
   - Загрузите build через Xcode или Transporter
   - Отправьте приглашения тестерам

3. **TestFlight External Testing**
   - Создайте external testing группу
   - Добавьте external testers (до 10,000 человек)
   - Пройдите Beta App Review
   - Отправьте приглашения

**Инструкции для тестеров:**

```markdown
# Как стать TestFlight тестером

1. Установите приложение TestFlight из App Store
2. Откройте пригласительную ссылку или введите код приглашения
3. Примите приглашение в TestFlight
4. Установите приложение Sudoku
5. Тестируйте и отправляйте feedback через TestFlight
```

### Google Play Internal Testing (Android)

**Подготовка:**

1. **Google Play Console Setup**
   - Создайте приложение в Google Play Console
   - Заполните Store Listing
   - Добавьте скриншоты и описание

2. **Internal Testing Track**
   - Testing → Internal testing
   - Create new release
   - Загрузите AAB файл
   - Добавьте release notes
   - Добавьте email тестеров

3. **Распространение**
   - Скопируйте ссылку для тестеров
   - Отправьте email приглашения

**Инструкции для тестеров:**

```markdown
# Как стать Internal тестером

1. Откройте пригласительную ссылку на Android устройстве
2. Нажмите "Accept invitation"
3. Откройте Google Play Store
4. Найдите приложение Sudoku
5. Установите приложение
6. Тестируйте и оставляйте feedback
```

---

## ✅ Критерии готовности (Definition of Done)

Задача "Тестирование на устройствах" считается завершенной, когда:

**Документация:**
- [x] DEVICE_TESTING.md создан и заполнен
- [x] Device Test Matrix заполнена
- [x] Manual testing checklists созданы
- [x] Test report templates готовы
- [x] NPM scripts для device testing добавлены

**iOS:**
- [ ] Протестировано на минимум 3 physical devices из Primary list
- [ ] Все критичные тесты пройдены (Pass)
- [ ] TestFlight setup готов для beta testing
- [ ] Документация для TestFlight тестеров готова

**Android:**
- [ ] Протестировано на минимум 3 physical devices из Primary list
- [ ] Все критичные тесты пройдены (Pass)
- [ ] Google Play Internal Testing setup готов
- [ ] Документация для Internal тестеров готова

**Performance:**
- [ ] App launch time < 3s на всех устройствах
- [ ] Frame rate > 55 FPS на всех устройствах
- [ ] Memory usage < 100 MB на всех устройствах
- [ ] Нет memory leaks (30+ минут игры)

**Quality:**
- [ ] 0 critical bugs
- [ ] < 2 major bugs
- [ ] Test reports заполнены для каждого устройства
- [ ] Все найденные баги задокументированы

**Release Readiness:**
- [ ] Приложение готово к beta testing
- [ ] Release builds успешно создаются (iOS и Android)
- [ ] Signing и provisioning настроены
- [ ] Все scripts работают корректно

---

## 📚 Дополнительные ресурсы

### iOS Resources
- [Apple Developer Documentation - Testing](https://developer.apple.com/documentation/xcode/testing-your-apps-in-xcode)
- [TestFlight Guide](https://developer.apple.com/testflight/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)

### Android Resources
- [Android Developer - Test on a hardware device](https://developer.android.com/studio/run/device)
- [Google Play Console Help - Internal testing](https://support.google.com/googleplay/android-developer/answer/9303479)
- [Android App Bundle Guide](https://developer.android.com/guide/app-bundle)

### React Native Resources
- [React Native - Running on Device](https://reactnative.dev/docs/running-on-device)
- [React Native - Publishing to App Store](https://reactnative.dev/docs/publishing-to-app-store)
- [React Native - Signed APK Android](https://reactnative.dev/docs/signed-apk-android)

---

**Версия документа**: 1.0
**Последнее обновление**: 2 октября 2025
**Статус**: ✅ Завершено и готово к использованию
