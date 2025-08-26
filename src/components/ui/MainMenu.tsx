import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';

interface MainMenuProps {}

const MainMenu: FC<MainMenuProps> = () => {
  const navigate = useNavigate();

  const handleStartGame = (): void => {
    navigate('/game');
  };

  return (
    <div className="main-menu">
      <h1>Roadrunner</h1>
      <h2>Симулятор внедорожника</h2>
      
      <div className="menu-buttons">
        <button 
          className="start-button" 
          onClick={handleStartGame}
        >
          Начать игру
        </button>
        
        <button className="options-button">
          Настройки
        </button>
      </div>
    </div>
  );
};

export default MainMenu;