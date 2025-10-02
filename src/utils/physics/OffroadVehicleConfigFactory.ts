/**
 * Offroad Vehicle Config Factory
 * Создание конфигурации для внедорожного транспортного средства
 */

import { VehicleConfig } from './VehiclePhysicsSystem';

export class OffroadVehicleConfigFactory {
  static createOffroadConfig(): VehicleConfig {
    return {
      mass: 1500, // Масса шасси (кг)
      maxEngineForce: 2000, // Увеличено для заметного движения
      maxBrakeForce: 100,
      maxSteerAngle: 0.5, // Увеличено для заметных поворотов
      suspensionStiffness: 20,
      suspensionDamping: 2.3,
      suspensionCompression: 1.4,
      suspensionRestLength: 0.6,
      rollInfluence: 0.2,
      wheelRadius: 0.4, // Должно совпадать с GameplayPage.tsx
      wheelWidth: 0.3,
      wheelFriction: 1000,
      wheelOffset: [
        { x: 0.8, y: 0.4, z: -1.0 }, // FL
        { x: -0.8, y: 0.4, z: -1.0 }, // FR
        { x: 0.8, y: 0.4, z: 1.0 }, // BL
        { x: -0.8, y: 0.4, z: 1.0 } // BR
      ],
      centerOfMassOffset: { x: 0, y: -0.2, z: 0 },
      collisionGroup: 2,
      collisionMask: 1
    };
  }
}