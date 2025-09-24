/**
 * Physics Manager for Ammo.js integration
 * Управление физическим миром с гравитацией
 */

export interface PhysicsWorldConfig {
  gravity: {
    x: number;
    y: number;
    z: number;
  };
  // Дополнительные настройки физики
  timeStep?: number;
  maxSubSteps?: number;
  debugMode?: boolean;
}

export class PhysicsManager {
  private ammo: any | null = null;
  private world: any | null = null;
  private config: PhysicsWorldConfig;
  private isInitialized = false;

  constructor(config?: Partial<PhysicsWorldConfig>) {
    this.config = {
      gravity: { x: 0, y: -9.8, z: 0 }, // Стандартная гравитация Земли
      timeStep: 1/60, // 60 FPS по умолчанию
      maxSubSteps: 10, // Максимум 10 подшагов
      debugMode: false, // Режим отладки выключен
      ...config
    };
  }

  /**
   * Инициализация Ammo.js и создание физического мира
   */
  async initialize(ammo: any): Promise<void> {
    if (this.isInitialized) {
      console.warn('PhysicsManager уже инициализирован');
      return;
    }

    try {
      this.ammo = ammo;
      console.log('✅ Ammo.js загружен успешно');

      // Создаем физический мир
      this.createPhysicsWorld();
      console.log('✅ Физический мир создан с гравитацией:', this.config.gravity);

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Ошибка инициализации физики:', error);
      throw error;
    }
  }

  /**
   * Создание физического мира
   */
  private createPhysicsWorld(): void {
    if (!this.ammo) {
      throw new Error('Ammo.js не загружен');
    }

    console.log('🔧 Создаем физический мир...');

    // 1. Создаем конфигурацию коллизий
    console.log('  📋 Создаем конфигурацию коллизий...');
    const collisionConfiguration = new this.ammo.btDefaultCollisionConfiguration();

    // 2. Создаем диспетчер коллизий
    console.log('  🔄 Создаем диспетчер коллизий...');
    const dispatcher = new this.ammo.btCollisionDispatcher(collisionConfiguration);

    // 3. Создаем широкую фазу коллизий
    console.log('  📡 Создаем широкую фазу коллизий...');
    const broadphase = new this.ammo.btDbvtBroadphase();

    // 4. Создаем решатель ограничений
    console.log('  ⚙️ Создаем решатель ограничений...');
    const solver = new this.ammo.btSequentialImpulseConstraintSolver();

    // 5. Создаем динамический мир
    console.log('  🌍 Создаем btDiscreteDynamicsWorld...');
    this.world = new this.ammo.btDiscreteDynamicsWorld(
      dispatcher,
      broadphase,
      solver,
      collisionConfiguration
    );

    // 6. Устанавливаем гравитацию
    const gravity = new this.ammo.btVector3(
      this.config.gravity.x,
      this.config.gravity.y,
      this.config.gravity.z
    );
    this.world.setGravity(gravity);

    // Освобождаем временный вектор гравитации
    this.ammo.destroy(gravity);
  }

  /**
   * Обновление физики (вызывать в каждом кадре)
   */
  update(deltaTime: number): void {
    if (!this.world || !this.ammo) {
      return;
    }

    // Обновляем физический мир с настраиваемыми параметрами
    this.world.stepSimulation(
      deltaTime, 
      this.config.maxSubSteps || 10,
      this.config.timeStep || 1/60
    );
  }

  /**
   * Добавление физического тела в мир
   */
  addRigidBody(rigidBody: any): void {
    if (!this.world) {
      throw new Error('Физический мир не инициализирован');
    }
    this.world.addRigidBody(rigidBody);
  }

  /**
   * Удаление физического тела из мира
   */
  removeRigidBody(rigidBody: any): void {
    if (!this.world) {
      throw new Error('Физический мир не инициализирован');
    }
    this.world.removeRigidBody(rigidBody);
  }

  /**
   * Получение физического мира
   */
  getWorld(): any | null {
    return this.world;
  }

  /**
   * Получение экземпляра Ammo.js
   */
  getAmmo(): any | null {
    return this.ammo;
  }

  /**
   * Установка гравитации
   */
  setGravity(x: number, y: number, z: number): void {
    if (!this.world || !this.ammo) {
      throw new Error('Физический мир не инициализирован');
    }

    // Обновляем конфигурацию
    this.config.gravity = { x, y, z };

    // Создаем новый вектор гравитации
    const gravity = new this.ammo.btVector3(x, y, z);
    this.world.setGravity(gravity);

    // Освобождаем временный вектор
    this.ammo.destroy(gravity);
  }

  /**
   * Получение текущей гравитации
   */
  getGravity(): { x: number; y: number; z: number } {
    return { ...this.config.gravity };
  }

  /**
   * Установка гравитации по умолчанию (Земля)
   */
  setEarthGravity(): void {
    this.setGravity(0, -9.8, 0);
  }

  /**
   * Установка гравитации Луны
   */
  setMoonGravity(): void {
    this.setGravity(0, -1.62, 0);
  }

  /**
   * Установка гравитации Марса
   */
  setMarsGravity(): void {
    this.setGravity(0, -3.71, 0);
  }

  /**
   * Отключение гравитации
   */
  disableGravity(): void {
    this.setGravity(0, 0, 0);
  }

  /**
   * Проверка инициализации
   */
  isReady(): boolean {
    return this.isInitialized && this.world !== null && this.ammo !== null;
  }

  /**
   * Очистка ресурсов
   */
  dispose(): void {
    if (this.world && this.ammo) {
      // Временно отключено - API не работает
      // TODO: Найти правильный API для очистки объектов

      // Освобождаем мир
      this.ammo.destroy(this.world);
    }

    this.world = null;
    this.ammo = null;
    this.isInitialized = false;
  }

  /**
   * Получение информации о физическом мире
   */
  getDebugInfo(): {
    isInitialized: boolean;
    gravity: { x: number; y: number; z: number };
    numObjects: number;
    ammoLoaded: boolean;
    timeStep: number;
    maxSubSteps: number;
    debugMode: boolean;
  } {
    return {
      isInitialized: this.isInitialized,
      gravity: this.config.gravity,
      numObjects: this.world ? 0 : 0, // Временно отключено - API не работает
      ammoLoaded: this.ammo !== null,
      timeStep: this.config.timeStep || 1/60,
      maxSubSteps: this.config.maxSubSteps || 10,
      debugMode: this.config.debugMode || false
    };
  }
}
