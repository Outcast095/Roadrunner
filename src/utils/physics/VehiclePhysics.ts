/**
 * Vehicle Physics System
 * Физическая модель автомобиля с интеграцией существующей визуальной модели
 * Использует Context7 рекомендации для оптимальной производительности
 */

import { AbstractMesh, Vector3, Quaternion } from '@babylonjs/core';
import { PhysicsManager } from './PhysicsManager';
import { PhysicsBodyFactory } from './PhysicsBodies';
import type { PhysicsBody } from './PhysicsBodies';

export interface VehicleConfig {
  // Основные параметры автомобиля
  mass: number;                    // Масса автомобиля (кг)
  centerOfMass: Vector3;          // Центр масс
  wheelbase: number;              // Колесная база (м)
  trackWidth: number;             // Колея (м)
  
  // Параметры двигателя
  maxEngineForce: number;         // Максимальная сила двигателя (Н)
  maxBrakeForce: number;          // Максимальная сила торможения (Н)
  maxSteerAngle: number;          // Максимальный угол поворота (рад)
  
  // Параметры колес
  wheelRadius: number;            // Радиус колеса (м)
  wheelWidth: number;             // Ширина колеса (м)
  wheelFriction: number;          // Трение колес
  wheelRollingFriction: number;   // Катящееся трение
  wheelSpinningFriction: number;  // Скользящее трение
}

export interface WheelPhysics {
  mesh: AbstractMesh;             // Существующий визуальный объект колеса
  rigidBody: any;                 // Физическое тело колеса
  position: Vector3;              // Позиция колеса относительно шасси
  isSteerable: boolean;           // Управляемое колесо
  isDriven: boolean;              // Ведущее колесо
}

export interface VehiclePhysics {
  chassis: PhysicsBody;           // Физическое тело шасси
  wheels: WheelPhysics[];         // Физические тела колес
  config: VehicleConfig;          // Конфигурация автомобиля
  currentSteerAngle: number;      // Текущий угол поворота
  currentEngineForce: number;     // Текущая сила двигателя
  currentBrakeForce: number;      // Текущая сила торможения
  velocity: Vector3;              // Текущая скорость
  angularVelocity: Vector3;       // Угловая скорость
}

export class VehiclePhysicsSystem {
  private physicsManager: PhysicsManager;
  private bodyFactory: PhysicsBodyFactory;
  private ammo: any;
  private vehicles: Map<string, VehiclePhysics> = new Map();

  constructor(physicsManager: PhysicsManager) {
    this.physicsManager = physicsManager;
    this.bodyFactory = new PhysicsBodyFactory(physicsManager);
    this.ammo = physicsManager.getAmmo();
  }

  /**
   * Создание физической модели автомобиля на основе существующих мешей
   */
  createVehicle(
    chassisMesh: AbstractMesh,
    wheelMeshes: AbstractMesh[],
    config?: Partial<VehicleConfig>
  ): VehiclePhysics {
    const defaultConfig: VehicleConfig = {
      mass: 1200,                    // 1200 кг
      centerOfMass: new Vector3(0, -0.5, 0), // Центр масс ниже центра
      wheelbase: 2.5,               // 2.5 м
      trackWidth: 1.6,              // 1.6 м
      maxEngineForce: 3000,         // 3000 Н
      maxBrakeForce: 10000,         // 10000 Н
      maxSteerAngle: Math.PI / 6,   // 30 градусов
      wheelRadius: 0.3,             // 30 см
      wheelWidth: 0.2,              // 20 см
      wheelFriction: 0.8,           // Трение колес
      wheelRollingFriction: 0.1,    // Катящееся трение
      wheelSpinningFriction: 0.1,   // Скользящее трение
      ...config
    };

    console.log('🚗 Creating vehicle physics for existing meshes...');

    // Создаем физическое тело шасси на основе существующего меша
    const chassis = this.createChassisPhysics(chassisMesh, defaultConfig);
    
    // Создаем физические тела колес на основе существующих мешей
    const wheels = this.createWheelsPhysics(wheelMeshes, defaultConfig);
    
    // Создаем физическую модель автомобиля
    const vehicle: VehiclePhysics = {
      chassis,
      wheels,
      config: defaultConfig,
      currentSteerAngle: 0,
      currentEngineForce: 0,
      currentBrakeForce: 0,
      velocity: Vector3.Zero(),
      angularVelocity: Vector3.Zero()
    };

    // Регистрируем автомобиль
    const vehicleId = `vehicle_${chassisMesh.uniqueId}`;
    this.vehicles.set(vehicleId, vehicle);

    console.log('✅ Vehicle physics created successfully:', vehicleId);
    return vehicle;
  }

  /**
   * Создание физического тела шасси на основе существующего меша
   */
  private createChassisPhysics(chassisMesh: AbstractMesh, config: VehicleConfig): PhysicsBody {
    console.log('🔧 Creating chassis physics...');
    console.log('🔧 Chassis visual position:', chassisMesh.position);
    
    return this.bodyFactory.createBoxBody(chassisMesh, {
      mass: config.mass,
      friction: 0.7,
      restitution: 0.1,
      linearDamping: 0.1,
      angularDamping: 0.1,
      material: {
        friction: 0.7,
        restitution: 0.1,
        rollingFriction: 0.1,
        spinningFriction: 0.1
      }
    });
  }

  /**
   * Создание физических тел колес на основе существующих мешей
   */
  private createWheelsPhysics(wheelMeshes: AbstractMesh[], config: VehicleConfig): WheelPhysics[] {
    console.log('🔧 Creating wheels physics...');
    
    const wheels: WheelPhysics[] = [];

    for (let i = 0; i < wheelMeshes.length; i++) {
      const wheelMesh = wheelMeshes[i];
      
      // Используем реальную позицию визуального меша колеса
      const wheelPosition = wheelMesh.position.clone();
      console.log(`🔧 Wheel ${i + 1} visual position:`, wheelPosition);
      
      console.log(`🔧 Creating physics for wheel ${i + 1}...`);
      
      // Создаем физическое тело колеса на основе существующего меша
      const wheelBody = this.bodyFactory.createCylinderBody(wheelMesh, {
        mass: 20, // 20 кг на колесо
        friction: config.wheelFriction,
        restitution: 0.1,
        linearDamping: 0.1,
        angularDamping: 0.1,
        material: {
          friction: config.wheelFriction,
          restitution: 0.1,
          rollingFriction: config.wheelRollingFriction,
          spinningFriction: config.wheelSpinningFriction
        }
      });

      // Определяем тип колеса
      const isSteerable = i < 2; // Передние колеса управляемые
      const isDriven = i >= 2;   // Задние колеса ведущие

      const wheel: WheelPhysics = {
        mesh: wheelMesh,           // Используем существующий меш
        rigidBody: wheelBody.rigidBody,
        position: wheelPosition,
        isSteerable,
        isDriven
      };

      wheels.push(wheel);
    }

    console.log(`✅ Created physics for ${wheels.length} wheels`);
    return wheels;
  }

  /**
   * Применение управления к автомобилю
   */
  applyControl(vehicleId: string, controls: {
    engineForce?: number;    // Сила двигателя (-1 до 1)
    brakeForce?: number;     // Сила торможения (0 до 1)
    steerAngle?: number;     // Угол поворота (-1 до 1)
  }): void {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) {
      console.warn('Vehicle not found:', vehicleId);
      return;
    }

    // Обновляем параметры управления
    if (controls.engineForce !== undefined) {
      vehicle.currentEngineForce = controls.engineForce * vehicle.config.maxEngineForce;
    }
    if (controls.brakeForce !== undefined) {
      vehicle.currentBrakeForce = controls.brakeForce * vehicle.config.maxBrakeForce;
    }
    if (controls.steerAngle !== undefined) {
      vehicle.currentSteerAngle = controls.steerAngle * vehicle.config.maxSteerAngle;
    }

    // Применяем управление к шасси
    this.applySimpleVehicleControl(vehicle);
  }

  /**
   * Упрощенное управление автомобилем через силы (Context7 оптимизация)
   */
  private applySimpleVehicleControl(vehicle: VehiclePhysics): void {
    const chassis = vehicle.chassis.rigidBody;
    
    // Применяем двигательную силу
    if (vehicle.currentEngineForce !== 0) {
      const force = new this.ammo.btVector3(0, 0, vehicle.currentEngineForce);
      chassis.applyCentralForce(force);
      this.ammo.destroy(force);
    }
    
    // Применяем торможение
    if (vehicle.currentBrakeForce > 0) {
      const velocity = chassis.getLinearVelocity();
      const brakeForce = new this.ammo.btVector3(
        -velocity.x() * vehicle.currentBrakeForce * 0.1,
        -velocity.y() * vehicle.currentBrakeForce * 0.1,
        -velocity.z() * vehicle.currentBrakeForce * 0.1
      );
      chassis.applyCentralForce(brakeForce);
      this.ammo.destroy(brakeForce);
    }
    
    // Применяем поворот
    if (vehicle.currentSteerAngle !== 0) {
      const torque = new this.ammo.btVector3(0, vehicle.currentSteerAngle * 100, 0);
      chassis.applyTorque(torque);
      this.ammo.destroy(torque);
    }
  }

  /**
   * Обновление физики автомобиля
   */
  updateVehicle(vehicleId: string, deltaTime: number): void {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) return;

    // Обновляем скорость и угловую скорость
    const velocity = vehicle.chassis.rigidBody.getLinearVelocity();
    const angularVelocity = vehicle.chassis.rigidBody.getAngularVelocity();
    
    vehicle.velocity.set(velocity.x(), velocity.y(), velocity.z());
    vehicle.angularVelocity.set(angularVelocity.x(), angularVelocity.y(), angularVelocity.z());

    // Обновляем позиции колес (синхронизация с физикой)
    this.updateWheelPositions(vehicle);
  }

  /**
   * Обновление позиций колес (синхронизация визуального представления)
   */
  private updateWheelPositions(vehicle: VehiclePhysics): void {
    for (const wheel of vehicle.wheels) {
      // Получаем трансформацию колеса из физики
      const transform = wheel.rigidBody.getWorldTransform();
      const position = transform.getOrigin();
      const rotation = transform.getRotation();

      // Обновляем визуальное представление существующего меша
      wheel.mesh.position.set(position.x(), position.y(), position.z());
      wheel.mesh.rotationQuaternion = new Quaternion(
        rotation.x(),
        rotation.y(),
        rotation.z(),
        rotation.w()
      );
    }
  }

  /**
   * Получение информации об автомобиле
   */
  getVehicleInfo(vehicleId: string): {
    velocity: Vector3;
    angularVelocity: Vector3;
    position: Vector3;
    rotation: Quaternion;
    speed: number;
  } | null {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) return null;

    const chassisTransform = vehicle.chassis.rigidBody.getWorldTransform();
    const position = chassisTransform.getOrigin();
    const rotation = chassisTransform.getRotation();

    return {
      velocity: vehicle.velocity.clone(),
      angularVelocity: vehicle.angularVelocity.clone(),
      position: new Vector3(position.x(), position.y(), position.z()),
      rotation: new Quaternion(rotation.x(), rotation.y(), rotation.z(), rotation.w()),
      speed: vehicle.velocity.length()
    };
  }

  /**
   * Удаление автомобиля
   */
  removeVehicle(vehicleId: string): void {
    const vehicle = this.vehicles.get(vehicleId);
    if (!vehicle) return;

    console.log('🗑️ Removing vehicle:', vehicleId);

    // Удаляем физические тела
    this.bodyFactory.removeBody(vehicle.chassis);
    for (const wheel of vehicle.wheels) {
      this.bodyFactory.removeBody({
        mesh: wheel.mesh,
        rigidBody: wheel.rigidBody,
        collisionShape: null,
        motionState: null,
        id: '',
        config: {} as any
      });
    }

    // Удаляем из реестра
    this.vehicles.delete(vehicleId);
    console.log('✅ Vehicle removed successfully');
  }

  /**
   * Получение статистики системы
   */
  getStats(): {
    vehicleCount: number;
    activeVehicles: string[];
  } {
    return {
      vehicleCount: this.vehicles.size,
      activeVehicles: Array.from(this.vehicles.keys())
    };
  }

  /**
   * Очистка всех автомобилей
   */
  dispose(): void {
    console.log('🧹 Disposing vehicle physics system...');
    
    for (const vehicleId of this.vehicles.keys()) {
      this.removeVehicle(vehicleId);
    }
    
    this.vehicles.clear();
    console.log('✅ Vehicle physics system disposed');
  }
}
