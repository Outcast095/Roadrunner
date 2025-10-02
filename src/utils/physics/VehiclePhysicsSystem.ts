/**
 * Vehicle Physics System
 * Управление физикой транспортных средств с использованием Ammo.js
 */

import { PhysicsManager } from './PhysicsManager';
import { Vector3, Quaternion } from '@babylonjs/core';

export interface VehicleConfig {
  mass: number; // 1200–2000 кг
  maxEngineForce: number; // mass * acc, напр. 1500 * 5 = 7500 Н
  maxBrakeForce: number; // 1000–2000 Н
  maxSteerAngle: number; // ±0.52 рад (~30°)
  suspensionStiffness: number; // 20–40 (Bullet: Hz²)
  suspensionDamping: number; // 0.2–0.5 (Bullet: ratio 0–1, matching 2–5 scaled)
  suspensionCompression: number; // 0.8–0.9
  suspensionRestLength: number; // 0.3–0.5 м
  rollInfluence: number; // 0.1–0.3
  wheelRadius: number; // 0.4–0.5 м
  wheelWidth: number; // 0.2–0.3 м
  wheelFriction: number; // 1.0–2.0
  wheelRollingFriction?: number; // 0.001–0.01
  wheelSpinningFriction?: number; // 0.8–1.0
  wheelOffset: { x: number; y: number; z: number }[]; // [FL, FR, BL, BR]
  centerOfMassOffset: { x: number; y: number; z: number }; // {x:0, y:-0.4, z:0} для устойчивости
  collisionGroup: number;
  collisionMask: number;
  wheelbase?: number; // Длина базы ~2.5–3 м
  trackWidth?: number; // Колея ~1.5–1.8 м
}

export interface VehicleControl {
  engineForce: number; // Нормализованная: -1..1 (throttle/reverse)
  brakeForce: number; // Нормализованная: 0..1
  steerAngle: number; // Нормализованная: -1..1
}

export interface VehicleStats {
  speed: number; // км/ч
  rpm: number; // Заглушка, рассчитай по необходимости
  wheelRotations: number[];
  position: { x: number; y: number; z: number };
}

export class VehiclePhysicsSystem {
  private vehicles: Map<string, { vehicle: any; body: any; wheels: any[]; config: VehicleConfig }> = new Map();
  private physicsManager: PhysicsManager;

  constructor(physicsManager: PhysicsManager) {
    this.physicsManager = physicsManager;
  }

  /**
   * Создание физического тела для шасси
   */
  private createVehiclePhysicsBody(body: any, config: VehicleConfig): any {
    const ammo = this.physicsManager.getAmmo();
    if (!ammo) {
      throw new Error('Ammo.js не загружен');
    }

    // Создание геометрии коллизии (box от scaling mesh)
    const halfExtents = new ammo.btVector3(
      body.scaling.x / 2,
      body.scaling.y / 2,
      body.scaling.z / 2
    );
    const geometry = new ammo.btBoxShape(halfExtents);

    // Создание трансформации
    const transform = new ammo.btTransform();
    transform.setIdentity();
    const origin = new ammo.btVector3(body.position.x, body.position.y, body.position.z);
    transform.setOrigin(origin);

    // Ротация: используем quaternion напрямую, если доступен
    let quaternion: any;
    if (body.rotationQuaternion) {
      quaternion = new ammo.btQuaternion(
        body.rotationQuaternion.x,
        body.rotationQuaternion.y,
        body.rotationQuaternion.z,
        body.rotationQuaternion.w
      );
    } else {
      // Fallback на Euler (в радианах)
      const rotation = body.rotation || Vector3.Zero();
      const cosX = Math.cos(rotation.x * 0.5);
      const sinX = Math.sin(rotation.x * 0.5);
      const cosY = Math.cos(rotation.y * 0.5);
      const sinY = Math.sin(rotation.y * 0.5);
      const cosZ = Math.cos(rotation.z * 0.5);
      const sinZ = Math.sin(rotation.z * 0.5);
      const w = cosX * cosY * cosZ + sinX * sinY * sinZ;
      const x = sinX * cosY * cosZ - cosX * sinY * sinZ;
      const y = cosX * sinY * cosZ + sinX * cosY * sinZ;
      const z = cosX * cosY * sinZ - sinX * sinY * cosZ;
      quaternion = new ammo.btQuaternion(x, y, z, w);
    }
    transform.setRotation(quaternion);

    const motionState = new ammo.btDefaultMotionState(transform);
    const localInertia = new ammo.btVector3(0, 0, 0);
    geometry.calculateLocalInertia(config.mass, localInertia);

    const bodyInfo = new ammo.btRigidBodyConstructionInfo(
      config.mass,
      motionState,
      geometry,
      localInertia
    );

    const rigidBody = new ammo.btRigidBody(bodyInfo);
    rigidBody.setActivationState(4); // DISABLE_DEACTIVATION

    // Применяем центр масс
    if (config.centerOfMassOffset) {
      const centerOfMassTransform = new ammo.btTransform();
      centerOfMassTransform.setIdentity();
      const comOffset = new ammo.btVector3(
        config.centerOfMassOffset.x,
        config.centerOfMassOffset.y,
        config.centerOfMassOffset.z
      );
      centerOfMassTransform.setOrigin(comOffset);
      rigidBody.setCenterOfMassTransform(centerOfMassTransform);
      ammo.destroy(comOffset);
      ammo.destroy(centerOfMassTransform);
    }

    this.physicsManager.addRigidBody(rigidBody);

    // Очистка
    ammo.destroy(transform);
    ammo.destroy(localInertia);
    ammo.destroy(bodyInfo);
    ammo.destroy(quaternion);
    ammo.destroy(origin);
    ammo.destroy(halfExtents);

    return rigidBody;
  }

 /**
 * Создание RaycastVehicle
 */
private createRaycastVehicle(physicsBody: any, wheels: any[], config: VehicleConfig): any {
  const ammo = this.physicsManager.getAmmo();
  if (!ammo) {
    throw new Error('Ammo.js не загружен');
  }

  const tuning = new ammo.btVehicleTuning();
  tuning.set_m_suspensionStiffness(config.suspensionStiffness);
  tuning.set_m_suspensionDamping(config.suspensionDamping);
  tuning.set_m_suspensionCompression(config.suspensionCompression);
  tuning.set_m_maxSuspensionTravelCm(30); // 0.3 м для неровностей
  tuning.set_m_frictionSlip(config.wheelFriction);

  const raycastVehicle = new ammo.btRaycastVehicle(
    tuning,
    physicsBody,
    new ammo.btDefaultVehicleRaycaster(this.physicsManager.getPhysicsWorld())
  );
  raycastVehicle.setCoordinateSystem(0, 1, 2); // X right, Y up, Z forward

  // Проверяем 4 колеса
  if (wheels.length !== 4) {
    throw new Error('Требуется ровно 4 колеса');
  }

  wheels.forEach((wheel, index) => {
    const wheelPos = config.wheelOffset[index];
    if (!wheelPos) {
      throw new Error(`Invalid wheel offset for index: ${index}`);
    }
    const isFrontWheel = index < 2;
    const wheelInfo = raycastVehicle.addWheel(
      new ammo.btVector3(wheelPos.x, wheelPos.y, wheelPos.z),
      new ammo.btVector3(0, -1, 0), // wheelDirectionCS0
      new ammo.btVector3(-1, 0, 0), // wheelAxleCS
      config.suspensionRestLength,
      config.wheelRadius,
      tuning,
      isFrontWheel
    );
    
    // Устанавливаем rolling friction напрямую (дефолт 0.01 для реалистичного качения)
    wheelInfo.m_rollingFriction = config.wheelRollingFriction !== undefined ? config.wheelRollingFriction : 0.01;
    
    // wheelSpinningFriction удалён — используй wheelFriction для сцепления/пробуксовки через tuning
  });

  this.physicsManager.addAction(raycastVehicle);
  return raycastVehicle;
}

  /**
   * Создание физики транспортного средства
   */
  createVehicle(body: any, wheels: any[], config: VehicleConfig): string {
    try {
      const vehicleId = `vehicle_${body.uniqueId}`;
      const physicsBody = this.createVehiclePhysicsBody(body, config);
      const vehicle = this.createRaycastVehicle(physicsBody, wheels, config);
      
      this.vehicles.set(vehicleId, { vehicle, body, wheels, config });
      console.log(`🚗 Vehicle created: ${vehicleId}, mass: ${config.mass}kg`);
      
      return vehicleId;
    } catch (error) {
      console.error('❌ Error creating vehicle:', error);
      throw error;
    }
  }

  /**
   * Применение управления к транспортному средству (AWD)
   */
  applyControl(vehicleId: string, control: VehicleControl): void {
    const vehicleData = this.vehicles.get(vehicleId);
    if (!vehicleData) {
      console.warn('⚠️ Vehicle not found:', vehicleId);
      return;
    }

    const { vehicle, config } = vehicleData;
    console.log('🚗 Applying control:', { ...control, vehicleId });

    const engineForce = control.engineForce * config.maxEngineForce;
    const brakeForce = control.brakeForce * config.maxBrakeForce;
    const steerAngle = control.steerAngle * config.maxSteerAngle;

    // Engine и brake ко всем колёсам (AWD)
    for (let i = 0; i < 4; i++) {
      vehicle.applyEngineForce(engineForce, i);
      vehicle.setBrake(brakeForce, i);
    }

    // Steering только передние
    for (let i = 0; i < 2; i++) {
      vehicle.setSteeringValue(steerAngle, i);
    }
  }

  /**
   * Обновление (синхронизация meshes с физикой)
   */
  updateVehicle(vehicleId: string, deltaTime: number): void {
    const vehicleData = this.vehicles.get(vehicleId);
    if (!vehicleData) {
      console.warn('⚠️ Vehicle not found:', vehicleId);
      return;
    }

    const { vehicle, body, wheels, config } = vehicleData;
    const ammo = this.physicsManager.getAmmo();
    const rigidBody = vehicle.getRigidBody();

    // Синхронизация шасси
    const chassisTrans = new ammo.btTransform();
    rigidBody.getWorldTransform(chassisTrans);
    const origin = chassisTrans.getOrigin();
    const rotQuat = chassisTrans.getRotation();

    body.position = new Vector3(origin.x(), origin.y(), origin.z());
    body.rotationQuaternion = new Quaternion(rotQuat.x(), rotQuat.y(), rotQuat.z(), rotQuat.w());

    ammo.destroy(origin);
    ammo.destroy(rotQuat);
    ammo.destroy(chassisTrans);

    // Синхронизация колёс
    for (let i = 0; i < 4; i++) {
      vehicle.updateWheelTransform(i, true);
      const wheelTrans = vehicle.getWheelTransformWS(i);
      const wheelOrigin = wheelTrans.getOrigin();
      const wheelRot = wheelTrans.getRotation();

      const wheelMesh = wheels[i];
      wheelMesh.position = new Vector3(wheelOrigin.x(), wheelMesh.position.y, wheelOrigin.z()); // Y от шасси? Нет, полная
      wheelMesh.position = new Vector3(wheelOrigin.x(), wheelOrigin.y(), wheelOrigin.z());
      wheelMesh.rotationQuaternion = new Quaternion(wheelRot.x(), wheelRot.y(), wheelRot.z(), wheelRot.w());

      ammo.destroy(wheelOrigin);
      ammo.destroy(wheelRot);
      ammo.destroy(wheelTrans);
    }
  }

  /**
   * Получение статистики транспортного средства
   */
  getVehicleStats(vehicleId: string): VehicleStats | null {
    const vehicleData = this.vehicles.get(vehicleId);
    if (!vehicleData) {
      console.warn('⚠️ Vehicle not found:', vehicleId);
      return null;
    }

    const { vehicle } = vehicleData;
    const speed = vehicle.getCurrentSpeedKmHour();
    const rpm = 0; // TODO: Рассчитать как (speed / 3.6) / (2 * PI * wheelRadius) * gearRatio
    const wheelRotations = [];
    for (let i = 0; i < vehicle.getNumWheels(); i++) {
      wheelRotations.push(vehicle.getWheelInfo(i).get_m_rotation());
    }

    // Позиция из body (после sync)
    const position = vehicleData.body.position;

    console.log('📊 Vehicle stats:', { speed, rpm, wheelRotations, position });

    return { speed, rpm, wheelRotations, position: { x: position.x, y: position.y, z: position.z } };
  }

  /**
   * Получение транспортного средства
   */
  getVehicle(vehicleId: string): { vehicle: any; body: any; wheels: any[]; config: VehicleConfig } | null {
    return this.vehicles.get(vehicleId) || null;
  }

  /**
   * Проверка наличия транспортного средства
   */
  hasVehicle(vehicleId: string): boolean {
    return this.vehicles.has(vehicleId);
  }

  /**
   * Удаление транспортного средства
   */
  removeVehicle(vehicleId: string): void {
    const vehicleData = this.vehicles.get(vehicleId);
    if (!vehicleData) {
      console.warn('⚠️ Vehicle not found:', vehicleId);
      return;
    }

    try {
      console.log('🗑️ Removing vehicle:', vehicleId);
      this.physicsManager.removeAction(vehicleData.vehicle);
      this.physicsManager.removeRigidBody(vehicleData.vehicle.getRigidBody());
      this.vehicles.delete(vehicleId);
      console.log('✅ Vehicle removed');
    } catch (error) {
      console.error('❌ Error removing vehicle:', error);
    }
  }

  /**
   * Очистка всех транспортных средств
   */
  dispose(): void {
    console.log('🧹 Disposing VehiclePhysicsSystem...');
    this.vehicles.forEach((_, vehicleId) => this.removeVehicle(vehicleId));
    this.vehicles.clear();
    console.log('✅ Disposed');
  }
}

// Пример использования в игре:
// const config: VehicleConfig = {
//   mass: 1500,
//   maxEngineForce: 1500 * 5, // 7500 Н
//   maxBrakeForce: 1500,
//   maxSteerAngle: Math.PI / 6, // ~30°
//   suspensionStiffness: 30,
//   suspensionDamping: 0.3, // Scaled from 3
//   suspensionCompression: 0.83,
//   suspensionRestLength: 0.4,
//   wheelRadius: 0.45,
//   wheelFriction: 1.5,
//   wheelOffset: [ /* позиции колёс относительно шасси */ ],
//   centerOfMassOffset: { x: 0, y: -0.4, z: 0 },
//   // ...
// };
// const id = vehicleSystem.createVehicle(chassisMesh, [flWheel, frWheel, blWheel, brWheel], config);
// В render loop: vehicleSystem.updateVehicle(id, deltaTime);
// vehicleSystem.applyControl(id, { engineForce: throttle, brakeForce: brake, steerAngle: steering });