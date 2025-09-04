import * as BABYLON from 'babylonjs';
import * as Ammo from 'ammo.js';

/**
 * Создает физическую модель автомобиля в сцене
 * @param scene - Сцена Babylon.js, в которой будет создана модель
 * @returns Объект с компонентами физической модели автомобиля
 */
export const createVehiclePhysics = (scene: BABYLON.Scene) => {
  // Создание шасси автомобиля 
  const chassisMesh = BABYLON.MeshBuilder.CreateBox("chassis", { width: 2, height: 0.5, depth: 4 }, scene); 
  const chassisBody = new BABYLON.PhysicsBody(chassisMesh, BABYLON.PhysicsMotionType.DYNAMIC, false, scene); 
  chassisBody.shape = new BABYLON.PhysicsShapeBox( 
    new BABYLON.Vector3(0, 0.5, 0), // центр коробки
    new BABYLON.Quaternion(), // ориентация (кватернион)
    new BABYLON.Vector3(2, 0.5, 4), // размеры коробки (ширина, высота, глубина)
    scene 
  ); 
  chassisBody.setMassProperties({ mass: 1500 }); // масса в кг 

  // Создание колес 
  const wheelMesh = BABYLON.MeshBuilder.CreateCylinder("wheel", { height: 0.5, diameter: 0.8 }, scene); 
  const wheelShape = new BABYLON.PhysicsShapeCylinder( 
    new BABYLON.Vector3(0, -0.25, 0), // начальная точка цилиндра
    new BABYLON.Vector3(0, 0.25, 0), // конечная точка цилиндра
    0.4, // радиус цилиндра
    scene 
  ); 

  // Настройка подвески для каждого колеса 
  const wheelInfo = { 
    suspensionStiffness: 25.0, // жесткость пружины 
    suspensionCompression: 4.4, // демпфирование сжатия 
    suspensionDamping: 2.3,     // демпфирование отскока 
    maxSuspensionTravel: 0.3,   // максимальный ход подвески 
    suspensionRestLength: 0.5,  // длина подвески в покое 
    rollInfluence: 0.01,        // влияние крена 
    frictionSlip: 1000,         // сцепление с дорогой 
  }; 

  // Модель двигателя 
  const engine = { 
    minRpm: 1000, 
    maxRpm: 8000, 
    currentRpm: 1000, 
    // Кривая крутящего момента (rpm -> torque) 
    getTorque: (rpm: number) => { 
      // Реалистичная кривая крутящего момента 
      if (rpm < 1000) return 100; 
      if (rpm < 2500) return 100 + (rpm - 1000) * 0.2; 
      if (rpm < 5000) return 400 - (rpm - 2500) * 0.05; 
      return 400 - (rpm - 5000) * 0.1; 
    } 
  }; 

  // Передаточные числа 
  const transmission = { 
    gearRatios: [3.5, 2.5, 1.8, 1.3, 1.0, 0.8], // передачи + задняя (-3.5) 
    differentialRatio: 3.7, 
    currentGear: 0, 
    efficiency: 0.9 // КПД трансмиссии 
  };
  
  return {
    chassis: chassisBody,
    chassisMesh,
    wheelShape,
    wheelMesh,
    wheelInfo,
    engine,
    transmission
  };
};