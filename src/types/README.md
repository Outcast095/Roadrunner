# 📝 TypeScript Types Documentation

## 🎯 Обзор

Этот каталог содержит все TypeScript типы для проекта Roadrunner, организованные согласно Context7 best practices для максимальной типобезопасности и удобства разработки.

## 📁 Структура файлов

```
src/types/
├── index.ts              # Главный файл экспорта всех типов
├── game.ts               # Основные игровые типы
├── react-extensions.d.ts # React компоненты и хуки
├── vite-env.d.ts         # Vite окружение и ассеты
└── README.md            # Эта документация
```

## 🔧 Конфигурация TypeScript

### tsconfig.app.json
Настроен с современными опциями Context7:
- **Strict Mode**: Включены все строгие проверки
- **Path Mapping**: Настроены алиасы для удобного импорта
- **Modern Target**: ES2022 для современных возможностей
- **Bundler Mode**: Оптимизирован для Vite

### Ключевые настройки:
```json
{
  "strict": true,
  "strictNullChecks": true,
  "noImplicitAny": true,
  "exactOptionalPropertyTypes": true,
  "noUncheckedIndexedAccess": true
}
```

## 🎮 Игровые типы (game.ts)

### Основные интерфейсы:
- `GameState` - состояние игры
- `PlayerStats` - статистика игрока
- `GameSettings` - настройки игры
- `VehicleState` - состояние автомобиля
- `WorldState` - состояние мира

### Системы:
- **Ввод**: `InputState`, `KeyboardState`, `MouseState`
- **События**: `GameEvent`, `BarrelCollectedEvent`
- **Производительность**: `PerformanceMetrics`, `DebugInfo`
- **Ошибки**: `GameError`, `GameErrorType`

## ⚛️ React типы (react-extensions.d.ts)

### Компоненты:
- `BaseGameComponentProps` - базовые пропсы
- `GameUIProps` - UI компоненты
- `HUDProps` - HUD элементы
- `ButtonProps`, `InputProps` - контролы

### Хуки:
- `UseGameStateReturn` - управление состоянием
- `UsePlayerStatsReturn` - статистика игрока
- `UseSettingsReturn` - настройки
- `UseInputReturn` - ввод
- `UsePerformanceReturn` - производительность

### Контексты:
- `GameContextValue` - игровой контекст
- `SettingsContextValue` - настройки
- `InputContextValue` - ввод

## 🌐 Vite типы (vite-env.d.ts)

### Ассеты:
- **Изображения**: `*.png`, `*.jpg`, `*.svg`
- **Аудио**: `*.mp3`, `*.wav`, `*.ogg`
- **3D модели**: `*.glb`, `*.gltf`, `*.obj`
- **Шейдеры**: `*.vert`, `*.frag`, `*.glsl`
- **Стили**: `*.css`, `*.scss`, `*.sass`

### Web API:
- **Performance API** - метрики производительности
- **WebGL** - графические расширения
- **Web Audio** - аудио API
- **Gamepad** - геймпад API
- **WebXR** - VR/AR поддержка

## 🚀 Использование

### Импорт типов:
```typescript
// Импорт конкретных типов
import type { GameState, PlayerStats } from '@/types';

// Импорт всех типов
import type * as GameTypes from '@/types';

// Импорт через алиасы
import type { GameState } from '@/types/game';
import type { ButtonProps } from '@/types/react-extensions';
```

### Path Mapping:
```typescript
// Вместо относительных путей
import { GameState } from '../../../types/game';

// Используйте алиасы
import { GameState } from '@/types/game';
import { ButtonProps } from '@/types/react-extensions';
```

### Создание компонентов:
```typescript
import type { GameUIProps, HUDProps } from '@/types';

interface MyHUDProps extends HUDProps {
  customProp?: string;
}

const MyHUD: React.FC<MyHUDProps> = ({ gameState, ...props }) => {
  // Компонент с полной типобезопасностью
};
```

## 🔍 TypeScript утилиты

### Встроенные утилиты:
```typescript
// Извлечение типов компонентов
type MyComponentProps = ComponentProps<typeof MyComponent>;

// Извлечение ref типов
type MyComponentRef = ComponentRef<typeof MyComponent>;

// Контролируемые компоненты
type ValueType = ControlledValue<InputProps>;
type ChangeHandler = ControlledChangeHandler<InputProps>;
```

### Кастомные утилиты:
```typescript
// Частичные типы с исключениями
type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

// Обязательные типы с исключениями
type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;
```

## 🎯 Best Practices

### 1. Используйте строгие типы:
```typescript
// ❌ Плохо
function updateScore(score: any) { }

// ✅ Хорошо
function updateScore(score: number) { }
```

### 2. Используйте утилиты типов:
```typescript
// ❌ Плохо
interface Props {
  value?: string;
  onChange?: (value: string) => void;
}

// ✅ Хорошо
interface Props extends ControlledProps<string> {
  // Дополнительные пропсы
}
```

### 3. Используйте дженерики:
```typescript
// ✅ Гибкие типы
interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}
```

### 4. Используйте branded types:
```typescript
// ✅ Типобезопасные ID
type UserId = Brand<string, 'UserId'>;
type ProductId = Brand<string, 'ProductId'>;
```

## 🔧 Отладка типов

### Проверка типов:
```bash
# Проверка без компиляции
npx tsc --noEmit

# Проверка конкретного файла
npx tsc --noEmit src/components/MyComponent.tsx
```

### IDE поддержка:
- **VS Code**: Автодополнение, навигация, рефакторинг
- **WebStorm**: Полная поддержка TypeScript
- **Vim/Neovim**: LSP с tsserver

## 📚 Дополнительные ресурсы

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [Vite TypeScript Guide](https://vitejs.dev/guide/features.html#typescript)
- [Context7 TypeScript Best Practices](https://context7.io/)

## 🐛 Решение проблем

### Частые ошибки:
1. **Module not found**: Проверьте path mapping в tsconfig.json
2. **Type not found**: Убедитесь что тип экспортирован в index.ts
3. **Strict mode errors**: Используйте правильные типы вместо `any`

### Отладка:
```typescript
// Проверка типа во время выполнения
console.log(typeof myVariable);

// TypeScript утилиты для отладки
type DebugType<T> = T extends infer U ? U : never;
```
