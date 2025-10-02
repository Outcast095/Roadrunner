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
      if (typeof (window as any).Ammo !== 'undefined') {
        resolve((window as any).Ammo);
        return;
      }

      const script = document.createElement('script');
      script.src = '/ammo.js';
      script.async = true;

      script.onload = () => {
        if (typeof (window as any).Ammo !== 'undefined') {
          resolve((window as any).Ammo);
        } else {
          console.error('❌ Ammo.js global not found after script load');
          reject(new Error('Ammo.js не загрузился'));
        }
      };

      script.onerror = () => {
        console.error('❌ Failed to load Ammo.js from /ammo.js');
        const fallbackScript = document.createElement('script');
        fallbackScript.src = 'https://cdn.jsdelivr.net/npm/ammo.js@0.0.10/builds/ammo.js';
        fallbackScript.async = true;

        fallbackScript.onload = () => {
          if (typeof (window as any).Ammo !== 'undefined') {
            resolve((window as any).Ammo);
          } else {
            console.error('❌ Ammo.js global not found after CDN load');
            reject(new Error('Ошибка загрузки Ammo.js с CDN'));
          }
        };

        fallbackScript.onerror = () => {
          console.error('❌ Failed to load Ammo.js from CDN');
          reject(new Error('Ошибка загрузки Ammo.js с обоих источников'));
        };

        document.head.appendChild(fallbackScript);
      };

      document.head.appendChild(script);
    });
  }

  getAmmo(): any | null {
    return this.ammo;
  }

  isAmmoLoaded(): boolean {
    return this.isLoaded && this.ammo !== null;
  }
}

declare global {
  interface Window {
    Ammo: any;
  }
}