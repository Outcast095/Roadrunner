/**
 * Physics Manager for Ammo.js integration
 * Управление физическим миром с гравитацией
 */

export interface PhysicsWorldConfig {
  gravity: { x: number; y: number; z: number };
  timeStep?: number;
  /**
   * Максимальное количество подшагов физики за кадр
   * Рекомендуемые значения:
   * - 1-2: Максимальная производительность, возможна нестабильность
   * - 3: Оптимальный баланс (рекомендуется для RoadRunner)
   * - 4-5: Повышенная стабильность, небольшой overhead
   * - 10+: Избыточно, сильно снижает FPS
   * @default 3
   */
  maxSubSteps?: number;
  enableCCDByDefault?: boolean;
}

/**
 * Collision Groups (битовые маски для фильтрации столкновений)
 * Используйте побитовые операции для комбинирования групп
 */
export enum CollisionGroup {
  NONE = 0,
  PLAYER = 1 << 0,      // 1 - Машина игрока
  DYNAMIC = 1 << 1,     // 2 - Бочки, камни (динамические)
  ENVIRONMENT = 1 << 2, // 4 - Деревья, статичные препятствия
  TERRAIN = 1 << 3,     // 8 - Земля, рельеф
  TRIGGER = 1 << 4,     // 16 - Триггеры (топливо, checkpoints)
  ALL = -1              // Коллизия со всеми группами
}

export class PhysicsManager {
  private ammo: any | null = null;
  private world: any | null = null;
  private config: PhysicsWorldConfig;
  private isInitialized = false;
  private rigidBodies: Set<any> = new Set();
  
  // Компоненты физического мира (для корректного destroy)
  private collisionConfiguration: any | null = null;
  private dispatcher: any | null = null;
  private broadphase: any | null = null;
  private solver: any | null = null;

  constructor(config?: Partial<PhysicsWorldConfig>) {
    this.config = {
      gravity: { x: 0, y: -9.81, z: 0 },
      timeStep: 1/60,
      maxSubSteps: 3, // Оптимизировано: 3 sub-steps для баланса производительности и стабильности
      enableCCDByDefault: false,
      ...config
    };
  }

  /**
   * Инициализация Ammo.js и создание физического мира
   */
  initialize(ammo: any): void {
    if (this.isInitialized) {
      console.warn('⚠️ PhysicsManager уже инициализирован');
      return;
    }

    try {
      if (!ammo || typeof ammo !== 'object' || !ammo.btDefaultCollisionConfiguration) {
        throw new Error('Invalid Ammo.js object provided');
      }
      this.ammo = ammo;

      // Создаем физический мир
      this.createPhysicsWorld();
      // Физический мир создан

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

    // Создаём компоненты в правильном порядке и сохраняем ссылки для destroy
    this.collisionConfiguration = new this.ammo.btDefaultCollisionConfiguration();
    this.dispatcher = new this.ammo.btCollisionDispatcher(this.collisionConfiguration);
    this.broadphase = new this.ammo.btDbvtBroadphase();
    this.solver = new this.ammo.btSequentialImpulseConstraintSolver();

    this.world = new this.ammo.btDiscreteDynamicsWorld(
      this.dispatcher, 
      this.broadphase, 
      this.solver, 
      this.collisionConfiguration
    );

    const gravity = new this.ammo.btVector3(this.config.gravity.x, this.config.gravity.y, this.config.gravity.z);
    this.world.setGravity(gravity);
    this.ammo.destroy(gravity);
  }

  /**
   * Обновление физики с оптимизированными sub-steps
   */
  update(deltaTime: number): void {
    if (!this.world || !this.ammo) {
      console.warn('⚠️ Physics world not initialized');
      return;
    }

    // Ограничиваем maxSubSteps до разумных пределов (cap на 10 для безопасности)
    const maxSubSteps = Math.min(this.config.maxSubSteps || 3, 10);
    const timeStep = this.config.timeStep || 1/60;
    
    this.world.stepSimulation(deltaTime, maxSubSteps, timeStep);
  }

  /**
   * Добавление физического тела в мир
   * 
   * ВАЖНО: Для установки collision groups/masks используйте setCollisionFilter() 
   * ПЕРЕД вызовом addRigidBody()
   * 
   * @param rigidBody - Физическое тело
   * 
   * @example
   * // Правильный порядок:
   * physicsManager.setCollisionFilter(rigidBody, CollisionGroup.PLAYER, CollisionGroup.ALL);
   * physicsManager.addRigidBody(rigidBody);
   */
  addRigidBody(rigidBody: any): void {
    if (!this.world) {
      throw new Error('Физический мир не инициализирован');
    }

    try {
      this.world.addRigidBody(rigidBody);
      this.rigidBodies.add(rigidBody);
    } catch (error) {
      console.error('❌ Error adding rigid body:', error);
      throw error;
    }
  }

  /**
   * Удаление физического тела из мира
   */
  removeRigidBody(rigidBody: any): void {
    if (!this.world) {
      throw new Error('Физический мир не инициализирован');
    }
    try {
      this.world.removeRigidBody(rigidBody);
      this.rigidBodies.delete(rigidBody);
    } catch (error) {
      console.error('❌ Error removing rigid body:', error);
    }
  }

  /**
   * Включение CCD (Continuous Collision Detection) для предотвращения tunneling
   * Критично для быстрых объектов (машина на скорости, падающие бочки)
   * 
   * @param rigidBody - Физическое тело
   * @param threshold - Порог скорости для активации CCD (м/с). Напр. 1.0 для машины
   * @param radius - Радиус "заметаемой" сферы. Обычно ~половина размера объекта
   */
  enableCCD(rigidBody: any, threshold: number = 1.0, radius: number = 0.5): void {
    if (!rigidBody) {
      console.warn('⚠️ Invalid rigidBody for CCD');
      return;
    }

    try {
      if (rigidBody.setCcdMotionThreshold && rigidBody.setCcdSweptSphereRadius) {
        rigidBody.setCcdMotionThreshold(threshold);
        rigidBody.setCcdSweptSphereRadius(radius);
        console.log(`🔧 CCD enabled: threshold=${threshold.toFixed(2)} m/s, radius=${radius.toFixed(2)} m`);
      } else {
        console.warn('⚠️ CCD methods not available on this rigidBody');
      }
    } catch (error) {
      console.error('❌ Error enabling CCD:', error);
    }
  }

  /**
   * Отключение CCD для тела
   */
  disableCCD(rigidBody: any): void {
    if (!rigidBody) return;

    try {
      if (rigidBody.setCcdMotionThreshold) {
        rigidBody.setCcdMotionThreshold(0); // 0 = отключено
        console.log('🔧 CCD disabled');
      }
    } catch (error) {
      console.error('❌ Error disabling CCD:', error);
    }
  }

  /**
   * Установка collision groups и mask на collision shape
   * ВАЖНО: Вызывать ПОСЛЕ создания shape, но ДО создания rigidBody
   * 
   * @param shape - Collision shape (btBoxShape, btSphereShape и т.д.)
   * @param group - Группа коллизий (битовая маска)
   * @param mask - Маска коллизий (с какими группами может сталкиваться)
   * 
   * Правильный порядок:
   * 1. Создать shape: `const shape = new ammo.btBoxShape(...)`
   * 2. Установить фильтр: `setCollisionFilter(shape, group, mask)`
   * 3. Создать rigidBody с этим shape
   * 4. Добавить в мир: `addRigidBody(rigidBody)`
   * 
   * @example
   * // Машина
   * const shape = new ammo.btBoxShape(halfExtents);
   * physicsManager.setCollisionFilter(shape, CollisionGroup.PLAYER, CollisionGroup.ALL & ~CollisionGroup.PLAYER);
   * const rigidBody = new ammo.btRigidBody(bodyInfo);
   */
  setCollisionFilter(shape: any, group: number, mask: number): void {
    if (!shape) {
      console.warn('⚠️ Collision shape required for filter');
      return;
    }

    try {
      // Устанавливаем фильтры напрямую на shape (работает в Bullet/Ammo.js)
      if (shape.setCollisionFilterGroup && shape.setCollisionFilterMask) {
        shape.setCollisionFilterGroup(group);
        shape.setCollisionFilterMask(mask);
        console.log(`🔧 Collision filter set on shape: group=${group}, mask=${mask}`);
      } else {
        console.warn('⚠️ Shape does not support collision filters');
      }
    } catch (error) {
      console.error('❌ Error setting collision filter:', error);
    }
  }

  /**
   * Добавление ограничения в мир
   */
  addConstraint(constraint: any, disableCollisionsBetweenLinkedBodies: boolean = true): void {
    if (!this.world) {
      throw new Error('Физический мир не инициализирован');
    }
    try {
      this.world.addConstraint(constraint, disableCollisionsBetweenLinkedBodies);
    } catch (error) {
      console.error('❌ Error adding constraint:', error);
    }
  }

  /**
   * Удаление ограничения из мира
   */
  removeConstraint(constraint: any): void {
    if (!this.world) {
      throw new Error('Физический мир не инициализирован');
    }
    try {
      this.world.removeConstraint(constraint);
    } catch (error) {
      console.error('❌ Error removing constraint:', error);
    }
  }

  /**
   * Добавление действия (например, btRaycastVehicle)
   */
  addAction(action: any): void {
    if (!this.world) {
      throw new Error('Физический мир не инициализирован');
    }
    try {
      this.world.addAction(action);
    } catch (error) {
      console.error('❌ Error adding action:', error);
    }
  }

  /**
   * Удаление действия
   */
  removeAction(action: any): void {
    if (!this.world) {
      throw new Error('Физический мир не инициализирован');
    }
    try {
      this.world.removeAction(action);
    } catch (error) {
      console.error('❌ Error removing action:', error);
    }
  }

  /**
   * Получение физического мира
   */
  getPhysicsWorld(): any | null {
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

    this.config.gravity = { x, y, z };
    const gravity = new this.ammo.btVector3(x, y, z);
    this.world.setGravity(gravity);
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
    this.setGravity(0, -9.81, 0);
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
   * Очистка ресурсов (в обратном порядке создания для предотвращения утечек памяти)
   */
  dispose(): void {
    if (!this.ammo) {
      return;
    }

    try {
      // Удаляем все rigidBodies из мира перед уничтожением
      if (this.world) {
        this.rigidBodies.forEach(body => {
          try {
            this.world.removeRigidBody(body);
          } catch (error) {
            console.warn('⚠️ Error removing rigid body during disposal:', error);
          }
        });
      }
      this.rigidBodies.clear();

      // Уничтожаем компоненты в обратном порядке создания (критично для Bullet Physics!)
      // Порядок: world → solver → broadphase → dispatcher → collisionConfiguration
      if (this.world) {
        this.ammo.destroy(this.world);
        this.world = null;
      }
      
      if (this.solver) {
        this.ammo.destroy(this.solver);
        this.solver = null;
      }
      
      if (this.broadphase) {
        this.ammo.destroy(this.broadphase);
        this.broadphase = null;
      }
      
      if (this.dispatcher) {
        this.ammo.destroy(this.dispatcher);
        this.dispatcher = null;
      }
      
      if (this.collisionConfiguration) {
        this.ammo.destroy(this.collisionConfiguration);
        this.collisionConfiguration = null;
      }

      console.log('✅ PhysicsManager disposed (memory cleaned)');
    } catch (error) {
      console.error('❌ Error during PhysicsManager disposal:', error);
    }

    this.ammo = null;
    this.isInitialized = false;
  }

  /**
   * Получение информации о физическом мире для отладки
   */
  getDebugInfo(): {
    isInitialized: boolean;
    gravity: { x: number; y: number; z: number };
    numObjects: number;
    ammoLoaded: boolean;
    timeStep: number;
    maxSubSteps: number;
    enableCCDByDefault: boolean;
  } {
    let numObjects = 0;
    try {
      // Используем реальный счётчик из world для точности
      if (this.world && this.world.getNumCollisionObjects) {
        numObjects = this.world.getNumCollisionObjects();
      } else {
        // Fallback на локальный Set если world не инициализирован
        numObjects = this.rigidBodies.size;
      }
    } catch (error) {
      console.warn('⚠️ Error getting numCollisionObjects:', error);
      // Последний fallback на локальный Set
      numObjects = this.rigidBodies.size;
    }

    return {
      isInitialized: this.isInitialized,
      gravity: this.config.gravity,
      numObjects,
      ammoLoaded: this.ammo !== null,
      timeStep: this.config.timeStep || 1/60,
      maxSubSteps: this.config.maxSubSteps || 3,
      enableCCDByDefault: this.config.enableCCDByDefault || false
    };
  }
}