import { defineConfig, devices } from '@playwright/test';

/**
 * Конфигурация Playwright для тестирования 3D игры Roadrunner
 * Оптимизирована для работы с Babylon.js, WebGL и физикой
 */
export default defineConfig({
  // Директория с тестами
  testDir: './tests/e2e',
  
  // Время выполнения тестов
  timeout: 60000, // 60 секунд для загрузки 3D сцен
  expect: {
    timeout: 10000, // 10 секунд для проверок
  },

  // Настройки запуска
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI ? 1 : undefined,

  // Репортеры
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/results.xml' }]
  ],

  // Глобальные настройки
  use: {
    // URL приложения
    baseURL: 'http://localhost:3000',
    
    // Трейсинг для отладки
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Настройки для 3D/WebGL приложений
    viewport: { width: 1920, height: 1080 }, // Большое разрешение для 3D
    ignoreHTTPSErrors: true,
    
    // Дополнительные параметры для WebGL
    launchOptions: {
      args: [
        '--enable-webgl',
        '--enable-accelerated-2d-canvas',
        '--enable-gpu-rasterization',
        '--enable-gpu-sandbox',
        '--ignore-gpu-blacklist',
        '--disable-web-security', // Для локальной разработки
      ],
    },
  },

  // Проекты (разные браузеры)
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 },
        // Дополнительные флаги для Chromium
        launchOptions: {
          args: [
            '--enable-webgl',
            '--enable-accelerated-2d-canvas',
            '--enable-gpu-rasterization',
            '--enable-features=VaapiVideoDecoder',
            '--disable-web-security',
            '--allow-running-insecure-content',
          ],
        },
      },
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1920, height: 1080 },
        // Firefox настройки для WebGL
        launchOptions: {
          firefoxUserPrefs: {
            'webgl.force-enabled': true,
            'webgl.disabled': false,
            'webgl.min_capability_mode': false,
          },
        },
      },
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1920, height: 1080 },
      },
    },

    // Мобильные устройства (для проверки совместимости)
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'],
        // Уменьшенный viewport для мобильных
        viewport: { width: 393, height: 851 },
      },
    },
  ],

  // Веб-сервер для тестов (если нужно запускать отдельно)
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 минуты на запуск
  },
});
