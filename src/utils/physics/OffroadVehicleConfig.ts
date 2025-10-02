/**
 * Offroad Vehicle Configuration
 * Специальная конфигурация для внедорожника с реалистичными параметрами
 * Использует Context7 рекомендации для оптимальной производительности
 */

import { Vector3 } from '@babylonjs/core';
import type { VehicleConfig } from './VehiclePhysicsSystem';
import type { SuspensionConfig } from './SuspensionSystem';

export interface OffroadVehicleConfig extends VehicleConfig {
  // Специфичные для внедорожника параметры
  groundClearance: number;        // Дорожный просвет (см)
  approachAngle: number;          // Угол въезда (градусы)
  departureAngle: number;         // Угол съезда (градусы)
  breakoverAngle: number;         // Угол проходимости (градусы)
  waterFordingDepth: number;      // Глубина преодоления воды (м)
  maxClimbAngle: number;          // Максимальный угол подъема (градусы)
  
  // Параметры трансмиссии
  lowRangeRatio: number;          // Понижающая передача
  centerDiffLock: boolean;        // Блокировка центрального дифференциала
  frontDiffLock: boolean;         // Блокировка переднего дифференциала
  rearDiffLock: boolean;          // Блокировка заднего дифференциала
  
  // Параметры тормозов
  handbrakeForce: number;         // Сила ручного тормоза
  absEnabled: boolean;            // Антиблокировочная система
  tractionControl: boolean;       // Система контроля тяги
}

export class OffroadVehicleConfigFactory {
  /**
   * Создание конфигурации для внедорожника
   */
  static createOffroadConfig(): OffroadVehicleConfig {
    return {
      // Базовые параметры автомобиля
      mass: 1800, // 1.8 тонны (в пределах 1200-2000кг)
      centerOfMassOffset: { x: 0, y: -0.4, z: 0 }, // -0.4м для лучшей устойчивости
      wheelbase: 2.8, // 2.8 метра
      trackWidth: 1.6, // 1.6 метра
      
      // Параметры двигателя (больше мощности)
      maxEngineForce: 8000, // 8000 Н
      maxBrakeForce: 8000,  // 8000 Н
      maxSteerAngle: Math.PI / 6, // 30 градусов
      
      // Параметры колес (больше и шире)
      wheelRadius: 0.45,          // 45 см радиус (в пределах 0.4-0.5м)
      wheelWidth: 0.25,           // 25 см ширина (в пределах 0.2-0.3м)
      wheelFriction: 0.8,         // Высокое сцепление
      wheelRollingFriction: 0.02, // Низкое сопротивление качению
      wheelSpinningFriction: 0.1, // Скользящее трение
      
      // Позиции колес относительно центра масс
      wheelOffset: [
        { x: 0.7, y: -0.4, z: -1.5 },   // FL - переднее левое
        { x: -0.7, y: -0.4, z: -1.5 },  // FR - переднее правое
        { x: 0.7, y: -0.4, z: 1.5 },    // BL - заднее левое
        { x: -0.7, y: -0.4, z: 1.5 }    // BR - заднее правое
      ],
      
      // Параметры подвески
      suspensionStiffness: 20000,        // Н/м
      suspensionDamping: 2500,           // Н⋅с/м
      suspensionCompression: 0.83,       // Коэффициент сжатия
      suspensionRestLength: 0.5,         // 50 см
      rollInfluence: 0.2,                // Влияние на крен
      
      // Параметры коллизий
      collisionGroup: 2,                 // Группа коллизий
      collisionMask: 1,                  // Маска коллизий
      
      // Специфичные для внедорожника параметры
      groundClearance: 0.25,        // 25 см дорожный просвет
      approachAngle: 35,            // 35 градусов угол въезда
      departureAngle: 30,           // 30 градусов угол съезда
      breakoverAngle: 25,           // 25 градусов угол проходимости
      waterFordingDepth: 0.8,       // 80 см глубина преодоления воды
      maxClimbAngle: 45,            // 45 градусов максимальный угол подъема
      
      // Параметры трансмиссии
      lowRangeRatio: 2.5,           // Понижающая передача
      centerDiffLock: true,         // Блокировка центрального дифференциала
      frontDiffLock: true,          // Блокировка переднего дифференциала
      rearDiffLock: true,           // Блокировка заднего дифференциала
      
      // Параметры тормозов
      handbrakeForce: 4000,         // Сила ручного тормоза
      absEnabled: true,             // Антиблокировочная система
      tractionControl: true         // Система контроля тяги
    };
  }
  
  /**
   * Создание конфигурации для спортивного внедорожника
   */
  static createSportOffroadConfig(): OffroadVehicleConfig {
    const baseConfig = this.createOffroadConfig();
    
    return {
      ...baseConfig,
      
      // Больше мощности
      maxEngineForce: 10000, // 10000 Н
      maxBrakeForce: 10000,  // 10000 Н
      
      // Более жесткая подвеска для спортивного вождения
      wheelFriction: 0.9,         // Выше сцепление
      wheelRollingFriction: 0.015, // Меньше сопротивление качению
      
      // Специфичные для спортивного внедорожника параметры
      groundClearance: 0.2,        // 20 см дорожный просвет (меньше)
      approachAngle: 40,           // 40 градусов угол въезда
      departureAngle: 35,          // 35 градусов угол съезда
      breakoverAngle: 30,          // 30 градусов угол проходимости
      waterFordingDepth: 0.6,      // 60 см глубина преодоления воды
      maxClimbAngle: 50,           // 50 градусов максимальный угол подъема
      
      // Параметры трансмиссии
      lowRangeRatio: 2.0,          // Менее агрессивная понижающая передача
      centerDiffLock: true,        // Блокировка центрального дифференциала
      frontDiffLock: true,         // Блокировка переднего дифференциала
      rearDiffLock: true,          // Блокировка заднего дифференциала
      
      // Параметры тормозов
      handbrakeForce: 5000,        // Больше сила ручного тормоза
      absEnabled: true,            // Антиблокировочная система
      tractionControl: true        // Система контроля тяги
    };
  }
  
  /**
   * Создание конфигурации для экстремального внедорожника
   */
  static createExtremeOffroadConfig(): OffroadVehicleConfig {
    const baseConfig = this.createOffroadConfig();
    
    return {
      ...baseConfig,
      
      // Максимальная проходимость
      groundClearance: 0.4,        // 40 см дорожный просвет
      approachAngle: 45,           // 45 градусов угол въезда
      departureAngle: 40,          // 40 градусов угол съезда
      breakoverAngle: 35,          // 35 градусов угол проходимости
      waterFordingDepth: 1.2,      // 120 см глубина преодоления воды
      maxClimbAngle: 60,           // 60 градусов максимальный угол подъема
      
      // Больше мощности и крутящего момента
      maxEngineForce: 12000, // 12000 Н
      maxBrakeForce: 12000,  // 12000 Н
      
      // Очень мягкая подвеска для максимального комфорта
      wheelFriction: 0.7,         // Меньше сцепление для мягкости
      wheelRollingFriction: 0.03, // Больше сопротивление качению
      
      // Параметры трансмиссии
      lowRangeRatio: 3.0,          // Более агрессивная понижающая передача
      centerDiffLock: true,        // Блокировка центрального дифференциала
      frontDiffLock: true,         // Блокировка переднего дифференциала
      rearDiffLock: true,          // Блокировка заднего дифференциала
      
      // Параметры тормозов
      handbrakeForce: 6000,        // Максимальная сила ручного тормоза
      absEnabled: true,            // Антиблокировочная система
      tractionControl: true        // Система контроля тяги
    };
  }
  
  /**
   * Получение конфигурации подвески для внедорожника
   */
  static getOffroadSuspensionConfig(
    chassisConnectionPoint: Vector3,
    wheelConnectionPoint: Vector3
  ): SuspensionConfig {
    return {
      // Базовые параметры пружины
      springStiffness: 20000,        // Н/м (мягче чем у легковушки)
      springDamping: 2500,           // Н⋅с/м
      springRestLength: 0.5,         // 50 см (больше ход)
      
      // 6 DOF ограничения движения
      maxSuspensionTravel: 0.3,      // 30 см
      minSuspensionTravel: -0.15,    // 15 см
      
      // Угловые ограничения для внедорожника
      maxSteerAngle: Math.PI / 6,    // 30 градусов поворот
      maxCamberAngle: Math.PI / 12,  // 15 градусов развал
      maxCasterAngle: Math.PI / 18,  // 10 градусов кастер
      
      // Точки крепления
      chassisConnectionPoint,
      wheelConnectionPoint,
      
      // Параметры для внедорожника
      rollInfluence: 0.2,            // Меньше влияние на крен
      antiRollForce: 3000,           // Меньше антикреновая сила
      
      // 6 DOF конфигурация пружин для внедорожника
      springConfig: {
        x: { stiffness: 12000, damping: 1500 },   // Поперечная (очень мягкая)
        y: { stiffness: 20000, damping: 2500 },   // Вертикальная (основная)
        z: { stiffness: 15000, damping: 2000 },   // Продольная (клевок)
        rx: { stiffness: 8000, damping: 1000 },   // Крен (очень мягкий)
        ry: { stiffness: 10000, damping: 1200 },  // Тангаж
        rz: { stiffness: 6000, damping: 800 }     // Рыскание (рулевое)
      }
    };
  }
}
