/**
 * Пример интеграции VehiclePhysics в GameplayPage
 * Показывает как интегрировать физику автомобиля с существующей визуальной моделью
 */

import React, { useEffect, useRef, useState } from 'react';
import { AbstractMesh, Vector3 } from '@babylonjs/core';
import { useVehiclePhysics } from '../hooks/useVehiclePhysics';

// Пример использования в GameplayPage
export const VehiclePhysicsIntegrationExample = () => {
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState({
    vehicleCount: 0,
    vehicleSpeed: 0,
    physicsStatus: 'Initializing...',
    fps: 0
  });

  // Инициализация системы физики автомобилей
  const vehiclePhysics = useVehiclePhysics(physicsSystemRef.current, {
    enableKeyboardControls: true,
    debugMode: true,
    logPerformance: true
  });

  // Создание физической модели после создания визуальной
  useEffect(() => {
    if (vehiclePhysics.isInitialized && vehicle && wheelMeshes) {
      const wheelMeshes = [wheelFL, wheelFR, wheelBL, wheelBR];
      const newVehicleId = vehiclePhysics.createVehicle(vehicle, wheelMeshes);
      
      if (newVehicleId) {
        setVehicleId(newVehicleId);
        setDebugInfo(prev => ({
          ...prev,
          vehicleCount: 1,
          physicsStatus: 'Vehicle physics active'
        }));
      }
    }
  }, [vehiclePhysics.isInitialized, vehicle, wheelMeshes]);

  // Обновление управления в цикле рендеринга
  useEffect(() => {
    const updateLoop = () => {
      if (vehiclePhysics.isInitialized && vehicleId) {
        // Применяем управление через физику
        vehiclePhysics.applyControls(vehicleId, {
          engineForce: pressedKeys.has('w') ? 1 : pressedKeys.has('s') ? -1 : 0,
          brakeForce: pressedKeys.has(' ') ? 1 : 0,
          steerAngle: pressedKeys.has('a') ? -1 : pressedKeys.has('d') ? 1 : 0
        });

        // Получаем информацию об автомобиле
        const vehicleInfo = vehiclePhysics.getVehicleInfo(vehicleId);
        if (vehicleInfo) {
          setDebugInfo(prev => ({
            ...prev,
            vehicleSpeed: Math.round(vehicleInfo.speed * 3.6) // Convert m/s to km/h
          }));
        }
      }

      requestAnimationFrame(updateLoop);
    };

    updateLoop();
  }, [vehiclePhysics, vehicleId]);

  return (
    <div>
      {/* Отладочная панель */}
      <div className="debug-panel">
        <h3>🚗 Vehicle Physics Debug</h3>
        <div className="debug-info">
          <div className="debug-item">
            <span className="debug-label">Physics Status:</span>
            <span className="debug-value">{debugInfo.physicsStatus}</span>
          </div>
          <div className="debug-item">
            <span className="debug-label">Vehicles:</span>
            <span className="debug-value">{debugInfo.vehicleCount}</span>
          </div>
          <div className="debug-item">
            <span className="debug-label">Speed:</span>
            <span className="debug-value">{debugInfo.vehicleSpeed} km/h</span>
          </div>
          <div className="debug-item">
            <span className="debug-label">Controls:</span>
            <span className="debug-value">WASD + Space</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Код для интеграции в существующий GameplayPage.tsx:

/*
// 1. Импорт
import { useVehiclePhysics } from '../hooks/useVehiclePhysics';

// 2. Инициализация после создания физической системы
const vehiclePhysics = useVehiclePhysics(physicsSystemRef.current, {
  enableKeyboardControls: true,
  debugMode: true,
  logPerformance: true
});

// 3. Создание физической модели после создания визуальной
useEffect(() => {
  if (vehiclePhysics.isInitialized && vehicle) {
    const wheelMeshes = [wheelFL, wheelFR, wheelBL, wheelBR];
    const vehicleId = vehiclePhysics.createVehicle(vehicle, wheelMeshes);
    
    if (vehicleId) {
      console.log('✅ Vehicle physics created:', vehicleId);
    }
  }
}, [vehiclePhysics.isInitialized, vehicle]);

// 4. Замена старого управления на физическое
// Удалить старый код:
// targetMesh.translate(Vector3.Forward(), 0.5, Space.LOCAL);

// Заменить на:
if (vehiclePhysics.isInitialized && vehicleId) {
  vehiclePhysics.applyControls(vehicleId, {
    engineForce: pressedKeys.has('w') ? 1 : pressedKeys.has('s') ? -1 : 0,
    brakeForce: pressedKeys.has(' ') ? 1 : 0,
    steerAngle: pressedKeys.has('a') ? -1 : pressedKeys.has('d') ? 1 : 0
  });
}

// 5. Обновление отладочной информации
const vehicleInfo = vehiclePhysics.getVehicleInfo(vehicleId);
if (vehicleInfo) {
  setDebugInfo(prev => ({
    ...prev,
    vehicleSpeed: Math.round(vehicleInfo.speed * 3.6)
  }));
}
*/
