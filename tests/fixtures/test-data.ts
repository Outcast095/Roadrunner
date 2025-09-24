/**
 * Тестовые данные и фикстуры для Roadrunner игры
 */

export const TEST_VIEWPORTS = {
  desktop: { width: 1920, height: 1080 },
  laptop: { width: 1366, height: 768 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 375, height: 667 },
} as const;

export const GAME_CONTROLS = {
  movement: {
    forward: 'w',
    backward: 's',
    left: 'a',
    right: 'd',
  },
  camera: {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
  },
  game: {
    pause: 'Escape',
    brake: 'Space',
  },
} as const;

export const PERFORMANCE_THRESHOLDS = {
  minFPS: {
    desktop: 30,
    laptop: 25,
    tablet: 20,
    mobile: 15,
  },
  maxLoadTime: {
    desktop: 10000,
    laptop: 12000,
    tablet: 15000,
    mobile: 20000,
  },
  webglSupport: {
    required: true,
    minTextureSize: 1024,
  },
} as const;

export const TEST_SCENARIOS = {
  shortDrive: {
    duration: 5000, // 5 секунд
    controls: [
      { key: 'w', duration: 2000 },
      { key: 's', duration: 1000 },
      { key: 'a', duration: 1000 },
      { key: 'd', duration: 1000 },
    ],
  },
  stressTest: {
    duration: 30000, // 30 секунд
    controls: [
      { key: 'w', duration: 5000 },
      { key: 'a', duration: 2000 },
      { key: 'd', duration: 2000 },
      { key: 'w', duration: 5000 },
      { key: 's', duration: 3000 },
    ],
  },
} as const;

export const ERROR_PATTERNS = {
  critical: [
    /Uncaught\s+(TypeError|ReferenceError|Error)/,
    /WebGL\s+context\s+lost/,
    /Failed\s+to\s+load\s+resource/,
    /Network\s+error/,
  ],
  warnings: [
    /DEPRECATED/i,
    /performance/i,
    /memory/i,
  ],
  ignore: [
    /DevTools/,
    /extension/i,
    /Chrome\s+extension/i,
  ],
} as const;

export const WEBGL_REQUIREMENTS = {
  version: '1.0',
  extensions: [
    'OES_texture_float',
    'OES_standard_derivatives',
    'EXT_texture_filter_anisotropic',
  ],
  limits: {
    MAX_TEXTURE_SIZE: 1024,
    MAX_VIEWPORT_DIMS: [1024, 1024],
    MAX_VERTEX_ATTRIBS: 8,
    MAX_FRAGMENT_UNIFORM_VECTORS: 16,
  },
} as const;

/**
 * Утилиты для создания тестовых данных
 */
export class TestDataFactory {
  static createMouseMovements(count: number = 5) {
    const movements = [];
    for (let i = 0; i < count; i++) {
      movements.push({
        deltaX: Math.random() * 200 - 100, // -100 to 100
        deltaY: Math.random() * 200 - 100,
        duration: Math.random() * 500 + 100, // 100-600ms
      });
    }
    return movements;
  }

  static createRandomKeySequence(duration: number = 5000) {
    const keys = ['w', 'a', 's', 'd'];
    const sequence = [];
    let remainingTime = duration;

    while (remainingTime > 0) {
      const key = keys[Math.floor(Math.random() * keys.length)];
      const keyDuration = Math.min(Math.random() * 1000 + 200, remainingTime);
      
      sequence.push({ key, duration: keyDuration });
      remainingTime -= keyDuration;
    }

    return sequence;
  }

  static getPerformanceThreshold(deviceType: keyof typeof PERFORMANCE_THRESHOLDS.minFPS) {
    return {
      minFPS: PERFORMANCE_THRESHOLDS.minFPS[deviceType],
      maxLoadTime: PERFORMANCE_THRESHOLDS.maxLoadTime[deviceType],
    };
  }
}

/**
 * Типы для тестовых данных
 */
export type ViewportSize = typeof TEST_VIEWPORTS[keyof typeof TEST_VIEWPORTS];
export type GameControl = typeof GAME_CONTROLS[keyof typeof GAME_CONTROLS][string];
export type TestScenario = typeof TEST_SCENARIOS[keyof typeof TEST_SCENARIOS];
export type ErrorPattern = typeof ERROR_PATTERNS[keyof typeof ERROR_PATTERNS][number];
