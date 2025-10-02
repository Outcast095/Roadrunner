/**
 * Physics Update System
 * Система обновления физики с использованием Context7 best practices
 */

import { PhysicsManager } from './PhysicsManager';

export interface PhysicsUpdateConfig {
  // Настройки обновления
  fixedTimeStep: number;        // Фиксированный временной шаг (1/60 = 0.0167)
  maxSubSteps: number;          // Максимальное количество подшагов
  interpolation: boolean;       // Включить интерполяцию
  smoothing: number;            // Коэффициент сглаживания (0-1)
  
  // Настройки производительности
  enableSleeping: boolean;      // Включить режим сна для неактивных объектов
  sleepThreshold: number;       // Порог для перехода в режим сна
  enableCaching: boolean;       // Включить кэширование результатов
  
  // Настройки отладки
  debugMode: boolean;           // Режим отладки
  logPerformance: boolean;      // Логирование производительности
  maxLogFrequency: number;      // Максимальная частота логирования (мс)
}

export interface PhysicsUpdateStats {
  // Статистика производительности
  frameTime: number;            // Время кадра (мс)
  physicsTime: number;          // Время обновления физики (мс)
  subSteps: number;             // Количество подшагов
  objectsCount: number;         // Количество физических объектов
  
  // Статистика качества
  interpolationFactor: number;  // Фактор интерполяции
  smoothingFactor: number;      // Фактор сглаживания
  sleepCount: number;           // Количество спящих объектов
  
  // Статистика ошибок
  errors: string[];             // Список ошибок
  warnings: string[];           // Список предупреждений
}

export class PhysicsUpdateSystem {
  private physicsManager: PhysicsManager;
  private config: PhysicsUpdateConfig;
  private stats: PhysicsUpdateStats;
  
  // Временные переменные для обновления
  private accumulator: number = 0;
  private lastTime: number = 0;
  private frameCount: number = 0;
  private lastLogTime: number = 0;
  
  // Кэш для оптимизации
  private transformCache: Map<string, any> = new Map();
  private velocityCache: Map<string, any> = new Map();
  
  // Callbacks для событий
  private onUpdateCallbacks: Array<(deltaTime: number) => void> = [];
  private onErrorCallbacks: Array<(error: string) => void> = [];
  private onWarningCallbacks: Array<(warning: string) => void> = [];

  constructor(physicsManager: PhysicsManager, config?: Partial<PhysicsUpdateConfig>) {
    this.physicsManager = physicsManager;
    this.config = {
      fixedTimeStep: 1/60,           // 60 FPS
      maxSubSteps: 10,               // Максимум 10 подшагов
      interpolation: true,           // Включить интерполяцию
      smoothing: 0.8,                // Коэффициент сглаживания
      enableSleeping: true,          // Включить режим сна
      sleepThreshold: 0.1,           // Порог для сна
      enableCaching: true,           // Включить кэширование
      debugMode: false,              // Режим отладки выключен
      logPerformance: false,         // Логирование выключено
      maxLogFrequency: 1000,         // Логировать раз в секунду
      ...config
    };
    
    this.stats = {
      frameTime: 0,
      physicsTime: 0,
      subSteps: 0,
      objectsCount: 0,
      interpolationFactor: 0,
      smoothingFactor: 0,
      sleepCount: 0,
      errors: [],
      warnings: []
    };
  }

  /**
   * Основной метод обновления физики
   * Использует фиксированный временной шаг для стабильности
   */
  update(deltaTime: number): void {
    const startTime = performance.now();
    
    try {
      // Проверяем инициализацию
      if (!this.physicsManager.isReady()) {
        this.addWarning('Physics manager not ready');
        return;
      }

      // PhysicsUpdateSystem update

      // Обновляем аккумулятор времени
      this.accumulator += deltaTime;
      
      // Ограничиваем аккумулятор для предотвращения спирали смерти
      const maxAccumulator = this.config.fixedTimeStep * this.config.maxSubSteps;
      if (this.accumulator > maxAccumulator) {
        this.accumulator = maxAccumulator;
        this.addWarning('Physics accumulator clamped to prevent spiral of death');
      }

      // Выполняем фиксированные шаги
      let subSteps = 0;
      while (this.accumulator >= this.config.fixedTimeStep && subSteps < this.config.maxSubSteps) {
        this.stepPhysics(this.config.fixedTimeStep);
        this.accumulator -= this.config.fixedTimeStep;
        subSteps++;
      }

      // PhysicsUpdateSystem step completed

      // Обновляем статистику
      this.updateStats(startTime, subSteps);
      
      // Вызываем callbacks
      this.notifyUpdateCallbacks(deltaTime);
      
    } catch (error) {
      this.addError(`Physics update failed: ${error}`);
    }
  }

  /**
   * Выполнение одного шага физики
   */
  private stepPhysics(timeStep: number): void {
    try {
      // Обновляем физический мир
      this.physicsManager.update(timeStep);
      
      // Применяем режим сна если включен
      if (this.config.enableSleeping) {
        this.applySleeping();
      }
      
      // Обновляем кэш если включен
      if (this.config.enableCaching) {
        this.updateCache();
      }
      
    } catch (error) {
      this.addError(`Physics step failed: ${error}`);
    }
  }

  /**
   * Применение режима сна для неактивных объектов
   */
  private applySleeping(): void {
    // Реализация режима сна будет добавлена позже
    // когда у нас будут физические объекты
  }

  /**
   * Обновление кэша для оптимизации
   */
  private updateCache(): void {
    // Очищаем старый кэш
    this.transformCache.clear();
    this.velocityCache.clear();
  }

  /**
   * Обновление статистики
   */
  private updateStats(startTime: number, subSteps: number): void {
    const endTime = performance.now();
    
    this.stats.frameTime = endTime - startTime;
    this.stats.physicsTime = this.stats.frameTime;
    this.stats.subSteps = subSteps;
    this.stats.objectsCount = this.physicsManager.getDebugInfo().numObjects;
    this.stats.interpolationFactor = this.accumulator / this.config.fixedTimeStep;
    this.stats.smoothingFactor = this.config.smoothing;
    
    // Логирование производительности
    if (this.config.logPerformance) {
      this.logPerformance();
    }
  }

  /**
   * Логирование производительности
   */
  private logPerformance(): void {
    const now = performance.now();
    if (now - this.lastLogTime >= this.config.maxLogFrequency) {
      console.log('🔧 Physics Performance:', {
        frameTime: `${this.stats.frameTime.toFixed(2)}ms`,
        subSteps: this.stats.subSteps,
        objects: this.stats.objectsCount,
        interpolation: `${(this.stats.interpolationFactor * 100).toFixed(1)}%`
      });
      this.lastLogTime = now;
    }
  }

  /**
   * Добавление ошибки
   */
  private addError(message: string): void {
    this.stats.errors.push(`${new Date().toISOString()}: ${message}`);
    this.notifyErrorCallbacks(message);
    
    // Ограничиваем количество ошибок
    if (this.stats.errors.length > 100) {
      this.stats.errors = this.stats.errors.slice(-50);
    }
  }

  /**
   * Добавление предупреждения
   */
  private addWarning(message: string): void {
    this.stats.warnings.push(`${new Date().toISOString()}: ${message}`);
    this.notifyWarningCallbacks(message);
    
    // Ограничиваем количество предупреждений
    if (this.stats.warnings.length > 100) {
      this.stats.warnings = this.stats.warnings.slice(-50);
    }
  }

  /**
   * Уведомление callbacks об обновлении
   */
  private notifyUpdateCallbacks(deltaTime: number): void {
    this.onUpdateCallbacks.forEach(callback => {
      try {
        callback(deltaTime);
      } catch (error) {
        this.addError(`Update callback failed: ${error}`);
      }
    });
  }

  /**
   * Уведомление callbacks об ошибках
   */
  private notifyErrorCallbacks(message: string): void {
    this.onErrorCallbacks.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Error callback failed:', error);
      }
    });
  }

  /**
   * Уведомление callbacks о предупреждениях
   */
  private notifyWarningCallbacks(message: string): void {
    this.onWarningCallbacks.forEach(callback => {
      try {
        callback(message);
      } catch (error) {
        console.error('Warning callback failed:', error);
      }
    });
  }

  // === Публичные методы ===

  /**
   * Получение статистики
   */
  getStats(): PhysicsUpdateStats {
    return { ...this.stats };
  }

  /**
   * Получение конфигурации
   */
  getConfig(): PhysicsUpdateConfig {
    return { ...this.config };
  }

  /**
   * Обновление конфигурации
   */
  updateConfig(newConfig: Partial<PhysicsUpdateConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Сброс статистики
   */
  resetStats(): void {
    this.stats = {
      frameTime: 0,
      physicsTime: 0,
      subSteps: 0,
      objectsCount: 0,
      interpolationFactor: 0,
      smoothingFactor: 0,
      sleepCount: 0,
      errors: [],
      warnings: []
    };
  }

  /**
   * Добавление callback для обновления
   */
  onUpdate(callback: (deltaTime: number) => void): void {
    this.onUpdateCallbacks.push(callback);
  }

  /**
   * Добавление callback для ошибок
   */
  onError(callback: (error: string) => void): void {
    this.onErrorCallbacks.push(callback);
  }

  /**
   * Добавление callback для предупреждений
   */
  onWarning(callback: (warning: string) => void): void {
    this.onWarningCallbacks.push(callback);
  }

  /**
   * Очистка callbacks
   */
  clearCallbacks(): void {
    this.onUpdateCallbacks = [];
    this.onErrorCallbacks = [];
    this.onWarningCallbacks = [];
  }

  /**
   * Очистка ресурсов
   */
  dispose(): void {
    this.clearCallbacks();
    this.transformCache.clear();
    this.velocityCache.clear();
    this.resetStats();
  }
}
