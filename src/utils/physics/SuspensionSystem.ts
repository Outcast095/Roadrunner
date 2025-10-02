/**
 * Suspension System for Vehicle Physics (6 DOF)
 * Система подвески для реалистичной физики автомобиля с 6 степенями свободы
 * Поддерживает все 6 DOF: X, Y, Z, RX, RY, RZ
 * Использует Context7 рекомендации для оптимальной производительности
 */

import { Vector3 } from '@babylonjs/core';

export interface SuspensionConfig {
  // Параметры пружины
  springStiffness: number;        // Жесткость пружины (Н/м)
  springDamping: number;          // Демпфирование пружины (Н⋅с/м)
  springRestLength: number;       // Длина пружины в покое (м)
  
  // 6 DOF ограничения движения
  maxSuspensionTravel: number;    // Максимальный ход подвески (м)
  minSuspensionTravel: number;    // Минимальный ход подвески (м)
  
  // Ограничения вращения (6 DOF)
  maxSteerAngle: number;          // Максимальный угол поворота (рад)
  maxCamberAngle: number;         // Максимальный угол развала (рад)
  maxCasterAngle: number;         // Максимальный угол кастера (рад)
  
  // Точки крепления
  chassisConnectionPoint: Vector3; // Точка крепления к кузову
  wheelConnectionPoint: Vector3;   // Точка крепления к колесу
  
  // Дополнительные параметры
  rollInfluence: number;          // Влияние на крен (0-1)
  antiRollForce: number;          // Антикреновая сила (Н)
  
  // 6 DOF пружины для каждой оси
  springConfig: {
    x: { stiffness: number; damping: number; }; // Поперечная (крен)
    y: { stiffness: number; damping: number; }; // Вертикальная (подвеска)
    z: { stiffness: number; damping: number; }; // Продольная (клевок)
    rx: { stiffness: number; damping: number; }; // Крен
    ry: { stiffness: number; damping: number; }; // Тангаж
    rz: { stiffness: number; damping: number; }; // Рыскание
  };
}

export interface WheelSuspension {
  constraint: any;                // btGeneric6DofSpringConstraint
  config: SuspensionConfig;       // Конфигурация подвески
  currentCompression: number;     // Текущее сжатие (м)
  isCompressed: boolean;          // Сжата ли пружина
}

export class SuspensionSystem {
  private ammo: any;
  private constraints: Map<string, WheelSuspension> = new Map();

  constructor(ammo: any) {
    this.ammo = ammo;
  }

  /**
   * Создание подвески для колеса с 6 DOF (полная реалистичная подвеска)
   */
  createWheelSuspension(
    chassisBody: any,
    wheelBody: any,
    wheelId: string,
    config: SuspensionConfig
  ): WheelSuspension {
    console.log(`🔧 Creating suspension for wheel: ${wheelId}`);

    // 1. Создаем трансформации для точек крепления
    const chassisTransform = new this.ammo.btTransform();
    const wheelTransform = new this.ammo.btTransform();
    
    // Устанавливаем позиции точек крепления
    chassisTransform.setIdentity();
    chassisTransform.setOrigin(new this.ammo.btVector3(
      config.chassisConnectionPoint.x,
      config.chassisConnectionPoint.y,
      config.chassisConnectionPoint.z
    ));
    
    wheelTransform.setIdentity();
    wheelTransform.setOrigin(new this.ammo.btVector3(
      config.wheelConnectionPoint.x,
      config.wheelConnectionPoint.y,
      config.wheelConnectionPoint.z
    ));

    // 2. Создаем 6DOF ограничение
    const constraint = new this.ammo.btGeneric6DofSpringConstraint(
      chassisBody,
      wheelBody,
      chassisTransform,
      wheelTransform,
      true // useLinearReferenceFrameA
    );

    // 3. Настраиваем ограничения движения (1 DOF - только Y)
    this.setupSuspensionLimits(constraint, config);

    // 4. Настраиваем пружину (только по Y оси)
    this.setupSpring(constraint, config);

    // 5. Создаем объект подвески
    const suspension: WheelSuspension = {
      constraint,
      config,
      currentCompression: 0,
      isCompressed: false
    };

    // Сохраняем в реестре
    this.constraints.set(wheelId, suspension);

    console.log(`✅ Suspension created for wheel: ${wheelId}`);
    return suspension;
  }

  /**
   * Настройка ограничений движения подвески (6 DOF)
   */
  private setupSuspensionLimits(constraint: any, config: SuspensionConfig): void {
    // Линейные ограничения (X, Y, Z)
    constraint.setLinearLowerLimit(new this.ammo.btVector3(
      -0.1, // X - небольшое поперечное движение
      -config.maxSuspensionTravel, // Y - вертикальное движение (основное)
      -0.1  // Z - небольшое продольное движение
    ));
    constraint.setLinearUpperLimit(new this.ammo.btVector3(
      0.1, // X
      config.maxSuspensionTravel, // Y
      0.1  // Z
    ));
    
    // Угловые ограничения (RX, RY, RZ)
    constraint.setAngularLowerLimit(new this.ammo.btVector3(
      -config.maxCamberAngle, // RX - развал
      -config.maxCasterAngle, // RY - кастер
      -config.maxSteerAngle   // RZ - поворот (рулевое управление)
    ));
    constraint.setAngularUpperLimit(new this.ammo.btVector3(
      config.maxCamberAngle,  // RX
      config.maxCasterAngle,  // RY
      config.maxSteerAngle    // RZ
    ));
  }

  /**
   * Настройка пружин (6 DOF)
   */
  private setupSpring(constraint: any, config: SuspensionConfig): void {
    // Линейные пружины (X, Y, Z)
    // X - поперечная (крен)
    constraint.enableSpring(0, true);
    constraint.setStiffness(0, config.springConfig.x.stiffness);
    constraint.setDamping(0, config.springConfig.x.damping);
    
    // Y - вертикальная (основная подвеска)
    constraint.enableSpring(1, true);
    constraint.setStiffness(1, config.springConfig.y.stiffness);
    constraint.setDamping(1, config.springConfig.y.damping);
    
    // Z - продольная (клевок)
    constraint.enableSpring(2, true);
    constraint.setStiffness(2, config.springConfig.z.stiffness);
    constraint.setDamping(2, config.springConfig.z.damping);
    
    // Угловые пружины (RX, RY, RZ)
    // RX - крен
    constraint.enableSpring(3, true);
    constraint.setStiffness(3, config.springConfig.rx.stiffness);
    constraint.setDamping(3, config.springConfig.rx.damping);
    
    // RY - тангаж
    constraint.enableSpring(4, true);
    constraint.setStiffness(4, config.springConfig.ry.stiffness);
    constraint.setDamping(4, config.springConfig.ry.damping);
    
    // RZ - рыскание (рулевое управление)
    constraint.enableSpring(5, true);
    constraint.setStiffness(5, config.springConfig.rz.stiffness);
    constraint.setDamping(5, config.springConfig.rz.damping);
  }

  /**
   * Обновление подвески (вызывать каждый кадр)
   */
  updateSuspension(wheelId: string, deltaTime: number): void {
    const suspension = this.constraints.get(wheelId);
    if (!suspension) return;

    // Упрощенное обновление подвески без сложных вычислений
    // В реальной реализации здесь была бы более сложная логика
    suspension.currentCompression = 0; // Упрощенное значение
    suspension.isCompressed = false;

    // Применяем антикреновую силу если нужно
    if (suspension.config.antiRollForce > 0) {
      this.applyAntiRollForce(suspension, deltaTime);
    }
  }

  /**
   * Применение антикреновой силы
   */
  private applyAntiRollForce(suspension: WheelSuspension, deltaTime: number): void {
    // Упрощенная антикреновая система
    // В реальной реализации здесь была бы более сложная логика
    // Пока что просто заглушка
  }

  /**
   * Получение конфигурации подвески по умолчанию для внедорожника (6 DOF)
   */
  static getOffroadSuspensionConfig(
    chassisConnectionPoint: Vector3,
    wheelConnectionPoint: Vector3
  ): SuspensionConfig {
    return {
      // Базовые параметры пружины (совместимость)
      springStiffness: 25000,        // Н/м (мягче чем у легковушки)
      springDamping: 3000,           // Н⋅с/м
      springRestLength: 0.4,         // 40 см (больше ход)
      
      // 6 DOF ограничения движения
      maxSuspensionTravel: 0.25,     // 25 см
      minSuspensionTravel: -0.1,     // 10 см
      
      // Угловые ограничения для внедорожника
      maxSteerAngle: Math.PI / 6,    // 30 градусов поворот
      maxCamberAngle: Math.PI / 12,  // 15 градусов развал
      maxCasterAngle: Math.PI / 18,  // 10 градусов кастер
      
      // Точки крепления
      chassisConnectionPoint,
      wheelConnectionPoint,
      
      // Параметры для внедорожника
      rollInfluence: 0.3,            // Меньше влияние на крен
      antiRollForce: 5000,           // Антикреновая сила
      
      // 6 DOF конфигурация пружин для внедорожника
      springConfig: {
        x: { stiffness: 15000, damping: 2000 },   // Поперечная (мягкая)
        y: { stiffness: 25000, damping: 3000 },   // Вертикальная (основная)
        z: { stiffness: 20000, damping: 2500 },   // Продольная (клевок)
        rx: { stiffness: 10000, damping: 1500 },  // Крен (мягкий)
        ry: { stiffness: 12000, damping: 1800 },  // Тангаж
        rz: { stiffness: 8000, damping: 1200 }    // Рыскание (рулевое)
      }
    };
  }

  /**
   * Получение конфигурации подвески для легкового автомобиля (6 DOF)
   */
  static getCarSuspensionConfig(
    chassisConnectionPoint: Vector3,
    wheelConnectionPoint: Vector3
  ): SuspensionConfig {
    return {
      // Базовые параметры пружины (совместимость)
      springStiffness: 35000,        // Н/м
      springDamping: 4500,           // Н⋅с/м
      springRestLength: 0.3,         // 30 см
      
      // 6 DOF ограничения движения
      maxSuspensionTravel: 0.15,     // 15 см
      minSuspensionTravel: -0.05,    // 5 см
      
      // Угловые ограничения для легковушки
      maxSteerAngle: Math.PI / 4,    // 45 градусов поворот
      maxCamberAngle: Math.PI / 18,  // 10 градусов развал
      maxCasterAngle: Math.PI / 24,  // 7.5 градусов кастер
      
      // Точки крепления
      chassisConnectionPoint,
      wheelConnectionPoint,
      
      // Параметры для легковушки
      rollInfluence: 0.5,            // Больше влияние на крен
      antiRollForce: 8000,           // Больше антикреновая сила
      
      // 6 DOF конфигурация пружин для легковушки
      springConfig: {
        x: { stiffness: 25000, damping: 3500 },   // Поперечная (жесткая)
        y: { stiffness: 35000, damping: 4500 },   // Вертикальная (основная)
        z: { stiffness: 30000, damping: 4000 },   // Продольная (клевок)
        rx: { stiffness: 20000, damping: 3000 },  // Крен (жесткий)
        ry: { stiffness: 25000, damping: 3500 },  // Тангаж
        rz: { stiffness: 15000, damping: 2500 }   // Рыскание (рулевое)
      }
    };
  }

  /**
   * Получение конфигурации подвески для спортивного автомобиля (6 DOF)
   */
  static getSportsCarSuspensionConfig(
    chassisConnectionPoint: Vector3,
    wheelConnectionPoint: Vector3
  ): SuspensionConfig {
    return {
      // Базовые параметры пружины (совместимость)
      springStiffness: 50000,        // Н/м (очень жесткая)
      springDamping: 6000,           // Н⋅с/м
      springRestLength: 0.25,        // 25 см (короткий ход)
      
      // 6 DOF ограничения движения
      maxSuspensionTravel: 0.1,      // 10 см (минимальный ход)
      minSuspensionTravel: -0.03,    // 3 см
      
      // Угловые ограничения для спорткара
      maxSteerAngle: Math.PI / 3,    // 60 градусов поворот
      maxCamberAngle: Math.PI / 9,   // 20 градусов развал
      maxCasterAngle: Math.PI / 12,  // 15 градусов кастер
      
      // Точки крепления
      chassisConnectionPoint,
      wheelConnectionPoint,
      
      // Параметры для спорткара
      rollInfluence: 0.7,            // Максимальное влияние на крен
      antiRollForce: 12000,          // Максимальная антикреновая сила
      
      // 6 DOF конфигурация пружин для спорткара
      springConfig: {
        x: { stiffness: 40000, damping: 5000 },   // Поперечная (очень жесткая)
        y: { stiffness: 50000, damping: 6000 },   // Вертикальная (основная)
        z: { stiffness: 45000, damping: 5500 },   // Продольная (клевок)
        rx: { stiffness: 35000, damping: 4500 },  // Крен (очень жесткий)
        ry: { stiffness: 40000, damping: 5000 },  // Тангаж
        rz: { stiffness: 25000, damping: 4000 }   // Рыскание (рулевое)
      }
    };
  }

  /**
   * Получение информации о подвеске
   */
  getSuspensionInfo(wheelId: string): {
    compression: number;
    isCompressed: boolean;
    springForce: number;
  } | null {
    const suspension = this.constraints.get(wheelId);
    if (!suspension) return null;

    const springForce = suspension.currentCompression * suspension.config.springStiffness;

    return {
      compression: suspension.currentCompression,
      isCompressed: suspension.isCompressed,
      springForce
    };
  }

  /**
   * Удаление подвески
   */
  removeSuspension(wheelId: string): void {
    const suspension = this.constraints.get(wheelId);
    if (!suspension) return;

    console.log(`🗑️ Removing suspension for wheel: ${wheelId}`);

    // Освобождаем ограничение
    this.ammo.destroy(suspension.constraint);
    
    // Удаляем из реестра
    this.constraints.delete(wheelId);
    
    console.log(`✅ Suspension removed for wheel: ${wheelId}`);
  }

  /**
   * Очистка всех подвесок
   */
  dispose(): void {
    console.log('🧹 Disposing suspension system...');
    
    for (const wheelId of this.constraints.keys()) {
      this.removeSuspension(wheelId);
    }
    
    this.constraints.clear();
    console.log('✅ Suspension system disposed');
  }

  /**
   * Получение статистики системы
   */
  getStats(): {
    suspensionCount: number;
    activeSuspensions: string[];
  } {
    return {
      suspensionCount: this.constraints.size,
      activeSuspensions: Array.from(this.constraints.keys())
    };
  }
}
