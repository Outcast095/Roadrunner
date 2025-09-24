# SCSS Styles

Этот каталог содержит стили игры, написанные на SCSS.

## Структура

- `globals/` - Глобальные стили и переменные
  - `_variables.scss` - SCSS переменные
  - `_mixins.scss` - SCSS миксины
  - `_reset.scss` - CSS reset
  - `_typography.scss` - Типографика
- `components/` - Стили компонентов
- `themes/` - Темы (dark, light)
- `layouts/` - Стили макетов
- `utilities/` - Utility классы

## Принципы

- BEM methodology для именования классов
- SCSS переменные для цветов и размеров
- Responsive design (mobile-first)
- CSS Custom Properties для theme switching
- Performance: критические стили inline
- Accessibility: высокий контраст, focus states
