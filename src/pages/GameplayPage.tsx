import React, { useEffect, useRef } from 'react';
import { Space, Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, DirectionalLight, ShadowGenerator, KeyboardEventTypes, type AbstractMesh } from '@babylonjs/core';
import { PhysicsSystem, PhysicsBodyFactory } from '../utils/physics';
import './GameplayPage.scss';


// Browser API types for ESLint
declare const window: {
  addEventListener: (event: string, handler: () => void) => void;
  removeEventListener: (event: string, handler: () => void) => void;
};

type GameplayPageProps = {
  onBackToMenu: () => void;
}

/**
 * GameplayPage - Основная игровая страница Roadrunner
 * Содержит 3D сцену, HUD и игровые элементы
 */
const GameplayPage: React.FC<GameplayPageProps> = ({ onBackToMenu }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const physicsSystemRef = useRef<PhysicsSystem | null>(null);
  const physicsBodyFactoryRef = useRef<PhysicsBodyFactory | null>(null);

  useEffect(() => {
    if (!canvasRef.current) { return; }

    // Create Babylon.js engine
    const engine = new Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      alpha: false,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
    });
    engineRef.current = engine;

    // Create scene
    const scene = new Scene(engine);
    sceneRef.current = scene;

    // Initialize physics system
    const initializePhysics = async () => {
      try {
        const physicsSystem = new PhysicsSystem({
          gravity: { x: 0, y: -9.8, z: 0 },
          updateConfig: {
            fixedTimeStep: 1/60,
            maxSubSteps: 10,
            interpolation: true,
            smoothing: 0.8,
            enableSleeping: true,
            sleepThreshold: 0.1,
            enableCaching: true,
            debugMode: false,
            logPerformance: false,
            maxLogFrequency: 1000
          },
          syncConfig: {
            enableInterpolation: true,
            interpolationFactor: 0.8,
            enableSmoothing: true,
            smoothingFactor: 0.7,
            enableCaching: true,
            maxCacheSize: 1000,
            updateFrequency: 60,
            debugMode: false,
            logSyncErrors: false
          }
        });
        
        await physicsSystem.initialize();
        physicsSystem.start();
        physicsSystemRef.current = physicsSystem;
        
        // Create physics body factory
        const physicsBodyFactory = new PhysicsBodyFactory(physicsSystem.getPhysicsManager());
        physicsBodyFactoryRef.current = physicsBodyFactory;
      } catch (error) {
        console.error('❌ Ошибка инициализации физики:', error);
      }
    };

    // Initialize physics
    initializePhysics();

    // Create camera
    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      Math.PI / 2.5,
      10,
      Vector3.Zero(),
      scene,
    );
    camera.attachControl(canvasRef.current, true);
    camera.setTarget(Vector3.Zero());

    // Create lighting
    const hemisphericLight = new HemisphericLight('hemisphericLight', new Vector3(0, 1, 0), scene);
    hemisphericLight.intensity = 0.7;

    const directionalLight = new DirectionalLight('directionalLight', new Vector3(-1, -1, -1), scene);
    directionalLight.position = new Vector3(20, 40, 20);
    directionalLight.intensity = 0.5;

    // Create ground plane
    const ground = MeshBuilder.CreateGround('ground', { width: 20, height: 20 }, scene);
    const groundMaterial = new StandardMaterial('groundMaterial', scene);
    groundMaterial.diffuseColor = new Color3(0.2, 0.6, 0.2); // Green color
    groundMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
    ground.material = groundMaterial;

    // Create shadow generator
    const shadowGenerator = new ShadowGenerator(1024, directionalLight);
    shadowGenerator.useExponentialShadowMap = true;

    // Create custom vehicle model
    let vehicle: AbstractMesh | null = null;

    // Кузов (прямоугольный бокс)
    const body = MeshBuilder.CreateBox('body', {
      width: 2,  // Длина
      height: 1, // Высота
      depth: 4.5,   // Ширина
    }, scene);
    body.position.y = 1; // Над землёй
    body.position.x = 2;
    body.position.z = 0;
    body.rotation.y = 0; // Поворачиваем автомобиль на 90 градусов

    // Материал для кузова
    const bodyMaterial = new StandardMaterial('bodyMat', scene);
    bodyMaterial.diffuseColor = new Color3(0.2, 0.5, 0.8); // Синий цвет
    body.material = bodyMaterial;

    // Колёса (четыре цилиндра)
    const wheelRadius = 0.5;
    const wheelWidth = 0.3;

    // Переднее левое колесо
    const wheelFL = MeshBuilder.CreateCylinder('wheelFL', {
      diameter: wheelRadius * 2,
      height: wheelWidth,
      tessellation: 24, // Для гладкости
    }, scene);
    wheelFL.rotation.z = Math.PI / 2; // Поворот на 90 градусов по Z-оси
    wheelFL.position = new Vector3(0.7, 0.5, 1.2); // Позиция ближе к кузову
    wheelFL.setParent(body); // Прикрепить к кузову

    // заднее левое колесо
    const wheelFR = MeshBuilder.CreateCylinder('wheelFR', {
      diameter: wheelRadius * 2,
      height: wheelWidth,
      tessellation: 24,
    }, scene);
    wheelFR.rotation.z = Math.PI / 2; // Поворот на 90 градусов по Z-оси
    wheelFR.position = new Vector3(3.5, 0.5, 1.2);
    wheelFR.setParent(body);

    // Заднее правое колесо синее колесо
    const wheelBL = MeshBuilder.CreateCylinder('wheelBL', {
      diameter: wheelRadius * 2,
      height: wheelWidth,
      tessellation: 24,
    }, scene);
    wheelBL.rotation.z = Math.PI / 2; // Поворот на 90 градусов по Z-оси
    wheelBL.position = new Vector3(3.5, 0.5, -1.2);
    wheelBL.setParent(body);

    // Переднее правое колесо колесо Зеленое 
    const wheelBR = MeshBuilder.CreateCylinder('wheelBR', {
      diameter: wheelRadius * 2,
      height: wheelWidth,
      tessellation: 24,
    }, scene);
    wheelBR.rotation.z = Math.PI / 2; // Поворот на 90 градусов по Z-оси
    wheelBR.position = new Vector3(0.7, 0.5, -1.2);
    wheelBR.setParent(body);

    // Материал для колёс
    const wheelMaterial = new StandardMaterial('wheelMat', scene);
    wheelMaterial.diffuseColor = new Color3(0.1, 0.1, 0.1); // Чёрный цвет
    
    // Материал для переднего левого колеса (красный)
    const wheelFLMaterial = new StandardMaterial('wheelFLMat', scene);
    wheelFLMaterial.diffuseColor = new Color3(1, 0, 0); // Красный цвет
    
    // Материал для заднего левого колеса (синий)
    const wheelBLMaterial = new StandardMaterial('wheelBLMat', scene);
    wheelBLMaterial.diffuseColor = new Color3(0, 0, 1); // Синий цвет
    
    // Материал для заднего правого колеса (зеленый)
    const wheelFRMaterial = new StandardMaterial('wheelFRMat', scene);
    wheelFRMaterial.diffuseColor = new Color3(0, 1, 0); // Зеленый цвет
    
    // Применяем материалы
    wheelFL.material = wheelFLMaterial; // Красное переднее левое колесо
    wheelBL.material = wheelBLMaterial; // Синее заднее левое колесо
    wheelFR.material = wheelFRMaterial; // Зеленое заднее правое колесо
    wheelBR.material = wheelMaterial; // Чёрное заднее правое колесо

    // Создаем стационарный красный цилиндр на плоскости
    const redCylinder = MeshBuilder.CreateCylinder('redCylinder', {
      diameter: 0.5,
      height: 1,
      tessellation: 16,
    }, scene);
    redCylinder.position = new Vector3(-10, 0.5, 0); // Стационарная позиция на левой стороне плоскости
    redCylinder.rotation.x = Math.PI / 2; // Поворачиваем горизонтально
    
    // Материал для красного цилиндра
    const redCylinderMaterial = new StandardMaterial('redCylinderMat', scene);
    redCylinderMaterial.diffuseColor = new Color3(1, 0, 0); // Красный цвет
    redCylinder.material = redCylinderMaterial;
    
    // НЕ прикрепляем к кузову - это стационарный объект

    // Устанавливаем кузов как основной объект для управления
    vehicle = body;

    // Enable shadows for vehicle
    shadowGenerator.addShadowCaster(vehicle);
    shadowGenerator.addShadowCaster(redCylinder);

    // Create physics bodies for static objects
    const createPhysicsBodies = () => {
      if (!physicsBodyFactoryRef.current) {
        console.warn('Physics body factory not ready yet');
        return;
      }

      try {
        // Create physics body for ground (static)
        const groundPhysicsBody = physicsBodyFactoryRef.current.createGroundBody(ground, {
          friction: 0.8,        // High friction for ground
          restitution: 0.1,     // Low bounce
          material: {
            friction: 0.8,
            restitution: 0.1,
            rollingFriction: 0.1,
            spinningFriction: 0.1
          }
        });

        // Create physics body for red cylinder (static)
        const cylinderPhysicsBody = physicsBodyFactoryRef.current.createCylinderBody(redCylinder, {
          friction: 0.6,        // Medium friction
          restitution: 0.3,     // Medium bounce
          material: {
            friction: 0.6,
            restitution: 0.3,
            rollingFriction: 0.1,
            spinningFriction: 0.1
          }
        });

        // Register physics bodies with sync system
        if (physicsSystemRef.current) {
          physicsSystemRef.current.registerPhysicsObject(
            groundPhysicsBody.id,
            ground,
            groundPhysicsBody.rigidBody
          );
          
          physicsSystemRef.current.registerPhysicsObject(
            cylinderPhysicsBody.id,
            redCylinder,
            cylinderPhysicsBody.rigidBody
          );
        }

        console.log('✅ Physics bodies created for static objects');
      } catch (error) {
        console.error('❌ Error creating physics bodies:', error);
      }
    };

    // Create physics bodies after a short delay to ensure physics system is ready
    setTimeout(createPhysicsBodies, 100);

    // Enable shadows on ground
    ground.receiveShadows = true;

    // Система отслеживания нажатых клавиш для комбинированного управления
    const pressedKeys = new Set<string>();
    
    scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
        pressedKeys.add(kbInfo.event.key);
      } else if (kbInfo.type === KeyboardEventTypes.KEYUP) {
        pressedKeys.delete(kbInfo.event.key);
      }
    });

    // Обновление движения в каждом кадре
    scene.registerBeforeRender(() => {
      const targetMesh = vehicle ?? scene.getMeshByName('cube');
      if (targetMesh) {
        // Движение вперед/назад
        if (pressedKeys.has('w')) {
          targetMesh.translate(Vector3.Forward(), 0.5, Space.LOCAL);
        }
        if (pressedKeys.has('s')) {
          targetMesh.translate(Vector3.Backward(), 0.5, Space.LOCAL);
        }
        
        // Поворот автомобиля при движении
        if (pressedKeys.has('w') && pressedKeys.has('a')) {
          // Движение вперед + поворот влево
          targetMesh.rotate(Vector3.Up(), -0.05, Space.LOCAL);
        }
        if (pressedKeys.has('w') && pressedKeys.has('d')) {
          // Движение вперед + поворот вправо
          targetMesh.rotate(Vector3.Up(), 0.05, Space.LOCAL);
        }
        if (pressedKeys.has('s') && pressedKeys.has('a')) {
          // Движение назад + поворот влево (обратное направление)
          targetMesh.rotate(Vector3.Up(), 0.05, Space.LOCAL);
        }
        if (pressedKeys.has('s') && pressedKeys.has('d')) {
          // Движение назад + поворот вправо (обратное направление)
          targetMesh.rotate(Vector3.Up(), -0.05, Space.LOCAL);
        }
        
        // Поворот передних колес для визуального эффекта
        if (pressedKeys.has('a')) {
          // Поворачиваем передние колеса влево
          const turnAngle = -Math.PI / 6; // 30 градусов в радианах
          wheelFL.rotation.y = turnAngle;
          wheelFR.rotation.y = turnAngle;
        } else if (pressedKeys.has('d')) {
          // Поворачиваем передние колеса вправо
          const turnAngle = Math.PI / 6; // 30 градусов в радианах
          wheelFL.rotation.y = turnAngle;
          wheelFR.rotation.y = turnAngle;
        } else {
          // Возвращаем колеса в исходное положение
          wheelFL.rotation.y = 0;
          wheelFR.rotation.y = 0;
        }
      }
    });

    // Handle window resize
    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

           // Start render loop
           engine.runRenderLoop(() => {
             // Update physics system
             if (physicsSystemRef.current) {
               const deltaTime = engine.getDeltaTime() / 1000; // Convert to seconds
               physicsSystemRef.current.update(deltaTime);
             }
             
             scene.render();
           });

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      // Cleanup physics system
      if (physicsSystemRef.current) {
        physicsSystemRef.current.dispose();
        physicsSystemRef.current = null;
      }
      
      engine.dispose();
    };
  }, []);


  return (
    <div className="gameplay-page">
      {/* 3D Canvas */}
      <canvas
        ref={canvasRef}
        className="babylon-canvas"
      />

      {/* UI Overlay */}
      <div className="gameplay-ui">
        <button
          className="back-button"
          onClick={onBackToMenu}
          type="button"
        >
          ← Back to Menu
        </button>
        
      </div>
    </div>
  );
};

export default GameplayPage;
