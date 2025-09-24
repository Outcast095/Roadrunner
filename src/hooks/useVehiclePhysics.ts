/**
 * useVehiclePhysics Hook
 * React хук для управления физикой автомобиля с интеграцией существующей визуальной модели
 * Использует Context7 рекомендации для оптимальной производительности
 */

import { useRef, useEffect, useCallback } from 'react';
import { AbstractMesh, Vector3 } from '@babylonjs/core';
import { VehiclePhysicsSystem, VehicleConfig, VehiclePhysics } from '../utils/physics';

export interface VehicleControls {
  engineForce: number;    // Сила двигателя (-1 до 1)
  brakeForce: number;     // Сила торможения (0 до 1)
  steerAngle: number;     // Угол поворота (-1 до 1)
}

export interface UseVehiclePhysicsOptions {
  // Конфигурация автомобиля
  vehicleConfig?: Partial<VehicleConfig>;
  
  // Настройки управления
  enableKeyboardControls?: boolean;
  enableMouseControls?: boolean;
  
  // Настройки производительности
  updateFrequency?: number;        // Частота обновления (Гц)
  enableInterpolation?: boolean;   // Включить интерполяцию
  
  // Настройки отладки
  debugMode?: boolean;
  logPerformance?: boolean;
}

export interface UseVehiclePhysicsReturn {
  // Основные методы
  createVehicle: (chassisMesh: AbstractMesh, wheelMeshes: AbstractMesh[]) => string | null;
  removeVehicle: (vehicleId: string) => void;
  applyControls: (vehicleId: string, controls: VehicleControls) => void;
  
  // Информация об автомобиле
  getVehicleInfo: (vehicleId: string) => {
    velocity: Vector3;
    angularVelocity: Vector3;
    position: Vector3;
    speed: number;
  } | null;
  
  // Управление
  controls: VehicleControls;
  setControls: (controls: Partial<VehicleControls>) => void;
  
  // Статистика
  getStats: () => {
    vehicleCount: number;
    activeVehicles: string[];
    performance: {
      updateTime: number;
      averageUpdateTime: number;
    };
  };
  
  // Состояние
  isInitialized: boolean;
  error: string | null;
}

export function useVehiclePhysics(
  physicsSystem: any, // PhysicsSystem
  options: UseVehiclePhysicsOptions = {}
): UseVehiclePhysicsReturn {
  // Рефы для хранения состояния
  const vehiclePhysicsSystemRef = useRef<VehiclePhysicsSystem | null>(null);
  const vehiclesRef = useRef<Map<string, VehiclePhysics>>(new Map());
  const controlsRef = useRef<VehicleControls>({
    engineForce: 0,
    brakeForce: 0,
    steerAngle: 0
  });
  const lastUpdateTimeRef = useRef<number>(0);
  const updateTimesRef = useRef<number[]>([]);
  const errorRef = useRef<string | null>(null);
  const isInitializedRef = useRef<boolean>(false);

  // Конфигурация по умолчанию
  const defaultOptions: UseVehiclePhysicsOptions = {
    vehicleConfig: {
      mass: 1200,
      centerOfMass: new Vector3(0, -0.5, 0),
      wheelbase: 2.5,
      trackWidth: 1.6,
      maxEngineForce: 3000,
      maxBrakeForce: 10000,
      maxSteerAngle: Math.PI / 6,
      wheelRadius: 0.3,
      wheelWidth: 0.2,
      wheelFriction: 0.8,
      wheelRollingFriction: 0.1,
      wheelSpinningFriction: 0.1
    },
    enableKeyboardControls: true,
    enableMouseControls: false,
    updateFrequency: 60,
    enableInterpolation: true,
    debugMode: false,
    logPerformance: false
  };

  const config = { ...defaultOptions, ...options };

  /**
   * Инициализация системы физики автомобилей
   */
  const initializeVehiclePhysics = useCallback(async () => {
    try {
      if (!physicsSystem || !physicsSystem.getPhysicsManager()) {
        throw new Error('Physics system not available');
      }

      console.log('🚗 Initializing vehicle physics system...');

      // Создаем систему физики автомобилей
      vehiclePhysicsSystemRef.current = new VehiclePhysicsSystem(
        physicsSystem.getPhysicsManager()
      );

      isInitializedRef.current = true;
      errorRef.current = null;

      console.log('✅ Vehicle physics system initialized successfully');

    } catch (error) {
      errorRef.current = `Failed to initialize vehicle physics: ${error}`;
      console.error('❌ Vehicle physics initialization error:', error);
    }
  }, [physicsSystem]);

  /**
   * Создание автомобиля на основе существующих мешей
   */
  const createVehicle = useCallback((
    chassisMesh: AbstractMesh,
    wheelMeshes: AbstractMesh[]
  ): string | null => {
    try {
      if (!vehiclePhysicsSystemRef.current) {
        throw new Error('Vehicle physics system not initialized');
      }

      if (!chassisMesh || !wheelMeshes || wheelMeshes.length < 4) {
        throw new Error('Invalid mesh data for vehicle creation');
      }

      console.log('🚗 Creating vehicle from existing meshes...');

      // Создаем автомобиль на основе существующих мешей
      const vehicle = vehiclePhysicsSystemRef.current.createVehicle(
        chassisMesh,
        wheelMeshes,
        config.vehicleConfig
      );

      // Генерируем уникальный ID
      const vehicleId = `vehicle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Сохраняем в реестре
      vehiclesRef.current.set(vehicleId, vehicle);

      console.log(`✅ Vehicle created successfully: ${vehicleId}`);
      return vehicleId;

    } catch (error) {
      errorRef.current = `Failed to create vehicle: ${error}`;
      console.error('❌ Vehicle creation error:', error);
      return null;
    }
  }, [config.vehicleConfig]);

  /**
   * Удаление автомобиля
   */
  const removeVehicle = useCallback((vehicleId: string) => {
    try {
      if (!vehiclePhysicsSystemRef.current) {
        throw new Error('Vehicle physics system not initialized');
      }

      console.log(`🗑️ Removing vehicle: ${vehicleId}`);

      // Удаляем из системы физики
      vehiclePhysicsSystemRef.current.removeVehicle(vehicleId);
      
      // Удаляем из реестра
      vehiclesRef.current.delete(vehicleId);

      console.log(`✅ Vehicle removed successfully: ${vehicleId}`);

    } catch (error) {
      errorRef.current = `Failed to remove vehicle: ${error}`;
      console.error('❌ Vehicle removal error:', error);
    }
  }, []);

  /**
   * Применение управления к автомобилю
   */
  const applyControls = useCallback((vehicleId: string, controls: VehicleControls) => {
    try {
      if (!vehiclePhysicsSystemRef.current) {
        throw new Error('Vehicle physics system not initialized');
      }

      // Применяем управление
      vehiclePhysicsSystemRef.current.applyControl(vehicleId, controls);

      // Обновляем локальное состояние управления
      controlsRef.current = { ...controlsRef.current, ...controls };

    } catch (error) {
      errorRef.current = `Failed to apply controls: ${error}`;
      console.error('❌ Controls application error:', error);
    }
  }, []);

  /**
   * Получение информации об автомобиле
   */
  const getVehicleInfo = useCallback((vehicleId: string) => {
    try {
      if (!vehiclePhysicsSystemRef.current) {
        return null;
      }

      return vehiclePhysicsSystemRef.current.getVehicleInfo(vehicleId);

    } catch (error) {
      errorRef.current = `Failed to get vehicle info: ${error}`;
      console.error('❌ Vehicle info error:', error);
      return null;
    }
  }, []);

  /**
   * Установка управления
   */
  const setControls = useCallback((newControls: Partial<VehicleControls>) => {
    controlsRef.current = { ...controlsRef.current, ...newControls };
  }, []);

  /**
   * Получение статистики
   */
  const getStats = useCallback(() => {
    const activeVehicles = Array.from(vehiclesRef.current.keys());
    const updateTimes = updateTimesRef.current;
    const averageUpdateTime = updateTimes.length > 0 
      ? updateTimes.reduce((a, b) => a + b, 0) / updateTimes.length 
      : 0;

    return {
      vehicleCount: vehiclesRef.current.size,
      activeVehicles,
      performance: {
        updateTime: updateTimes[updateTimes.length - 1] || 0,
        averageUpdateTime
      }
    };
  }, []);

  /**
   * Обновление физики автомобилей
   */
  const updateVehicles = useCallback((deltaTime: number) => {
    if (!vehiclePhysicsSystemRef.current || !isInitializedRef.current) {
      return;
    }

    const startTime = performance.now();

    try {
      // Обновляем все автомобили
      for (const vehicleId of vehiclesRef.current.keys()) {
        vehiclePhysicsSystemRef.current.updateVehicle(vehicleId, deltaTime);
      }

      // Записываем время обновления
      const updateTime = performance.now() - startTime;
      updateTimesRef.current.push(updateTime);

      // Ограничиваем размер массива времен обновления
      if (updateTimesRef.current.length > 100) {
        updateTimesRef.current = updateTimesRef.current.slice(-50);
      }

      if (config.logPerformance && updateTime > 16) { // Больше 16мс (60 FPS)
        console.warn(`⚠️ Vehicle physics update took ${updateTime.toFixed(2)}ms`);
      }

    } catch (error) {
      errorRef.current = `Vehicle physics update error: ${error}`;
      console.error('❌ Vehicle physics update error:', error);
    }
  }, [config.logPerformance]);

  /**
   * Обработка клавиатурного ввода
   */
  const handleKeyboardInput = useCallback((event: KeyboardEvent) => {
    if (!config.enableKeyboardControls) return;

    const { key, type } = event;
    const isPressed = type === 'keydown';

    switch (key.toLowerCase()) {
      case 'w':
        setControls({ engineForce: isPressed ? 1 : 0 });
        break;
      case 's':
        setControls({ engineForce: isPressed ? -1 : 0 });
        break;
      case 'a':
        setControls({ steerAngle: isPressed ? -1 : 0 });
        break;
      case 'd':
        setControls({ steerAngle: isPressed ? 1 : 0 });
        break;
      case ' ':
        setControls({ brakeForce: isPressed ? 1 : 0 });
        break;
    }
  }, [config.enableKeyboardControls, setControls]);

  // Инициализация при монтировании
  useEffect(() => {
    initializeVehiclePhysics();
  }, [initializeVehiclePhysics]);

  // Обработка клавиатурного ввода
  useEffect(() => {
    if (!config.enableKeyboardControls) return;

    window.addEventListener('keydown', handleKeyboardInput);
    window.addEventListener('keyup', handleKeyboardInput);

    return () => {
      window.removeEventListener('keydown', handleKeyboardInput);
      window.removeEventListener('keyup', handleKeyboardInput);
    };
  }, [config.enableKeyboardControls, handleKeyboardInput]);

  // Цикл обновления физики
  useEffect(() => {
    if (!isInitializedRef.current) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const updateLoop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTime) / 1000; // В секундах
      lastTime = currentTime;

      // Проверяем частоту обновления
      const minInterval = 1000 / (config.updateFrequency || 60);
      if (currentTime - lastUpdateTimeRef.current >= minInterval) {
        updateVehicles(deltaTime);
        lastUpdateTimeRef.current = currentTime;
      }

      animationFrameId = requestAnimationFrame(updateLoop);
    };

    animationFrameId = requestAnimationFrame(updateLoop);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isInitializedRef.current, config.updateFrequency, updateVehicles]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (vehiclePhysicsSystemRef.current) {
        vehiclePhysicsSystemRef.current.dispose();
        vehiclePhysicsSystemRef.current = null;
      }
      vehiclesRef.current.clear();
      updateTimesRef.current = [];
      isInitializedRef.current = false;
    };
  }, []);

  return {
    createVehicle,
    removeVehicle,
    applyControls,
    getVehicleInfo,
    controls: controlsRef.current,
    setControls,
    getStats,
    isInitialized: isInitializedRef.current,
    error: errorRef.current
  };
}
