/**
 * Core game types for Roadrunner - Off-Road Simulator
 * Context7 best practices for TypeScript game development
 */

// ============================================================================
// CORE GAME TYPES
// ============================================================================

/**
 * Game state management
 */
export type GameState = {
  isPlaying: boolean;
  isPaused: boolean;
  isGameOver: boolean;
  currentLevel: number;
  score: number;
  timeElapsed: number;
  fuel: number;
  maxFuel: number;
  barrelsCollected: number;
  playerStats: PlayerStats;
  settings: GameSettings;
}

/**
 * Player statistics and progress
 */
export type PlayerStats = {
  totalPlayTime: number;
  bestScore: number;
  bestTime: number;
  totalBarrelsCollected: number;
  gamesPlayed: number;
  achievements: Achievement[];
}

/**
 * Game settings and configuration
 */
export type GameSettings = {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;        // 0-1
  musicVolume: number;        // 0-1
  graphicsQuality: 'low' | 'medium' | 'high';
  shadows: boolean;
  particles: boolean;
  viewDistance: number;
  fov: number;                // field of view
  keyBindings: ControlsMapping;
}

/**
 * Control mapping configuration
 */
export type ControlsMapping = {
  forward: string;
  backward: string;
  left: string;
  right: string;
  brake: string;
  handbrake: string;
  camera: string;
  pause: string;
  reset: string;
}

// ============================================================================
// GAME OBJECTS
// ============================================================================

/**
 * Vehicle state and properties
 */
export type VehicleState = {
  position: Vector3;
  rotation: Vector3;
  velocity: Vector3;
  angularVelocity: Vector3;
  fuel: number;
  maxFuel: number;
  health: number;
  maxHealth: number;
  isGrounded: boolean;
  gear: number;
  rpm: number;
  speed: number;
  isBraking: boolean;
  isHandbrakeOn: boolean;
}

/**
 * Collectible barrel properties
 */
export type Barrel = {
  id: string;
  position: Vector3;
  rotation: Vector3;
  fuelAmount: number;
  isCollected: boolean;
  respawnTime?: number;
  type: 'small' | 'medium' | 'large';
}

/**
 * Obstacle properties
 */
export type Obstacle = {
  id: string;
  position: Vector3;
  rotation: Vector3;
  type: 'tree' | 'rock' | 'fence' | 'building';
  health: number;
  isDestructible: boolean;
  collisionRadius: number;
}

/**
 * Achievement system
 */
export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
  unlockedAt?: number;
  progress: number;
  maxProgress: number;
  category: 'survival' | 'collection' | 'speed' | 'distance' | 'special';
}

// ============================================================================
// WORLD AND ENVIRONMENT
// ============================================================================

/**
 * World state and terrain
 */
export type WorldState = {
  terrain: TerrainData;
  obstacles: Obstacle[];
  barrels: Barrel[];
  weather: WeatherState;
  timeOfDay: number; // 0-24 hours
}

/**
 * Terrain data structure
 */
export type TerrainData = {
  width: number;
  height: number;
  subdivisions: number;
  heightMap: number[][];
  textureMap: string[][];
  materialMap: string[][];
  collisionData: CollisionData;
}

/**
 * Collision detection data
 */
export type CollisionData = {
  vertices: Vector3[];
  indices: number[];
  normals: Vector3[];
  bounds: BoundingBox;
}

/**
 * Weather system state
 */
export type WeatherState = {
  type: 'clear' | 'rain' | 'fog' | 'storm';
  intensity: number; // 0-1
  windDirection: Vector3;
  windSpeed: number;
  visibility: number; // 0-1
  temperature: number; // Celsius
}

// ============================================================================
// INPUT AND CONTROLS
// ============================================================================

/**
 * Input state management
 */
export type InputState = {
  keyboard: KeyboardState;
  mouse: MouseState;
  gamepad?: GamepadState;
}

/**
 * Keyboard input state
 */
export type KeyboardState = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  brake: boolean;
  handbrake: boolean;
  pause: boolean;
  camera: boolean;
  reset: boolean;
  [key: string]: boolean;
}

/**
 * Mouse input state
 */
export type MouseState = {
  x: number;
  y: number;
  deltaX: number;
  deltaY: number;
  isDown: boolean;
  button: number;
}

/**
 * Gamepad input state
 */
export type GamepadState = {
  connected: boolean;
  index: number;
  axes: number[];
  buttons: boolean[];
  vibration: { left: number; right: number };
}

// ============================================================================
// RENDERING AND GRAPHICS
// ============================================================================

/**
 * Camera configuration
 */
export type CameraConfig = {
  type: 'arcRotate' | 'free' | 'follow' | 'fixed';
  distance: number;
  height: number;
  angle: number;
  target: Vector3;
  smoothing: number;
  collision: boolean;
  fov: number;
  near: number;
  far: number;
}

/**
 * Rendering configuration
 */
export type RenderingConfig = {
  quality: 'low' | 'medium' | 'high';
  shadows: boolean;
  particles: boolean;
  postProcessing: boolean;
  antialiasing: boolean;
  anisotropicFiltering: boolean;
  maxLights: number;
  maxParticles: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * 3D Vector type
 */
export type Vector3 = {
  x: number;
  y: number;
  z: number;
}

/**
 * 2D Vector type
 */
export type Vector2 = {
  x: number;
  y: number;
}

/**
 * Bounding box for collision detection
 */
export type BoundingBox = {
  min: Vector3;
  max: Vector3;
}

/**
 * Position in 3D space
 */
export type Position = Vector3;

/**
 * Rotation in 3D space (Euler angles)
 */
export type Rotation = Vector3;

/**
 * Scale in 3D space
 */
export type Scale = Vector3;

// ============================================================================
// GAME EVENTS
// ============================================================================

/**
 * Game event types
 */
export type GameEventType =
  | 'gameStart'
  | 'gamePause'
  | 'gameResume'
  | 'gameOver'
  | 'barrelCollected'
  | 'obstacleHit'
  | 'fuelEmpty'
  | 'achievementUnlocked'
  | 'levelComplete';

/**
 * Base game event interface
 */
export type GameEvent = {
  type: GameEventType;
  timestamp: number;
  data?: Record<string, unknown>;
}

/**
 * Specific game events
 */
export type BarrelCollectedEvent = {
  type: 'barrelCollected';
  data: {
    barrelId: string;
    fuelAmount: number;
    position: Vector3;
  };
} & GameEvent

export type ObstacleHitEvent = {
  type: 'obstacleHit';
  data: {
    obstacleId: string;
    damage: number;
    position: Vector3;
  };
} & GameEvent

export type AchievementUnlockedEvent = {
  type: 'achievementUnlocked';
  data: {
    achievementId: string;
    achievement: Achievement;
  };
} & GameEvent

// ============================================================================
// PERFORMANCE AND DEBUGGING
// ============================================================================

/**
 * Performance metrics
 */
export type PerformanceMetrics = {
  fps: number;
  frameTime: number;
  memoryUsage: number;
  drawCalls: number;
  triangles: number;
  textures: number;
  materials: number;
  lights: number;
  meshes: number;
  animations: number;
  particles: number;
  sounds: number;
  loadTime: number;
  initTime: number;
  renderTime: number;
  updateTime: number;
  physicsTime: number;
  audioTime: number;
}

/**
 * Debug information
 */
export type DebugInfo = {
  performance: PerformanceMetrics;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  graphics: {
    renderer: string;
    vendor: string;
    version: string;
    extensions: string[];
    maxTextureSize: number;
    maxViewportSize: [number, number];
  };
  audio: {
    context: boolean;
    sampleRate: number;
    outputLatency: number;
    baseLatency: number;
  };
  input: {
    keyboard: boolean;
    mouse: boolean;
    touch: boolean;
    gamepad: boolean;
    gamepads: number;
  };
  network: {
    online: boolean;
    connection: string;
    downlink: number;
    rtt: number;
  };
  platform: {
    userAgent: string;
    platform: string;
    language: string;
    cookieEnabled: boolean;
    javaEnabled: boolean;
    hardwareConcurrency: number;
    deviceMemory?: number;
  };
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Game error types
 */
export type GameErrorType =
  | 'graphics'
  | 'physics'
  | 'audio'
  | 'network'
  | 'storage'
  | 'input'
  | 'game'
  | 'system';

/**
 * Game error interface
 */
export type GameError = {
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: GameErrorType;
  context?: Record<string, unknown>;
  timestamp: number;
  stack?: string;
} & Error

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Game configuration
 */
export type GameConfig = {
  version: string;
  buildDate: string;
  environment: 'development' | 'staging' | 'production';
  debug: boolean;
  features: {
    physics: boolean;
    audio: boolean;
    analytics: boolean;
    multiplayer: boolean;
    achievements: boolean;
    saveSystem: boolean;
    screenshots: boolean;
    video: boolean;
    vr: boolean;
    ar: boolean;
  };
  limits: {
    maxFPS: number;
    maxTextures: number;
    maxMeshes: number;
    maxParticles: number;
    maxSounds: number;
    maxSaveSlots: number;
    maxPlayerName: number;
    maxChatMessage: number;
  };
  urls: {
    api: string;
    assets: string;
    cdn: string;
    websocket: string;
    analytics: string;
    crash: string;
  };
  keys: {
    analytics?: string;
    sentry?: string;
    amplitude?: string;
  };
}