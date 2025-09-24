import React, { useState } from 'react';
import { MenuPage, GameplayPage } from './pages';
import './App.css';

/**
 * App - Главный компонент приложения Roadrunner
 * Управляет навигацией между страницами
 */
const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'menu' | 'gameplay'>('menu');

  const handleNavigateToGameplay = () => {
    setCurrentPage('gameplay');
  };

  const handleNavigateToMenu = () => {
    setCurrentPage('menu');
  };

  return (
    <div className="app">
      {currentPage === 'menu' && (
        <MenuPage onStartGame={handleNavigateToGameplay} />
      )}
      {currentPage === 'gameplay' && (
        <GameplayPage onBackToMenu={handleNavigateToMenu} />
      )}
    </div>
  );
};

export default App;
