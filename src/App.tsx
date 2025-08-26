import { Routes, Route } from 'react-router-dom'
import './App.css'

// Импорт компонентов
import MainMenu from './components/ui/MainMenu'
import GameScene from './scenes/GameScene'

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/game" element={<GameScene />} />
    </Routes>
  )
}

export default App
