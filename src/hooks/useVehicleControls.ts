import { useEffect, useState, useRef } from 'react';
import * as BABYLON from 'babylonjs';
import type { VehiclePhysics } from '../utils/carParametrs';

/**
 * Хук для обработки ввода и управления транспортным средством
 * @param scene - Сцена Babylon.js
 * @param vehiclePhysics - Физическая модель автомобиля
 * @returns Объект с состоянием управления и методами управления
 */
const useVehicleControls = (
  scene: BABYLON.Scene,
  vehiclePhysics: Partial<VehiclePhysics>
) => {
  // Состояние для отслеживания нажатых клавиш
  const [inputState, setInputState] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    brake: false,
    handbrake: false,
    shiftUp: false,
    shiftDown: false
  });

  // Состояние для отслеживания текущих параметров управления
  const [controlState, setControlState] = useState({
    throttle: 0, // Газ (0-1)
    steering: 0, // Руль (-1 влево, 1 вправо)
    brake: 0,    // Тормоз (0-1)
    handbrake: false, // Ручной тормоз
    currentGear: 0 // Текущая передача
  });

  // Ссылки для хранения обработчиков событий
  const keyDownHandler = useRef<((event: KeyboardEvent) => void) | null>(null);
  const keyUpHandler = useRef<((event: KeyboardEvent) => void) | null>(null);

  // Эффект для настройки обработчиков ввода
  useEffect(() => {
    if (!scene) return;

    // Обработчик нажатия клавиш
    keyDownHandler.current = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          setInputState(prev => ({ ...prev, forward: true }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setInputState(prev => ({ ...prev, backward: true }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setInputState(prev => ({ ...prev, left: true }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setInputState(prev => ({ ...prev, right: true }));
          break;
        case 'Space':
          setInputState(prev => ({ ...prev, brake: true }));
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setInputState(prev => ({ ...prev, handbrake: true }));
          break;
        case 'KeyE':
          setInputState(prev => ({ ...prev, shiftUp: true }));
          break;
        case 'KeyQ':
          setInputState(prev => ({ ...prev, shiftDown: true }));
          break;
        default:
          break;
      }
    };

    // Обработчик отпускания клавиш
    keyUpHandler.current = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
          setInputState(prev => ({ ...prev, forward: false }));
          break;
        case 'KeyS':
        case 'ArrowDown':
          setInputState(prev => ({ ...prev, backward: false }));
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setInputState(prev => ({ ...prev, left: false }));
          break;
        case 'KeyD':
        case 'ArrowRight':
          setInputState(prev => ({ ...prev, right: false }));
          break;
        case 'Space':
          setInputState(prev => ({ ...prev, brake: false }));
          break;
        case 'ShiftLeft':
        case 'ShiftRight':
          setInputState(prev => ({ ...prev, handbrake: false }));
          break;
        case 'KeyE':
          setInputState(prev => ({ ...prev, shiftUp: false }));
          // Переключение на повышенную передачу при отпускании клавиши
          if (vehiclePhysics.transmission && 
              controlState.currentGear < vehiclePhysics.transmission.gears.length - 1) {
            setControlState(prev => ({
              ...prev,
              currentGear: prev.currentGear + 1
            }));
          }
          break;
        case 'KeyQ':
          setInputState(prev => ({ ...prev, shiftDown: false }));
          // Переключение на пониженную передачу при отпускании клавиши
          if (vehiclePhysics.transmission && controlState.currentGear > 0) {
            setControlState(prev => ({
              ...prev,
              currentGear: prev.currentGear - 1
            }));
          }
          break;
        default:
          break;
      }
    };

    // Регистрация обработчиков событий
    window.addEventListener('keydown', keyDownHandler.current);
    window.addEventListener('keyup', keyUpHandler.current);

    // Обновление состояния управления на каждом кадре
    const updateControlState = () => {
      setControlState(prev => {
        // Расчет значения газа
        let throttle = 0;
        if (inputState.forward) throttle = 1;
        else if (inputState.backward) throttle = -1;

        // Расчет значения руля
        let steering = 0;
        if (inputState.left) steering -= 1;
        if (inputState.right) steering += 1;

        // Расчет значения тормоза
        const brake = inputState.brake ? 1 : 0;

        return {
          ...prev,
          throttle,
          steering,
          brake,
          handbrake: inputState.handbrake
        };
      });
    };

    // Регистрация обработчика перед рендерингом
    scene.onBeforeRenderObservable.add(updateControlState);

    // Функция очистки при размонтировании компонента
    return () => {
      if (keyDownHandler.current) {
        window.removeEventListener('keydown', keyDownHandler.current);
      }
      if (keyUpHandler.current) {
        window.removeEventListener('keyup', keyUpHandler.current);
      }
      scene.onBeforeRenderObservable.clear();
    };
  }, [scene, vehiclePhysics, inputState]);

  /**
   * Применяет текущие управляющие воздействия к физической модели автомобиля
   */
  const applyControls = () => {
    if (!vehiclePhysics.chassis) return;

    // Здесь будет код для применения управляющих воздействий к физической модели
    // Например, применение крутящего момента к колесам, поворот колес и т.д.
    // Этот код будет зависеть от конкретной реализации физики автомобиля

    // Пример применения силы для движения вперед/назад
    if (controlState.throttle !== 0) {
      const direction = new BABYLON.Vector3(0, 0, controlState.throttle);
      const power = vehiclePhysics.engine?.power || 300;
      const force = direction.scale(power);
      
      // Применение силы к шасси
      vehiclePhysics.chassis.applyForce(
        force,
        vehiclePhysics.chassis.getObjectCenterWorld()
      );
    }

    // Пример применения тормоза
    if (controlState.brake > 0) {
      // Применение тормозящей силы, противоположной текущей скорости
      const velocity = vehiclePhysics.chassis.getLinearVelocity();
      const brakeForce = velocity.scale(-controlState.brake * 10);
      
      vehiclePhysics.chassis.applyForce(
        brakeForce,
        vehiclePhysics.chassis.getObjectCenterWorld()
      );
    }

    // Пример поворота колес
    if (controlState.steering !== 0) {
      // Здесь будет код для поворота колес
      // Применение углового импульса для поворота
      const torque = new BABYLON.Vector3(0, controlState.steering * 100, 0);
      vehiclePhysics.chassis.applyAngularImpulse(torque);
    }
  };

  // Возвращаем состояние управления и методы
  return {
    controlState,
    inputState,
    applyControls
  };
};

export default useVehicleControls;