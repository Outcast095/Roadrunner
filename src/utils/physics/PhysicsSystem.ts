/**
 * Physics System
 * Главная система физики, объединяющая все подсистемы
 */

import { PhysicsManager } from './PhysicsManager';
import { PhysicsUpdateSystem } from './PhysicsUpdateSystem';
import { PhysicsSyncSystem } from './PhysicsSyncSystem';
import { AmmoLoader } from './AmmoLoader';

export interface PhysicsSystemConfig {
  gravity: { x: number; y: number; z: number };
  timeStep: number;
  maxSubSteps: number;
  updateConfig: {
    fixedTimeStep: number;
    maxSubSteps: number;
    interpolation: boolean;
    smoothing: number;
    enableSleeping: boolean;
    sleepThreshold: number;
    enableCaching: boolean;
    debugMode: boolean;
    logPerformance: boolean;
    maxLogFrequency: number;
  };
  syncConfig: {
    enableInterpolation: boolean;
    interpolationFactor: number;
    enableSmoothing: boolean;
    smoothingFactor: number;
    enableCaching: boolean;
    maxCacheSize: number;
    updateFrequency: number;
    debugMode: boolean;
    logSyncErrors: boolean;
  };
}

export interface PhysicsSystemStats {
  isInitialized: boolean;
  isRunning: boolean;
  frameCount: number;
  totalTime: number;
  physicsManager: any;
  updateSystem: any;
  syncSystem: any;
  averageFrameTime: number;
  maxFrameTime: number;
  minFrameTime: number;
}

export class PhysicsSystem {
  private physicsManager!: PhysicsManager;
  private updateSystem!: PhysicsUpdateSystem;
  private syncSystem!: PhysicsSyncSystem;
  private config: PhysicsSystemConfig;
  private stats: PhysicsSystemStats;

  private isInitialized: boolean = false;
  private isRunning: boolean = false;
  private frameCount: number = 0;
  private startTime: number = 0;
  private lastFrameTime: number = 0;
  private frameTimes: number[] = [];

  constructor(config?: Partial<PhysicsSystemConfig>) {
    this.config = {
      gravity: { x: 0, y: -9.81, z: 0 },
      timeStep: 1/60,
      maxSubSteps: 10,
      updateConfig: {
        fixedTimeStep: 1/60,
        maxSubSteps: 10,
        interpolation: true,
        smoothing: 0.8,
        enableSleeping: true,
        sleepThreshold: 0.1,
        enableCaching: true,
        debugMode: false,
        logPerformance: false,
        maxLogFrequency: 1000
      },
      syncConfig: {
        enableInterpolation: true,
        interpolationFactor: 0.8,
        enableSmoothing: true,
        smoothingFactor: 0.7,
        enableCaching: true,
        maxCacheSize: 1000,
        updateFrequency: 60,
        debugMode: false,
        logSyncErrors: false
      },
      ...config
    };

    this.stats = {
      isInitialized: false,
      isRunning: false,
      frameCount: 0,
      totalTime: 0,
      physicsManager: null,
      updateSystem: null,
      syncSystem: null,
      averageFrameTime: 0,
      maxFrameTime: 0,
      minFrameTime: Infinity
    };
  }

  async initialize(): Promise<void> {
    try {
      const ammoLoader = AmmoLoader.getInstance();
      const ammo = await ammoLoader.load();
      if (!ammo || !ammo.btDefaultCollisionConfiguration) {
        throw new Error('Invalid Ammo.js object');
      }

      this.physicsManager = new PhysicsManager({
        gravity: this.config.gravity,
        timeStep: this.config.timeStep,
        maxSubSteps: this.config.maxSubSteps,
        debugMode: this.config.updateConfig.debugMode
      });

      this.physicsManager.initialize(ammo);
      this.updateSystem = new PhysicsUpdateSystem(this.physicsManager, this.config.updateConfig);
      this.syncSystem = new PhysicsSyncSystem(this.physicsManager, this.updateSystem, this.config.syncConfig);
      this.setupCallbacks();
      this.isInitialized = true;
      this.stats.isInitialized = true;
    } catch (error) {
      console.error('❌ Physics System initialization failed:', error);
      throw error;
    }
  }

  private setupCallbacks(): void {
    this.updateSystem.onUpdate((deltaTime: number) => {
      this.syncSystem.sync(deltaTime);
    });

    this.updateSystem.onError((error: string) => {
      console.error('❌ Physics Update Error:', error);
    });

    this.updateSystem.onWarning((warning: string) => {
      console.warn('⚠️ Physics Update Warning:', warning);
    });
  }

  start(): void {
    if (!this.isInitialized) {
      throw new Error('Physics System not initialized');
    }

    this.isRunning = true;
    this.stats.isRunning = true;
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
    // Physics System started
  }

  stop(): void {
    this.isRunning = false;
    this.stats.isRunning = false;
    // Physics System stopped
  }

  update(deltaTime: number): void {
    if (!this.isRunning || !this.isInitialized) {
      return;
    }

    const frameStartTime = performance.now();

    try {
      // Обновление физических тел
      this.updateSystem.update(deltaTime);
      
      // Синхронизация с визуальными объектами
      this.syncSystem.sync(deltaTime);
      
      this.updateStats(frameStartTime);
    } catch (error) {
      console.error('❌ Physics System update failed:', error);
    }
  }

  private updateStats(frameStartTime: number): void {
    const frameEndTime = performance.now();
    const frameTime = frameEndTime - frameStartTime;

    this.frameCount++;
    this.stats.frameCount = this.frameCount;
    this.stats.totalTime = frameEndTime - this.startTime;

    this.frameTimes.push(frameTime);
    if (this.frameTimes.length > 60) {
      this.frameTimes = this.frameTimes.slice(-60);
    }

    this.stats.averageFrameTime = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
    this.stats.maxFrameTime = Math.max(this.stats.maxFrameTime, frameTime);
    this.stats.minFrameTime = Math.min(this.stats.minFrameTime, frameTime);

    this.stats.physicsManager = this.physicsManager.getDebugInfo();
    this.stats.updateSystem = this.updateSystem.getStats();
    this.stats.syncSystem = this.syncSystem.getStats();
  }

  registerPhysicsObject(id: string, mesh: any, rigidBody: any): void {
    if (!this.isInitialized) {
      throw new Error('Physics System not initialized');
    }
    
    // Registering physics object
    
    this.syncSystem.registerPhysicsObject(id, mesh, rigidBody);
    
    // Physics object registered
  }

  unregisterPhysicsObject(id: string): void {
    if (!this.isInitialized) {
      return;
    }
    this.syncSystem.unregisterPhysicsObject(id);
    // Physics object unregistered
  }

  getPhysicsManager(): PhysicsManager {
    return this.physicsManager;
  }

  getUpdateSystem(): PhysicsUpdateSystem {
    return this.updateSystem;
  }

  getSyncSystem(): PhysicsSyncSystem {
    return this.syncSystem;
  }

  getStats(): PhysicsSystemStats {
    return { ...this.stats };
  }

  getConfig(): PhysicsSystemConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<PhysicsSystemConfig>): void {
    this.config = { ...this.config, ...newConfig };

    if (this.physicsManager) {
      this.physicsManager.setGravity(this.config.gravity.x, this.config.gravity.y, this.config.gravity.z);
    }

    if (this.updateSystem) {
      this.updateSystem.updateConfig(this.config.updateConfig);
    }

    if (this.syncSystem) {
      this.syncSystem.updateConfig(this.config.syncConfig);
    }
  }

  resetStats(): void {
    this.stats = {
      isInitialized: this.isInitialized,
      isRunning: this.isRunning,
      frameCount: 0,
      totalTime: 0,
      physicsManager: this.physicsManager?.getDebugInfo() || null,
      updateSystem: this.updateSystem?.getStats() || null,
      syncSystem: this.syncSystem?.getStats() || null,
      averageFrameTime: 0,
      maxFrameTime: 0,
      minFrameTime: Infinity
    };

    this.frameCount = 0;
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
    this.frameTimes = [];

    if (this.updateSystem) {
      this.updateSystem.resetStats();
    }

    if (this.syncSystem) {
      this.syncSystem.resetStats();
    }
  }

  isReady(): boolean {
    return this.isInitialized && this.isRunning;
  }

  getInitialized(): boolean {
    return this.isInitialized;
  }

  dispose(): void {
    this.stop();

    if (this.syncSystem) {
      this.syncSystem.dispose();
    }

    if (this.updateSystem) {
      this.updateSystem.dispose();
    }

    if (this.physicsManager) {
      this.physicsManager.dispose();
    }

    this.isInitialized = false;
    this.stats.isInitialized = false;
    // Physics System disposed
  }
}