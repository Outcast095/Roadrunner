/**
 * Physics Sync System
 * Система синхронизации физики с визуальным представлением
 */

import { AbstractMesh } from '@babylonjs/core';
import { PhysicsManager } from './PhysicsManager';
import { PhysicsUpdateSystem } from './PhysicsUpdateSystem';

export interface PhysicsSyncConfig {
  // Настройки синхронизации
  enableInterpolation: boolean;     // Включить интерполяцию
  interpolationFactor: number;      // Фактор интерполяции (0-1)
  enableSmoothing: boolean;         // Включить сглаживание
  smoothingFactor: number;          // Коэффициент сглаживания (0-1)
  
  // Настройки производительности
  enableCaching: boolean;           // Включить кэширование
  maxCacheSize: number;             // Максимальный размер кэша
  updateFrequency: number;          // Частота обновления (Гц)
  
  // Настройки отладки
  debugMode: boolean;               // Режим отладки
  logSyncErrors: boolean;           // Логирование ошибок синхронизации
}

export interface PhysicsSyncStats {
  // Статистика синхронизации
  syncedObjects: number;            // Количество синхронизированных объектов
  interpolationCount: number;       // Количество интерполяций
  smoothingCount: number;           // Количество сглаживаний
  cacheHits: number;                // Попадания в кэш
  cacheMisses: number;              // Промахи кэша
  
  // Статистика производительности
  syncTime: number;                 // Время синхронизации (мс)
  averageSyncTime: number;          // Среднее время синхронизации (мс)
  maxSyncTime: number;              // Максимальное время синхронизации (мс)
  
  // Статистика ошибок
  syncErrors: string[];             // Ошибки синхронизации
  warnings: string[];               // Предупреждения
}

export interface PhysicsObject {
  mesh: AbstractMesh;               // Визуальный объект
  rigidBody: any;                   // Физическое тело
  id: string;                       // Уникальный ID
  lastPosition: { x: number; y: number; z: number };
  lastRotation: { x: number; y: number; z: number; w: number };
  lastVelocity: { x: number; y: number; z: number };
  lastAngularVelocity: { x: number; y: number; z: number };
}

export class PhysicsSyncSystem {
  private physicsManager: PhysicsManager;
  private updateSystem: PhysicsUpdateSystem;
  private config: PhysicsSyncConfig;
  private stats: PhysicsSyncStats;
  
  // Реестр физических объектов
  private physicsObjects: Map<string, PhysicsObject> = new Map();
  
  // Кэш для оптимизации
  private transformCache: Map<string, any> = new Map();
  private velocityCache: Map<string, any> = new Map();
  
  // Временные переменные
  private lastSyncTime: number = 0;
  private syncCount: number = 0;
  private totalSyncTime: number = 0;

  constructor(
    physicsManager: PhysicsManager,
    updateSystem: PhysicsUpdateSystem,
    config?: Partial<PhysicsSyncConfig>
  ) {
    this.physicsManager = physicsManager;
    this.updateSystem = updateSystem;
    this.config = {
      enableInterpolation: true,        // Включить интерполяцию
      interpolationFactor: 0.8,         // Фактор интерполяции
      enableSmoothing: true,            // Включить сглаживание
      smoothingFactor: 0.7,             // Коэффициент сглаживания
      enableCaching: true,              // Включить кэширование
      maxCacheSize: 1000,               // Максимальный размер кэша
      updateFrequency: 60,              // 60 Гц
      debugMode: false,                 // Режим отладки выключен
      logSyncErrors: false,             // Логирование ошибок выключено
      ...config
    };
    
    this.stats = {
      syncedObjects: 0,
      interpolationCount: 0,
      smoothingCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      syncTime: 0,
      averageSyncTime: 0,
      maxSyncTime: 0,
      syncErrors: [],
      warnings: []
    };
  }

  /**
   * Регистрация физического объекта
   */
  registerPhysicsObject(
    id: string,
    mesh: AbstractMesh,
    rigidBody: any
  ): void {
    try {
      const physicsObject: PhysicsObject = {
        mesh,
        rigidBody,
        id,
        lastPosition: { x: 0, y: 0, z: 0 },
        lastRotation: { x: 0, y: 0, z: 0, w: 1 },
        lastVelocity: { x: 0, y: 0, z: 0 },
        lastAngularVelocity: { x: 0, y: 0, z: 0 }
      };
      
      this.physicsObjects.set(id, physicsObject);
      this.stats.syncedObjects = this.physicsObjects.size;
      
      if (this.config.debugMode) {
        console.log(`✅ Physics object registered: ${id}`);
      }
      
    } catch (error) {
      this.addSyncError(`Failed to register physics object ${id}: ${error}`);
    }
  }

  /**
   * Отмена регистрации физического объекта
   */
  unregisterPhysicsObject(id: string): void {
    try {
      this.physicsObjects.delete(id);
      this.transformCache.delete(id);
      this.velocityCache.delete(id);
      this.stats.syncedObjects = this.physicsObjects.size;
      
      if (this.config.debugMode) {
        console.log(`❌ Physics object unregistered: ${id}`);
      }
      
    } catch (error) {
      this.addSyncError(`Failed to unregister physics object ${id}: ${error}`);
    }
  }

  /**
   * Основной метод синхронизации
   */
  sync(deltaTime: number): void {
    const startTime = performance.now();
    
    try {
      // Проверяем частоту обновления
      if (!this.shouldUpdate(deltaTime)) {
        return;
      }

      // Синхронизируем все объекты
      for (const [id, physicsObject] of this.physicsObjects) {
        this.syncObject(physicsObject, deltaTime);
      }
      
      // Обновляем статистику
      this.updateStats(startTime);
      
    } catch (error) {
      this.addSyncError(`Sync failed: ${error}`);
    }
  }

  /**
   * Проверка необходимости обновления
   */
  private shouldUpdate(deltaTime: number): boolean {
    const now = performance.now();
    const timeSinceLastSync = now - this.lastSyncTime;
    const minInterval = 1000 / this.config.updateFrequency;
    
    return timeSinceLastSync >= minInterval;
  }

  /**
   * Синхронизация одного объекта
   */
  private syncObject(physicsObject: PhysicsObject, deltaTime: number): void {
    try {
      const { mesh, rigidBody } = physicsObject;
      
      // Получаем трансформацию из физики
      const transform = rigidBody.getWorldTransform();
      const position = transform.getOrigin();
      const rotation = transform.getRotation();
      
      // Применяем интерполяцию если включена
      if (this.config.enableInterpolation) {
        this.applyInterpolation(physicsObject, position, rotation, deltaTime);
      } else {
        this.applyDirectTransform(mesh, position, rotation);
      }
      
      // Применяем сглаживание если включено
      if (this.config.enableSmoothing) {
        this.applySmoothing(physicsObject, deltaTime);
      }
      
      // Обновляем кэш
      if (this.config.enableCaching) {
        this.updateObjectCache(physicsObject, position, rotation);
      }
      
    } catch (error) {
      this.addSyncError(`Failed to sync object ${physicsObject.id}: ${error}`);
    }
  }

  /**
   * Применение интерполяции
   */
  private applyInterpolation(
    physicsObject: PhysicsObject,
    position: any,
    rotation: any,
    deltaTime: number
  ): void {
    const { mesh } = physicsObject;
    const factor = this.config.interpolationFactor;
    
    // Интерполируем позицию
    const newPos = {
      x: position.x(),
      y: position.y(),
      z: position.z()
    };
    
    const interpolatedPos = {
      x: this.lerp(physicsObject.lastPosition.x, newPos.x, factor),
      y: this.lerp(physicsObject.lastPosition.y, newPos.y, factor),
      z: this.lerp(physicsObject.lastPosition.z, newPos.z, factor)
    };
    
    mesh.position.set(interpolatedPos.x, interpolatedPos.y, interpolatedPos.z);
    
    // Интерполируем вращение
    const newRot = {
      x: rotation.x(),
      y: rotation.y(),
      z: rotation.z(),
      w: rotation.w()
    };
    
    const interpolatedRot = this.slerpQuaternion(
      physicsObject.lastRotation,
      newRot,
      factor
    );
    
    mesh.rotationQuaternion = new (mesh.getScene().getEngine().constructor as any).Quaternion(
      interpolatedRot.x,
      interpolatedRot.y,
      interpolatedRot.z,
      interpolatedRot.w
    );
    
    // Обновляем последние значения
    physicsObject.lastPosition = newPos;
    physicsObject.lastRotation = newRot;
    
    this.stats.interpolationCount++;
  }

  /**
   * Применение прямого трансформирования
   */
  private applyDirectTransform(mesh: AbstractMesh, position: any, rotation: any): void {
    mesh.position.set(position.x(), position.y(), position.z());
    mesh.rotationQuaternion = new (mesh.getScene().getEngine().constructor as any).Quaternion(
      rotation.x(),
      rotation.y(),
      rotation.z(),
      rotation.w()
    );
  }

  /**
   * Применение сглаживания
   */
  private applySmoothing(physicsObject: PhysicsObject, deltaTime: number): void {
    const { mesh } = physicsObject;
    const factor = this.config.smoothingFactor;
    
    // Сглаживаем позицию
    const currentPos = mesh.position;
    const targetPos = physicsObject.lastPosition;
    
    const smoothedPos = {
      x: this.lerp(currentPos.x, targetPos.x, factor),
      y: this.lerp(currentPos.y, targetPos.y, factor),
      z: this.lerp(currentPos.z, targetPos.z, factor)
    };
    
    mesh.position.set(smoothedPos.x, smoothedPos.y, smoothedPos.z);
    
    this.stats.smoothingCount++;
  }

  /**
   * Обновление кэша объекта
   */
  private updateObjectCache(
    physicsObject: PhysicsObject,
    position: any,
    rotation: any
  ): void {
    const { id } = physicsObject;
    
    // Проверяем размер кэша
    if (this.transformCache.size >= this.config.maxCacheSize) {
      this.clearOldestCache();
    }
    
    // Кэшируем трансформацию
    this.transformCache.set(id, {
      position: { x: position.x(), y: position.y(), z: position.z() },
      rotation: { x: rotation.x(), y: rotation.y(), z: rotation.z(), w: rotation.w() },
      timestamp: performance.now()
    });
  }

  /**
   * Очистка старейшего кэша
   */
  private clearOldestCache(): void {
    let oldestKey = '';
    let oldestTime = Infinity;
    
    for (const [key, value] of this.transformCache) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.transformCache.delete(oldestKey);
    }
  }

  /**
   * Линейная интерполяция
   */
  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Сферическая интерполяция кватернионов
   */
  private slerpQuaternion(q1: any, q2: any, t: number): any {
    // Упрощенная реализация SLERP
    const dot = q1.x * q2.x + q1.y * q2.y + q1.z * q2.z + q1.w * q2.w;
    
    if (dot < 0) {
      return {
        x: q1.x + t * (-q2.x - q1.x),
        y: q1.y + t * (-q2.y - q1.y),
        z: q1.z + t * (-q2.z - q1.z),
        w: q1.w + t * (-q2.w - q1.w)
      };
    } else {
      return {
        x: q1.x + t * (q2.x - q1.x),
        y: q1.y + t * (q2.y - q1.y),
        z: q1.z + t * (q2.z - q1.z),
        w: q1.w + t * (q2.w - q1.w)
      };
    }
  }

  /**
   * Обновление статистики
   */
  private updateStats(startTime: number): void {
    const endTime = performance.now();
    this.stats.syncTime = endTime - startTime;
    
    this.syncCount++;
    this.totalSyncTime += this.stats.syncTime;
    this.stats.averageSyncTime = this.totalSyncTime / this.syncCount;
    this.stats.maxSyncTime = Math.max(this.stats.maxSyncTime, this.stats.syncTime);
    
    this.lastSyncTime = endTime;
  }

  /**
   * Добавление ошибки синхронизации
   */
  private addSyncError(message: string): void {
    this.stats.syncErrors.push(`${new Date().toISOString()}: ${message}`);
    
    if (this.config.logSyncErrors) {
      console.error(`Physics Sync Error: ${message}`);
    }
    
    // Ограничиваем количество ошибок
    if (this.stats.syncErrors.length > 100) {
      this.stats.syncErrors = this.stats.syncErrors.slice(-50);
    }
  }

  /**
   * Добавление предупреждения
   */
  private addWarning(message: string): void {
    this.stats.warnings.push(`${new Date().toISOString()}: ${message}`);
    
    if (this.config.debugMode) {
      console.warn(`Physics Sync Warning: ${message}`);
    }
    
    // Ограничиваем количество предупреждений
    if (this.stats.warnings.length > 100) {
      this.stats.warnings = this.stats.warnings.slice(-50);
    }
  }

  // === Публичные методы ===

  /**
   * Получение статистики
   */
  getStats(): PhysicsSyncStats {
    return { ...this.stats };
  }

  /**
   * Получение конфигурации
   */
  getConfig(): PhysicsSyncConfig {
    return { ...this.config };
  }

  /**
   * Обновление конфигурации
   */
  updateConfig(newConfig: Partial<PhysicsSyncConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Сброс статистики
   */
  resetStats(): void {
    this.stats = {
      syncedObjects: this.physicsObjects.size,
      interpolationCount: 0,
      smoothingCount: 0,
      cacheHits: 0,
      cacheMisses: 0,
      syncTime: 0,
      averageSyncTime: 0,
      maxSyncTime: 0,
      syncErrors: [],
      warnings: []
    };
  }

  /**
   * Очистка ресурсов
   */
  dispose(): void {
    this.physicsObjects.clear();
    this.transformCache.clear();
    this.velocityCache.clear();
    this.resetStats();
  }
}
