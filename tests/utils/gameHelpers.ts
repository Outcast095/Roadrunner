import { Page, expect } from '@playwright/test';

/**
 * Утилиты для тестирования 3D игры Roadrunner
 */

export class GameTestHelpers {
  constructor(private page: Page) {}

  /**
   * Ждать загрузки 3D движка
   */
  async waitForEngineLoad(timeout = 30000) {
    // Ждем инициализации Babylon.js
    await this.page.waitForFunction(
      () => {
        return window.BABYLON !== undefined;
      },
      { timeout }
    );
    
    console.log('✓ Babylon.js engine loaded');
  }

  /**
   * Ждать загрузки физического движка
   */
  async waitForPhysicsLoad(timeout = 30000) {
    // Ждем инициализации Ammo.js
    await this.page.waitForFunction(
      () => {
        return window.Ammo !== undefined;
      },
      { timeout }
    );
    
    console.log('✓ Ammo.js physics engine loaded');
  }

  /**
   * Ждать создания игровой сцены
   */
  async waitForSceneReady(timeout = 30000) {
    await this.page.waitForFunction(
      () => {
        // Проверяем наличие canvas элемента
        const canvas = document.querySelector('canvas');
        if (!canvas) return false;
        
        // Проверяем, что WebGL контекст создан
        const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
        return gl !== null;
      },
      { timeout }
    );
    
    console.log('✓ 3D Scene ready');
  }

  /**
   * Проверить производительность рендеринга
   */
  async checkPerformance() {
    const fps = await this.page.evaluate(() => {
      return new Promise((resolve) => {
        let frames = 0;
        const startTime = performance.now();
        
        function countFrame() {
          frames++;
          if (performance.now() - startTime < 1000) {
            requestAnimationFrame(countFrame);
          } else {
            resolve(frames);
          }
        }
        
        requestAnimationFrame(countFrame);
      });
    });
    
    console.log(`FPS: ${fps}`);
    expect(fps).toBeGreaterThan(30); // Минимум 30 FPS
    
    return fps;
  }

  /**
   * Симулировать нажатие клавиш управления
   */
  async pressMovementKey(key: 'w' | 'a' | 's' | 'd', duration = 100) {
    await this.page.keyboard.down(key);
    await this.page.waitForTimeout(duration);
    await this.page.keyboard.up(key);
    
    console.log(`✓ Pressed ${key.toUpperCase()} key for ${duration}ms`);
  }

  /**
   * Симулировать движение мыши для управления камерой
   */
  async moveMouse(deltaX: number, deltaY: number) {
    const canvas = await this.page.locator('canvas').first();
    const box = await canvas.boundingBox();
    
    if (box) {
      const centerX = box.x + box.width / 2;
      const centerY = box.y + box.height / 2;
      
      await this.page.mouse.move(centerX, centerY);
      await this.page.mouse.down();
      await this.page.mouse.move(centerX + deltaX, centerY + deltaY);
      await this.page.mouse.up();
    }
    
    console.log(`✓ Mouse moved by (${deltaX}, ${deltaY})`);
  }

  /**
   * Проверить наличие 3D объектов в сцене
   */
  async checkObjectsInScene() {
    const objectCount = await this.page.evaluate(() => {
      // Это будет зависеть от того, как мы экспонируем информацию о сцене
      return document.querySelectorAll('[data-3d-object]').length;
    });
    
    console.log(`3D objects in scene: ${objectCount}`);
    return objectCount;
  }

  /**
   * Проверить загрузку текстур
   */
  async checkTextureLoading() {
    const textureStatus = await this.page.evaluate(() => {
      const images = document.querySelectorAll('img');
      let loadedCount = 0;
      let totalCount = images.length;
      
      images.forEach(img => {
        if (img.complete && img.naturalHeight !== 0) {
          loadedCount++;
        }
      });
      
      return { loaded: loadedCount, total: totalCount };
    });
    
    console.log(`Textures loaded: ${textureStatus.loaded}/${textureStatus.total}`);
    return textureStatus;
  }

  /**
   * Сделать скриншот с меткой времени
   */
  async takeGameScreenshot(name: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `game-${name}-${timestamp}.png`;
    
    await this.page.screenshot({
      path: `test-results/${filename}`,
      fullPage: false // Только viewport для игры
    });
    
    console.log(`✓ Screenshot saved: ${filename}`);
    return filename;
  }

  /**
   * Проверить отсутствие ошибок WebGL
   */
  async checkWebGLErrors() {
    const glErrors = await this.page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return ['No canvas found'];
      
      const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
      if (!gl) return ['No WebGL context'];
      
      const errors = [];
      let error = gl.getError();
      while (error !== gl.NO_ERROR) {
        errors.push(`WebGL Error: ${error}`);
        error = gl.getError();
      }
      
      return errors;
    });
    
    if (glErrors.length > 0) {
      console.error('WebGL Errors found:', glErrors);
    } else {
      console.log('✓ No WebGL errors');
    }
    
    expect(glErrors).toHaveLength(0);
    return glErrors;
  }

  /**
   * Измерить время загрузки игры
   */
  async measureLoadTime() {
    const loadTime = await this.page.evaluate(() => {
      return performance.timing.loadEventEnd - performance.timing.navigationStart;
    });
    
    console.log(`Game load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(10000); // Максимум 10 секунд
    
    return loadTime;
  }
}

/**
 * Проверить поддержку WebGL в браузере
 */
export async function checkWebGLSupport(page: Page) {
  const webglSupport = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('webgl2');
    
    if (!gl) return { supported: false, version: null };
    
    const version = gl.getParameter(gl.VERSION);
    const vendor = gl.getParameter(gl.VENDOR);
    const renderer = gl.getParameter(gl.RENDERER);
    
    return {
      supported: true,
      version,
      vendor,
      renderer,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
      maxViewportDims: gl.getParameter(gl.MAX_VIEWPORT_DIMS)
    };
  });
  
  console.log('WebGL Support:', webglSupport);
  expect(webglSupport.supported).toBe(true);
  
  return webglSupport;
}

/**
 * Глобальные декларации для TypeScript
 */
declare global {
  interface Window {
    BABYLON: any;
    Ammo: any;
  }
}
