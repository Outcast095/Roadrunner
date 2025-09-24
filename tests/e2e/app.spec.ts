import { test, expect } from '@playwright/test';
import { GameTestHelpers, checkWebGLSupport } from '../utils/gameHelpers';

test.describe('Roadrunner App - Basic Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Переходим на главную страницу приложения
    await page.goto('/');
  });

  test('should load the main page', async ({ page }) => {
    // Проверяем, что страница загрузилась
    await expect(page).toHaveTitle(/Roadrunner/);
    
    // Проверяем наличие основных элементов
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have WebGL support', async ({ page }) => {
    const webglInfo = await checkWebGLSupport(page);
    
    expect(webglInfo.supported).toBe(true);
    expect(webglInfo.version).toBeTruthy();
    
    console.log('WebGL Info:', {
      version: webglInfo.version,
      vendor: webglInfo.vendor,
      renderer: webglInfo.renderer,
      maxTextureSize: webglInfo.maxTextureSize
    });
  });

  test('should load React without errors', async ({ page }) => {
    // Ждем загрузки React
    await page.waitForFunction(() => {
      return window.React !== undefined || document.querySelector('[data-reactroot]') !== null;
    });

    // Проверяем отсутствие ошибок в консоли
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Ждем немного, чтобы поймать возможные ошибки
    await page.waitForTimeout(2000);

    // React ошибки не должны быть критическими для начальной загрузки
    const criticalErrors = consoleErrors.filter(error => 
      error.includes('Failed to') || 
      error.includes('Uncaught') ||
      error.includes('TypeError')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('should have responsive design', async ({ page }) => {
    // Тестируем разные размеры экрана
    const viewports = [
      { width: 1920, height: 1080 }, // Desktop
      { width: 1366, height: 768 },  // Laptop
      { width: 768, height: 1024 },  // Tablet
      { width: 375, height: 667 },   // Mobile
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);

      // Проверяем, что контент отображается корректно
      const body = page.locator('body');
      await expect(body).toBeVisible();

      // Проверяем отсутствие горизонтального скролла
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.body.scrollWidth > window.innerWidth;
      });

      // Для мобильных устройств горизонтальный скролл может быть допустим
      if (viewport.width >= 768) {
        expect(hasHorizontalScroll).toBe(false);
      }
    }
  });

  test('should load CSS styles', async ({ page }) => {
    // Проверяем, что стили загружены
    const styleSheets = await page.evaluate(() => {
      return document.styleSheets.length;
    });

    expect(styleSheets).toBeGreaterThan(0);

    // Проверяем, что есть стили для body
    const bodyStyles = await page.evaluate(() => {
      const body = document.body;
      const computedStyle = window.getComputedStyle(body);
      return {
        margin: computedStyle.margin,
        padding: computedStyle.padding,
        fontFamily: computedStyle.fontFamily
      };
    });

    expect(bodyStyles.fontFamily).toBeTruthy();
  });

  test('should handle page refresh', async ({ page }) => {
    // Загружаем страницу
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Обновляем страницу
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Проверяем, что страница снова работает
    await expect(page.locator('body')).toBeVisible();
  });

  test('should not have accessibility violations', async ({ page }) => {
    // Базовые проверки доступности
    
    // Проверяем наличие title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Проверяем lang атрибут
    const htmlLang = await page.getAttribute('html', 'lang');
    expect(htmlLang).toBeTruthy();

    // Проверяем, что нет элементов без alt (для изображений)
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    expect(imagesWithoutAlt).toBe(0);
  });
});
