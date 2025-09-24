import React from 'react';
import './MenuPage.scss';

// Browser API types for ESLint
declare const console: {
  log: (message: string) => void;
};

type MenuPageProps = {
  onStartGame: () => void;
}

/**
 * MenuPage - Главное меню игры Roadrunner
 * Содержит навигацию и основные опции игры
 */
const MenuPage: React.FC<MenuPageProps> = ({ onStartGame }) => {
  const handleStartGame = () => {
    console.log('🎮 Starting game...');
    onStartGame();
  };

  return (
    <div className="menu-page">
      <div className="menu-container">
        {/* Game Logo */}
        <div className="game-logo">
          <h1 className="game-title">ROADRUNNER</h1>
          <p className="game-subtitle">3D Off-Road Simulator</p>
        </div>

        {/* Main Menu */}
        <nav className="main-menu">
          <button
            className="menu-button primary"
            onClick={handleStartGame}
            type="button"
          >
            <span className="button-icon">🚗</span>
            Start Game
          </button>
        </nav>

        {/* Game Info */}
        <div className="game-info">
          <div className="info-item">
            <span className="info-label">Version:</span>
            <span className="info-value">0.0.0</span>
          </div>
          <div className="info-item">
            <span className="info-label">Status:</span>
            <span className="info-value development">In Development</span>
          </div>
        </div>
      </div>

      {/* Background Elements */}
      <div className="background-elements">
        <div className="terrain-preview">
          <div className="terrain-hill"></div>
          <div className="terrain-hill"></div>
          <div className="terrain-hill"></div>
        </div>
        <div className="vehicle-silhouette">🚗</div>
      </div>
    </div>
  );
};

export default MenuPage;
