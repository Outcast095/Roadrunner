/**
 * Ammo.js Loader
 * Загрузка и инициализация Ammo.js библиотеки
 */

export class AmmoLoader {
  private static instance: AmmoLoader | null = null;
  private ammo: any | null = null;
  private isLoaded = false;
  private loadPromise: Promise<any> | null = null;

  private constructor() {}

  static getInstance(): AmmoLoader {
    if (!AmmoLoader.instance) {
      AmmoLoader.instance = new AmmoLoader();
    }
    return AmmoLoader.instance;
  }

  //Загрузка Ammo.js
  async load(): Promise<any> {
    if (this.isLoaded && this.ammo) {
      return this.ammo;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = this.loadAmmo();
    this.ammo = await this.loadPromise;
    this.isLoaded = true;
    this.loadPromise = null;

    return this.ammo;
  }

  private async loadAmmo(): Promise<any> {
    return new Promise((resolve, reject) => {
      // Проверяем, если Ammo уже загружен глобально
      if (typeof (window as any).Ammo !== 'undefined') {
        resolve((window as any).Ammo);
        return;
      }

      // Загружаем Ammo.js из public
      const script = document.createElement('script');
      script.src = '/ammo.js';
      script.async = true;
      
      script.onload = () => {
        if (typeof (window as any).Ammo !== 'undefined') {
          resolve((window as any).Ammo);
        } else {
          reject(new Error('Ammo.js не загрузился'));
        }
      };
      
      script.onerror = () => {
        reject(new Error('Ошибка загрузки Ammo.js'));
      };

      document.head.appendChild(script);
    });
  }

  //Получение экземпляра Ammo.js
  getAmmo(): any | null {
    return this.ammo;
  }

  //Проверка загрузки
  isAmmoLoaded(): boolean {
    return this.isLoaded && this.ammo !== null;
  }
}

// Глобальные типы для Ammo.js
declare global {
  interface Window {
    Ammo: any;
  }
}

// Типы Ammo.js определены в src/types/ammo.d.ts
