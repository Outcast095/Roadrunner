# Zustand Stores

Этот каталог содержит stores для управления состоянием игры.

## Структура

- `gameStore.ts` - Основное состояние игры
- `settingsStore.ts` - Настройки игры
- `playerStore.ts` - Статистика игрока
- `vehicleStore.ts` - Состояние автомобиля
- `worldStore.ts` - Состояние игрового мира

## Принципы

- Разделение ответственности между stores
- Persist для настроек и статистики
- Type-safe селекторы и actions
- Middleware для логирования и debugging
- Performance: shallow равенство для подписок
