// Импортируем необходимые хуки из React
import { useState, useEffect, Suspense } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
// Импортируем Canvas - основной контейнер для 3D-сцены из React Three Fiber
import { Canvas } from '@react-three/fiber';
// Импортируем вспомогательные компоненты из библиотеки drei для улучшения 3D-сцены
import { OrbitControls, Environment, useGLTF } from '@react-three/drei';
// Импортируем физический движок для симуляции физики в 3D-мире
import { Physics } from '@react-three/rapier';
// Импортируем стили для компонента
import styles from './gameScene.module.scss';

// Определяем интерфейс для пропсов компонента (пока пустой)
interface GameSceneProps {}

// Компонент для отображения 3D-модели автомобиля
interface VehicleProps {
  position: [number, number, number];
}

const Vehicle: FC<VehicleProps> = ({ position }) => {
  // Загружаем 3D-модель автомобиля
  const { scene } = useGLTF('/assets/models/vehicle.glb');
  
  // Клонируем сцену для предотвращения мутаций
  const clonedScene = scene.clone();
  
  return (
    <primitive 
      object={clonedScene} 
      position={position}
      scale={[10, 10, 10]} // Масштабируем модель для соответствия сцене
      castShadow // Модель будет отбрасывать тень
      receiveShadow // Модель будет принимать тени
    />
  );
};

// Предварительная загрузка модели для оптимизации
useGLTF.preload('/assets/models/vehicle.glb');

// Основной компонент игровой сцены
const GameScene: FC<GameSceneProps> = () => {
  // Хук для навигации между страницами
  const navigate = useNavigate();
  // Состояние загрузки для отображения экрана загрузки
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Эффект для имитации загрузки игровых ресурсов
  useEffect(() => {
    // Имитация загрузки игровых ресурсов с задержкой в 1.5 секунды
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false); // Устанавливаем состояние загрузки в false после таймаута
    }, 1500);

    // Очистка таймаута при размонтировании компонента для предотвращения утечек памяти
    return () => clearTimeout(loadingTimeout);
  }, []);

  // Обработчик для возврата в главное меню
  const handleBackToMenu = (): void => {
    navigate('/'); // Навигация на главную страницу
  };

  // Отображаем экран загрузки, пока ресурсы загружаются
  if (isLoading) {
    return (
      <div className={styles.loadingScreen}>
        <h2>Загрузка игры...</h2>
        <div className={styles.loadingBar}>
          <div className={styles.loadingProgress}></div>
        </div>
      </div>
    );
  }

  // Основной рендер игровой сцены
  return (
    <div className={styles.gameScene}>
      <div className={styles.gameContainer}>
        {/* Canvas - основной контейнер для 3D-сцены */}
        {/* shadows - включает рендеринг теней */}
        {/* camera - настройка позиции и поля зрения камеры */}
        <Canvas shadows camera={{ position: [50, 150, 15], fov: 50 }}>
          {/* Устанавливаем цвет фона (голубое небо) */}
          <color attach="background" args={['#87ceeb']} />
          
          {/* Добавляем рассеянный свет для базового освещения сцены */}
          <ambientLight intensity={0.5} />
          
          {/* Добавляем направленный свет для создания теней */}
          <directionalLight 
            position={[10, 10, 5]} // Позиция источника света (справа сверху)
            intensity={1} // Интенсивность света
            castShadow // Включаем отбрасывание теней
            shadow-mapSize={[1024, 1024]} // Размер карты теней для качественных теней
          />
          
          {/* Suspense для асинхронной загрузки 3D-моделей и текстур */}
          <Suspense fallback={null}>
            {/* Physics - контейнер для физической симуляции */}
            {/* debug={false} - отключаем отображение физических коллайдеров */}
            <Physics debug={false}>
              {/* Здесь будут компоненты внедорожника, местности и препятствий */}
              
              {/* Создаем плоскость для земли */}
              <mesh 
                rotation={[-Math.PI / 2, 0, 0]} // Поворачиваем плоскость горизонтально (по оси X)
                position={[0, 0, 0]} // Позиция в центре сцены
                receiveShadow // Плоскость будет принимать тени от других объектов
              >
                {/* Геометрия плоскости размером 100x100 единиц */}
                <planeGeometry args={[100, 100]} />
                {/* Материал плоскости с зеленым цветом (трава) */}
                <meshStandardMaterial color="#4a7023" />
              </mesh>            

              {/* Модель автомобиля */}
              <Vehicle position={[0, 4, 5]} />

            </Physics>
            
            {/* Добавляем окружение с пресетом заката для реалистичного освещения */}
            <Environment preset="sunset" />
      
          </Suspense>
          
          {/* Добавляем орбитальные элементы управления камерой */}
          {/* target - точка, вокруг которой вращается камера */}
          {/* maxPolarAngle - ограничение угла наклона камеры (не ниже горизонта) */}
          <OrbitControls target={[0, 0, 0]} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      </div>

      {/* Элементы управления игрой */}
      <div className={styles.gameControls}>
        <button 
          className={styles.backButton} 
          onClick={handleBackToMenu}
        >
          Вернуться в меню
        </button>
      </div>
    </div>
  );
};

export default GameScene;