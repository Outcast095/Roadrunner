/**
 * Physics Bodies
 * Создание физических тел для статичных и динамических объектов
 */

import { AbstractMesh } from '@babylonjs/core';
import { PhysicsManager } from './PhysicsManager';

export interface PhysicsBodyConfig {
  // Основные параметры
  mass: number;                    // Масса (0 = статичное тело)
  friction: number;                // Трение (0-1)
  restitution: number;             // Упругость (0-1)
  linearDamping: number;           // Линейное затухание
  angularDamping: number;          // Угловое затухание
  
  // Дополнительные параметры
  isKinematic: boolean;            // Кинематическое тело
  isTrigger: boolean;              // Триггер (не участвует в коллизиях)
  collisionGroup: number;          // Группа коллизий
  collisionMask: number;           // Маска коллизий
  
  // Материалы
  material?: {
    friction: number;
    restitution: number;
    rollingFriction: number;
    spinningFriction: number;
  };
}

export interface PhysicsBody {
  mesh: AbstractMesh;              // Визуальный объект
  rigidBody: any;                  // Физическое тело
  collisionShape: any;             // Форма коллизии
  motionState: any;                // Состояние движения
  id: string;                      // Уникальный ID
  config: PhysicsBodyConfig;       // Конфигурация
}

export class PhysicsBodyFactory {
  private physicsManager: PhysicsManager;
  private ammo: any;

  constructor(physicsManager: PhysicsManager) {
    this.physicsManager = physicsManager;
    this.ammo = physicsManager.getAmmo();
  }

  /**
   * Создание физического тела для плоскости (земли)
   */
  createGroundBody(
    mesh: AbstractMesh,
    config?: Partial<PhysicsBodyConfig>
  ): PhysicsBody {
    const defaultConfig: PhysicsBodyConfig = {
      mass: 0,                     // Статичное тело
      friction: 0.8,               // Высокое трение
      restitution: 0.1,            // Низкая упругость
      linearDamping: 0.0,
      angularDamping: 0.0,
      isKinematic: false,
      isTrigger: false,
      collisionGroup: 1,
      collisionMask: -1,
      material: {
        friction: 0.8,
        restitution: 0.1,
        rollingFriction: 0.1,
        spinningFriction: 0.1
      },
      ...config
    };

    // Создаем форму коллизии для плоскости
    const groundShape = this.createGroundShape(mesh);
    
    // Создаем физическое тело
    const rigidBody = this.createRigidBody(mesh, groundShape, defaultConfig);
    
    // Добавляем в физический мир
    this.physicsManager.addRigidBody(rigidBody);

    return {
      mesh,
      rigidBody,
      collisionShape: groundShape,
      motionState: rigidBody.getMotionState(),
      id: `ground_${mesh.uniqueId}`,
      config: defaultConfig
    };
  }

  //Создание физического тела для цилиндра
  createCylinderBody(
    mesh: AbstractMesh,
    config?: Partial<PhysicsBodyConfig>
  ): PhysicsBody {
    const defaultConfig: PhysicsBodyConfig = {
      mass: 0,                     // Статичное тело
      friction: 0.6,               // Среднее трение
      restitution: 0.3,            // Средняя упругость
      linearDamping: 0.0,
      angularDamping: 0.0,
      isKinematic: false,
      isTrigger: false,
      collisionGroup: 2,
      collisionMask: -1,
      material: {
        friction: 0.6,
        restitution: 0.3,
        rollingFriction: 0.1,
        spinningFriction: 0.1
      },
      ...config
    };

    // Создаем форму коллизии для цилиндра
    const cylinderShape = this.createCylinderShape(mesh);
    
    // Создаем физическое тело
    const rigidBody = this.createRigidBody(mesh, cylinderShape, defaultConfig);
    
    // Добавляем в физический мир
    this.physicsManager.addRigidBody(rigidBody);

    return {
      mesh,
      rigidBody,
      collisionShape: cylinderShape,
      motionState: rigidBody.getMotionState(),
      id: `cylinder_${mesh.uniqueId}`,
      config: defaultConfig
    };
  }

  // Создание физического тела для коробки
  createBoxBody(
    mesh: AbstractMesh,
    config?: Partial<PhysicsBodyConfig>
  ): PhysicsBody {
    const defaultConfig: PhysicsBodyConfig = {
      mass: 0,                     // Статичное тело
      friction: 0.7,               // Среднее трение
      restitution: 0.2,            // Низкая упругость
      linearDamping: 0.0,
      angularDamping: 0.0,
      isKinematic: false,
      isTrigger: false,
      collisionGroup: 3,
      collisionMask: -1,
      material: {
        friction: 0.7,
        restitution: 0.2,
        rollingFriction: 0.1,
        spinningFriction: 0.1
      },
      ...config
    };

    // Создаем форму коллизии для коробки
    const boxShape = this.createBoxShape(mesh);
    
    // Создаем физическое тело
    const rigidBody = this.createRigidBody(mesh, boxShape, defaultConfig);
    
    // Добавляем в физический мир
    this.physicsManager.addRigidBody(rigidBody);

    return {
      mesh,
      rigidBody,
      collisionShape: boxShape,
      motionState: rigidBody.getMotionState(),
      id: `box_${mesh.uniqueId}`,
      config: defaultConfig
    };
  }

  // Создание формы коллизии для плоскости
  private createGroundShape(mesh: AbstractMesh): any {
    // Получаем размеры плоскости
    const boundingInfo = mesh.getBoundingInfo();
    const size = boundingInfo.boundingBox.maximum.subtract(boundingInfo.boundingBox.minimum);
    
    // Создаем форму плоскости (статичная плоскость)
    const groundShape = new this.ammo.btStaticPlaneShape(
      new this.ammo.btVector3(0, 1, 0),  // Нормаль плоскости (вверх)
      0                                   // Расстояние от начала координат
    );
    
    return groundShape;
  }

  // Создание формы коллизии для цилиндра
  private createCylinderShape(mesh: AbstractMesh): any {
    // Получаем размеры цилиндра
    const boundingInfo = mesh.getBoundingInfo();
    const size = boundingInfo.boundingBox.maximum.subtract(boundingInfo.boundingBox.minimum);
    
    // Создаем форму цилиндра
    const cylinderShape = new this.ammo.btCylinderShape(
      new this.ammo.btVector3(
        size.x / 2,  // Половина ширины
        size.y / 2,  // Половина высоты
        size.z / 2   // Половина глубины
      )
    );
    
    return cylinderShape;
  }

  //Создание формы коллизии для коробки
  private createBoxShape(mesh: AbstractMesh): any {
    // Получаем размеры коробки
    const boundingInfo = mesh.getBoundingInfo();
    const size = boundingInfo.boundingBox.maximum.subtract(boundingInfo.boundingBox.minimum);
    
    // Создаем форму коробки
    const boxShape = new this.ammo.btBoxShape(
      new this.ammo.btVector3(
        size.x / 2,  // Половина ширины
        size.y / 2,  // Половина высоты
        size.z / 2   // Половина глубины
      )
    );
    
    return boxShape;
  }

  // Создание физического тела
  private createRigidBody(
    mesh: AbstractMesh,
    collisionShape: any,
    config: PhysicsBodyConfig
  ): any {
    // Создаем состояние движения
    const motionState = new this.ammo.btDefaultMotionState();
    
    // Создаем трансформацию
    const transform = new this.ammo.btTransform();
    transform.setIdentity();
    
    // Устанавливаем позицию
    const position = mesh.position;
    transform.setOrigin(new this.ammo.btVector3(position.x, position.y, position.z));
    
    // Устанавливаем вращение
    const rotation = mesh.rotationQuaternion || mesh.rotation;
    if (rotation) {
      const quaternion = new this.ammo.btQuaternion(
        rotation.x || 0,
        rotation.y || 0,
        rotation.z || 0,
        (rotation as any).w || 1
      );
      transform.setRotation(quaternion);
    }
    
    // Устанавливаем состояние движения
    motionState.setWorldTransform(transform);
    
    // Создаем инерцию
    const localInertia = new this.ammo.btVector3(0, 0, 0);
    if (config.mass > 0) {
      collisionShape.calculateLocalInertia(config.mass, localInertia);
    }
    
    // Создаем информацию о теле
    const bodyInfo = new this.ammo.btRigidBodyConstructionInfo(
      config.mass,
      motionState,
      collisionShape,
      localInertia
    );
    
    // Создаем физическое тело
    const rigidBody = new this.ammo.btRigidBody(bodyInfo);
    
    // Настраиваем параметры
    rigidBody.setFriction(config.friction);
    rigidBody.setRestitution(config.restitution);
    rigidBody.setDamping(config.linearDamping, config.angularDamping);
    
    // Настраиваем группы коллизий
    rigidBody.setCollisionFlags(rigidBody.getCollisionFlags() | this.ammo.btCollisionObject.CF_CUSTOM_MATERIAL_CALLBACK);
    
    // Настраиваем материал если указан
    if (config.material) {
      this.setupMaterial(rigidBody, config.material);
    }
    
    // Освобождаем временные объекты
    this.ammo.destroy(localInertia);
    this.ammo.destroy(bodyInfo);
    
    return rigidBody;
  }

  // Настройка материала (упрощенная версия)
  private setupMaterial(rigidBody: any, material: any): void {
    // Простая настройка материала без btMaterialProperties
    // Используем только базовые свойства
    rigidBody.setFriction(material.friction);
    rigidBody.setRestitution(material.restitution);
    // TODO: Найти правильный API для rolling и spinning friction
  }

  // Удаление физического тела
  removeBody(physicsBody: PhysicsBody): void {
    // Удаляем из физического мира
    this.physicsManager.removeRigidBody(physicsBody.rigidBody);
    
    // Освобождаем ресурсы
    this.ammo.destroy(physicsBody.rigidBody);
    this.ammo.destroy(physicsBody.collisionShape);
    this.ammo.destroy(physicsBody.motionState);
  }

  // Обновление позиции физического тела
  updateBodyTransform(physicsBody: PhysicsBody): void {
    const transform = new this.ammo.btTransform();
    transform.setIdentity();
    
    // Устанавливаем позицию
    const position = physicsBody.mesh.position;
    transform.setOrigin(new this.ammo.btVector3(position.x, position.y, position.z));
    
    // Устанавливаем вращение
    const rotation = physicsBody.mesh.rotationQuaternion || physicsBody.mesh.rotation;
    if (rotation) {
      const quaternion = new this.ammo.btQuaternion(
        rotation.x || 0,
        rotation.y || 0,
        rotation.z || 0,
        (rotation as any).w || 1
      );
      transform.setRotation(quaternion);
    }
    
    // Обновляем состояние движения
    physicsBody.motionState.setWorldTransform(transform);
    
    // Освобождаем временные объекты
    this.ammo.destroy(transform);
  }
}
