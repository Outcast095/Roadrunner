// Main types export file for Roadrunner game
// Enhanced with Context7 best practices for TypeScript organization

// Core game types
export * from './game';

// React and UI types
export * from './react-extensions';

// Vite environment types (global declarations)
// Note: vite-env.d.ts contains global declarations and doesn't need export

// Re-export commonly used utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type ValuesOf<T> = T[keyof T];

export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

export type NonEmptyArray<T> = [T, ...T[]];

export type Exact<T, U> = T extends U ? (U extends T ? T : never) : never;

export type PromiseType<T> = T extends Promise<infer U> ? U : never;

export type FunctionArgs<T> = T extends (...args: infer U) => any ? U : never;

export type FunctionReturn<T> = T extends (...args: any[]) => infer U ? U : never;

// Event system types
export type TypedEventMap = Record<string, any>

export type TypedEventTarget<TEventMap extends TypedEventMap> = {
  addEventListener<K extends keyof TEventMap>(
    type: K,
    listener: (event: TEventMap[K]) => void,
    options?: boolean | AddEventListenerOptions
  ): void;

  removeEventListener<K extends keyof TEventMap>(
    type: K,
    listener: (event: TEventMap[K]) => void,
    options?: boolean | EventListenerOptions
  ): void;

  dispatchEvent<K extends keyof TEventMap>(
    event: TEventMap[K] & { type: K }
  ): boolean;
}

// Async utilities
export type AsyncReturnType<T extends (...args: any) => Promise<any>> =
  T extends (...args: any) => Promise<infer R> ? R : any;

export type AsyncState<T> = {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

export type AsyncAction<T> = {
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
  cancel: () => void;
}

// State management utilities
export type StateSelector<TState, TResult> = (state: TState) => TResult;

export type StateUpdater<TState> = (state: TState) => TState | void;

export type StateAction<TState, TPayload = void> =
  TPayload extends void
    ? () => StateUpdater<TState>
    : (payload: TPayload) => StateUpdater<TState>;

// Performance monitoring types
export type PerformanceEntry = {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

export type GamePerformanceMetrics = {
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

// Configuration types
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

// Validation types
export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
}

export type ValidationError = {
  field: string;
  message: string;
  code: string;
}

export type Validator<T> = (value: T) => ValidationResult;

// Serialization types
export type Serializable = {
  serialize(): string;
  deserialize(data: string): void;
}

export type SerializationOptions = {
  includeUndefined?: boolean;
  includeFunctions?: boolean;
  includeSymbols?: boolean;
  dateFormat?: 'iso' | 'timestamp' | 'locale';
  numberPrecision?: number;
  stringifyCircular?: boolean;
  compression?: boolean;
  encryption?: boolean;
}

// Internationalization types
export type LocalizedString = Record<string, string>

export type I18nConfig = {
  defaultLocale: string;
  fallbackLocale: string;
  supportedLocales: string[];
  loadPath: string;
  interpolation: {
    prefix: string;
    suffix: string;
    escapeValue: boolean;
  };
  pluralization: boolean;
  contextSeparator: string;
  namespaceSeparator: string;
}

// Testing types
export type TestResult = {
  name: string;
  passed: boolean;
  error?: Error;
  duration: number;
  assertions: number;
}

export type TestSuite = {
  name: string;
  tests: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
  coverage?: {
    lines: number;
    functions: number;
    branches: number;
    statements: number;
  };
}

// Debugging types
export type DebugInfo = {
  performance: GamePerformanceMetrics;
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

// Error handling types
export type GameError = {
  code: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'graphics' | 'physics' | 'audio' | 'network' | 'storage' | 'input' | 'game' | 'system';
  context?: Record<string, any>;
  timestamp: number;
  stack?: string;
} & Error

export type ErrorHandler = {
  handle(error: GameError): void;
  canHandle(error: Error): boolean;
  priority: number;
}

// Plugin system types
export type GamePlugin = {
  name: string;
  version: string;
  dependencies?: string[];
  activate(): Promise<void>;
  deactivate(): Promise<void>;
  isActive(): boolean;
}

export type PluginManager = {
  register(plugin: GamePlugin): void;
  unregister(name: string): void;
  activate(name: string): Promise<void>;
  deactivate(name: string): Promise<void>;
  getPlugin(name: string): GamePlugin | undefined;
  listPlugins(): GamePlugin[];
}

// Asset management types
export type Asset = {
  id: string;
  type: 'texture' | 'model' | 'sound' | 'data' | 'script' | 'shader';
  url: string;
  size: number;
  format: string;
  metadata?: Record<string, any>;
  dependencies?: string[];
  preload?: boolean;
  cacheable?: boolean;
  version?: string;
}

export type AssetManifest = {
  version: string;
  baseUrl: string;
  assets: Asset[];
  bundles?: AssetBundle[];
}

export type AssetBundle = {
  id: string;
  name: string;
  assets: string[];
  priority: number;
  preload?: boolean;
}

export type AssetLoadProgress = {
  loaded: number;
  total: number;
  percentage: number;
  currentAsset?: string;
  speed?: number;
  timeRemaining?: number;
}

// Memory management
export type MemoryPool<T> = {
  acquire(): T;
  release(item: T): void;
  clear(): void;
  size(): number;
  available(): number;
}

export type ObjectPool<T> = {
  create(): T;
  reset(item: T): void;
  destroy(item: T): void;
} & MemoryPool<T>

// Generic utility types for type safety
export type Brand<T, B> = T & { __brand: B };

export type Opaque<T, K> = T & { __opaque__: K };

export type Nominal<T, K> = T & { __nominal: never } & { [Symbol.species]: K };

// Math utility types
export type Vector2 = { x: number; y: number };
export type Vector3 = { x: number; y: number; z: number };
export type Vector4 = { x: number; y: number; z: number; w: number };

export type Matrix3 = [
  number, number, number,
  number, number, number,
  number, number, number
];

export type Matrix4 = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number
];

export type Quaternion = { x: number; y: number; z: number; w: number };

export type Color = { r: number; g: number; b: number; a?: number };

export type Rectangle = { x: number; y: number; width: number; height: number };

export type Circle = { x: number; y: number; radius: number };

export type Ray = { origin: Vector3; direction: Vector3 };

export type Plane = { normal: Vector3; distance: number };

export type BoundingBox = { min: Vector3; max: Vector3 };

export type BoundingSphere = { center: Vector3; radius: number };

// Time and scheduling types
export type Timestamp = Brand<number, 'Timestamp'>;

export type Duration = Brand<number, 'Duration'>;

export type TimeSpan = {
  start: Timestamp;
  end: Timestamp;
  duration: Duration;
}

export type ScheduledTask = {
  id: string;
  action: () => void | Promise<void>;
  delay: Duration;
  interval?: Duration;
  repeat?: number;
  priority?: number;
  cancelable?: boolean;
}

// Resource management
export type Resource = {
  id: string;
  type: string;
  data: any;
  size: number;
  refCount: number;
  lastAccessed: Timestamp;
  persistent: boolean;
}

export type ResourceManager = {
  load<T>(id: string): Promise<T>;
  unload(id: string): void;
  get<T>(id: string): T | undefined;
  exists(id: string): boolean;
  clear(): void;
  gc(): void;
  stats(): {
    total: number;
    loaded: number;
    memory: number;
  };
}

// Final export to ensure proper module structure
export type {};
