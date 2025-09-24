import { test, expect } from '@playwright/test';
import { GameTestHelpers, checkWebGLSupport } from '../utils/gameHelpers';

test.describe('Roadrunner 3D Game Engine', () => {
  let gameHelpers: GameTestHelpers;

  test.beforeEach(async ({ page }) => {
    gameHelpers = new GameTestHelpers(page);
    
    // Переходим на игровую страницу
    await page.goto('/');
    
    // Проверяем WebGL поддержку
    await checkWebGLSupport(page);
  });

  test('should initialize 3D engines', async ({ page }) => {
    // Проверяем загрузку Babylon.js
    await test.step('Load Babylon.js engine', async () => {
      await gameHelpers.waitForEngineLoad();
    });

    // Проверяем загрузку Ammo.js (физика)
    await test.step('Load Ammo.js physics engine', async () => {
      await gameHelpers.waitForPhysicsLoad();
    });

    // Делаем скриншот после загрузки движков
    await gameHelpers.takeGameScreenshot('engines-loaded');
  });

  test('should create 3D scene', async ({ page }) => {
    // Ждем создания 3D сцены
    await gameHelpers.waitForSceneReady();

    // Проверяем WebGL ошибки
    await gameHelpers.checkWebGLErrors();

    // Проверяем наличие canvas элемента
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();

    // Проверяем размеры canvas
    const canvasSize = await canvas.boundingBox();
    expect(canvasSize?.width).toBeGreaterThan(0);
    expect(canvasSize?.height).toBeGreaterThan(0);

    await gameHelpers.takeGameScreenshot('scene-created');
  });

  test('should maintain good performance', async ({ page }) => {
    // Ждем загрузки сцены
    await gameHelpers.waitForSceneReady();
    
    // Даем время на стабилизацию рендеринга
    await page.waitForTimeout(2000);

    // Проверяем FPS
    const fps = await gameHelpers.checkPerformance();
    
    console.log(`Game running at ${fps} FPS`);
    
    // В разных браузерах производительность может отличаться
    expect(fps).toBeGreaterThan(20); // Минимально приемлемый FPS
  });

  test('should handle game controls', async ({ page }) => {
    await gameHelpers.waitForSceneReady();
    
    // Тестируем клавиши управления
    await test.step('Test WASD controls', async () => {
      await gameHelpers.pressMovementKey('w', 200);
      await gameHelpers.pressMovementKey('s', 200);
      await gameHelpers.pressMovementKey('a', 200);
      await gameHelpers.pressMovementKey('d', 200);
    });

    // Тестируем управление камерой мышью
    await test.step('Test mouse camera control', async () => {
      await gameHelpers.moveMouse(50, 30);
      await gameHelpers.moveMouse(-50, -30);
    });

    // Проверяем, что нет ошибок после взаимодействия
    await gameHelpers.checkWebGLErrors();
    
    await gameHelpers.takeGameScreenshot('after-controls-test');
  });

  test('should load textures correctly', async ({ page }) => {
    await gameHelpers.waitForSceneReady();
    
    // Даем время на загрузку текстур
    await page.waitForTimeout(3000);
    
    const textureStatus = await gameHelpers.checkTextureLoading();
    
    // Если есть текстуры, они должны загрузиться
    if (textureStatus.total > 0) {
      expect(textureStatus.loaded).toBeGreaterThan(0);
      
      // Не все текстуры могут загрузиться мгновенно
      const loadRatio = textureStatus.loaded / textureStatus.total;
      expect(loadRatio).toBeGreaterThan(0.5); // Минимум 50% текстур
    }
  });

  test('should handle window resize', async ({ page }) => {
    await gameHelpers.waitForSceneReady();
    
    // Исходный размер
    await gameHelpers.takeGameScreenshot('before-resize');
    
    // Изменяем размер окна
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(1000);
    
    // Проверяем, что canvas адаптировался
    const canvas = page.locator('canvas').first();
    const newSize = await canvas.boundingBox();
    
    expect(newSize?.width).toBeLessThanOrEqual(800);
    expect(newSize?.height).toBeLessThanOrEqual(600);
    
    // Проверяем отсутствие ошибок после resize
    await gameHelpers.checkWebGLErrors();
    
    await gameHelpers.takeGameScreenshot('after-resize');
  });

  test('should recover from errors gracefully', async ({ page }) => {
    await gameHelpers.waitForSceneReady();
    
    // Симулируем потерю WebGL контекста
    await page.evaluate(() => {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (canvas) {
        const gl = canvas.getContext('webgl');
        if (gl && gl.getExtension('WEBGL_lose_context')) {
          gl.getExtension('WEBGL_lose_context')?.loseContext();
        }
      }
    });

    // Даем время на восстановление
    await page.waitForTimeout(2000);
    
    // Проверяем, что приложение все еще отвечает
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();
    
    await gameHelpers.takeGameScreenshot('after-context-loss');
  });

  test('should measure load time', async ({ page }) => {
    // Этот тест запускается на свежей странице
    await page.goto('/');
    
    const loadTime = await gameHelpers.measureLoadTime();
    
    console.log(`Total game load time: ${loadTime}ms`);
    
    // Приемлемое время загрузки для 3D игры
    expect(loadTime).toBeLessThan(15000); // 15 секунд максимум
  });

  test.describe('Cross-browser compatibility', () => {
    ['chromium', 'firefox', 'webkit'].forEach(browserName => {
      test(`should work in ${browserName}`, async ({ page, browserName: currentBrowser }) => {
        test.skip(currentBrowser !== browserName, `Skipping for ${currentBrowser}`);
        
        await gameHelpers.waitForSceneReady();
        await gameHelpers.checkWebGLErrors();
        
        const fps = await gameHelpers.checkPerformance();
        expect(fps).toBeGreaterThan(15); // Более мягкие требования для кросс-браузерности
        
        await gameHelpers.takeGameScreenshot(`${browserName}-compatibility`);
      });
    });
  });
});
