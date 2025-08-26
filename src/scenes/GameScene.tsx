// Импортируем необходимые хуки из React
import { useState, useEffect, Suspense } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
// Импортируем Canvas - основной контейнер для 3D-сцены из React Three Fiber
import { Canvas } from '@react-three/fiber';
// Импортируем вспомогательные компоненты из библиотеки drei для улучшения 3D-сцены
import { OrbitControls, Environment, Stars } from '@react-three/drei';
// Импортируем физический движок для симуляции физики в 3D-мире
import { Physics } from '@react-three/rapier';
// Импортируем стили для компонента
import styles from './gameScene.module.scss';

// Определяем интерфейс для пропсов компонента (пока пустой)
interface GameSceneProps {}

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
        <Canvas shadows camera={{ position: [0, 5, 15], fov: 50 }}>
          {/* Устанавливаем цвет фона (голубое небо) */}
          <color attach="background" args={['#87ceeb']} />
          
          {/* Добавляем туман для создания эффекта глубины */}
          {/* args: [цвет, минимальное расстояние, максимальное расстояние] */}
          <fog attach="fog" args={['#87ceeb', 30, 100]} />
          
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
            </Physics>
            
            {/* Добавляем окружение с пресетом заката для реалистичного освещения */}
            <Environment preset="sunset" />
            
            {/* Добавляем звезды для визуального эффекта */}
            <Stars 
              radius={100} // Радиус сферы, на которой расположены звезды
              depth={50} // Глубина звездного поля
              count={5000} // Количество звезд
              factor={4} // Фактор размера звезд
              saturation={0} // Насыщенность цвета звезд
              fade // Эффект затухания звезд
              speed={1} // Скорость анимации звезд
            />
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