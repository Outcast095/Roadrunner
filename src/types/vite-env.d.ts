/**
 * Vite environment types for Roadrunner game
 * Context7 best practices for Vite + TypeScript development
 */

// / <reference types="vite/client" />

// ============================================================================
// VITE ENVIRONMENT TYPES
// ============================================================================

/**
 * Vite import meta environment
 */
type ImportMetaEnv = {
  readonly VITE_APP_TITLE: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_APP_BUILD_DATE: string;
  readonly VITE_APP_ENVIRONMENT: 'development' | 'staging' | 'production';
  readonly VITE_APP_DEBUG: string;
  readonly VITE_APP_API_URL: string;
  readonly VITE_APP_CDN_URL: string;
  readonly VITE_APP_ANALYTICS_KEY?: string;
  readonly VITE_APP_SENTRY_DSN?: string;
  readonly VITE_APP_AMPLITUDE_KEY?: string;
  readonly VITE_APP_FEATURES_PHYSICS: string;
  readonly VITE_APP_FEATURES_AUDIO: string;
  readonly VITE_APP_FEATURES_ANALYTICS: string;
  readonly VITE_APP_FEATURES_MULTIPLAYER: string;
  readonly VITE_APP_FEATURES_ACHIEVEMENTS: string;
  readonly VITE_APP_FEATURES_SAVE_SYSTEM: string;
  readonly VITE_APP_FEATURES_SCREENSHOTS: string;
  readonly VITE_APP_FEATURES_VIDEO: string;
  readonly VITE_APP_FEATURES_VR: string;
  readonly VITE_APP_FEATURES_AR: string;
  readonly VITE_APP_LIMITS_MAX_FPS: string;
  readonly VITE_APP_LIMITS_MAX_TEXTURES: string;
  readonly VITE_APP_LIMITS_MAX_MESHES: string;
  readonly VITE_APP_LIMITS_MAX_PARTICLES: string;
  readonly VITE_APP_LIMITS_MAX_SOUNDS: string;
  readonly VITE_APP_LIMITS_MAX_SAVE_SLOTS: string;
  readonly VITE_APP_LIMITS_MAX_PLAYER_NAME: string;
  readonly VITE_APP_LIMITS_MAX_CHAT_MESSAGE: string;
}

type ImportMeta = {
  readonly env: ImportMetaEnv;
}

// ============================================================================
// ASSET IMPORT TYPES
// ============================================================================

/**
 * Static asset imports
 */
declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.avif' {
  const src: string;
  export default src;
}

/**
 * Audio asset imports
 */
declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}

declare module '*.ogg' {
  const src: string;
  export default src;
}

declare module '*.m4a' {
  const src: string;
  export default src;
}

/**
 * 3D model imports
 */
declare module '*.glb' {
  const src: string;
  export default src;
}

declare module '*.gltf' {
  const src: string;
  export default src;
}

declare module '*.obj' {
  const src: string;
  export default src;
}

declare module '*.fbx' {
  const src: string;
  export default src;
}

declare module '*.dae' {
  const src: string;
  export default src;
}

/**
 * Shader imports
 */
declare module '*.vert' {
  const src: string;
  export default src;
}

declare module '*.frag' {
  const src: string;
  export default src;
}

declare module '*.glsl' {
  const src: string;
  export default src;
}

/**
 * Data file imports
 */
declare module '*.json' {
  const value: unknown;
  export default value;
}

declare module '*.yaml' {
  const value: unknown;
  export default value;
}

declare module '*.yml' {
  const value: unknown;
  export default value;
}

declare module '*.toml' {
  const value: unknown;
  export default value;
}

/**
 * Text file imports
 */
declare module '*.txt' {
  const src: string;
  export default src;
}

declare module '*.md' {
  const src: string;
  export default src;
}

/**
 * CSS imports
 */
declare module '*.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.scss' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.sass' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.less' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.styl' {
  const classes: Record<string, string>;
  export default classes;
}

// ============================================================================
// WEB API EXTENSIONS
// ============================================================================

/**
 * Performance API extensions for games
 */
type Performance = {
  mark(name: string): void;
  measure(name: string, startMark?: string, endMark?: string): void;
  getEntriesByType(type: string): PerformanceEntry[];
  getEntriesByName(name: string): PerformanceEntry[];
  clearMarks(name?: string): void;
  clearMeasures(name?: string): void;
  now(): number;
}

type PerformanceEntry = {
  name: string;
  entryType: string;
  startTime: number;
  duration: number;
}

/**
 * WebGL extensions
 */
type WebGLRenderingContext = {
  getExtension(name: string): any;
  getSupportedExtensions(): string[] | null;
}

type WebGL2RenderingContext = {
  getExtension(name: string): any;
} & WebGLRenderingContext

/**
 * Web Audio API extensions
 */
type AudioContext = {
  createGain(): GainNode;
  createOscillator(): OscillatorNode;
  createBufferSource(): AudioBufferSourceNode;
  createAnalyser(): AnalyserNode;
  createBiquadFilter(): BiquadFilterNode;
  createConvolver(): ConvolverNode;
  createDelay(maxDelayTime?: number): DelayNode;
  createDynamicsCompressor(): DynamicsCompressorNode;
  createPanner(): PannerNode;
  createStereoPanner(): StereoPannerNode;
  createWaveShaper(): WaveShaperNode;
  createScriptProcessor(bufferSize?: number, numberOfInputChannels?: number, numberOfOutputChannels?: number): ScriptProcessorNode;
  createChannelSplitter(numberOfOutputs?: number): ChannelSplitterNode;
  createChannelMerger(numberOfInputs?: number): ChannelMergerNode;
  createConstantSource(): ConstantSourceNode;
  createMediaElementSource(mediaElement: HTMLMediaElement): MediaElementAudioSourceNode;
  createMediaStreamSource(mediaStream: MediaStream): MediaStreamAudioSourceNode;
  createMediaStreamDestination(): MediaStreamAudioDestinationNode;
}

/**
 * Gamepad API extensions
 */
type Navigator = {
  getGamepads(): (Gamepad | null)[];
}

type Gamepad = {
  id: string;
  index: number;
  connected: boolean;
  mapping: string;
  axes: number[];
  buttons: GamepadButton[];
  vibrationActuator?: GamepadHapticActuator;
  hapticActuators?: GamepadHapticActuator[];
}

type GamepadButton = {
  pressed: boolean;
  touched: boolean;
  value: number;
}

type GamepadHapticActuator = {
  type: 'dual-rumble';
  playEffect(type: 'dual-rumble', params: { duration: number; strongMagnitude: number; weakMagnitude: number }): Promise<void>;
  reset(): Promise<void>;
}

/**
 * WebXR API extensions
 */
type Navigator = {
  xr?: XRSystem;
}

type XRSystem = {
  isSessionSupported(mode: XRSessionMode): Promise<boolean>;
  requestSession(mode: XRSessionMode, options?: XRSessionInit): Promise<XRSession>;
}

type XRSessionMode = 'inline' | 'immersive-vr' | 'immersive-ar';

type XRSessionInit = {
  requiredFeatures?: string[];
  optionalFeatures?: string[];
}

type XRSession = {
  mode: XRSessionMode;
  inputSources: XRInputSource[];
  requestReferenceSpace(type: XRReferenceSpaceType): Promise<XRReferenceSpace>;
  updateRenderState(state?: XRRenderState): void;
  requestAnimationFrame(callback: XRFrameRequestCallback): number;
  cancelAnimationFrame(handle: number): void;
  end(): Promise<void>;
} & EventTarget

type XRReferenceSpaceType = 'viewer' | 'local' | 'local-floor' | 'bounded-floor' | 'unbounded';

type XRReferenceSpace = {
  getOffsetReferenceSpace(originOffset: XRRigidTransform): XRReferenceSpace;
} & EventTarget

type XRRigidTransform = {
  position: DOMPointReadOnly;
  orientation: DOMPointReadOnly;
  matrix: DOMMatrixReadOnly;
  inverse: XRRigidTransform;
}

type XRInputSource = {
  handedness: XRHandedness;
  targetRayMode: XRTargetRayMode;
  targetRaySpace: XRSpace;
  gripSpace?: XRSpace;
  gamepad?: Gamepad;
  profiles: string[];
}

type XRHandedness = 'none' | 'left' | 'right';
type XRTargetRayMode = 'gaze' | 'tracked-pointer' | 'screen';

type XRSpace = {} & EventTarget

type XRRenderState = {
  depthNear: number;
  depthFar: number;
  inlineVerticalFieldOfView?: number;
  baseLayer?: XRWebGLLayer;
}

type XRWebGLLayer = {
  antialias: boolean;
  ignoreDepthValues: boolean;
  framebuffer: WebGLFramebuffer | null;
  framebufferWidth: number;
  framebufferHeight: number;
  getViewport(view: XRView): XRViewport | null;
}

type XRView = {
  eye: XREye;
  projectionMatrix: Float32Array;
  transform: XRRigidTransform;
}

type XREye = 'none' | 'left' | 'right';

type XRViewport = {
  x: number;
  y: number;
  width: number;
  height: number;
}

type XRFrameRequestCallback = (time: DOMHighResTimeStamp, frame: XRFrame) => void;

type XRFrame = {
  session: XRSession;
  predictedDisplayTime: DOMHighResTimeStamp;
  getPose(space: XRSpace, baseSpace: XRSpace): XRPose | null;
  getViewerPose(referenceSpace: XRReferenceSpace): XRViewerPose | null;
}

type XRPose = {
  transform: XRRigidTransform;
  linearVelocity?: DOMPointReadOnly;
  angularVelocity?: DOMPointReadOnly;
}

type XRViewerPose = {
  views: XRView[];
} & XRPose

// ============================================================================
// GLOBAL DECLARATIONS
// ============================================================================

/**
 * Global game configuration
 */
declare global {
  interface Window {
    gameConfig?: import('./game').GameConfig;
    gameDebug?: boolean;
    gameVersion?: string;
    gameBuildDate?: string;
  }
}

export {};