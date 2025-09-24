# 🧪 Тестирование Roadrunner

Автоматизированное тестирование 3D игры Roadrunner с использованием Playwright.

## 📁 Структура тестов

```
tests/
├── e2e/                 # End-to-end тесты
│   ├── app.spec.ts     # Базовые тесты приложения
│   └── game-3d.spec.ts # Тесты 3D движка и игры
├── fixtures/           # Тестовые данные
│   └── test-data.ts    # Константы и фабрики данных
├── utils/              # Утилиты для тестирования
│   └── gameHelpers.ts  # Хелперы для 3D игры
└── README.md           # Эта документация
```

## 🚀 Запуск тестов

### Основные команды:

```bash
# Установка браузеров
npm run test:install

# Запуск всех тестов
npm test

# Запуск с UI интерфейсом
npm run test:ui

# Запуск в headed режиме (видно браузер)
npm run test:headed

# Отладка тестов
npm run test:debug

# Просмотр отчета
npm run test:report
```

### Запуск конкретных тестов:

```bash
# Только базовые тесты приложения
npx playwright test app.spec.ts

# Только тесты 3D движка
npx playwright test game-3d.spec.ts

# Запуск в конкретном браузере
npx playwright test --project=chromium

# Запуск с фильтром
npx playwright test --grep "WebGL"
```

## 🎯 Что тестируется

### 1. Базовая функциональность (`app.spec.ts`)
- ✅ Загрузка главной страницы
- ✅ Поддержка WebGL
- ✅ Загрузка React без ошибок
- ✅ Адаптивный дизайн
- ✅ Загрузка CSS стилей
- ✅ Обработка обновления страницы
- ✅ Базовые проверки доступности

### 2. 3D Движок (`game-3d.spec.ts`)
- ✅ Инициализация Babylon.js и Ammo.js
- ✅ Создание 3D сцены
- ✅ Производительность (FPS)
- ✅ Обработка управления (WASD, мышь)
- ✅ Загрузка текстур
- ✅ Обработка изменения размера окна
- ✅ Восстановление после ошибок
- ✅ Время загрузки
- ✅ Кросс-браузерная совместимость

## 🛠 Кастомные утилиты

### GameTestHelpers
Класс с методами для тестирования 3D игры:

```typescript
const gameHelpers = new GameTestHelpers(page);

// Ожидание загрузки движков
await gameHelpers.waitForEngineLoad();
await gameHelpers.waitForPhysicsLoad();
await gameHelpers.waitForSceneReady();

// Проверка производительности
const fps = await gameHelpers.checkPerformance();

// Симуляция управления
await gameHelpers.pressMovementKey('w', 200);
await gameHelpers.moveMouse(50, 30);

// Проверки WebGL
await gameHelpers.checkWebGLErrors();

// Скриншоты
await gameHelpers.takeGameScreenshot('test-name');
```

### Фикстуры и данные
```typescript
import { TEST_VIEWPORTS, GAME_CONTROLS, TestDataFactory } from '../fixtures/test-data';

// Использование готовых данных
const viewport = TEST_VIEWPORTS.desktop;
const controls = GAME_CONTROLS.movement;

// Генерация тестовых данных
const movements = TestDataFactory.createMouseMovements(10);
const sequence = TestDataFactory.createRandomKeySequence(5000);
```

## 📊 Метрики и требования

### Производительность:
- **Desktop**: минимум 30 FPS
- **Laptop**: минимум 25 FPS  
- **Tablet**: минимум 20 FPS
- **Mobile**: минимум 15 FPS

### Время загрузки:
- **Desktop**: максимум 10 секунд
- **Laptop**: максимум 12 секунд
- **Tablet**: максимум 15 секунд
- **Mobile**: максимум 20 секунд

### WebGL требования:
- Поддержка WebGL 1.0+
- Минимальный размер текстуры: 1024px
- Обязательные расширения для оптимальной работы

## 🎛 Конфигурация

Основные настройки в `playwright.config.ts`:

- **Timeout**: 60 секунд для 3D сцен
- **Retries**: 2 попытки в CI, 1 локально
- **Браузеры**: Chromium, Firefox, WebKit
- **Viewport**: 1920x1080 для desktop тестов
- **WebGL флаги**: включены для всех браузеров

## 📝 Отчеты

После запуска тестов доступны:

- **HTML отчет**: `playwright-report/index.html`
- **JSON отчет**: `test-results/results.json`
- **JUnit отчет**: `test-results/results.xml`
- **Скриншоты**: `test-results/`
- **Видео**: только при падении тестов

## 🐛 Отладка

### Локальная отладка:
```bash
# Запуск с отладчиком
npm run test:debug

# Просмотр в браузере
npm run test:headed

# Конкретный тест
npx playwright test game-3d.spec.ts --debug
```

### CI/CD отладка:
```bash
# Трейсинг включен автоматически
npx playwright show-trace trace.zip
```

## 🔧 Проблемы и решения

### WebGL не поддерживается
- Проверить флаги браузера в конфигурации
- Убедиться, что графические драйверы обновлены
- Использовать `--disable-gpu-sandbox` для Docker

### Медленные тесты
- Увеличить timeout в конфигурации
- Проверить производительность хост-системы
- Использовать `--workers=1` для последовательного запуска

### Нестабильные тесты
- Добавить больше `waitForTimeout`
- Проверить условия ожидания
- Использовать `page.waitForFunction` вместо фиксированных таймаутов

## 📚 Дополнительные ресурсы

- [Playwright документация](https://playwright.dev/)
- [Babylon.js тестирование](https://doc.babylonjs.com/)
- [WebGL отладка](https://webglfundamentals.org/webgl/lessons/webgl-debugging.html)
