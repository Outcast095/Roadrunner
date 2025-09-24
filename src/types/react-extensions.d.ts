/**
 * React extensions and custom types for Roadrunner game
 * Context7 best practices for React + TypeScript game development
 */

import type { ComponentType, ReactNode, RefAttributes, ComponentProps } from 'react';

// ============================================================================
// REACT COMPONENT TYPES
// ============================================================================

/**
 * Base props for all game components
 */
export type BaseGameComponentProps = {
  className?: string;
  children?: ReactNode;
  'data-testid'?: string;
}

/**
 * Props for components that can be disabled
 */
export type DisableableProps = {
  disabled?: boolean;
}

/**
 * Props for components that can be loading
 */
export type LoadingProps = {
  loading?: boolean;
}

/**
 * Props for components that can show errors
 */
export type ErrorProps = {
  error?: string | null;
}

/**
 * Props for components that can be controlled
 */
export type ControlledProps<T> = {
  value?: T;
  onChange?: (value: T) => void;
}

// ============================================================================
// GAME-SPECIFIC COMPONENT TYPES
// ============================================================================

/**
 * Props for game UI components
 */
export type GameUIProps = {
  visible?: boolean;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  zIndex?: number;
} & BaseGameComponentProps

/**
 * Props for HUD components
 */
export type HUDProps = {
  gameState?: import('./game').GameState;
  playerStats?: import('./game').PlayerStats;
} & GameUIProps

/**
 * Props for menu components
 */
export type MenuProps = {
  isOpen?: boolean;
  onClose?: () => void;
  onAction?: (action: string) => void;
} & BaseGameComponentProps

/**
 * Props for button components
 */
export type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
} & BaseGameComponentProps & DisableableProps & LoadingProps

/**
 * Props for input components
 */
export type InputProps = {
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  required?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
} & BaseGameComponentProps & ControlledProps<string> & ErrorProps

/**
 * Props for slider components
 */
export type SliderProps = {
  min?: number;
  max?: number;
  step?: number;
  orientation?: 'horizontal' | 'vertical';
  showValue?: boolean;
  showTicks?: boolean;
} & BaseGameComponentProps & ControlledProps<number>

/**
 * Props for toggle components
 */
export type ToggleProps = {
  label?: string;
  description?: string;
  size?: 'small' | 'medium' | 'large';
} & BaseGameComponentProps & ControlledProps<boolean>

// ============================================================================
// HIGHER-ORDER COMPONENT TYPES
// ============================================================================

/**
 * HOC for components that need game state
 */
export type WithGameStateProps = {
  gameState: import('./game').GameState;
}

/**
 * HOC for components that need player stats
 */
export type WithPlayerStatsProps = {
  playerStats: import('./game').PlayerStats;
}

/**
 * HOC for components that need input handling
 */
export type WithInputProps = {
  inputState: import('./game').InputState;
  onInputChange: (input: Partial<import('./game').InputState>) => void;
}

/**
 * HOC for components that need performance monitoring
 */
export type WithPerformanceProps = {
  performance: import('./game').PerformanceMetrics;
}

// ============================================================================
// CONTEXT TYPES
// ============================================================================

/**
 * Game context value
 */
export type GameContextValue = {
  gameState: import('./game').GameState;
  playerStats: import('./game').PlayerStats;
  settings: import('./game').GameSettings;
  inputState: import('./game').InputState;
  performance: import('./game').PerformanceMetrics;
  dispatch: (action: GameAction) => void;
}

/**
 * Game action types
 */
export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'END_GAME' }
  | { type: 'UPDATE_SCORE'; payload: number }
  | { type: 'UPDATE_FUEL'; payload: number }
  | { type: 'COLLECT_BARREL'; payload: { barrelId: string; fuelAmount: number } }
  | { type: 'HIT_OBSTACLE'; payload: { obstacleId: string; damage: number } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<import('./game').GameSettings> }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: { achievementId: string } };

/**
 * Settings context value
 */
export type SettingsContextValue = {
  settings: import('./game').GameSettings;
  updateSettings: (settings: Partial<import('./game').GameSettings>) => void;
  resetSettings: () => void;
}

/**
 * Input context value
 */
export type InputContextValue = {
  inputState: import('./game').InputState;
  updateInput: (input: Partial<import('./game').InputState>) => void;
  resetInput: () => void;
}

// ============================================================================
// HOOK TYPES
// ============================================================================

/**
 * Custom hook return types
 */
export type UseGameStateReturn = {
  gameState: import('./game').GameState;
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  score: number;
  fuel: number;
  timeElapsed: number;
    startGame: () => void;
    pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  updateScore: (score: number) => void;
  updateFuel: (fuel: number) => void;
}

export type UsePlayerStatsReturn = {
  playerStats: import('./game').PlayerStats;
  updateStats: (stats: Partial<import('./game').PlayerStats>) => void;
  unlockAchievement: (achievementId: string) => void;
  addPlayTime: (time: number) => void;
  updateBestScore: (score: number) => void;
}

export type UseSettingsReturn = {
  settings: import('./game').GameSettings;
  updateSettings: (settings: Partial<import('./game').GameSettings>) => void;
  resetSettings: () => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  setVolume: (type: 'sound' | 'music', volume: number) => void;
  setGraphicsQuality: (quality: 'low' | 'medium' | 'high') => void;
}

export type UseInputReturn = {
  inputState: import('./game').InputState;
  updateInput: (input: Partial<import('./game').InputState>) => void;
  resetInput: () => void;
  isKeyPressed: (key: string) => boolean;
  isMouseDown: () => boolean;
  getMousePosition: () => { x: number; y: number };
  getMouseDelta: () => { deltaX: number; deltaY: number };
}

export type UsePerformanceReturn = {
  performance: import('./game').PerformanceMetrics;
  startProfiling: () => void;
  stopProfiling: () => void;
  getFPS: () => number;
  getMemoryUsage: () => number;
  getFrameTime: () => number;
}

// ============================================================================
// EVENT HANDLER TYPES
// ============================================================================

/**
 * Event handler types for game events
 */
export type GameEventHandler<T = unknown> = (event: T) => void;

export type KeyboardEventHandler = (event: KeyboardEvent) => void;
export type MouseEventHandler = (event: MouseEvent) => void;
export type GamepadEventHandler = (event: GamepadEvent) => void;
export type TouchEventHandler = (event: TouchEvent) => void;

/**
 * Game-specific event handlers
 */
export type BarrelCollectedHandler = GameEventHandler<import('./game').BarrelCollectedEvent>;
export type ObstacleHitHandler = GameEventHandler<import('./game').ObstacleHitEvent>;
export type AchievementUnlockedHandler = GameEventHandler<import('./game').AchievementUnlockedEvent>;

// ============================================================================
// REF TYPES
// ============================================================================

/**
 * Ref types for game components
 */
export type GameCanvasRef = {
  getCanvas: () => HTMLCanvasElement | null;
  getContext: () => CanvasRenderingContext2D | null;
  resize: (width: number, height: number) => void;
  clear: () => void;
}

export type GameAudioRef = {
  play: (sound: string) => void;
  stop: (sound: string) => void;
  setVolume: (volume: number) => void;
  setMute: (mute: boolean) => void;
}

export type GameInputRef = {
  focus: () => void;
  blur: () => void;
  isFocused: () => boolean;
  getValue: () => string;
  setValue: (value: string) => void;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract component props type
 */
export type ComponentProps<T> = T extends ComponentType<infer P> ? P : never;

/**
 * Extract ref type from component
 */
export type ComponentRef<T> = T extends ComponentType<infer P>
  ? P extends RefAttributes<infer R>
    ? R
    : never
  : never;

/**
 * Make all properties optional except specified keys
 */
export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

/**
 * Make all properties required except specified keys
 */
export type RequiredExcept<T, K extends keyof T> = Required<T> & Partial<Pick<T, K>>;

/**
 * Extract the value type from a controlled component
 */
export type ControlledValue<T> = T extends ControlledProps<infer V> ? V : never;

/**
 * Extract the change handler type from a controlled component
 */
export type ControlledChangeHandler<T> = T extends ControlledProps<infer V>
  ? (value: V) => void
  : never;