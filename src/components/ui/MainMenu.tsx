import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './mainMenu.module.scss';

interface MainMenuProps {}

const MainMenu: FC<MainMenuProps> = () => {
  const navigate = useNavigate();

  const handleStartGame = (): void => {
    navigate('/game');
  };

  return (
    <div className={styles.mainMenu}>
      <h1>Roadrunner</h1>
      <h2>Симулятор внедорожника</h2>
      
      <div className={styles.menuButtons}>
        <button 
          className={styles.startButton} 
          onClick={handleStartGame}
        >
          Начать игру
        </button>
      </div>
    </div>
  );
};

export default MainMenu;