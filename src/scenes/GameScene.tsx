import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './gameScene.module.scss';

interface GameSceneProps {}

const GameScene: FC<GameSceneProps> = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Имитация загрузки игровых ресурсов
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(loadingTimeout);
  }, []);

  const handleBackToMenu = (): void => {
    navigate('/');
  };

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

  return (
    <div className={styles.gameScene}>
      <div className={styles.gameContainer}>
        {/* Здесь будет размещен 3D-контейнер игры */}
        <div className={styles.gameCanvasPlaceholder}>
          <h2>3D Симулятор внедорожника</h2>
          <p>Здесь будет отображаться 3D-сцена</p>
        </div>
      </div>

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