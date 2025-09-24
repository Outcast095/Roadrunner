# 🎮 3D Development ESLint Rules

## 📋 Обзор

Специальные ESLint правила для 3D разработки, оптимизированные для WebGL, Three.js и игровых движков. Основаны на Context7 best practices для максимальной производительности и предотвращения утечек памяти.

## 🔧 Установленные правила

### 🧠 Управление памятью

#### `three-js/dispose-geometry`
**Уровень:** `warn` (общий), `error` (3D файлы)  
**Описание:** Предупреждает о необходимости освобождения геометрии THREE.js  
**Пример:**
```javascript
// ❌ Плохо - утечка памяти
const geometry = new THREE.SphereGeometry(1, 32, 32);
const mesh = new THREE.Mesh(geometry, material);

// ✅ Хорошо - с освобождением памяти
const geometry = new THREE.SphereGeometry(1, 32, 32);
const mesh = new THREE.Mesh(geometry, material);
// ... использование
geometry.dispose(); // Освобождение памяти
```

#### `three-js/dispose-materials`
**Уровень:** `warn` (общий), `error` (3D файлы)  
**Описание:** Предупреждает о необходимости освобождения материалов THREE.js  
**Пример:**
```javascript
// ❌ Плохо - утечка памяти
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material);

// ✅ Хорошо - с освобождением памяти
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const mesh = new THREE.Mesh(geometry, material);
// ... использование
material.dispose(); // Освобождение памяти
```

#### `three-js/dispose-textures`
**Уровень:** `warn` (общий), `error` (3D файлы)  
**Описание:** Предупреждает о необходимости освобождения текстур THREE.js  
**Пример:**
```javascript
// ❌ Плохо - утечка памяти
const texture = new THREE.TextureLoader().load('texture.jpg');
const material = new THREE.MeshBasicMaterial({ map: texture });

// ✅ Хорошо - с освобождением памяти
const texture = new THREE.TextureLoader().load('texture.jpg');
const material = new THREE.MeshBasicMaterial({ map: texture });
// ... использование
texture.dispose(); // Освобождение памяти
material.dispose();
```

#### `three-js/use-resource-tracker`
**Уровень:** `warn` (общий), `error` (3D файлы)  
**Описание:** Рекомендует использовать ResourceTracker для автоматического управления ресурсами  
**Пример:**
```javascript
// ✅ Хорошо - с ResourceTracker
class ResourceTracker {
  constructor() {
    this.resources = new Set();
  }
  track(resource) {
    if (resource.dispose || resource instanceof THREE.Object3D) {
      this.resources.add(resource);
    }
    return resource;
  }
  dispose() {
    for (const resource of this.resources) {
      if (resource.dispose) resource.dispose();
    }
    this.resources.clear();
  }
}

const resourceTracker = new ResourceTracker();
const geometry = resourceTracker.track(new THREE.SphereGeometry(1, 32, 32));
const material = resourceTracker.track(new THREE.MeshBasicMaterial({ color: 0xff0000 }));
```

### ⚡ Оптимизация производительности

#### `three-js/avoid-inline-shaders`
**Уровень:** `warn`  
**Описание:** Предупреждает об использовании встроенных шейдеров  
**Пример:**
```javascript
// ❌ Плохо - встроенные шейдеры
const material = new THREE.ShaderMaterial({
  vertexShader: `
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    void main() {
      gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    }
  `
});

// ✅ Хорошо - внешние шейдеры
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';

const material = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader
});
```

#### `three-js/optimize-geometry-creation`
**Уровень:** `warn`  
**Описание:** Предупреждает о создании геометрии с высокой детализацией  
**Пример:**
```javascript
// ❌ Плохо - слишком высокая детализация
const geometry = new THREE.SphereGeometry(1, 128, 128); // 128x128 = 16,384 треугольников

// ✅ Хорошо - разумная детализация + LOD
const geometry = new THREE.SphereGeometry(1, 32, 32); // 32x32 = 1,024 треугольника
// Используйте LOD для дальних объектов
```

#### `three-js/use-request-animation-frame`
**Уровень:** `error`  
**Описание:** Требует использования requestAnimationFrame для анимаций  
**Пример:**
```javascript
// ❌ Плохо - setInterval может вызывать пропуски кадров
setInterval(render, 1000 / 60); // 60 FPS

// ✅ Хорошо - requestAnimationFrame обеспечивает плавную анимацию
function animate() {
  requestAnimationFrame(animate);
  render();
}
animate();
```

#### `three-js/optimize-render-loop`
**Уровень:** `warn`  
**Описание:** Рекомендует мониторинг производительности в рендер-циклах  
**Пример:**
```javascript
// ✅ Хорошо - с мониторингом производительности
function render() {
  renderer.render(scene, camera);
  
  // Мониторинг производительности
  if (renderer.info) {
    console.log('Draw calls:', renderer.info.render.calls);
    console.log('Triangles:', renderer.info.render.triangles);
    console.log('Textures:', renderer.info.memory.textures);
  }
}
```

### 🌐 WebGL Best Practices

#### `webgl/check-context-loss`
**Уровень:** `warn` (общий), `error` (3D файлы)  
**Описание:** Требует обработки потери WebGL контекста  
**Пример:**
```javascript
// ✅ Хорошо - с обработкой потери контекста
const canvas = document.getElementById('canvas');
const gl = canvas.getContext('webgl');

canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault();
  console.log('WebGL context lost');
  // Сохранить состояние для восстановления
});

canvas.addEventListener('webglcontextrestored', () => {
  console.log('WebGL context restored');
  // Восстановить WebGL ресурсы
  initWebGL();
});
```

#### `webgl/check-extension-support`
**Уровень:** `warn` (общий), `error` (3D файлы)  
**Описание:** Требует проверки поддержки WebGL расширений  
**Пример:**
```javascript
// ❌ Плохо - без проверки поддержки
const extension = gl.getExtension('WEBGL_debug_renderer_info');

// ✅ Хорошо - с проверкой поддержки
const extension = gl.getExtension('WEBGL_debug_renderer_info');
if (!extension) {
  console.warn('WEBGL_debug_renderer_info extension not supported');
  return;
}
```

### 🎨 Разработка шейдеров

#### `three-js/validate-shader-syntax`
**Уровень:** `warn`  
**Описание:** Рекомендует валидацию синтаксиса шейдеров  
**Пример:**
```glsl
// ✅ Хорошо - с правильными precision qualifiers
// Vertex shader
precision highp float;
attribute vec3 position;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}

// Fragment shader
precision mediump float;
uniform vec3 color;

void main() {
  gl_FragColor = vec4(color, 1.0);
}
```

## 📁 Конфигурация файлов

### 3D файлы (строгие правила)
```javascript
// Файлы: **/*3d*.{js,jsx,ts,tsx}, **/*webgl*.{js,jsx,ts,tsx}, **/*three*.{js,jsx,ts,tsx}
// **/shaders/**/*, **/scenes/**/*
{
  'three-js/dispose-geometry': 'error',
  'three-js/dispose-materials': 'error',
  'three-js/dispose-textures': 'error',
  'three-js/use-resource-tracker': 'error',
  'webgl/check-context-loss': 'error',
  'webgl/check-extension-support': 'error'
}
```

### Тестовые файлы (отключены)
```javascript
// Файлы: **/*.test.{js,jsx,ts,tsx}, **/*.spec.{js,jsx,ts,tsx}
{
  'three-js/dispose-geometry': 'off',
  'three-js/dispose-materials': 'off',
  'three-js/dispose-textures': 'off'
}
```

## 🚀 Использование

### Автоматическое исправление
```bash
# Исправить автоматически исправляемые правила
npx eslint --fix src/

# Проверить только 3D файлы
npx eslint --fix "src/**/*3d*" "src/**/*webgl*" "src/**/*three*"
```

### Игнорирование правил
```javascript
// Временно отключить правило
/* eslint-disable three-js/dispose-geometry */
const geometry = new THREE.SphereGeometry(1, 32, 32);
/* eslint-enable three-js/dispose-geometry */

// Отключить для конкретной строки
const geometry = new THREE.SphereGeometry(1, 32, 32); // eslint-disable-line three-js/dispose-geometry
```

## 📊 Метрики производительности

### Рекомендуемые показатели
- **Draw calls:** < 100 для мобильных, < 500 для десктопа
- **Triangles:** < 100K для мобильных, < 1M для десктопа
- **Textures:** < 50 для мобильных, < 200 для десктопа
- **FPS:** 60 FPS стабильно

### Мониторинг
```javascript
// В рендер-цикле
if (renderer.info) {
  const info = renderer.info;
  console.log({
    drawCalls: info.render.calls,
    triangles: info.render.triangles,
    textures: info.memory.textures,
    geometries: info.memory.geometries,
    materials: info.memory.materials
  });
}
```

## 🔗 Полезные ссылки

- [Three.js Memory Management](https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects)
- [WebGL Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
- [Context7 3D Development](https://context7.io/)
- [Deck.gl Performance Guide](https://deck.gl/docs/developer-guide/performance)

## 🐛 Решение проблем

### Частые ошибки
1. **Memory leaks:** Всегда вызывайте `dispose()` для геометрии, материалов и текстур
2. **Context loss:** Добавьте обработчики событий `webglcontextlost` и `webglcontextrestored`
3. **Performance issues:** Используйте `requestAnimationFrame` вместо `setInterval`
4. **Shader errors:** Проверяйте precision qualifiers и синтаксис GLSL

### Отладка
```javascript
// Включить отладочную информацию
renderer.debug = {
  onError: (error, info) => {
    console.error('WebGL Error:', error, info);
  }
};
```
