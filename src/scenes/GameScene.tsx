import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

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
      <div className="loading-screen">
        <h2>Загрузка игры...</h2>
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="game-scene">
      <div className="game-container">
        {/* Здесь будет размещен 3D-контейнер игры */}
        <div className="game-canvas-placeholder">
          <h2>3D Симулятор внедорожника</h2>
          <p>Здесь будет отображаться 3D-сцена</p>
        </div>
      </div>

      <div className="game-controls">
        <button 
          className="back-button" 
          onClick={handleBackToMenu}
        >
          Вернуться в меню
        </button>
      </div>
    </div>
  );
};

export default GameScene;