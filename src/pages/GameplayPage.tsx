import React, { useEffect, useRef, useState } from 'react';
import { Engine, Scene, ArcRotateCamera, HemisphericLight, Vector3, MeshBuilder, StandardMaterial, Color3, DirectionalLight, ShadowGenerator, KeyboardEventTypes, type AbstractMesh } from '@babylonjs/core';
import { PhysicsSystem, PhysicsBodyFactory, OffroadVehicleConfigFactory, VehiclePhysicsSystem } from '../utils/physics';
import './GameplayPage.scss';

declare const window: {
  addEventListener: (event: string, handler: () => void) => void;
  removeEventListener: (event: string, handler: () => void) => void;
};

type GameplayPageProps = {
  onBackToMenu: () => void;
}

const GameplayPage: React.FC<GameplayPageProps> = ({ onBackToMenu }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const physicsSystemRef = useRef<PhysicsSystem | null>(null);
  const physicsBodyFactoryRef = useRef<PhysicsBodyFactory | null>(null);
  const vehiclePhysicsSystemRef = useRef<VehiclePhysicsSystem | null>(null);
  const vehicleIdRef = useRef<string | null>(null);
  const [isPhysicsReady, setIsPhysicsReady] = useState(false);
  const [isVehicleReady, setIsVehicleReady] = useState(false);

  // Функции для создания физических объектов
  const createVehiclePhysics = () => {
    if (!vehiclePhysicsSystemRef.current || !sceneRef.current || !physicsSystemRef.current) {
      return;
    }

    try {
      const body = sceneRef.current.getMeshByName('body');
      const wheelFL = sceneRef.current.getMeshByName('wheelFL');
      const wheelFR = sceneRef.current.getMeshByName('wheelFR');
      const wheelBL = sceneRef.current.getMeshByName('wheelBL');
      const wheelBR = sceneRef.current.getMeshByName('wheelBR');

      if (!body || !wheelFL || !wheelFR || !wheelBL || !wheelBR) {
        return;
      }

      const vehicleConfig = OffroadVehicleConfigFactory.createOffroadConfig();
      vehicleIdRef.current = vehiclePhysicsSystemRef.current.createVehicle(body, [wheelFL, wheelFR, wheelBL, wheelBR], vehicleConfig);
      
      // Регистрируем автомобиль в PhysicsSyncSystem для синхронизации
      if (vehicleIdRef.current && physicsSystemRef.current) {
        const vehicle = vehiclePhysicsSystemRef.current.getVehicle(vehicleIdRef.current);
        if (vehicle && vehicle.body) {
          physicsSystemRef.current.registerPhysicsObject(vehicleIdRef.current, vehicle.body, vehicle.vehicle);
        }
      }
      
      setIsVehicleReady(true);
    } catch (error) {
      console.error('❌ Error creating vehicle physics:', error);
      setIsVehicleReady(false);
    }
  };

  const createPhysicsBodies = () => {
    if (!physicsBodyFactoryRef.current || !physicsSystemRef.current || !sceneRef.current) {
      return;
    }

    try {
      const ground = sceneRef.current.getMeshByName('ground');
      const redCylinder = sceneRef.current.getMeshByName('redCylinder');

      if (!ground || !redCylinder) {
        return;
      }

      const groundPhysicsBody = physicsBodyFactoryRef.current.createGroundBody(ground, {
        friction: 0.8,
        restitution: 0.1,
        collisionGroup: 1,
        collisionMask: 6,
        material: { friction: 0.8, restitution: 0.1, rollingFriction: 0.1, spinningFriction: 0.1 }
      });

      const cylinderPhysicsBody = physicsBodyFactoryRef.current.createCylinderBody(redCylinder, {
        mass: 15,
        friction: 0.7,
        restitution: 0.4,
        linearDamping: 0.1,
        angularDamping: 0.1,
        collisionGroup: 2,  // Группа 2 для динамических объектов
        collisionMask: 1,   // Может сталкиваться с группой 1 (земля)
        material: { friction: 0.7, restitution: 0.4, rollingFriction: 0.2, spinningFriction: 0.2 }
      });

      physicsSystemRef.current.registerPhysicsObject(groundPhysicsBody.id, ground, groundPhysicsBody.rigidBody);
      physicsSystemRef.current.registerPhysicsObject(cylinderPhysicsBody.id, redCylinder, cylinderPhysicsBody.rigidBody);
    } catch (error) {
      console.error('❌ Error creating physics bodies:', error);
    }
  };

  useEffect(() => {
    if (!canvasRef.current) {
      console.error('❌ Canvas ref is null');
      return;
    }

    const engine = new Engine(canvasRef.current, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      alpha: false,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
      failIfMajorPerformanceCaveat: false,
      depth: true,
    });
    engineRef.current = engine;

    const scene = new Scene(engine);
    sceneRef.current = scene;

    // Проверка поддержки WebGL
    if (!Engine.isSupported) {
      console.error('❌ WebGL not supported');
      return;
    }

    const initializePhysics = async () => {
      try {
        const physicsSystem = new PhysicsSystem({
          gravity: { x: 0, y: -9.81, z: 0 },
          timeStep: 1/60,
          maxSubSteps: 10,
          updateConfig: {
            fixedTimeStep: 1/60,
            maxSubSteps: 10,
            interpolation: true,
            smoothing: 0.8,
            enableSleeping: true,
            sleepThreshold: 0.1,
            enableCaching: true,
            debugMode: true,
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
            debugMode: true,
            logSyncErrors: true
          }
        });

        await physicsSystem.initialize();
        physicsSystem.start();
        
        physicsSystemRef.current = physicsSystem;
        physicsBodyFactoryRef.current = new PhysicsBodyFactory(physicsSystem.getPhysicsManager());
        vehiclePhysicsSystemRef.current = new VehiclePhysicsSystem(physicsSystem.getPhysicsManager());
        
        setIsPhysicsReady(true);
      } catch (error) {
        console.error('❌ Error initializing physics system:', error);
        setIsPhysicsReady(false);
      }
    };

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 50, Vector3.Zero(), scene);
    camera.attachControl(canvasRef.current, true);
    camera.setTarget(Vector3.Zero());

    const hemisphericLight = new HemisphericLight('hemisphericLight', new Vector3(0, 1, 0), scene);
    hemisphericLight.intensity = 0.7;

    const directionalLight = new DirectionalLight('directionalLight', new Vector3(-1, -1, -1), scene);
    directionalLight.position = new Vector3(20, 40, 20);
    directionalLight.intensity = 0.5;

    const shadowGenerator = new ShadowGenerator(1024, directionalLight);
    shadowGenerator.useExponentialShadowMap = true;

    const body = MeshBuilder.CreateBox('body', { width: 1.8, height: 1.6, depth: 4.2 }, scene); // Компактный внедорожник
    body.position.y = 20.0; // Поднимаем автомобиль на 20 метров для тестирования гравитации
    body.position.x = 0;
    body.position.z = 0;
    body.rotation.y = 0;
    body.rotation.x = 0;
    body.rotation.z = 0;
    

    const bodyMaterial = new StandardMaterial('bodyMat', scene);
    bodyMaterial.diffuseColor = new Color3(0.2, 0.5, 0.8);
    bodyMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
    bodyMaterial.roughness = 0.8;
    body.material = bodyMaterial;
    

    const wheelRadius = 0.45; // 45см радиус (в пределах 0.4-0.5м)
    const wheelWidth = 0.25;  // 25см ширина (в пределах 0.2-0.3м)
    

    const wheelFL = MeshBuilder.CreateCylinder('wheelFL', { diameter: wheelRadius * 2, height: wheelWidth, tessellation: 24 }, scene);
    wheelFL.rotation.z = Math.PI / 2;
    wheelFL.setParent(body);
    wheelFL.position = new Vector3(0.7, -0.8, -1.5);

    const wheelFR = MeshBuilder.CreateCylinder('wheelFR', { diameter: wheelRadius * 2, height: wheelWidth, tessellation: 24 }, scene);
    wheelFR.rotation.z = Math.PI / 2;
    wheelFR.setParent(body);
    wheelFR.position = new Vector3(-0.7, -0.8, -1.5);

    const wheelBL = MeshBuilder.CreateCylinder('wheelBL', { diameter: wheelRadius * 2, height: wheelWidth, tessellation: 24 }, scene);
    wheelBL.rotation.z = Math.PI / 2;
    wheelBL.setParent(body);
    wheelBL.position = new Vector3(0.7, -0.8, 1.5);

    const wheelBR = MeshBuilder.CreateCylinder('wheelBR', { diameter: wheelRadius * 2, height: wheelWidth, tessellation: 24 }, scene);
    wheelBR.rotation.z = Math.PI / 2;
    wheelBR.setParent(body);
    wheelBR.position = new Vector3(-0.7, -0.8, 1.5);
    

    // Материалы для колес (реалистичные)
    const wheelFLMaterial = new StandardMaterial('wheelFLMat', scene);
    wheelFLMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2); // Темно-серый
    wheelFLMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
    wheelFLMaterial.roughness = 0.9;
    wheelFL.material = wheelFLMaterial;

    const wheelBLMaterial = new StandardMaterial('wheelBLMat', scene);
    wheelBLMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2); // Темно-серый
    wheelBLMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
    wheelBLMaterial.roughness = 0.9;
    wheelBL.material = wheelBLMaterial;

    const wheelFRMaterial = new StandardMaterial('wheelFRMat', scene);
    wheelFRMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2); // Темно-серый
    wheelFRMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
    wheelFRMaterial.roughness = 0.9;
    wheelFR.material = wheelFRMaterial;

    const wheelBRMaterial = new StandardMaterial('wheelBRMat', scene);
    wheelBRMaterial.diffuseColor = new Color3(0.2, 0.2, 0.2); // Темно-серый
    wheelBRMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
    wheelBRMaterial.roughness = 0.9;
    wheelBR.material = wheelBRMaterial;

    // Добавляем тени для колес
    shadowGenerator.addShadowCaster(wheelFL);
    shadowGenerator.addShadowCaster(wheelFR);
    shadowGenerator.addShadowCaster(wheelBL);
    shadowGenerator.addShadowCaster(wheelBR);
    

    const redCylinder = MeshBuilder.CreateCylinder('redCylinder', { diameter: 0.5, height: 1, tessellation: 16 }, scene);
    redCylinder.position = new Vector3(-10, 10, 0); // 10 метров над землей для тестирования гравитации
    redCylinder.rotation.x = Math.PI / 2;
    const redCylinderMaterial = new StandardMaterial('redCylinderMat', scene);
    redCylinderMaterial.diffuseColor = new Color3(1, 0, 0);
    redCylinder.material = redCylinderMaterial;

    shadowGenerator.addShadowCaster(body);
    shadowGenerator.addShadowCaster(redCylinder);
    const ground = MeshBuilder.CreateGround('ground', { width: 100, height: 100 }, scene);
    ground.receiveShadows = true;
    const groundMaterial = new StandardMaterial('groundMaterial', scene);
    groundMaterial.diffuseColor = new Color3(0.2, 0.6, 0.2);
    groundMaterial.specularColor = new Color3(0.1, 0.1, 0.1);
    ground.material = groundMaterial;


    initializePhysics();

    const pressedKeys = new Set<string>();
    scene.onKeyboardObservable.add((kbInfo) => {
      if (kbInfo.type === KeyboardEventTypes.KEYDOWN) {
        pressedKeys.add(kbInfo.event.key.toLowerCase());
      } else if (kbInfo.type === KeyboardEventTypes.KEYUP) {
        pressedKeys.delete(kbInfo.event.key.toLowerCase());
      }
    });

    scene.registerBeforeRender(() => {
      if (!vehiclePhysicsSystemRef.current || !vehicleIdRef.current) {
        return;
      }

      const deltaTime = engine.getDeltaTime() / 1000;
      
      let engineForce = 0;
      let brakeForce = 0;
      let steerAngle = 0;

      // Обработка ввода
      if (pressedKeys.has('w')) engineForce = 1;
      if (pressedKeys.has('s')) engineForce = -1;
      if (pressedKeys.has(' ')) brakeForce = 1;
      if (pressedKeys.has('a')) steerAngle = -1;
      if (pressedKeys.has('d')) steerAngle = 1;

      // Применяем управление только если есть активные клавиши
      if (engineForce !== 0 || brakeForce !== 0 || steerAngle !== 0) {
        if (vehiclePhysicsSystemRef.current.hasVehicle(vehicleIdRef.current)) {
          vehiclePhysicsSystemRef.current.applyControl(vehicleIdRef.current, { 
            engineForce, 
            brakeForce, 
            steerAngle 
          });
          vehiclePhysicsSystemRef.current.updateVehicle(vehicleIdRef.current, deltaTime);
        }
      }
    });

    engine.runRenderLoop(() => {
      if (physicsSystemRef.current) {
        const deltaTime = engine.getDeltaTime() / 1000;
        physicsSystemRef.current.update(deltaTime);
      }
      scene.render();
    });

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (vehiclePhysicsSystemRef.current) {
        vehiclePhysicsSystemRef.current.dispose();
        vehiclePhysicsSystemRef.current = null;
      }
      if (physicsSystemRef.current) {
        physicsSystemRef.current.dispose();
        physicsSystemRef.current = null;
      }
      engine.dispose();
    };
  }, [isPhysicsReady]);

  // Отдельный useEffect для создания объектов при изменении isPhysicsReady
  useEffect(() => {
    if (isPhysicsReady && sceneRef.current && engineRef.current) {
      setTimeout(() => {
        createVehiclePhysics();
        createPhysicsBodies();
      }, 100);
    }
  }, [isPhysicsReady]);

  return (
    <div className="gameplay-page">
      <canvas ref={canvasRef} className="babylon-canvas" />
      <div className="gameplay-ui">
        <button className="back-button" onClick={onBackToMenu} type="button">
          ← Back to Menu
        </button>
      </div>
    </div>
  );
};

export default GameplayPage;